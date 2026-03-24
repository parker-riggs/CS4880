"""
qlearning_agent.py – Tabular Q-Learning (Value-Based RL algorithm).

Based on the example from PA7, but refactored to fit the same interface as the REINFORCE and PPO agents for easier comparison in rl_zoo.py.
"""

from __future__ import annotations

import numpy as np
from maze_env import MazeEnv


class QLearningAgent:
    """
    Tabular Q-Learning agent.

    Parameters
    ----------
    n_states     : number of discrete states in the environment
    n_actions    : number of discrete actions
    lr           : learning rate α  (step size for TD updates)
    gamma        : discount factor γ
    epsilon      : initial exploration probability
    epsilon_decay: multiplicative decay applied per episode
    epsilon_min  : floor on exploration probability
    """

    def __init__(
        self,
        n_states: int,
        n_actions: int,
        lr: float = 0.1,
        gamma: float = 0.99,
        epsilon: float = 1.0,
        epsilon_decay: float = 0.995,
        epsilon_min: float = 0.05,
    ):
        self.n_states = n_states
        self.n_actions = n_actions
        self.lr = lr
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min

        # Q-table: row = state, col = action
        self.q_table = np.zeros((n_states, n_actions))

    # ------------------------------------------------------------------

    def select_action(self, state: int, training: bool = True) -> int:
        """epilon-greedy action selection."""
        if training and np.random.random() < self.epsilon:
            return int(np.random.randint(self.n_actions))
        return int(np.argmax(self.q_table[state]))

    def update(
        self,
        state: int,
        action: int,
        reward: float,
        next_state: int,
        done: bool,
    ) -> None:
        """One-step TD update (Q-Learning Bellman equation)."""
        best_next = 0.0 if done else float(np.max(self.q_table[next_state]))
        target = reward + self.gamma * best_next
        td_error = target - self.q_table[state, action]
        self.q_table[state, action] += self.lr * td_error

    def decay_epsilon(self) -> None:
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

    @property
    def name(self) -> str:
        return "Q-Learning"


# ---------------------------------------------------------------------------
# Standalone training helper (also called by rl_zoo.py)
# ---------------------------------------------------------------------------

def train(
    env: MazeEnv,
    n_episodes: int = 3000,
    lr: float = 0.1,
    gamma: float = 0.99,
    epsilon: float = 1.0,
    epsilon_decay: float = 0.995,
    epsilon_min: float = 0.05,
    seed: int = 42,
) -> tuple[QLearningAgent, list[float], list[int]]:
    """
    Train a Q-Learning agent on *env* for *n_episodes* episodes.

    Returns
    -------
    agent          : trained QLearningAgent
    episode_rewards: list of total reward per episode
    episode_steps  : list of steps taken per episode
    """
    np.random.seed(seed)

    agent = QLearningAgent(
        n_states=env.n_states,
        n_actions=env.n_actions,
        lr=lr,
        gamma=gamma,
        epsilon=epsilon,
        epsilon_decay=epsilon_decay,
        epsilon_min=epsilon_min,
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
            agent.update(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward
            steps += 1
            if done:
                break

        agent.decay_epsilon()
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
    print(f"[Q-Learning] avg reward (last 100 eps): {sum(last_100)/len(last_100):.3f}")
    print(f"[Q-Learning] avg steps  (last 100 eps): {sum(steps[-100:])/100:.1f}")