# XRAY-ASSISTANT — 24-Hour Hackathon Build Playbook

**23 steps · Antigravity + Cursor (Grok 4.6) + VS Code Copilot · free datasets only · trained locally on RTX 5050 · real data, no mocks · one GitHub push per step (`step1`, `step2`, ...)**

---

## 0. Read this first

### 0.1 What you are building (one paragraph)

A web app for rural clinics. A health worker uploads a chest, bone or knee X-ray (DICOM, image file, or a phone photo of a film). The system checks it is really an X-ray, runs trained neural networks, and gives a doctor a **decision-support report** containing: calibrated probabilities (Feature 1: uncertainty quantification with a visual confidence map), a Grad-CAM++ heatmap plus a rationale chain built from the real outputs (Feature 2: explainable AI), a comparison of two X-rays of the same fracture taken weeks apart (Feature 3: longitudinal tracking), cited interaction notes between detected conditions (Feature 4: comorbidity), and an experimental knee bone-health screen (Feature 5). Output is in English, Tamil and Hindi. It is **clinical decision support, never a diagnosis**.

### 0.2 How to use this file

1. Do **Section 2 (one-time setup)** now. Start the dataset download (Step 2) as early as possible; it is the slowest thing in the whole build.
2. Go through steps **in order**. For each step:
   - Open the IDE and select the model in the step header (format: `IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)`).
   - Do **"Your manual actions"** first (downloads, folders).
   - Paste the **PROMPT** block into the agent chat.
   - The agent must finish **"Live verification"** itself and show you the output. If anything fails, paste **Reusable Prompt B**.
   - The prompt ends by running `python scripts/push_step.py N "message"`, which commits as `stepN: message`, tags `stepN` and pushes.
3. Never skip a step. Later steps read files that earlier steps wrote.
4. If a model hits its quota, switch to the listed **Fallback** and paste **Reusable Prompt C**.
5. Training steps (5, 10) run in the **background**. Start them, then continue with the next coding step while the GPU works.

### 0.3 "Real data, no mocks" means

- No fake data in the product: no lorem ipsum, no random numbers standing in for predictions, no static JSON posing as an API response, no hardcoded diagnoses, no hardcoded demo users or passwords.
- If a model file or dataset is missing, the system **fails loudly** (HTTP 503 `model_not_available`) instead of inventing output.
- Every URL, port, path, threshold and medical constant lives in `.env` or `config/*.yaml`. Medical constants carry a `source` (DOI, guideline, or the calibration artifact that produced them).
- Tests and demos use **real images from the public datasets' held-out test splits** and your own uploads. A test-only transformation of a real image (for example a known rotation to test registration) is allowed and labelled as such.

### 0.4 Honest limits (so nothing surprises you in front of judges)

| Spec feature | Reality | What this playbook builds |
|---|---|---|
| Fracture "days to union" | No public dataset of serial fracture radiographs with union outcomes exists | Registration, difference maps and measurements work on real images. The days-to-union estimate uses **literature priors with DOIs** and is permanently labelled **exploratory** |
| Vitamin D / protein deficiency from X-ray | No validated public dataset links X-rays to blood levels | **Not built.** Only a small **knee bone-health screen** (experimental). Deficiency flags are disabled in code and in the UI copy |
| Comorbidity numbers (e.g. "3x mortality") | Some spec numbers are not what the literature says | Rules engine only emits statements that carry a **citation and the exact reported quantity**. Rules stay `draft` until a clinician signs off |
| Tamil / Hindi text | Medical text needs a clinician fluent in that language | Each language pack has `review_status`; unreviewed packs show a visible "machine-drafted" banner |
| Accuracy | US/NIH-trained models may not transfer to Indian patients | Report **measured** metrics on a held-out patient-level split only; flag low-confidence cases for human review |

Never claim a number you did not measure in Step 20.

### 0.5 Hardware notes (RTX 5050 laptop, i5-14450HX)

- About 8 GB VRAM: train at 224 px, mixed precision (`torch.autocast`), batch 32 (drop to 16 on out-of-memory, and use gradient accumulation to keep the effective batch).
- The RTX 5050 is **Blackwell (sm_120)**. You need a recent NVIDIA driver and PyTorch built for **CUDA 12.8 or newer (`cu128`)**. Older builds fail with "no kernel image is available". Step 1 handles this.
- The CPU has many threads, but big PNG decoding is the usual bottleneck. Step 3 pre-resizes images into a cache so training reads small files.
- Do not train two models at the same time on the GPU. Small CPU-side coding is fine while a model trains.

---

## 1. Tool and model routing

| Tool | Model | Use it for |
|---|---|---|
| **Antigravity** | **Gemini 3.1 Pro (High)** | Planning, dataset engineering, browsing/research with citations, **live browser testing**, final audits |
| **Antigravity** | **Claude Opus 4.6 (Thinking)** | Correctness-critical work: training code, calibration/uncertainty maths, explainability, registration |
| **Antigravity** | **Claude Sonnet 4.6 (Thinking)** | Main workhorse: backend endpoints, frontend, orchestration, rules engine |
| **Antigravity** | **Gemini 3.8 Flash (Medium)** | Fast, repetitive work: translations draft, PDF layout, lint fixes (Gemini 3.7/3.6 Flash are marked "Leaving Soon", avoid them) |
| **Antigravity** | **GPT-OSS 120B (Medium)** | Independent second opinion / code review |
| **Cursor** | **Grok 4.6** | Cross-checking the last commit, UI polish, quick multi-file edits |
| **VS Code** | **GitHub Copilot (free)** | Tiny tasks only: explain an error, a small unit test, a docstring. Small monthly quota, so never use it for big prompts |

**Antigravity quota fallback order:** Opus 4.6 → Sonnet 4.6 → Gemini 3.1 Pro → GPT-OSS 120B. Flash is for light work only.

---

## 2. One-time setup (do before Step 1)

