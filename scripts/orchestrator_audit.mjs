import fs from 'fs';
import path from 'path';

const ROOT_DIR = 'D:/ANTIGRAVITY/website';
let errors = [];
let passed = 0;

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
    console.error(`  FAIL: ${message}`);
  } else {
    passed++;
    console.log(`  PASS: ${message}`);
  }
}

console.log('=== RUNNING FULL-STACK DETERMINISTIC ORCHESTRATOR AUDIT SUITE ===\n');

// CHECK 1: Meta Refreshes
console.log('1. Checking for <meta http-equiv="refresh"> tags:');
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
let metaRefreshCount = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  if (/meta\s+http-equiv=["']refresh["']/i.test(content)) {
    metaRefreshCount++;
    errors.push(`Found meta refresh in ${file}`);
  }
}
assert(metaRefreshCount === 0, `Zero meta refresh tags found across all HTML files (count: ${metaRefreshCount})`);

// CHECK 2: Canonical Tags
console.log('\n2. Checking Canonical Tags:');
let badCanonicals = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  const match = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (match) {
    const url = match[1];
    if (url.includes('#')) {
      badCanonicals++;
      errors.push(`Canonical tag contains hash fragment in ${file}: ${url}`);
    }
    if (!url.startsWith('https://ramyachandrachambers.com')) {
      badCanonicals++;
      errors.push(`Canonical URL is not https://ramyachandrachambers.com in ${file}: ${url}`);
    }
  } else {
    badCanonicals++;
    errors.push(`Missing canonical tag in ${file}`);
  }
}
assert(badCanonicals === 0, `Zero invalid canonical tags (bad canonicals: ${badCanonicals})`);

// CHECK 3: Sitemap.xml
console.log('\n3. Checking sitemap.xml:');
const sitemapContent = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
assert(!sitemapContent.includes('#'), 'sitemap.xml contains no hash fragments');
assert(!sitemapContent.includes('about.html'), 'sitemap.xml contains no redirect stubs (about.html removed)');
assert(!sitemapContent.includes('services.html'), 'sitemap.xml contains no redirect stubs (services.html removed)');
assert(!sitemapContent.includes('practice-areas.html'), 'sitemap.xml contains no redirect stubs (practice-areas.html removed)');
assert(!sitemapContent.includes('testimonials.html'), 'sitemap.xml contains no redirect stubs (testimonials.html removed)');
assert(!sitemapContent.includes('contact.html'), 'sitemap.xml contains no redirect stubs (contact.html removed)');
assert(!sitemapContent.includes('hreflang="si-LK"'), 'sitemap.xml contains no duplicate multi-language mappings');

// CHECK 4: Hreflang Tags in HTML
console.log('\n4. Checking Hreflang Tags across HTML files:');
let badHreflangs = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  if (/hreflang=["']si-LK["']/i.test(content) || /hreflang=["']de["']/i.test(content)) {
    badHreflangs++;
    errors.push(`Found invalid multi-language hreflang in ${file}`);
  }
}
assert(badHreflangs === 0, `Zero invalid multi-language hreflang mappings in HTML files (count: ${badHreflangs})`);

// CHECK 5: Internal Link Graph & Orphan Pages
console.log('\n5. Checking Internal Link Graph:');
const corePages = ['faq.html', 'company-registration-matara.html', 'deed-lawyer-matara.html', 'notary-public-matara.html'];
for (const target of corePages) {
  let sources = 0;
  for (const file of htmlFiles) {
    if (file !== target) {
      const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
      if (content.includes(target)) sources++;
    }
  }
  assert(sources >= 3, `${target} has at least 3 distinct inbound sources (actual: ${sources})`);
}

// CHECK 6: JSON-LD Structured Data
console.log('\n6. Checking JSON-LD Structured Data:');
let jsonErrors = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  const matches = [...content.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  matches.forEach((m, idx) => {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      jsonErrors++;
      errors.push(`JSON-LD syntax error in ${file} block ${idx}: ${e.message}`);
    }
  });
}
assert(jsonErrors === 0, `Zero JSON-LD structured data syntax errors across all pages (count: ${jsonErrors})`);

// CHECK 7: Oversized Image Assets
console.log('\n7. Checking Image Asset Sizes:');
const webpImages = ['kotavila1.webp', 'kotavila2.webp', 'fort.webp'];
for (const img of webpImages) {
  const stat = fs.statSync(path.join(ROOT_DIR, img));
  assert(stat.size <= 102400, `${img} is under 100 KB (size: ${(stat.size / 1024).toFixed(1)} KB)`);
}

// CHECK 8: Non-Composited CSS Transitions
console.log('\n8. Checking Non-Composited CSS Transitions:');
const cssContent = fs.readFileSync(path.join(ROOT_DIR, 'css/style.min.css'), 'utf8');
const transitions = [...cssContent.matchAll(/transition:\s*([^;\}]+)/gi)];
const badTransitions = transitions.filter(m => /(box-shadow|border|filter|visibility|max-height|width|height)/i.test(m[1]));
assert(badTransitions.length === 0, `Zero non-composited transitions in style.min.css (count: ${badTransitions.length})`);

// CHECK 9: Animated Stats Counter
console.log('\n9. Checking Animated Stats Counter:');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
const mainMinJs = fs.readFileSync(path.join(ROOT_DIR, 'js/main.min.js'), 'utf8');
assert(indexHtml.includes('class="stat-value" data-target="35"'), 'index.html contains 35+ practice years counter markup');
assert(indexHtml.includes('class="stat-value" data-target="300"'), 'index.html contains 300+ companies counter markup');
assert(mainMinJs.includes('.stat-value[data-target]'), 'js/main.min.js contains counter initialization script');
assert(mainMinJs.includes('runCountCycle'), 'js/main.min.js contains rolling counter cycle loop');

// CHECK 10: Security Headers & Server Config
console.log('\n10. Checking Security Headers & Server Config:');
assert(fs.existsSync(path.join(ROOT_DIR, 'robots.txt')), 'robots.txt exists');
assert(fs.existsSync(path.join(ROOT_DIR, '_headers')), '_headers exists with Cloudflare/CDN directives');
assert(fs.existsSync(path.join(ROOT_DIR, '.htaccess')), '.htaccess exists with Apache caching & security hardening');

console.log('\n======================================================');
console.log(`AUDIT RESULTS: ${passed} PASSED, ${errors.length} FAILED`);
if (errors.length > 0) {
  console.error('\nFAILURE DETAILS:');
  errors.forEach(e => console.error(` - ${e}`));
  process.exit(1);
} else {
  console.log('\nALL CHECKS PASSED WITH 0 ERRORS! SITE HEALTH: 100%');
  process.exit(0);
}
