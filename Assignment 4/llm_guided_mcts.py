from __future__ import annotations

import argparse
import json
import math
import os
import random
import time
import urllib.error
import urllib.request
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence, Tuple


Player = str
Move = Tuple[int, int]


def other_player(player: Player) -> Player:
    return "O" if player == "X" else "X"


@dataclass(frozen=True)
class Board:
    cells: Tuple[str, ...]

    @staticmethod
    def empty() -> "Board":
        return Board(tuple(" " for _ in range(9)))

    @staticmethod
    def from_text(text: str) -> "Board":
        cleaned = [char for char in text if char in {"X", "O", "_", "-", ".", " "}]
        if len(cleaned) != 9:
            raise ValueError(
                "Board text must contain exactly 9 symbols from {X, O, _, -, ., space}."
            )
        normalized = tuple(" " if char in {"_", "-", "."} else char for char in cleaned)
        return Board(normalized)

    def to_key(self) -> str:
        return "".join(self.cells)

    def to_pretty(self) -> str:
        out: List[str] = []
        for row in range(3):
            segment = []
            for col in range(3):
                value = self.cells[row * 3 + col]
                segment.append(value if value != " " else ".")
            out.append(" ".join(segment))
        return "\n".join(out)

    def legal_moves(self) -> List[Move]:
        moves: List[Move] = []
        for index, value in enumerate(self.cells):
            if value == " ":
                moves.append((index // 3, index % 3))
        return moves

    def apply_move(self, move: Move, player: Player) -> "Board":
        row, col = move
        if not (0 <= row < 3 and 0 <= col < 3):
            raise ValueError(f"Invalid move {move}; expected row/col in [0,2].")
        index = row * 3 + col
        if self.cells[index] != " ":
            raise ValueError(f"Cell {move} is already occupied.")
        mutable = list(self.cells)
        mutable[index] = player
        return Board(tuple(mutable))

    def winner(self) -> Optional[Player]:
        lines = [
            (0, 1, 2),
            (3, 4, 5),
            (6, 7, 8),
            (0, 3, 6),
            (1, 4, 7),
            (2, 5, 8),
            (0, 4, 8),
            (2, 4, 6),
        ]
        for a, b, c in lines:
            if self.cells[a] != " " and self.cells[a] == self.cells[b] == self.cells[c]:
                return self.cells[a]
        return None

    def is_full(self) -> bool:
        return all(value != " " for value in self.cells)

    def is_terminal(self) -> bool:
        return self.winner() is not None or self.is_full()


class LLMEvaluator:
    def evaluate(self, board: Board, player_to_move: Player) -> float:
        raise NotImplementedError


class HeuristicFallbackEvaluator(LLMEvaluator):
    def evaluate(self, board: Board, player_to_move: Player) -> float:
        winner = board.winner()
        if winner == player_to_move:
            return 1.0
        if winner == other_player(player_to_move):
            return 0.0
        if board.is_full():
            return 0.5

        center_idx = 4
        center_bonus = 0.0
        if board.cells[center_idx] == player_to_move:
            center_bonus += 0.08
        elif board.cells[center_idx] == other_player(player_to_move):
            center_bonus -= 0.08

        corners = [0, 2, 6, 8]
        corner_score = sum(1 for idx in corners if board.cells[idx] == player_to_move) - sum(
            1 for idx in corners if board.cells[idx] == other_player(player_to_move)
        )

        score = 0.5 + center_bonus + (0.03 * corner_score)
        return max(0.0, min(1.0, score))


class GeminiEvaluator(LLMEvaluator):
    def __init__(
        self,
        model: str,
        api_key: str,
        base_url: str = "https://generativelanguage.googleapis.com",
        temperature: float = 0.0,
        timeout_sec: float = 20.0,
        max_tokens: int = 8192,
    ) -> None:
        self.model = model
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.temperature = temperature
        self.timeout_sec = timeout_sec
        self.max_tokens = max_tokens
        self.fallback = HeuristicFallbackEvaluator()

    def _prompt(self, board: Board, player_to_move: Player) -> str:
        return (
            "Evaluate this Tic-Tac-Toe position.\n"
            "Board uses X, O, and . for empty.\n"
            f"Current player to move: {player_to_move}\n"
            "Return ONLY a JSON object like {\"value\": 0.73} where value is the"
            " estimated win probability for the current player under strong play.\n\n"
            f"{board.to_pretty()}\n"
        )

    def _extract_value(self, text: str) -> Optional[float]:
        candidate = text.strip()
        if "{" in candidate and "}" in candidate:
            start = candidate.find("{")
            end = candidate.rfind("}")
            if 0 <= start <= end:
                candidate = candidate[start : end + 1]
        try:
            parsed = json.loads(candidate)
            value = float(parsed["value"])
            return max(0.0, min(1.0, value))
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            return None

    def evaluate(self, board: Board, player_to_move: Player) -> float:
        winner = board.winner()
        if winner == player_to_move:
            return 1.0
        if winner == other_player(player_to_move):
            return 0.0
        if board.is_full():
            return 0.5

        payload = {
            "contents": [{"parts": [{"text": self._prompt(board, player_to_move)}]}],
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": self.max_tokens,
                "responseMimeType": "application/json",
            },
        }
        data = json.dumps(payload).encode("utf-8")
        url = f"{self.base_url}/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        request = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=self.timeout_sec) as response:
                body = response.read().decode("utf-8")
            parsed = json.loads(body)
            content = parsed["candidates"][0]["content"]["parts"][0]["text"].strip()
            value = self._extract_value(content)
            if value is not None:
                return value
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, KeyError, IndexError, json.JSONDecodeError):
            pass

        return self.fallback.evaluate(board, player_to_move)


