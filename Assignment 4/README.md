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

## Part 1 scope

In this version, the **Simulation/Evaluation** phase uses an LLM value estimate rather than random rollouts.

- For a non-terminal leaf state, the evaluator returns a value in `[0, 1]` representing win probability for the side to move.
- The value is converted to root-player perspective and backpropagated through the tree.
- Terminal states are scored exactly (`1.0` win, `0.0` loss, `0.5` draw).

No experiment harness, charting, or analysis write-up is included here (those are outside Part 1).

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

### 1) Offline mode (no API required)

```powershell
python llm_guided_mcts.py --player X --provider heuristic --iterations 200
```

### 2) Gemini Flash mode

```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
python llm_guided_mcts.py --player X --provider gemini --model gemini-2.0-flash --max-tokens 8192 --iterations 200
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

### 3) Ollama mode

```powershell
python llm_guided_mcts.py --player X --provider ollama --model llama3.1 --base-url http://localhost:11434/api/generate --iterations 200
```

## Input format

- `--board` is a 9-character row-major board string.
- Use `X`, `O`, and one of `.`, `_`, `-`, or space for empty cells.

Example board:

- `--board "XO...O..."`

## Output

The script prints:

- Input board (pretty 3×3 text)
- Player to move
- Chosen move (`row,col`)
- Search stats (iterations, chosen move value, chosen move visits, elapsed time)
