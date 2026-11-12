/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Option A: Thick Architectural Gradient Stripes + Transmissive Satin-Frosted Glass
 * + Dual Edge-Lit Light Blades & Uniform Grid
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
    renderer.toneMappingExposure = 1.06;

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
    // 1. Background Environment: Thick Architectural Shader Gradient Stripes
    //    + Dual Edge-Lit Sconce Light Blades (Option A)
    // =========================================================================
    const bgZ = -1.5;
    const bgGeo = new THREE.PlaneGeometry(1, 1);
    const bgUniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uActiveSide: { value: 1.0 }, // +1 right margin, -1 left margin (smoothly interpolated)
        uLightY: { value: 0.55 },     // [0..1] vertical position of primary sconce blade
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

                // Preserved emerald noir palette
                vec3 baseNoir = vec3(0.0118, 0.0706, 0.0549);      // #03120e
                vec3 deepEmerald = vec3(0.0235, 0.1451, 0.1137);   // #06251d
                vec3 royalEmerald = vec3(0.0510, 0.3059, 0.2314);  // #0d4e3b
                vec3 brightEmerald = vec3(0.0627, 0.7255, 0.5059); // #10b981
                vec3 champagne = vec3(0.8863, 0.7608, 0.4588);     // #e2c275
                vec3 warmGold = vec3(0.9804, 0.9098, 0.7059);      // #fae8b4

                // Thick monumental diagonal gradient stripes (~3-4 wide bands across screen)
                float stripeCoord = (p.x * 0.94 + p.y * 0.34) * 3.1 + uTime * 0.045 + uScroll * 0.00025;
                float thickBand = sin(stripeCoord * 3.14159265) * 0.5 + 0.5;
                float bandCurve = smoothstep(0.15, 0.85, thickBand);

                float counterCoord = (p.x * 0.85 - p.y * 0.25) * 2.2 - uTime * 0.03;
                float counterBand = smoothstep(0.25, 0.88, sin(counterCoord * 3.14159265) * 0.5 + 0.5);

                // Darken center text column softly while letting thick bands breathe
                float edgeMask = smoothstep(0.14, 0.48, abs(p.x - 0.5));

                vec3 col = mix(baseNoir, deepEmerald, bandCurve * 0.92);
                col = mix(col, royalEmerald, pow(bandCurve, 1.8) * (0.42 + 0.45 * edgeMask));
                col += brightEmerald * counterBand * (0.04 + 0.12 * edgeMask);
                col += champagne * pow(bandCurve, 3.0) * (0.02 + 0.07 * edgeMask);

                // -------------------------------------------------------------
                // Option A: Dual Edge-Lit Architectural Light Blades (Sconce Bars)
                // Tightly constrained to left/right empty gutters; center stays dark
                // -------------------------------------------------------------
                float rightWeight = clamp(uActiveSide * 0.5 + 0.5, 0.0, 1.0);
                float leftWeight = 1.0 - rightWeight;

                // Tall vertical Gaussian blades at outer edges (x = 0.055 and x = 0.945)
                float leftBladeX = exp(-pow((p.x - 0.055) / 0.075, 2.0));
                float rightBladeX = exp(-pow((p.x - 0.945) / 0.075, 2.0));

                // Smooth tall vertical sconce envelope tracking cursor/scroll Y
                float yPrimary = clamp(uLightY, 0.14, 0.86);
                float yCounter = 1.0 - yPrimary;

                float primaryEnvY = exp(-pow((p.y - yPrimary) / 0.34, 2.0));
                float counterEnvY = exp(-pow((p.y - yCounter) / 0.38, 2.0));

                float rightCore = rightBladeX * mix(counterEnvY, primaryEnvY, rightWeight);
                float leftCore = leftBladeX * mix(primaryEnvY, counterEnvY, rightWeight);

                // Soft wide secondary atmospheric halo near outer edges only
                float rightHalo = exp(-pow((p.x - 0.91) / 0.14, 2.0)) * mix(counterEnvY, primaryEnvY, rightWeight);
                float leftHalo = exp(-pow((p.x - 0.09) / 0.14, 2.0)) * mix(primaryEnvY, counterEnvY, rightWeight);

                vec3 activeColor = mix(brightEmerald, warmGold, 0.78);
                vec3 counterColor = mix(royalEmerald, brightEmerald, 0.65);

                col += mix(counterColor, activeColor, rightWeight) * rightCore * 0.72;
                col += mix(counterColor, activeColor, rightWeight) * rightHalo * 0.22;

                col += mix(counterColor, activeColor, leftWeight) * leftCore * 0.72;
                col += mix(counterColor, activeColor, leftWeight) * leftHalo * 0.22;

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
        roughness: 0.48,
        ior: 1.5,
        thickness: 0.95,
        metalness: 0.02,
        clearcoat: 0.10,
        clearcoatRoughness: 0.62,
        attenuationColor: new THREE.Color(0x05241a),
        attenuationDistance: 9.0,
        normalMap,
        normalScale: new THREE.Vector2(0.14, 0.14),
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
                float minorAlpha = (1.0 - min(line, 1.0)) * 0.07;

                vec2 majorCoord = gl_FragCoord.xy / (uGridSize * 4.0);
                vec2 majorGrid = abs(fract(majorCoord - 0.5) - 0.5) / fwidth(majorCoord);
                float majorLine = min(majorGrid.x, majorGrid.y);
                float majorAlpha = (1.0 - min(majorLine, 1.0)) * 0.05;

                vec3 color = mix(uAccentColor, uLineColor, 0.65);
                float alpha = clamp(minorAlpha + majorAlpha, 0.0, 0.12);
                gl_FragColor = vec4(color, alpha);
            }
        `
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.position.z = 0.02;
    scene.add(gridMesh);

    // =========================================================================
    // 5. Subtle Front Physical Sheen Light (No Circular Hotspot)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0a2e23, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 0.25);
    dirLight.position.set(-5, 4, 4);
    scene.add(dirLight);

    // Gentle edge sheen PointLight synchronized with active light blade
    const cursorLight = new THREE.PointLight(0xf6dfa6, 6.5, 22, 1.6);
    cursorLight.position.set(5.0, 0.5, 4.2);
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
    // 7. Fluid Empty-Margin Sconce Tracking & Scroll Glide
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
    // 8. Smooth Frame-Rate Independent Animation Loop
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
        cursorLight.position.set(worldX, worldY, 4.2);

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
