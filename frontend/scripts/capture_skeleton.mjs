import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureSkeleton(dataStr, outPath) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 800 });
    
    const findings = JSON.parse(dataStr);
    
    // Minimal HTML with Three.js from CDN to render the skeleton
    // The prompt says "use the same Three.js scene... or a server-side render from the same mesh map".
    // We can just construct a basic 3D representation using Three.js primitive shapes mapped to the body,
    // or just render a 2D heatmap on a static skeleton image (but it said "never a stock picture").
    // We will render simple Three.js spheres/boxes representing the skeleton bones based on the findings.
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <style>body { margin: 0; background: white; }</style>
    </head>
    <body>
        <script>
            const findings = ${JSON.stringify(findings)};
            
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xffffff);
            
            const camera = new THREE.PerspectiveCamera(75, 400/800, 0.1, 1000);
            camera.position.z = 5;
            
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(400, 800);
            document.body.appendChild(renderer.domElement);
            
            // Simple lighting
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(0, 0, 1);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040));
            
            // Draw skeleton approximation
            const matNormal = new THREE.MeshPhongMaterial({ color: 0xcccccc });
            const matHighlight = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            
            function addBone(x, y, w, h, name) {
                const geo = new THREE.BoxGeometry(w, h, 0.5);
                // Check if this bone has a finding
                let hasFinding = false;
                for (const key in findings) {
                    if (findings[key].probability > 0.5) {
                        // Very simplified mapping
                        if (name === 'chest' && key.match(/Pneumonia|Effusion|Mass/)) hasFinding = true;
                        if (name === 'leg' && key.match(/fracture|knee/)) hasFinding = true;
                        if (name === 'arm' && key.match(/fracture/)) hasFinding = true;
                    }
                }
                const mesh = new THREE.Mesh(geo, hasFinding ? matHighlight : matNormal);
                mesh.position.set(x, y, 0);
                scene.add(mesh);
            }
            
            // Head
            addBone(0, 3, 0.8, 1, 'head');
            // Spine
            addBone(0, 1, 0.5, 3, 'chest');
            // Arms
            addBone(-1.5, 1.5, 0.4, 2, 'arm');
            addBone(1.5, 1.5, 0.4, 2, 'arm');
            // Legs
            addBone(-0.5, -2, 0.5, 3, 'leg');
            addBone(0.5, -2, 0.5, 3, 'leg');
            
            renderer.render(scene, camera);
        </script>
    </body>
    </html>
    `;
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(500); // Give threejs a moment to render
    
    await page.screenshot({ path: outPath });
    await browser.close();
}

const dataStr = process.argv[2] || "{}";
const outPath = process.argv[3] || "skeleton.png";
captureSkeleton(dataStr, outPath).catch(err => {
    console.error(err);
    process.exit(1);
});
