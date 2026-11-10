import subprocess

res = subprocess.run(['git', 'show', 'ebeae5b:index.html'], capture_output=True)
html = res.stdout.decode('utf-8', errors='ignore')

# Search for cursor script
idx = html.find('cursor')
while idx != -1:
    print("-------------------------")
    print(html[max(0, idx-100):min(len(html), idx+300)])
    idx = html.find('cursor', idx+300)
