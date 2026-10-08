import requests
import os

# Login
resp = requests.post(
    "http://localhost:8000/auth/login",
    json={"email": "doctor@example.com", "password": "password123"}
)
tok = resp.json()["access_token"]

# Upload Bone image
img_path = "data/storage/2d8ec552-9793-4edf-a8ee-6c6cfdf3c37c.jpg"
if not os.path.exists(img_path):
    print("Image not found:", img_path)
    exit(1)

files = {'file': open(img_path, 'rb')}
data = {'body_part': 'bone'}
headers = {'Authorization': f'Bearer {tok}'}

resp2 = requests.post("http://localhost:8000/studies", files=files, data=data, headers=headers)
print("New Study:", resp2.json())
