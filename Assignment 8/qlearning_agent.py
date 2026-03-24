import numpy as np
import gym
from tqdm import tqdm
import wandb

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

direction_map = {0: "left", 1: "down", 2: "right", 3: "up"}

import os

hostname = os.uname()[1]

timesteps = 1000000
eval_episodes = 100

# Initialize wandb
wandb.init(

    project="FrozenLake",
    name = "Q Learning:" + hostname + ":" + wandb.util.generate_id(),
    tags=["q-learning", ],
    config={
        "algorithm": "Q Learning",
        "timesteps": timesteps,
        "eval_episodes": eval_episodes, 
        "env": "FrozenLakeEnv"
    }
)

def epsilon_greedy_policy(Q, state, epsilon):
    if np.random.uniform(0, 1) < epsilon:
        return np.random.choice(len(Q[state]))
    else:
        return np.argmax(Q[state])



def q_learning(env, num_episodes, alpha=0.1, gamma=0.99, epsilon=0.1):  # alpha: learning rate, aka step size; gamma: discount factor
    Q = np.zeros([env.observation_space.n, env.action_space.n])  # Q-Table, a value for each state/action pair
    pbar = tqdm(total=num_episodes, dynamic_ncols=True) # progress bar
    for episode in range(num_episodes):
        state, _ = env.reset()
        done = False
        episode_reward = 0
        while not done:
            action = epsilon_greedy_policy(Q, state, epsilon)
            next_state, reward, done, _, _ = env.step(action)
            best_next_action = np.argmax(Q[next_state, :])  # This is what make Q-learning different from SARSA
            td_target = reward + gamma * Q[next_state, best_next_action]
            td_error = td_target - Q[state, action]
            Q[state, action] += alpha * td_error
            state = next_state
            episode_reward += reward
        pbar.update(1)
        if episode % 1000 == 0:
            avg_reward = evaluate_policy(env, Q, eval_episodes)
            pbar.set_description(f"\nAverage reward after {episode} episodes, evaluated in {eval_episodes} episodes: {avg_reward:.2f}")
            wandb.log({"episode": episode, "avg_reward": avg_reward})
    pbar.close()
    return Q


def evaluate_policy(env, Q, num_episodes):
    total_reward = 0
    policy = np.argmax(Q, axis=1)
    for episode in range(num_episodes):
        observation, _ = env.reset()
        done = False
        episode_reward = 0
        while not done:
            action = policy[observation]
            observation, reward, done, _, _ = env.step(action)
            episode_reward += reward
        total_reward += episode_reward
    return total_reward / num_episodes


def demo_agent(env, Q, num_episodes=1):
    policy = np.argmax(Q, axis=1)
    for episode in range(num_episodes):
        observation, _ = env.reset()
        done = False
        print("\nDemo: Episode:", episode + 1)
        counter = 0
        while not done:
            counter += 1
            env.render()
            action = policy[observation]
            observation, reward, done, _, _ = env.step(action)
            print(f"Action {episode+1}-{counter}: {direction_map[action]}: reward: {reward}")
            if done: 
                print(f"Final reward for episode {episode+1} is: {reward}")
        env.render()


def main():
    env = gym.make("FrozenLake-v1")
    num_episodes = timesteps

    Q = q_learning(env, num_episodes)
    avg_reward = evaluate_policy(env, Q, num_episodes)
    print(f"Average reward after Q-learning: {avg_reward}")

    visual_env = gym.make('FrozenLake-v1', render_mode='human')
    demo_agent(visual_env, Q, 3)


if __name__ == '__main__':
    main()

