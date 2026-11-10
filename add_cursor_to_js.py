with open('js/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

cursor_js = """
    // =========================================================================
    // 10. Fine-Pointer Ambient Mouse Cursor Animation
    // =========================================================================
    (() => {
        const field = document.querySelector('.cursor-pixel-field');
        if (!field || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
        
        let x = -200, y = -200, raf = 0;
        const render = () => {
            field.style.transform = `translate3d(${x - 56}px, ${y - 56}px, 0)`;
            raf = requestAnimationFrame(render);
        };
        
        window.addEventListener('pointermove', (event) => {
            x = event.clientX;
            y = event.clientY;
            document.body.classList.add('pixel-cursor-ready');
            if (!raf) raf = requestAnimationFrame(render);
        }, { passive: true });
        
        window.addEventListener('pointerleave', () => {
            document.body.classList.remove('pixel-cursor-ready');
            if (raf) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (raf) { cancelAnimationFrame(raf); raf = 0; }
            }
        });
    })();
"""

# Insert right before the closing DOMContentLoaded or at the end
if '});' in js:
    last_idx = js.rfind('});')
    js = js[:last_idx] + cursor_js + "\n});"
else:
    js += "\n" + cursor_js

with open('js/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS: Added fine-pointer ambient mouse cursor animation to js/main.js!")
