import shutil
import os
import subprocess

src_dir = os.path.abspath(".")
dest_dir = "C:\\Users\\isuru\\Desktop\\anti web"

files_to_sync = [
    ('css/style.css', 'css/style.css'),
    ('faq.html', 'faq.html'),
    ('index.html', 'index.html'),
    ('js/main.js', 'js/main.js'),
    ('world_map.svg', 'world_map.svg'),
]

for src_rel, dest_rel in files_to_sync:
    s = os.path.join(src_dir, src_rel)
    d = os.path.join(dest_dir, dest_rel)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.copy2(s, d)
    print(f"Synced {src_rel} -> {dest_dir}")

print("Sync completed successfully.")
