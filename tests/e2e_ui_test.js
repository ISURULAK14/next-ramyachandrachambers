const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function createServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0].split('#')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join('.', reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.txt': 'text/plain; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8'
      };
      res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

const PORT = 8130;
const BASE = `http://127.0.0.1:${PORT}`;

async function runE2ETests() {
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));

  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 60000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const testReport = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    failures: []
  };

  function assert(condition, testName, details = '') {
    testReport.totalTests++;
    if (condition) {
      testReport.passed++;
      console.log(`  [PASS] ${testName}`);
    } else {
      testReport.failed++;
      testReport.failures.push({ test: testName, details });
      console.error(`  [FAIL] ${testName} - ${details}`);
    }
  }

  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    // ==========================================
    // TEST SUITE 1: HOME PAGE (index.html) DESKTOP
    // ==========================================
    console.log('\n--- 1. Testing index.html (Desktop Viewport 1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    // A. Email Hydration
    const emailHydrated = await page.evaluate(() => {
      const email = document.querySelector('.protected-email');
      return email && email.href === 'mailto:ramyachandra@sltnet.lk' && email.textContent.trim() === 'ramyachandra@sltnet.lk';
    });
    assert(emailHydrated, 'Email anti-scraping hydration injects valid mailto & text');

    // B. Service Accordion Dropdown Interaction (Desktop Row Sync)
    const serviceCardsCount = await page.$$eval('.service-card', els => els.length);
    assert(serviceCardsCount === 6, `Found all 6 service cards (actual: ${serviceCardsCount})`);

    // Click Service Card 1 -> Opens row
    await page.click('.service-card:nth-child(1) .accordion-header');
    await new Promise(r => setTimeout(r, 900));
    const card1Open = await page.evaluate(() => {
      const card = document.querySelector('.service-card:nth-child(1)');
      const content = card.querySelector('.accordion-content');
      return card.classList.contains('is-open') && content.offsetHeight > 50;
    });
    assert(card1Open, 'Desktop: Clicking Service Card 1 expands accordion dropdown (>50px height)');

    // Click Service Card 1 again -> Collapses row
    await page.click('.service-card:nth-child(1) .accordion-header');
    await new Promise(r => setTimeout(r, 900)); // wait for 0.85s transition
    const card1Closed = await page.evaluate(() => {
      const card = document.querySelector('.service-card:nth-child(1)');
      const content = card.querySelector('.accordion-content');
      return !card.classList.contains('is-open') && content.offsetHeight === 0;
    });
    assert(card1Closed, 'Desktop: Clicking Service Card 1 again collapses accordion to 0px');

    // C. Dual Google Reviews Carousel Controls (Desktop)
    await page.hover('.reviews-grid .review-card:nth-child(1)');
    await new Promise(r => setTimeout(r, 100));

    const initialCounter = await page.evaluate(() => {
      return document.querySelector('.reviews-grid .review-card:nth-child(1) .carousel-counter')?.textContent?.trim();
    });

    // Advance with Next button
    await page.click('.reviews-grid .review-card:nth-child(1) .carousel-next');
    await new Promise(r => setTimeout(r, 150));
    const afterNextCounter = await page.evaluate(() => {
      return document.querySelector('.reviews-grid .review-card:nth-child(1) .carousel-counter')?.textContent?.trim();
    });
    assert(initialCounter !== afterNextCounter, `Clicking carousel-next advances slide counter (from "${initialCounter}" to "${afterNextCounter}")`);

    // Return with Prev button
    await page.click('.reviews-grid .review-card:nth-child(1) .carousel-prev');
    await new Promise(r => setTimeout(r, 150));
    const afterPrevCounter = await page.evaluate(() => {
      return document.querySelector('.reviews-grid .review-card:nth-child(1) .carousel-counter')?.textContent?.trim();
    });
    assert(afterPrevCounter === initialCounter, `Clicking carousel-prev returns counter to "${initialCounter}"`);

    // D. Legal Modals (Privacy Policy & Terms)
    await page.evaluate(() => {
      document.getElementById('open-privacy-link')?.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const privacyOpen = await page.evaluate(() => {
      const m = document.getElementById('privacy-modal');
      return m.classList.contains('is-open');
    });
    assert(privacyOpen, 'Clicking "Privacy Policy" opens legal modal dialog');

    await page.evaluate(() => {
      document.querySelector('#privacy-modal .legal-modal-close')?.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const privacyClosed = await page.evaluate(() => {
      const m = document.getElementById('privacy-modal');
      return !m.classList.contains('is-open');
    });
    assert(privacyClosed, 'Clicking close button closes Privacy Policy modal');

    await page.evaluate(() => {
      document.getElementById('open-terms-link')?.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const termsOpen = await page.evaluate(() => {
      const m = document.getElementById('terms-modal');
      return m.classList.contains('is-open');
    });
    assert(termsOpen, 'Clicking "Terms of Engagement" opens terms modal dialog');

    await page.evaluate(() => {
      document.querySelector('#terms-modal .legal-modal-close')?.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const termsClosed = await page.evaluate(() => {
      const m = document.getElementById('terms-modal');
      return !m.classList.contains('is-open');
    });
    assert(termsClosed, 'Clicking close button closes Terms modal');

    // ==========================================
    // TEST SUITE 2: HOME PAGE (index.html) MOBILE
    // ==========================================
    console.log('\n--- 2. Testing index.html (Mobile Viewport 360x780) ---');
    await page.setViewport({ width: 360, height: 780 });
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    // Mobile Horizontal Scroll Check (0px overflow)
    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    assert(mobileOverflow, 'Mobile (360px): Zero horizontal scroll / 0px overflow on index.html');

    // Mobile Accordion Click
    await page.click('.service-card:nth-child(1) .accordion-header');
    await new Promise(r => setTimeout(r, 350));
    const mobileCard1Open = await page.evaluate(() => {
      const c = document.querySelector('.service-card:nth-child(1)');
      return c.classList.contains('is-open') && c.querySelector('.accordion-content').offsetHeight > 100;
    });
    assert(mobileCard1Open, 'Mobile: Service Card 1 accordion expands on tap (>100px height)');

    // Tap Service Card 2 -> Card 1 should collapse and Card 2 should open (single accordion mode)
    await page.click('.service-card:nth-child(2) .accordion-header');
    await new Promise(r => setTimeout(r, 350));
    const mobileCard2Switch = await page.evaluate(() => {
      const c1 = document.querySelector('.service-card:nth-child(1)');
      const c2 = document.querySelector('.service-card:nth-child(2)');
      return !c1.classList.contains('is-open') && c2.classList.contains('is-open') && c2.querySelector('.accordion-content').offsetHeight > 100;
    });
    assert(mobileCard2Switch, 'Mobile: Tapping Card 2 automatically collapses Card 1 and opens Card 2');

    // ==========================================
    // TEST SUITE 3: FAQ PAGE (faq.html) E2E
    // ==========================================
    console.log('\n--- 3. Testing faq.html (FAQ Search, Categories, Accordions) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + '/faq.html', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    // A. Accordion toggle
    const faqCount = await page.$$eval('.faq-card', els => els.length);
    assert(faqCount > 0, `Found ${faqCount} FAQ cards in faq.html`);

    await page.click('.faq-card .faq-header');
    await new Promise(r => setTimeout(r, 300));
    const faq1Open = await page.evaluate(() => {
      const card = document.querySelector('.faq-card');
      const body = card.querySelector('.faq-body');
      return card.classList.contains('is-open') && body.offsetHeight > 30;
    });
    assert(faq1Open, 'FAQ Page: Clicking FAQ 1 expands answer accordion');

    // B. Search Filter
    await page.type('#faq-search-input', 'deed');
    await new Promise(r => setTimeout(r, 200));
    const searchMatches = await page.evaluate(() => {
      const visible = [...document.querySelectorAll('.faq-card')].filter(c => c.style.display !== 'none');
      return visible.length;
    });
    assert(searchMatches > 0 && searchMatches < faqCount, `FAQ Search: Filtering for "deed" narrows results (${searchMatches} visible)`);

    await page.click('#faq-clear-btn');
    await new Promise(r => setTimeout(r, 200));
    const afterClear = await page.evaluate(() => {
      const visible = [...document.querySelectorAll('.faq-card')].filter(c => c.style.display !== 'none');
      return visible.length;
    });
    assert(afterClear === faqCount, 'FAQ Search: Clearing search restores all FAQ topics');

    // ==========================================
    // TEST SUITE 4: ALL 6 PRACTICE GUIDES (Mobile Viewport)
    // ==========================================
    console.log('\n--- 4. Testing All 6 Practice Guides (Mobile 360px Overflow Check) ---');
    const guides = [
      '/overseas-power-of-attorney-sri-lanka.html',
      '/land-registry-title-search-sri-lanka.html',
      '/company-registration-sri-lanka-beneficial-ownership.html',
      '/land-partition-law-procedure-sri-lanka.html',
      '/foreign-investment-property-acquisition-sri-lanka.html',
      '/last-will-testamentary-probate-sri-lanka.html'
    ];

    await page.setViewport({ width: 360, height: 780 });
    for (const g of guides) {
      await page.goto(BASE + g, { waitUntil: 'domcontentloaded' });
      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });
      assert(noOverflow, `Mobile 360px: Zero horizontal overflow on ${g}`);
    }

    // Assert zero console/runtime errors throughout all user interactions
    assert(consoleErrors.length === 0, `Zero runtime console errors across entire E2E test session (errors: ${consoleErrors.length})`);
    if (consoleErrors.length) console.error('Logged errors:', consoleErrors);

    await page.close();
  } catch (err) {
    console.error('Fatal E2E test failure:', err);
    testReport.failed++;
    testReport.failures.push({ test: 'FATAL_EXCEPTION', details: err.message });
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n==========================================');
  console.log(`E2E UI/UX TEST SUMMARY:`);
  console.log(`Total Tests Run : ${testReport.totalTests}`);
  console.log(`Passed          : ${testReport.passed}`);
  console.log(`Failed          : ${testReport.failed}`);
  console.log('==========================================');

  if (testReport.failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch(err => {
  console.error(err);
  process.exit(1);
});