class OllamaEvaluator(LLMEvaluator):
    def __init__(
        self,
        model: str,
        endpoint: str = "http://localhost:11434/api/generate",
        timeout_sec: float = 20.0,
    ) -> None:
        self.model = model
        self.endpoint = endpoint
        self.timeout_sec = timeout_sec
        self.fallback = HeuristicFallbackEvaluator()

    def _prompt(self, board: Board, player_to_move: Player) -> str:
        return (
            "You are evaluating Tic-Tac-Toe.\n"
            "Given this board and side to move, return only JSON: {\"value\": number}\n"
            "where number is win probability for current player from 0 to 1 under strong play.\n"
            f"Player to move: {player_to_move}\n"
            f"Board:\n{board.to_pretty()}\n"
        )

    def evaluate(self, board: Board, player_to_move: Player) -> float:
        winner = board.winner()
        if winner == player_to_move:
            return 1.0
        if winner == other_player(player_to_move):
            return 0.0
        if board.is_full():
            return 0.5

        payload = {
            "model": self.model,
            "prompt": self._prompt(board, player_to_move),
            "stream": False,
            "format": "json",
            "options": {"temperature": 0},
        }
        data = json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(
            self.endpoint,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_sec) as response:
                body = response.read().decode("utf-8")
            parsed = json.loads(body)
            response_text = parsed.get("response", "")
            nested = json.loads(response_text)
            value = float(nested["value"])
            return max(0.0, min(1.0, value))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError, KeyError, ValueError, TypeError):
            return self.fallback.evaluate(board, player_to_move)


@dataclass
class MCTSNode:
    board: Board
    player_to_move: Player
    parent: Optional["MCTSNode"] = None
    move_from_parent: Optional[Move] = None
    children: List["MCTSNode"] = field(default_factory=list)
    untried_moves: List[Move] = field(default_factory=list)
    visits: int = 0
    value_sum: float = 0.0

    def __post_init__(self) -> None:
        if not self.untried_moves:
            self.untried_moves = self.board.legal_moves()

    def average_value(self) -> float:
        if self.visits == 0:
            return 0.0
        return self.value_sum / self.visits

    def is_terminal(self) -> bool:
        return self.board.is_terminal()

    def is_fully_expanded(self) -> bool:
        return len(self.untried_moves) == 0


class MCTSAgent:
    def choose_move(self, board: Board, player_to_move: Player) -> Tuple[Move, Dict[str, float]]:
        raise NotImplementedError


