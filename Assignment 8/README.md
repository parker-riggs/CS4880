# Assignment 8 – RL Algorithm Zoo

**Course:** CS4880  
**Assignment:** PA7 – RL Algorithm Zoo  
**Author:** Parker Riggs

---

## Overview

This project compares **four reinforcement learning approaches** on a shared testbed environment, satisfying the PA7 requirements:

| # | Algorithm | Paradigm | File |
|---|-----------|----------|------|
| 1 | **Q-Learning** | Value-Based | `qlearning_agent.py` |
| 2 | **REINFORCE** | Policy-Based (no value function) | `reinforce_agent.py` |
| 3 | **PPO** | Hybrid (Actor-Critic) | `ppo_agent.py` |
| 4 | **AdaptiveRushBot** | Candidate MicroRTS Bot (LLM-guided) | `AdaptiveRushBot.java` |

Algorithms 1–3 are trained and compared against each other on the **5×5 GridMaze** environment (`maze_env.py`) using `rl_zoo.py`, which streams all metrics to **Weights & Biases**.

---

## Environment – 5×5 GridMaze

```
S . . # .
. # . . .
. . # . .
# . . # .
. . . . G
```

| Symbol | Meaning |
|--------|---------|
| `S` | Start — `(row=0, col=0)` |
| `G` | Goal — `(row=4, col=4)` |
| `#` | Wall — impassable |
| `.` | Open cell |
| `A` | Agent's current position (render only) |

**State space:** 25 discrete states (5 × 5 grid flattened to an index)  
**Action space:** 4 discrete actions — `0=up`, `1=down`, `2=left`, `3=right`  
**Rewards:**
- `+1.0` on reaching the goal
- `-0.01` per step (encourages finding shorter paths)
- Wall collisions leave the agent in place; step penalty still applies

**Episode terminates** when the agent reaches the goal or hits 200 steps.

---

## Algorithms

### 1. Q-Learning (Value-Based) — `q_learning_agent.py`

A tabular off-policy TD(0) algorithm. The action-value function is stored in a 25×4 NumPy table.

### 2. REINFORCE (Policy-Based) — `reinforce_agent.py`

A pure Monte-Carlo policy gradient algorithm — **no value function or critic**. The policy is a two-layer MLP that takes a one-hot encoded state and outputs a softmax action distribution.
---

### 3. PPO (Hybrid / Actor-Critic) — `ppo_agent.py`

Proximal Policy Optimization maintains a **shared-backbone Actor-Critic** network with separate policy and value heads. It uses **Generalised Advantage Estimation (GAE)** to compute low-variance advantage targets and the **clipped surrogate objective** to prevent destructively large policy updates.

After each episode the network is updated for `n_epochs=4` gradient steps on the collected trajectory, re-using experience more efficiently than REINFORCE.

### 4. AdaptiveRushBot (Candidate MicroRTS Algorithm) — `AdaptiveRushBot.java`

This is the MicroRTS bot submitted for the class tournament. It is a **LLM-guided hybrid agent** that selects between two built-in MicroRTS scripted policies at runtime:

- **WorkerRush** — favoured for early-game economy and pressure
- **LightRush** — favoured once sufficient workers exist or enemy pressure intensifies

Strategy selection is delegated to a local **Ollama** LLM (default `llama3.1:8b`) via a compact HTTP call every 25 game ticks. If the LLM times out (`800 ms` deadline), is unreachable, or returns an unrecognised token, the bot falls back to a deterministic heuristic policy based on:
- Game time
- Own worker count
- Own light unit count
- Enemy combat unit proximity to own base

This makes the bot always functional regardless of LLM availability, which is critical in a live tournament setting.

**LLM prompt format:** asks for exactly one token — `WORKER_RUSH` or `LIGHT_RUSH` — given a compact feature summary of the current game state.

**Package:** `ai.abstraction.submissions.parker_riggs`

---

## File Structure

