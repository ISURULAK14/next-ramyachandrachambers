import glob
import re
import subprocess
import os

print("==================================================")
print("             1. JS SYNTAX & LINT CHECK            ")
print("==================================================")
js_files = glob.glob('js/*.js')
for jf in js_files:
    res = subprocess.run(['node', '--check', jf], capture_output=True, text=True)
    if res.returncode == 0:
        print(f"PASS: {jf} is valid JavaScript syntax.")
    else:
        print(f"FAIL: {jf} syntax error:\n{res.stderr}")

print("\n==================================================")
print("             2. CSS SYNTAX INTEGRITY CHECK        ")
print("==================================================")
css_files = glob.glob('css/*.css')
for cf in css_files:
    with open(cf, 'r', encoding='utf-8') as f:
        content = f.read()
    open_braces = content.count('{')
    close_braces = content.count('}')
    if open_braces == close_braces:
        print(f"PASS: {cf} braces balance: {open_braces} open, {close_braces} close.")
    else:
        print(f"FAIL: {cf} braces MISMATCH! Open: {open_braces}, Close: {close_braces}")

print("\n==================================================")
print("             3. HTML TAGS & ASSETS AUDIT          ")
print("==================================================")
html_files = [f for f in glob.glob('*.html') if not f.startswith('orig_') and not f.startswith('temp_')]
for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Check doctype
    has_doctype = html.strip().lower().startswith('<!doctype html>')
    # Check title
    has_title = bool(re.search(r'<title>[^<]+</title>', html, re.I))
    # Check canonical
    has_canonical = bool(re.search(r'<link\s+rel="canonical"', html, re.I))
    # Check closing html tag
    has_closing_html = '</html>' in html.lower()
    
    # Check missing local assets
    asset_matches = re.findall(r'(?:src|href)=["\']([^"\'#:]+)["\']', html)
    missing_assets = []
    for asset in asset_matches:
        if asset.endswith(('.css', '.js', '.svg', '.png', '.gif', '.webp', '.ico', '.webmanifest')):
            # strip query strings
            clean_asset = asset.split('?')[0].lstrip('/')
            if not os.path.exists(clean_asset):
                missing_assets.append(asset)
                
    status = "PASS" if (has_doctype and has_title and has_canonical and has_closing_html and not missing_assets) else "WARN"
    print(f"[{status}] {hf}: Doctype={has_doctype}, Title={has_title}, Canonical={has_canonical}, MissingAssets={missing_assets}")
