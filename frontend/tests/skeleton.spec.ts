import { test, expect } from '@playwright/test';

// We mock the API for the test so we don't need a real backend running
test.describe('Skeleton Viewer', () => {
  test('highlights correct meshes for fractured test image', async ({ page }) => {
    // Intercept the API call to return a mock fractured bone response
    await page.route('**/api/v1/studies/1/result', async route => {
      const json = {
        id: 1,
        study_id: 1,
        status: 'completed',
        anatomy: {
          status: 'ok',
          targets: [
            { region_id: 'forearm', type: 'bone_region', finding_id: 'f1', probability: 0.95 }
          ],
          findings: [
            { id: 'f1', name: 'Radius Fracture' }
          ]
        }
      };
      await route.fulfill({ json });
    });

    // Go to the study result page which mounts the viewer
    await page.goto('http://localhost:5173/studies/1');

    // Wait for the canvas to be rendered
    await page.waitForSelector('canvas');

    // The component takes some time to load GLB and apply states. Wait for the debug hook
    await page.waitForFunction(() => {
      const w = window as any;
      return w.__skeletonDebugStates && w.__skeletonDebugStates['forearm'];
    }, { timeout: 10000 });

    // Verify the material state via the debug hook
    const states = await page.evaluate(() => {
      return (window as any).__skeletonDebugStates;
    });

    expect(states['forearm'].color).toBe('#ba1a1a'); // HIGHLIGHT_COLOR
    expect(states['forearm'].emissiveIntensity).toBeGreaterThan(0);
    expect(states['thigh'].color).toBe('#d1daeb'); // DEFAULT_COLOR
  });

  test('shows neutral skeleton for non-fractured image', async ({ page }) => {
    // Intercept with normal response
    await page.route('**/api/v1/studies/2/result', async route => {
      const json = {
        id: 2,
        study_id: 2,
        status: 'completed',
        anatomy: {
          status: 'ok',
          targets: [],
          findings: []
        }
      };
      await route.fulfill({ json });
    });

    await page.goto('http://localhost:5173/studies/2');
    await page.waitForSelector('canvas');
    await page.waitForFunction(() => (window as any).__skeletonDebugStates, { timeout: 10000 });

    const states = await page.evaluate(() => (window as any).__skeletonDebugStates);

    expect(states['forearm'].color).toBe('#d1daeb');
    expect(states['thigh'].color).toBe('#d1daeb');
  });
});
