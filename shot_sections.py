import subprocess
import os
from PIL import Image

sections = ['home', 'about', 'services', 'practice-areas', 'testimonials', 'contact']

for sec in sections:
    out = os.path.abspath(f"sec_{sec}.png")
    # Take screenshot scrolled to #sec
    url = f"file:///{os.path.abspath('index.html')}#{sec}"
    cmd = f'"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --screenshot="{out}" --window-size=1280,1000 "{url}"'
    subprocess.run(cmd, shell=True)
    print(f"Captured sec_{sec}.png (exists: {os.path.exists(out)})")
