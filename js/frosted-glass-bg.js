/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Option C: Heavy Frosted Glass + Thick Gradient Stripes + Peripheral Halo Stripe-Reactive Backlight
 * (Editorial Noir: outer 25% margins glow, central text corridor locked in deep obsidian)
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    if ('transmissionResolutionScale' in renderer) {
        renderer.transmissionResolutionScale = 0.5;
    }
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
    // 1. Background Environment: Thick Gradient Stripes + Option C Peripheral Halo
    // =========================================================================
    const bgZ = -1.5;
    const bgGeo = new THREE.PlaneGeometry(1, 1);
    const bgUniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uActiveSide: { value: 1.0 },
        uLightY: { value: 0.55 },
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
            uniform float uActiveSide;
            uniform float uLightY;
            uniform vec2 uResolution;

            void main() {
                vec2 p = vUv;

                vec3 baseNoir = vec3(0.0118, 0.0706, 0.0549);      // #03120e
                vec3 deepEmerald = vec3(0.0235, 0.1451, 0.1137);   // #06251d
                vec3 royalEmerald = vec3(0.0510, 0.3059, 0.2314);  // #0d4e3b
                vec3 brightEmerald = vec3(0.0627, 0.7255, 0.5059); // #10b981
                vec3 champagne = vec3(0.8863, 0.7608, 0.4588);     // #e2c275
                vec3 warmGold = vec3(0.9804, 0.9098, 0.7059);      // #fae8b4

                // Thick monumental diagonal gradient stripes
                float stripeCoord = (p.x * 0.94 + p.y * 0.34) * 3.0 + uTime * 0.04 + uScroll * 0.00022;
                float thickBand = sin(stripeCoord * 3.14159265) * 0.5 + 0.5;
                float bandCurve = smoothstep(0.16, 0.86, thickBand);

                // Outer 25% peripheral margin mask; center 50% stays deep obsidian noir
                float peripheralMask = smoothstep(0.24, 0.49, abs(p.x - 0.5));

                vec3 col = mix(baseNoir, deepEmerald, bandCurve * (0.35 + 0.60 * peripheralMask));
                col = mix(col, royalEmerald, pow(bandCurve, 1.8) * peripheralMask * 0.85);

                // -------------------------------------------------------------
                // Option C: Dual-Lobe Peripheral Halo + Stripe-Reactive Backlight
                // Brightens the thick gradient stripes passing through outer 25%
                // empty margins near cursor/scroll height; center stays pure noir.
                // -------------------------------------------------------------
                float rightWeight = clamp(uActiveSide * 0.5 + 0.5, 0.0, 1.0);
                float leftWeight = 1.0 - rightWeight;
                float yPrimary = clamp(uLightY, 0.14, 0.86);
                float yCounter = 1.0 - yPrimary;

                // Dual smooth peripheral lobes (right & left outer edges)
                float rightDistY = exp(-pow((p.y - yPrimary) / 0.36, 2.0));
                float leftDistY = exp(-pow((p.y - yCounter) / 0.38, 2.0));

                float rightMargin = smoothstep(0.68, 0.98, p.x);
                float leftMargin = smoothstep(0.32, 0.02, p.x);

                float activeRight = rightMargin * mix(leftDistY, rightDistY, rightWeight);
                float activeLeft = leftMargin * mix(rightDistY, leftDistY, rightWeight);

                // Stripe-reactive illumination: thick bands catch warm champagne/emerald light
                float stripeBoost = 0.40 + 0.95 * bandCurve;

                vec3 primaryGlow = mix(brightEmerald, warmGold, 0.68);
                vec3 secondaryGlow = mix(royalEmerald, brightEmerald, 0.72);

                col += mix(secondaryGlow, primaryGlow, rightWeight) * activeRight * stripeBoost * 0.78;
                col += mix(secondaryGlow, primaryGlow, leftWeight) * activeLeft * stripeBoost * 0.78;

                // Ultra-soft champagne edge rim on the thick stripes in outer vignette
                col += champagne * pow(bandCurve, 2.6) * peripheralMask * (activeRight * rightWeight + activeLeft * leftWeight) * 0.36;

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Heavy Frosted Surface Micro-Texture (Normal Map via TextureLoader)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(4.5, 3);

    // =========================================================================
    // 3. Heavy Frosted Glass Shader (MeshPhysicalMaterial on Full-Screen PlaneGeometry)
    // =========================================================================
    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x9bd2be),
        transmission: 0.96,
        roughness: 0.72,
        ior: 1.52,
        thickness: 1.35,
        metalness: 0.02,
        clearcoat: 0.06,
        clearcoatRoughness: 0.8,
        attenuationColor: new THREE.Color(0x05241a),
        attenuationDistance: 9.0,
        normalMap,
        normalScale: new THREE.Vector2(0.22, 0.22),
        transparent: true,
        opacity: 1.0
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Minimal Ambient + Subtle Telemetry Light (Zero Front Hotspot Glare)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0c382a, 0.42);
    scene.add(ambientLight);

    const cursorLight = new THREE.PointLight(0xf6dfa6, 1.2, 18, 2.0);
    cursorLight.position.set(5.0, 0.5, 4.6);
    scene.add(cursorLight);

    // =========================================================================
    // 5. Responsive Frustum Scaling & Resize Handler
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

        normalMap.repeat.set(Math.max(2, w / 340), Math.max(2, h / 340));
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 6. Fluid Peripheral Halo Cursor Tracking & Scroll Glide
    // =========================================================================
    const targetNDC = { x: 0.88, y: 0.15 };
    const currentNDC = { x: 0.88, y: 0.15 };
    let targetSide = 1.0;
    let currentSide = 1.0;
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;

    function projectToEmptySide(ndcX) {
        const sign = ndcX >= 0 ? 1 : -1;
        const mag = Math.min(1, Math.abs(ndcX));
        return sign * (0.80 + mag * 0.14);
    }

    window.addEventListener('mousemove', (event) => {
        const rawX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        const rawY = -(event.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
        targetNDC.x = projectToEmptySide(rawX);
        targetNDC.y = rawY * 0.78;
        targetSide = rawX >= 0 ? 1.0 : -1.0;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
        const scrollPhase = targetScrollY * 0.0032;
        targetNDC.y = Math.sin(scrollPhase) * 0.68;
        const sideWave = Math.cos(targetScrollY * 0.0016);
        targetSide = sideWave >= 0 ? 1.0 : -1.0;
        targetNDC.x = targetSide * (0.82 + 0.12 * Math.abs(sideWave));
    }, { passive: true });

    // =========================================================================
    // 7. Smooth Frame-Rate Independent Animation Loop
    // =========================================================================
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;

        const posEase = 1 - Math.exp(-3.6 * dt);
        const sideEase = 1 - Math.exp(-2.8 * dt);
        const scrollEase = 1 - Math.exp(-4.5 * dt);

        smoothScrollY += (targetScrollY - smoothScrollY) * scrollEase;
        currentSide += (targetSide - currentSide) * sideEase;
        currentNDC.x += (targetNDC.x - currentNDC.x) * posEase;
        currentNDC.y += (targetNDC.y - currentNDC.y) * posEase;

        const safeNDCX = Math.abs(currentNDC.x) < 0.76
            ? (currentNDC.x >= 0 ? 0.76 : -0.76)
            : currentNDC.x;

        bgUniforms.uTime.value = elapsed;
        bgUniforms.uScroll.value = smoothScrollY;
        bgUniforms.uActiveSide.value = currentSide;
        bgUniforms.uLightY.value = currentNDC.y * 0.5 + 0.5;

        const worldX = safeNDCX * (frustumAtGlass.width * 0.5);
        const worldY = currentNDC.y * (frustumAtGlass.height * 0.5);
        cursorLight.position.set(worldX, worldY, 4.6);

        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: false,
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
