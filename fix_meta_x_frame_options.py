import glob
import re

html_files = glob.glob('*.html')
for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<meta http-equiv="X-Frame-Options"' in content:
        content = re.sub(r'\s*<meta http-equiv="X-Frame-Options"[^>]*>', '', content)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned meta X-Frame-Options in {fpath}")

print("Cleaned all meta tags.")
