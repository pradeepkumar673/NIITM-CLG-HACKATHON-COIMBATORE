import asyncio
import httpx
import time
from backend.app.core.security import create_access_token

async def main():
    token = create_access_token({"sub": "1", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}
    base_url = "http://127.0.0.1:8000"
    
    # We will submit the same test image 20 times rapidly
    img_path = "data/raw/nih_chestxray14/images/00000001_000.png"
    
    async with httpx.AsyncClient() as client:
        start_time = time.perf_counter()
        
        tasks = []
        for i in range(20):
            files = {"file": ("test.png", open(img_path, "rb"), "image/png")}
            data = {"body_part": "chest"}
            tasks.append(client.post(f"{base_url}/studies", files=files, data=data, headers=headers))
            
        print("Submitting 20 requests...")
        responses = await asyncio.gather(*tasks)
        print("All requests submitted.")
        
        study_ids = []
        for r in responses:
            if r.status_code == 200:
                study_ids.append(r.json()["id"])
            else:
                print(f"Error: {r.text}")
                
        # Now wait for all to be 'done'
        print("Waiting for processing to complete...")
        done = set()
        while len(done) < len(study_ids):
            for sid in study_ids:
                if sid in done:
                    continue
                r = await client.get(f"{base_url}/studies/{sid}/result", headers=headers)
                if r.status_code == 200 and r.json():
                    done.add(sid)
            await asyncio.sleep(2)
            print(f"Completed {len(done)}/{len(study_ids)}")
            
        total_time = time.perf_counter() - start_time
        print(f"Total time for 20 requests: {total_time:.2f}s")
        print(f"Average time per request (throughput): {total_time/20:.2f}s")

if __name__ == "__main__":
    asyncio.run(main())
