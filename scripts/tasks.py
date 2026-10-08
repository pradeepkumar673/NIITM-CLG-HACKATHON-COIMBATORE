import sys
import subprocess

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        sys.exit(result.returncode)

def main():
    if len(sys.argv) < 2:
        print("Available commands: check, api, web, test, lint")
        sys.exit(1)
        
    cmd = sys.argv[1]
    
    if cmd == "check":
        run_cmd("python scripts/check_gpu.py")
    elif cmd == "api":
        run_cmd("uvicorn backend.app.main:app --reload --port 8000")
    elif cmd == "web":
        run_cmd("cd frontend && pnpm dev")
    elif cmd == "test":
        run_cmd("pytest tests/")
    elif cmd == "lint":
        run_cmd("ruff check .")
        run_cmd("cd frontend && pnpm lint")
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)

if __name__ == "__main__":
    main()
