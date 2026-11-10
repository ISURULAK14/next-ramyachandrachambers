with open('js/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('const particleCount = isMobile ? 24 : 40;', 'const particleCount = isMobile ? 36 : 48;')

with open('js/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS: Updated js/main.js particle count for rich mobile animation.")
