# XRAY-ASSISTANT: Frontend Patch (Stitch-exact UI + 3D skeleton + zero hardcoded data)

This file **replaces Steps 15 (additions only), 16, 17, 18 (frontend part) and 19** of `XRAY_ASSISTANT_24H_PLAYBOOK.md`.
Everything else in the playbook stays. Run the steps in this order: **9A, 10A, 15A, 16, 17, 18, 19, 21A**.

Your Stitch folder: `D:\Downloads\stitch_xray_assistant_clinical_design_system`
I could not open that folder from here. The prompts therefore make the agent **inventory it first** and build from what it actually finds. Nothing below assumes screen names.

---

## 0. Read first: three honest limits that affect this patch

1. **"Route the damaged bone onto the skeleton" needs a real source of bone location.**
   - FracAtlas (your fracture dataset) gives a `body_part` label (hand, leg, hip, shoulder) and, for many images, a bounding box or mask. It does **not** give names like "distal radius".
   - So the 3D skeleton highlights what the data supports: **the anatomical region** (e.g. "hand/wrist", "leg", "hip", "shoulder"), plus the **exact bone only if** a config table maps region + heatmap peak position to a bone. That table needs a source and starts as `review_status: draft`.
   - Chest findings map to **ribs/sternum/spine/clavicle regions** or to the **lung zones** from Step 8. Lungs are not bones, so lung findings are shown as organ highlights on the same model (red zone on the ribcage area), never as a bone fracture.
   - If the backend cannot localise, the skeleton shows nothing red and says "location not determined". It never guesses.
2. **A skeleton 3D model file is an asset, not data.** You must download one with a licence that allows use and with **separately named meshes** (one mesh per bone or bone group). Step 16 tells you what to look for. If the mesh names do not match the config, the agent builds the mapping from the real names it finds.
3. **Stitch gives HTML/CSS plus screenshots.** "Exactly the same" is achievable for layout, colours, fonts, spacing and components. The agent must compare its output to each Stitch screenshot with a pixel-diff and report the result. It must not claim exactness without that report.

---

## STEP 9A: Backend addition: heatmap peak coordinates (do after Step 9)

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)** · Fallback: Claude Sonnet 4.6 · about 20 min

```text
Read AGENTS.md and the Step 9 explain service. Add what the 3D skeleton view needs. Follow R1-R12.

1. For every heatmap the service already makes, also return the PEAK location and a small list of salient regions: peak_x and peak_y as fractions 0..1 of the original image width and height, plus up to N connected regions above the config threshold, each with a normalised bounding box and mean saliency. N and the threshold come from config/explain.yaml.
2. Add these fields to the per-finding result object. Do not change existing fields.
3. Test with real held-out images: coordinates are inside 0..1, and the peak lies inside the lung mask for lung findings (use the Step 8 mask).
Update docs/STATUS.md.
```

Push: `python scripts/push_step.py 9 "heatmap peak coordinates and salient regions"`

---

## STEP 10A: Backend addition: body region and bone mapping (do after Step 10)

**IDE: Antigravity | Model: Claude Opus 4.6 (Thinking)** · Fallback: Claude Sonnet 4.6 · about 40 min

### Your manual actions
- None, but you should open the DOIs the agent cites for the anatomical vocabulary.

