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
    await page.setViewport({ width: 1280, height: 900 });

    await page.goto('http://localhost:8091/index.html', { waitUntil: 'networkidle0' });

    const heights = await page.evaluate(() => {
        const c1 = document.querySelector('.office-card-1');
        const c2 = document.querySelector('.office-card-2');
        return {
            card1: c1 ? c1.getBoundingClientRect().height : 0,
            card2: c2 ? c2.getBoundingClientRect().height : 0
        };
    });

    console.log("Current Office Card Heights (px):", heights);

    const contactSec = await page.$('#contact');
    if (contactSec) {
        await contactSec.screenshot({ path: 'office_boxes_before.png' });
        console.log("Saved office_boxes_before.png");
    }

    await browser.close();
    server.close();
    process.exit(0);
});
