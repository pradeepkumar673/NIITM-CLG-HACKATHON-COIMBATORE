# Stitch Inventory

## 1. Screens
- `xray_assistant_clinical_authentication_screen` (code.html, screen.png): Login page.
- `xray_assistant_health_worker_home_dashboard` (code.html, screen.png): Dashboard for health worker.
- `xray_assistant_new_study_radiograph_ingestion` (code.html, screen.png): Upload study.
- `xray_assistant_live_study_analysis` (code.html, screen.png): SSE analysis progress.
- `xray_assistant_study_result_uncertainty_viewer` (code.html, screen.png): Study result with 3D skeleton.
- `xray_assistant_my_studies_history` (code.html, screen.png): Health worker history.
- `xray_assistant_doctor_review_queue` (code.html, screen.png): Doctor triage queue.
- `xray_assistant_doctor_study_review_sign_off` (code.html, screen.png): Doctor sign-off with 3D skeleton.
- `xray_assistant_longitudinal_comparison_fracture_healing_viewer` (code.html, screen.png): Comparison view.
- `xray_assistant_knee_bone_health_screening_experimental_aid` (code.html, screen.png): Knee osteoporosis view.
- `xray_assistant_model_user_management` (code.html, screen.png): Admin dashboard.
- `xray_assistant_3d_bone_damage_viewer_panel` (code.html, screen.png): 3D Component reference.
- `xray_assistant_design_system_component_sheet` (code.html, screen.png): Design tokens.
- `clinical_diagnostic_precision` (DESIGN.md): Notes.

## 2. Layout, Tokens, and Placeholders
Tokens: Inter (base 16px, min 14px), IBM Plex Mono for metrics, Material Symbols Outlined.
Colors: primary `#0F5E6B`, red `#B42318`, amber `#B54708`, grey `#475467`.

Placeholders:
- **Dashboard Counts (Today, Total, Needs Review)**: "14 sync finalized", "2 studies needs review". -> `MISSING ENDPOINT: /studies/stats/counts` (study counts by status and by day).
- **Triage Distribution**: High Tier (12), Medium (4). -> `MISSING ENDPOINT: /studies/stats/triage` (triage distribution).
- **Review Queue Size**: "14 awaiting sign-off". -> `MISSING ENDPOINT: /studies/stats/queue` (review-queue size).
- **Per-finding Frequency**: Bar chart or list of top findings. -> `MISSING ENDPOINT: /studies/stats/findings` (per-finding frequency).
- **Recent Activity**: "Synced 3m ago" / audit log list. -> `MISSING ENDPOINT: /audit/activity` (recent activity from the audit log).
- **Per-model Status**: "4 Active • 1 Integrity Warning", sha256 checksums. -> `MISSING ENDPOINT: /admin/models/status` (per-model status).
- **User and Clinic names**: "Kashti PHC", "Dr. Arti Sharma". -> `MISSING ENDPOINT: /users/clinics` (user and clinic names from the user table).
- **Latency Data**: "18 mins avg response time", "12ms latency". -> `MISSING ENDPOINT: /studies/stats/latency` (latency from the real stored stage timings).

## 3. Fonts and Icons
- Inter
- IBM Plex Mono
- Material Symbols Outlined
*(Note: all loaded from Google Fonts CDN in Stitch; MUST be self-hosted).*

## 4. Interactive Behaviour
- Tabs and toggles (e.g., prototype state switchers).
- Sliders (Heatmap blend).
- Modals (Upload bounds, confirm sign-off).
- Sidebar navigation.

## 5. Screen-to-Route Map
- `/login` -> authentication_screen
- `/dashboard` -> health_worker_home_dashboard
- `/studies/new` -> new_study_radiograph_ingestion
- `/studies/{id}/live` -> live_study_analysis
- `/studies/{id}` -> study_result_uncertainty_viewer (HAS 3D SKELETON)
- `/history` -> my_studies_history
- `/queue` -> doctor_review_queue
- `/review/{id}` -> doctor_study_review_sign_off (HAS 3D SKELETON)
- `/compare` -> longitudinal_comparison
- `/admin` -> model_user_management

## 6. MISSING ENDPOINTS
The following endpoints must be built in Step 15A:
1. `GET /studies/stats/counts`
2. `GET /studies/stats/triage`
3. `GET /studies/stats/queue`
4. `GET /studies/stats/findings`
5. `GET /audit/activity`
6. `GET /admin/models/status`
7. `GET /users/clinics`
8. `GET /studies/stats/latency`