```text
Read AGENTS.md, docs/DATA_REGISTRY.md and the FracAtlas manifest. Build backend/app/services/anatomy/ so a result can be drawn on a 3D skeleton. Follow R1-R12 strictly. Never invent a bone name.

1. REGION SOURCE: inspect the real FracAtlas metadata (body_part, any region fields) and the real knee and chest outputs. List in docs/DATA_REGISTRY.md exactly which anatomical information each dataset really provides.
2. CONFIG: write config/anatomy.yaml. It defines (a) a canonical list of skeleton region ids and bone ids (use a standard source such as the Terminologia Anatomica or a named open anatomy ontology; put the source and its identifier in the file), (b) a mapping from each dataset body_part value (as discovered in step 1) to a region id, (c) for the chest model, a mapping from each of the 14 findings and from each lung zone (Step 8) to a skeleton highlight target with a type: "organ_zone" or "bone_region", (d) every entry has `source` and `review_status` (draft until a clinician signs off). A medical constant without a source is a bug (R3).
3. FRACTURE LOCALISATION: if FracAtlas has boxes or masks, train a small region classifier or use the dataset body_part labels directly to predict the region for a new bone image. Report its accuracy on the TEST split in reports/region_accuracy.md with a bootstrap CI. If accuracy for a region is below the config minimum, that region is returned as "region_uncertain" and the skeleton shows nothing red. Use the Step 7 calibration machinery so the region has a calibrated probability.
4. BONE-LEVEL (optional, only if justified): if the annotations genuinely support finer localisation, add it. Otherwise do NOT claim it. Write the decision and the evidence in docs/DECISIONS.md.
5. RESULT FIELDS: add `anatomy` to the result: { region_id, region_probability, targets: [{id, type, severity_source: "fracture_probability"|"finding_probability", value, tier}], status: "determined"|"region_uncertain"|"not_applicable", source_config_review_status }. Every number comes from the real model output.
6. ENDPOINT: GET /anatomy/skeleton-map returns the validated config (ids, labels per language, parent/child grouping, review_status) so the frontend never hardcodes a bone list.
7. Tests with real held-out images: a real fractured hand image yields a hand-region target; a real non-fractured image yields no red target; a chest image yields organ_zone targets consistent with the Step 8 zone.
Update docs/STATUS.md.
```

Push: `python scripts/push_step.py 10 "anatomy region and bone mapping"`

---

## STEP 15A: Backend additions for the dashboard (do after Step 15)

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)** · Fallback: Gemini 3.1 Pro (High) · about 45 min

Stitch dashboards usually show counts, trends, recent activity and charts. Those numbers must come from the database, not from the design. This step adds the endpoints the agent will find it needs. The agent decides the exact list after reading Stitch in Step 16, so run **16.0 first** and then come back here if it reports missing endpoints.

```text
Read AGENTS.md and docs/STITCH_INVENTORY.md (written in Step 16.0). For every data element in Stitch that has no existing endpoint, add a real, typed, authenticated endpoint backed by real queries on the real database. Examples of the kind of thing to expect (build only what the inventory proves is needed): study counts by status and by day, triage distribution, review-queue size, per-model status, per-finding frequency, recent activity from the audit log, user and clinic names from the user table, latency from the real stored stage timings.
Rules: no static JSON, no random numbers, no seeded fake rows. Empty database => the endpoint returns zeros or empty lists and the UI shows its empty state. Every endpoint gets a pydantic response model, role checks and a test that creates real studies through POST /studies with real test images and asserts the counts.
Regenerate the OpenAPI schema and the TypeScript client. Update docs/STATUS.md.
```

Push: `python scripts/push_step.py 15 "dashboard endpoints from stitch inventory"`

---

## STEP 16: Frontend foundation: Stitch-exact UI, 3D skeleton, real data (REPLACES the old Step 16)

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)**
**Fallback:** Gemini 3.1 Pro (High) · **Time:** about 3 h (split into 16.0 to 16.5 in separate chats if the context fills)

### Your manual actions

1. Confirm your Stitch folder opens and contains the exported screens: `D:\Downloads\stitch_xray_assistant_clinical_design_system`
2. **Copy it into the repo** so every IDE sees it: `docs/stitch/` (copy the whole folder, keep its original structure). Reason: agents run in the repo folder, and a path on another drive may be blocked.
3. **Download a skeleton model** (free, licence allows your use). Search "human skeleton glb" on Sketchfab (filter: downloadable, CC0 or CC-BY) or Poly Pizza / Quaternius-style CC0 sources. Requirements:
   - format `.glb` or `.gltf`
   - **separate named meshes per bone** (skull, ribs, spine, pelvis, humerus, radius, ulna, hand bones, femur, tibia, fibula, foot bones). A single fused mesh cannot highlight one bone.
   - under 15 MB (the agent can compress it with `gltf-transform`)
   - save as `frontend/public/models/skeleton.glb` and note the author, URL and licence in `docs/ASSET_CREDITS.md`
   - Your reference screenshot shows the right idea: a body mesh with a skeleton over it. You want the skeleton only, upright, arms slightly out.
