# PA3 Option 2: AdaptiveRushBot

This project completes **PA3 Option 2**: dissecting and modifying built-in MicroRTS bots.

## Key idea / improvement

`AdaptiveRushBot` combines two built-in scripts and switches strategy based on game state:
- early game: `WorkerRush`
- transition to `LightRush` when one of these conditions is true:
   - game time >= 300
   - own economy/army reaches threshold (>= 6 Workers or >= 2 Light units)
   - enemy combat units are detected close to one of our Bases (distance <= 8)
   - no Base remains (all-in behavior)

This keeps the implementation simple while making behavior more adaptive than a single fixed rush script.

## File

- `AdaptiveRushBot.java`

## How to use in MicroRTS

1. Copy `AdaptiveRushBot.java` into your MicroRTS source folder:
    - `MicroRTS/src/ai/abstraction/AdaptiveRushBot.java`
2. Build MicroRTS.
3. Set your bot class in your run config / benchmark config as:
    - `ai.abstraction.AdaptiveRushBot`

## Upload results to WandB

After generating `tournament.csv` and `results.txt`, upload them with:

1. Install WandB:
    - `python -m pip install wandb`
2. Login to WandB (one-time):
    - `wandb login`
3. Run uploader from this folder:
    - `python upload_results_to_wandb.py --csv tournament.csv --raw results.txt --project CS4880-PA3 --run-name AdaptiveRushBot-fast`

The script logs:
- a results table (opponent, wins/ties/losses, win rate)
- summary metrics (overall wins/losses/win rate)
- both files as a WandB artifact for your report link