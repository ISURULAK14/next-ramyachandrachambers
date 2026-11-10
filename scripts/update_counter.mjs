import fs from 'fs';

const newCounterCode = `    // 3. Counter Rolling Cadence (Count up from 0 with 3s rest loop)
    const stats = [...document.querySelectorAll('.stat-value[data-target]')];
    if (stats.length) {
        const duration = 2400;
        const restDuration = 3000;
        const timerEase = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        let isVisible = true;
        let isRunning = false;
        let currentRaf = null;
        let restTimeout = null;

        const runCountCycle = () => {
            if (currentRaf) cancelAnimationFrame(currentRaf);
            if (restTimeout) clearTimeout(restTimeout);
            isRunning = true;

            stats.forEach(el => {
                const suffix = el.getAttribute('data-suffix') || '';
                el.textContent = '0' + suffix;
            });

            const startTime = performance.now();
            let lastVals = new Map();

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = timerEase(progress);

                stats.forEach(el => {
                    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
                    const suffix = el.getAttribute('data-suffix') || '';
                    let currentVal = Math.round(target * ease);
                    if (progress >= 1) currentVal = target;

                    if (lastVals.get(el) !== currentVal) {
                        lastVals.set(el, currentVal);
                        el.textContent = currentVal + suffix;
                    }
                });

                if (progress < 1) {
                    currentRaf = requestAnimationFrame(step);
                } else {
                    currentRaf = null;
                    stats.forEach(el => {
                        const target = el.getAttribute('data-target');
                        const suffix = el.getAttribute('data-suffix') || '';
                        el.textContent = target + suffix;
                    });
                    restTimeout = setTimeout(() => {
                        if (isVisible) {
                            runCountCycle();
                        } else {
                            isRunning = false;
                        }
                    }, restDuration);
                }
            };
            currentRaf = requestAnimationFrame(step);
        };

        const statsBanner = document.querySelector('.banner-stats');
        if (statsBanner && 'IntersectionObserver' in window) {
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isVisible = entry.isIntersecting;
                    if (isVisible && !isRunning) {
                        runCountCycle();
                    }
                });
            }, { threshold: 0.05 });
            statsObserver.observe(statsBanner);
        }

        setTimeout(() => {
            if (!isRunning) runCountCycle();
        }, 200);
    }`;

const files = ['D:/ANTIGRAVITY/website/js/main.js', 'D:/ANTIGRAVITY/website/js/main.min.js'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const targetPattern = /\/\/ 3\. Counter Rolling Cadence[\s\S]*?else runCountCycle\(\);\s*\}\s*\}/;
  if (targetPattern.test(content)) {
    content = content.replace(targetPattern, newCounterCode);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated counter in ${file}`);
  } else {
    // Try matching without comment
    const altPattern = /const stats = \[\.\.\.document\.querySelectorAll\('\.stat-value\[data-target\]'\)\];[\s\S]*?else runCountCycle\(\);\s*\}\s*\}/;
    if (altPattern.test(content)) {
      content = content.replace(altPattern, newCounterCode);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated counter (alt) in ${file}`);
    } else {
      console.error(`Could not match counter in ${file}`);
    }
  }
}
