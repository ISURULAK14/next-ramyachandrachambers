import subprocess
import os
import re
from PIL import Image

# 1. Update css/style.css: Eliminate the opacity:0 hiding bug permanently
with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace any opacity:0 on reveal or card or section
css = re.sub(r'\.reveal\{opacity:0;[^}]*\}', '.reveal{opacity:1;transform:none !important;visibility:visible !important;}', css)
css = re.sub(r'\.reveal-slide-[a-z]+\{transform:[^}]*\}', '', css)
css = re.sub(r'\.reveal-flip\{transform:[^}]*\}', '', css)
css = re.sub(r'\.reveal-scale\{transform:[^}]*\}', '', css)

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("1. Made all reveal elements 100% visible in css/style.css.")

# 2. Also strip reveal classes from faq.html so FAQ cards never hide
with open('faq.html', 'r', encoding='utf-8') as f:
    faq_html = f.read()

faq_html = faq_html.replace('class="faq-card glass-panel reveal reveal-slide-up"', 'class="faq-card glass-panel"')
faq_html = faq_html.replace('class="faq-card glass-panel reveal"', 'class="faq-card glass-panel"')

with open('faq.html', 'w', encoding='utf-8') as f:
    f.write(faq_html)

print("2. Stripped reveal classes from faq.html.")

# 3. Take screenshots of faq.html and index.html
out_faq = os.path.abspath("test_faq_100_visible.png")
out_index = os.path.abspath("test_index_100_visible.png")

cmd_faq = f'"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --screenshot="{out_faq}" --window-size=1280,2400 "file:///{os.path.abspath("faq.html")}"'
cmd_index = f'"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --screenshot="{out_index}" --window-size=1280,6000 "file:///{os.path.abspath("index.html")}"'

subprocess.run(cmd_faq, shell=True)
subprocess.run(cmd_index, shell=True)

if os.path.exists(out_faq):
    print("FAQ screenshot captured:", out_faq)

if os.path.exists(out_index):
    img = Image.open(out_index)
    w, h = img.size
    print(f"Index screenshot: {w} x {h}")
    for i in range(6):
        t, b = i * 1000, min(h, (i + 1) * 1000)
        if t < h:
            img.crop((0, t, w, b)).save(f'visible_slice_{i+1}.png')
            print(f"Saved visible_slice_{i+1}.png")
