# Assignment 4 — LLM-Guided MCTS for Tic-Tac-Toe

This repository contains the Assignment 4 implementation of:

- **Baseline MCTS** using random rollouts
- **LLM-guided MCTS** using value estimates from Gemini/Ollama (with heuristic/offline fallback)

The main experiment entry point is `llm_guided_mcts.py`, which defaults to **compare mode**.

## Repository Contents

- `llm_guided_mcts.py`
  - Board engine (`Board`)
  - MCTS core (`MCTSNode`, `BaseMCTS`, `RandomRolloutMCTS`, `LLMGuidedMCTS`)
  - Evaluators (`HeuristicFallbackEvaluator`, `GeminiEvaluator`, `OllamaEvaluator`)
  - Exact minimax utilities for benchmarking
  - Experiment harness for side-by-side comparisons
- `run.ps1`
  - Convenience wrapper for **single-move mode**
- `test_all.ps1`
  - Smoke tests over several boards (heuristic by default; optional Gemini/Ollama)

## Requirements

- Python 3.9+
- For Gemini mode: `GEMINI_API_KEY` environment variable
- For Ollama mode: running Ollama server (default endpoint `http://localhost:11434/api/generate`)

## Quick Start

From the `Assignment 4/` folder:

```powershell
./run.ps1
```

This runs **single-move mode** with:

- provider: `heuristic`
- board: empty (`.........`)
- player: `X`

### Provider-specific quick runs

```powershell
# Gemini (API key required only for Gemini provider)
$env:GEMINI_API_KEY="YOUR_KEY"
./run.ps1 -Provider gemini

# Ollama
./run.ps1 -Provider ollama -Model llama3.1
```

### Smoke tests

```powershell
./test_all.ps1
./test_all.ps1 -IncludeGemini
./test_all.ps1 -IncludeOllama
```

## Running Experiments (Compare Mode)

`llm_guided_mcts.py` defaults to compare mode and reports baseline vs LLM-guided results.

```powershell
python llm_guided_mcts.py --provider heuristic --iteration-grid 10,50,100,500 --games 20
```

Optional minimax benchmark and JSON export:

```powershell
python llm_guided_mcts.py --provider heuristic --iteration-grid 10,50,100,500 --games 20 --include-minimax --output-json results.json
```

### Compare mode with Gemini / Ollama

```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
python llm_guided_mcts.py --provider gemini --model gemini-2.0-flash --iteration-grid 10,50,100,500 --games 20

python llm_guided_mcts.py --provider ollama --model llama3.1 --base-url http://localhost:11434/api/generate --iteration-grid 10,50,100,500 --games 20
```

## Single-Move Mode

Use this when you want one selected move for a specific position:

```powershell
python llm_guided_mcts.py --mode single --board "XO...O..." --player X --provider heuristic --iterations 200
```

## CLI Notes

- `--board` uses 9 characters in row-major order.
- Allowed board symbols: `X`, `O`, and empty as `.`, `_`, `-`, or space.
- `--provider` options: `heuristic`, `gemini`, `ollama`.
- `--mode` options: `compare` (default), `single`.

## What the Script Reports

### Compare mode output

- Win / Draw / Loss for both agents at each iteration count
- Average chosen move value
- Average time per iteration
- Opening move quality compared against minimax
- Optional vs-minimax summary when `--include-minimax` is enabled

### Single mode output

- Pretty-printed input board
- Player to move
- Chosen move (`row,col`)
- Search stats (`iterations`, `chosen_move_value`, `chosen_move_visits`, timing)