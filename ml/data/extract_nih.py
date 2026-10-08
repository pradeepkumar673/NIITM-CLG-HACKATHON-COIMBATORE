import os
import tarfile
from pathlib import Path


def extract_safe(tar_path, dest_dir):
    with tarfile.open(tar_path, 'r:gz') as tar:
        for member in tar.getmembers():
            # Check for path traversal
            if member.name.startswith('/') or '..' in member.name:
                print(f"Warning: skipped unsafe path {member.name}")
                continue
            
            # The member is expected to be inside an 'images/' folder or directly inside the tar
            # We want to put them all in dest_dir
            filename = os.path.basename(member.name)
            if not filename or member.isdir():
                continue
                
            dest_path = dest_dir / filename
            if not dest_path.exists():
                member.name = filename
                tar.extract(member, path=dest_dir)

def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    raw_dir = base_dir / "data" / "raw" / "nih_chestxray14"
    archives_dir = raw_dir / "archives"
    dest_dir = raw_dir / "images"
    
    if not dest_dir.exists():
        dest_dir.mkdir(parents=True, exist_ok=True)
        
    if not archives_dir.exists():
        print(f"Archives directory not found: {archives_dir}")
        return
        
    tar_files = list(archives_dir.glob("images_*.tar.gz"))
    if not tar_files:
        print("No tar.gz files found in archives.")
        return
        
    for i, tar_path in enumerate(tar_files):
        print(f"Extracting {tar_path.name} ({i+1}/{len(tar_files)})...")
        extract_safe(tar_path, dest_dir)
        
    images_count = len(list(dest_dir.glob("*.*")))
    print(f"Extraction complete. Total images in {dest_dir}: {images_count}")

if __name__ == "__main__":
    main()
