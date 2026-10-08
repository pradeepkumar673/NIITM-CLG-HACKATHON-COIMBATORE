"""Interactive CLI to create the first user. No default users or seed passwords (R1)."""
from __future__ import annotations

import getpass
import sys
from pathlib import Path

# Make sure repo root is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.core.security import hash_password
from backend.app.db.models import UserRole
from backend.app.db.session import init_db, get_db


def main() -> None:
    print("=== XRAY-ASSISTANT: Create User ===")
    print("This script creates a user in the database.")
    print("No default accounts exist. All values must be entered manually.\n")

    email = input("Email: ").strip()
    if not email:
        print("Error: email cannot be empty.")
        sys.exit(1)

    full_name = input("Full name: ").strip()
    if not full_name:
        print("Error: full name cannot be empty.")
        sys.exit(1)

    print(f"Roles: {[r.value for r in UserRole]}")
    role_str = input("Role: ").strip()
    try:
        role = UserRole(role_str)
    except ValueError:
        print(f"Error: role must be one of {[r.value for r in UserRole]}")
        sys.exit(1)

    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("Error: passwords do not match.")
        sys.exit(1)
    if len(password) < 8:
        print("Error: password must be at least 8 characters.")
        sys.exit(1)

    init_db()
    db = next(get_db())
    try:
        from backend.app.db.models import User
        from sqlalchemy.exc import IntegrityError

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Error: a user with email {email!r} already exists.")
            sys.exit(1)

        user = User(
            email=email,
            full_name=full_name,
            role=role,
            password_hash=hash_password(password),
        )
        db.add(user)
        db.commit()
        print(f"\nUser created successfully (id={user.id}, role={user.role.value}).")
    except Exception as exc:
        db.rollback()
        print(f"Error creating user: {exc}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
