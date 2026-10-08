import subprocess
import time

import requests

print("Starting FastAPI backend...")
proc = subprocess.Popen(["uvicorn", "backend.app.main:app", "--port", "8000"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

try:
    time.sleep(5) # wait for server to start
    print("Testing /models/status endpoint...")
    resp = requests.get("http://127.0.0.1:8000/models/status")
    print(f"Status Code: {resp.status_code}")
    print(resp.json())
finally:
    proc.terminate()
