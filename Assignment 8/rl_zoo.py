"""
rl_zoo.py – RL Algorithm Zoo: Comparison of Three RL Paradigms on a Maze.

Trains three RL algorithms on the same 5×5 GridMaze environment and logs
all metrics to Weights & Biases for side-by-side comparison:

  1. Q-Learning   — value-based (tabular TD control)
  2. REINFORCE    — policy-based (Monte-Carlo policy gradient, no critic)
  3. PPO          — hybrid / Actor-Critic (clipped surrogate + GAE)

Additionally the AdaptiveRushBot (LLM-guided MicroRTS agent) is discussed
in the README as the fourth "candidate algorithm" for the MicroRTS bot.

Usage
-----
  # Offline / CI (no browser, no WandB prompts):
  python rl_zoo.py --offline

  # Log to WandB (will prompt for API key if not already logged in):
  python rl_zoo.py --project rl-algorithm-zoo

  # Adjust training length:
  python rl_zoo.py --episodes 5000 --seed 0
"""

from __future__ import annotations

import argparse
import statistics
import sys
from typing import Callable

import numpy as np
import wandb

import q_learning_agent as ql_mod
import reinforce_agent as rf_mod
import ppo_agent as ppo_mod
from maze_env import MazeEnv


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_EPISODES = 3000
ROLLING_WINDOW = 100   # window for computing smoothed metrics


# ---------------------------------------------------------------------------
# Per-algorithm WandB run
# ---------------------------------------------------------------------------

def run_algorithm(
    algo_name: str,
    algo_type: str,
    train_fn: Callable,
    env: MazeEnv,
    n_episodes: int,
    seed: int,
    project: str,
    group: str,
    offline: bool,
    **train_kwargs,
) -> dict:
    """
    Train one algorithm, stream metrics to WandB, return summary dict.
    """

    config = {
        "algorithm": algo_name,
        "algorithm_type": algo_type,
        "n_episodes": n_episodes,
        "seed": seed,
        "maze_size": f"{env.ROWS}x{env.COLS}",
        **train_kwargs,
    }

    mode = "offline" if offline else "online"
    run = wandb.init(
        project=project,
        group=group,
        name=algo_name,
        config=config,
        mode=mode,
        reinit=True,
    )

    print(f"\n{'='*60}")
    print(f"  Training: {algo_name}  ({algo_type})")
    print(f"{'='*60}")

    agent, rewards, steps = train_fn(
        env,
        n_episodes=n_episodes,
        seed=seed,
        **train_kwargs,
    )

    # Stream per-episode metrics
    reward_buf: list[float] = []
    for ep, (r, s) in enumerate(zip(rewards, steps)):
        reward_buf.append(r)
        rolling_avg = statistics.mean(reward_buf[-ROLLING_WINDOW:])
        reached_goal = 1.0 if r > 0 else 0.0

        wandb.log(
            {
                "episode": ep,
                "episode_reward": r,
                "episode_steps": s,
                f"rolling_{ROLLING_WINDOW}_reward": rolling_avg,
                "reached_goal": reached_goal,
            }
        )

    # Compute summary statistics
    last_n = rewards[-ROLLING_WINDOW:]
    summary = {
        "algorithm": algo_name,
        "algorithm_type": algo_type,
        "final_avg_reward": statistics.mean(last_n),
        "final_avg_steps": statistics.mean(steps[-ROLLING_WINDOW:]),
        "success_rate": sum(1 for r in last_n if r > 0) / len(last_n),
        "best_episode_reward": max(rewards),
        "worst_episode_reward": min(rewards),
    }

    wandb.summary.update(summary)
    run.finish()

    print(f"  → final avg reward  : {summary['final_avg_reward']:.3f}")
    print(f"  → final avg steps   : {summary['final_avg_steps']:.1f}")
    print(f"  → success rate      : {summary['success_rate']*100:.1f}%")

    return summary


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="RL Algorithm Zoo – maze comparison")
    parser.add_argument("--episodes", type=int, default=DEFAULT_EPISODES,
                        help="Number of training episodes per algorithm")
    parser.add_argument("--seed", type=int, default=42,
                        help="Global random seed")
    parser.add_argument("--project", type=str, default="rl-algorithm-zoo",
                        help="WandB project name")
    parser.add_argument("--offline", action="store_true",
                        help="Run WandB in offline mode (no network required)")
    args = parser.parse_args()

    np.random.seed(args.seed)
    group_name = f"maze-comparison-ep{args.episodes}-seed{args.seed}"

    env = MazeEnv(max_steps=200)

    # -----------------------------------------------------------------------
    # Algorithm registry
    # Each tuple: (display_name, RL_type, train_function, extra_kwargs)
    # -----------------------------------------------------------------------
    algorithms = [
        (
            "Q-Learning",
            "Value-Based",
            ql_mod.train,
            dict(lr=0.1, gamma=0.99, epsilon=1.0, epsilon_decay=0.995, epsilon_min=0.05),
        ),
        (
            "REINFORCE",
            "Policy-Based",
            rf_mod.train,
            dict(lr=1e-3, gamma=0.99, hidden=64),
        ),
        (
            "PPO",
            "Hybrid (Actor-Critic)",
            ppo_mod.train,
            dict(lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_eps=0.2, n_epochs=4, hidden=64),
        ),
    ]

    summaries: list[dict] = []
    for algo_name, algo_type, train_fn, kwargs in algorithms:
        summary = run_algorithm(
            algo_name=algo_name,
            algo_type=algo_type,
            train_fn=train_fn,
            env=env,
            n_episodes=args.episodes,
            seed=args.seed,
            project=args.project,
            group=group_name,
            offline=args.offline,
            **kwargs,
        )
        summaries.append(summary)

    # -----------------------------------------------------------------------
    # Print final comparison table
    # -----------------------------------------------------------------------
    print(f"\n{'='*70}")
    print(f"  FINAL COMPARISON  (last {ROLLING_WINDOW} episodes)")
    print(f"{'='*70}")
    header = f"{'Algorithm':<20} {'Type':<24} {'Avg Reward':>11} {'Avg Steps':>10} {'Success%':>9}"
    print(header)
    print("-" * 70)
    for s in summaries:
        print(
            f"{s['algorithm']:<20} {s['algorithm_type']:<24}"
            f" {s['final_avg_reward']:>11.3f}"
            f" {s['final_avg_steps']:>10.1f}"
            f" {s['success_rate']*100:>8.1f}%"
        )
    print(f"{'='*70}")

    # -----------------------------------------------------------------------
    # Log an aggregated comparison run
    # -----------------------------------------------------------------------
    agg_run = wandb.init(
        project=args.project,
        group=group_name,
        name="Comparison-Summary",
        config={"n_episodes": args.episodes, "seed": args.seed},
        mode="offline" if args.offline else "online",
        reinit=True,
    )
    for s in summaries:
        wandb.log(
            {
                f"{s['algorithm']}/final_avg_reward": s["final_avg_reward"],
                f"{s['algorithm']}/final_avg_steps": s["final_avg_steps"],
                f"{s['algorithm']}/success_rate": s["success_rate"],
            }
        )
    agg_run.finish()

    print("\nDone. Open the WandB project to view the comparison report.")
    if args.offline:
        print("(Offline mode — run `wandb sync` to push results.)")


if __name__ == "__main__":
    main()