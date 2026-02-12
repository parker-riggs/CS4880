# K-Armed Bandits (Epsilon-Greedy)

This project runs k-armed bandit experiments using an epsilon-greedy agent and logs results to Weights & Biases (W&B) when available.

## How to Run

From this folder:

```bash
python .\KArmedBandits.py
```

Common options:

```bash
python .\KArmedBandits.py --steps 2000 --runs 200 --k-arms 10 --constant-alpha 0.1 --seed 1
```

W&B logging (default):

```bash
python .\KArmedBandits.py --wandb-project KArmedBandits
```

Disable W&B logging:

```bash
python .\KArmedBandits.py --no-wandb
```

## What the Runs Mean

Each W&B run corresponds to one parameter combo:
- epsilon in {0.0, 0.01, 0.1}
- initial_value in {0.0, 5.0}
- alpha_mode in {"constant", "sample"}

The code averages results over 200 independent bandit problems and logs metrics at each step (1..2000).

## What the Charts Mean

- step: the time index (not a performance metric)
- avg_reward: average reward at each step (higher is better)
- optimal_action_pct: percent of times the agent selected the true best arm (higher is better)
- cumulative_regret: total lost reward vs always selecting the optimal arm (lower slope is better)

Each colored line is one run (one parameter combo). When lines separate, that combo is behaving differently.

## Parameter Intuition

- epsilon: higher means more exploration; can reduce long-term regret but slow early gains
- initial_value: optimistic values (like 5.0) encourage early exploration
- alpha_mode:
  - sample uses alpha = 1 / N (stable, slower)
  - constant uses a fixed alpha (faster adaptation, noisier)