4. Make sure the API runs and at least one doctor and one health-worker account exist (Step 4 and Step 17 scripts).
5. Use Chrome.

### 16.0 PROMPT: Inventory Stitch (paste first, alone)

```text
Read AGENTS.md and docs/PROJECT_SPEC.md. Do NOT write frontend code yet.
Inventory the Stitch export in docs/stitch/ (if it is missing, STOP with MANUAL ACTION REQUIRED naming D:\Downloads\stitch_xray_assistant_clinical_design_system and the target docs/stitch/).

1. List every screen: folder name, the HTML file, the screenshot, and what the screen is for. Write docs/STITCH_INVENTORY.md with one section per screen.
2. For each screen record: (a) layout structure and components, (b) design tokens actually used (colours, fonts, font sizes and weights, spacing, radii, shadows, breakpoints), taken from the real CSS or Tailwind config in the HTML, (c) every PLACEHOLDER: any text, number, name, date, percentage, chart value, avatar, image, badge count, table row, list item, status chip or label that is a sample value. For each placeholder write: the exact placeholder text, where it is, and the REAL data source it must come from (an existing endpoint and field, or "MISSING ENDPOINT: <proposal>"). A placeholder with no real source is listed under "UI element to remove or mark unavailable".
3. List fonts and icon sets used. Note anything loaded from a CDN (it must be self-hosted at build time or replaced, R1 and the Step 18 rule).
4. List interactive behaviour the HTML implies (tabs, toggles, modals, sliders) so it can be rebuilt.
5. Produce a screen-to-route map (for example Login -> /login). Mark which role sees each screen. Mark where the 3D skeleton must appear (study result and doctor study review at minimum).
6. Output the list of MISSING ENDPOINTS so I can run Step 15A.
Show me the inventory summary table. Update docs/STATUS.md.
```

### 16.1 PROMPT: Scaffold and design system

```text
Read AGENTS.md, docs/STITCH_INVENTORY.md and docs/stitch/. Build frontend/ (React + TypeScript strict + Vite + Tailwind + React Router + TanStack Query).
1. Typed API client generated from http://localhost:<API_PORT>/openapi.json (openapi-typescript). All settings via Vite env (VITE_API_URL). No hardcoded URLs, ports or credentials.
2. Port the Stitch design tokens EXACTLY into tailwind.config and a tokens.css (colours, typography, spacing, radii, shadows, breakpoints) copied from the Stitch CSS, not approximated. Self-host the fonts and icons Stitch uses (download at build time into frontend/public/fonts, no runtime CDN).
3. Build the shared components that appear in Stitch (app shell, sidebar or top bar, cards, tables, badges, buttons, inputs, tabs, modals, charts), matching the Stitch markup structure and class intent. Keep Stitch's DOM hierarchy and spacing; replace only static content with props bound to data.
4. Disclaimer footer from the API disclaimer field. Language and review banners come in Step 18.
Run typecheck and lint. Update docs/STATUS.md.
```

### 16.2 PROMPT: Build every Stitch screen with real data

```text
Read docs/STITCH_INVENTORY.md. For EVERY screen in the inventory (do not skip one, do not add a screen that is not in Stitch except the ones listed in 16.3), create the page so that it looks exactly like the Stitch screenshot and uses real backend data.

Rules for this step:
- Replace every placeholder listed in the inventory with data from the API field named in the inventory. Show loading skeletons, empty states and error states in the same visual style as Stitch.
- If a Stitch element has no real data source, REMOVE it or render the unavailable state defined in the inventory. Never leave the sample value (R1). Never write sample names, counts, dates, percentages, avatars, chart series, or lorem text in any .ts, .tsx, .json or .css file.
- Charts use real series from the dashboard endpoints; an empty series draws the empty-chart state.
- Login uses real credentials against POST /auth/login. JWT in memory plus refresh-safe storage. Logout on 401. Role-based routing exactly per the inventory map.
- New study screen: body part, age/sex, history checkboxes, file picker with drag-and-drop and camera capture (accept="image/*,.dcm"), preview, upload progress, and the gate's rejection reasons shown clearly.
- Live progress screen: SSE with reconnect.
- Result screen: original / heatmap / uncertainty viewer with opacity slider and 64x64 hover values, per-finding cards (calibrated probability, interval, tier, rule-out status, zone), validated vs EXPERIMENTAL badges, needs-human-review banner with reasons, rationale chain, interaction notes with DOI links and "draft rule" tag, triage level, TB note. The heatmap image URL is GET /studies/{id}/heatmap/{label}.png (the heatmap comes from the backend, the frontend never computes it).
- 503 model_not_available shows a clear unavailable message.
After each screen: take a browser screenshot and a Stitch screenshot at the same viewport width and compute a pixel-difference (for example with pixelmatch or odiff in a script scripts/ui_diff.mjs). Save the results in reports/ui_diff/ and a table in docs/UI_PARITY.md (screen, viewport, mismatch %). Explain any region that differs and fix every difference above the config threshold (default 2%) except regions that now show real data instead of the placeholder. Mask those data regions in the diff and list them.
Update docs/STATUS.md.
```

