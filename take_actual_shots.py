import subprocess
import os

# Let's run a local HTTP server or open file with chrome/edge to take screenshot
html_path = os.path.abspath("faq.html")
out_faq = os.path.abspath("actual_faq_screenshot.png")
out_map = os.path.abspath("actual_index_screenshot.png")

cmd_faq = f'"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --screenshot="{out_faq}" --window-size=1280,1600 "file:///{html_path}"'
cmd_index = f'"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --screenshot="{out_map}" --window-size=1280,1600 "file:///{os.path.abspath("index.html")}"'

print("Running Edge FAQ screenshot...")
res1 = subprocess.run(cmd_faq, shell=True, capture_output=True, text=True)
print("Res1:", res1.returncode, os.path.exists(out_faq))

print("Running Edge Index screenshot...")
res2 = subprocess.run(cmd_index, shell=True, capture_output=True, text=True)
print("Res2:", res2.returncode, os.path.exists(out_map))
