"""Train a PPO traffic-signal agent on the SUMO digital twin."""

from __future__ import annotations
import os
from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import EvalCallback
from stable_baselines3.common.monitor import Monitor
from stable_baselines3.common.vec_env import DummyVecEnv
from traffic_env import TrafficEnv

# ─── PATHS ────────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(__file__)
MODEL_PATH      = os.path.join(BASE_DIR, "ppo_traffic_agent")
TB_LOG_DIR      = os.path.join(BASE_DIR, "tb_logs")
EVAL_LOG_DIR    = os.path.join(BASE_DIR, "eval_logs")

# ─── HYPERPARAMETERS ──────────────────────────────────────────
TOTAL_TIMESTEPS = 200_000
N_STEPS         = 2048
BATCH_SIZE      = 64
N_EPOCHS        = 10
GAMMA           = 0.95
LEARNING_RATE   = 3e-4
EVAL_FREQ       = 10_000
# ──────────────────────────────────────────────────────────────

def make_env():
    return Monitor(TrafficEnv(use_gui=False))

def main():
    os.makedirs(TB_LOG_DIR, exist_ok=True)
    os.makedirs(EVAL_LOG_DIR, exist_ok=True)

    print("Starting SUMO training environment...")
    train_env = DummyVecEnv([make_env])
    eval_env  = DummyVecEnv([make_env])
    print("Environments created OK.")

    model = PPO(
        policy="MlpPolicy",
        env=train_env,
        learning_rate=LEARNING_RATE,
        n_steps=N_STEPS,
        batch_size=BATCH_SIZE,
        n_epochs=N_EPOCHS,
        gamma=GAMMA,
        verbose=1,
        tensorboard_log=TB_LOG_DIR,
        device="auto",
    )

    eval_callback = EvalCallback(
        eval_env,
        best_model_save_path=EVAL_LOG_DIR,
        log_path=EVAL_LOG_DIR,
        eval_freq=EVAL_FREQ,
        n_eval_episodes=3,
        deterministic=True,
        render=False,
        verbose=1,
    )

    print(f"Training for {TOTAL_TIMESTEPS:,} timesteps...")
    print("Watch ep_rew_mean — should rise from ~-200 toward ~-50\n")

    model.learn(
        total_timesteps=TOTAL_TIMESTEPS,
        callback=eval_callback,
        progress_bar=False,
    )

    model.save(MODEL_PATH)
    print(f"\nDone. Model saved to {MODEL_PATH}.zip")

if __name__ == "__main__":
    main()