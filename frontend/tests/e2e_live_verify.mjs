import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('request', req => {
    if (req.url().includes('/studies')) {
      console.log('Request headers for', req.url(), ':', req.headers());
    }
  });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  
  console.log("Navigating to login...");
  await page.goto('http://localhost:5173/login');
  
  // Fill login
  await page.fill('input[type="email"]', 'worker@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign in")');
  
  await page.waitForURL('**/dashboard', { waitUntil: 'commit', timeout: 10000 });
  console.log("Logged in successfully!");
  
  // Chest X-ray
  console.log("Testing Chest X-ray...");
  await page.goto('http://localhost:5173/studies/new');
  // Set file to input
  const fileInput = await page.$('input[type="file"]');
  await fileInput.setInputFiles(path.resolve('../data/raw/nih_chestxray14/images/00000001_000.png'));
  await page.click('button:has-text("Start analysis")');
  
  // Wait for result page
  await page.waitForURL('**/studies/*/live', { timeout: 30000 });
  await page.locator('canvas').or(page.locator('text="3D Viewer Unavailable"')).waitFor({ timeout: 60000 }); // Wait for 3D skeleton
  await page.waitForTimeout(2000); // Wait for rendering
  await page.screenshot({ path: '../docs/stitch/live_chest_xray.png', fullPage: true });
  
  // Fracture
  console.log("Testing Fracture...");
  await page.goto('http://localhost:5173/studies/new');
  const fileInput2 = await page.$('input[type="file"]');
  await fileInput2.setInputFiles(path.resolve('../data/raw/fracatlas/FracAtlas/images/Fractured/IMG0000019.jpg'));
  await page.click('button:has-text("Start analysis")');
  await page.waitForURL('**/studies/*/live', { timeout: 30000 });
  await page.locator('canvas').or(page.locator('text="3D Viewer Unavailable"')).waitFor({ timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '../docs/stitch/live_fracture.png', fullPage: true });
  
  // Brain MRI
  console.log("Testing Brain MRI...");
  await page.goto('http://localhost:5173/studies/new');
  const fileInput3 = await page.$('input[type="file"]');
  await fileInput3.setInputFiles(path.resolve('../data/raw/brain_mri/Testing/glioma/Te-gl_1.jpg'));
  await page.click('button:has-text("Start analysis")');
  
  // Wait for rejection
  await page.waitForSelector('text=rejected', { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '../docs/stitch/live_rejection_390px.png', fullPage: true });

  await browser.close();
  console.log("Done!");
})().catch(console.error);
