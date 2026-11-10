with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace the previous stats CSS rules with the new +2 inches width and +25% font size
marker = "/* ==========================================================================\n   CALIBRATED 1-LINE STATS BAR"
idx = css.find(marker)
if idx != -1:
    css = css[:idx]

new_stats_css = """/* ==========================================================================
   CALIBRATED 1-LINE STATS BAR (EXPANDED WIDTH + 25% FONT SIZE)
   ========================================================================== */
.banner-stats {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    align-items: stretch !important;
    gap: clamp(0.45rem, 1.5vw, 1.25rem) !important;
    width: min(98vw, 65.5rem) !important; /* +2 inches expanded (65.5rem / 1048px) */
    max-width: min(98vw, 1048px) !important;
    margin: 0 auto 2.5rem auto !important;
    padding: clamp(1rem, 2.4vw, 1.75rem) clamp(0.6rem, 1.8vw, 1.5rem) !important;
    box-sizing: border-box !important;
    position: relative !important;
    overflow: hidden !important;
}

.banner-stats .stat-item {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    text-align: center !important;
    min-width: 0 !important;
    width: 100% !important;
    padding: 0.25rem 0.2rem !important;
    overflow: visible !important;
}

.banner-stats .stat-item .stat-value,
.banner-stats .stat-value,
.stat-item .stat-value {
    font-family: var(--font-serif, 'Cormorant Garamond', serif) !important;
    font-size: clamp(1.56rem, 4.25vw, 2.94rem) !important; /* +25% increased font-size */
    font-weight: 700 !important;
    color: var(--accent-main, #dfb35d) !important;
    line-height: 1.15 !important;
    white-space: nowrap !important;
    display: block !important;
}

.banner-stats .stat-item .stat-label,
.banner-stats .stat-label,
.stat-item .stat-label {
    font-family: var(--font-sans, 'Montserrat', sans-serif) !important;
    font-size: clamp(0.625rem, 1.60vw, 0.925rem) !important; /* +25% increased font-size */
    font-weight: 600 !important;
    color: var(--text-secondary, #9cb1c9) !important;
    text-transform: uppercase !important;
    letter-spacing: clamp(0.2px, 0.05em, 0.8px) !important;
    line-height: 1.25 !important;
    margin-top: 0.35rem !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
    hyphens: none !important;
    max-width: 100% !important;
    white-space: normal !important;
    display: block !important;
    text-align: center !important;
}

/* Ensure Exactly ONE World Map Layer Rendered cleanly */
.map-wrapper {
    background: #0b1f2e !important;
    background-image: linear-gradient(135deg, rgba(18, 56, 74, 0.8), rgba(11, 31, 46, 0.95)) !important;
    position: relative !important;
    overflow: hidden !important;
}

.map-bg-img {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: fill !important;
    z-index: 1 !important;
    pointer-events: none !important;
    opacity: 0.85 !important;
}
"""

css += new_stats_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("SUCCESS: Updated css/style.css with +2 inches stats width and +25% font size.")