1. **GitHub:** create an empty **private** repo `xray-assistant`. Clone it and open that folder in Antigravity, Cursor and VS Code (the same folder in all three).
2. **Install:** Git, GitHub CLI (`gh auth login`, finish login), Python 3.11, [uv](https://docs.astral.sh/uv/), Node 20 LTS, pnpm 9. Update your **NVIDIA driver** to the latest (Blackwell needs a recent one).
3. **Disk space:** keep at least **60 GB free** (raw data about 20 GB, caches and models the rest).
4. **Kaggle:** account → Settings → API → create token → save as `C:\Users\<you>\.kaggle\kaggle.json` (Mac/Linux: `~/.kaggle/kaggle.json`). Verify with `kaggle datasets list`. Then, on the website, open each dataset page used in Steps 2–3 **while logged in and click Download once / accept its rules**; the CLI is refused for some datasets until you do.
5. **No approvals needed.** This playbook uses only datasets you can download immediately. (MURA, CheXpert and IN-CXR need approvals and are intentionally left out; they are listed as future work.)
6. **Optional but valuable (5 minutes):** take **10–20 phone photos of real X-ray films or of X-ray images shown on a monitor** (if you have access) and save them in `data/raw/phone_photos/`. They are used only to test the quality gate and robustness. Without them everything else still works.

---

## 3. Reusable prompts

### Reusable Prompt A — Independent review
Use in **Cursor + Grok 4.6**, or **Antigravity + GPT-OSS 120B (Medium)**.

```text
Review the diff of the most recent commit (git show HEAD) and the files it touches.
Do NOT edit anything. Report only:
1. Bugs and logic errors (file:line and a concrete failing scenario).
2. Any hardcoded value, mock, placeholder, fake data, random-number stand-in, or TODO that hides missing functionality.
3. Security problems (authz gaps, injection, secrets, PHI in logs, unsafe file handling).
4. Medical-safety problems (overconfident wording, unsourced medical constants, missing human-review flag).
5. Missing tests for the changed behaviour.
Return a numbered list sorted by severity. For any category with no findings, write "none found".
```

### Reusable Prompt B — Fix loop (paste when verification fails)

```text
Verification failed. Do the following in order and do not skip any:
1. Reproduce the failure and paste the exact error/output.
2. State the root cause in 2-3 sentences, with evidence (not a guess).
3. Fix the root cause, not the symptom. Do not weaken tests, lower thresholds, wrap errors in try/except that hide them, or add fake data.
4. Re-run the full verification block of the current step and paste the passing output.
5. Add or update a regression test for this failure.
6. Update docs/STATUS.md, then re-run scripts/push_step.py for the current step number (it will amend the step commit with "fix").
```

### Reusable Prompt C — Resume after a model switch or quota hit

```text
You are continuing an unfinished step in a project you have not seen before.
1. Read AGENTS.md, docs/STATUS.md, docs/DECISIONS.md, docs/PROJECT_SPEC.md and docs/ARCHITECTURE.md.
2. Run `git status`, `git log --oneline -15` and `git diff --stat`.
3. The step I was on is: STEP <N> — <TITLE>. Its original prompt is: <paste the prompt again>.
4. Do NOT redo finished work. List what is done vs missing (evidence from the repo), finish only what is missing, run the step's live verification, update docs/STATUS.md and run scripts/push_step.py.
```

### Reusable Prompt D — Background training procedure (referenced by Steps 5 and 10)

1. The agent writes the training script and a YAML config under `config/train_*.yaml` (learning rate, batch size, epochs, workers: nothing hardcoded in code).
2. It starts training as a **detached background process** that writes a log file (Windows: `Start-Process` with redirected output; Mac/Linux: `nohup`), so the IDE is not blocked.
3. It checkpoints **every epoch** and can **resume** from the last checkpoint if the laptop sleeps or crashes.
4. After the first epoch it reports the measured seconds per epoch and the ETA to you.
5. When done it writes metrics JSON, records the weights' SHA256 in `models/registry.json` (this file **is** committed; weights are **not**).

---

## 4. Timeline (24 hours) and what to cut if you fall behind

| Hours | Steps | Notes |
|---|---|---|
| 0:00–1:00 | 1, start 2 | The NIH download starts here and runs for a long time |
| 1:00–3:00 | 2 (finish), 3, 4 | |
| 3:00–6:30 | 5 (starts, then trains about 1.5–2 h), 6 | Code Steps 6 and 4 leftovers while it trains |
| 6:30–9:00 | 7, 8 | |
| 9:00–11:30 | 9, 10 | Step 10 trains three small models in the background |
| 11:30–14:30 | 11, 12, 13 | |
| 14:30–16:30 | 14, 15 | |
| 16:30–20:00 | 16, 17, 18, 19 | |
| 20:00–23:00 | 20, 21, 22, 23 | Testing phase |
| 23:00–24:00 | Buffer and demo rehearsal | |

**Cut in this order if you run late** (each keeps the project working): Step 19 (Cursor polish) → Step 18 language packs (keep English only, mention others as roadmap) → Step 14 (healing predictor; keep registration and difference maps) → Step 8 (zone mapping; rationale uses "left/right lung" only). **Never cut** Steps 1–7, 9, 15, 16, 20, 21, 23.

---

## 5. Datasets used (all free, no approval wait)

| Purpose | Dataset | Where | Used in |
|---|---|---|---|
| Chest multi-label (14 findings) | **NIH ChestX-ray14**, official patient-wise split lists | https://nihcc.app.box.com/v/ChestXray-NIHCC (official). Kaggle copy: https://www.kaggle.com/datasets/nih-chest-xrays/data | Steps 2, 5, 7, 9 |
| Chest alternative if NIH is too slow | CheXpert small (Kaggle mirror, search "CheXpert" by `ashery`) | https://www.kaggle.com/datasets/ashery/chexpert | fallback |
| TB + lung masks | Shenzhen + Montgomery with masks | https://www.kaggle.com/datasets/nikhilpandey360/chest-xray-masks-and-labels | Steps 8, 10 |
| Fracture | **FracAtlas** (open, CC-BY, with annotations) | https://figshare.com/articles/dataset/The_dataset/22363012 | Step 10 |
| Knee bone health | Osteoporosis Knee X-ray Dataset | https://www.kaggle.com/datasets/stevepython/osteoporosis-knee-xray-dataset | Step 10 |
| Gate negatives: brain MRI | Brain Tumor MRI Dataset | https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset | Step 6 |
| Gate negatives: natural photos | Oxford-IIIT Pet (auto-downloaded by `torchvision.datasets.OxfordIIITPet`) | https://www.robots.ox.ac.uk/~vgg/data/pets/ | Step 6 |

If a link has moved, search the dataset name plus "Kaggle" or its paper title, put the files in the same folder, and tell the agent the new source so it records it in `docs/DATA_REGISTRY.md`.

---

# PART A — FOUNDATION AND DATA (Steps 1–4)

---

## STEP 1 — Bootstrap: project brief, agent rules, GPU check, push script

**IDE: Antigravity | Model: Gemini 3.1 Pro (High)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 45 min
**Goal:** One repo, one rulebook obeyed by every IDE and model, a working GPU PyTorch, and the per-step push tool.

### Your manual actions
- Confirm Section 2 is done (`gh auth status` OK, repo cloned, `kaggle datasets list` works).
- Have your repo URL ready: `https://github.com/<you>/xray-assistant.git`.

### PROMPT

```text
You are the lead engineer bootstrapping a 24-hour hackathon project called XRAY-ASSISTANT. Work only inside this repo. Do all of the following in order.

=== A. WRITE THE PROJECT BRIEF to docs/PROJECT_SPEC.md exactly as below ===
PROJECT: XRAY-ASSISTANT, an AI X-ray decision-support assistant for rural and underserved India (Chennai and across India). Users: (1) health worker (uploads images), (2) doctor (reviews, compares, signs off). It is clinical decision support, never a diagnosis.
INPUTS: chest X-ray, bone X-ray (fracture), knee X-ray; DICOM, PNG/JPEG, or a phone photo of a film.
PIPELINE: upload -> quality gate (reject non-X-rays like selfies or MRI; flag blurry/odd images) -> model inference -> calibration + uncertainty -> explainability -> comorbidity rules -> report (English, Tamil, Hindi, PDF).
FEATURE 1 Uncertainty quantification: calibrated per-finding probabilities (temperature scaling), confidence tiers with MEASURED precision, MC-dropout + test-time-augmentation spread, out-of-distribution detection, a spatial confidence/uncertainty map shown over the image, and a needs_human_review flag.
FEATURE 2 Explainable AI: Grad-CAM++ heatmap validated against real NIH bounding boxes, lung-zone mapping (left/right, upper/mid/lower), and a rationale chain generated from the real model outputs (never invented text), plain-language explanation in 3 languages.
FEATURE 3 Longitudinal tracking: register two X-rays of the same body part taken at different dates, produce a difference map and calibrated measurements (fracture gap, bone density proxy), plus an EXPLORATORY healing-time estimate built from cited literature priors (no public outcome dataset exists, so it must always be labelled exploratory).
FEATURE 4 Comorbidity interactions: a rules engine over detected findings that emits only statements with a citation and the exact reported quantity; every rule has review_status (draft until a clinician signs off) and a triage level.
FEATURE 5 Bone health screening: an EXPERIMENTAL knee classifier (normal/osteopenia/osteoporosis). Vitamin D / protein / sarcopenia flags are DISABLED because no validated data exists.
MODELS (all trained locally on an RTX 5050 laptop, free datasets only): DenseNet121 chest 14-label model (NIH ChestX-ray14 subset), U-Net lung segmentation (Montgomery/Shenzhen masks), fracture classifier (FracAtlas), knee bone-health classifier (Osteoporosis Knee dataset), TB classifier (Shenzhen/Montgomery, experimental), quality-gate classifier (X-ray vs MRI vs natural photo).
STACK: Python 3.11 + uv, FastAPI, PyTorch (CUDA 12.8 build), SQLite via SQLAlchemy, OpenCV; React + TypeScript + Vite + Tailwind frontend with a patient/health-worker view and a doctor dashboard; JWT auth with roles; config in .env and config/*.yaml.
NON-GOALS (roadmap only): federated learning, offline PWA sync, FHIR/ABDM export, GNN, regulatory approval.
SAFETY: every output carries "Decision support only. Not a diagnosis. Requires clinician review." Low confidence, OOD or poor quality => needs_human_review=true.

=== B. WRITE docs/ARCHITECTURE.md ===
Describe the above as modules with a mermaid diagram: backend/app/{api,core,db,schemas,services/{ingest,gate,inference,calibration,explain,lungseg,rules,longitudinal,report,i18n}}, ml/{data,train,eval}, models/, config/, data/{raw,processed,demo}, frontend/, scripts/, docs/. List API endpoints you plan: POST /auth/login, POST /studies (upload), GET /studies/{id}, GET /studies/{id}/result, GET /studies/{id}/heatmap.png, GET /studies/{id}/uncertainty.png, POST /studies/{id}/compare/{other_id}, GET /studies/{id}/report.pdf, GET /health, GET /models/status.

=== C. RULES. Write docs/AGENT_RULES.md with these numbered rules, then copy it to AGENTS.md (Antigravity), GEMINI.md, .cursor/rules/project.mdc (with alwaysApply: true frontmatter) and .github/copilot-instructions.md. Before writing each tool's file, check the tool's current official docs for the rules-file location and adjust if it differs (note findings in docs/TOOLING_NOTES.md). Write a script scripts/sync_rules.py that does the copy. ===
R1 No mock, placeholder, fake, sample or hardcoded data in product code. No lorem ipsum. No random.* or numpy.random generating results. No static JSON standing in for an API. No hardcoded users, passwords, diagnoses.
R2 If a dataset, model file, credential or decision is missing: STOP and print a block starting with "MANUAL ACTION REQUIRED:" giving the exact link, file name and target folder. Never fabricate a substitute.
R3 All URLs, ports, keys, paths, thresholds and medical constants come from .env or config/*.yaml validated by pydantic-settings. Any medical constant needs a `source` (DOI, guideline or calibration artifact id) and a `review_status`.
R4 Model endpoints return HTTP 503 with code model_not_available if weights are missing. Never placeholder predictions.
R5 Every step ends with: run tests, start the real services, verify the feature live (browser or HTTP), update docs/STATUS.md, then run `python scripts/push_step.py <N> "<message>"`.
R6 Wording is decision support, never a definitive diagnosis. Low-confidence, OOD or poor-quality cases set needs_human_review=true.
R7 Code must run on Windows, macOS and Linux: use pathlib, provide Python scripts (or both .ps1 and .sh), never bash-only.
R8 Never commit secrets, patient data, datasets or weights. Use models/registry.json (hashes + metrics) for weights.
R9 Write tests with each feature. Use real images from the held-out test split in tests.
R10 Typed Python (type hints, ruff clean) and strict TypeScript. Structured logs; never log patient identifiers or image contents.
R11 When unsure of a library's current API, read its official docs (browse) before coding. Record version choices in docs/DECISIONS.md.
R12 Update docs/STATUS.md and docs/DATA_REGISTRY.md whenever project state or data changes.

=== D. REPO + TOOLCHAIN ===
1. Create the layout from docs/ARCHITECTURE.md (add .gitkeep where a folder would be empty). .gitignore MUST exclude: data/, models/*.pt, models/*.pth, models/*.onnx, models/checkpoints/, .env, .env.*, !.env.example, .venv, node_modules, __pycache__, dist, *.dcm, kaggle.json, logs/, storage/.
2. Python 3.11 venv with uv (pyproject.toml). Install PyTorch and torchvision for CUDA 12.8 from https://download.pytorch.org/whl/cu128. If you see "no kernel image" or sm_120 unsupported, try the newest stable or nightly cu128/cu129 build until it works and record the final versions in docs/DECISIONS.md. Install also: fastapi, uvicorn[standard], pydantic, pydantic-settings, sqlalchemy, python-jose, passlib[bcrypt], python-multipart, numpy, pandas, scikit-learn, scipy, opencv-python-headless, pillow, pydicom, grad-cam (pytorch-grad-cam), segmentation-models-pytorch, timm, pyyaml, reportlab, matplotlib, pytest, httpx, ruff, kaggle.
3. Frontend: pnpm + Vite React TypeScript in frontend/ with Tailwind (empty shell is fine now; Step 16 builds it).
4. Create .env.example listing every variable that will be needed (API_PORT, WEB_PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRE_MINUTES, MODEL_DIR, DATA_DIR, STORAGE_DIR, DEVICE, LOG_LEVEL, CORS_ORIGINS). Create .env from it, generating a strong random JWT_SECRET with `secrets.token_urlsafe(48)` at setup time (this is key generation, not fake data).
5. scripts/check_gpu.py: print torch version, CUDA version, GPU name, compute capability, total/free VRAM; run a 4096x4096 half-precision matmul on the GPU, print elapsed time; run one tiny forward+backward pass of torchvision densenet121 in autocast at batch 8, 224x224, print peak VRAM; exit non-zero if CUDA is unavailable.
6. scripts/push_step.py <N> "<message>": (a) run ruff and pytest (if tests exist), fail on error; (b) refuse if git sees any file over 50 MB or anything under data/ or models/ (except models/registry.json) staged; (c) `git add -A`, commit "step<N>: <message>"; (d) tag step<N> (move it with -f if it exists and say so); (e) push branch and tags; (f) print the commit URL and write the sha into the docs/STATUS.md row.
7. scripts/tasks.py cross-platform runner with commands: check, api, web, test, lint.
8. docs/STATUS.md: a table of all 23 steps (use the step index at the bottom of this message) with columns step, title, status, date, sha, notes. docs/DECISIONS.md and docs/DATA_REGISTRY.md (columns: dataset, source URL, license, local path, size, used for).
9. README.md: purpose, safety disclaimer, architecture diagram, how to run.
10. Git: default branch main; check `git remote -v`. If no origin is set, STOP with MANUAL ACTION REQUIRED and ask me for the URL.

Do not write application code yet.

STEP INDEX: 1 Bootstrap; 2 NIH chest data; 3 Other datasets, gate negatives, manifests, cache; 4 Backend skeleton + auth; 5 Train chest model; 6 Ingestion + quality gate; 7 Calibration + uncertainty; 8 Lung segmentation + zones; 9 Explainability; 10 Fracture/knee/TB models; 11 Comorbidity research; 12 Comorbidity engine; 13 Longitudinal engine; 14 Healing priors + exploratory predictor; 15 Orchestrator + API; 16 Frontend foundation; 17 Doctor dashboard + compare; 18 Languages + PDF; 19 Cursor UI polish; 20 ML acceptance evaluation; 21 Live browser end-to-end tests; 22 Anti-fake audit + review; 23 Final acceptance + release.
```

### Live verification (the agent does this)
- `python scripts/check_gpu.py` passes and prints **your GPU name** and a matmul time.
- `ruff check .` passes; the five rules files are identical in content.
- It prints the repo tree and `git remote -v`.

### Push
`python scripts/push_step.py 1 "bootstrap, brief, rules, gpu check, push tool"`

---

## STEP 2 — NIH ChestX-ray14: download and patient-wise split

**IDE: Antigravity | Model: Gemini 3.1 Pro (High)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** 30 min of your attention (the download itself runs much longer)
**Goal:** Real chest X-rays plus labels on disk, with a leak-free split.

### Your manual actions (do these BEFORE pasting the prompt)

1. Go to the official NIH Box folder: **https://nihcc.app.box.com/v/ChestXray-NIHCC**
2. Download these into **`data/raw/nih_chestxray14/`**:
   - `Data_Entry_2017_v2020.csv` (labels; the file name may be `Data_Entry_2017.csv`)
   - `BBox_List_2017.csv` (real bounding boxes, used to validate heatmaps in Step 9)
   - `train_val_list.txt` and `test_list.txt` (the official patient-wise split)
   - **`images/` archives `images_001.tar.gz` through `images_004.tar.gz`** (roughly 12–16 GB, about 20k–40k images; more archives are fine if your disk and time allow). Put the archives in `data/raw/nih_chestxray14/archives/`.
3. Alternative if Box is too slow: Kaggle https://www.kaggle.com/datasets/nih-chest-xrays/data. The images live in folders `images_001` ... `images_012`; download the whole dataset only if you have the disk, otherwise use Box.
4. Do not extract anything yourself; the agent does it.

### PROMPT

```text
Read AGENTS.md and docs/PROJECT_SPEC.md. Build the NIH ChestX-ray14 data pipeline. Never generate or synthesize images (R1).

1. Check data/raw/nih_chestxray14/ for: the labels CSV, BBox_List_2017.csv, train_val_list.txt, test_list.txt and at least one images_*.tar.gz in archives/. If anything is missing print a MANUAL ACTION REQUIRED block with the URL https://nihcc.app.box.com/v/ChestXray-NIHCC and the target folder, then stop.
2. Write ml/data/extract_nih.py that safely extracts every archive present into data/raw/nih_chestxray14/images/ (guard against path traversal, skip files that already exist, print progress and the total image count).
3. Write ml/data/prepare_chest.py:
   - Load the labels CSV. The 14 labels (put them in config/chest_labels.yaml, do not hardcode in code): Atelectasis, Cardiomegaly, Effusion, Infiltration, Mass, Nodule, Pneumonia, Pneumothorax, Consolidation, Edema, Emphysema, Fibrosis, Pleural_Thickening, Hernia. "No Finding" means all zeros.
   - Keep ONLY rows whose image file actually exists on disk.
   - Build the split from the official lists: test = test_list.txt. From train_val_list.txt, hold out 12% of PATIENTS (by Patient ID, fixed seed from config) as validation. The split must be by patient. Assert zero patient overlap across train/val/test and print the assertion result.
   - Write data/processed/chest_manifest.csv with columns: image_path, patient_id, age, sex, view_position, 14 binary label columns, split.
   - Write docs/chest_dataset_report.md containing: counts per split (images and patients), per-label prevalence in train vs val vs test as a table, view-position distribution, and the number of images that have real bounding boxes.
4. Append the dataset to docs/DATA_REGISTRY.md (URL, license "NIH Clinical Center open data, see the dataset's terms", local path, size, date).
5. Write tests/test_chest_manifest.py: asserts no patient overlap, all 14 label columns are binary, every image_path exists, and split sizes are non-zero.

Live verification (show me real output):
- Print the split counts and the prevalence table.
- Save docs/chest_sample_grid.png: 8 real training images with their label names, then open and show it to me.
- Run pytest tests/test_chest_manifest.py and show it passing.
```

### Push
`python scripts/push_step.py 2 "NIH chestxray14 extract, patient-wise manifest, report"`

---

## STEP 3 — Other datasets, gate negatives, manifests and the fast image cache

**IDE: Antigravity | Model: Gemini 3.1 Pro (High)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 45 min
**Goal:** Fracture, knee, TB, lung-mask and gate-negative data ready, plus a pre-resized cache that makes training fast.

### Your manual actions

1. **TB + lung masks:** https://www.kaggle.com/datasets/nikhilpandey360/chest-xray-masks-and-labels → download → unzip into **`data/raw/lung_masks_tb/`** (it should contain the Shenzhen and Montgomery images and masks). CLI alternative: `kaggle datasets download -d nikhilpandey360/chest-xray-masks-and-labels -p data/raw/lung_masks_tb --unzip`
2. **Fracture (FracAtlas):** https://figshare.com/articles/dataset/The_dataset/22363012 → download the dataset zip → unzip into **`data/raw/fracatlas/`** (look for the image folders `Fractured` / `Non_fractured` and an annotations folder).
3. **Knee bone health:** https://www.kaggle.com/datasets/stevepython/osteoporosis-knee-xray-dataset → unzip into **`data/raw/knee_osteoporosis/`**.
4. **Gate negative 1, brain MRI:** https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset → unzip into **`data/raw/brain_mri/`**.
5. Gate negative 2 (natural photos) is downloaded by the agent automatically.
6. If you took phone photos (Section 2, item 6), they are in `data/raw/phone_photos/`.

### PROMPT

```text
Read AGENTS.md and docs/PROJECT_SPEC.md. Prepare all remaining datasets and the training cache. Never synthesize images (R1). For every dataset that is missing print a MANUAL ACTION REQUIRED block (link + target folder) and continue with the rest.

1. Inspect the real folder structure of each dataset under data/raw/ (lung_masks_tb, fracatlas, knee_osteoporosis, brain_mri) and write what you found to docs/DATA_REGISTRY.md (URL, license, counts, class names, whether patient ids exist). Do not assume folder names; discover them.
2. Write ml/data/prepare_lung.py -> data/processed/lung_manifest.csv (image, mask, source Montgomery or Shenzhen, split). Combine the two mask sets if the Shenzhen masks exist; split 70/15/15 with a fixed seed from config.
3. Write ml/data/prepare_tb.py -> data/processed/tb_manifest.csv (image, label tb/normal, source, split). Keep splits within each source dataset and report per-source metrics later (to avoid the model learning "which hospital").
4. Write ml/data/prepare_fracture.py -> data/processed/fracture_manifest.csv (image, label fractured/non_fractured, body_part if available, bbox/mask path if available, split). If FracAtlas has patient ids or similar grouping, split by group; otherwise split by image and state this limitation in the registry.
5. Write ml/data/prepare_knee.py -> data/processed/knee_manifest.csv (image, 3-class label, split). If there are no patient ids say so as a limitation. Class counts and imbalance must be printed.
6. Write ml/data/prepare_gate.py: build the gate dataset with 3 classes. xray = a random sample of real images from chest, fracture, knee manifests (train/val/test taken from their own splits); mri = brain MRI images; natural = torchvision.datasets.OxfordIIITPet (download it into data/raw/oxford_pets) plus the phone photos folder if present (label it separately as phone_photo_xray ONLY if I told you they are X-ray photos; otherwise ignore the folder). Balance classes; write data/processed/gate_manifest.csv.
7. Write ml/data/build_cache.py: for every manifest, resize each image once to 224x224 grayscale (for chest keep aspect ratio with padding, not stretching) and store as uint8 .npy shards or a single memmap per split under data/cache/, with an index file mapping image_path -> row. Use multiprocessing with workers from config. This removes PNG decoding from the training loop. Print the speed-up by timing 500 random reads from the raw PNGs versus the cache.
8. Write ml/data/datasets.py: PyTorch Datasets reading from the cache, with train-only augmentation (rotation <= 10 degrees, brightness/contrast jitter, small translation; NO horizontal flips for chest since heart side matters; flips allowed for knee/fracture only if config says so). Augmentation parameters live in config/augment.yaml.
9. Tests: tests/test_manifests.py for each manifest (non-empty splits, files exist, no group overlap where ids exist).
10. Update docs/DATA_REGISTRY.md and docs/STATUS.md.

Live verification (show me real output):
- A table: dataset, images per split, class balance.
- docs/fracture_grid.png, docs/knee_grid.png, docs/gate_grid.png: 8 real images each with labels, open them and show me.
- The cache speed test result and one DataLoader batch loaded onto the GPU (print tensor shape, dtype, seconds).
- pytest passes.
```

### Push
`python scripts/push_step.py 3 "all datasets prepared, manifests, fast cache"`

---

## STEP 4 — Backend skeleton: config, database, auth, model status

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)**
**Fallback:** Gemini 3.1 Pro (High) · **Time:** about 1 h
**Goal:** A running FastAPI server with typed settings, a real database, real authentication, audit trail, and a model-status endpoint that reports which models are missing.

