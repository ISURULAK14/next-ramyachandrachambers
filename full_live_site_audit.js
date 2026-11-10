const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(__dirname, reqPath === '/' ? 'index.html' : reqPath);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end("Not found"); return; }
        let ext = path.extname(filePath);
        let mime = {
            '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
            '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp'
        }[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
    });
});

server.listen(8091, async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    let allErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') allErrors.push(`[Console Error] ${msg.text()}`);
    });
    page.on('pageerror', err => allErrors.push(`[Page Error] ${err.toString()}`));

    const pagesToTest = [
        'index.html',
        'faq.html',
        'company-registration-matara.html',
        'deed-lawyer-matara.html',
        'notary-public-matara.html',
        '404.html',
        'about.html',
        'services.html',
        'practice-areas.html',
        'testimonials.html',
        'contact.html'
    ];

    console.log("=== RUNNING MULTI-PAGE AUDIT ACROSS ALL 11 PAGES ===");

    for (const p of pagesToTest) {
        try {
            const resp = await page.goto(`http://localhost:8091/${p}`, { waitUntil: 'networkidle0' });
            console.log(`[PASS] ${p}: Status ${resp.status()}`);
        } catch (e) {
            allErrors.push(`Failed to load ${p}: ${e.message}`);
        }
    }

    // ================= MOBILE MAP MEASUREMENT (375x812) =================
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:8091/index.html', { waitUntil: 'networkidle0' });

    const mobileMapMetrics = await page.evaluate(() => {
        const wrapper = document.querySelector('.map-wrapper');
        return wrapper ? {
            width: wrapper.getBoundingClientRect().width,
            height: wrapper.getBoundingClientRect().height
        } : null;
    });

    console.log("\nMobile Map Dimensions (-40% Height):", mobileMapMetrics);

    // Capture mobile map during sequence
    await new Promise(r => setTimeout(r, 600));
    const mapEl = await page.$('.map-wrapper');
    if (mapEl) {
        await mapEl.screenshot({ path: 'mobile_map_40pct_reduced.png' });
        console.log("Saved mobile_map_40pct_reduced.png");
    }

    console.log("\nTotal Console / Page Errors Found:", allErrors.length);
    if (allErrors.length > 0) {
        console.log(allErrors);
    }

    await browser.close();
    server.close();
    process.exit(allErrors.length > 0 ? 1 : 0);
});
