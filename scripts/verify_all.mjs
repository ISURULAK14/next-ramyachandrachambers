import fs from 'fs';
import path from 'path';

const ROOT_DIR = 'D:/ANTIGRAVITY/website';
let passed = 0;
let errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
    console.error(`  FAIL: ${message}`);
  } else {
    passed++;
    console.log(`  PASS: ${message}`);
  }
}

console.log('=== RUNNING COMPREHENSIVE VERIFICATION SUITE (scripts/verify_all.mjs) ===\n');

// 1. Check sitemap.xml
console.log('1. Auditing sitemap.xml:');
const sitemap = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
assert(!sitemap.includes('about.html'), 'No non-canonical about.html in sitemap');
assert(!sitemap.includes('contact.html'), 'No non-canonical contact.html in sitemap');
assert(!sitemap.includes('services.html'), 'No non-canonical services.html in sitemap');
assert(!sitemap.includes('practice-areas.html'), 'No non-canonical practice-areas.html in sitemap');
assert(!sitemap.includes('testimonials.html'), 'No non-canonical testimonials.html in sitemap');
assert(!sitemap.includes('#'), 'No URL fragment hashes in sitemap');
assert(!sitemap.includes('hreflang="si-LK"'), 'Zero multi-language duplicate mappings in sitemap');

// 2. HTML Canonical & Meta Refresh Checks
console.log('\n2. Auditing HTML Canonicals & Meta Refreshes:');
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
let metaRefreshCount = 0;
let badCanonicals = 0;
let httpLinksCount = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  if (/meta\s+http-equiv=["']refresh["']/i.test(content)) metaRefreshCount++;
  const canon = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!canon || canon[1].includes('#')) badCanonicals++;
  const httpLinks = content.match(/href=["']http:\/\/[^"']+["']/g);
  if (httpLinks) httpLinksCount += httpLinks.length;
}
assert(metaRefreshCount === 0, `0 meta-refresh tags across all HTML files (actual: ${metaRefreshCount})`);
assert(badCanonicals === 0, `0 invalid or fragment canonical tags (actual: ${badCanonicals})`);
assert(httpLinksCount === 0, `0 insecure http:// href links in HTML (actual: ${httpLinksCount})`);

// 3. Hreflang Configuration Check
console.log('\n3. Auditing Hreflang Localization:');
let invalidHreflangs = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  if (/hreflang=["'](si-LK|de|fr|it|nl|ja|ko|zh|ar|sv|no|da|pt|el|ro)["']/i.test(content)) {
    invalidHreflangs++;
  }
}
assert(invalidHreflangs === 0, `0 duplicate language mappings in hreflang (actual: ${invalidHreflangs})`);

// 4. Orphan Pages & Link Graph Integrity
console.log('\n4. Auditing Internal Link Graph & Orphan Pages:');
const indexablePages = ['company-registration-matara.html', 'deed-lawyer-matara.html', 'notary-public-matara.html', 'faq.html'];
for (const target of indexablePages) {
  let inboundSources = 0;
  for (const file of htmlFiles) {
    if (file !== target) {
      const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
      if (content.includes(target)) inboundSources++;
    }
  }
  assert(inboundSources >= 2, `${target} has >= 2 inbound internal links (actual: ${inboundSources})`);
}

// 5. Meta Descriptions & H1 Tags
console.log('\n5. Auditing Meta Descriptions & H1 Tags:');
let missingH1 = 0;
let badMetaDescriptions = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match || !h1Match[1].trim()) missingH1++;

  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  if (!descMatch) {
    badMetaDescriptions++;
  } else {
    const len = descMatch[1].length;
    // Check indexable pages for length boundary [120, 155]
    if (['index.html', 'company-registration-matara.html', 'deed-lawyer-matara.html', 'notary-public-matara.html', 'faq.html'].includes(file)) {
      if (len < 120 || len > 155) {
        badMetaDescriptions++;
        errors.push(`${file} meta description length out of [120, 155] range: ${len}`);
      }
    }
  }
}
assert(missingH1 === 0, `0 missing or empty <h1> tags (actual: ${missingH1})`);
assert(badMetaDescriptions === 0, `0 missing or over-length meta descriptions (actual: ${badMetaDescriptions})`);

// 6. JSON-LD Schema.org Structured Data
console.log('\n6. Auditing Schema.org Structured Data:');
let schemaErrors = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  const matches = [...content.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  matches.forEach((m, idx) => {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      schemaErrors++;
      errors.push(`JSON-LD parse error in ${file} block ${idx}: ${e.message}`);
    }
  });
}
assert(schemaErrors === 0, `0 JSON-LD schema parse errors (actual: ${schemaErrors})`);

// 7. Asset Dimensions & Compression
console.log('\n7. Auditing Image Asset Sizes & Testimonial Icons:');
const images = ['kotavila1.webp', 'kotavila2.webp', 'fort.webp'];
for (const img of images) {
  const stat = fs.statSync(path.join(ROOT_DIR, img));
  assert(stat.size < 153600, `${img} is < 150 KB (actual: ${(stat.size / 1024).toFixed(1)} KB)`);
}

const indexContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
assert(!indexContent.includes('&#9733;'), 'All unicode stars replaced with zero-dependency inline SVGs');
assert(indexContent.includes('star-icon'), 'Inline SVG star-icon elements present');

// 8. Viewport & Responsive Breakpoints
console.log('\n8. Auditing Viewport Meta & Responsive Design:');
let missingViewport = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  if (!content.includes('name="viewport"') || !content.includes('width=device-width')) {
    missingViewport++;
  }
}
assert(missingViewport === 0, `0 missing viewport tags across HTML files (actual: ${missingViewport})`);

const styleMin = fs.readFileSync(path.join(ROOT_DIR, 'css/style.min.css'), 'utf8');
assert(styleMin.includes('@media'), 'Responsive media queries present in style.min.css');
assert(!styleMin.includes('transition:all') && !styleMin.includes('transition: all'), 'Zero unoptimized transition:all in style.min.css');

console.log('\n========================================================');
console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${errors.length} FAILED`);
if (errors.length > 0) {
  console.error('\nFAILURES:');
  errors.forEach(e => console.error(` - ${e}`));
  process.exit(1);
} else {
  console.log('\nALL VERIFICATION CRITERIA SATISFIED! 100% PROGRAMMATIC PASS.');
  process.exit(0);
}
