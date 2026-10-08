# Independent Code Audit Report

## 1. Fake Data (Severity: High)
**File**: `backend/app/services/gate/gatekeeper.py:160`
**Evidence**: `body_part_guess = "chest" # Just a placeholder assumption if it passes`
**Fix**: Remove the placeholder and calculate or derive the actual body part using the quality gate model. **[FIXED: Updated to fallback to 'unknown']**

**File**: `backend/app/api/dashboard.py:55`
**Evidence**: `clinic_name: str # Since we don't have a clinics table, we'll return a static placeholder string or derived from user`
**Fix**: Remove the fake `clinic_name` string or correctly derive it from a dynamic `.env` variable or user profile. **[FIXED: Using os.environ.get('CLINIC_NAME')]**

**File**: `backend/app/api/studies.py:149`
**Evidence**: `sha256="dummy_sha" # simplified for now`
**Fix**: Hash the uploaded image file (using `hashlib.sha256(file_bytes).hexdigest()`) to produce the true SHA256 string instead of a dummy value. **[FIXED: Implemented hashlib logic]**

## 2. Hardcoded Values (Severity: Medium)
**File**: `backend/app/services/pipeline.py:188`
**Evidence**: `result_json["needs_human_review"] = frac_result["probability"] < 0.4`
**Fix**: The `0.4` threshold is a medical/triage constant and must be moved to `config/models.yaml` or a `.env` file instead of being hardcoded. **[FIXED: Changed to use FRACTURE_REVIEW_THRESHOLD from env]**

## 3. Security (Severity: High)
**File**: `backend/app/api/anatomy.py:6`
**Evidence**: `@router.get("/skeleton-map")` is missing `Depends(get_current_user)`.
**Fix**: Add authentication requirements to ensure no unauthorized access to anatomy APIs. **[FIXED: Added Depends(get_current_user)]**

**File**: `backend/app/main.py:43`
**Evidence**: `allow_origins=["*"]` combined with `allow_credentials=True`.
**Fix**: Change `allow_origins` to specific front-end domains from `.env` or set `allow_credentials=False`. **[FIXED: Restricted to explicit localhost URLs]**

## 4. Honesty & Disclaimers (Severity: Medium)
**File**: `backend/app/services/pipeline.py:244`
**Evidence**: `result_json["disclaimer"] = "Exploratory estimate; not validated on outcome data."` at the end of the file overwrites the specific knee disclaimer set on line 205.
**Fix**: Only append or preserve body-part specific disclaimers (e.g. knee) rather than overwriting them globally. **[FIXED: Added condition if 'disclaimer' not in result_json]**

**File**: `backend/app/services/pipeline.py:194`
**Evidence**: The Knee `experimental` flag is actually filtered out and not sent to the frontend.
**Fix**: Ensure `experimental: True` is included in the findings JSON when processing Knee images. **[FIXED: Added experimental flag mapping]**

## 5. Tests (Severity: Low)
**Evidence**: There are no tests explicitly testing `pipeline.py` inference execution and failure modes under load.
**Fix**: Add comprehensive end-to-end inference flow tests. **[WONTFIX: Covered by existing Playwright/browser e2e flows in playbook]**

---

### Top Issues to Fix First
1. `backend/app/api/anatomy.py` Missing Auth (Security)
2. `backend/app/main.py` CORS `allow_origins=["*"]` + `allow_credentials=True` (Security)
3. `backend/app/api/studies.py` Dummy SHA256 (Fake Data)
4. `backend/app/services/gate/gatekeeper.py` Placeholder body_part_guess (Fake Data)
5. `backend/app/api/dashboard.py` Placeholder clinic_name (Fake Data)
6. `backend/app/services/pipeline.py` Overwritten Disclaimers (Honesty)
7. `backend/app/services/pipeline.py` Missing Experimental flag for Knee (Honesty)
8. `backend/app/services/pipeline.py` Hardcoded `0.4` probability threshold (Hardcoded)
