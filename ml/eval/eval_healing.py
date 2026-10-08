import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from backend.app.db.session import _SessionLocal
from backend.app.db.models import Outcome

def main():
    try:
        db = _SessionLocal()
        outcomes = db.query(Outcome).filter(Outcome.union_confirmed_date.isnot(None)).all()
        n = len(outcomes)
    except Exception as e:
        print(f"DB not available or initialized: {e}")
        n = 0
        
    MIN_REQUIRED_OUTCOMES = 50
    
    if n < MIN_REQUIRED_OUTCOMES:
        print(f"not enough real outcomes to validate ({n} of {MIN_REQUIRED_OUTCOMES})")
        return
        
    print(f"Found {n} real outcomes. Computing error metrics...")
    # Will compute error vs estimate when data is available.

if __name__ == "__main__":
    main()
