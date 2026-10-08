import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  
  // Enable request interception
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/v1/studies/1/result')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          study_id: 1,
          status: 'completed',
          anatomy: {
            status: 'ok',
            targets: [
              { region_id: 'forearm', type: 'bone_region', finding_id: 'f1', probability: 0.95 }
            ],
            findings: [{ id: 'f1', name: 'Radius Fracture' }]
          }
        })
      });
    } else if (url.includes('/api/v1/studies/2/result')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 2,
          study_id: 2,
          status: 'completed',
          anatomy: {
            status: 'ok',
            targets: [],
            findings: []
          }
        })
      });
    } else if (url.includes('/api/v1/studies/3/result')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 3,
          study_id: 3,
          status: 'completed',
          anatomy: {
            status: 'ok',
            targets: [
              { region_id: 'lung_right_lower', type: 'organ_zone', finding_id: 'f2', probability: 0.85 }
            ],
            findings: [{ id: 'f2', name: 'Consolidation' }]
          }
        })
      });
    } else {
      request.continue();
    }
  });

  console.log('Taking screenshot for fractured bone (forearm)...');
  await page.goto('http://localhost:5173/studies/1', { waitUntil: 'networkidle0' });
  await page.waitForTimeout(2000); // Wait for 3D model to load
  await page.screenshot({ path: 'docs/stitch/screenshot_fracture_390px.png', fullPage: true });
  
  console.log('Taking screenshot for normal bone...');
  await page.goto('http://localhost:5173/studies/2', { waitUntil: 'networkidle0' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'docs/stitch/screenshot_normal_390px.png', fullPage: true });

  console.log('Taking screenshot for chest consolidation...');
  await page.goto('http://localhost:5173/studies/3', { waitUntil: 'networkidle0' });
  await page.waitForTimeout(2000);
  
  // Simulate rotate
  console.log('Simulating rotate and zoom...');
  await page.mouse.move(195, 422);
  await page.mouse.down();
  await page.mouse.move(300, 422, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/stitch/screenshot_chest_rotated_390px.png', fullPage: true });

  await browser.close();
  console.log('Done!');
})();
