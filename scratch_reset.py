import sqlite3
import os

db_path = 'data/processed/xray_assistant.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    conn.execute("UPDATE studies SET status='uploaded' WHERE id=96")
    conn.execute("DELETE FROM results WHERE study_id=96")
    conn.commit()
    print("Reset study 96 to uploaded.")
    conn.close()
else:
    print("DB not found.")