class BaseMCTS(MCTSAgent):
    def __init__(
        self,
        iterations: int = 200,
        exploration_c: float = math.sqrt(2.0),
        seed: Optional[int] = None,
    ) -> None:
        if iterations <= 0:
            raise ValueError("iterations must be > 0")
        self.iterations = iterations
        self.exploration_c = exploration_c
        self.rng = random.Random(seed)

    def _ucb_score(self, parent_visits: int, child: MCTSNode) -> float:
        if child.visits == 0:
            return float("inf")
        exploitation = child.average_value()
        exploration = self.exploration_c * math.sqrt(math.log(parent_visits) / child.visits)
        return exploitation + exploration

    def _select(self, node: MCTSNode) -> MCTSNode:
        current = node
        while not current.is_terminal() and current.is_fully_expanded() and current.children:
            parent_visits = max(current.visits, 1)
            current = max(current.children, key=lambda child: self._ucb_score(parent_visits, child))
        return current

    def _expand(self, node: MCTSNode) -> MCTSNode:
        if node.is_terminal() or not node.untried_moves:
            return node
        move = self.rng.choice(node.untried_moves)
        node.untried_moves.remove(move)
        next_board = node.board.apply_move(move, node.player_to_move)
        child = MCTSNode(
            board=next_board,
            player_to_move=other_player(node.player_to_move),
            parent=node,
            move_from_parent=move,
        )
        node.children.append(child)
        return child

    def _evaluate_leaf(self, node: MCTSNode, root_player: Player) -> float:
        raise NotImplementedError

    def _backpropagate(self, node: MCTSNode, value_for_root: float) -> None:
        current = node
        while current is not None:
            current.visits += 1
            current.value_sum += value_for_root
            current = current.parent

    def choose_move(self, board: Board, player_to_move: Player) -> Tuple[Move, Dict[str, float]]:
        root = MCTSNode(board=board, player_to_move=player_to_move)

        if root.is_terminal():
            raise ValueError("Cannot choose a move from a terminal board.")

        start = time.perf_counter()
        for _ in range(self.iterations):
            selected = self._select(root)
            expanded = self._expand(selected)
            value = self._evaluate_leaf(expanded, root_player=player_to_move)
            self._backpropagate(expanded, value)
        elapsed = time.perf_counter() - start

        if not root.children:
            legal = board.legal_moves()
            move = self.rng.choice(legal)
            return move, {
                "iterations": float(self.iterations),
                "chosen_move_value": 0.5,
                "chosen_move_visits": 0.0,
                "elapsed_sec": elapsed,
                "time_per_iteration_sec": elapsed / float(self.iterations),
            }

        best_child = max(root.children, key=lambda child: child.visits)
        move = best_child.move_from_parent
        if move is None:
            raise RuntimeError("Internal error: selected child without move.")

        stats = {
            "iterations": float(self.iterations),
            "chosen_move_value": best_child.average_value(),
            "chosen_move_visits": float(best_child.visits),
            "elapsed_sec": elapsed,
            "time_per_iteration_sec": elapsed / float(self.iterations),
        }
        return move, stats


class RandomRolloutMCTS(BaseMCTS):
    def _evaluate_leaf(self, node: MCTSNode, root_player: Player) -> float:
        winner = node.board.winner()
        if winner == root_player:
            return 1.0
        if winner == other_player(root_player):
            return 0.0
        if node.board.is_full():
            return 0.5

        board = node.board
        player = node.player_to_move
        while True:
            winner = board.winner()
            if winner is not None:
                return 1.0 if winner == root_player else 0.0
            if board.is_full():
                return 0.5
            move = self.rng.choice(board.legal_moves())
            board = board.apply_move(move, player)
            player = other_player(player)