### Your manual actions
- None. (You will choose your own admin email and password when the script asks. Nothing is hardcoded.)

### PROMPT

```text
Read AGENTS.md, docs/PROJECT_SPEC.md, docs/ARCHITECTURE.md. Build the backend skeleton in backend/app/. Follow R1-R12.

1. core/config.py: pydantic-settings Settings reading .env, plus a loader for config/*.yaml validated by pydantic models (thresholds, model paths, language packs, label lists). Missing or invalid config must raise a clear error at startup.
2. db/: SQLAlchemy 2.x models and session handling for SQLite at DATABASE_URL: User(id, email unique, password_hash, role in {health_worker, doctor, admin}, full_name, created_at), Patient(id, external_ref, age, sex, created_at) (no names or phone numbers), Study(id, patient_id, uploaded_by, body_part in {chest, bone, knee, unknown}, modality_hint, image_path, original_filename, sha256, quality_json, status in {uploaded, rejected, processing, done, failed}, created_at), Result(id, study_id, model_versions_json, findings_json, uncertainty_json, explanation_json, interactions_json, needs_human_review bool, review_reasons_json, created_at), Comparison(id, study_a, study_b, result_json, created_at), Review(id, study_id, doctor_id, decision, notes, created_at), AuditLog(id, user_id, action, entity, entity_id, ip, created_at).
   Use a tiny migration approach (alembic) so the schema is reproducible.
3. Auth: POST /auth/login (email+password -> JWT with expiry from config), password hashing with bcrypt, a dependency that checks the JWT and role. Role rules: health_worker can create studies and view their own; doctor can view all, compare, and write Reviews; admin manages users.
4. scripts/create_user.py: an interactive CLI that asks for email, full name, role and password (using getpass), then creates the user. There must be NO default user and NO seed password anywhere in the repo.
5. api/health.py: GET /health (db reachable, version) and GET /models/status that checks every expected weight file listed in config/models.yaml against models/registry.json (exists, sha256 matches) and returns per-model status "available" or "missing". At this point most will be missing; that is correct and must be reported, not hidden.
6. Standard error format {error:{code,message}}, request-id middleware, CORS from config, structured JSON logging that never prints patient identifiers or image bytes, audit log writes for login and study access.
7. Tests (backend/tests): login success/failure, role enforcement, /models/status reports missing models honestly, no endpoint works without a token. Use a real temporary SQLite file, not mocks.

Live verification (the agent runs the real server and shows output):
- Start the server (python scripts/tasks.py api). Use curl or the Antigravity browser tool to open http://localhost:<API_PORT>/docs and show that the endpoints exist.
- Run scripts/create_user.py with me (ask me for the values), then log in via /auth/login and show a token being issued, then call GET /models/status with the token and show "missing" entries.
- Show that GET /models/status without a token returns 401.
- pytest passes; ruff passes.
```

### Push
`python scripts/push_step.py 4 "backend skeleton, db, auth, model status"`

---

# PART B — THE MODELS (Steps 5–10)

---

## STEP 5 — Train the chest model (14 findings), locally, in the background

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 40 min to write and smoke-test, then **1.5–3 h of background training**
**Goal:** A real DenseNet121 trained on your NIH subset, with honest held-out metrics.

### Your manual actions
- Plug in the laptop, set the power plan to **High performance**, and disable sleep while training (a sleeping laptop stops the run).
- Close games and other GPU apps.

### PROMPT

