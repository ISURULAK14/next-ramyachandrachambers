with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace kotavila rules with calibrated Apple stack
marker = "/* ==========================================================================\n   KOTAVILA OFFICE APPLE-STYLE FAN-OUT PHOTO STACK"
idx = css.find(marker)
if idx != -1:
    css = css[:idx]

kotavila_apple_css = """/* ==========================================================================
   KOTAVILA OFFICE APPLE-STYLE FAN-OUT PHOTO STACK
   ========================================================================== */
.kotavila-gallery {
    position: relative !important;
    width: 100% !important;
    max-width: 290px !important;
    height: 140px !important;
    aspect-ratio: auto !important;
    margin: 0.85rem auto 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    perspective: 1000px !important;
    overflow: visible !important;
    cursor: pointer !important;
    border: none !important;
    box-shadow: none !important;
    background: none !important;
}

.kotavila-gallery picture {
    position: absolute !important;
    width: 72% !important;
    height: 96% !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    border: 1.5px solid rgba(255, 255, 255, 0.45) !important;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.7s ease, filter 0.6s ease, border-color 0.5s ease !important;
    will-change: transform !important;
    backface-visibility: hidden !important;
    transform-origin: 50% 90% !important;
}

.kotavila-gallery picture img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
}

/* Picture 1: Natural left tilt stack */
.kotavila-gallery picture:first-child {
    transform: translateX(-12%) rotate(-5deg) scale(0.97) !important;
    z-index: 1 !important;
    filter: saturate(0.92) brightness(0.95) !important;
}

/* Picture 2: Natural right tilt stack */
.kotavila-gallery picture:last-child {
    transform: translateX(12%) rotate(5deg) scale(0.97) !important;
    z-index: 2 !important;
    filter: saturate(0.92) brightness(0.95) !important;
}

/* Apple-style Fan to either way on Hover & Focus */
.kotavila-gallery:hover picture:first-child,
.kotavila-gallery:focus-within picture:first-child,
.office-card-2:hover .kotavila-gallery picture:first-child {
    transform: translateX(-34%) rotate(-11deg) scale(1.04) translateY(-3px) !important;
    z-index: 10 !important;
    filter: saturate(1.18) brightness(1.05) !important;
    border-color: rgba(242, 200, 121, 0.85) !important;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65), 0 0 22px rgba(242, 200, 121, 0.35) !important;
}

.kotavila-gallery:hover picture:last-child,
.kotavila-gallery:focus-within picture:last-child,
.office-card-2:hover .kotavila-gallery picture:last-child {
    transform: translateX(34%) rotate(11deg) scale(1.04) translateY(-3px) !important;
    z-index: 11 !important;
    filter: saturate(1.18) brightness(1.05) !important;
    border-color: rgba(242, 200, 121, 0.85) !important;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65), 0 0 22px rgba(242, 200, 121, 0.35) !important;
}

/* ==========================================================================
   LUXURIOUS SMOOTH & SLOW FAQ ACCORDION TRANSITIONS
   ========================================================================== */
.faq-card {
    transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.65s ease,
                box-shadow 0.65s ease !important;
}

.faq-header {
    transition: background 0.5s ease, color 0.5s ease !important;
}

.faq-toggle-icon {
    transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.faq-chevron {
    transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.faq-card.is-open .faq-chevron {
    transform: rotate(180deg) !important;
}

.faq-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.85s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
    opacity: 0;
    will-change: max-height, opacity;
}

.faq-card.is-open .faq-body {
    opacity: 1 !important;
}

/* Practice Areas & Services Accordions */
.accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.85s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
    opacity: 0;
    will-change: max-height, opacity;
}

.service-card.is-open .accordion-content,
.practice-card.is-open .accordion-content {
    opacity: 1 !important;
}

.accordion-chevron {
    transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.service-card.is-open .accordion-chevron,
.practice-card.is-open .accordion-chevron {
    transform: rotate(180deg) !important;
}
"""

css += "\n" + kotavila_apple_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("SUCCESS: Calibrated Apple-style fan out for Kotavila gallery.")