class LLMGuidedMCTS(BaseMCTS):
    def __init__(
        self,
        evaluator: LLMEvaluator,
        iterations: int = 200,
        exploration_c: float = math.sqrt(2.0),
        seed: Optional[int] = None,
    ) -> None:
        super().__init__(iterations=iterations, exploration_c=exploration_c, seed=seed)
        self.evaluator = evaluator
        self.eval_cache: Dict[Tuple[str, Player], float] = {}

    def _evaluate_leaf(self, node: MCTSNode, root_player: Player) -> float:
        winner = node.board.winner()
        if winner == root_player:
            return 1.0
        if winner == other_player(root_player):
            return 0.0
        if node.board.is_full():
            return 0.5

        cache_key = (node.board.to_key(), root_player)
        if cache_key in self.eval_cache:
            return self.eval_cache[cache_key]

        player_to_move = node.player_to_move
        p_current = self.evaluator.evaluate(node.board, player_to_move)

        if player_to_move == root_player:
            root_value = p_current
        else:
            root_value = 1.0 - p_current

        self.eval_cache[cache_key] = root_value
        return root_value


def minimax_value(board: Board, player_to_move: Player, cache: Dict[Tuple[str, Player], float]) -> float:
    key = (board.to_key(), player_to_move)
    if key in cache:
        return cache[key]

    winner = board.winner()
    if winner == player_to_move:
        cache[key] = 1.0
        return 1.0
    opponent = other_player(player_to_move)
    if winner == opponent:
        cache[key] = 0.0
        return 0.0
    if board.is_full():
        cache[key] = 0.5
        return 0.5

    best = 0.0
    for move in board.legal_moves():
        next_board = board.apply_move(move, player_to_move)
        opponent_value = minimax_value(next_board, opponent, cache)
        player_value = 1.0 - opponent_value
        if player_value > best:
            best = player_value
            if best == 1.0:
                break

    cache[key] = best
    return best


def minimax_best_move(board: Board, player_to_move: Player) -> Move:
    cache: Dict[Tuple[str, Player], float] = {}
    candidates: List[Tuple[float, Move]] = []
    for move in board.legal_moves():
        next_board = board.apply_move(move, player_to_move)
        value = 1.0 - minimax_value(next_board, other_player(player_to_move), cache)
        candidates.append((value, move))
    if not candidates:
        raise ValueError("No legal moves available for minimax.")
    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def determine_player_to_move(board: Board) -> Player:
    x_count = sum(1 for cell in board.cells if cell == "X")
    o_count = sum(1 for cell in board.cells if cell == "O")
    return "X" if x_count == o_count else "O"


@dataclass
class GameResult:
    winner: Optional[Player]
    move_metrics: Dict[Player, List[Dict[str, float]]]


def play_game(
    x_agent: MCTSAgent,
    o_agent: MCTSAgent,
    start_board: Optional[Board] = None,
) -> GameResult:
    board = start_board if start_board is not None else Board.empty()
    player = determine_player_to_move(board)
    move_metrics: Dict[Player, List[Dict[str, float]]] = {"X": [], "O": []}

    while True:
        winner = board.winner()
        if winner is not None:
            return GameResult(winner=winner, move_metrics=move_metrics)
        if board.is_full():
            return GameResult(winner=None, move_metrics=move_metrics)

        if player == "X":
            move, stats = x_agent.choose_move(board, player)
        else:
            move, stats = o_agent.choose_move(board, player)

        move_metrics[player].append(stats)
        board = board.apply_move(move, player)
        player = other_player(player)


def play_against_minimax(agent: MCTSAgent, agent_player: Player) -> GameResult:
    board = Board.empty()
    player = "X"
    move_metrics: Dict[Player, List[Dict[str, float]]] = {"X": [], "O": []}

    while True:
        winner = board.winner()
        if winner is not None:
            return GameResult(winner=winner, move_metrics=move_metrics)
        if board.is_full():
            return GameResult(winner=None, move_metrics=move_metrics)

        if player == agent_player:
            move, stats = agent.choose_move(board, player)
            move_metrics[player].append(stats)
        else:
            move = minimax_best_move(board, player)
        board = board.apply_move(move, player)
        player = other_player(player)


def average_metric(stats_list: List[Dict[str, float]], key: str) -> float:
    if not stats_list:
        return 0.0
    return sum(item.get(key, 0.0) for item in stats_list) / float(len(stats_list))


