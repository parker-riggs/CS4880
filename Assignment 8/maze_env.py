"""
maze_env.py – Custom 5×5 GridMaze environment shared by all RL agents.

Grid layout (row × col):
  S . . # .
  . # . . .
  . . # . .
  # . . # .
  . . . . G

Legend:
  S = start  (0, 0)
  G = goal   (4, 4)
  # = wall   (impassable)
  . = open cell

Actions: 0=up  1=down  2=left  3=right
Rewards: +1.0 on reaching goal
         -0.01 per step (step penalty encourages shorter paths)
         no extra penalty for hitting walls (agent stays in place)

The environment has 25 discrete states (5×5) and 4 discrete actions,
making it a clean testbed for tabular and function-approximation RL.
"""

import numpy as np


class MazeEnv:
    # 1 = wall, 0 = open cell
    GRID = [
        [0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0],
    ]

    ROWS = 5
    COLS = 5
    START = (0, 0)
    GOAL = (4, 4)

    # (Δrow, Δcol) for each action index
    _MOVES = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    ACTION_NAMES = ["up", "down", "left", "right"]

    def __init__(self, max_steps: int = 200):
        self.n_states = self.ROWS * self.COLS   # 25
        self.n_actions = 4
        self.max_steps = max_steps
        self._pos: tuple = self.START
        self._step_count: int = 0

    # ------------------------------------------------------------------
    # Core gym-style interface
    # ------------------------------------------------------------------

    def reset(self) -> int:
        """Reset to start; return initial state index."""
        self._pos = self.START
        self._step_count = 0
        return self._to_index(self._pos)

    def step(self, action: int):
        """
        Apply action, return (next_state, reward, done, info).

        If the action would move into a wall or out-of-bounds the agent
        stays in its current cell (reward still accumulates step penalty).
        """
        dr, dc = self._MOVES[action]
        r, c = self._pos
        nr, nc = r + dr, c + dc

        if 0 <= nr < self.ROWS and 0 <= nc < self.COLS and self.GRID[nr][nc] == 0:
            self._pos = (nr, nc)

        self._step_count += 1
        next_state = self._to_index(self._pos)

        if self._pos == self.GOAL:
            return next_state, 1.0, True, {}
        if self._step_count >= self.max_steps:
            return next_state, -0.01, True, {}

        return next_state, -0.01, False, {}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _to_index(self, pos: tuple) -> int:
        r, c = pos
        return r * self.COLS + c

    def render(self) -> None:
        """Print an ASCII representation of the current board state."""
        print(f"\n-- Step {self._step_count} --")
        for r in range(self.ROWS):
            row_str = ""
            for c in range(self.COLS):
                if (r, c) == self._pos:
                    row_str += "A "
                elif (r, c) == self.GOAL:
                    row_str += "G "
                elif self.GRID[r][c] == 1:
                    row_str += "# "
                elif (r, c) == self.START:
                    row_str += "S "
                else:
                    row_str += ". "
            print(row_str)

    @property
    def observation_space_size(self) -> int:
        return self.n_states

    @property
    def action_space_size(self) -> int:
        return self.n_actions