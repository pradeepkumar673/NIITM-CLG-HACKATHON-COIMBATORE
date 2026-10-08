import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('frontend/src');

// We exclude test files and configuration from the raw string audit, but we check components and pages
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.test\.ts$/,
  /\.spec\.ts$/,
  /client\//, // OpenAPI generated client
  /utils\/[a-zA-Z0-9_]+\.test\./
];

const RULES = [
  { name: 'lorem', regex: /lorem\s+ipsum/i, message: 'Lorem ipsum placeholder text found.' },
  { name: 'sample_dummy', regex: /\b(sample|dummy)\b/i, message: 'Sample or dummy placeholder found (except if in variables, but we are strict).' },
  { name: 'placeholder_text', regex: /\bplaceholder\b/i, message: 'Placeholder text found.' },
  { name: 'john_jane', regex: /\b(John|Jane)\s+Doe\b/i, message: 'John/Jane Doe name found.' },
  { name: 'math_random', regex: /Math\.random\(\)/, message: 'Math.random() used.' },
  { name: 'faker', regex: /faker\./, message: 'Faker library used.' },
  { name: 'cdn_image', regex: /https?:\/\/(unsplash\.com|placehold\.it|via\.placeholder\.com|images\.unsplash\.com|ui-avatars\.com)/i, message: 'CDN or stock image found.' },
];

let hasErrors = false;
let issues = [];

// Read justified files from docs/UI_PARITY.md
const uiParityPath = path.resolve('docs/UI_PARITY.md');
let justifiedFiles = [];
if (fs.existsSync(uiParityPath)) {
  const parityContent = fs.readFileSync(uiParityPath, 'utf-8');
  const fileMatches = [...parityContent.matchAll(/\|\s*`(frontend\/src\/[^`]+)`\s*\|/g)];
  justifiedFiles = fileMatches.map(m => path.resolve(m[1]));
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!IGNORE_PATTERNS.some(p => p.test(filePath))) {
        walkDir(filePath);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.css')) {
      if (!IGNORE_PATTERNS.some(p => p.test(filePath)) && !justifiedFiles.includes(path.resolve(filePath))) {
        checkFile(filePath);
      }
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Ignore css placeholder pseudo class, Tailwind placeholder-* utilities, and HTML placeholder attributes
    if (line.match(/::placeholder/)) return;
    if (line.match(/placeholder-[a-z0-9A-Z/_-]+/)) return;
    if (line.match(/placeholder:/)) return;
    
    // Ignore legit variable names containing placeholder (e.g. placeholder prop in React input)
    let isHtmlPlaceholder = line.match(/placeholder\s*=\s*["'{]/);
    
    for (const rule of RULES) {
      if (rule.name === 'placeholder_text' && isHtmlPlaceholder) continue;
      // Allow "sample" in variable names like "samples" or "subsamples"
      if (rule.name === 'sample_dummy' && line.match(/samples/i)) continue;

      const match = line.match(rule.regex);
      if (match) {
        // Exclude allowed justifications from UI_PARITY.md checks if any (we will print and manually fix)
        issues.push(`${filePath}:${index + 1} - [${rule.name}] ${rule.message} -> ${line.trim()}`);
        hasErrors = true;
      }
    }
    
    // Check for hardcoded dates (e.g. 24 Oct 14:12 IST) - common in Stitch UI
    if (line.match(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2}:\d{2}\s+(IST|GMT|UTC)/)) {
      issues.push(`${filePath}:${index + 1} - [hardcoded_date] Hardcoded date found -> ${line.trim()}`);
      hasErrors = true;
    }
    
    // Check for hardcoded patient names from Stitch (e.g., Ramesh Patil)
    if (line.match(/Ramesh Patil|Kashti PHC|Dr\. Arti Sharma/i)) {
      issues.push(`${filePath}:${index + 1} - [hardcoded_name] Hardcoded Stitch UI name found -> ${line.trim()}`);
      hasErrors = true;
    }
  });
}

console.log('Running placeholder audit on frontend/src...');
walkDir(SRC_DIR);

if (hasErrors) {
  console.error('\nPlaceholder Audit Failed! Issues found:');
  issues.forEach(issue => console.error(issue));
  process.exit(1);
} else {
  console.log('✅ Placeholder Audit Passed! No hardcoded or dummy data found.');
}
