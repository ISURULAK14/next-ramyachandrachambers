/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Three.js Transmissive Frosted Glass + Shader Gradient Stripes + Uniform Grid
 * + Bright Empty-Margin Cursor & Scroll-Jump Backlight
 */
import * as THREE from './vendor/three.module.js';

(function initFrostedGlassBackground() {
    const canvas = document.getElementById('frosted-glass-canvas');
    if (!canvas) return;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
    } catch (err) {
        return; // Graceful fallback to CSS #03120e emerald base
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / Math.max(1, window.innerHeight),
        0.1,
        100
    );
    camera.position.set(0, 0, 10);

    function getFrustumSizeAtZ(zPlane) {
        const dist = camera.position.z - zPlane;
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFov / 2) * dist;
        const width = height * camera.aspect;
        return { width, height };
    }

    // =========================================================================
    // 1. Background Environment Layer: Earlier Shader Gradient Stripes & Emerald Glow
    // =========================================================================
    const bgZ = -1.6;
    const bgGeo = new THREE.PlaneGeometry(1, 1);
    const bgUniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };
    const bgMat = new THREE.ShaderMaterial({
        uniforms: bgUniforms,
        depthWrite: false,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform float uScroll;
            uniform vec2 uResolution;

            void main() {
                vec2 p = vUv;
                vec2 px = vUv * uResolution;

                // Preserved --bg-texture base emerald palette
                vec3 baseNoir = vec3(0.0118, 0.0706, 0.0549);      // #03120e
                vec3 deepEmerald = vec3(0.0235, 0.1373, 0.1098);   // #06231c
                vec3 midEmerald = vec3(0.0314, 0.1020, 0.0824);    // #081a15
                vec3 brightEmerald = vec3(0.0627, 0.7255, 0.5059); // #10b981
                vec3 champagne = vec3(0.8863, 0.7608, 0.4588);     // #e2c275

                // Base diagonal gradient + subtle radial glows
                float diag = clamp(p.x * 0.55 + (1.0 - p.y) * 0.45, 0.0, 1.0);
                vec3 col = mix(baseNoir, deepEmerald, smoothstep(0.0, 0.45, diag));
                col = mix(col, midEmerald, smoothstep(0.45, 0.80, diag));
                col = mix(col, baseNoir, smoothstep(0.80, 1.0, diag));

                col += brightEmerald * smoothstep(0.65, 0.0, length(p - vec2(0.5, 1.05))) * 0.18;
                col += champagne * smoothstep(0.55, 0.0, length(p - vec2(0.86, 0.78))) * 0.14;

                // Earlier architectural fluted gradient stripes (diagonal aurora bands + vertical fluted bars)
                float angle = radians(14.0);
                vec2 rot = vec2(
                    px.x * cos(angle) - px.y * sin(angle),
                    px.x * sin(angle) + px.y * cos(angle)
                );
                float drift = uTime * 14.0 + uScroll * 0.18;

                // Broad soft gradient stripes (replaces random geometric shapes)
                float bandWave = sin((rot.x + drift) * 0.022) * 0.5 + 0.5;
                float bandStripe = smoothstep(0.25, 0.85, bandWave);
                float secondaryWave = sin((px.x * 0.018 - px.y * 0.008) - uTime * 0.35) * 0.5 + 0.5;

                // Keep central text corridor darker while stripes shimmer cleanly
                float edgeMask = smoothstep(0.10, 0.48, abs(p.x - 0.5));
                col += deepEmerald * bandStripe * 0.75;
                col += brightEmerald * pow(bandStripe, 2.2) * (0.12 + 0.18 * edgeMask);
                col += champagne * smoothstep(0.62, 0.98, secondaryWave) * (0.05 + 0.11 * edgeMask);

                // Subtle fine 12deg diagonal architectural pinstripe sheen
                float fineStripe = smoothstep(0.88, 1.0, sin((rot.x * 0.35)) * 0.5 + 0.5);
                col += vec3(0.08, 0.18, 0.14) * fineStripe * 0.22;

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Surface Displacement (Normal Map via THREE.TextureLoader)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(5, 3);

    // =========================================================================
    // 3. Frosted Glass Shader (MeshPhysicalMaterial on Full-Screen PlaneGeometry)
    // =========================================================================
    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x9bd4bf),
        transmission: 0.96,
        roughness: 0.48,
        ior: 1.5,
        thickness: 1.0,
        metalness: 0.02,
        clearcoat: 0.16,
        clearcoatRoughness: 0.52,
        attenuationColor: new THREE.Color(0x05241a),
        attenuationDistance: 9.0,
        normalMap,
        normalScale: new THREE.Vector2(0.36, 0.36),
        bumpMap: normalMap,
        bumpScale: 0.014,
        transparent: true,
        opacity: 1.0
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Distinct, Fine, Uniform Screen-Space Grid Overlay
    // =========================================================================
    const gridGeo = new THREE.PlaneGeometry(1, 1);
    const gridUniforms = {
        uGridSize: { value: 44.0 },
        uLineColor: { value: new THREE.Color(0xe2c275) },
        uAccentColor: { value: new THREE.Color(0x34d399) }
    };
    const gridMat = new THREE.ShaderMaterial({
        uniforms: gridUniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uGridSize;
            uniform vec3 uLineColor;
            uniform vec3 uAccentColor;
            void main() {
                vec2 coord = gl_FragCoord.xy / uGridSize;
                vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
                float line = min(grid.x, grid.y);
                float minorAlpha = (1.0 - min(line, 1.0)) * 0.085;

                vec2 majorCoord = gl_FragCoord.xy / (uGridSize * 4.0);
                vec2 majorGrid = abs(fract(majorCoord - 0.5) - 0.5) / fwidth(majorCoord);
                float majorLine = min(majorGrid.x, majorGrid.y);
                float majorAlpha = (1.0 - min(majorLine, 1.0)) * 0.06;

                vec3 color = mix(uAccentColor, uLineColor, 0.65);
                float alpha = clamp(minorAlpha + majorAlpha, 0.0, 0.14);
                gl_FragColor = vec4(color, alpha);
            }
        `
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.position.z = 0.02;
    scene.add(gridMesh);

    // =========================================================================
    // 5. Bright Dynamic Backlight Constrained to Empty Side Margins
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0a2e23, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 0.35);
    dirLight.position.set(-5, 4, 3.5);
    scene.add(dirLight);

    // High-brightness backlight positioned in front of the frosted glass plane
    const cursorLight = new THREE.PointLight(0xfae8b4, 30.0, 26, 1.35);
    cursorLight.position.set(4.5, 0.8, 2.9);
    scene.add(cursorLight);

    // =========================================================================
    // 6. Responsive Frustum Scaling & Resize Handler
    // =========================================================================
    let frustumAtGlass = getFrustumSizeAtZ(0);

    function handleResize() {
        const w = window.innerWidth;
        const h = Math.max(1, window.innerHeight);

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);

        bgUniforms.uResolution.value.set(w, h);

        const bgFrustum = getFrustumSizeAtZ(bgZ);
        bgMesh.scale.set(bgFrustum.width * 1.02, bgFrustum.height * 1.02, 1);

        frustumAtGlass = getFrustumSizeAtZ(0);
        glassMesh.scale.set(frustumAtGlass.width * 1.02, frustumAtGlass.height * 1.02, 1);

        const gridFrustum = getFrustumSizeAtZ(0.02);
        gridMesh.scale.set(gridFrustum.width * 1.02, gridFrustum.height * 1.02, 1);

        normalMap.repeat.set(Math.max(2, w / 320), Math.max(2, h / 320));
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 7. Interactivity: Empty-Side Cursor Tracking + Involuntary Scroll Jump
    // =========================================================================
    const mouse = { x: 0.85, y: 0.15 };
    const currentLight = { x: 0, y: 0 };
    let scrollJumpSide = 1; // +1 = right empty gutter, -1 = left empty gutter
    let lastScrollY = window.scrollY || 0;

    // Map horizontal cursor into empty outer side margins (|x| in [0.76, 0.96])
    // so central text columns always remain dark and high-contrast.
    function projectToEmptySide(ndcX) {
        const sign = ndcX >= 0 ? 1 : -1;
        const mag = Math.min(1, Math.abs(ndcX));
        return sign * (0.76 + mag * 0.20);
    }

    window.addEventListener('mousemove', (event) => {
        const rawX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        const rawY = -(event.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
        mouse.x = projectToEmptySide(rawX);
        mouse.y = rawY * 0.85;
        scrollJumpSide = rawX >= 0 ? 1 : -1;
    }, { passive: true });

    // Involuntary jump on scroll while keeping light strictly in empty side margin
    window.addEventListener('scroll', () => {
        const nowY = window.scrollY || 0;
        const delta = nowY - lastScrollY;
        lastScrollY = nowY;
        bgUniforms.uScroll.value = nowY;

        if (Math.abs(delta) > 4) {
            if (Math.abs(delta) > 35) {
                scrollJumpSide = (Math.floor(nowY / 180) % 2 === 0) ? 1 : -1;
            }
            const sideBias = 0.78 + (Math.abs(Math.sin(nowY * 0.017)) * 0.18);
            mouse.x = scrollJumpSide * sideBias;
            mouse.y = Math.max(-0.85, Math.min(0.85, Math.sin(nowY * 0.013) * 0.78));
        }
    }, { passive: true });

    // =========================================================================
    // 8. Animation Loop (requestAnimationFrame)
    // =========================================================================
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const elapsed = clock.getElapsedTime();
        bgUniforms.uTime.value = elapsed;

        const targetX = mouse.x * (frustumAtGlass.width * 0.5);
        const targetY = mouse.y * (frustumAtGlass.height * 0.5);
        currentLight.x += (targetX - currentLight.x) * 0.18;
        currentLight.y += (targetY - currentLight.y) * 0.18;
        cursorLight.position.set(currentLight.x, currentLight.y, 2.9);

        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: Boolean(gridMesh.visible),
            mouseNDC: { x: mouse.x, y: mouse.y },
            lightPos: { x: cursorLight.position.x, y: cursorLight.position.y, z: cursorLight.position.z }
        };
    }

    function animate() {
        if (document.hidden) {
            rafId = 0;
            return;
        }
        renderFrame();
        rafId = requestAnimationFrame(animate);
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !rafId) {
            clock.getDelta();
            rafId = requestAnimationFrame(animate);
        }
    });

    rafId = requestAnimationFrame(animate);
})();
