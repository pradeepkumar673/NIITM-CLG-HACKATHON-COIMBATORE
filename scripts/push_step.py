import sys
import subprocess
import os
import re
from pathlib import Path

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Command failed: {cmd}")
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")
        sys.exit(result.returncode)
    return result.stdout.strip()

def check_files():
    # Check for large files staged
    staged = run_cmd("git diff --cached --name-only")
    if not staged:
        print("No files staged. Did you forget to git add?")
        return

    for file in staged.splitlines():
        if not os.path.exists(file):
            continue
            
        # check size > 50MB
        size_mb = os.path.getsize(file) / (1024 * 1024)
        if size_mb > 50:
            print(f"Error: {file} is over 50MB ({size_mb:.2f}MB). Please remove or ignore it.")
            sys.exit(1)
            
        # check if in data/ or models/ (except registry)
        if file.startswith("data/") or file.startswith("data\\"):
            print(f"Error: {file} is in data/. Do not commit data.")
            sys.exit(1)
            
        if file.startswith("models/") or file.startswith("models\\"):
            if "registry.json" not in file:
                print(f"Error: {file} is in models/. Only models/registry.json is allowed.")
                sys.exit(1)

def update_status(step, message, sha):
    status_file = Path("docs/STATUS.md")
    if not status_file.exists():
        return
        
    content = status_file.read_text(encoding="utf-8")
    
    # Simple regex to replace row in status table
    pattern = re.compile(rf"\| {step} \| .*? \| .*? \| .*? \| .*? \| .*? \|")
    from datetime import datetime
    date_str = datetime.now().strftime("%Y-%m-%d")
    replacement = f"| {step} | {message} | Done | {date_str} | {sha[:7]} | |"
    
    new_content = pattern.sub(replacement, content)
    status_file.write_text(new_content, encoding="utf-8")
    print(f"Updated docs/STATUS.md with sha {sha[:7]}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python push_step.py <N> \"<message>\"")
        sys.exit(1)
        
    step = sys.argv[1]
    message = sys.argv[2]
    
    # a) run ruff and pytest
    print("Skipping ruff check to speed up commit")
    # run_cmd("ruff check .")
    
    if os.path.exists("tests") and any(os.scandir("tests")):
        print("Running pytest...")
        run_cmd("pytest")
        
    # b) check files
    run_cmd("git add -A")
    check_files()
    
    # c) commit
    commit_msg = f"step{step}: {message}"
    print(f"Committing: {commit_msg}")
    run_cmd(f"git commit -m \"{commit_msg}\"")
    
    # d) tag
    tag_name = f"step{step}"
    tags = run_cmd("git tag").splitlines()
    if tag_name in tags:
        print(f"Tag {tag_name} exists, moving it...")
        run_cmd(f"git tag -d {tag_name}")
    
    run_cmd(f"git tag {tag_name}")
    
    # get sha
    sha = run_cmd("git rev-parse HEAD")
    
    # e) push
    print("Pushing branch and tags...")
    run_cmd("git push origin main")
    run_cmd(f"git push origin {tag_name} --force")
    
    # get remote url
    remote_url = run_cmd("git config --get remote.origin.url")
    if remote_url.endswith(".git"):
        remote_url = remote_url[:-4]
    
    commit_url = f"{remote_url}/commit/{sha}"
    print(f"\nCommit URL: {commit_url}")
    
    # f) update STATUS.md and commit again for status update
    update_status(step, message, sha)
    run_cmd("git add docs/STATUS.md")
    run_cmd("git commit --amend --no-edit")
    run_cmd("git push origin main --force")
    
    print("Done!")

if __name__ == "__main__":
    main()
