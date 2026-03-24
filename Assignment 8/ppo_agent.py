"""
ppo_agent.py – Proximal Policy Optimization (PPO): Hybrid RL (pure NumPy).
"""

from __future__ import annotations

import numpy as np
from maze_env import MazeEnv


class PPOAgent:
    """
    Per-episode PPO agent with GAE and clipped surrogate — pure NumPy.

    Parameters
    ----------
    n_states   : number of discrete states
    n_actions  : number of discrete actions
    lr         : learning rate for both actor and critic
    gamma      : reward discount factor
    gae_lambda : GAE smoothing parameter λ
    clip_eps   : PPO clip radius ε
    n_epochs   : gradient passes over each episode’s trajectory
    vf_coef    : relative weight of value loss (informational only)
    """

    def __init__(
        self,
        n_states: int,
        n_actions: int,
        lr: float = 3e-4,
        gamma: float = 0.99,
        gae_lambda: float = 0.95,
        clip_eps: float = 0.2,
        n_epochs: int = 4,
        vf_coef: float = 0.5,
        **_kwargs,  # absorbs unused kwargs (e.g. hidden=64)
    ):
        self.n_states = n_states
        self.n_actions = n_actions
        self.lr = lr
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_eps = clip_eps
        self.n_epochs = n_epochs
        self.vf_coef = vf_coef

        # Linear actor weights and linear critic weights
        self.W = np.zeros((n_actions, n_states))   # actor
        self.v = np.zeros(n_states)                # critic

        # Per-episode trajectory buffers
        self._states: list[int] = []
        self._actions: list[int] = []
        self._rewards: list[float] = []
        self._probs_old: list[float] = []   # π_old(a|s) for each step
        self._values: list[float] = []
        self._dones: list[bool] = []

    # ------------------------------------------------------------------

    def _softmax(self, x: np.ndarray) -> np.ndarray:
        x = x - np.max(x)
        e = np.exp(x)
        return e / e.sum()

    def _actor_probs(self, state: int) -> np.ndarray:
        oh = np.zeros(self.n_states)
        oh[state] = 1.0
        return self._softmax(self.W @ oh)

    def select_action(self, state: int, training: bool = True) -> int:
        probs = self._actor_probs(state)
        if training:
            action = int(np.random.choice(self.n_actions, p=probs))
            self._states.append(state)
            self._actions.append(action)
            self._probs_old.append(float(probs[action]))
            self._values.append(float(self.v[state]))
        else:
            action = int(np.argmax(probs))
        return action

    def store_transition(self, reward: float, done: bool) -> None:
        self._rewards.append(reward)
        self._dones.append(done)

    def update(self) -> float:
        """
        Compute GAE advantages then run n_epochs of clipped PPO updates.
        Returns mean |value error| for logging.
        """
        T = len(self._rewards)

        # ---- GAE backwards pass ----
        advantages = np.zeros(T)
        last_gae = 0.0
        for t in reversed(range(T)):
            next_val = 0.0 if (t == T - 1 or self._dones[t]) else self._values[t + 1]
            delta = self._rewards[t] + self.gamma * next_val - self._values[t]
            last_gae = delta + self.gamma * self.gae_lambda * (not self._dones[t]) * last_gae
            advantages[t] = last_gae

        returns = advantages + np.array(self._values)
        if T > 1:
            advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)

        probs_old = np.array(self._probs_old)
        total_err = 0.0

        for _ in range(self.n_epochs):
            for t in range(T):
                s = self._states[t]
                a = self._actions[t]
                A = float(advantages[t])

                probs = self._actor_probs(s)
                ratio = probs[a] / (probs_old[t] + 1e-8)

                # Only update actor when surrogate is not clipped
                clipped = np.clip(ratio, 1 - self.clip_eps, 1 + self.clip_eps)
                if (A >= 0 and ratio < 1 + self.clip_eps) or \
                   (A < 0 and ratio > 1 - self.clip_eps):
                    oh = np.zeros(self.n_states)
                    oh[s] = 1.0
                    e_a = np.zeros(self.n_actions)
                    e_a[a] = 1.0
                    # d(ratio · A)/d(W) = A · ratio · (e_a − probs) ⊗ x_s
                    self.W += self.lr * A * ratio * np.outer(e_a - probs, oh)

                # Critic MSE gradient: d(V-G)^2/d(v[s]) = 2*(V-G)
                val_err = float(self.v[s]) - returns[t]
                self.v[s] -= self.lr * self.vf_coef * 2.0 * val_err
                total_err += abs(val_err)

        self._states = []
        self._actions = []
        self._rewards = []
        self._probs_old = []
        self._values = []
        self._dones = []
        return total_err / max(T * self.n_epochs, 1)

    @property
    def name(self) -> str:
        return "PPO"


# ---------------------------------------------------------------------------
# Standalone training helper (also called by rl_zoo.py)
# ---------------------------------------------------------------------------

def train(
    env: MazeEnv,
    n_episodes: int = 3000,
    lr: float = 3e-4,
    gamma: float = 0.99,
    gae_lambda: float = 0.95,
    clip_eps: float = 0.2,
    n_epochs: int = 4,
    seed: int = 42,
    **_kwargs,
) -> tuple[PPOAgent, list[float], list[int]]:
    np.random.seed(seed)

    agent = PPOAgent(
        n_states=env.n_states,
        n_actions=env.n_actions,
        lr=lr,
        gamma=gamma,
        gae_lambda=gae_lambda,
        clip_eps=clip_eps,
        n_epochs=n_epochs,
    )

    episode_rewards: list[float] = []
    episode_steps: list[int] = []

    for _ in range(n_episodes):
        state = env.reset()
        total_reward = 0.0
        steps = 0

        while True:
            action = agent.select_action(state, training=True)
            next_state, reward, done, _ = env.step(action)
            agent.store_transition(reward, done)
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
    print(f"[PPO] avg reward (last 100 eps): {sum(last_100)/len(last_100):.3f}")
    print(f"[PPO] avg steps  (last 100 eps): {sum(steps[-100:])/100:.1f}")