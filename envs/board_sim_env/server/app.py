# Copyright (c) Meta Platforms, Inc. and affiliates.
# All rights reserved.

"""
FastAPI application for the Board Sim Env Environment.
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


# Create the app with web interface and README integration
app = create_app(
    BoardSimEnvironment,
    BoardSimAction,
    BoardSimObservation,
    env_name="board_sim_env",
    max_concurrent_envs=64,  # increased to allow 64 concurrent WebSocket sessions
)

def main(host: str = "0.0.0.0", port: int = 8000):
    import uvicorn
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    main(port=args.port)