def build_agent(
    kind: str,
    iterations: int,
    exploration_c: float,
    seed: int,
    evaluator: Optional[LLMEvaluator],
) -> MCTSAgent:
    if kind == "baseline":
        return RandomRolloutMCTS(iterations=iterations, exploration_c=exploration_c, seed=seed)
    if kind == "llm":
        if evaluator is None:
            raise ValueError("LLM-guided agent requires an evaluator.")
        return LLMGuidedMCTS(
            evaluator=evaluator,
            iterations=iterations,
            exploration_c=exploration_c,
            seed=seed,
        )
    raise ValueError(f"Unknown agent kind: {kind}")


def evaluate_opening_move_quality(agent: MCTSAgent) -> Dict[str, float]:
    board = Board.empty()
    move, stats = agent.choose_move(board, "X")
    next_board = board.apply_move(move, "X")
    cache: Dict[Tuple[str, Player], float] = {}
    minimax_outcome = 1.0 - minimax_value(next_board, "O", cache)
    quality = {
        "move_row": float(move[0]),
        "move_col": float(move[1]),
        "estimated_value": stats["chosen_move_value"],
        "minimax_value": minimax_outcome,
        "time_per_iteration_sec": stats["time_per_iteration_sec"],
    }
    return quality


def run_comparison_experiments(args: argparse.Namespace) -> Dict[str, object]:
    evaluator = build_evaluator(args)
    iteration_values = [int(part.strip()) for part in args.iteration_grid.split(",") if part.strip()]
    if not iteration_values:
        raise ValueError("--iteration-grid must include at least one integer.")

    summary: Dict[str, object] = {
        "config": {
            "games_per_iteration": args.games,
            "iteration_grid": iteration_values,
            "exploration_c": args.exploration_c,
            "provider": args.provider,
            "model": args.model,
            "include_minimax": bool(args.include_minimax),
        },
        "results": [],
    }

    for iterations in iteration_values:
        llm_wdl = defaultdict(int)
        baseline_wdl = defaultdict(int)
        llm_move_stats: List[Dict[str, float]] = []
        baseline_move_stats: List[Dict[str, float]] = []

        for game_index in range(args.games):
            if game_index % 2 == 0:
                x_agent = build_agent(
                    "llm",
                    iterations,
                    args.exploration_c,
                    args.seed + 13 * game_index,
                    evaluator,
                )
                o_agent = build_agent(
                    "baseline",
                    iterations,
                    args.exploration_c,
                    args.seed + 13 * game_index + 1,
                    None,
                )
                result = play_game(x_agent, o_agent)
                llm_move_stats.extend(result.move_metrics["X"])
                baseline_move_stats.extend(result.move_metrics["O"])
                if result.winner == "X":
                    llm_wdl["win"] += 1
                    baseline_wdl["loss"] += 1
                elif result.winner == "O":
                    llm_wdl["loss"] += 1
                    baseline_wdl["win"] += 1
                else:
                    llm_wdl["draw"] += 1
                    baseline_wdl["draw"] += 1
            else:
                x_agent = build_agent(
                    "baseline",
                    iterations,
                    args.exploration_c,
                    args.seed + 13 * game_index,
                    None,
                )
                o_agent = build_agent(
                    "llm",
                    iterations,
                    args.exploration_c,
                    args.seed + 13 * game_index + 1,
                    evaluator,
                )
                result = play_game(x_agent, o_agent)
                baseline_move_stats.extend(result.move_metrics["X"])
                llm_move_stats.extend(result.move_metrics["O"])
                if result.winner == "O":
                    llm_wdl["win"] += 1
                    baseline_wdl["loss"] += 1
                elif result.winner == "X":
                    llm_wdl["loss"] += 1
                    baseline_wdl["win"] += 1
                else:
                    llm_wdl["draw"] += 1
                    baseline_wdl["draw"] += 1

        llm_opening = evaluate_opening_move_quality(
            build_agent("llm", iterations, args.exploration_c, args.seed + 9001, evaluator)
        )
        baseline_opening = evaluate_opening_move_quality(
            build_agent("baseline", iterations, args.exploration_c, args.seed + 9002, None)
        )

        row: Dict[str, object] = {
            "iterations": iterations,
            "llm": {
                "win": llm_wdl["win"],
                "draw": llm_wdl["draw"],
                "loss": llm_wdl["loss"],
                "avg_chosen_move_value": average_metric(llm_move_stats, "chosen_move_value"),
                "avg_time_per_iteration_sec": average_metric(llm_move_stats, "time_per_iteration_sec"),
                "opening_move_quality": llm_opening,
            },
            "baseline": {
                "win": baseline_wdl["win"],
                "draw": baseline_wdl["draw"],
                "loss": baseline_wdl["loss"],
                "avg_chosen_move_value": average_metric(baseline_move_stats, "chosen_move_value"),
                "avg_time_per_iteration_sec": average_metric(baseline_move_stats, "time_per_iteration_sec"),
                "opening_move_quality": baseline_opening,
            },
        }

        if args.include_minimax:
            llm_vs_minimax = defaultdict(int)
            baseline_vs_minimax = defaultdict(int)

            llm_x = play_against_minimax(
                build_agent("llm", iterations, args.exploration_c, args.seed + 10001, evaluator),
                agent_player="X",
            )
            if llm_x.winner == "X":
                llm_vs_minimax["win"] += 1
            elif llm_x.winner == "O":
                llm_vs_minimax["loss"] += 1
            else:
                llm_vs_minimax["draw"] += 1

            llm_o = play_against_minimax(
                build_agent("llm", iterations, args.exploration_c, args.seed + 10002, evaluator),
                agent_player="O",
            )
            if llm_o.winner == "O":
                llm_vs_minimax["win"] += 1
            elif llm_o.winner == "X":
                llm_vs_minimax["loss"] += 1
            else:
                llm_vs_minimax["draw"] += 1

            base_x = play_against_minimax(
                build_agent("baseline", iterations, args.exploration_c, args.seed + 10003, None),
                agent_player="X",
            )
            if base_x.winner == "X":
                baseline_vs_minimax["win"] += 1
            elif base_x.winner == "O":
                baseline_vs_minimax["loss"] += 1
            else:
                baseline_vs_minimax["draw"] += 1

            base_o = play_against_minimax(
                build_agent("baseline", iterations, args.exploration_c, args.seed + 10004, None),
                agent_player="O",
            )
            if base_o.winner == "O":
                baseline_vs_minimax["win"] += 1
            elif base_o.winner == "X":
                baseline_vs_minimax["loss"] += 1
            else:
                baseline_vs_minimax["draw"] += 1

            row["vs_minimax"] = {
                "llm": {
                    "win": llm_vs_minimax["win"],
                    "draw": llm_vs_minimax["draw"],
                    "loss": llm_vs_minimax["loss"],
                },
                "baseline": {
                    "win": baseline_vs_minimax["win"],
                    "draw": baseline_vs_minimax["draw"],
                    "loss": baseline_vs_minimax["loss"],
                },
            }

        summary["results"].append(row)

    return summary


