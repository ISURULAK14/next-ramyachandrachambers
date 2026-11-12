const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8135;
const BASE = `http://127.0.0.1:${PORT}`;

const CONTENT_PAGES = [
  'index.html',
  'faq.html',
  '404.html',
  'notary-public-matara.html',
  'deed-lawyer-matara.html',
  'company-registration-matara.html',
  'overseas-power-of-attorney-sri-lanka.html',
  'land-registry-title-search-sri-lanka.html',
  'company-registration-sri-lanka-beneficial-ownership.html',
  'land-partition-law-procedure-sri-lanka.html',
  'foreign-investment-property-acquisition-sri-lanka.html',
  'last-will-testamentary-probate-sri-lanka.html',
  'privacy-policy.html',
  'terms-of-engagement.html'
];

const REDIRECT_PAGES = [
  'about.html',
  'services.html',
  'practice-areas.html',
  'testimonials.html',
  'contact.html'
];

const ALL_PRODUCTION_HTML = [...CONTENT_PAGES, ...REDIRECT_PAGES];

function createServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0].split('#')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT, decodeURIComponent(reqPath));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.webmanifest': 'application/manifest+json; charset=utf-8',
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.jfif': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml',
        '.txt': 'text/plain; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8'
      };
      res.writeHead(200, {
        'Content-Type': mimeMap[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

function readLocal(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function existsLocal(relPath) {
  const clean = relPath.split('?')[0].split('#')[0].replace(/^\//, '');
  if (!clean) return fs.existsSync(path.join(ROOT, 'index.html'));
  return fs.existsSync(path.join(ROOT, clean));
}

function stripHtmlTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function runFullSuite() {
  const report = { total: 0, passed: 0, failed: 0, failures: [] };

  function check(cond, name, details = '') {
    report.total++;
    if (cond) {
      report.passed++;
      console.log(`  [PASS] ${name}`);
    } else {
      report.failed++;
      report.failures.push({ name, details });
      console.error(`  [FAIL] ${name}${details ? ' -> ' + details : ''}`);
    }
  }

  // =========================================================================
  // SUITE 1: STATIC CONFIG, SITEMAP, ROBOTS, MANIFESTS, SW & HEADERS
  // =========================================================================
  console.log('\n=== SUITE 1: STATIC CONFIG, SITEMAP, ROBOTS, MANIFESTS, SW & HEADERS ===');

  const requiredFiles = [
    'robots.txt', 'sitemap.xml', 'manifest.json', 'site.webmanifest',
    'sw.js', '_headers', '.htaccess', 'CNAME', 'BingSiteAuth.xml',
    'llms.txt', 'llms-full.txt', 'ai.txt', 'agents.json', 'ads.txt', 'security.txt',
    '.well-known/ai.txt', '.well-known/agents.json', '.well-known/security.txt',
    'css/style.css', 'css/style.min.css', 'js/main.js', 'js/main.min.js'
  ];
  for (const f of requiredFiles) {
    check(existsLocal(f), `Required file exists: ${f}`);
  }

  // Validate JSON manifests
  for (const jf of ['manifest.json', 'site.webmanifest', 'agents.json', '.well-known/agents.json', 'openrtb.json']) {
    if (existsLocal(jf)) {
      let parsed = null;
      let ok = false;
      try {
        parsed = JSON.parse(readLocal(jf));
        ok = true;
      } catch (e) {
        ok = false;
      }
      check(ok, `Valid JSON: ${jf}`);
      if (parsed && Array.isArray(parsed.icons)) {
        for (const ic of parsed.icons) {
          check(existsLocal(ic.src), `${jf} icon exists: ${ic.src}`);
        }
      }
    }
  }

  // Robots.txt check
  const robotsTxt = readLocal('robots.txt');
  check(/Sitemap:\s*https:\/\/ramyachandrachambers\.com\/sitemap\.xml/i.test(robotsTxt), 'robots.txt declares Sitemap URL');
  check(/User-agent:\s*\*/i.test(robotsTxt) && /Allow:\s*\//i.test(robotsTxt), 'robots.txt allows global crawling');

  // Sitemap.xml vs production HTML files
  const sitemapXml = readLocal('sitemap.xml');
  const locMatches = [...sitemapXml.matchAll(/<loc>(https:\/\/ramyachandrachambers\.com\/([^<]*))<\/loc>/g)];
  const sitemapFiles = locMatches.map(m => m[2] || 'index.html');
  check(locMatches.length >= 18, `sitemap.xml lists expected URLs (found ${locMatches.length})`);
  for (const sf of sitemapFiles) {
    check(existsLocal(sf), `sitemap.xml target exists on disk: ${sf}`);
  }
  for (const pf of ALL_PRODUCTION_HTML) {
    if (pf === '404.html') continue;
    check(sitemapFiles.includes(pf), `sitemap.xml includes production page: ${pf}`);
  }

  // Service Worker precache asset check + version parity check
  const swContent = readLocal('sw.js');
  const swAssets = [...swContent.matchAll(/'(\/[^']*)'/g)].map(m => m[1]);
  check(swAssets.length > 10, `sw.js has precache assets (${swAssets.length})`);
  for (const asset of swAssets) {
    check(existsLocal(asset), `sw.js precache asset exists: ${asset}`);
  }
  const indexHtmlRaw = readLocal('index.html');
  const indexCssVer = (indexHtmlRaw.match(/style\.min\.css\?v=([^"']+)/) || [])[1];
  const swCssVer = (swContent.match(/style\.min\.css\?v=([^"']+)/) || [])[1];
  check(indexCssVer && swCssVer && indexCssVer === swCssVer, `sw.js CSS cache version (${swCssVer}) matches index.html (${indexCssVer})`);

  // Security headers check in _headers and .htaccess
  const headersRaw = readLocal('_headers');
  const htaccessRaw = readLocal('.htaccess');
  for (const h of ['Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Content-Security-Policy', 'Permissions-Policy']) {
    check(headersRaw.includes(h), `_headers enforces ${h}`);
    check(htaccessRaw.includes(h), `.htaccess enforces ${h}`);
  }

  // Minification freshness check for CSS
  const minCssRaw = readLocal('css/style.min.css');
  check(minCssRaw.includes('.google-reviews-carousel') && minCssRaw.includes('margin-top: auto !important') || minCssRaw.includes('margin-top:auto !important') || minCssRaw.includes('margin-top:auto!important'), 'css/style.min.css contains latest mobile review overlap fixes');

  // Compare js/main.js vs js/main.min.js key markers
  const mainJsRaw = readLocal('js/main.js');
  const mainMinJsRaw = readLocal('js/main.min.js');
  for (const marker of ['initProtectedEmails', 'initLazyIframes', 'faq-category-btn', 'pin-malaysia', 'carousel-next', 'pixel-cursor-ready']) {
    check(mainJsRaw.includes(marker), `js/main.js contains ${marker}`);
    check(mainMinJsRaw.includes(marker), `js/main.min.js contains ${marker} (up-to-date minification)`);
  }

  // =========================================================================
  // SUITE 2: STATIC HTML, SEO, STRUCTURED DATA & ASSET/LINK PARITY (ALL PAGES)
  // =========================================================================
  console.log('\n=== SUITE 2: HTML, SEO, STRUCTURED DATA & ASSET/LINK INTEGRITY ===');

  const htmlIdsCache = new Map();
  function getIdsForPage(file) {
    if (!htmlIdsCache.has(file)) {
      const content = readLocal(file);
      const ids = new Set([...content.matchAll(/\sid=["']([^"']+)["']/gi)].map(m => m[1]));
      htmlIdsCache.set(file, ids);
    }
    return htmlIdsCache.get(file);
  }

  // Check asset CSS version consistency across all content pages
  for (const pageFile of CONTENT_PAGES) {
    const html = readLocal(pageFile);

    // Basic tags
    check(/<!DOCTYPE html>/i.test(html), `${pageFile}: has DOCTYPE html`);
    check(/<html[^>]+lang=["']en["']/i.test(html), `${pageFile}: has lang="en"`);
    check(/<meta[^>]+charset=["']?utf-8["']?/i.test(html), `${pageFile}: has UTF-8 charset`);
    check(/<meta[^>]+name=["']viewport["'][^>]+width=device-width/i.test(html), `${pageFile}: has responsive viewport`);

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    check(titleMatch && titleMatch[1].trim().length >= 10, `${pageFile}: has valid <title>`);
    check(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html), `${pageFile}: has meta description`);

    // Canonical & HTTPS
    const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    if (pageFile === '404.html') {
      check(!canonMatch || canonMatch[1].startsWith('https://'), `${pageFile}: canonical HTTPS if present`);
    } else {
      check(canonMatch && canonMatch[1].startsWith('https://ramyachandrachambers.com/'), `${pageFile}: has valid HTTPS canonical`);
    }

    // No invalid <meta http-equiv="X-Frame-Options">
    check(!/<meta[^>]+http-equiv=["']X-Frame-Options["']/i.test(html), `${pageFile}: no invalid meta X-Frame-Options`);

    // Single H1
    const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
    check(h1Count === 1, `${pageFile}: has exactly 1 <h1> (actual: ${h1Count})`);

    // Landmark tags
    check(/<main[\s>]/i.test(html) && /<footer[\s>]/i.test(html), `${pageFile}: has <main> and <footer> landmarks`);

    // Stylesheet version parity
    const cssHrefMatch = html.match(/href=["'](css\/style\.min\.css(?:\?v=[^"']+)?)["']/i);
    check(Boolean(cssHrefMatch), `${pageFile}: loads css/style.min.css`);
    if (cssHrefMatch && indexCssVer) {
      check(cssHrefMatch[1].includes(`?v=${indexCssVer}`), `${pageFile}: stylesheet cache-buster matches v=${indexCssVer} (actual: ${cssHrefMatch[1]})`);
    }

    // Main JS loaded if footer has privacy/terms modal trigger or interactive widgets
    if (html.includes('id="privacy-modal"') || html.includes('class="faq-card"') || html.includes('class="protected-email"') || html.includes('data-src=')) {
      check(/src=["']js\/main\.min\.js/i.test(html), `${pageFile}: loads js/main.min.js for interactive features/modals/email hydration`);
    }

    // Footer links parity (all content pages that open modals in same page should actually have the modal, or link cleanly without broken role="button")
    if (html.includes('id="open-privacy-link"') && !html.includes('id="privacy-modal"')) {
      check(!html.includes('id="open-privacy-link" role="button" aria-haspopup="dialog"') && !/aria-haspopup=["']dialog["']/.test((html.match(/<a[^>]+open-privacy-link[^>]*>/i) || [''])[0]),
        `${pageFile}: open-privacy-link should not advertise aria-haspopup="dialog" when privacy-modal does not exist in DOM`);
    }

    // JSON-LD validation
    const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    if (pageFile !== '404.html') {
      check(jsonLdBlocks.length > 0, `${pageFile}: has JSON-LD structured data`);
    }
    jsonLdBlocks.forEach((b, idx) => {
      let jsonOk = false;
      try {
        JSON.parse(b[1]);
        jsonOk = true;
      } catch (e) {
        jsonOk = false;
      }
      check(jsonOk, `${pageFile}: JSON-LD block #${idx + 1} parses cleanly`);
    });

    // Mixed content check (http:// inside src or stylesheet href)
    const mixedContent = [...html.matchAll(/(?:src|data-src)=["'](http:\/\/[^"']+)["']/gi)];
    check(mixedContent.length === 0, `${pageFile}: zero HTTP mixed-content resources`);

    // target="_blank" security check (noopener/noreferrer)
    const blankLinks = [...html.matchAll(/<a\b([^>]*target=["']_blank["'][^>]*)>/gi)];
    let unsafeBlanks = [];
    for (const m of blankLinks) {
      const attrs = m[1];
      if (!/rel=["'][^"']*(?:noopener|noreferrer)/i.test(attrs)) {
        unsafeBlanks.push(attrs.slice(0, 80));
      }
    }
    check(unsafeBlanks.length === 0, `${pageFile}: all target="_blank" links include rel="noopener" (${unsafeBlanks.length} unsafe)`);

    // Image alt check
    const imgs = [...html.matchAll(/<img\b([^>]*)>/gi)];
    for (const im of imgs) {
      const attrs = im[1];
      check(/alt=["'][^"']+["']/i.test(attrs) || /aria-hidden=["']true["']/i.test(attrs), `${pageFile}: <img> has non-empty alt (${attrs.match(/src=["']([^"']+)["']/)?.[1] || 'unknown'})`);
    }

    // Local resource and internal link resolution
    const assetMatches = [...html.matchAll(/(?:href|src|srcset)=["']([^"']+)["']/gi)];
    for (const am of assetMatches) {
      const rawUrl = am[1].split(' ')[0].trim();
      if (!rawUrl || rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:') || rawUrl.startsWith('data:') || rawUrl.startsWith('javascript:')) continue;

      if (rawUrl.startsWith('#')) {
        if (rawUrl === '#') continue; // protected-email placeholder
        const idTarget = rawUrl.slice(1);
        const ids = getIdsForPage(pageFile);
        check(ids.has(idTarget), `${pageFile}: in-page anchor ${rawUrl} resolves to valid #id`);
      } else {
        const [pathPart, hashPart] = rawUrl.split('#');
        const targetFile = pathPart === '/' ? 'index.html' : pathPart.replace(/^\//, '');
        check(existsLocal(targetFile), `${pageFile}: internal ref "${rawUrl}" resolves on disk`);
        if (hashPart && existsLocal(targetFile) && targetFile.endsWith('.html')) {
          const targetIds = getIdsForPage(targetFile);
          check(targetIds.has(hashPart), `${pageFile}: cross-page anchor "${rawUrl}" resolves to #${hashPart} in ${targetFile}`);
        }
      }
    }
  }

  // Verify faq.html FAQPage JSON-LD matches visible FAQ questions
  const faqHtml = readLocal('faq.html');
  const faqLdMatch = faqHtml.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (faqLdMatch) {
    try {
      const faqSchema = JSON.parse(faqLdMatch[1]);
      const faqEntity = faqSchema.mainEntity || (Array.isArray(faqSchema['@graph']) ? faqSchema['@graph'].find(n => n['@type'] === 'FAQPage')?.mainEntity : null);
      const visibleQMatches = [...faqHtml.matchAll(/class=["'][^"']*faq-question[^"']*["'][^>]*>([\s\S]*?)<\//gi)].map(m => stripHtmlTags(m[1]));
      check(Array.isArray(faqEntity) && faqEntity.length === visibleQMatches.length, `faq.html: JSON-LD FAQPage count (${faqEntity?.length}) matches visible FAQ cards (${visibleQMatches.length})`);
    } catch (e) {}
  }

  // =========================================================================
  // START HTTP SERVER & PUPPETEER FOR RUNTIME, RESPONSIVE & INTERACTIVE SUITES
  // =========================================================================
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // =======================================================================
    // SUITE 3: RUNTIME CONSOLE, NETWORK, IMAGES, COOKIES & REDIRECTS (ALL 19)
    // =======================================================================
    console.log('\n=== SUITE 3: RUNTIME CONSOLE, NETWORK, IMAGES, COOKIES & REDIRECTS ===');
    const page = await browser.newPage();

    // Test every content page at Desktop (1440x900)
    await page.setViewport({ width: 1440, height: 900 });
    for (const p of CONTENT_PAGES) {
      // Clear cookies before visiting each page so pre-consent check is isolated per page
      const existingCookies = await page.cookies();
      if (existingCookies.length) await page.deleteCookie(...existingCookies);
      const errors = [];
      const failedLocalReqs = [];
      const onConsole = msg => {
        if (msg.type() === 'error') {
          const txt = msg.text();
          // Ignore external third-party map/clarity network noise if offline/blocked in headless sandbox
          if (!txt.includes('clarity.ms') && !txt.includes('googletagmanager') && !txt.includes('maps.google')) {
            errors.push(txt);
          }
        }
      };
      const onPageError = err => errors.push(err.message);
      const onResp = resp => {
        const u = resp.url();
        if (u.startsWith(BASE) && resp.status() >= 400 && !u.endsWith('favicon.ico')) {
          failedLocalReqs.push(`${resp.status()} ${u}`);
        }
      };

      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      page.on('response', onResp);

      const urlPath = p === 'index.html' ? '/' : `/${p}`;
      const resp = await page.goto(BASE + urlPath, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await new Promise(r => setTimeout(r, 350));

      check(resp && resp.status() === 200, `${p}: HTTP 200 OK`);
      check(errors.length === 0, `${p}: zero runtime console/page errors`, errors.join('; '));
      check(failedLocalReqs.length === 0, `${p}: zero failed local requests`, failedLocalReqs.join('; '));

      // Check zero tracking cookies set before interaction
      const cookies = await page.cookies();
      const trackingCookies = cookies.filter(c => /^(_ga|_gid|_clck|_clsk)/.test(c.name));
      check(trackingCookies.length === 0, `${p}: zero pre-consent tracking cookies set`);

      // Check all visible <img> elements loaded cleanly
      const imgResults = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll('img')];
        return imgs.map(img => ({
          src: img.getAttribute('src'),
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          loading: img.getAttribute('loading')
        }));
      });
      for (const ir of imgResults) {
        if (ir.loading !== 'lazy') {
          check(ir.complete && ir.naturalWidth > 0, `${p}: eager image loaded (${ir.src})`);
        }
      }

      // Check protected email hydration on pages containing .protected-email
      const hasEmailEl = await page.$('.protected-email');
      if (hasEmailEl) {
        const hydrated = await page.evaluate(() => {
          return [...document.querySelectorAll('.protected-email')].every(el => el.href && el.href.startsWith('mailto:') && el.textContent.includes('@'));
        });
        check(hydrated, `${p}: .protected-email hydrated properly`);
      }

      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('response', onResp);
    }

    // Test redirect pages
    for (const rp of REDIRECT_PAGES) {
      await page.goto(`${BASE}/${rp}`, { waitUntil: 'networkidle0', timeout: 15000 });
      const finalUrl = page.url();
      const expectedHash = '#' + rp.replace('.html', '');
      check(finalUrl.includes(expectedHash) || finalUrl.endsWith('/'), `Redirect ${rp} routes to ${expectedHash} (actual: ${finalUrl})`);
    }

    // =======================================================================
    // SUITE 4: MULTI-VIEWPORT RESPONSIVE, OVERFLOW, COLLISION & TAP TARGETS
    // =======================================================================
    console.log('\n=== SUITE 4: RESPONSIVE OVERFLOW, COLLISIONS & TAP TARGETS (1440 / 768 / 390 / 360) ===');
    const viewports = [
      { name: 'Desktop 1440px', width: 1440, height: 900, isMobile: false, hasTouch: false },
      { name: 'Tablet 768px', width: 768, height: 1024, isMobile: true, hasTouch: true },
      { name: 'Mobile 390px', width: 390, height: 844, isMobile: true, hasTouch: true },
      { name: 'Small Mobile 360px', width: 360, height: 780, isMobile: true, hasTouch: true }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.hasTouch });

      for (const p of CONTENT_PAGES) {
        const urlPath = p === 'index.html' ? '/' : `/${p}`;
        await page.goto(BASE + urlPath, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 200));

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        }));
        check(overflow.scrollWidth <= overflow.clientWidth,
          `${vp.name} | ${p}: zero horizontal overflow (${overflow.scrollWidth} <= ${overflow.clientWidth})`);
      }

      // Deep Layout & Collision Audit on index.html for this viewport
      await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 350));

      const layoutAudit = await page.evaluate((vw) => {
        const issues = [];
        const box = el => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
        };
        const overlaps = (a, b, tol = 2) => {
          if (!a || !b) return false;
          return !(a.right <= b.left + tol || b.right <= a.left + tol || a.bottom <= b.top + tol || b.bottom <= a.top + tol);
        };

        // 1. Hero Title Words within viewport and non-overlapping each other
        const w1 = box(document.querySelector('.title-word-one'));
        const w2 = box(document.querySelector('.title-word-two'));
        const w3 = box(document.querySelector('.title-word-three'));
        if (w1 && w2 && w3) {
          if (overlaps(w1, w2)) issues.push('Hero title-word-one overlaps title-word-two');
          if (overlaps(w2, w3)) issues.push('Hero title-word-two overlaps title-word-three');
          for (const [label, w] of [['title-word-one', w1], ['title-word-two', w2], ['title-word-three', w3]]) {
            if (w.left < -1 || w.right > vw + 1) {
              issues.push(`Hero ${label} clips outside viewport (left=${w.left.toFixed(1)}, right=${w.right.toFixed(1)}, vw=${vw})`);
            }
          }
        }

        // 2. Hero title doesn't overlap hero subtitle
        const heroTitle = box(document.querySelector('.hero-title-stepped'));
        const heroSub = box(document.querySelector('.hero-subtitle'));
        if (overlaps(heroTitle, heroSub)) issues.push('Hero title overlaps hero subtitle');

        // 3. Banner stats items within card and non-overlapping
        const statItems = [...document.querySelectorAll('.banner-stats .stat-item')].map(box);
        for (let i = 0; i < statItems.length; i++) {
          if (statItems[i].left < 0 || statItems[i].right > vw + 1) {
            issues.push(`Stat item #${i + 1} overflows viewport`);
          }
          for (let j = i + 1; j < statItems.length; j++) {
            if (overlaps(statItems[i], statItems[j])) {
              issues.push(`Stat item #${i + 1} overlaps #${j + 1}`);
            }
          }
        }

        // 4. Review cards collision checks (Fort & Kamburugamuwa)
        for (const cardId of ['#review-card-fort', '#review-card-kamburugamuwa']) {
          const card = document.querySelector(cardId);
          if (!card) {
            issues.push(`Missing ${cardId}`);
            continue;
          }
          const header = box(card.querySelector('.google-review-header'));
          const btn = box(card.querySelector('.google-maps-btn'));
          const badge = box(card.querySelector('.google-badge-left'));
          const slide = box(card.querySelector('.google-review-slide.is-active'));
          const avatar = box(card.querySelector('.google-review-slide.is-active .reviewer-avatar'));
          const name = box(card.querySelector('.google-review-slide.is-active .reviewer-name'));
          const nav = box(card.querySelector('.carousel-nav'));

          if (overlaps(badge, btn)) issues.push(`${cardId}: badge overlaps maps button`);
          if (overlaps(header, slide)) issues.push(`${cardId}: header overlaps active review slide`);
          if (overlaps(btn, avatar) || overlaps(btn, name)) issues.push(`${cardId}: maps button overlaps avatar/name`);
          if (overlaps(slide, nav)) issues.push(`${cardId}: active slide overlaps carousel nav`);
          if (btn && btn.height < 40 && vw <= 768) issues.push(`${cardId}: maps btn touch height < 40px (${btn.height})`);
        }

        // 5. Sticky nav check
        const nav = document.querySelector('nav.site-nav');
        if (nav) {
          const navStyle = getComputedStyle(nav);
          if (navStyle.position !== 'fixed') issues.push(`nav.site-nav position is ${navStyle.position}, expected fixed`);
        }

        return issues;
      }, vp.width);

      check(layoutAudit.length === 0, `${vp.name} | index.html: zero layout overlaps/clipping`, layoutAudit.join(' | '));
    }

    // Mobile Touch Target Audit on index.html and faq.html (390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 300));
    const smallButtonsIndex = await page.evaluate(() => {
      const selectors = 'button, .btn, .google-maps-btn, .carousel-btn, .nav-link, .footer-link, .legal-modal-close, .accordion-header, .guide-card-btn';
      const bad = [];
      for (const el of document.querySelectorAll(selectors)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.width < 44 || r.height < 44) {
          bad.push(`${el.tagName}.${el.className}(${Math.round(r.width)}x${Math.round(r.height)})`);
        }
      }
      return bad;
    });
    check(smallButtonsIndex.length === 0, `Mobile 390px | index.html: all controls/CTA buttons >= 44px touch target`, smallButtonsIndex.join(', '));

    await page.goto(BASE + '/faq.html', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 300));
    const smallButtonsFaq = await page.evaluate(() => {
      const selectors = 'button, .btn, .faq-category-btn, .faq-header, .nav-link, .footer-link';
      const bad = [];
      for (const el of document.querySelectorAll(selectors)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.height < 44 || r.width < 44) {
          bad.push(`${el.tagName}.${el.className}(${Math.round(r.width)}x${Math.round(r.height)})`);
        }
      }
      return bad;
    });
    check(smallButtonsFaq.length === 0, `Mobile 390px | faq.html: all buttons/tabs >= 44px touch target`, smallButtonsFaq.join(', '));

    // =======================================================================
    // SUITE 5: DEEP INTERACTIVE FEATURE TESTING
    // =======================================================================
    console.log('\n=== SUITE 5: DEEP INTERACTIVE FUNCTIONALITY & ACCESSIBILITY ===');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    // 5A. Services Accordions (Desktop Row Sync + aria-expanded)
    const serviceCount = await page.$$eval('.service-card', els => els.length);
    check(serviceCount === 6, `Services grid has 6 cards (actual: ${serviceCount})`);
    await page.click('.service-card:nth-child(1) .accordion-header');
    await new Promise(r => setTimeout(r, 950));
    const desktopRowOpen = await page.evaluate(() => {
      const c1 = document.querySelector('.service-card:nth-child(1)');
      const c2 = document.querySelector('.service-card:nth-child(2)');
      const h1 = c1.querySelector('.accordion-header');
      return c1.classList.contains('is-open') && c2.classList.contains('is-open') && h1.getAttribute('aria-expanded') === 'true' && c1.querySelector('.accordion-content').offsetHeight > 50;
    });
    check(desktopRowOpen, 'Desktop Services: clicking Card 1 expands entire row and sets aria-expanded="true"');

    await page.click('.service-card:nth-child(1) .accordion-header');
    await new Promise(r => setTimeout(r, 950));
    const desktopRowClosed = await page.evaluate(() => {
      const c1 = document.querySelector('.service-card:nth-child(1)');
      const h1 = c1.querySelector('.accordion-header');
      return !c1.classList.contains('is-open') && h1.getAttribute('aria-expanded') === 'false' && c1.querySelector('.accordion-content').offsetHeight === 0;
    });
    check(desktopRowClosed, 'Desktop Services: clicking Card 1 again collapses row and resets aria-expanded="false"');

    // 5B. Both Review Carousels (Fort 22 reviews & Kamburugamuwa 15 reviews) + dots + prev/next + longest review overflow test on mobile
    const reviewCounts = await page.evaluate(() => ({
      fort: document.querySelectorAll('#review-card-fort .google-review-slide').length,
      kamb: document.querySelectorAll('#review-card-kamburugamuwa .google-review-slide').length
    }));
    check(reviewCounts.fort === 22, `Fort card has all 22 Google reviews (actual: ${reviewCounts.fort})`);
    check(reviewCounts.kamb === 15, `Kamburugamuwa card has all 15 Google reviews (actual: ${reviewCounts.kamb})`);

    for (const cardSel of ['#review-card-fort', '#review-card-kamburugamuwa']) {
      await page.hover(cardSel);
      await page.click(`${cardSel} .carousel-next`);
      await new Promise(r => setTimeout(r, 150));
      const cAfterNext = await page.$eval(`${cardSel} .carousel-counter`, el => el.textContent.trim());
      check(cAfterNext.startsWith('2 / '), `${cardSel}: Next advances counter to "${cAfterNext}"`);

      await page.click(`${cardSel} .carousel-prev`);
      await new Promise(r => setTimeout(r, 150));
      const cAfterPrev = await page.$eval(`${cardSel} .carousel-counter`, el => el.textContent.trim());
      check(cAfterPrev.startsWith('1 / '), `${cardSel}: Prev returns counter to "${cAfterPrev}"`);

      const dot3 = await page.$(`${cardSel} .carousel-dot:nth-child(4)`);
      if (dot3) {
        await dot3.click();
        await new Promise(r => setTimeout(r, 150));
        const cAfterDot = await page.$eval(`${cardSel} .carousel-counter`, el => el.textContent.trim());
        check(cAfterDot.startsWith('4 / '), `${cardSel}: Clicking 4th dot jumps to "${cAfterDot}"`);
      }
    }

    // 5C. World Map 35 Pins & Interactive Cohort Behavior
    const mapStats = await page.evaluate(() => {
      const wrapper = document.querySelector('.map-wrapper');
      const wW = wrapper ? wrapper.getBoundingClientRect().width : 0;
      const wH = wrapper ? wrapper.getBoundingClientRect().height : 0;
      const pins = [...document.querySelectorAll('.map-pin')];
      const ids = pins.map(p => p.id);
      const uniqueIds = new Set(ids);
      const outOfBounds = pins.filter(p => {
        const x = p.offsetLeft;
        const y = p.offsetTop;
        return !wW || !wH || x < 0 || x > wW || y < 0 || y > wH;
      }).map(p => p.id);
      return { count: pins.length, uniqueCount: uniqueIds.size, outOfBounds };
    });
    check(mapStats.count === 35 && mapStats.uniqueCount === 35, `World Map has 35 unique country pins (actual: ${mapStats.count})`);
    check(mapStats.outOfBounds.length === 0, `All 35 World Map pins positioned inside map bounds`, mapStats.outOfBounds.join(', '));

    // Verify all cohort IDs in main.js exist in DOM
    const cohortIds = [...mainJsRaw.matchAll(/'(pin-[a-z]+)'/g)].map(m => m[1]);
    const domPinIds = await page.$$eval('.map-pin', els => els.map(e => e.id));
    for (const cid of cohortIds) {
      check(domPinIds.includes(cid), `World Map DOM contains cohort pin #${cid}`);
    }

    // Scroll map into view (move mouse away first so virtual cursor does not hover .map-wrapper and pause cycle)
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.querySelector('.map-wrapper')?.scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 800));
    const mapActiveCheck = await page.evaluate(() => {
      const activePins = [...document.querySelectorAll('.map-pin.active')];
      const labelVisible = activePins.some(p => {
        const lbl = p.querySelector('.pin-label');
        return lbl && getComputedStyle(lbl).visibility === 'visible' && parseFloat(getComputedStyle(lbl).opacity) > 0.5;
      });
      return { activeCount: activePins.length, labelVisible };
    });
    check(mapActiveCheck.activeCount >= 1 && mapActiveCheck.labelVisible, `World Map: cohort cycling activates pins & labels (${mapActiveCheck.activeCount} active)`);

    // 5D. Lazy Iframes & Offices Promotion on Scroll
    await page.evaluate(async () => {
      const frames = [...document.querySelectorAll('#contact iframe')];
      for (const f of frames) {
        f.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 250));
      }
    });
    await new Promise(r => setTimeout(r, 500));
    const iframeLoaded = await page.evaluate(() => {
      const frames = [...document.querySelectorAll('#contact iframe')];
      return frames.length >= 2 && frames.every(f => {
        const src = f.getAttribute('src') || '';
        return src.startsWith('https://maps.google.com/maps') || src.startsWith('https://www.google.com/maps');
      });
    });
    check(iframeLoaded, 'Offices Section: lazy Google Maps iframes promote data-src to https:// src when scrolled into view');

    // 5E. Legal Modals Open, Escape Close, Backdrop Close, Body Overflow Restore
    await page.click('#open-privacy-link');
    await new Promise(r => setTimeout(r, 300));
    check(await page.$eval('#privacy-modal', m => m.classList.contains('is-open') && m.getAttribute('aria-hidden') === 'false' && document.body.style.overflow === 'hidden'), 'Privacy Modal opens & locks body scroll');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    check(await page.$eval('#privacy-modal', m => !m.classList.contains('is-open') && document.body.style.overflow === ''), 'Privacy Modal closes on Escape key & unlocks body scroll');

    await page.click('#open-terms-link');
    await new Promise(r => setTimeout(r, 300));
    check(await page.$eval('#terms-modal', m => m.classList.contains('is-open')), 'Terms Modal opens via footer trigger');
    await page.mouse.click(10, 10); // backdrop click
    await new Promise(r => setTimeout(r, 300));
    check(await page.$eval('#terms-modal', m => !m.classList.contains('is-open')), 'Terms Modal closes on backdrop click');

    // 5F. Nav Anchor Smooth Scroll & Skip Link Accessibility
    const skipExists = await page.$eval('.skip-link', el => el.getAttribute('href') === '#main-content' && Boolean(document.getElementById('main-content')));
    check(skipExists, 'Accessibility: Skip link points to #main-content');

    // Check accessible names on all buttons on index.html
    const unnamedButtons = await page.evaluate(() => {
      return [...document.querySelectorAll('button')].filter(b => {
        const text = b.textContent.trim();
        const aria = (b.getAttribute('aria-label') || '').trim();
        return !text && !aria;
      }).map(b => b.outerHTML.slice(0, 80));
    });
    check(unnamedButtons.length === 0, 'Accessibility: all <button> elements on index.html have accessible text or aria-label', unnamedButtons.join(' | '));

    // 5G. Deep FAQ Page Interactive Tests (Accordions, Category Filters, Search, Clear, Deep-Link Hash)
    await page.goto(BASE + '/faq.html', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 350));

    const faqCount = await page.$$eval('.faq-card', els => els.length);
    const catBtns = await page.$$eval('.faq-category-btn', els => els.map(e => e.getAttribute('data-cat')));
    check(catBtns.length >= 2, `FAQ Page has ${catBtns.length} category filter buttons`);

    // Click non-'all' category
    const nonAllCat = catBtns.find(c => c && c !== 'all');
    if (nonAllCat) {
      await page.click(`.faq-category-btn[data-cat="${nonAllCat}"]`);
      await new Promise(r => setTimeout(r, 200));
      const catVisible = await page.evaluate((cat) => {
        const cards = [...document.querySelectorAll('.faq-card')];
        const visible = cards.filter(c => c.style.display !== 'none');
        return visible.length > 0 && visible.length < cards.length && visible.every(c => c.getAttribute('data-category') === cat);
      }, nonAllCat);
      check(catVisible, `FAQ Category filter "${nonAllCat}" filters accurately`);

      // Reset to 'all'
      await page.click('.faq-category-btn[data-cat="all"]');
      await new Promise(r => setTimeout(r, 150));
    }

    // Zero-result search message
    await page.type('#faq-search-input', 'xyznonexistentquery123');
    await new Promise(r => setTimeout(r, 150));
    const emptyMsg = await page.$eval('#faq-counter-text', el => el.textContent);
    check(emptyMsg.toLowerCase().includes('no matching'), `FAQ zero-match search updates counter: "${emptyMsg}"`);
    await page.click('#faq-clear-btn');
    await new Promise(r => setTimeout(r, 150));
    const restoredCount = await page.evaluate(() => [...document.querySelectorAll('.faq-card')].filter(c => c.style.display !== 'none').length);
    check(restoredCount === faqCount, 'FAQ Clear button restores all topics');

    // Deep-link hash auto-open test on faq.html (fresh navigation from about:blank so DOMContentLoaded fires cleanly)
    const firstFaqId = await page.$eval('.faq-card[id]', el => el.id);
    if (firstFaqId) {
      await page.goto('about:blank');
      await page.goto(`${BASE}/faq.html#${firstFaqId}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 500));
      const hashOpened = await page.evaluate(id => document.getElementById(id)?.classList.contains('is-open'), firstFaqId);
      check(hashOpened, `FAQ deep-link #${firstFaqId} automatically opens target card`);
    }

    // 5H. Reduced-motion test (zero errors when prefers-reduced-motion: reduce)
    const rmErrors = [];
    const rmPage = await browser.newPage();
    rmPage.on('pageerror', err => rmErrors.push(err.message));
    await rmPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await rmPage.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 300));
    check(rmErrors.length === 0, 'prefers-reduced-motion: reduce loads without errors');
    await rmPage.close();

    // 5I. Service Worker registration test over HTTP localhost
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    const swStatus = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'unsupported';
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        return reg ? 'registered' : 'none';
      } catch (e) {
        return 'error:' + e.message;
      }
    });
    check(swStatus === 'registered', `Service Worker registers cleanly over HTTP (${swStatus})`);

    // 5J. Three.js Frosted Glass Background + Grid + Cursor Light + Resize Verification
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    const glassCanvas = await page.evaluate(() => {
      const c = document.getElementById('frosted-glass-canvas');
      if (!c) return null;
      const s = getComputedStyle(c);
      const rect = c.getBoundingClientRect();
      return {
        position: s.position,
        zIndex: s.zIndex,
        pointerEvents: s.pointerEvents,
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        state: window.__rgFrostedGlass || null
      };
    });
    check(
      glassCanvas &&
      glassCanvas.position === 'fixed' &&
      glassCanvas.zIndex === '-1' &&
      glassCanvas.pointerEvents === 'none' &&
      glassCanvas.w === 1440 &&
      glassCanvas.h === 900,
      'Frosted Glass Canvas: fixed fullscreen beneath DOM (z-index: -1, pointer-events: none)'
    );
    if (glassCanvas && glassCanvas.state) {
      const st = glassCanvas.state;
      check(
        st.active && st.transmission >= 0.9 && st.roughness >= 0.3 && st.ior > 1.3 && st.hasNormalMap && st.hasGridOverlay,
        `Three.js Frosted Glass Shader active (transmission=${st.transmission}, roughness=${st.roughness}, ior=${st.ior}, normalMap=${st.hasNormalMap}, grid=${st.hasGridOverlay})`
      );
      await page.mouse.move(100, 100);
      await new Promise(r => setTimeout(r, 250));
      const pos1 = await page.evaluate(() => ({ light: window.__rgFrostedGlass.lightPos, ndc: window.__rgFrostedGlass.mouseNDC }));
      await page.mouse.move(720, 450);
      await new Promise(r => setTimeout(r, 250));
      const centerNdc = await page.evaluate(() => window.__rgFrostedGlass.mouseNDC);
      check(Math.abs(centerNdc.x) >= 0.75, `Backlight remains in empty side margin when mouse near center (|ndcX|=${Math.abs(centerNdc.x).toFixed(2)})`);
      await page.mouse.move(1300, 800);
      await new Promise(r => setTimeout(r, 250));
      const pos2 = await page.evaluate(() => ({ light: window.__rgFrostedGlass.lightPos, ndc: window.__rgFrostedGlass.mouseNDC }));
      check(pos2.light.x > pos1.light.x && pos2.light.y < pos1.light.y, `Dynamic PointLight tracks normalized cursor coordinates (${pos1.light.x.toFixed(2)},${pos1.light.y.toFixed(2)} -> ${pos2.light.x.toFixed(2)},${pos2.light.y.toFixed(2)})`);
      await page.evaluate(() => window.scrollTo(0, 600));
      await new Promise(r => setTimeout(r, 250));
      const afterScroll = await page.evaluate(() => window.__rgFrostedGlass.mouseNDC);
      check(afterScroll.y !== pos2.ndc.y && Math.abs(afterScroll.x) >= 0.75, `Scroll triggers involuntary side-margin jump (ndc: ${afterScroll.x.toFixed(2)}, ${afterScroll.y.toFixed(2)})`);
    }
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 250));
    const resizedCanvas = await page.evaluate(() => {
      const r = document.getElementById('frosted-glass-canvas')?.getBoundingClientRect();
      return r ? { w: Math.round(r.width), h: Math.round(r.height) } : null;
    });
    check(resizedCanvas && resizedCanvas.w === 390 && resizedCanvas.h === 844, 'Frosted Glass Canvas resizes responsively on window resize');

    await page.close();
  } finally {
    await browser.close();
  }

  // =========================================================================
  // SUITE 6: LIGHTHOUSE AUDIT (MOBILE & DESKTOP ON index.html)
  // =========================================================================
  console.log('\n=== SUITE 6: LIGHTHOUSE AUDIT (MOBILE & DESKTOP) ===');
  try {
    const lhMod = require('lighthouse');
    const lighthouseFn = lhMod.default || lhMod;
    const desktopConfig = lhMod.desktopConfig;
    const lhBrowser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--remote-debugging-port=9229']
    });
    for (const mode of ['mobile', 'desktop']) {
      try {
        const flags = {
          port: 9229,
          output: 'json',
          logLevel: 'silent',
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
        };
        const result = await lighthouseFn(
          `${BASE}/index.html`,
          flags,
          mode === 'desktop' ? desktopConfig : undefined
        );
        const lhr = result?.lhr || {};
        const cats = lhr.categories || {};
        const audits = lhr.audits || {};
        for (const [k, v] of Object.entries(cats)) {
          const score = Math.round((v.score || 0) * 100);
          check(score >= 90, `Lighthouse ${mode.toUpperCase()} ${k}: ${score}/100 (target >= 90)`);
        }
        const sub100 = [];
        for (const [k, v] of Object.entries(audits)) {
          if (v.score !== null && v.score < 1 && v.scoreDisplayMode !== 'notApplicable' && v.scoreDisplayMode !== 'informative') {
            sub100.push(`${k}=${v.score}${v.displayValue ? ` (${v.displayValue})` : ''}`);
          }
        }
        if (sub100.length) {
          console.log(`  [INFO] Lighthouse ${mode} sub-1.0 audits: ${sub100.join(' | ')}`);
        }
      } catch (e) {
        check(false, `Lighthouse ${mode} run completed`, e.message);
      }
    }
    await lhBrowser.close();
  } catch (e) {
    check(false, 'Lighthouse module initialization', e.message);
  }

  server.close();

  console.log('\n==================================================');
  console.log('COMPREHENSIVE WEBSITE TEST SUITE SUMMARY');
  console.log(`Total Checks : ${report.total}`);
  console.log(`Passed       : ${report.passed}`);
  console.log(`Failed       : ${report.failed}`);
  console.log('==================================================');

  if (report.failed > 0) {
    console.log('\nFailures list:');
    report.failures.forEach((f, i) => console.log(`${i + 1}. ${f.name}: ${f.details}`));
    process.exit(1);
  }
}

runFullSuite().catch(err => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
