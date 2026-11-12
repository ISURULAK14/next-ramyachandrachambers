/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Three.js Transmissive Satin-Frosted Glass + Architectural Gradient Stripes + Uniform Grid
 * + Silky 60fps Frame-Independent Empty-Margin Backlight
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

    // Cap DPR & half-res transmission target for locked 60/120fps silky frosted rendering
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    if ('transmissionResolutionScale' in renderer) {
        renderer.transmissionResolutionScale = 0.5;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;

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
    // 1. Background Environment Layer: Preserved Shader Gradient Stripes
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

                vec3 baseNoir = vec3(0.0118, 0.0706, 0.0549);      // #03120e
                vec3 deepEmerald = vec3(0.0235, 0.1373, 0.1098);   // #06231c
                vec3 midEmerald = vec3(0.0314, 0.1020, 0.0824);    // #081a15
                vec3 brightEmerald = vec3(0.0627, 0.7255, 0.5059); // #10b981
                vec3 champagne = vec3(0.8863, 0.7608, 0.4588);     // #e2c275

                float diag = clamp(p.x * 0.55 + (1.0 - p.y) * 0.45, 0.0, 1.0);
                vec3 col = mix(baseNoir, deepEmerald, smoothstep(0.0, 0.45, diag));
                col = mix(col, midEmerald, smoothstep(0.45, 0.80, diag));
                col = mix(col, baseNoir, smoothstep(0.80, 1.0, diag));

                col += brightEmerald * smoothstep(0.65, 0.0, length(p - vec2(0.5, 1.05))) * 0.16;
                col += champagne * smoothstep(0.55, 0.0, length(p - vec2(0.86, 0.78))) * 0.12;

                // Architectural fluted gradient stripes
                float angle = radians(14.0);
                vec2 rot = vec2(
                    px.x * cos(angle) - px.y * sin(angle),
                    px.x * sin(angle) + px.y * cos(angle)
                );
                float drift = uTime * 10.0 + uScroll * 0.12;

                float bandWave = sin((rot.x + drift) * 0.020) * 0.5 + 0.5;
                float bandStripe = smoothstep(0.22, 0.88, bandWave);
                float secondaryWave = sin((px.x * 0.016 - px.y * 0.007) - uTime * 0.25) * 0.5 + 0.5;

                // Keep central text corridor dark & legible while side margins glow softly
                float edgeMask = smoothstep(0.12, 0.48, abs(p.x - 0.5));
                col += deepEmerald * bandStripe * 0.70;
                col += brightEmerald * pow(bandStripe, 2.2) * (0.10 + 0.18 * edgeMask);
                col += champagne * smoothstep(0.62, 0.98, secondaryWave) * (0.04 + 0.10 * edgeMask);

                float fineStripe = smoothstep(0.90, 1.0, sin((rot.x * 0.32)) * 0.5 + 0.5);
                col += vec3(0.06, 0.15, 0.11) * fineStripe * 0.16;

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Refined Satin-Frosted Surface Micro-Texture (Normal Map via TextureLoader)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(4, 2.5);

    // =========================================================================
    // 3. Frosted Glass Shader (MeshPhysicalMaterial on Full-Screen PlaneGeometry)
    // =========================================================================
    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x8ecab3),
        transmission: 0.96,
        roughness: 0.52,
        ior: 1.5,
        thickness: 0.95,
        metalness: 0.02,
        clearcoat: 0.12,
        clearcoatRoughness: 0.58,
        attenuationColor: new THREE.Color(0x05241a),
        attenuationDistance: 9.0,
        normalMap,
        normalScale: new THREE.Vector2(0.16, 0.16),
        transparent: true,
        opacity: 1.0
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Fine Uniform Screen-Space Grid Overlay
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
                float minorAlpha = (1.0 - min(line, 1.0)) * 0.075;

                vec2 majorCoord = gl_FragCoord.xy / (uGridSize * 4.0);
                vec2 majorGrid = abs(fract(majorCoord - 0.5) - 0.5) / fwidth(majorCoord);
                float majorLine = min(majorGrid.x, majorGrid.y);
                float majorAlpha = (1.0 - min(majorLine, 1.0)) * 0.055;

                vec3 color = mix(uAccentColor, uLineColor, 0.65);
                float alpha = clamp(minorAlpha + majorAlpha, 0.0, 0.13);
                gl_FragColor = vec4(color, alpha);
            }
        `
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.position.z = 0.02;
    scene.add(gridMesh);

    // =========================================================================
    // 5. Velvety Dynamic Lighting In Front of Glass Plane (Empty Margins Only)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0a2e23, 0.42);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 0.30);
    dirLight.position.set(-5, 4, 3.5);
    scene.add(dirLight);

    // Primary luminous champagne backlight (soft wide bloom at z = 3.8)
    const cursorLight = new THREE.PointLight(0xf6dfa6, 22.0, 28, 1.5);
    cursorLight.position.set(4.5, 0.6, 3.8);
    scene.add(cursorLight);

    // Subtle emerald-teal counter-rim on opposite margin for balanced luxury depth
    const counterLight = new THREE.PointLight(0x10b981, 7.5, 24, 1.6);
    counterLight.position.set(-4.8, -0.8, 3.4);
    scene.add(counterLight);

    // =========================================================================
    // 6. Responsive Frustum Scaling & Resize Handler
    // =========================================================================
    let frustumAtGlass = getFrustumSizeAtZ(0);

    function handleResize() {
        const w = window.innerWidth;
        const h = Math.max(1, window.innerHeight);

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
        renderer.setSize(w, h, false);

        bgUniforms.uResolution.value.set(w, h);

        const bgFrustum = getFrustumSizeAtZ(bgZ);
        bgMesh.scale.set(bgFrustum.width * 1.02, bgFrustum.height * 1.02, 1);

        frustumAtGlass = getFrustumSizeAtZ(0);
        glassMesh.scale.set(frustumAtGlass.width * 1.02, frustumAtGlass.height * 1.02, 1);

        const gridFrustum = getFrustumSizeAtZ(0.02);
        gridMesh.scale.set(gridFrustum.width * 1.02, gridFrustum.height * 1.02, 1);

        normalMap.repeat.set(Math.max(2, w / 360), Math.max(2, h / 360));
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 7. Fluid Empty-Margin Tracking & Silky Scroll Glide
    // =========================================================================
    const targetNDC = { x: 0.84, y: 0.15 };
    const currentNDC = { x: 0.84, y: 0.15 };
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;

    // Project horizontal cursor smoothly into outer empty margins (|x| >= 0.76)
    // so central text columns always remain dark and readable.
    function projectToEmptySide(ndcX) {
        const sign = ndcX >= 0 ? 1 : -1;
        const mag = Math.min(1, Math.abs(ndcX));
        return sign * (0.76 + mag * 0.18);
    }

    window.addEventListener('mousemove', (event) => {
        const rawX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        const rawY = -(event.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
        targetNDC.x = projectToEmptySide(rawX);
        targetNDC.y = rawY * 0.78;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
        // Smooth organic wave along empty margin on scroll (no jarring snap)
        const scrollPhase = targetScrollY * 0.0035;
        targetNDC.y = Math.sin(scrollPhase) * 0.68;
        const sideWave = Math.cos(targetScrollY * 0.0018);
        const sign = sideWave >= 0 ? 1 : -1;
        targetNDC.x = sign * (0.78 + 0.14 * Math.abs(sideWave));
    }, { passive: true });

    // =========================================================================
    // 8. Frame-Rate Independent Smooth Animation Loop
    // =========================================================================
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;

        // Exponential damping (butter-smooth at any refresh rate)
        const posEase = 1 - Math.exp(-3.8 * dt);
        const scrollEase = 1 - Math.exp(-5.0 * dt);

        smoothScrollY += (targetScrollY - smoothScrollY) * scrollEase;
        bgUniforms.uTime.value = elapsed;
        bgUniforms.uScroll.value = smoothScrollY;

        currentNDC.x += (targetNDC.x - currentNDC.x) * posEase;
        currentNDC.y += (targetNDC.y - currentNDC.y) * posEase;

        // Keep light clamped outside the central text corridor during cross-glides
        const safeNDCX = Math.abs(currentNDC.x) < 0.76
            ? (currentNDC.x >= 0 ? 0.76 : -0.76)
            : currentNDC.x;

        const worldX = safeNDCX * (frustumAtGlass.width * 0.5);
        const worldY = currentNDC.y * (frustumAtGlass.height * 0.5);

        cursorLight.position.set(worldX, worldY, 3.8);
        counterLight.position.set(-worldX * 0.92, -worldY * 0.65, 3.4);

        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: Boolean(gridMesh.visible),
            mouseNDC: { x: safeNDCX, y: currentNDC.y },
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