def print_comparison_summary(summary: Dict[str, object]) -> None:
    print("Comparison: Baseline random-rollout MCTS vs LLM-guided MCTS")
    print(json.dumps(summary["config"], indent=2))
    print()
    for row in summary["results"]:
        iterations = row["iterations"]
        llm = row["llm"]
        baseline = row["baseline"]
        print(f"Iterations: {iterations}")
        print(
            "  LLM     W/D/L:"
            f" {llm['win']}/{llm['draw']}/{llm['loss']}"
            f" | avg_value={llm['avg_chosen_move_value']:.3f}"
            f" | avg_tpi={llm['avg_time_per_iteration_sec']:.6f}s"
            f" | opening_minimax={llm['opening_move_quality']['minimax_value']:.3f}"
        )
        print(
            "  Baseline W/D/L:"
            f" {baseline['win']}/{baseline['draw']}/{baseline['loss']}"
            f" | avg_value={baseline['avg_chosen_move_value']:.3f}"
            f" | avg_tpi={baseline['avg_time_per_iteration_sec']:.6f}s"
            f" | opening_minimax={baseline['opening_move_quality']['minimax_value']:.3f}"
        )
        if "vs_minimax" in row:
            print(
                "  vs Minimax (2 games each side)"
                f" | LLM={row['vs_minimax']['llm']['win']}/{row['vs_minimax']['llm']['draw']}/{row['vs_minimax']['llm']['loss']}"
                f" | Baseline={row['vs_minimax']['baseline']['win']}/{row['vs_minimax']['baseline']['draw']}/{row['vs_minimax']['baseline']['loss']}"
            )
        print()


