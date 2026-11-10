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
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:8097/index.html', { waitUntil: 'networkidle0' });

    const all35 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.map-pin')).map(p => p.id);
    });

    console.log(`Loaded ${all35.length} pins from DOM.`);

    // Pre-calculate collision matrix between all pairs in DOM
    const collisionMatrix = await page.evaluate((pins) => {
        const matrix = {};
        pins.forEach(p => matrix[p] = {});

        // Test every pair (a, b)
        for (let i = 0; i < pins.length; i++) {
            for (let j = i + 1; j < pins.length; j++) {
                const idA = pins[i];
                const idB = pins[j];

                // Activate both
                document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
                const elA = document.getElementById(idA);
                const elB = document.getElementById(idB);
                if (elA) elA.classList.add('active');
                if (elB) elB.classList.add('active');

                const lblA = elA ? elA.querySelector('.pin-label') : null;
                const lblB = elB ? elB.querySelector('.pin-label') : null;

                let intersects = false;
                if (lblA && lblB) {
                    const rA = lblA.getBoundingClientRect();
                    const rB = lblB.getBoundingClientRect();
                    intersects = !(rB.left >= rA.right - 1 || 
                                   rB.right <= rA.left + 1 || 
                                   rB.top >= rA.bottom - 1 || 
                                   rB.bottom <= rA.top + 1);
                }

                matrix[idA][idB] = intersects;
                matrix[idB][idA] = intersects;
            }
        }
        return matrix;
    }, all35);

    console.log("Built DOM collision matrix for all 35x35 pairs.");

    // Local solver to partition 35 pins into 7 cohorts of 5 with 0 collisions:
    function score(cohorts) {
        let total = 0;
        for (const c of cohorts) {
            for (let i = 0; i < c.length; i++) {
                for (let j = i + 1; j < c.length; j++) {
                    if (collisionMatrix[c[i]][c[j]]) total++;
                }
            }
        }
        return total;
    }

    let bestScore = 999;
    let bestCohorts = null;

    for (let iter = 0; iter < 500000; iter++) {
        // shuffle
        const shuffled = [...all35].sort(() => Math.random() - 0.5);
        const cohorts = [
            shuffled.slice(0, 5),
            shuffled.slice(5, 10),
            shuffled.slice(10, 15),
            shuffled.slice(15, 20),
            shuffled.slice(20, 25),
            shuffled.slice(25, 30),
            shuffled.slice(30, 35)
        ];

        let s = score(cohorts);
        if (s < bestScore) {
            bestScore = s;
            bestCohorts = cohorts;
            console.log(`New best score: ${bestScore} at iteration ${iter}`);
            if (bestScore === 0) break;
        }
    }

    console.log(`\nFinal Best Score: ${bestScore}`);
    if (bestScore === 0) {
        console.log("ZERO-COLLISION COHORTS FOUND:");
        bestCohorts.forEach((c, idx) => {
            console.log(`Cohort ${idx + 1}: ${JSON.stringify(c)}`);
        });
        fs.writeFileSync('zero_collision_cohorts.json', JSON.stringify(bestCohorts, null, 2));
    }

    await browser.close();
    server.close();
    process.exit(0);
});
