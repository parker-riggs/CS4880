# Project Assignment 3: Initial Bot - Your first MicroRTS Game AI Agent. 

### Timeline:
* In-class discussion: Week 5
* In-class tournament: Tuesday, Week 6
### Final Due Date: As listed on Canvas.

### Submission instructions: 

* Option 1: build from scratch
* Option 2: dissect and modify a built-in AI such as NaïveMCTS
* Option 3: dissect and modify a third-party AI such as Mayari or CoacAI
* Option 4: modify and train a RL agent such as RAI (Scott's 2023 winning AI) or 2L (Local Learner)

### Deliverables: 
* [optional before competition] Deliverable 1: A key idea/improvement highlight summary 
* [after competition] Deliverable 2: Code walk-through presentation
* [before class] Deliverable 3: A bot evaluation report with results of your bot competing against 4 benchmark bots (random, worker rush, light rush, naive MCTS, Mayari, Coac); With WandB reports and diagrams if feasible.

(Submission on Canvas first, later on this page after the tournament.)

#### Helpful links:
* Python bot (winner of 2019): https://github.com/narsue/UTS_Imass
* Java: Coac AI (winter of 2020): https://github.com/Coac/coac-ai-microrts 
* Java: Mayari (winner 2021): https://github.com/barvazkrav/mayariBot

### Submissions

* Name
  * Key-idea description or Link
  * Code (Link to a subfolder here or a separate git repo accessible to all in class) 
  * Evaluation WandB Report Link

* Colin Murphy
  * Key-idea / Improvement: Monte Carlo approach to hyperparameterize the different reward weights in the reinforcement learning model.
  * [Code](https://github.com/Colinster327/MicroRTS-Py)
  * [WandB Report](https://api.wandb.ai/links/colinster327/198o1pdv)
 
* Evans Nyanney
  * Key-Idea Description :  In my project, I reworked the original CoacAI to improve how it makes combat decisions. I added a new parameter that lets the bot control how aggressively it attacks. When set higher, the bot is more willing to engage in fights, and when lower, it plays more cautiously.
  * [Code](https://github.com/evansnyanney/Mod-CoacAI-AdaptAggro)
  * [WandB Report](https://wandb.ai/evansnyanney-ohio-university/MicroRTS-Eval/reports/MicroRTS-Game-AI-Agent-RL---VmlldzoxMTQ1MjgxNg)

* Olivia Radecki
  * [Key-ideas](https://github.com/olivarad/MicroRTS-AgentP/blob/main/README.md)
  * [Code](https://github.com/olivarad/MicroRTS-AgentP/blob/main/AgentP.java)
  * [Evaluation](https://github.com/olivarad/MicroRTS-AgentP/blob/main/tournament.csv)

* Chengzhou Ye
  * Key-idea: UCB1 exploration value changed: Encourage more exploration of less-visited nodes. This small change may lead to different branch selections in the tree search and, consequently, different overall decisions during gameplay
  * [Code](https://github.com/JustinYe377/MicroRTS-Py.git) 
  * [Wandb](https://api.wandb.ai/links/yejustin213-ohio-university/wvy80ppj)

* Nicholas Adkins
  * Key-idea / Improvement: Lightari - Mayari but primarily using Light Units instead of Heavy Units
  * [Code](https://github.com/nickadkins47/CS4900-PA3/tree/master)
 
* Shinebayar Mendbayar
  * Key-idea / Improved the Strategy Workers will attack in groups and Archers will run away from enemy and shoot from distance.
  * [Code](https://github.com/shinebay451/Shiny-Bot.git)
  
* Kaeden Saunders
  * Key-idea: Hyperparameterize PPO's learning rate function
  * [Code](https://github.com/KaedenSaunders/MicroRTS-Py)
  * [Wandb](https://wandb.ai/ks679318-ohio-university/microrts-py?nw=nwuserks679318)
    
* Isaiah Greene
  * Key-idea: Make NaiveMCTS more calculated, reward for longer searches, rewards benefit better choice paths.
  * [Code](https://github.com/Igreene5290/ZayNaiveMCTS_Bot.git)
  * [Results](https://github.com/Igreene5290/ZayNaiveMCTS_Bot/blob/dd1e86b47845bfff54a70c387ec4ab555c8d87ed/tournament.csv)
 
* Clint Sharp
  * Key-idea / Make improvements on agent, like increase or descrease the reward based on the search time. Also increase how it deals with oppents.
  * [Code](https://github.com/cs665820/MicroRTS-Py.git)

* Parker Riggs
  * Key-idea: modified built-in scripted bots by creating an adaptive policy that starts with WorkerRush and transitions to LightRush using simple game-state signals like time, unit counts, and nearby enemy pressure.
  * [Code]()
  * [Results]()