```text
Read AGENTS.md, docs/PROJECT_SPEC.md, docs/chest_dataset_report.md. Write the chest model training pipeline in ml/train/ and run it. Everything tunable lives in config/train_chest.yaml (R3).

MODEL: torchvision densenet121 with ImageNet weights, input 3x224x224 (replicate the grayscale channel), classifier replaced by Dropout(p from config, default 0.3) + Linear(1024 -> 14). The dropout layer is REQUIRED because Step 7 uses it for MC-dropout. Expose a method to return penultimate features (1024-d pooled) for out-of-distribution detection in Step 7.
TRAINING: BCEWithLogitsLoss with per-label pos_weight computed from the TRAIN split prevalence; AdamW (lr, weight decay from config), cosine schedule with warmup, mixed precision (torch.autocast bfloat16 or float16 with GradScaler, whichever the GPU supports best), channels_last, batch size from config (start at 32; if CUDA out-of-memory use 16 with gradient accumulation to keep the effective batch), num_workers from config (on Windows use persistent_workers). Train on the cache from Step 3 (data/cache). Early stopping on validation mean AUROC (patience from config). Save the best checkpoint plus a rolling "last" checkpoint EVERY epoch with optimizer state so training can resume (--resume flag).
BEFORE the full run, do two real checks and show me the output: (1) overfit test: train 200 steps on a tiny real subset of 64 images and show the loss drops near zero; (2) a 1-epoch smoke run on 10% of the data, printing seconds per epoch and peak VRAM. Use them to set batch size and estimate the ETA for the full run.
FULL RUN: follow Reusable Prompt D (detached background process, log file in logs/chest_train.log, checkpoint every epoch). Report seconds per epoch and the total ETA in the chat, then continue to answer my questions while it trains. Do not start any other GPU job until it ends.
WHEN IT FINISHES (or when I ask you to evaluate the best checkpoint so far): write ml/eval/eval_chest.py that loads the best checkpoint and computes on VAL and on the official TEST split: per-label AUROC with 95% bootstrap confidence intervals (1000 resamples), mean AUROC, per-label AUPRC, and prevalence. Save reports/chest_metrics.json and reports/chest_metrics.md and a ROC figure. Register weights in models/registry.json: name, path, sha256, git commit, config hash, metrics file, training date. Weights stay out of git (R8). Also write models/chest_densenet121/DONE (empty marker file) so later steps know training ended.
Do NOT report any number you did not compute. If mean test AUROC is low, say so plainly and list likely causes; do not change the test set to make it look better.

Live verification (show real output): the overfit check, the smoke run timings, the first two epochs of the real log (tail logs/chest_train.log), and nvidia-smi showing the process using the GPU. Update docs/STATUS.md.
```

### Push (do it when training has started and the code is committed; metrics are pushed again in Step 7)
`python scripts/push_step.py 5 "chest model training pipeline, run started"`

> While this trains, continue with Step 6. When it finishes, ask the same agent: *"Evaluate the best checkpoint now (eval_chest.py), register the weights and show me the metrics table"*, then push again with message `chest model metrics and registry`.

---

## STEP 6 — Ingestion (DICOM and phone photos) and the quality gate

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)**
**Fallback:** Gemini 3.1 Pro (High) · **Time:** about 1 h
**Goal:** Anything uploaded is validated, normalised and checked; non-X-rays and poor images are rejected or flagged using real learned/measured criteria.

### Your manual actions
- None. (Start this step while Step 5 trains. The agent writes code first and trains the small gate model only after `models/chest_densenet121/DONE` exists, because the GPU is busy.)

### PROMPT

```text
Read AGENTS.md and docs/ARCHITECTURE.md. Build backend/app/services/ingest and backend/app/services/gate. Follow R1-R12.

INGEST (ingest/):
- Accept DICOM (.dcm), PNG, JPEG. Validate by magic bytes, not by file extension. Enforce a max size and max pixel count from config. Compute sha256 for de-duplication.
- DICOM: use pydicom; apply RescaleSlope/Intercept and VOI LUT when present; handle MONOCHROME1 by inverting; read PixelSpacing if present (needed for mm measurements in Step 13) and store it; strip ALL patient-identifying DICOM tags before saving anything; never log tag values.
- Photos: apply EXIF orientation, convert to grayscale; store original and a normalised 8-bit PNG under STORAGE_DIR/<study_id>/ (path from config).
- Remove EXIF/GPS from stored images.
GATE (gate/):
1. Handcrafted quality checks computed on the image: blur (variance of Laplacian), exposure (fraction of pixels clipped at the extremes, mean intensity), resolution, grayscale-ness (colour saturation), and moire/screen-photo hints (strong periodic high-frequency energy). The numeric thresholds MUST NOT be invented: write ml/eval/calibrate_quality.py that computes these metrics over the real X-ray train images in the manifests and over the real negative images, saves the distributions, and sets each threshold at a data-driven percentile (percentiles from config, e.g. 1st/99th of real X-rays). Store the result in config/quality_thresholds.yaml with source "calibrated on <dataset, n images, date>".
2. A learned classifier: fine-tune torchvision mobilenet_v3_small or resnet18 (ImageNet weights) on data/processed/gate_manifest.csv for 3 classes (xray / mri / natural). Config in config/train_gate.yaml. IMPORTANT: wait for models/chest_densenet121/DONE before training because the GPU is busy; if the file does not exist yet, write all the code and tests first, then print "WAITING FOR CHEST TRAINING" and tell me to resume this step later (do not train concurrently). Training takes minutes. Evaluate on the held-out gate test split: accuracy, per-class recall, confusion matrix. Register in models/registry.json.
3. GateDecision output: {is_xray: bool, body_part_guess: chest|bone|knee|unknown (from a simple learned head or from the manifest-trained classifier if you can add it cheaply; otherwise "unknown" and the user chooses), quality: {blur, exposure, resolution, flags:[...]}, action: accept | accept_with_warning | reject, reasons:[...]}. Rejects: not an X-ray (class mri/natural with confidence above the config threshold), unreadable file. Warnings (needs_human_review=true later): blur/exposure/moire flags.
4. Tests (use REAL images): a real chest X-ray test image passes; a real brain MRI and a real natural photo are rejected; a real X-ray degraded by a known Gaussian blur (label it "test-only transformation") is flagged blurry; a corrupt file returns a clean 4xx error. If data/raw/phone_photos exists, report how the gate treats them.

Live verification (real output): the calibrated thresholds file, the gate confusion matrix, and a small script run that feeds 5 real X-rays, 5 real MRIs and 5 real natural photos through GateDecision and prints the table. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 6 "ingestion and quality gate with calibrated thresholds"`

---

## STEP 7 — Calibration and uncertainty quantification (Feature 1, numbers)

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 1 h 15 min
**Goal:** Probabilities you can trust, with measured evidence, plus uncertainty and out-of-distribution detection.

### Your manual actions
- Chest training from Step 5 must be finished and registered (check `models/registry.json` contains the chest model).

### PROMPT

```text
Read AGENTS.md, docs/PROJECT_SPEC.md, reports/chest_metrics.md. Implement Feature 1 numerically in backend/app/services/calibration and ml/eval/. All thresholds are data-derived and stored in config/uncertainty.yaml with a `source` and `review_status: draft` (R3). Write the code as a reusable library (it is reused for fracture, knee and TB models in Step 10).

1. TEMPERATURE SCALING: collect validation logits, fit one temperature per label by minimising negative log-likelihood (LBFGS or bounded search). Report Expected Calibration Error and Brier score per label BEFORE and AFTER on the held-out TEST split, and save reliability diagrams to reports/calibration/. Persist temperatures in models/chest_densenet121/calibration.json (with the sha of the checkpoint it belongs to).
2. MC-DROPOUT + TEST-TIME AUGMENTATION: put only the dropout layers in train mode at inference, run N stochastic passes (N from config; also time it: report latency on your GPU), combine with K mild deterministic augmentations (small rotations/scales/contrast from config). Output per label: calibrated mean probability, standard deviation, and a 95% interval. Verify with a real experiment that the spread is larger on poor-quality images (degrade real test images with known blur/noise, label this "test-only transformation") than on clean ones, and report the measured difference.
3. CONFIDENCE TIERS WITH MEASURED PRECISION: for each label choose thresholds on VALIDATION so that precision (PPV) on validation meets the target set in config (design decision, e.g. 0.80 for "high"), and a second threshold at Youden's J for "medium". Verify the achieved PPV of each tier on the TEST split and report it in reports/tier_ppv.md. If a label cannot reach the target, mark that label "unreliable" so the UI says so instead of showing a confident tier.
4. RULE-OUT THRESHOLD (conformal-style): for each label choose a low threshold using split conformal calibration so that at least (1 - alpha) of true positives on validation lie above it (alpha from config); below it the system may say "no evidence of X at this sensitivity", otherwise "cannot rule out". Verify the realised sensitivity on test.
5. OUT-OF-DISTRIBUTION: fit a Mahalanobis (or energy) score on the penultimate 1024-d features of the TRAIN set; set the OOD threshold at a validation percentile from config. Evaluate on the real gate-test negatives (brain MRI, natural photos) and on real X-rays of other body parts (fracture/knee images): report AUROC and detection rate at the chosen threshold in reports/ood.md.
6. needs_human_review POLICY (config/review_policy.yaml, every rule with a stated reason): true if OOD, image-quality warning from the gate, any positive finding in the low tier, spread (std) above the validation 90th percentile, or a label marked unreliable is the top finding.
7. Expose it as a single function analyse_chest(image) -> structured result (per-label p, std, interval, tier, rule-out status, ood score, review flag + reasons). If weights or calibration.json are missing raise ModelNotAvailable (becomes HTTP 503, R4).
8. Tests with real held-out images: calibrated ECE <= uncalibrated ECE on average; tiers match thresholds; OOD flags a real MRI; missing weights raise ModelNotAvailable.

Live verification (real output): the before/after ECE table, tier PPV table, OOD AUROC, MC-dropout latency, and analyse_chest() printed for 3 real test images (one clearly positive, one "No Finding", one degraded copy). Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 7 "calibration, mc-dropout, tiers, ood, review policy"`

---

## STEP 8 — Lung segmentation and zone mapping

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 45 min (training about 10–15 min)
**Goal:** Real lung masks so the rationale can say "right lower zone" instead of vague words.

### Your manual actions
- None (Step 3 downloaded the masks).

### PROMPT

```text
Read AGENTS.md. Implement lung segmentation in ml/train/train_lungseg.py and backend/app/services/lungseg.

1. Model: segmentation_models_pytorch Unet with a resnet34 encoder (ImageNet weights), 1 channel input handled correctly, output 1-channel mask, 256x256 input (resize in the dataset, restore after). Loss = BCE + Dice. Hyperparameters in config/train_lungseg.yaml. Use the lung_manifest from Step 3 and the cache or direct loading. Augmentations: mild rotation, scale, intensity only.
2. Train with a checkpoint every epoch and an early-stopping rule from config (it should take minutes; GPU must be free, check models/chest_densenet121/DONE). Report test Dice and IoU (with 95% bootstrap CI) separately for Montgomery and Shenzhen images in reports/lungseg_metrics.md. Register in models/registry.json.
3. Post-processing: keep the two largest connected components, fill holes, split into the two lungs by connected components (or by the image midline if they touch), and decide left/right using the standard PA convention (patient's right lung appears on the image's LEFT). Put the convention in config as a documented setting, since AP/portable films can differ, and add a manual override field for the doctor.
4. zones(mask) -> for each lung, the bounding region divided into upper/middle/lower thirds of the lung's vertical extent, returning a label for any (x, y) point: "right upper zone", "left lower zone", etc., or "outside lung fields". Also provide lung-area asymmetry (a plain geometric measurement, no medical claim).
5. Check on NIH chest images (no ground truth masks): run the segmentation on 200 random NIH TEST images and report the fraction whose masks are plausible by objective criteria (two components found, area within the 1st-99th percentile of the labelled Montgomery/Shenzhen masks). Save an 8-image overlay grid to docs/lungseg_nih_grid.png and show it to me; I will eyeball it.
6. Tests with real images: Dice above the threshold in config, zone lookup returns expected zones for synthetic points inside a real mask (point positions are test inputs, not product data).

Live verification (real output): metrics table, the overlay grid image, and zones() output for two real NIH images. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 8 "lung segmentation and zone mapping"`

---

## STEP 9 — Explainability: Grad-CAM++, spatial uncertainty, rationale chains (Feature 2)

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 1 h 15 min
**Goal:** Heatmaps that are validated against real doctor-drawn boxes, an uncertainty map, and rationale text built only from real outputs.

### Your manual actions
- None.

### PROMPT

