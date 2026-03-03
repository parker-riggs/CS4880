# Assignment 4 — Part 1: LLM-Guided MCTS Solver

**Part 1 implementation** of an LLM-guided Monte Carlo Tree Search solver for Tic-Tac-Toe.

## What was created

- `llm_guided_mcts.py`
  - Tic-Tac-Toe board/game engine (`Board`)
  - MCTS node structure (`MCTSNode`)
  - LLM-guided MCTS search (`LLMGuidedMCTS`)
  - LLM evaluator interface (`LLMEvaluator`)
  - Provider implementations:
    - `GeminiEvaluator` (Google Gemini `generateContent` API)
    - `OllamaEvaluator` (local Ollama endpoint)
    - `HeuristicFallbackEvaluator` (offline fallback)
  - Evaluation cache for repeated board states during search
  - CLI for selecting a move from a given board state

## Scope

This implementation now includes both:

- **Baseline MCTS** with standard random rollouts in Simulation.
- **LLM-guided MCTS** where Simulation/Evaluation uses an LLM (or heuristic fallback) value estimate.

- It supports controlled comparison over fixed iteration counts (for example `10,50,100,500`), tracks win/draw/loss, per-move chosen value estimate, and time-per-iteration.
- Optional minimax benchmarking is included.

The script defaults to **comparison mode** for assignment experiments.

## How to run

From `Assignment 4/`:

### Quick Run
Must run:
```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
```
To set your API key!!

```powershell
./run.ps1
./run.ps1 -Provider gemini
./run.ps1 -Provider ollama -Model llama3.1
```

For full smoke tests:

```powershell
./test_all.ps1
./test_all.ps1 -IncludeGemini
./test_all.ps1 -IncludeOllama
```

### 1) Compare mode (default, assignment experiments)

```powershell
python llm_guided_mcts.py --provider heuristic --iteration-grid 10,50,100,500 --games 20
```

Optional:

```powershell
python llm_guided_mcts.py --provider heuristic --iteration-grid 10,50,100,500 --games 20 --include-minimax --output-json results.json
```

### 2) Single move mode (one board position, one chosen move)

```powershell
python llm_guided_mcts.py --mode single --player X --provider heuristic --iterations 200
```

### 3) Gemini Flash mode

```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
python llm_guided_mcts.py --mode single --player X --provider gemini --model gemini-2.0-flash --max-tokens 8192 --iterations 200
```

Optional Gemini args:

- `--base-url https://generativelanguage.googleapis.com`
- `--temperature 0`
- `--max-tokens 8192`
- `--timeout 20`

You can also use wrappers with custom args, for example:

```powershell
./run.ps1 -Provider gemini -Player O -Iterations 300 -Board "XO...O..."
```

### 4) Ollama mode

```powershell
python llm_guided_mcts.py --mode single --player X --provider ollama --model llama3.1 --base-url http://localhost:11434/api/generate --iterations 200
```

## Input format

- `--board` is a 9-character row-major board string.
- Use `X`, `O`, and one of `.`, `_`, `-`, or space for empty cells.

Example board:

- `--board "XO...O..."`

## Output

In compare mode, the script prints:

- Per-iteration comparison rows for baseline vs LLM-guided MCTS
- Win/draw/loss summary
- Average chosen move value and average time-per-iteration
- Opening move quality versus minimax value

In single mode, the script prints:

- Input board (pretty 3×3 text)
- Player to move
- Chosen move (`row,col`)
- Search stats (iterations, chosen move value, chosen move visits, elapsed time)
