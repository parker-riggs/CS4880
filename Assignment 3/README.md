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