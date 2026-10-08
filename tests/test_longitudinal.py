import sys
from pathlib import Path
import pytest
import numpy as np
import cv2

ROOT = Path(__file__).resolve().parent.parent

from backend.app.services.longitudinal.engine import LongitudinalEngine, register_images
from ml.eval.eval_registration import apply_known_transform, compute_tre

@pytest.fixture
def engine():
    return LongitudinalEngine()

@pytest.fixture
def dummy_img():
    # 256x256 image with some features
    img = np.zeros((256, 256), dtype=np.uint8)
    cv2.rectangle(img, (50, 50), (100, 150), 255, -1)
    cv2.circle(img, (200, 200), 30, 200, -1)
    return img

def test_registration_accuracy(engine, dummy_img):
    float_img, H_true = apply_known_transform(dummy_img)
    
    H_pred, ncc = register_images(dummy_img, float_img, engine.config)
    
    tre = compute_tre(H_pred, H_true, 256, 256)
    # Mean TRE should be under threshold (5 pixels)
    assert np.mean(tre) < 5.0
    
def test_wrong_patient_flagged(engine, dummy_img):
    # Completely different image
    wrong_img = np.zeros((256, 256), dtype=np.uint8)
    cv2.rectangle(wrong_img, (10, 10), (30, 30), 100, -1)
    
    H_pred, ncc = register_images(dummy_img, wrong_img, engine.config)
    
    # Assert it gets flagged as mismatch
    assert engine.check_mismatch(ncc)

def test_difference_map_zero_for_same(engine, dummy_img):
    H_pred, ncc = register_images(dummy_img, dummy_img, engine.config)
    
    diff, hover, stats = engine.generate_difference_map(dummy_img, dummy_img, H_pred)
    
    assert stats["fraction_changed"] == 0.0
    assert np.all(diff == 0)

def test_uncalibrated_measurement(engine):
    p1 = (0, 0)
    p2 = (100, 0)
    
    res = engine.measure_distance(p1, p2, mm_per_pixel=None)
    assert res["unit"] == "pixels"
    assert res["calibrated"] is False
    assert res["value"] == 100.0
    
def test_calibrated_measurement(engine):
    p1 = (0, 0)
    p2 = (100, 0)
    
    res = engine.measure_distance(p1, p2, mm_per_pixel=0.5)
    assert res["unit"] == "mm"
    assert res["calibrated"] is True
    assert res["value"] == 50.0

def test_relative_density(engine, dummy_img):
    # Dummy image has 255 in (50, 50) to (100, 150)
    # and 0 outside.
    roi_255 = [(60, 60), (90, 60), (90, 140), (60, 140)]
    roi_0 = [(10, 10), (20, 10), (20, 20), (10, 20)]
    
    # 255 / 255 = 1.0
    val = engine.measure_relative_density(dummy_img, roi_255, roi_255)
    assert np.isclose(val, 1.0)
    
    # 0 / 255 = 0.0
    val = engine.measure_relative_density(dummy_img, roi_0, roi_255)
    assert np.isclose(val, 0.0)
