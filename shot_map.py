import subprocess
import os

out_map = os.path.abspath("actual_world_map_screenshot.png")
cmd = f'"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --screenshot="{out_map}" --window-size=1280,3200 "file:///{os.path.abspath("index.html")}"'

subprocess.run(cmd, shell=True)
print("Captured full page index screenshot, exists:", os.path.exists(out_map))
