import httpx
import json
import time
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from backend.app.core.security import create_access_token

def main():
    token = create_access_token({"sub": "1", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}
    base_url = "http://127.0.0.1:8000"
    
    img_path = ROOT / "tests/test_images/chest_sample.png"
    if not img_path.exists():
        # Fallback to empty image creation just for test if needed, or point to an existing test file
        print(f"Creating a dummy image at {img_path}")
        img_path.parent.mkdir(parents=True, exist_ok=True)
        import cv2
        import numpy as np
        cv2.imwrite(str(img_path), np.zeros((256, 256), dtype=np.uint8))
        
    with open(img_path, "rb") as f:
        files = {"file": ("chest_sample.png", f, "image/png")}
        data = {"body_part": "chest", "history_flags": "{}"}
        print("Uploading...")
        res = httpx.post(f"{base_url}/studies", files=files, data=data, headers=headers)
        
    print("Upload Status:", res.status_code)
    if res.status_code != 200:
        print(res.text)
        return
        
    study_id = res.json()["id"]
    print(f"Study ID: {study_id}")
    
    # Wait for result
    print("Waiting for result...")
    for _ in range(20):
        res = httpx.get(f"{base_url}/studies/{study_id}/result", headers=headers)
        if res.status_code == 200:
            result = res.json()
            if result:
                print("Result:", json.dumps(result, indent=2)[:500] + "...")
                return
        time.sleep(1)
        
    print("Timed out waiting for result.")

if __name__ == "__main__":
    main()