### 16.3 PROMPT: The 3D skeleton (Three.js) with damaged bone routing

```text
Read AGENTS.md, docs/STITCH_INVENTORY.md, config/anatomy.yaml, frontend/public/models/skeleton.glb and docs/ASSET_CREDITS.md. Build the interactive 3D skeleton component. If skeleton.glb is missing, STOP with MANUAL ACTION REQUIRED (requirements are in the playbook, Step 16 manual actions).

1. Install three and @react-three/fiber and @react-three/drei (pin versions in docs/DECISIONS.md; read their current docs first, R11). Lazy-load the component (code-split) so the page loads fast.
2. Load the GLB with GLTFLoader (Draco/Meshopt decoders self-hosted, no CDN). Enumerate the real mesh names in the file at build time with a script (scripts/list_skeleton_meshes.mjs) and write config/skeleton_meshes.json. Build the mapping from backend anatomy ids (GET /anatomy/skeleton-map) to mesh names in config/skeleton_mesh_map.yaml. Every anatomy id must map to at least one real mesh or be listed in a report of unmapped ids (the test fails if a region used by the backend has no mesh).
3. Interaction: OrbitControls (rotate, zoom, pan with limits), reset-view button, touch support, keyboard focus and an accessible text alternative listing the highlighted regions. Hover shows the bone or region name (from the backend labels in the user's language). Click a highlighted bone to scroll to its finding card and jump the 2D viewer to that finding's heatmap.
4. Damaged-bone routing: take result.anatomy.targets from the API. For each target set the matching meshes to a red emissive material. Intensity (colour saturation) is a function of the target's real value (probability) using a scale from config, not a constant. Tier colours for non-red states come from the Stitch tokens. Targets of type "organ_zone" (chest findings) are drawn as a translucent red volume or highlight on the ribcage zone matching the Step 8 zone, labelled as a lung finding. Everything else stays neutral. Animate the camera smoothly to frame the highlighted region.
5. If anatomy.status is "region_uncertain" or "not_applicable": show the skeleton all neutral with a text note from the API ("location not determined"). NEVER highlight on a guess.
6. Multiple findings: list them in a side legend with a toggle per finding; selecting one highlights only its targets.
7. Place it where the Stitch design reserves space for body/anatomy visuals, otherwise in the result and doctor review screens, styled with the Stitch tokens. Show a "draft anatomy mapping" tag while config review_status is draft.
8. Performance: dispose geometries and materials on unmount, cap pixel ratio from config, fall back to a clear message if WebGL is unavailable (no fake image).
9. Tests: Vitest unit tests for the mapping logic (backend targets -> mesh names -> material state) using a real saved API response; a Playwright test that loads the page, waits for the canvas, and checks via a debug hook that the expected meshes have the red material for a real fractured test image and none for a non-fractured one.
Live verification (browser tool, screenshots): upload a real fractured bone image, show the skeleton with the correct region red next to the heatmap; upload a real non-fractured image, show a neutral skeleton; upload a real chest image with a positive finding, show the organ-zone highlight; rotate and zoom; screenshot at 390 px width. Update docs/STATUS.md.
```

### 16.4 PROMPT: Remove-all-placeholders sweep (mandatory)

