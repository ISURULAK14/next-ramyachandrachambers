const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(__dirname, reqPath === '/' ? 'index.html' : reqPath);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end("Not found"); return; }
        let ext = path.extname(filePath);
        let mime = {
            '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
            '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
            '.json': 'application/json', '.webmanifest': 'application/manifest+json'
        }[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000' });
        res.end(data);
    });
});

server.listen(8100, async () => {
    console.log("Server listening on http://localhost:8100");

    const runAudit = (formFactor) => {
        console.log(`\n==============================================`);
        console.log(` RUNNING LIGHTHOUSE AUDIT FOR ${formFactor.toUpperCase()}`);
        console.log(`==============================================`);
        const reportPath = `lh_${formFactor}.json`;
        const preset = formFactor === 'desktop' ? '--preset=desktop' : '';
        try {
            execSync(`npx --yes lighthouse http://localhost:8100/index.html --output=json --output-path=${reportPath} ${preset} --chrome-flags="--headless=new --no-sandbox" --quiet`, { stdio: 'inherit' });
            
            const raw = fs.readFileSync(reportPath, 'utf8');
            const data = JSON.parse(raw);
            const categories = data.categories || {};
            const audits = data.audits || {};

            console.log("\n--- SCORES ---");
            for (const [k, v] of Object.entries(categories)) {
                console.log(`  ${k.toUpperCase()}: ${Math.round(v.score * 100)}/100`);
            }

            console.log("\n--- FAILED AUDITS / IMPROVEMENT OPPORTUNITIES ---");
            for (const [k, v] of Object.entries(audits)) {
                if (v.score !== null && v.score < 1 && v.scoreDisplayMode !== 'notApplicable' && v.scoreDisplayMode !== 'informative') {
                    console.log(`  [Score: ${v.score}] ${k}: ${v.title} (${v.displayValue || ''})`);
                    if (v.explanation) console.log(`      Reason: ${v.explanation}`);
                    if (v.details && v.details.items && v.details.items.length > 0) {
                        const items = v.details.items.slice(0, 3);
                        items.forEach(it => {
                            const snippet = it.node?.snippet || it.url || it.description || JSON.stringify(it);
                            console.log(`      -> ${String(snippet).substring(0, 90)}`);
                        });
                    }
                }
            }
        } catch (e) {
            console.error(`Error running audit for ${formFactor}:`, e.message);
        }
    };

    runAudit('mobile');
    runAudit('desktop');

    server.close();
    process.exit(0);
});
