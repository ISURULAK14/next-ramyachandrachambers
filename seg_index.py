import subprocess
import os
from PIL import Image

out_full = os.path.abspath("full_index.png")
cmd = f'"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --screenshot="{out_full}" --window-size=1280,6000 "file:///{os.path.abspath("index.html")}"'

subprocess.run(cmd, shell=True)

if os.path.exists(out_full):
    img = Image.open(out_full)
    w, h = img.size
    print(f"Captured full page: {w} x {h}")
    # Let's crop into 4 segments of 1500px each
    for i in range(4):
        top = i * 1500
        bot = min(h, (i + 1) * 1500)
        if top < h:
            seg = img.crop((0, top, w, bot))
            seg.save(f'index_seg_{i+1}.png')
            print(f"Saved index_seg_{i+1}.png (y: {top} to {bot})")
