with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

font_scale_css = """
/* Exact +20% Font Size Increase for Metrics & Labels */
.banner-stats .stat-item .stat-value,
.banner-stats .stat-value,
.stat-item .stat-value {
    font-size: calc(clamp(1.25rem, 3.4vw, 2.35rem) * 1.2) !important;
}

.banner-stats .stat-item .stat-label,
.banner-stats .stat-label,
.stat-item .stat-label {
    font-size: calc(clamp(0.50rem, 1.28vw, 0.74rem) * 1.2) !important;
}
"""

css += font_scale_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated style.css with +20% font size.")
