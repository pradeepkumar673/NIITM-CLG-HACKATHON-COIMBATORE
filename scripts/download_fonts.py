import urllib.request
import os

FONTS = {
    "NotoSans-Regular.ttf": "https://github.com/notofonts/latin-greek-cyrillic/raw/main/fonts/NotoSans/hinted/ttf/NotoSans-Regular.ttf",
    "NotoSansTamil-Regular.ttf": "https://github.com/notofonts/tamil/raw/main/fonts/NotoSansTamil/hinted/ttf/NotoSansTamil-Regular.ttf",
    "NotoSansDevanagari-Regular.ttf": "https://github.com/notofonts/devanagari/raw/main/fonts/NotoSansDevanagari/hinted/ttf/NotoSansDevanagari-Regular.ttf"
}

BACKEND_DIR = "backend/assets/fonts"
FRONTEND_DIR = "frontend/public/fonts"

os.makedirs(BACKEND_DIR, exist_ok=True)
os.makedirs(FRONTEND_DIR, exist_ok=True)

for name, url in FONTS.items():
    print(f"Downloading {name}...")
    try:
        backend_path = os.path.join(BACKEND_DIR, name)
        frontend_path = os.path.join(FRONTEND_DIR, name)
        
        # We only really need to download it once and copy
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(backend_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            
        with open(frontend_path, 'wb') as out_file:
            out_file.write(data)
            
        print(f"Saved {name}")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
