# Status

| Step | Title | Status | Date | SHA | Notes |
|---|---|---|---|---|---|
| 1 | Bootstrap | Done | | | |
| 2 | NIH chest data | Done | | | |
| 3 | Other datasets, gate negatives, manifests, cache | Done | | | |
| 4 | Backend skeleton + auth | Done | | | |
| 5 | Train chest model | Done | | | |
| 6 | Ingestion + quality gate | Done | | | |
| 7 | Calibration + uncertainty | Done | | | |
| 8 | Lung segmentation + zones | Done | | | |
| 9 | Explainability | Done | 2026-10-08 | | Step 9A: heatmap peak (peak_x, peak_y ∈ [0,1]) and salient regions (normalised bbox + mean_saliency) added to every GradCAM result. N and threshold from config/explain.yaml. 7/7 unit tests pass. |
| 10 | Fracture/knee/TB models | Done | 2026-10-08 | | **Upgraded to HF pretrained**: fracture=Hemgg, TB=Owos, chest=densenet121-res224-all, lungseg=ianpan; knee=timm ImageNet (experimental). Step 10A: anatomy region and bone mapping added. Region classifier built for FracAtlas. |
| 11 | Comorbidity research | Done | 2026-10-08 | | Rules verified with DOIs |
| 12 | Comorbidity engine | Done | 2026-10-08 | | Live verified engine, graph, and triage |
| 13 | Longitudinal engine | Done | 2026-10-08 | | Registration, diff maps, mismatch check, and caliper measures |
| 14 | Healing priors + exploratory predictor | Done | 2026-10-08 | | Researched priors, built outcome DB logic |
| 15 | Orchestrator + API | Done | 2026-10-08 | | Pipeline, Endpoints, Latency Profiling. Step 15A: Dashboard metrics built (counts, triage, queue, findings, audit). |
| 16 | Frontend foundation | Done | 2026-10-08 | | Step 16.0: Inventoried Stitch UI into STITCH_INVENTORY.md. Step 16.1: Scaffolded React + TS + Tailwind + OpenAPI client with exact Stitch tokens and components. |
| 17 | Doctor dashboard + compare | Pending | | | |
| 18 | Languages + PDF | Pending | | | |
| 19 | Cursor UI polish | Pending | | | |
| 20 | ML acceptance evaluation | Pending | | | |
| 21 | Live browser end-to-end tests | Pending | | | |
| 22 | Anti-fake audit + review | Pending | | | |
| 23 | Final acceptance + release | Pending | | | |
