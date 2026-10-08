# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\skeleton.spec.ts >> Skeleton Viewer >> highlights correct meshes for fractured test image
- Location: tests\skeleton.spec.ts:5:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('canvas') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - generic [ref=e8]: X-Ray Assistant
          - generic [ref=e9]: Online
        - generic [ref=e11]:
          - generic [ref=e12]: wifi
          - generic [ref=e13]: "Sync: Local Edge"
      - navigation [ref=e14]:
        - link "grid_view Dashboard" [ref=e15] [cursor=pointer]:
          - /url: /dashboard
          - generic [ref=e16]: grid_view
          - text: Dashboard
        - link "add_circle New study" [ref=e17] [cursor=pointer]:
          - /url: /studies/new
          - generic [ref=e18]: add_circle
          - text: New study
        - link "folder_shared My studies" [ref=e19] [cursor=pointer]:
          - /url: /history
          - generic [ref=e20]: folder_shared
          - text: My studies
      - generic [ref=e21]:
        - generic [ref=e22]: Language
        - generic [ref=e23]:
          - combobox [ref=e24]:
            - option "English" [selected]
            - option "Tamil [machine-drafted]"
            - option "Hindi [machine-drafted]"
          - generic: expand_more
    - generic [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]: dns
            - text: Edge Node
          - generic [ref=e30]: Active
        - generic [ref=e31]: KASHTI-PHC-04
      - button "logout Sign out" [ref=e32] [cursor=pointer]:
        - generic [ref=e33]: logout
        - text: Sign out
  - generic [ref=e35]:
    - banner [ref=e36]:
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]: Kashti Primary Health Centre, MH
          - generic [ref=e40]: District Ahmadnagar • Rural Health Cluster 2
        - generic [ref=e41]: ABHA Network Connected
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]: Sister Lakshmi Devi
          - generic [ref=e47]: Radiographer
        - generic [ref=e48]: person
    - main [ref=e50]:
      - generic [ref=e51]: Study not found
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // We mock the API for the test so we don't need a real backend running
  4  | test.describe('Skeleton Viewer', () => {
  5  |   test('highlights correct meshes for fractured test image', async ({ page }) => {
  6  |     // Intercept the API call to return a mock fractured bone response
  7  |     await page.route('**/api/v1/studies/1/result', async route => {
  8  |       const json = {
  9  |         id: 1,
  10 |         study_id: 1,
  11 |         status: 'completed',
  12 |         anatomy: {
  13 |           status: 'ok',
  14 |           targets: [
  15 |             { region_id: 'forearm', type: 'bone_region', finding_id: 'f1', probability: 0.95 }
  16 |           ],
  17 |           findings: [
  18 |             { id: 'f1', name: 'Radius Fracture' }
  19 |           ]
  20 |         }
  21 |       };
  22 |       await route.fulfill({ json });
  23 |     });
  24 | 
  25 |     // Go to the study result page which mounts the viewer
  26 |     await page.goto('http://localhost:5173/studies/1');
  27 | 
  28 |     // Wait for the canvas to be rendered
> 29 |     await page.waitForSelector('canvas');
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  30 | 
  31 |     // The component takes some time to load GLB and apply states. Wait for the debug hook
  32 |     await page.waitForFunction(() => {
  33 |       const w = window as any;
  34 |       return w.__skeletonDebugStates && w.__skeletonDebugStates['forearm'];
  35 |     }, { timeout: 10000 });
  36 | 
  37 |     // Verify the material state via the debug hook
  38 |     const states = await page.evaluate(() => {
  39 |       return (window as any).__skeletonDebugStates;
  40 |     });
  41 | 
  42 |     expect(states['forearm'].color).toBe('#ba1a1a'); // HIGHLIGHT_COLOR
  43 |     expect(states['forearm'].emissiveIntensity).toBeGreaterThan(0);
  44 |     expect(states['thigh'].color).toBe('#d1daeb'); // DEFAULT_COLOR
  45 |   });
  46 | 
  47 |   test('shows neutral skeleton for non-fractured image', async ({ page }) => {
  48 |     // Intercept with normal response
  49 |     await page.route('**/api/v1/studies/2/result', async route => {
  50 |       const json = {
  51 |         id: 2,
  52 |         study_id: 2,
  53 |         status: 'completed',
  54 |         anatomy: {
  55 |           status: 'ok',
  56 |           targets: [],
  57 |           findings: []
  58 |         }
  59 |       };
  60 |       await route.fulfill({ json });
  61 |     });
  62 | 
  63 |     await page.goto('http://localhost:5173/studies/2');
  64 |     await page.waitForSelector('canvas');
  65 |     await page.waitForFunction(() => (window as any).__skeletonDebugStates, { timeout: 10000 });
  66 | 
  67 |     const states = await page.evaluate(() => (window as any).__skeletonDebugStates);
  68 | 
  69 |     expect(states['forearm'].color).toBe('#d1daeb');
  70 |     expect(states['thigh'].color).toBe('#d1daeb');
  71 |   });
  72 | });
  73 | 
```