```text
Run a placeholder audit on frontend/ and report, with file:line, every occurrence of: lorem, sample, dummy, placeholder text that is not an input hint, John/Jane style names, hardcoded numbers in JSX, hardcoded dates, arrays or objects of fake rows, static chart series, hardcoded bone or finding lists, hardcoded URLs, Math.random, faker, and any image from a CDN or stock site. Also grep docs/stitch/ strings that appear verbatim in frontend/src. Fix all of them or justify each in docs/UI_PARITY.md (for example a CSS `placeholder` attribute on an input is allowed if it is an instruction, not data). Add a CI test (scripts/check_no_placeholders.mjs) that fails the build when such patterns appear. Show the clean report.
```

### 16.5 Live verification (the agent does this with the browser tool)

- Login as the real health worker. Upload a real chest TEST image, watch the SSE stages, screenshot Original / Heatmap / Uncertainty, hover to show a numeric tooltip, and show the skeleton highlight.
- Upload a real FracAtlas TEST fractured image: skeleton shows the region red, the heatmap comes from the backend.
- Upload a brain MRI: rejection message. Resize to 390 px and screenshot again.
- Show `docs/UI_PARITY.md` with the diff table and `reports/ui_diff/` images.

### Push
`python scripts/push_step.py 16 "stitch-exact frontend, 3d skeleton, real data"`

---

## STEP 17: Doctor dashboard, comparison, bone health (REPLACES the old Step 17)

**IDE: Antigravity | Model: Claude Sonnet 4.6 (Thinking)** · Fallback: Gemini 3.1 Pro · about 2 h

### Your manual actions
- Create a doctor and an admin account: `python scripts/create_user.py` (never put credentials in any file).

### PROMPT

```text
Read AGENTS.md, docs/STITCH_INVENTORY.md, docs/UI_PARITY.md and the existing frontend. Complete the doctor and admin screens that exist in Stitch (the inventory decides which). Where Stitch has no screen for a required doctor feature, build it using the same components and tokens and list it in docs/UI_PARITY.md as "no Stitch reference". Same placeholder rules as Step 16.2.

1. REVIEW QUEUE: studies sorted by triage then needs_human_review, filters (status, body part, tier, date), search, pagination, from the API.
2. STUDY REVIEW: everything the health worker sees, plus side-by-side image and heatmap with synchronised zoom/pan, the full 14-label list with intervals and PPV-per-tier, the interaction graph (nodes: findings and history flags; edges: fired rules; click an edge for statement, quantity and DOI link), the 3D skeleton from Step 16.3 in a panel beside the viewer, model/version/sha, sign-off form (agree / disagree / needs more imaging + notes) posting a Review, review history and audit trail.
3. LONGITUDINAL COMPARISON: pick two studies of the same patient and body part (series endpoint). Registered pair with a before/after swipe slider, difference map with a diverging legend and hover values, calibration (two-click known distance plus mm, or DICOM spacing), fracture-site and reference-bone ROIs, a caliper per timepoint. POST to /studies/{id}/compare/{other_id}. Show registration quality (with the "may not show the same anatomy" warning), normalised density change, caliper trend table and chart, the EXPLORATORY healing estimate with its full label and cited DOIs, delayed-healing flag, and a clinician-confirmed outcome form (Step 14). On the skeleton, show the fracture region on both timepoints.
4. KNEE BONE HEALTH: 3-class output with probabilities/uncertainty, permanent EXPERIMENTAL badge and the explanation that it is a screening aid. The nutrition card is disabled with the text returned by the API config.
5. ADMIN: user list and model status (version, sha256, metrics link, status), both from the API.
6. Dashboard home for each role: all figures from the Step 15A endpoints.
7. Tests: route guards, comparison payload, graph from a real saved API response.
Live verification (browser screenshots): doctor logs in, opens queue, opens a chest study (interaction graph + skeleton), signs a review, makes a comparison between a real study and a second upload of the same image with a small TEST-ONLY rotation (the notes field must say "test pair"), draws ROIs, adds calipers, shows the difference map. Update docs/UI_PARITY.md with diff results for these screens. Update docs/STATUS.md.
```

