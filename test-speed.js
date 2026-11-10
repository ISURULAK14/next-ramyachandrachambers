const { execSync } = require('child_process');
const fs = require('fs');

const URL_TO_TEST = 'https://ramyachandrachambers.com';
const API_KEY = process.env.PAGESPEED_API_KEY || '';

async function testCloudAPI(strategy) {
  let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(URL_TO_TEST)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
  if (API_KEY) apiUrl += `&key=${API_KEY}`;

  console.log(`\n=============================================================`);
  console.log(`[Google Cloud API] Testing ${URL_TO_TEST} (${strategy.toUpperCase()})...`);
  console.log(`=============================================================`);

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.warn(`Cloud API returned HTTP ${response.status} (${response.statusText}).`);
      return false;
    }
    const data = await response.json();
    printLighthouseReport(data.lighthouseResult, strategy, 'Google Cloud API');
    return true;
  } catch (err) {
    console.warn(`Cloud API connection error: ${err.message}`);
    return false;
  }
}

function testLocalLighthouse(strategy) {
  console.log(`\n=============================================================`);
  console.log(`[Local Lighthouse Engine] Testing ${URL_TO_TEST} (${strategy.toUpperCase()})...`);
  console.log(`=============================================================`);

  const preset = strategy === 'desktop' ? '--preset=desktop' : '';
  const reportPath = `lh_report_${strategy}.json`;

  try {
    execSync(`npx --yes lighthouse "${URL_TO_TEST}" --output=json --output-path=${reportPath} ${preset} --chrome-flags="--headless=new --no-sandbox" --quiet`, { stdio: 'pipe' });
    if (fs.existsSync(reportPath)) {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      printLighthouseReport(data, strategy, 'Local Lighthouse Engine');
      fs.unlinkSync(reportPath);
      return true;
    }
  } catch (err) {
    console.error(`Local Lighthouse error: ${err.message}`);
    return false;
  }
}

function printLighthouseReport(lhResult, strategy, source) {
  const categories = lhResult.categories || {};
  const audits = lhResult.audits || {};

  console.log(`\n--- ${strategy.toUpperCase()} SCORES (${source}) ---`);
  let allPass = true;
  for (const [key, cat] of Object.entries(categories)) {
    const score = Math.round((cat.score || 0) * 100);
    const pass = score >= 95;
    if (!pass) allPass = false;
    console.log(`  ${key.toUpperCase().padEnd(16)}: ${score}/100 ${pass ? '✔ PASS' : '✖ BELOW 95'}`);
  }

  console.log("\n--- OPPORTUNITIES / AUDIT METRICS ---");
  const coreMetrics = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
  coreMetrics.forEach(m => {
    if (audits[m]) {
      console.log(`  ${audits[m].title.padEnd(32)}: ${audits[m].displayValue || (audits[m].score * 100 + '/100')}`);
    }
  });

  if (allPass) {
    console.log(`\nSUCCESS: Target 95+ reached for ${strategy.toUpperCase()}.`);
  } else {
    console.log(`\nFAIL: Some scores below 95 for ${strategy.toUpperCase()}. Further optimization required.`);
  }
}

async function run() {
  for (const strategy of ['mobile', 'desktop']) {
    const ok = await testCloudAPI(strategy);
    if (!ok) {
      console.log(`Switching to local standalone Lighthouse engine for ${strategy.toUpperCase()}...`);
      testLocalLighthouse(strategy);
    }
  }
}

run();
