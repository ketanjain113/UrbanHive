import gymnasium as gym
import numpy as np
import traci
import os

# ─── CONFIG ───────────────────────────────────────────────────
SUMO_CONFIG  = r"C:\College\TCS Innovate\backend\sumo\run.sumocfg"
TLS_ID       = "A1"
PHASES       = 2        # agent only picks 0 or 2 (green phases)
ACTION_TO_PHASE = {0: 0, 1: 2}   # map agent action → real SUMO phase
STEP_LENGTH  = 5
YELLOW_DUR   = 3
MAX_STEPS    = 720

LANES = [
    "A0A1_0",
    "A1A0_0",
    "A0B0_0",
    "B0A0_0",
]
# ──────────────────────────────────────────────────────────────

class TrafficEnv(gym.Env):
    metadata = {"render_modes": []}

    def __init__(self, use_gui=False):
        super().__init__()
        self.use_gui = use_gui
        self.action_space      = gym.spaces.Discrete(PHASES)  # now 2
        self.observation_space = gym.spaces.Box(
            low=0.0, high=1.0, shape=(len(LANES),), dtype=np.float32
        )
        self.current_phase = 0
        self.step_count    = 0

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        if traci.isLoaded():
            traci.close()
        binary = "sumo-gui" if self.use_gui else "sumo"
        traci.start([binary, "-c", SUMO_CONFIG,
                     "--no-warnings", "--no-step-log"])
        self.current_phase = 0
        self.step_count    = 0
        return self._get_obs(), {}

    def step(self, action):
        sumo_phase = ACTION_TO_PHASE[action]
        
        if sumo_phase != self.current_phase:
            # insert yellow phase before switching
            yellow_phase = sumo_phase + 1  # phase 1 or 3
            traci.trafficlight.setPhase(TLS_ID, yellow_phase)
            for _ in range(YELLOW_DUR):
                traci.simulationStep()

        traci.trafficlight.setPhase(TLS_ID, sumo_phase)
        self.current_phase = sumo_phase

        for _ in range(STEP_LENGTH):
            traci.simulationStep()

        obs        = self._get_obs()
        reward     = self._get_reward()
        self.step_count += 1
        terminated = self.step_count >= MAX_STEPS

        return obs, reward, terminated, False, {}

    def _get_obs(self):
        queues = []
        for lane in LANES:
            try:
                q = traci.lane.getLastStepHaltingNumber(lane)
            except traci.TraCIException:
                q = 0
            queues.append(min(q / 20.0, 1.0))
        return np.array(queues, dtype=np.float32)

    def _get_reward(self):
        total = 0
        for lane in LANES:
            try:
                h = traci.lane.getLastStepHaltingNumber(lane)
                total += h
            except traci.TraCIException:
                pass
        return -float(total)

    def _set_yellow(self):
        try:
            state = traci.trafficlight.getRedYellowGreenState(TLS_ID)
            yellow = "y" * len(state)
            traci.trafficlight.setRedYellowGreenState(TLS_ID, yellow)
        except traci.TraCIException:
            pass

    def close(self):
        if traci.isLoaded():
            traci.close()