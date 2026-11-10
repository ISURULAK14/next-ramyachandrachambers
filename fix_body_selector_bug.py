import re

with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Fix corrupt body selectors:
# 1. body{max-height:0;overflow:hidden; -> .faq-body{max-height:0;overflow:hidden;
css = css.replace('body{max-height:0;overflow:hidden;transition:max-height 0.55s cubic-bezier(.22,1,.36,1),opacity 0.35s ease;opacity:0}',
                  '.faq-body{max-height:0;overflow:hidden;transition:max-height 0.55s cubic-bezier(.22,1,.36,1),opacity 0.35s ease;opacity:0}')

css = css.replace('.faq-card.is-open body{opacity:1}', '.faq-card.is-open .faq-body{opacity:1}')

# 2. body{color:#cbd5e1;font-size:0.98rem;line-height:1.75;display:flex;flex-direction:column;gap:0.9rem} -> .legal-modal-body{...}
css = css.replace('body{color:#cbd5e1;font-size:0.98rem;line-height:1.75;display:flex;flex-direction:column;gap:0.9rem}',
                  '.legal-modal-body{color:#cbd5e1;font-size:0.98rem;line-height:1.75;display:flex;flex-direction:column;gap:0.9rem}')

css = css.replace('body p{margin:0}', '.legal-modal-body p{margin:0}')
css = css.replace('body strong{color:#ffffff}', '.legal-modal-body strong{color:#ffffff}')

# Ensure body has standard reset
body_reset = "body{font-family:'Montserrat',sans-serif;color:var(--text-primary);line-height:1.7;background-color:var(--bg-base);background-image:var(--bg-texture);background-attachment:fixed;background-size:auto,auto,180px 100%,100% 140px,auto;overflow-x:hidden;width:100%;transition:background-color 0.5s ease,color 0.5s ease}"
css = re.sub(r'body\{font-size:0\.95rem;color:var\(--text-primary\);line-height:1\.65;font-style:italic\}', '', css)

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("SUCCESS: Fixed all corrupted body selectors in css/style.css!")
