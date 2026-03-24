"""
reinforce_agent.py – REINFORCE: a pure Policy-Based RL algorithm (NumPy implementation).
"""

from __future__ import annotations

import numpy as np
from maze_env import MazeEnv


class REINFORCEAgent:
    """
    Pure Monte-Carlo policy-gradient agent — no critic, no torch.

    Parameters
    ----------
    n_states  : number of discrete states
    n_actions : number of discrete actions
    lr        : learning rate for the policy weight update
    gamma     : reward discount factor
    """

    def __init__(
        self,
        n_states: int,
        n_actions: int,
        lr: float = 1e-3,
        gamma: float = 0.99,
        **_kwargs,          # absorbs unused kwargs (e.g. hidden=64) from rl_zoo
    ):
        self.n_states = n_states
        self.n_actions = n_actions
        self.lr = lr
        self.gamma = gamma

        # Linear policy weights: W[a, s] → logit for action a in state s
        self.W = np.zeros((n_actions, n_states))

        # Per-episode trajectory buffers
        self._trajectory: list[tuple[int, int, np.ndarray]] = []  # (action, state, probs)
        self._rewards: list[float] = []

    # ------------------------------------------------------------------

    def _softmax(self, x: np.ndarray) -> np.ndarray:
        x = x - np.max(x)          # numerical stability
        e = np.exp(x)
        return e / e.sum()

    def _probs(self, state: int) -> np.ndarray:
        oh = np.zeros(self.n_states)
        oh[state] = 1.0
        return self._softmax(self.W @ oh)

    def select_action(self, state: int, training: bool = True) -> int:
        """Sample an action; record trajectory step when training."""
        probs = self._probs(state)
        if training:
            action = int(np.random.choice(self.n_actions, p=probs))
            self._trajectory.append((action, state, probs))
        else:
            action = int(np.argmax(probs))
        return action

    def store_reward(self, reward: float) -> None:
        self._rewards.append(reward)

    def update(self) -> float:
        """
        Compute Monte-Carlo returns G_t and apply policy-gradient update.
        Returns the mean absolute gradient magnitude for logging.
        """
        # Compute discounted returns
        G = 0.0
        returns: list[float] = []
        for r in reversed(self._rewards):
            G = r + self.gamma * G
            returns.insert(0, G)

        returns_arr = np.array(returns, dtype=np.float64)
        if len(returns_arr) > 1:
            returns_arr = (returns_arr - returns_arr.mean()) / (returns_arr.std() + 1e-8)

        total_grad = 0.0
        for (action, state, probs), G_t in zip(self._trajectory, returns_arr):
            oh = np.zeros(self.n_states)
            oh[state] = 1.0
            e_a = np.zeros(self.n_actions)
            e_a[action] = 1.0
            # ∂ log π(a|s) / ∂W  =  (e_a − probs) ⊗ x_s
            grad = np.outer(e_a - probs, oh)
            self.W += self.lr * G_t * grad
            total_grad += float(np.abs(grad).mean())

        self._trajectory = []
        self._rewards = []
        return total_grad / max(len(returns_arr), 1)

    @property
    def name(self) -> str:
        return "REINFORCE"


# ---------------------------------------------------------------------------
# Standalone training helper (also called by rl_zoo.py)
# ---------------------------------------------------------------------------

def train(
    env: MazeEnv,
    n_episodes: int = 3000,
    lr: float = 1e-3,
    gamma: float = 0.99,
    seed: int = 42,
    **_kwargs,
) -> tuple[REINFORCEAgent, list[float], list[int]]:
    np.random.seed(seed)

    agent = REINFORCEAgent(n_states=env.n_states, n_actions=env.n_actions, lr=lr, gamma=gamma)

    episode_rewards: list[float] = []
    episode_steps: list[int] = []

    for _ in range(n_episodes):
        state = env.reset()
        total_reward = 0.0
        steps = 0

        while True:
            action = agent.select_action(state, training=True)
            next_state, reward, done, _ = env.step(action)
            agent.store_reward(reward)
            state = next_state
            total_reward += reward
            steps += 1
            if done:
                break

        agent.update()
        episode_rewards.append(total_reward)
        episode_steps.append(steps)

    return agent, episode_rewards, episode_steps


if __name__ == "__main__":
    env = MazeEnv()
    agent, rewards, steps = train(env, n_episodes=3000)
    last_100 = rewards[-100:]
    print(f"[REINFORCE] avg reward (last 100 eps): {sum(last_100)/len(last_100):.3f}")
    print(f"[REINFORCE] avg steps  (last 100 eps): {sum(steps[-100:])/100:.1f}")
