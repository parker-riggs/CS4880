"""
ppo_agent.py – Proximal Policy Optimization (PPO): a Hybrid RL algorithm.
"""

from __future__ import annotations

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from maze_env import MazeEnv


class ActorCritic(nn.Module):
    """
    Shared-backbone network with separate actor and critic heads.

    Input  : one-hot state vector of length n_states
    Outputs:
      probs : softmax action probability distribution  (n_actions,)
      value : scalar state-value estimate              (1,)
    """

    def __init__(self, n_states: int, n_actions: int, hidden: int = 64):
        super().__init__()
        self.backbone = nn.Sequential(
            nn.Linear(n_states, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
        )
        self.policy_head = nn.Linear(hidden, n_actions)
        self.value_head = nn.Linear(hidden, 1)

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        features = self.backbone(x)
        probs = torch.softmax(self.policy_head(features), dim=-1)
        value = self.value_head(features)
        return probs, value


class PPOAgent:
    """
    Per-episode PPO agent with GAE advantage estimation.

    Parameters
    ----------
    n_states   : size of the one-hot state encoding
    n_actions  : number of discrete actions
    lr         : Adam learning rate
    gamma      : reward discount factor
    gae_lambda : GAE smoothing parameter λ
    clip_eps   : PPO clipping radius ε
    n_epochs   : gradient steps per episode update
    hidden     : hidden units per backbone layer
    vf_coef    : coefficient on the value-function loss
    ent_coef   : entropy bonus coefficient (encourages exploration)
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
        hidden: int = 64,
        vf_coef: float = 0.5,
        ent_coef: float = 0.01,
    ):
        self.n_states = n_states
        self.n_actions = n_actions
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_eps = clip_eps
        self.n_epochs = n_epochs
        self.vf_coef = vf_coef
        self.ent_coef = ent_coef

        self.network = ActorCritic(n_states, n_actions, hidden)
        self.optimizer = optim.Adam(self.network.parameters(), lr=lr)

        # Per-episode trajectory buffers
        self._states: list[int] = []
        self._actions: list[int] = []
        self._rewards: list[float] = []
        self._log_probs: list[float] = []
        self._values: list[float] = []
        self._dones: list[bool] = []

    # ------------------------------------------------------------------

    def _one_hot(self, state: int) -> torch.Tensor:
        v = torch.zeros(self.n_states, dtype=torch.float32)
        v[state] = 1.0
        return v

    def select_action(self, state: int, training: bool = True) -> int:
        """
        Sample an action and record the trajectory step.
        Uses no_grad since we re-compute log-probs during the update.
        """
        with torch.no_grad():
            state_t = self._one_hot(state).unsqueeze(0)
            probs, value = self.network(state_t)

        if training:
            dist = torch.distributions.Categorical(probs)
            action = dist.sample()
            self._states.append(state)
            self._actions.append(int(action.item()))
            self._log_probs.append(float(dist.log_prob(action).item()))
            self._values.append(float(value.item()))
            return int(action.item())

        return int(probs.argmax(dim=-1).item())

    def store_transition(self, reward: float, done: bool) -> None:
        self._rewards.append(reward)
        self._dones.append(done)

    def update(self) -> float:
        """
        Compute GAE advantages and run n_epochs of PPO gradient updates.
        Returns the mean total loss for logging.
        """
        T = len(self._rewards)

        # ---- Compute GAE advantages backwards through the episode ----
        advantages = [0.0] * T
        last_gae = 0.0
        for t in reversed(range(T)):
            next_val = 0.0 if (t == T - 1 or self._dones[t]) else self._values[t + 1]
            delta = self._rewards[t] + self.gamma * next_val - self._values[t]
            last_gae = delta + self.gamma * self.gae_lambda * (not self._dones[t]) * last_gae
            advantages[t] = last_gae

        advantages_t = torch.tensor(advantages, dtype=torch.float32)
        returns_t = advantages_t + torch.tensor(self._values, dtype=torch.float32)

        # Normalise advantages for stable updates
        if advantages_t.numel() > 1:
            advantages_t = (advantages_t - advantages_t.mean()) / (advantages_t.std() + 1e-8)

        old_log_probs_t = torch.tensor(self._log_probs, dtype=torch.float32)
        states_oh = torch.stack([self._one_hot(s) for s in self._states])
        actions_t = torch.tensor(self._actions, dtype=torch.long)

        # ---- Multiple gradient epochs on the same collected data ----
        total_loss = 0.0
        for _ in range(self.n_epochs):
            probs, values = self.network(states_oh)
            dist = torch.distributions.Categorical(probs)
            new_log_probs = dist.log_prob(actions_t)
            entropy = dist.entropy().mean()

            ratio = torch.exp(new_log_probs - old_log_probs_t)
            surr1 = ratio * advantages_t
            surr2 = torch.clamp(ratio, 1.0 - self.clip_eps, 1.0 + self.clip_eps) * advantages_t
            policy_loss = -torch.min(surr1, surr2).mean()
            value_loss = self.vf_coef * (values.squeeze() - returns_t).pow(2).mean()
            loss = policy_loss + value_loss - self.ent_coef * entropy

            self.optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(self.network.parameters(), max_norm=0.5)
            self.optimizer.step()
            total_loss += float(loss.item())

        # Clear trajectory buffers
        self._states = []
        self._actions = []
        self._rewards = []
        self._log_probs = []
        self._values = []
        self._dones = []

        return total_loss / self.n_epochs

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
    hidden: int = 64,
    seed: int = 42,
) -> tuple[PPOAgent, list[float], list[int]]:
    """
    Train a PPO agent on *env* for *n_episodes* episodes.

    Returns
    -------
    agent          : trained PPOAgent
    episode_rewards: list of total reward per episode
    episode_steps  : list of steps taken per episode
    """
    torch.manual_seed(seed)
    np.random.seed(seed)

    agent = PPOAgent(
        n_states=env.n_states,
        n_actions=env.n_actions,
        lr=lr,
        gamma=gamma,
        gae_lambda=gae_lambda,
        clip_eps=clip_eps,
        n_epochs=n_epochs,
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


# ---------------------------------------------------------------------------
# Quick self-test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    env = MazeEnv()
    agent, rewards, steps = train(env, n_episodes=3000)
    last_100 = rewards[-100:]
    print(f"[PPO] avg reward (last 100 eps): {sum(last_100)/len(last_100):.3f}")
    print(f"[PPO] avg steps  (last 100 eps): {sum(steps[-100:])/100:.1f}")