```text
Read AGENTS.md, docs/PROJECT_SPEC.md. Build backend/app/services/explain and ml/eval/eval_explain.py.

1. GRAD-CAM++: use pytorch-grad-cam on the chest DenseNet's last feature block for any requested label. Return a normalised heatmap at original image resolution and write overlays (PNG, colormap from config) to STORAGE_DIR/<study_id>/heatmap_<label>.png. Heatmaps are computed only for labels in the medium/high tier or the top-3 by probability (config).
2. VALIDATION AGAINST REAL BOXES: data/raw/nih_chestxray14/BBox_List_2017.csv has real radiologist-drawn boxes for 8 findings. On every TEST image that has a box and a ground-truth positive label, compute: pointing-game hit rate (peak of the heatmap inside the box), IoU of the thresholded heatmap vs the box (threshold from config; also report the best threshold sweep), and per-label counts. Save reports/explain_validation.md with a table and 95% confidence intervals. Report honestly if localisation is weak for some labels, and mark those labels "heatmap_unreliable" in config/uncertainty.yaml so the UI shows a warning.
3. FAITHFULNESS (deletion test): mask the top-k% most salient pixels (k values from config) and measure the drop in the calibrated probability; compare with masking k% random pixels (the random baseline is a statistical control, computed with a fixed seed, not a product value). Report the mean drops.
4. SPATIAL UNCERTAINTY MAP: compute Grad-CAM++ across the N MC-dropout/TTA passes from Step 7 and produce a per-pixel standard deviation map (normalised), saved as STORAGE_DIR/<study_id>/uncertainty_<label>.png. The API also returns the raw 2D array downsampled to 64x64 as JSON so the frontend can show the value on hover. Verify with real images that the uncertainty is higher on a degraded copy (test-only transformation) than on the clean image.
5. RATIONALE CHAIN generator (services/explain/rationale.py): a deterministic template engine, NOT free text generation and NOT an LLM. For each reported finding it fills a template from config/i18n/<lang>/rationale.yaml with: the finding name, calibrated probability and interval, confidence tier, the zone where the heatmap peak (inside the lung mask from Step 8) lies, whether the heatmap was validated for that label, quality warnings from the gate, OOD status, and whether human review is needed. Example shape (the numbers come from real outputs, never typed in): "Possible right pleural effusion (calibrated probability 0.71, 95% interval 0.62-0.79, medium confidence). Model attention concentrated in the right lower zone. Image quality: acceptable. Decision support only; clinician review required." Wording must never state a diagnosis. Provide English now; Tamil and Hindi packs are added in Step 18 (code must already take the language as a parameter, and fall back to English with a visible flag).
6. Tests with real held-out images: heatmap shape equals image shape; peak zone is returned; rationale text contains the exact numeric values from the result object (parse and compare); no output contains forbidden phrases from config/forbidden_phrases.yaml (e.g. "diagnosis is", "you have", "definitely").

Live verification (real output): the validation table, the deletion-test table, and for 3 real test images (one with a real NIH box) save and open the original, heatmap overlay, uncertainty map, and print the rationale text. Show me the images. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 9 "gradcam++, spatial uncertainty, rationale chains, validation"`

---

## STEP 10 — Fracture, knee bone-health and TB models

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 1 h 15 min (training runs 45–90 min in the background)
**Goal:** Three more real models, each with honest metrics and the same calibration/uncertainty machinery.

### Your manual actions
- Keep the laptop plugged in; the agent queues the three trainings back to back.

### PROMPT

```text
Read AGENTS.md and the manifests from Step 3. Train three models and wire each into the Step 7 calibration/uncertainty library and the Step 9 explainability library. Hyperparameters live in config/train_<name>.yaml. Use Reusable Prompt D (one background queue running the three trainings sequentially, logs in logs/, checkpoint every epoch, resume supported). Report seconds per epoch for each.

A. FRACTURE (FracAtlas): binary fractured/non_fractured with a pretrained timm or torchvision backbone (e.g. efficientnet_b0 or resnet50; pick one and record why in docs/DECISIONS.md), 224 px, dropout in the head for MC-dropout, class weighting, early stopping on validation AUROC. Evaluate on TEST: AUROC, AUPRC, sensitivity/specificity at the validation-chosen threshold, all with 95% bootstrap CI, and per body part if the labels allow. If FracAtlas provides boxes or masks, validate Grad-CAM++ against them (pointing game, IoU) like Step 9.
B. KNEE BONE HEALTH (EXPERIMENTAL): 3-class normal/osteopenia/osteoporosis. The dataset is small, so use strong augmentation, class-balanced loss or sampling, a smaller learning rate, and report plainly: per-class recall, confusion matrix, macro-F1 with bootstrap CI, and a statement of the data size and its limitation. The config marks this model status "experimental"; the API and UI must always show the word "experimental". Do NOT implement vitamin D, protein or sarcopenia outputs: put a config flag nutrition_flags_enabled: false with the reason "no validated public dataset", and the code must refuse to emit them.
C. TB (EXPERIMENTAL): binary tb/normal on the Shenzhen+Montgomery set, with metrics reported separately per source and a note about domain shift. Status "experimental". It is run only on chest images and shown as a separate screening note, not mixed into the 14-label output.
FOR EACH MODEL: temperature scaling on val; tier thresholds and OOD as in Step 7; save weights, calibration.json, metrics JSON/MD in reports/; register in models/registry.json; add the model to config/models.yaml with status (validated-on-test | experimental).
Provide a unified model registry/loader backend/app/services/inference/registry.py with lazy loading, GPU memory management (load on demand, keep at most a configured number resident), and ModelNotAvailable -> HTTP 503 (R4).
Tests: each model gives a probability on a real held-out image and raises ModelNotAvailable when its weights file is temporarily renamed.

Live verification (real output): final metric tables for all three models, a confusion matrix image for the knee model, and /models/status (start the API) showing every model "available" with its sha256. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 10 "fracture, knee bone-health, tb models and unified registry"`

---

# PART C — CLINICAL LOGIC AND THE API (Steps 11–15)

---

## STEP 11 — Comorbidity research: evidence-cited interaction rules (Feature 4, knowledge)

**IDE: Antigravity | Model: Gemini 3.1 Pro (High)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 45 min
**Goal:** A rules file where **every statement is backed by a real, verified citation and the exact number the paper reports**. No invented statistics.

### Your manual actions
- None before. **After** the step: open at least 5 of the DOI links in `config/comorbidity_rules.yaml` and confirm they match the claim (this is on your final checklist).

### PROMPT

```text
Read AGENTS.md and docs/PROJECT_SPEC.md. Use your browsing tool to research and write config/comorbidity_rules.yaml (Feature 4). Important background: the original spec contained loose claims such as "3x mortality"; do not copy any such number from memory. Use ONLY quantities you read in a source during this session.

SCOPE of rules: interactions between (a) findings the system can detect (the 14 NIH labels, TB-pattern screening, fracture, osteopenia/osteoporosis screen) and (b) optional patient history flags a health worker may tick: diabetes, HIV, smoker, hypertension, chronic kidney disease, COPD/asthma, prior TB, age >= 65, pregnancy. Aim for 10-15 rules covering clinically meaningful and common-in-India situations, for example: diabetes with TB-pattern findings; smoking with nodule/mass; cardiomegaly + effusion + edema (cardiac-failure-pattern); pneumothorax (urgent); consolidation/pneumonia in age >= 65 or with diabetes; fracture with osteopenia/osteoporosis pattern (fragility fracture, consider bone-density assessment); HIV with TB-pattern; COPD with emphysema.

For EACH rule write: id, title, trigger (a boolean expression over finding labels with minimum tier, and history flags), statement_template (neutral decision-support wording, never a diagnosis), quantity (the exact figure reported: e.g. "relative risk 3.0, 95% CI x-y, for developing active TB" including WHAT the number measures, the population and the study design), source (full citation, DOI, URL, access date, and the exact table/section where you found the number), evidence_quality (e.g. meta-analysis, cohort, guideline), triage_level (routine | soon | urgent, a design decision flagged as such), follow_up_suggestions (generic, for clinician), review_status: draft, and reviewed_by: null.
RULES OF EVIDENCE: (1) Verify every DOI resolves (open it) and that the paper actually reports the number you quote; (2) if you cannot verify a number, write the rule WITHOUT a number, with only a qualitative citation, or drop the rule; (3) never convert a risk of DEVELOPING a disease into a mortality figure; (4) for urgent findings (e.g. pneumothorax) cite a guideline or a review, not a single small study.
ALSO WRITE docs/RULES_REVIEW.md: a table of all rules with a checkbox column "clinician verified" and instructions for a doctor to review them, plus docs/RULES_VERIFICATION_LOG.md listing each DOI, the date you opened it, and the sentence/table you matched.
Validate the YAML with a pydantic schema (backend/app/schemas/rules.py) and a test that fails if any rule lacks a source, a DOI/URL, or review_status.

Live verification: print a table (rule id, trigger, quantity, DOI) for all rules and list any rule you dropped and why. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 11 "comorbidity rules with verified citations"`

---

## STEP 12 — Comorbidity engine, interaction graph and triage

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)**
**Fallback:** Gemini 3.1 Pro (High) · **Time:** about 45 min
**Goal:** Turn model outputs plus history flags into cited notes, a graph for the UI and a triage level.

### Your manual actions
- None.

### PROMPT

```text
Read AGENTS.md, config/comorbidity_rules.yaml, docs/RULES_REVIEW.md. Build backend/app/services/rules.

1. A safe expression evaluator for rule triggers (do NOT use eval or exec; parse the trigger structure from the YAML into a small AST: all_of, any_of, none_of, finding(label, min_tier), history(flag), age(op, value)). Unit-test it.
2. evaluate(analysis_result, history_flags, age) -> {interactions:[{rule_id, title, statement (filled from the template with the actual finding names/probabilities), quantity, source, evidence_quality, triage_level, review_status, needs_clinician_signoff: true while draft}], graph:{nodes:[findings and history flags with their tiers], edges:[rule links with rule_id]}, triage:{level, reasons:[rule ids or finding tiers]}}.
3. Triage aggregation: the final level is the highest among fired rules and any "urgent" finding policy in config/triage.yaml (design decisions, each with a rationale, review_status draft). A finding in the "unreliable" list never raises triage by itself; it raises needs_human_review.
4. Every interaction carries its citation. If a rule's source is missing, the engine refuses to emit it and logs an error (R3). While a rule is `draft`, the UI-facing statement must include the words "draft rule, not clinician-reviewed".
5. Tests using real analysis outputs from real held-out images (call the real analyse_chest) combined with explicit history flags (the flags are test inputs, not product data): TB-pattern + diabetes fires the diabetes rule; no flags fires no history rules; urgent finding yields urgent triage; a draft rule is labelled as draft.

Live verification (real output): run on 3 real test images with different history flags and print interactions, graph JSON, and triage. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 12 "comorbidity rules engine, graph, triage"`

---

## STEP 13 — Longitudinal engine: registration, difference maps, measurements (Feature 3, mechanics)

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 1 h 30 min
**Goal:** Two X-rays of the same body part are aligned, compared and measured, with the registration accuracy **measured**, not assumed.

### Your manual actions
- Optional but ideal: if a doctor friend can give you **two real X-rays of the same patient from different dates** (anonymised, with permission), put them in `data/raw/serial_cases/<case>/t0.png` and `t1.png`. If not, the step still works; the agent tests registration with test-only known transformations of real images and the demo uses a clearly labelled pair.

### PROMPT

