import re

with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

pin_rules = re.findall(r'(\.pin-[a-z0-9-_]+)\s*\{([^}]+)\}', css)

coords = {}
for sel, body in pin_rules:
    pin_class = sel.strip().lstrip('.')
    top_m = re.search(r'top:\s*([0-9.]+)%', body)
    left_m = re.search(r'left:\s*([0-9.]+)%', body)
    if top_m and left_m:
        coords[pin_class] = {
            'top': float(top_m.group(1)),
            'left': float(left_m.group(1))
        }

print(f"Total pins with coords found in CSS: {len(coords)}")
for p, c in sorted(coords.items(), key=lambda x: (x[1]['left'], x[1]['top'])):
    print(f"  {p:20} -> left: {c['left']:5.1f}%, top: {c['top']:5.1f}%")
