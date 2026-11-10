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

server.listen(8097, async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1200 });

    await page.goto('http://localhost:8097/faq.html', { waitUntil: 'networkidle0' });

    // Open first and second FAQ
    const headers = await page.$$('.faq-header');
    if (headers.length >= 2) {
        await headers[0].click();
        await headers[1].click();
        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({ path: 'puppeteer_faq_both_opened.png', fullPage: true });
        console.log("Saved puppeteer_faq_both_opened.png");
    }

    await browser.close();
    server.close();
    process.exit(0);
});