def parse_move(move_text: str) -> Move:
    parts = move_text.split(",")
    if len(parts) != 2:
        raise ValueError("Move must be in 'row,col' format.")
    return int(parts[0]), int(parts[1])


def build_evaluator(args: argparse.Namespace) -> LLMEvaluator:
    if args.provider == "heuristic":
        return HeuristicFallbackEvaluator()

    if args.provider == "gemini":
        api_key = args.api_key or os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("Gemini provider requires --api-key or GEMINI_API_KEY env var.")
        return GeminiEvaluator(
            model=args.model,
            api_key=api_key,
            base_url=args.base_url,
            temperature=args.temperature,
            timeout_sec=args.timeout,
            max_tokens=args.max_tokens,
        )

    if args.provider == "ollama":
        return OllamaEvaluator(model=args.model, endpoint=args.base_url, timeout_sec=args.timeout)

    raise ValueError(f"Unsupported provider: {args.provider}")


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="LLM-guided MCTS solver for Tic-Tac-Toe")
    parser.add_argument(
        "--mode",
        choices=["compare", "single"],
        default="compare",
        help="compare: run assignment experiment harness; single: choose one move from one board.",
    )
    parser.add_argument(
        "--board",
        default=".........",
        help="9-char board using X/O and . or _ for empty, row-major (default empty board).",
    )
    parser.add_argument("--player", choices=["X", "O"], default="X", help="Player to move (single mode).")
    parser.add_argument("--iterations", type=int, default=200, help="Number of MCTS iterations.")
    parser.add_argument("--exploration-c", type=float, default=math.sqrt(2.0), help="UCB exploration constant.")
    parser.add_argument("--seed", type=int, default=7, help="RNG seed.")

    parser.add_argument(
        "--iteration-grid",
        default="10,50,100,500",
        help="Comma-separated iteration counts for compare mode.",
    )
    parser.add_argument("--games", type=int, default=20, help="Games per iteration in compare mode.")
    parser.add_argument(
        "--include-minimax",
        action="store_true",
        help="Also evaluate each agent against perfect minimax (two games per setting).",
    )
    parser.add_argument(
        "--output-json",
        default="",
        help="Optional path to save full comparison results as JSON (compare mode).",
    )

    parser.add_argument(
        "--provider",
        choices=["heuristic", "gemini", "ollama"],
        default="heuristic",
        help="LLM backend; use heuristic for offline fallback.",
    )
    parser.add_argument("--model", default="gemini-2.0-flash", help="Model name for Gemini/Ollama.")
    parser.add_argument("--api-key", default="", help="API key for Gemini backend.")
    parser.add_argument(
        "--base-url",
        default="https://generativelanguage.googleapis.com",
        help="Base URL for Gemini or endpoint URL for Ollama.",
    )
    parser.add_argument("--temperature", type=float, default=0.0, help="Sampling temperature for Gemini.")
    parser.add_argument("--max-tokens", type=int, default=8192, help="Gemini max output tokens.")
    parser.add_argument("--timeout", type=float, default=20.0, help="HTTP timeout in seconds.")

    args = parser.parse_args(argv)

    if args.mode == "single":
        board = Board.from_text(args.board)
        evaluator = build_evaluator(args)
        solver = LLMGuidedMCTS(
            evaluator=evaluator,
            iterations=args.iterations,
            exploration_c=args.exploration_c,
            seed=args.seed,
        )

        move, stats = solver.choose_move(board, args.player)

        print("Input board:")
        print(board.to_pretty())
        print()
        print(f"Player to move: {args.player}")
        print(f"Chosen move: {move[0]},{move[1]}")
        print("Stats:")
        print(json.dumps(stats, indent=2))
        return 0

    summary = run_comparison_experiments(args)
    print_comparison_summary(summary)
    if args.output_json:
        with open(args.output_json, "w", encoding="utf-8") as handle:
            json.dump(summary, handle, indent=2)
        print(f"Saved JSON results to: {args.output_json}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())