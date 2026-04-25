# Copyright (c) Meta Platforms, Inc. and affiliates.
# All rights reserved.

"""
FastAPI application for the Board Sim Env Environment.

The openenv framework's built-in /reset and /step endpoints are stateless
(fresh env per request). We add custom /game/reset and /game/step routes
that use a single persistent GameManager instance so multi-round episodes
work correctly from the frontend.
"""

try:
    from openenv.core.env_server.http_server import create_app
except Exception as e:
    raise ImportError(
        "openenv is required for the web interface. Install dependencies with '\n    uv sync\n'"
    ) from e

try:
    from ..models import BoardSimAction, BoardSimObservation
    from .board_sim_env_environment import BoardSimEnvironment
except (ImportError, ValueError):
    # Direct uvicorn launch from envs/board_sim_env/: package context not available.
    import os, sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from models import BoardSimAction, BoardSimObservation  # type: ignore
    from server.board_sim_env_environment import BoardSimEnvironment  # type: ignore

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, Optional
from starlette.middleware.cors import CORSMiddleware


# ── Stateful game manager (single instance, shared across requests) ─
class GameManager:
    """Holds one persistent BoardSimEnvironment so state is preserved
    between /game/reset and /game/step calls."""

    def __init__(self):
        self._env: Optional[BoardSimEnvironment] = None

    def reset(self, seed: int = 42) -> Dict[str, Any]:
        self._env = BoardSimEnvironment()
        obs = self._env.reset(seed=seed)
        return self._obs_to_dict(obs)

    def step(self, decision: str, coalition_pitch: str = '') -> Dict[str, Any]:
        if self._env is None:
            raise RuntimeError("Call /game/reset before /game/step")
        action = BoardSimAction(decision=decision, coalition_pitch=coalition_pitch)
        obs = self._env.step(action)
        return self._obs_to_dict(obs)

    @staticmethod
    def _obs_to_dict(obs: BoardSimObservation) -> Dict[str, Any]:
        return {
            "observation": {
                "state":          obs.state,
                "event":          obs.event,
                "options":        obs.options,
                "npc_statements": obs.npc_statements,
                "round":          obs.round,
            },
            "reward": getattr(obs, "reward", 0.0),
            "done":   getattr(obs, "done", False),
            "info":   {},
        }


_game = GameManager()


# ── Pydantic request models ────────────────────────────────────────
class GameResetRequest(BaseModel):
    seed: int = 42


class GameStepRequest(BaseModel):
    decision: str
    coalition_pitch: str = ""


# ── Create the openenv app (for /health, /schema, /ws, etc.) ───────
app = create_app(
    BoardSimEnvironment,
    BoardSimAction,
    BoardSimObservation,
    env_name="board_sim_env",
    max_concurrent_envs=64,
)

# CORS — allow React dev server and any origin in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Stateful routes ────────────────────────────────────────────────
@app.post("/game/reset")
def game_reset(req: GameResetRequest):
    """Reset the persistent game environment and return initial observation."""
    return _game.reset(seed=req.seed)


@app.post("/game/step")
def game_step(req: GameStepRequest):
    """Step the persistent game environment with the given decision."""
    return _game.step(decision=req.decision, coalition_pitch=req.coalition_pitch)


# ── Entry point ────────────────────────────────────────────────────
def main(host: str = "0.0.0.0", port: int = 8000):
    import uvicorn
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    main(port=args.port)
