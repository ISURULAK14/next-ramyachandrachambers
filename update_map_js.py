with open('js/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_map_marker = "// 4. World Map Active Pin Cycling"
old_map_end = "// 5. Testimonial / Google Reviews Carousel"

start_idx = js.find(old_map_marker)
end_idx = js.find(old_map_end)

if start_idx != -1 and end_idx != -1:
    new_map_code = """// 4. World Map Active Pin Cycling (Sleek Global Single-Pin Rotation)
    const mapWrapper = document.querySelector('.map-wrapper');
    const pins = [...document.querySelectorAll('.map-pin')];
    if (pins.length) {
        let pinIndex = 0;
        let timer = null;
        let isHovered = false;

        const featuredPinIds = [
            'pin-srilanka', 'pin-uk', 'pin-usa', 'pin-australia', 
            'pin-japan', 'pin-germany', 'pin-singapore', 'pin-dubai', 
            'pin-switzerland', 'pin-india', 'pin-nz', 'pin-france', 
            'pin-china', 'pin-maldives', 'pin-italy', 'pin-netherlands'
        ];

        const clearAllActivePins = () => pins.forEach(p => p.classList.remove('active'));

        const activateNext = () => {
            if (isHovered) return;
            clearAllActivePins();
            const pinId = featuredPinIds[pinIndex % featuredPinIds.length];
            const el = document.getElementById(pinId);
            if (el) el.classList.add('active');
            pinIndex++;
        };

        const startSequence = () => {
            if (timer) clearInterval(timer);
            activateNext();
            timer = setInterval(activateNext, 2400);
        };

        const stopSequence = () => {
            if (timer) clearInterval(timer);
            timer = null;
        };

        if (mapWrapper) {
            mapWrapper.addEventListener('mouseenter', () => {
                isHovered = true;
                stopSequence();
                clearAllActivePins();
            });
            mapWrapper.addEventListener('mouseleave', () => {
                isHovered = false;
                startSequence();
            });
        }

        pins.forEach(pin => {
            pin.addEventListener('mouseenter', () => {
                clearAllActivePins();
                pin.classList.add('active');
            });
            pin.addEventListener('mouseleave', () => {
                if (!isHovered) pin.classList.remove('active');
            });
        });

        startSequence();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSequence();
            else if (!isHovered) startSequence();
        });
    }

    """
    js = js[:start_idx] + new_map_code + js[end_idx:]
    with open('js/main.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("SUCCESS: Updated js/main.js with single-pin smooth rotation!")
else:
    print("Could not find markers:", start_idx, end_idx)
