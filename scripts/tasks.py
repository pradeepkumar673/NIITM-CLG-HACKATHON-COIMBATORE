"""Task runner: api, worker, etc."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

COMMANDS = {
    "api": [
        sys.executable, "-m", "uvicorn",
        "backend.app.main:app",
        "--reload",
        "--host", "0.0.0.0",
    ],
}


def _get_port() -> int:
    """Read API_PORT from .env or fall back to 8000."""
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line.startswith("API_PORT="):
                return int(line.split("=", 1)[1].strip())
    return 8000


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print(f"Usage: python scripts/tasks.py [{' | '.join(COMMANDS)}]")
        sys.exit(1)

    task = sys.argv[1]
    cmd = COMMANDS[task]

    if task == "api":
        port = _get_port()
        cmd += ["--port", str(port)]

    print(f"Starting: {' '.join(str(c) for c in cmd)}")
    proc = subprocess.Popen(cmd, cwd=str(ROOT))
    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.terminate()


if __name__ == "__main__":
    main()
