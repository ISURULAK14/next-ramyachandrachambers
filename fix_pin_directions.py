with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

dir_css = """
/* Calibrated 4-Way Directional Pin Labels for Zero Overlap */
.pin-label {
    position: absolute;
    background: rgba(6, 20, 34, 0.95);
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    font-size: 0.62rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    white-space: nowrap;
    border: 1px solid rgba(242, 200, 121, 0.6);
    box-shadow: 0 6px 18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2);
    transition: opacity 0.3s cubic-bezier(.16,1,.3,1), transform 0.3s cubic-bezier(.16,1,.3,1);
    z-index: 100;
    backdrop-filter: blur(8px);
}

/* Westward (Left) */
.pin-uk .pin-label, .pin-ireland .pin-label, .pin-france .pin-label, .pin-portugal .pin-label, .pin-belgium .pin-label, .pin-australia .pin-label, .pin-nz .pin-label {
    right: 130%; left: auto; top: 50%; bottom: auto; transform: translateY(-50%);
}
.pin-uk.active .pin-label, .pin-uk:hover .pin-label,
.pin-ireland.active .pin-label, .pin-ireland:hover .pin-label,
.pin-france.active .pin-label, .pin-france:hover .pin-label,
.pin-portugal.active .pin-label, .pin-portugal:hover .pin-label,
.pin-belgium.active .pin-label, .pin-belgium:hover .pin-label,
.pin-australia.active .pin-label, .pin-australia:hover .pin-label,
.pin-nz.active .pin-label, .pin-nz:hover .pin-label {
    opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;
    transform: translateY(-50%) translateX(-4px) !important;
}

/* Eastward (Right) */
.pin-slovakia .pin-label, .pin-romania .pin-label, .pin-latvia .pin-label, .pin-japan .pin-label, .pin-korea .pin-label, .pin-israel .pin-label, .pin-uae .pin-label, .pin-bangladesh .pin-label, .pin-china .pin-label {
    left: 130%; right: auto; top: 50%; bottom: auto; transform: translateY(-50%);
}
.pin-slovakia.active .pin-label, .pin-slovakia:hover .pin-label,
.pin-romania.active .pin-label, .pin-romania:hover .pin-label,
.pin-latvia.active .pin-label, .pin-latvia:hover .pin-label,
.pin-japan.active .pin-label, .pin-japan:hover .pin-label,
.pin-korea.active .pin-label, .pin-korea:hover .pin-label,
.pin-israel.active .pin-label, .pin-israel:hover .pin-label,
.pin-uae.active .pin-label, .pin-uae:hover .pin-label,
.pin-bangladesh.active .pin-label, .pin-bangladesh:hover .pin-label,
.pin-china.active .pin-label, .pin-china:hover .pin-label {
    opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;
    transform: translateY(-50%) translateX(4px) !important;
}

/* Southward (Bottom) */
.pin-greece .pin-label, .pin-italy .pin-label, .pin-malta .pin-label, .pin-srilanka .pin-label, .pin-zanzibar .pin-label, .pin-malaysia .pin-label, .pin-maldives .pin-label, .pin-mali .pin-label, .pin-singapore .pin-label {
    top: 130%; bottom: auto; left: 50%; right: auto; transform: translateX(-50%);
}
.pin-greece.active .pin-label, .pin-greece:hover .pin-label,
.pin-italy.active .pin-label, .pin-italy:hover .pin-label,
.pin-malta.active .pin-label, .pin-malta:hover .pin-label,
.pin-srilanka.active .pin-label, .pin-srilanka:hover .pin-label,
.pin-zanzibar.active .pin-label, .pin-zanzibar:hover .pin-label,
.pin-malaysia.active .pin-label, .pin-malaysia:hover .pin-label,
.pin-maldives.active .pin-label, .pin-maldives:hover .pin-label,
.pin-mali.active .pin-label, .pin-mali:hover .pin-label,
.pin-singapore.active .pin-label, .pin-singapore:hover .pin-label {
    opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;
    transform: translateX(-50%) translateY(4px) !important;
}

/* Northward (Top) */
.pin-norway .pin-label, .pin-sweden .pin-label, .pin-denmark .pin-label, .pin-netherlands .pin-label, .pin-germany .pin-label, .pin-usa .pin-label, .pin-india .pin-label, .pin-austria .pin-label, .pin-switzerland .pin-label, .pin-luxembourg .pin-label {
    bottom: 130%; top: auto; left: 50%; right: auto; transform: translateX(-50%);
}
.pin-norway.active .pin-label, .pin-norway:hover .pin-label,
.pin-sweden.active .pin-label, .pin-sweden:hover .pin-label,
.pin-denmark.active .pin-label, .pin-denmark:hover .pin-label,
.pin-netherlands.active .pin-label, .pin-netherlands:hover .pin-label,
.pin-germany.active .pin-label, .pin-germany:hover .pin-label,
.pin-usa.active .pin-label, .pin-usa:hover .pin-label,
.pin-india.active .pin-label, .pin-india:hover .pin-label,
.pin-austria.active .pin-label, .pin-austria:hover .pin-label,
.pin-switzerland.active .pin-label, .pin-switzerland:hover .pin-label,
.pin-luxembourg.active .pin-label, .pin-luxembourg:hover .pin-label {
    opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;
    transform: translateX(-50%) translateY(-4px) !important;
}
"""

css += "\n" + dir_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("SUCCESS: Added calibrated 4-way directional pin label positioning.")
