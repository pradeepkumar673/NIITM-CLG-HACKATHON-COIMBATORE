"""Ingestion service for processing and validating images."""
import hashlib
import io
import os
import pydicom
from pydicom.pixel_data_handlers.util import apply_voi_lut
import numpy as np
from PIL import Image, ImageOps
import yaml
from pathlib import Path
from typing import Dict, Any, Tuple

ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent

def _load_ingest_config() -> dict:
    cfg_path = ROOT / "config" / "ingest.yaml"
    if cfg_path.exists():
        with open(cfg_path, "r") as f:
            return yaml.safe_load(f)["ingest"]
    return {
        "max_size_bytes": 50 * 1024 * 1024,
        "max_pixel_count": 64000000,
        "storage_dir": "data/storage"
    }

class IngestError(Exception):
    pass

def validate_magic_bytes(file_bytes: bytes) -> str:
    """Validate magic bytes and return type (dicom, png, jpeg)."""
    if len(file_bytes) > 132 and file_bytes[128:132] == b"DICM":
        return "dicom"
    
    hex_start = file_bytes[:4].hex()
    if hex_start == "89504e47":
        return "png"
    if hex_start.startswith("ffd8"):
        return "jpeg"
        
    raise IngestError("Unsupported file type based on magic bytes.")

def compute_sha256(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def process_dicom(file_bytes: bytes) -> Tuple[Image.Image, dict]:
    """Extract pixels and metadata from DICOM, removing PHI."""
    try:
        ds = pydicom.dcmread(io.BytesIO(file_bytes))
    except Exception as e:
        raise IngestError(f"Failed to read DICOM: {e}")

    # Extract pixel data
    try:
        arr = ds.pixel_array
        if 'WindowCenter' in ds or 'WindowWidth' in ds or 'VOILUTSequence' in ds:
            arr = apply_voi_lut(arr, ds)
        else:
            # Fallback to simple rescale
            slope = getattr(ds, 'RescaleSlope', 1)
            intercept = getattr(ds, 'RescaleIntercept', 0)
            arr = arr * slope + intercept
            
        if getattr(ds, 'PhotometricInterpretation', '') == 'MONOCHROME1':
            arr = np.amax(arr) - arr
            
        # Normalize to 8-bit
        arr = arr - np.min(arr)
        if np.max(arr) > 0:
            arr = arr / np.max(arr)
        arr = (arr * 255).astype(np.uint8)
        img = Image.fromarray(arr).convert('L')
    except Exception as e:
        raise IngestError(f"Failed to process DICOM pixels: {e}")
        
    meta = {
        "modality": getattr(ds, "Modality", "Unknown"),
        "body_part": getattr(ds, "BodyPartExamined", "Unknown"),
        "pixel_spacing": getattr(ds, "PixelSpacing", None)
    }
    # No PHI tags are copied
    return img, meta

def process_photo(file_bytes: bytes) -> Image.Image:
    """Read photo, fix EXIF orientation, convert to grayscale, strip EXIF."""
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img = ImageOps.exif_transpose(img)
        img = img.convert('L')
        # Stripping EXIF happens implicitly by not saving exif data later
        return img
    except Exception as e:
        raise IngestError(f"Failed to process image: {e}")

def process_upload(study_id: str, file_bytes: bytes) -> Dict[str, Any]:
    """Main ingestion entrypoint."""
    cfg = _load_ingest_config()
    
    # 1. Size check
    if len(file_bytes) > cfg["max_size_bytes"]:
        raise IngestError(f"File too large. Max {cfg['max_size_bytes']} bytes.")
        
    # 2. SHA256
    sha_hash = compute_sha256(file_bytes)
    
    # 3. Type check
    img_type = validate_magic_bytes(file_bytes)
    
    # 4. Processing
    meta = {}
    if img_type == "dicom":
        img, meta = process_dicom(file_bytes)
    else:
        img = process_photo(file_bytes)
        
    # 5. Pixel count check
    if img.width * img.height > cfg["max_pixel_count"]:
        raise IngestError(f"Image too large ({img.width}x{img.height} pixels).")
        
    # 6. Save
    storage_base = ROOT / cfg["storage_dir"] / str(study_id)
    storage_base.mkdir(parents=True, exist_ok=True)
    
    orig_path = storage_base / f"original.{img_type if img_type != 'dicom' else 'dcm'}"
    norm_path = storage_base / "normalized.png"
    
    orig_path.write_bytes(file_bytes)
    img.save(norm_path, format="PNG") # EXIF is NOT passed here, so it's stripped
    
    return {
        "study_id": study_id,
        "sha256": sha_hash,
        "file_type": img_type,
        "original_path": str(orig_path.relative_to(ROOT)),
        "normalized_path": str(norm_path.relative_to(ROOT)),
        "metadata": meta,
        "width": img.width,
        "height": img.height
    }
