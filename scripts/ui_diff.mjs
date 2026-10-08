import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const SCREENS = [
  { id: 'xray_assistant_clinical_authentication_screen', url: '/login', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_health_worker_home_dashboard', url: '/dashboard', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_new_study_radiograph_ingestion', url: '/studies/new', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_live_study_analysis', url: '/studies/1/live', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_study_result_uncertainty_viewer', url: '/studies/1', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_my_studies_history', url: '/history', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_doctor_review_queue', url: '/queue', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_doctor_study_review_sign_off', url: '/review/1', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_longitudinal_comparison_fracture_healing_viewer', url: '/compare', viewport: { width: 1440, height: 900 } },
  { id: 'xray_assistant_model_user_management', url: '/admin', viewport: { width: 1440, height: 900 } }
];

const BASE_URL = 'http://localhost:5173';
const THRESHOLD = 0.02; // 2% mismatch allowed

async function run() {
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] 
  });
  
  if (!fs.existsSync('reports/ui_diff')) {
    fs.mkdirSync('reports/ui_diff', { recursive: true });
  }

  let markdownTable = '| Screen | Viewport | Mismatch % | Status |\n|---|---|---|---|\n';

  for (const screen of SCREENS) {
    const page = await browser.newPage();
    await page.setViewport(screen.viewport);
    console.log(`Checking ${screen.id}...`);

    try {
      await page.goto(`${BASE_URL}${screen.url}`, { waitUntil: 'networkidle0', timeout: 10000 });
      // Small delay for initial renders/animations
      await new Promise(r => setTimeout(r, 1000));
      
      const screenshotPath = `reports/ui_diff/${screen.id}_actual.png`;
      await page.screenshot({ path: screenshotPath });

      const targetPath = `docs/stitch/${screen.id}/screen.png`;
      if (!fs.existsSync(targetPath)) {
        console.warn(`[WARN] Missing target screenshot for ${screen.id}`);
        markdownTable += `| ${screen.id} | ${screen.viewport.width}x${screen.viewport.height} | N/A | Missing reference |\n`;
        continue;
      }

      const imgActual = PNG.sync.read(fs.readFileSync(screenshotPath));
      const imgTarget = PNG.sync.read(fs.readFileSync(targetPath));

      const { width, height } = imgTarget;
      const diff = new PNG({ width, height });

      // If dimensions don't match exactly, crop/pad or just fail
      if (imgActual.width !== width || imgActual.height !== height) {
        console.warn(`[WARN] Dimension mismatch for ${screen.id}. Expected ${width}x${height}, got ${imgActual.width}x${imgActual.height}`);
      }

      // Safe width and height
      const w = Math.min(width, imgActual.width);
      const h = Math.min(height, imgActual.height);
      const safeDiff = new PNG({ width: w, height: h });

      // Create cropped buffers
      const img1Buf = Buffer.alloc(w * h * 4);
      const img2Buf = Buffer.alloc(w * h * 4);
      
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx1 = (w * y + x) << 2;
          const idxTarget1 = (imgActual.width * y + x) << 2;
          img1Buf[idx1] = imgActual.data[idxTarget1];
          img1Buf[idx1 + 1] = imgActual.data[idxTarget1 + 1];
          img1Buf[idx1 + 2] = imgActual.data[idxTarget1 + 2];
          img1Buf[idx1 + 3] = imgActual.data[idxTarget1 + 3];

          const idxTarget2 = (imgTarget.width * y + x) << 2;
          img2Buf[idx1] = imgTarget.data[idxTarget2];
          img2Buf[idx1 + 1] = imgTarget.data[idxTarget2 + 1];
          img2Buf[idx1 + 2] = imgTarget.data[idxTarget2 + 2];
          img2Buf[idx1 + 3] = imgTarget.data[idxTarget2 + 3];
        }
      }

      const numDiffPixels = pixelmatch(
        img1Buf,
        img2Buf,
        safeDiff.data,
        w,
        h,
        { threshold: 0.1 }
      );

      const diffPct = (numDiffPixels / (w * h)) * 100;
      fs.writeFileSync(`reports/ui_diff/${screen.id}_diff.png`, PNG.sync.write(safeDiff));

      const status = diffPct > (THRESHOLD * 100) ? '❌ FAILED' : '✅ PASSED';
      console.log(`Mismatch for ${screen.id}: ${diffPct.toFixed(2)}%`);
      
      markdownTable += `| ${screen.id} | ${w}x${h} | ${diffPct.toFixed(2)}% | ${status} |\n`;

    } catch (e) {
      console.error(`Failed to process ${screen.id}:`, e);
      markdownTable += `| ${screen.id} | ${screen.viewport.width}x${screen.viewport.height} | N/A | Error |\n`;
    }

    await page.close();
  }

  await browser.close();
  fs.writeFileSync('docs/UI_PARITY.md', '# UI Parity Report\n\n' + markdownTable);
  console.log('Finished UI diffing. Report saved to docs/UI_PARITY.md');
}

run().catch(console.error);
