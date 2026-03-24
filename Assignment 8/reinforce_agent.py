"""
reinforce_agent.py – REINFORCE: a pure Policy-Based RL algorithm.
"""

from __future__ import annotations

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from maze_env import MazeEnv


class PolicyNetwork(nn.Module):
    """
    Two-layer MLP policy head.

    Input  : one-hot state vector of length n_states
    Output : softmax probability distribution over n_actions
    """

    def __init__(self, n_states: int, n_actions: int, hidden: int = 64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_states, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, n_actions),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.softmax(self.net(x), dim=-1)


class REINFORCEAgent:
    """
    Pure policy-gradient agent (no critic / no value function).

    Parameters
    ----------
    n_states  : size of the one-hot state encoding
    n_actions : number of discrete actions
    lr        : Adam learning rate
    gamma     : reward discount factor
    hidden    : hidden units per layer
    """

    def __init__(
        self,
        n_states: int,
        n_actions: int,
        lr: float = 1e-3,
        gamma: float = 0.99,
        hidden: int = 64,
    ):
        self.n_states = n_states
        self.n_actions = n_actions
        self.gamma = gamma

        self.policy = PolicyNetwork(n_states, n_actions, hidden)
        self.optimizer = optim.Adam(self.policy.parameters(), lr=lr)

        # Episode trajectory buffers (cleared after each update)
        self._log_probs: list[torch.Tensor] = []
        self._rewards: list[float] = []

    # ------------------------------------------------------------------

    def _one_hot(self, state: int) -> torch.Tensor:
        v = torch.zeros(self.n_states, dtype=torch.float32)
        v[state] = 1.0
        return v

    def select_action(self, state: int, training: bool = True) -> int:
        """Sample an action from the policy distribution."""
        state_t = self._one_hot(state).unsqueeze(0)
        probs = self.policy(state_t)
        if training:
            dist = torch.distributions.Categorical(probs)
            action = dist.sample()
            self._log_probs.append(dist.log_prob(action))
            return int(action.item())
        # Greedy at evaluation time
        return int(probs.argmax(dim=-1).item())

    def store_reward(self, reward: float) -> None:
        self._rewards.append(reward)

    def update(self) -> float:
        """
        Compute Monte-Carlo returns and perform one gradient step.
        Returns the scalar loss for logging.
        """
        # Compute discounted returns G_t for each timestep t
        G = 0.0
        returns: list[float] = []
        for r in reversed(self._rewards):
            G = r + self.gamma * G
            returns.insert(0, G)

        returns_t = torch.tensor(returns, dtype=torch.float32)

        # Normalise returns (reduces variance; not a learned baseline)
        if returns_t.numel() > 1:
            returns_t = (returns_t - returns_t.mean()) / (returns_t.std() + 1e-8)

        # Policy gradient loss: −E[log π(a|s) · G_t]
        loss = torch.stack(
            [-lp * G for lp, G in zip(self._log_probs, returns_t)]
        ).sum()

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        # Reset buffers for next episode
        self._log_probs = []
        self._rewards = []
        return float(loss.item())

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
    hidden: int = 64,
    seed: int = 42,
) -> tuple[REINFORCEAgent, list[float], list[int]]:
    """
    Train a REINFORCE agent on *env* for *n_episodes* episodes.

    Returns
    -------
    agent          : trained REINFORCEAgent
    episode_rewards: list of total reward per episode
    episode_steps  : list of steps taken per episode
    """
    torch.manual_seed(seed)
    np.random.seed(seed)

    agent = REINFORCEAgent(
        n_states=env.n_states,
        n_actions=env.n_actions,
        lr=lr,
        gamma=gamma,
        hidden=hidden,
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


# ---------------------------------------------------------------------------
# Quick self-test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    env = MazeEnv()
    agent, rewards, steps = train(env, n_episodes=3000)
    last_100 = rewards[-100:]
    print(f"[REINFORCE] avg reward (last 100 eps): {sum(last_100)/len(last_100):.3f}")
    print(f"[REINFORCE] avg steps  (last 100 eps): {sum(steps[-100:])/100:.1f}")