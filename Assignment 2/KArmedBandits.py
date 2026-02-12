import argparse
import time
from dataclasses import dataclass

import numpy as np

try:
    import wandb
except Exception:  # pragma: no cover - optional dependency
    wandb = None


@dataclass(frozen=True)
class Config:
    k_arms: int = 10
    steps: int = 2000
    runs: int = 200
    epsilon: float = 0.1
    initial_value: float = 0.0
    alpha_mode: str = "constant"  # "constant" or "sample"
    constant_alpha: float = 0.1
    seed: int = 1


class KArmedBandit:
    def __init__(self, k_arms: int, rng: np.random.Generator) -> None:
        self.k_arms = k_arms
        self.rng = rng
        self.true_means = rng.normal(0.0, 1.0, size=k_arms)
        self.optimal_action = int(np.argmax(self.true_means))
        self.optimal_mean = float(self.true_means[self.optimal_action])

    def pull(self, action: int) -> float:
        return float(self.rng.normal(self.true_means[action], 1.0))


class EpsilonGreedyAgent:
    def __init__(
        self,
        k_arms: int,
        epsilon: float,
        initial_value: float,
        alpha_mode: str,
        constant_alpha: float,
        rng: np.random.Generator,
    ) -> None:
        self.k_arms = k_arms
        self.epsilon = epsilon
        self.alpha_mode = alpha_mode
        self.constant_alpha = constant_alpha
        self.rng = rng
        self.q_values = np.full(k_arms, initial_value, dtype=float)
        self.counts = np.zeros(k_arms, dtype=int)

    def select_action(self) -> int:
        if self.rng.random() < self.epsilon:
            return int(self.rng.integers(0, self.k_arms))
        max_q = np.max(self.q_values)
        candidates = np.flatnonzero(self.q_values == max_q)
        return int(self.rng.choice(candidates))

    def update(self, action: int, reward: float) -> None:
        self.counts[action] += 1
        if self.alpha_mode == "sample":
            alpha = 1.0 / self.counts[action]
        else:
            alpha = self.constant_alpha
        self.q_values[action] += alpha * (reward - self.q_values[action])


def simulate_config(cfg: Config) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    rewards = np.zeros(cfg.steps, dtype=float)
    optimal_hits = np.zeros(cfg.steps, dtype=float)
    cumulative_regret = np.zeros(cfg.steps, dtype=float)

    for run in range(cfg.runs):
        rng = np.random.default_rng(cfg.seed + run)
        bandit = KArmedBandit(cfg.k_arms, rng)
        agent = EpsilonGreedyAgent(
            cfg.k_arms,
            cfg.epsilon,
            cfg.initial_value,
            cfg.alpha_mode,
            cfg.constant_alpha,
            rng,
        )

        regret = 0.0
        for t in range(cfg.steps):
            action = agent.select_action()
            reward = bandit.pull(action)
            agent.update(action, reward)

            rewards[t] += reward
            optimal_hits[t] += 1.0 if action == bandit.optimal_action else 0.0
            regret += bandit.optimal_mean - reward
            cumulative_regret[t] += regret

    rewards /= cfg.runs
    optimal_hits = (optimal_hits / cfg.runs) * 100.0
    cumulative_regret /= cfg.runs

    return rewards, optimal_hits, cumulative_regret


def run_experiments(args: argparse.Namespace) -> None:
    epsilons = [0.0, 0.01, 0.1]
    initial_values = [0.0, 5.0]
    alpha_modes = ["constant", "sample"]

    if args.no_wandb:
        use_wandb = False
    else:
        use_wandb = wandb is not None
        if not use_wandb:
            print("wandb not available; running without logging.")

    for epsilon in epsilons:
        for initial_value in initial_values:
            for alpha_mode in alpha_modes:
                cfg = Config(
                    k_arms=args.k_arms,
                    steps=args.steps,
                    runs=args.runs,
                    epsilon=epsilon,
                    initial_value=initial_value,
                    alpha_mode=alpha_mode,
                    constant_alpha=args.constant_alpha,
                    seed=args.seed,
                )

                if use_wandb:
                    run = wandb.init(
                        project=args.wandb_project,
                        entity=args.wandb_entity or None,
                        config=cfg.__dict__,
                        group=args.wandb_group,
                        name=f"eps{epsilon}_init{initial_value}_alpha{alpha_mode}",
                        reinit=True,
                    )
                else:
                    run = None

                rewards, optimal_hits, cumulative_regret = simulate_config(cfg)
                for t in range(cfg.steps):
                    if use_wandb:
                        wandb.log(
                            {
                                "step": t + 1,
                                "avg_reward": rewards[t],
                                "optimal_action_pct": optimal_hits[t],
                                "cumulative_regret": cumulative_regret[t],
                            },
                            step=t + 1,
                        )

                if run is not None:
                    run.finish()

                print(
                    "Completed: epsilon=",
                    epsilon,
                    "init=",
                    initial_value,
                    "alpha=",
                    alpha_mode,
                )

    print("All experiments completed.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="K-Armed Bandits (epsilon-greedy) experiment runner."
    )
    parser.add_argument("--steps", type=int, default=2000)
    parser.add_argument("--runs", type=int, default=200)
    parser.add_argument("--k-arms", type=int, default=10)
    parser.add_argument("--constant-alpha", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--wandb-project", type=str, default="k-armed-bandits")
    parser.add_argument("--wandb-entity", type=str, default="")
    parser.add_argument("--wandb-group", type=str, default="pa2")
    parser.add_argument("--no-wandb", action="store_true")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    start = time.time()
    run_experiments(args)
    elapsed = time.time() - start
    print(f"Elapsed time: {elapsed:.2f}s")


if __name__ == "__main__":
    main()