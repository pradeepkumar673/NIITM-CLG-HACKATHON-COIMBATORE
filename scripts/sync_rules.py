from pathlib import Path


def main():
    root = Path(__file__).parent.parent
    docs_rules = root / "docs" / "AGENT_RULES.md"
    
    if not docs_rules.exists():
        print(f"Error: {docs_rules} not found.")
        return

    with open(docs_rules, "r", encoding="utf-8") as f:
        rules_content = f.read()

    # 1. AGENTS.md
    with open(root / "AGENTS.md", "w", encoding="utf-8") as f:
        f.write(rules_content)

    # 2. GEMINI.md
    with open(root / "GEMINI.md", "w", encoding="utf-8") as f:
        f.write(rules_content)

    # 3. .cursor/rules/project.mdc
    cursor_dir = root / ".cursor" / "rules"
    cursor_dir.mkdir(parents=True, exist_ok=True)
    with open(cursor_dir / "project.mdc", "w", encoding="utf-8") as f:
        f.write("---\n")
        f.write("description: Project Rules\n")
        f.write("globs: *\n")
        f.write("alwaysApply: true\n")
        f.write("---\n\n")
        f.write(rules_content)

    # 4. .github/copilot-instructions.md
    github_dir = root / ".github"
    github_dir.mkdir(parents=True, exist_ok=True)
    with open(github_dir / "copilot-instructions.md", "w", encoding="utf-8") as f:
        f.write(rules_content)

    print("Successfully synced rules to AGENTS.md, GEMINI.md, .cursor/rules/project.mdc, and .github/copilot-instructions.md")

if __name__ == "__main__":
    main()
