import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.core.security import hash_password
from backend.app.db.models import UserRole, User
from backend.app.db.session import get_db, init_db

def seed():
    init_db()
    db = next(get_db())
    try:
        users_to_create = [
            ("doctor@example.com", "Dr. Arti Sharma", UserRole("doctor"), "password123"),
            ("admin@example.com", "System Admin", UserRole("admin"), "password123"),
            ("worker@example.com", "Sister Lakshmi Devi", UserRole("health_worker"), "password123")
        ]
        
        for email, name, role, pwd in users_to_create:
            if not db.query(User).filter(User.email == email).first():
                user = User(
                    email=email,
                    full_name=name,
                    role=role,
                    password_hash=hash_password(pwd)
                )
                db.add(user)
        db.commit()
        print("Users seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