```text
Read AGENTS.md and docs/PROJECT_SPEC.md. Implement backend/app/services/longitudinal. No public serial-fracture dataset exists, so correctness is proven by measured registration accuracy, never by invented follow-ups.

1. REGISTRATION: two-stage pipeline: (a) feature-based coarse alignment (ORB or SIFT + RANSAC, estimate similarity/affine), (b) intensity refinement with cv2.findTransformECC (affine, parameters from config), optionally (c) residual non-rigid refinement with dense optical flow (cv2.DISOpticalFlow) if it measurably improves the metric, decided by experiment and recorded in docs/DECISIONS.md. Before registering, normalise intensity (CLAHE and histogram matching to the reference, config parameters).
2. MEASURED ACCURACY (ml/eval/eval_registration.py): take real held-out test images (knee, bone, chest) and apply KNOWN transformations (rotations, translations, scale, small shear, plus brightness change) with a fixed seed; label these clearly as "test-only transformation". Register back and report target registration error in pixels (and in mm where pixel spacing is known) over a grid of control points: mean, median, 95th percentile, and failure rate (error above a config threshold). Also test mismatch detection: register two images of DIFFERENT patients and show that a similarity measure after registration (normalised cross-correlation or mutual information, threshold chosen from the distribution of correct pairs vs wrong pairs) flags "images may not show the same anatomy" instead of producing a comparison. Save reports/registration_metrics.md.
3. DIFFERENCE MAP: signed difference after registration inside the overlap mask only, with a diverging colormap PNG (new density = one colour, lost density = the other) and numeric stats; return a 64x64 downsample for hover values.
4. MEASUREMENTS: (a) mm per pixel comes from DICOM PixelSpacing or from a user calibration (two points + known distance) with the source recorded; if neither exists, results are labelled "uncalibrated (pixels)". (b) Doctor-defined ROI at the fracture site and a reference bone ROI: compute a normalised density proxy (ROI mean intensity divided by the reference ROI mean) at each timepoint and its change, plus the fraction of changed pixels above a config threshold. (c) Caliper: two clicked points -> distance in mm stored per timepoint (this is how the fracture gap trend is recorded). Everything is semi-automatic and documented as such. No automatic "gap width" claim.
5. Persist a Comparison with transform, similarity score, stats, ROI definitions, calibration source and file paths of the generated PNGs. Support more than two timepoints for one patient and body part: GET the series and a trend table.
6. Tests: registration error under the config threshold for known transformations on real images; wrong-patient pair flagged; difference map is zero (within tolerance) when an image is compared with itself; uncalibrated measurement labelled as pixels.

Live verification (real output): the registration metrics table, one before/after/difference panel saved to docs/longitudinal_demo.png (state clearly in the caption that it is a test-only transformation of a real image unless I supplied a real serial pair), and a measurement example. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 13 "longitudinal registration, difference maps, measurements"`

---

## STEP 14 — Healing priors research and the EXPLORATORY healing estimate

**IDE: Antigravity | Model: Gemini 3.1 Pro (High)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 45 min · *(cuttable if you are behind schedule)*
**Goal:** An honest, transparent, literature-based estimate. It is always labelled exploratory because no public outcome data exists.

### Your manual actions
- None. Later, open at least a few of the DOIs it lists (final checklist).

### PROMPT

```text
Read AGENTS.md and docs/PROJECT_SPEC.md. Use your browsing tool. Write config/healing_priors.yaml and backend/app/services/longitudinal/healing.py.

1. RESEARCH: find, open and read sources reporting typical radiographic union times for common fracture sites (for example distal radius, clavicle, tibial shaft, femoral shaft, scaphoid, metatarsal, humerus) and published modifiers (age, smoking, diabetes, open vs closed fracture, and others you can support), plus published definitions of delayed union and non-union. For each prior record: bone/site, reported time range or median with its definition of "union", population, study type, DOI, URL, access date, exact table/section. Do not use a number you did not read. If you cannot find a prior for a site, leave that site unsupported and say so.
2. MODEL: a transparent baseline-range-with-modifiers calculation (no machine learning). Output a RANGE (low-high weeks) never a single date, the list of priors used, and the sentence "Exploratory estimate from published averages; not validated on outcome data; not a prediction for this patient's recovery." The flag exploratory: true is hard-coded by design and cannot be switched off in code; a separate config key `validated_against_outcomes: false` explains why (no labelled serial-case dataset).
3. DELAYED-HEALING REVIEW FLAG: when elapsed time since injury exceeds the cited delayed-union threshold AND the measured normalised-density change from Step 13 is below a config value (state whether that value is cited or a draft design choice), set needs_human_review=true with the reasons. Never say "non-union" as a conclusion; say "pattern consistent with delayed healing; clinician review recommended".
4. OUTCOME CAPTURE: add DB table Outcome(id, patient_id, study_series_id, injury_date, union_confirmed_date, confirmed_by, method, created_at) and a service to record real clinician-confirmed outcomes. This is how a validation dataset will be built over time. Add a script ml/eval/eval_healing.py that, when at least a configured number of outcomes exist, computes the error of the estimate against real outcomes; otherwise it prints "not enough real outcomes to validate (n of N)". Never fake it.
5. Tests: unsupported site returns "no prior available" instead of a made-up number; output always contains exploratory: true; every prior has a DOI.

Live verification: run on one site with supported priors and one unsupported site; print the outputs and the priors table with DOIs. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 14 "healing priors with citations, exploratory estimate, outcome capture"`

---

## STEP 15 — Analysis orchestrator and the complete REST API

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)**
**Fallback:** Gemini 3.1 Pro (High) · **Time:** about 1 h 30 min
**Goal:** One upload runs the whole real pipeline and every result is retrievable over a typed API.

### Your manual actions
- None. (Make sure all models show "available" in `/models/status`.)

### PROMPT

```text
Read AGENTS.md and docs/ARCHITECTURE.md. Wire everything built so far into the backend. Follow R1-R12.

1. ORCHESTRATOR (services/pipeline.py): POST /studies (multipart: file; optional body_part chest|bone|knee; age, sex; history flags) -> save + ingest + gate (Step 6) -> if rejected return 422 with reasons and keep the audit trail; else queue the analysis. Routing: chest -> chest 14-label analysis (Step 7) + lung segmentation/zones (Step 8) + heatmaps and uncertainty maps (Step 9) + TB experimental screening (Step 10) + comorbidity rules (Step 12); bone -> fracture model (+ heatmap); knee -> knee bone-health (experimental label) (+ heatmap); unknown -> use the gate's body_part_guess if confident, otherwise return 422 asking the user to choose. Run analyses in a background worker with a single-GPU semaphore (limit from config) so concurrent uploads queue instead of crashing; the worker updates Study.status and stores a Result row. Warm the models at startup (config).
2. ENDPOINTS (all authenticated, typed with pydantic response models, OpenAPI documented): GET /studies (role-filtered, pagination), GET /studies/{id} (status + progress stages), GET /studies/{id}/events (Server-Sent Events: stage updates), GET /studies/{id}/result, GET /studies/{id}/image.png, GET /studies/{id}/heatmap/{label}.png, GET /studies/{id}/uncertainty/{label}.png, GET /studies/{id}/uncertainty/{label}/grid (64x64 JSON), POST /studies/{id}/compare/{other_id} (Step 13, with ROI and calibration parameters), GET /patients/{id}/series, POST /studies/{id}/review (doctor decision + notes), POST /outcomes (Step 14), GET /models/status. Result JSON includes: model versions and sha, findings with calibrated p/std/interval/tier/rule-out status/zone, ood, quality, rationale (English; other languages in Step 18), interactions/graph/triage, healing (only on comparisons), needs_human_review with reasons, disclaimer text from config, and model status badges (validated/experimental).
3. Errors: missing weights -> 503 model_not_available (R4); never return partial fake results. A failed analysis stores the error and sets status failed.
4. Security: size limit, content validation, authorisation checks on every study/patient (a health worker can only see their own), audit log entries for reads/writes, no PHI in logs, rate limit on login.
5. Performance report: run the real pipeline on 20 real test images (chest, bone, knee), record per-stage and end-to-end latency p50/p95 and peak VRAM into reports/latency.md. If p95 exceeds the config target, profile and fix the biggest bottleneck (e.g. fewer MC passes for the heatmap uncertainty), and record the accuracy/latency trade-off.
6. Tests with httpx against the running app and real images: upload chest -> poll -> result has all sections; upload MRI -> 422; unauthenticated -> 401; health worker cannot read another worker's study; temporarily rename a weight file -> 503; compare two studies -> result with stats.

Live verification (real output): start the API, run a script that logs in, uploads one real chest, one bone and one knee test image, streams the SSE events for one, and prints the final result JSON (trimmed). Open /docs in the Antigravity browser tool and take a screenshot. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 15 "orchestrator and full REST API"`

---

# PART D — THE FRONTEND (Steps 16–19)

---

## STEP 16 — Frontend foundation: login, upload, live result view (health-worker app)

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)**
**Fallback:** Gemini 3.1 Pro (High) · **Time:** about 1 h 45 min
**Goal:** A real, responsive web app talking to the real API. Every number on screen comes from the backend.

### Your manual actions
- None. (Use Chrome; the Antigravity browser tool needs it for the live checks.)

### PROMPT

```text
Read AGENTS.md, docs/PROJECT_SPEC.md and the OpenAPI schema at http://localhost:<API_PORT>/openapi.json (start the API first). Build frontend/ with React + TypeScript (strict) + Vite + Tailwind + React Router + TanStack Query. Generate a typed API client from the OpenAPI schema (openapi-typescript or similar) so types cannot drift from the backend. API URL and other settings come from Vite env variables (VITE_API_URL), never hardcoded.

DESIGN: clean, clinical, high-contrast, mobile-first (health workers use phones/tablets), large touch targets, a persistent footer "Decision support only. Not a diagnosis. Requires clinician review." (text comes from the API's disclaimer field).

SCREENS:
1. Login (email + password -> JWT stored in memory + refresh-safe storage, automatic logout on 401, role-based routing).
2. New study: choose body part (chest / bone / knee / let the system guess), optional age/sex, optional history checkboxes (diabetes, HIV, smoker, hypertension, CKD, COPD/asthma, prior TB, pregnancy), file picker with drag-and-drop and phone camera capture (`accept="image/*,.dcm"` and `capture`), client-side preview, upload progress, clear error messages for a rejected image (show the gate's reasons, for example "this looks like a brain MRI, not a chest X-ray").
3. Live progress: subscribe to the SSE events and show the pipeline stages (quality check, analysis, heatmap, uncertainty, rules) as they complete; handle reconnects.
4. Result page: image viewer with a toggle between Original, Heatmap overlay and Uncertainty map (opacity slider; hovering over the uncertainty map shows the numeric uncertainty from the 64x64 grid returned by the API); per-finding cards with calibrated probability, 95% interval, tier badge (high/medium/low/unreliable), rule-out status, zone; badges "validated" vs "EXPERIMENTAL" per model (knee and TB must show EXPERIMENTAL); a "Needs human review" banner with the exact reasons when true; the rationale chain text; the interaction notes with their citations (DOI links) and a visible "draft rule" tag; the triage level; TB experimental note. The 14-label list is sorted by probability with a "show all" expand.
5. History: list of studies with status and filters.
Do not render anything that is not in the API response. If the API returns 503 model_not_available show a clear "service unavailable: model missing" message. No placeholder cards, no demo data anywhere in the frontend (R1).

QUALITY: accessible (labels, contrast, keyboard), loading and empty and error states for every screen, responsive down to 360 px width. Write Vitest + Testing Library tests for the main components (they use the typed client against the real API running locally, or a recorded real response saved from the API; NOT hand-written fake JSON).

Live verification (the agent uses the Antigravity browser tool against the running frontend + API and shows screenshots):
- Log in with the user I created in Step 4 (ask me for the credentials; do not store them in any file).
- Upload a real chest X-ray from data/ (a TEST-split image) and watch the live progress; screenshot the result page in Original/Heatmap/Uncertainty modes; hover over the uncertainty map and show the tooltip value.
- Upload a real brain MRI and show the rejection message. Resize the browser to 390 px width and screenshot again.
Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 16 "frontend foundation, upload, live results"`

---

