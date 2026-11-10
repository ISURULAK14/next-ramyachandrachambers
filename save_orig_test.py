import subprocess

res = subprocess.run(['git', 'show', '0ed49c3:index.html'], capture_output=True)
html = res.stdout.decode('utf-8', errors='ignore')

t_start = html.find('id="testimonials"')
t_end = html.find('</section>', t_start)

with open('orig_testimonials_0ed49c3.html', 'w', encoding='utf-8') as f:
    f.write(html[t_start:t_end+10])

print("Saved orig_testimonials_0ed49c3.html")
