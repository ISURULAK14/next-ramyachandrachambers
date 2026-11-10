import subprocess

res_orig = subprocess.run(['git', 'show', '0ed49c3:css/style.css'], capture_output=True, text=True)
with open('orig_style.css', 'w', encoding='utf-8') as f:
    f.write(res_orig.stdout)

print("Original 0ed49c3 css/style.css size:", len(res_orig.stdout))

with open('css/style.css', 'r', encoding='utf-8') as f:
    cur = f.read()

print("Current css/style.css size:", len(cur))