## STEP 17 — Doctor dashboard, longitudinal comparison and bone-health views

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)**
**Fallback:** Gemini 3.1 Pro (High) · **Time:** about 1 h 30 min
**Goal:** The doctor's tools: review queue, sign-off, comparison with calibration and ROI, interaction graph.

### Your manual actions
- Create a **doctor** account: `python scripts/create_user.py` (role doctor).

### PROMPT

```text
Read AGENTS.md and the existing frontend. Extend frontend/ with doctor features (role-gated routes).

1. REVIEW QUEUE: a table of studies sorted by triage level then by needs_human_review, with filters (status, body part, tier, date), search, and pagination from the API.
2. STUDY REVIEW: everything the health worker sees, plus: side-by-side image + heatmap viewer with synchronised zoom/pan, the full 14-label list with intervals and PPV-per-tier information, the interaction GRAPH (nodes = findings and history flags, edges = fired rules, click an edge to see the statement, quantity and the DOI link), the model/version/sha used, and a sign-off form (agree / disagree / needs more imaging + notes) that POSTs a Review. Show the review history and the audit trail for the study.
3. LONGITUDINAL COMPARISON: choose two studies of the same patient and body part (the API series endpoint). Show the registered pair with a slider swipe ("before/after"), the difference map with a diverging legend and hover values, and tools to: (a) set the calibration (click two points on a known distance and enter the mm, or use DICOM spacing if present), (b) draw the fracture-site ROI and reference-bone ROI, (c) place a caliper on each timepoint to record the gap in mm. Send these to POST /studies/{id}/compare/{other_id} and show: registration quality (similarity score, "images may not show the same anatomy" warning), normalised density change, caliper trend table and a small chart over time. Show the EXPLORATORY healing estimate with its full label, cited priors and DOIs, and the delayed-healing review flag. A form to record a clinician-confirmed outcome (Step 14).
4. KNEE BONE-HEALTH VIEW: the 3-class output with probabilities/uncertainty, a permanent EXPERIMENTAL badge and the explanation that this is a screening aid, not a bone-density measurement. The nutrition (vitamin D / protein) section shows a disabled card reading "Not available: no validated dataset yet" (text from the API config).
5. Admin (role admin): user list and model status page showing each model's version, sha256, metrics file link and status.
6. Tests: route guards (a health worker cannot open the doctor dashboard), the comparison form sends the right payload, graph renders nodes/edges from a real API response.

Live verification (browser tool with screenshots): log in as the doctor, open a review queue, open a chest study and screenshot the interaction graph, sign a review, create a comparison between two of my uploaded studies (use a real study and a second upload of the same real image with a small test-only rotation; the UI must label the pair as a test pair in the notes field), draw ROIs, add calipers, show the difference map. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 17 "doctor dashboard, comparison, bone-health, admin"`

---

## STEP 18 — Languages (EN/TA/HI) and the PDF report

**IDE: Antigravity | Model: Gemini 3.8 Flash (Medium)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 45 min · *(language packs cuttable; keep English PDF)*
**Goal:** Tamil and Hindi text for safety-critical wording, honestly flagged as unreviewed, and a downloadable PDF.

### Your manual actions
- Find **one Tamil speaker and one Hindi speaker** (a friend is fine) to read the safety wording later; until then packs stay "machine-drafted".

### PROMPT

```text
Read AGENTS.md. Implement internationalisation.

1. Backend: config/i18n/{en,ta,hi}/ YAML packs containing: the disclaimer, finding display names for the 14 labels + fracture + knee classes + TB, tier names, review banners, rationale templates (the same placeholders used in Step 9), quality warnings, triage labels, and the "exploratory" and "experimental" labels. Each pack has metadata: language, review_status (machine_drafted | reviewed), reviewer (null until reviewed). English is the source; draft ta and hi translations carefully in plain, simple language suitable for health workers, keep medical terms accurate, and keep numbers/placeholders untouched. A test must fail if a placeholder in any pack differs from English or if a key is missing. Unreviewed packs must add a visible banner field "machine-drafted translation; not reviewed by a clinician".
2. API: all result text endpoints accept ?lang=en|ta|hi (and the user's saved preference); numbers and DOIs never change by language; fall back to English with a flag if a key is missing.
3. Frontend: language switcher (persisted), full UI strings via i18next (en/ta/hi), Tamil and Hindi fonts (Noto Sans Tamil / Noto Sans Devanagari self-hosted, no CDN requirement at runtime), the machine-drafted banner when the pack is unreviewed.
4. PDF REPORT: GET /studies/{id}/report.pdf?lang=... using reportlab (embed a Unicode font that supports Tamil and Devanagari, e.g. Noto, stored in backend/assets/fonts; verify the glyphs render, because many default fonts print blank boxes). Contents: header, study metadata (no patient name), original image + heatmap + uncertainty thumbnails, findings table with calibrated p and intervals and tiers, rationale, interactions with citations, triage, review flag/reasons, model versions/sha, translation status, disclaimer, generation timestamp. Add a button in the UI.
5. Tests: PDF generated for each language, text extractable (pypdf) and contains the disclaimer; glyph check that the PDF contains the expected Tamil/Hindi words.

Live verification: generate the PDF in all three languages for the same real study and rasterise page 1 of each to PNG (pdf2image or pymupdf) and show them to me so I can eyeball the glyphs. Switch the UI language in the browser tool and screenshot the result page in each language. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 18 "i18n en/ta/hi and PDF report"`

---

## STEP 19 — UI polish and cross-check in Cursor

**IDE: Cursor | Model: Grok 4.6**
**Fallback:** Antigravity + Gemini 3.8 Flash (Medium) · **Time:** about 45 min · *(cuttable)*
**Goal:** A second set of eyes: polish the UI and independently review the last commits.

### Your manual actions
- Open the same repo folder in Cursor. Make sure the API and web dev servers can run (`python scripts/tasks.py api` and `python scripts/tasks.py web`).

### PROMPT (part 1: independent review, use Reusable Prompt A)

Paste **Reusable Prompt A** from Section 3, then ask Cursor: *"Review the last five commits instead of only HEAD (git log -5)."* Take the numbered findings back to Antigravity (Claude Sonnet 4.6) and paste: *"Fix findings 1..N from this independent review, with regression tests. Do not weaken anything."*

### PROMPT (part 2: UI polish)

```text
Read AGENTS.md (the rules in .cursor/rules apply). Polish the frontend without changing behaviour or API contracts:
1. Visual consistency (spacing scale, typography, colour tokens, dark mode optional), consistent loading skeletons and empty states, clear iconography for tiers, review banners, EXPERIMENTAL and EXPLORATORY badges.
2. Mobile layout at 360, 390, 768 and 1280 px: no horizontal scroll, readable image viewer controls, bottom action bar on phones.
3. Accessibility pass (labels, focus order, contrast >= WCAG AA, alt text for images, keyboard operation of the viewer).
4. Performance: lazy-load heavy components (viewer, graph, charts), image sizing, bundle size report.
5. Remove any leftover mock, placeholder, hardcoded or lorem text (R1) and report where you looked.
Run lint, typecheck, tests and the production build. Report what changed as a short list.
```

### Push
`python scripts/push_step.py 19 "independent review fixes and UI polish"`

---

# PART E — TESTING AND ACCEPTANCE (Steps 20–23)

---

## STEP 20 — ML acceptance evaluation (the numbers you may quote)

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 1 h
**Goal:** One reproducible report with every measured metric, each compared to an explicit target. This report is the **only** source for any number you say on stage.

### Your manual actions
- Close other GPU programs. Do not change any test split.

### PROMPT

```text
Read AGENTS.md and every file in reports/. Write scripts/run_ml_acceptance.py that re-runs the evaluations on the held-out TEST splits through the SAME code path the API uses (load models via the registry, not by re-implementing preprocessing) and writes docs/ML_ACCEPTANCE.md plus reports/acceptance.json.

TARGETS live in config/acceptance_targets.yaml: set each target as a design decision, labelled as such, with a rationale (for example mean chest AUROC target, ECE after calibration lower than before, tier PPV meets target for how many labels, OOD detection rate for MRI/natural photos, lung Dice, fracture AUROC, registration error, gate rejection rate, P95 latency). The report prints PASS/FAIL per target. FAILs stay FAIL: do not move the targets after seeing results, and do not touch the test data. If a target fails, write the likely cause and the next experiment.

SECTIONS: (1) chest 14-label metrics with CIs, calibration before/after, tiers' PPV; (2) uncertainty (spread on degraded vs clean images, OOD detection); (3) explainability (pointing game, IoU, deletion test vs random baseline, which labels are marked heatmap_unreliable); (4) lung segmentation; (5) fracture; (6) knee (experimental) with data-size caveat; (7) TB (experimental) per source; (8) gate accuracy on real negatives; (9) registration accuracy; (10) end-to-end latency/VRAM; (11) a "what we cannot claim" section listing the exploratory/disabled pieces (healing estimate not validated, vitamin D/protein not built, translations unreviewed, rules draft, no external/Indian validation yet).
Also verify reproducibility: running the script twice gives identical numbers (fixed seeds); show the diff.

Live verification: run it, print the PASS/FAIL table in the chat, and show me the FAILs and their explanations. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 20 "ML acceptance report with measured metrics"`

---

## STEP 21 — Live end-to-end browser testing (the agent navigates the real app)

**IDE: Antigravity | Model: Gemini 3.1 Pro (High)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 1 h 15 min
**Goal:** The IDE uses the browser tool to click through every feature like a user and proves each one works. Failures are fixed in the same step.

