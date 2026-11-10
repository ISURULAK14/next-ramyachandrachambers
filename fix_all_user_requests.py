import re

# 1. Fix js/main.js
with open('js/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the broken mapObserver block in main.js
broken_map_block = """        // Initialize map pin sequence with IntersectionObserver and requestIdleCallback for maximum INP score
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(() => startSequence(), { timeout: 1000 });
                    } else {
                        setTimeout(() => startSequence(), 100);
                    }
                    mapObserver.disconnect();
                }
            });
        }, { rootMargin: '200px 0px' });
        if (mapWrapper) mapObserver.observe(mapWrapper);
        else startSequence();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSequence();
            else // Initialize map pin sequence with IntersectionObserver and requestIdleCallback for maximum INP score
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(() => startSequence(), { timeout: 1000 });
                    } else {
                        setTimeout(() => startSequence(), 100);
                    }
                    mapObserver.disconnect();
                }
            });
        }, { rootMargin: '200px 0px' });
        if (mapWrapper) mapObserver.observe(mapWrapper);
        else startSequence();
        });"""

clean_map_block = """        startSequence();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSequence();
            else startSequence();
        });"""

if broken_map_block in js:
    js = js.replace(broken_map_block, clean_map_block)
else:
    # Regex fallback
    js = re.sub(
        r'// Initialize map pin sequence[\s\S]*?else\s*startSequence\(\);\s*\}\);',
        clean_map_block,
        js
    )

# Also ensure renderCosmos clean call
js = re.sub(
    r'if\s*\(\'requestIdleCallback\'\s*in\s*window\)\s*\{\s*requestIdleCallback\(\(\)\s*=>\s*renderCosmos\(\),\s*\{\s*timeout:\s*1500\s*\}\);\s*\}\s*else\s*\{\s*setTimeout\(\(\)\s*=>\s*renderCosmos\(\),\s*200\);\s*\}',
    'renderCosmos();',
    js
)

with open('js/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS: Fixed js/main.js (restored previous worldmap and fixed syntax error).")

# 2. Fix index.html (keep stats in one line, remove content-visibility-auto)
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove content-visibility-auto classes
html = html.replace(' content-visibility-auto', '')

# Update inlined critical CSS to keep stats in 1 line
html = re.sub(
    r'\.banner-stats\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(2,\s*1fr\);[\s\S]*?@media\s*\(min-width:\s*768px\)\s*\{\s*\.banner-stats\s*\{\s*grid-template-columns:\s*repeat\(4,\s*1fr\);\s*\}\s*\}',
    '.banner-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; max-width: 650px; margin: 0 auto 2.5rem; }',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: Fixed index.html (banner stats in one line).")

# 3. Fix css/style.css (remove content-visibility-auto, ensure stats in 1 line)
with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = re.sub(
    r'/\* 1\. Content-Visibility for Below-the-Fold Instant First Paint \*/\s*\.content-visibility-auto\s*\{[^}]*\}',
    '',
    css
)

stats_1line_css = """
/* Guarantee Stats in One Single Horizontal Row across all screen sizes */
.banner-stats {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 0.5rem !important;
    max-width: 650px !important;
    margin: 0 auto 2.5rem !important;
}

@media (max-width: 600px) {
    .banner-stats {
        gap: 0.35rem !important;
    }
    .stat-card {
        padding: 0.65rem 0.35rem !important;
    }
    .stat-value {
        font-size: 1.25rem !important;
    }
    .stat-label {
        font-size: 0.60rem !important;
    }
}
"""

css += "\n" + stats_1line_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("SUCCESS: Fixed css/style.css (stats in one line on all views, no content-visibility).")