```
Assignment 8/
├── maze_env.py          # 5×5 GridMaze environment (shared by all Python agents)
├── qlearning_agent.py   # Algorithm 1: Q-Learning (value-based, tabular)
├── reinforce_agent.py   # Algorithm 2: REINFORCE (policy-based, MLP)
├── ppo_agent.py         # Algorithm 3: PPO (hybrid actor-critic, MLP)
├── rl_zoo.py            # Main comparison runner + WandB logging
├── AdaptiveRushBot.java # Algorithm 4: LLM-guided MicroRTS bot (candidate)
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

---

## Setup (Fresh System)

### 1. Prerequisites

- **Python 3.10 or newer** — download from [python.org](https://www.python.org/downloads/)  
  Verify: `python --version`
- **Git** — to clone the repo (download from [git-scm.com](https://git-scm.com))  
  Verify: `git --version`
- **A WandB account** — free at [wandb.ai](https://wandb.ai) (or use `--offline` mode to skip this)

### 2. Clone the repository

```bash
git clone https://github.com/<your-username>/CS4880.git
cd CS4880
```

### 3. Create and activate a virtual environment

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux / WSL:**

> **WSL/Ubuntu first-time setup:** `python3-venv` and `pip` are not pre-installed. Run this once before creating the venv:
> ```bash
> sudo apt update && sudo apt install python3-pip python3-venv -y
> ```

```bash
python3 -m venv .venv
source .venv/bin/activate
```

> Your prompt should now show `(.venv)` — all packages install into this isolated environment.  
> Always use `python3` and `pip3` in WSL/Linux terminals — `python` is not available by default.

### 4. Install dependencies

**Windows (PowerShell):**
```powershell
pip install -r "Assignment 8/requirements.txt"
```

**macOS / Linux / WSL:**
```bash
pip3 install -r "Assignment 8/requirements.txt" --index-url https://download.pytorch.org/whl/cpu
```

> The `--index-url` flag forces the CPU-only PyTorch wheel. Without it, pip installs a CUDA-enabled build that fails on systems without NVIDIA GPU drivers (e.g. WSL).

This installs `numpy`, `torch`, and `wandb`.

### 5. Log in to WandB (first time only)

```bash
wandb login
```

Paste your API key from [wandb.ai/authorize](https://wandb.ai/authorize) when prompted.  
Skip this step entirely if you plan to use `--offline` mode.

---

## Running the Comparison

```bash
cd "Assignment 8"

# Full run – logs to WandB project "rl-algorithm-zoo"
python3 rl_zoo.py --project rl-algorithm-zoo

# Offline mode (no internet required, sync later with `wandb sync`)
python3 rl_zoo.py --offline

# Adjust episode count and seed
python3 rl_zoo.py --episodes 5000 --seed 0 --project rl-algorithm-zoo
```

> **Directory name has a space** — always wrap it in quotes: `cd "Assignment 8"`

### CLI flags

| Flag | Default | Description |
|------|---------|-------------|
| `--episodes` | `3000` | Training episodes per algorithm |
| `--seed` | `42` | Global random seed |
| `--project` | `rl-algorithm-zoo` | WandB project name |
| `--offline` | off | Run WandB in offline mode |

### Running individual agents

Each agent module has a `__main__` block for quick standalone testing:

```bash
python3 qlearning_agent.py   # trains Q-Learning, prints last-100 avg
python3 reinforce_agent.py   # trains REINFORCE
python3 ppo_agent.py         # trains PPO
```

---

## WandB Metrics

`rl_zoo.py` creates one WandB run per algorithm plus a final **Comparison-Summary** run. The following metrics are logged per episode:

| Metric | Description |
|--------|-------------|
| `episode_reward` | Total undiscounted reward for the episode |
| `episode_steps` | Steps taken before termination |
| `rolling_100_reward` | Exponential window average (last 100 episodes) |
| `reached_goal` | Binary — did the agent reach `G` this episode? |

Summary metrics (final 100 episodes):

| Metric | Description |
|--------|-------------|
| `final_avg_reward` | Mean reward |
| `final_avg_steps` | Mean steps |
| `success_rate` | Fraction of episodes that reached the goal |
| `best_episode_reward` | Peak reward across all episodes |

---

## Expected Results

On the 5×5 GridMaze after 3000 episodes:

| Algorithm | Paradigm | Expected Behaviour |
|-----------|----------|-------------------|
| Q-Learning | Value-Based | Converges fastest; tabular methods benefit from small state spaces |
| REINFORCE | Policy-Based | Higher variance early; converges but more slowly than Q-Learning |
| PPO | Hybrid | Most sample-efficient neural method; lower variance than REINFORCE |

---

## References

- Watkins & Dayan (1992). *Q-Learning*. Machine Learning.
- Williams (1992). *Simple Statistical Gradient-Following Algorithms for Connectionist RL*. Machine Learning.
- Schulman et al. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.
- [Stable-Baselines3 RL Zoo](https://stable-baselines3.readthedocs.io/en/master/guide/rl_zoo.html)
- [PettingZoo](https://pettingzoo.farama.org/)