### Your manual actions
- Make sure the Antigravity browser extension is connected to Chrome.
- Have two doctors'/health workers' credentials ready (you'll type them when asked; nothing is stored).
- Optional: your real phone photos in `data/raw/phone_photos/` and any real serial pair in `data/raw/serial_cases/`.

### PROMPT

```text
Read AGENTS.md, docs/PROJECT_SPEC.md, docs/ML_ACCEPTANCE.md. Start the API and the web app for real (python scripts/tasks.py api / web) and then use the Antigravity browser tool to test the product like a user. Take a screenshot at each numbered check and save them in docs/e2e/ with the check number in the filename. Write each result (PASS/FAIL, evidence, screenshot path) in docs/E2E_REPORT.md. If something fails: stop, fix the root cause in code (not the test), add a regression test, re-run the whole failing flow, and note the fix. Ask me for logins when needed. Use only real images from data/ test splits (and my phone photos if present).

HEALTH-WORKER FLOWS
H1 Login with a wrong password shows an error; with the right one lands on the dashboard.
H2 Upload a real chest X-ray test image (a known positive, e.g. an effusion or cardiomegaly): progress stages appear live, the result shows calibrated probabilities with intervals, tiers, rationale text, zone, heatmap, uncertainty map with hover value, interaction notes (if I ticked diabetes and TB shows), triage.
H3 Upload a "No Finding" chest X-ray: no high-tier findings; verify what is shown is consistent with the API JSON (compare values on screen against GET /studies/{id}/result).
H4 Upload a real brain MRI and a real natural photo: both are rejected with a clear reason.
H5 Upload a real X-ray degraded with blur (test-only transformation): flagged with a quality warning and "Needs human review".
H6 Upload a real bone X-ray (FracAtlas test image, fractured and non-fractured): fracture result + heatmap; knee image: bone-health result with EXPERIMENTAL badge; the nutrition card is disabled with the explanation.
H7 If phone photos exist, upload 3 and record how the gate/uncertainty behave (report honestly).
H8 Switch the language to Tamil and Hindi and view a result and download the PDF in each; the machine-drafted banner is visible.
H9 Check at 390 px width (mobile emulation) that every health-worker flow works.
DOCTOR FLOWS
D1 Login as doctor: the review queue lists the studies just made, sorted by triage/review flag.
D2 Open a study: interaction graph, click an edge, the DOI link opens and matches the statement.
D3 Sign off a review (disagree + notes); the history shows it; the audit trail shows the access.
D4 Compare two studies of the same body part: calibration, ROIs, calipers, difference map, similarity warning on a wrong-patient pair, exploratory healing estimate with full label.
D5 A health worker account cannot open the doctor dashboard or another worker's study.
FAILURE FLOWS
F1 Stop the API mid-use: the UI shows a clear error and recovers when restarted.
F2 Temporarily rename the chest weights: the UI shows "model unavailable" (503) and no fake result; restore the file afterwards.
F3 Upload a 0-byte and a corrupt file: clean errors, no server crash.
F4 Upload 5 images quickly: they queue and all complete without GPU out-of-memory.
CONSOLE/NETWORK: capture browser console errors and failed network calls during all flows; there must be none unexplained.

When all pass, print the PASS/FAIL table in the chat with screenshot paths. Update docs/STATUS.md.

ADDITIONAL FLOWS (frontend patch):
S1: real FracAtlas TEST fractured image -> skeleton shows a red region matching the dataset body part; the heatmap image comes from /studies/{id}/heatmap/{label}.png.
S2: real non-fractured image -> skeleton fully neutral.
S3: real chest image with a positive finding -> organ_zone highlight in the matching Step 8 zone.
S4: empty database state for each dashboard screen -> empty states, no sample values.
S5: for every Stitch screen, pixel-diff against the Stitch screenshot, assert mismatch below threshold outside the data regions.
S6: network blocked to CDNs -> app still renders (fonts and decoders are self-hosted).
S7: kill the API -> UI shows an error state, not stale or fake numbers.
```

### Push
`python scripts/push_step.py 21 "end-to-end browser tests with fixes"`

---

## STEP 22 — Anti-fake audit and independent adversarial review

**IDE: Antigravity | Model: GPT-OSS 120B (Medium)**
**Fallback:** Gemini 3.1 Pro (High) · **Time:** about 45 min
**Goal:** A different model hunts for anything fake, hardcoded, unsafe or overclaimed. You apply the findings.

### Your manual actions
- None.

### PROMPT

```text
You are an independent auditor who did NOT write this code. Do NOT edit files. Read AGENTS.md, docs/PROJECT_SPEC.md, docs/ML_ACCEPTANCE.md, docs/E2E_REPORT.md and audit the whole repository. Produce docs/AUDIT.md with numbered findings sorted by severity, each with file:line, evidence and a recommended fix.

CHECKS
1. Fake data: grep and read for lorem ipsum, hardcoded probabilities, random/np.random/torch.rand used to produce a user-visible number, static JSON used as an API response, hardcoded users/passwords/tokens, demo arrays in the frontend, "TODO", "mock", "placeholder", "sample", "dummy", "fake".
2. Hardcoded values: every numeric threshold, URL, port, path and medical constant must come from .env or config with a source. List violations.
3. Medical constants without a source or review_status; rules without DOIs; any statement that reads like a diagnosis; missing disclaimer in any output (API, UI, PDF).
4. Honesty: does any UI text or doc claim something that docs/ML_ACCEPTANCE.md does not support? Does the healing estimate always show EXPLORATORY? Are knee and TB always EXPERIMENTAL? Are vitamin D/protein flags truly disabled?
5. Data leakage: confirm the test split is untouched by training/calibration/threshold choices (read the code paths), and that splits are by patient where ids exist.
6. Security: authz on every route, injection, file handling (path traversal, size, content type), secrets in git history (check `git log -p` for .env or tokens), PHI in logs, JWT settings, CORS.
7. Robustness: GPU memory leaks, race conditions in the worker, missing timeouts, what happens when disk is full.
8. Tests: which important behaviours have no test?
Finish with the top 10 issues to fix first.
```

### After the audit (same step, different model)
Switch to **Antigravity | Claude Sonnet 4.6 (Thinking)** and paste:

```text
Read docs/AUDIT.md. Fix every finding of severity high and medium, and the cheap low ones, with regression tests. Do not weaken tests or targets. For each finding mark FIXED or WONTFIX with a reason in docs/AUDIT.md. Re-run lint, tests, the ML acceptance script and the key e2e flows H2, H4, D2, F2 through the browser tool. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 22 "audit findings fixed"`

---

## STEP 23 — Final acceptance, demo mode and release

**IDE: Antigravity | Model: Gemini 3.1 Pro (High)**
**Fallback:** Claude Sonnet 4.6 (Thinking) · **Time:** about 45 min
**Goal:** One command to run it, a rehearsed demo script built from real held-out data, and a final acceptance report.

### Your manual actions
- Pick your own 4–5 favourite real test images later during rehearsal; the agent prepares a safe list from the test split.
- Open at least **5 DOIs** from `config/comorbidity_rules.yaml` and `config/healing_priors.yaml` and confirm they match.

### PROMPT

```text
Read AGENTS.md, docs/PROJECT_SPEC.md, docs/STATUS.md, docs/ML_ACCEPTANCE.md, docs/E2E_REPORT.md, docs/AUDIT.md. Finish the project.

1. ONE-COMMAND RUN: scripts/tasks.py `demo` that checks the GPU, checks models/registry.json hashes, starts the API and the web app, waits for /health, and prints the URLs. A clean-clone test: in a fresh temp folder clone the repo, follow only README.md, and show it starts (weights and data are restored with the documented commands; if they cannot be restored automatically print MANUAL ACTION REQUIRED).
2. DEMO DATA (R1-compliant): write scripts/prepare_demo.py that selects a small set of REAL images from the held-out TEST splits (about 3 chest incl. one clear positive, 1 No Finding, 1 degraded test-only copy, 2 bone, 1 knee, 1 MRI and 1 natural photo for rejection) and copies them to data/demo/ with a manifest that records the true labels from the datasets, so I can upload them live in a presentation. Nothing synthetic except the labelled degraded copy.
3. DEMO SCRIPT: docs/DEMO_SCRIPT.md, a 5-minute walkthrough with the exact clicks and the one sentence to say at each stage, quoting ONLY numbers that exist in docs/ML_ACCEPTANCE.md.
4. docs/ACCEPTANCE_REPORT.md: a FEATURE MATRIX with, for each of Features 1-5 and the platform, what the spec promised, what is implemented, the evidence file, and a status = WORKING | WORKING-WITH-LIMITS | EXPERIMENTAL | EXPLORATORY | GATED-DISABLED | ROADMAP, with the exact limits. Include: spec goals vs measured results (only measured ones; others "not yet measurable" with the study needed), known limitations and risks (US-trained models, small datasets, unreviewed translations, draft rules, no outcome data), what is required before real-patient use (prospective clinical validation with an ethics committee, CDSCO classification, clinician review of rules and translations, Indian data partnerships, DPDP legal review), and reproduction commands.
5. Run the whole suite one last time: ruff, pytest, frontend tests and build, ML acceptance, and a final pass of e2e flows H2, H4, H6, D2, D4. Paste the results.
6. Update docs/STATUS.md (all 23 steps), tag v1.0.0-rc1 and create a GitHub release with notes using the gh CLI.
```

### Push
`python scripts/push_step.py 23 "final acceptance and v1.0.0-rc1"` (the agent also runs `git tag v1.0.0-rc1 && git push --tags` and `gh release create`)

---

# APPENDIX

## A. If things go wrong

| Problem | Do this |
|---|---|
| `no kernel image is available for execution` | Your PyTorch is not built for Blackwell (RTX 5050). Reinstall with the `cu128` (or newer) wheel index; update the NVIDIA driver; ask the agent to re-run `scripts/check_gpu.py` |
| CUDA out of memory | Batch size 16, gradient accumulation, `channels_last`, close other GPU apps, `torch.cuda.empty_cache()` between models; keep fewer models resident (config) |
| Training is slow | Use the cache from Step 3 (not raw PNGs); raise `num_workers`, use `persistent_workers`; ensure the laptop is plugged in on High performance |
| Laptop slept mid-training | Re-run with `--resume`; checkpoints are saved every epoch |
| NIH download too slow / Box blocked | Use fewer archives (2 are enough for a demo), or the Kaggle copy; tell the agent the new source so it records it in `docs/DATA_REGISTRY.md` |
| Agent invents data or a "sample" file | Paste: `You violated AGENTS.md R1/R2. Remove the fabricated data, list where it was used, and produce the MANUAL ACTION REQUIRED block for what is missing.` |
| A model refuses to improve | Ask for an error analysis (Reusable Prompt B). Better data/labels beat bigger models; do not tune on the test split |
| Push script fails | Never bypass it. Fix the failing lint/test it reports |
| Antigravity quota hit | Follow the fallback order; use Reusable Prompt C |
| Browser tool cannot control Chrome | Reconnect the Antigravity browser extension; restart Chrome; retry the flow |

## B. Step index

| # | Title | IDE | Model |
|---|---|---|---|
| 1 | Bootstrap, brief, rules, GPU check, push tool | Antigravity | Gemini 3.1 Pro (High) |
| 2 | NIH chest data | Antigravity | Gemini 3.1 Pro (High) |
| 3 | Other datasets, manifests, cache | Antigravity | Gemini 3.1 Pro (High) |
| 4 | Backend skeleton, auth | Antigravity | Claude Sonnet 4.6 (Thinking) |
| 5 | Train chest model | Antigravity | Claude Opus 4.6 (Thinking) |
| 6 | Ingestion and quality gate | Antigravity | Claude Sonnet 4.6 (Thinking) |
| 7 | Calibration and uncertainty | Antigravity | Claude Opus 4.6 (Thinking) |
| 8 | Lung segmentation, zones | Antigravity | Claude Opus 4.6 (Thinking) |
| 9 | Explainability | Antigravity | Claude Opus 4.6 (Thinking) |
| 10 | Fracture, knee, TB models | Antigravity | Claude Opus 4.6 (Thinking) |
| 11 | Comorbidity research | Antigravity | Gemini 3.1 Pro (High) |
| 12 | Comorbidity engine | Antigravity | Claude Sonnet 4.6 (Thinking) |
| 13 | Longitudinal engine | Antigravity | Claude Opus 4.6 (Thinking) |
| 14 | Healing priors (exploratory) | Antigravity | Gemini 3.1 Pro (High) |
| 15 | Orchestrator and API | Antigravity | Claude Sonnet 4.6 (Thinking) |
| 16 | Frontend foundation | Antigravity | Claude Sonnet 4.6 (Thinking) |
| 17 | Doctor dashboard | Antigravity | Claude Sonnet 4.6 (Thinking) |
| 18 | Languages and PDF | Antigravity | Gemini 3.8 Flash (Medium) |
| 19 | Review and UI polish | **Cursor** | **Grok 4.6** |
| 20 | ML acceptance evaluation | Antigravity | Claude Opus 4.6 (Thinking) |
| 21 | Live browser end-to-end tests | Antigravity | Gemini 3.1 Pro (High) |
| 22 | Anti-fake audit and fixes | Antigravity | GPT-OSS 120B (Medium), then Claude Sonnet 4.6 (Thinking) |
| 23 | Final acceptance and release | Antigravity | Gemini 3.1 Pro (High) |

VS Code + GitHub Copilot (free): use it only for tiny jobs, such as "explain this error", a one-function unit test, or a docstring.

## C. Final human checklist (tick these yourself)

- [ ] I personally saw a real chest X-ray analysed end to end with a heatmap and calibrated confidence.
- [ ] I personally saw a real bone X-ray analysed (fracture result with heatmap).
- [ ] A brain MRI and a natural photo were rejected.
- [ ] A blurry image was flagged for human review.
- [ ] I read `docs/ML_ACCEPTANCE.md` and I understand every FAIL.
- [ ] I opened at least 5 DOIs in the rules and priors files and they matched the claims.
- [ ] A Tamil and a Hindi speaker reviewed at least the safety wording before I present those languages as reviewed.
- [ ] I know the healing estimate is exploratory, knee and TB are experimental, and vitamin D / protein screening is not built. I will not describe them otherwise.
- [ ] I understand this is decision support and must not be used on real patients before clinical validation and regulatory clearance (CDSCO).
