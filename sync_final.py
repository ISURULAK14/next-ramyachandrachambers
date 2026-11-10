import shutil
import os
import glob

src_dir = os.path.abspath(".")
dest_dirs = [
    r"D:\ANTIGRAVITY\website",
    r"C:\Users\isuru\Desktop\anti web"
]

prod_patterns = ['*.html', 'css/*.css', 'js/*.js', '*.svg', '.htaccess', '*.webmanifest', 'favicon.ico', '*.png', '*.gif', '*.webp', '_headers', 'sitemap.xml', 'robots.txt']

for dest_dir in dest_dirs:
    os.makedirs(dest_dir, exist_ok=True)
    for pat in prod_patterns:
        for src_file in glob.glob(os.path.join(src_dir, pat)):
            rel = os.path.relpath(src_file, src_dir)
            dest_file = os.path.join(dest_dir, rel)
            os.makedirs(os.path.dirname(dest_file), exist_ok=True)
            shutil.copy2(src_file, dest_file)

    htaccess_src = os.path.join(src_dir, '.htaccess')
    if os.path.exists(htaccess_src):
        shutil.copy2(htaccess_src, os.path.join(dest_dir, '.htaccess'))

    print(f"Synced production files -> {dest_dir}")

print("Sync completed successfully.")
