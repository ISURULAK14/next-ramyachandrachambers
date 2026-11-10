import subprocess
import re

res = subprocess.run(['git', 'log', '--oneline', '-n', '30'], capture_output=True)
print(res.stdout.decode('utf-8', errors='ignore'))

# Search for cursor in all commits in js/main.js and css/style.css
commits = [line.split()[0] for line in res.stdout.decode('utf-8', errors='ignore').splitlines() if line.strip()]

for c in commits[:15]:
    r_js = subprocess.run(['git', 'show', f'{c}:js/main.js'], capture_output=True)
    js = r_js.stdout.decode('utf-8', errors='ignore')
    if 'cursor' in js.lower():
        print(f"Commit {c} has cursor in js/main.js:")
        for line in js.splitlines():
            if 'cursor' in line.lower():
                print("  ", line[:100])