### Push
`python scripts/push_step.py 17 "doctor dashboard, comparison, bone health, admin"`

---

## STEP 18: Languages and PDF (backend part unchanged; frontend part replaced)

**IDE: Antigravity | Model: Gemini 3.8 Flash (Medium)** · Fallback: Claude Sonnet 4.6 · about 1 h

Use the original Step 18 prompt, and **add this paragraph at the end of it**:

```text
STITCH AND SKELETON ADDITIONS: every visible string in the Stitch screens (including labels that came from Stitch markup) goes through i18next with keys in en, ta and hi. Check that Tamil and Devanagari text does not overflow or break the Stitch layout at 360, 390, 768 and 1280 px, and fix wrapping with the Stitch tokens (line-height, min-width) rather than shrinking the font. Bone and region names on the 3D skeleton come from the labels in GET /anatomy/skeleton-map?lang=; add those labels to the ta/hi packs with the same review_status rules. The PDF report includes a static image of the skeleton view: render it from the real result (use the same Three.js scene in a headless Playwright capture, or a server-side render from the same mesh map), never a stock picture. Re-run the pixel-diff for English after the i18n change to confirm nothing regressed.
```

### Push
`python scripts/push_step.py 18 "i18n en/ta/hi, pdf with skeleton view"`

---

## STEP 19: UI polish and cross-check in Cursor (REPLACES the old Step 19)

**IDE: Cursor | Model: Grok 4.6** · Fallback: Antigravity + Gemini 3.8 Flash · about 1 h

Part 1: use **Reusable Prompt A** on the last five commits and send findings back to Claude Sonnet 4.6 as in the original Step 19.

Part 2 prompt:

```text
Read AGENTS.md, docs/STITCH_INVENTORY.md and docs/UI_PARITY.md. Polish WITHOUT changing the Stitch look or any API contract:
1. Re-run scripts/ui_diff.mjs for every screen at 360, 390, 768 and 1280 px. Anything above the threshold, fix it by correcting the code to match Stitch (never edit docs/stitch/).
2. Accessibility: labels, focus order, WCAG AA contrast measured on the Stitch colours (report failures instead of silently changing the Stitch palette; propose the smallest change), alt text, keyboard control of the viewer and of the 3D skeleton.
3. Performance: lazy-load the skeleton, graph and charts; compress the GLB if over the config budget; bundle size report; Lighthouse run in the browser tool on the result page.
4. WebGL: test low-end fallback behaviour.
5. Run scripts/check_no_placeholders.mjs, lint, typecheck, tests and the production build. Report where you looked for placeholders.
```

### Push
`python scripts/push_step.py 19 "independent review fixes, stitch parity and polish"`

---

## STEP 21A: Add these flows to the Step 21 browser tests

Append to the Step 21 prompt:

```text
ADDITIONAL FLOWS (frontend patch):
S1: real FracAtlas TEST fractured image -> skeleton shows a red region matching the dataset body part; the heatmap image comes from /studies/{id}/heatmap/{label}.png.
S2: real non-fractured image -> skeleton fully neutral.
S3: real chest image with a positive finding -> organ_zone highlight in the matching Step 8 zone.
S4: empty database state for each dashboard screen -> empty states, no sample values.
S5: for every Stitch screen, pixel-diff against the Stitch screenshot, assert mismatch below threshold outside the data regions.
S6: network blocked to CDNs -> app still renders (fonts and decoders are self-hosted).
S7: kill the API -> UI shows an error state, not stale or fake numbers.
```

---

## Checklist for you (tick these yourself)

- [ ] `docs/stitch/` contains my full Stitch export.
- [ ] `docs/STITCH_INVENTORY.md` lists every placeholder and where its real data comes from.
- [ ] `docs/UI_PARITY.md` shows a mismatch % for every screen and I looked at the diff images.
- [ ] I uploaded a real fractured image and the correct region turned red on the 3D skeleton, and a normal image left it neutral.
- [ ] I know the bone mapping is `draft` until a clinician reviews `config/anatomy.yaml`, and that lung findings are shown as organ zones.
- [ ] The grep in 16.4 reports nothing.
- [ ] Skeleton asset licence and author are in `docs/ASSET_CREDITS.md`.
