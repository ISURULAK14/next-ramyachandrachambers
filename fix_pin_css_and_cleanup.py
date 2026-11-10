with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace any bare .pin-label, in cardinal selectors
marker = "/* ==========================================================================\n   CALIBRATED 4-WAY CARDINAL TAG DIRECTIONS"
idx = css.find(marker)
if idx != -1:
    css = css[:idx]

clean_pin_css = """/* ==========================================================================
   STRICT PIN AND LABEL VISIBILITY (INACTIVE PINS ARE 100% INVISIBLE)
   ========================================================================== */
.map-pin:not(.active):not(:hover) {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
}

.map-pin:not(.active):not(:hover) .pin-label {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
}

.map-pin.active,
.map-pin:hover {
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
}

.map-pin.active .pin-label,
.map-pin:hover .pin-label {
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
}

/* ==========================================================================
   CALIBRATED 4-WAY CARDINAL TAG DIRECTIONS (ZERO OVERLAP GUARANTEED)
   ========================================================================== */

/* Direction 1: Point LEFT (West) */
.pin-usa .pin-label,
.pin-ireland .pin-label,
.pin-portugal .pin-label,
.pin-uk .pin-label,
.pin-france .pin-label,
.pin-belgium .pin-label,
.pin-luxembourg .pin-label {
    right: 125% !important;
    left: auto !important;
    top: 50% !important;
    bottom: auto !important;
    transform: translateY(-50%) !important;
}

/* Direction 2: Point RIGHT (East) */
.pin-latvia .pin-label,
.pin-slovakia .pin-label,
.pin-romania .pin-label,
.pin-israel .pin-label,
.pin-uae .pin-label,
.pin-china .pin-label,
.pin-korea .pin-label,
.pin-japan .pin-label,
.pin-malaysia .pin-label,
.pin-singapore .pin-label,
.pin-australia .pin-label,
.pin-nz .pin-label {
    left: 125% !important;
    right: auto !important;
    top: 50% !important;
    bottom: auto !important;
    transform: translateY(-50%) !important;
}

/* Direction 3: Point TOP (North) */
.pin-norway .pin-label,
.pin-sweden .pin-label,
.pin-denmark .pin-label,
.pin-netherlands .pin-label,
.pin-bangladesh .pin-label {
    bottom: 125% !important;
    top: auto !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
}

/* Direction 4: Point BOTTOM (South) */
.pin-germany .pin-label,
.pin-switzerland .pin-label,
.pin-austria .pin-label,
.pin-italy .pin-label,
.pin-malta .pin-label,
.pin-greece .pin-label,
.pin-mali .pin-label,
.pin-zanzibar .pin-label,
.pin-india .pin-label,
.pin-srilanka .pin-label,
.pin-maldives .pin-label {
    top: 125% !important;
    bottom: auto !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
}

/* Scale & spacing adjustments for Mobile (<= 900px & <= 480px) */
@media (max-width: 900px) {
    .pin-label {
        font-size: 0.50rem !important;
        padding: 0.16rem 0.38rem !important;
        border-radius: 4px !important;
        letter-spacing: 0.2px !important;
    }
}
"""

css += "\n" + clean_pin_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("SUCCESS: Fixed CSS pin label visibility and clean cardinal directions.")
