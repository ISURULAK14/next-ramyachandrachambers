import re

# 1. Fix duplicate tag in index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<div class="map-pins-container" id="map-pins-container"> id="map-pins-container">',
                    '<div class="map-pins-container" id="map-pins-container">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("1. Fixed index.html duplicate id tag.")

# 2. Fix css/style.css pin-label rules
with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Remove all forced opacity:1 on .pin-label
css = re.sub(r'\.pin-label\{opacity:1 !important;visibility:visible !important;pointer-events:auto !important\}', '', css)
css = re.sub(r'\.pin-label,\.map-pin:hover \.pin-label\{opacity:1 !important;visibility:visible !important;transform:translateX\(-50%\) translateY\(-3px\) !important;z-index:150 !important;border-color:#dfb35d !important;box-shadow:0 0 16px rgba\(223,179,93,0\.45\),0 8px 22px rgba\(0,0,0,\.7\) !important\}', '', css)

# Add clean pin and pin-label CSS
clean_pin_css = """
.map-pins-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none; }
.map-pin { position: absolute; width: 10px; height: 10px; background-color: #6ed6d2; opacity: 0.85; border-radius: 50%; transform: translate(-50%, -50%); transition: opacity .4s ease, transform .4s ease, background-color .4s ease; box-shadow: 0 0 8px rgba(110,214,210,0.6); z-index: 2; pointer-events: auto; cursor: pointer; }
.map-pin:hover, .map-pin.active { background-color: #f2c879; box-shadow: 0 0 18px #f2c879, 0 0 30px rgba(242,200,121,0.85); transform: translate(-50%, -50%) scale(1.35); opacity: 1; z-index: 50; }
.map-pin.active::after { content: ''; position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; border-radius: 50%; border: 2px solid #f2c879; animation: pulse-pin 1.7s infinite cubic-bezier(0.215, 0.61, 0.355, 1); pointer-events: none; }
.map-pin.active::before { content: ''; position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; border-radius: 50%; border: 1.5px solid rgba(255,235,150,0.7); animation: pulse-pin 1.7s infinite 0.4s cubic-bezier(0.215, 0.61, 0.355, 1); pointer-events: none; }

.pin-label { position: absolute; bottom: 140%; left: 50%; transform: translateX(-50%); background: rgba(6, 20, 34, 0.95); color: #fff; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; opacity: 0; visibility: hidden; pointer-events: none; white-space: nowrap; border: 1px solid rgba(242, 200, 121, 0.6); box-shadow: 0 8px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2); transition: opacity 0.3s cubic-bezier(.16,1,.3,1), transform 0.3s cubic-bezier(.16,1,.3,1); z-index: 100; backdrop-filter: blur(8px); }

.map-pin:hover .pin-label, .map-pin.active .pin-label { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; transform: translateX(-50%) translateY(-4px) !important; z-index: 200 !important; border-color: #f2c879 !important; box-shadow: 0 0 16px rgba(242, 200, 121, 0.5), 0 8px 22px rgba(0,0,0,0.8) !important; }
"""

css += "\n" + clean_pin_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("2. Fixed css/style.css pin rules.")
