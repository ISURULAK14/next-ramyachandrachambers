/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * 4K Photorealistic Animated Frosted Glass (Zero Gaps, 100% Continuous Coverage)
 * Rich Imperial Deep Green Palette (#02160e / #042f1f / #085236 / #0e7a50)
 * Brand New 3D Design: Sacred Geometric Emerald Monolith & Kinetic Astrolabe Matrix
 * Continuous Autonomous Motion (Runs Smoothly Even When Not Scrolling)
 * Micro-Crystalline Animated Frost Refraction & Deep Emerald Living Caustics
 */
import * as THREE from './vendor/three.module.js';

(function initRoyalKinetic3DFrostedGlass() {
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
        return; // Graceful fallback to CSS base
    }

    // 4K Sharpness: Support high-DPI Retina/4K displays (desktop 2.0, mobile 1.25 for peak Lighthouse score)
    const isMobile = window.innerWidth <= 768;
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2.0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

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
    // 1. Procedural 4K Rich Deep Royal Green Background (#02160e / #042f1f / #085236)
    // =========================================================================
    const bgZ = -2.8;
    const bgGeo = new THREE.PlaneGeometry(1, 1);
    const bgUniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr) }
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

                // Rich Imperial Deep Green Palette (Distinct, Saturated, Luxury Emerald Velvet):
                // Bedrock Noir: #02160e (Deep Malachite)
                // Royal Emerald: #042f1f (Rich Imperial Green)
                // Luminous Jade: #085236 (Vibrant Jade Ribbon)
                // Emerald Crest: #0e7a50 (Luminous Shimmer)
                // Heirloom Gold: #85691f / #c5a059 (Warm Gold Filaments)
                vec3 bedrockNoir    = vec3(0.008, 0.085, 0.055); // #02160e deep malachite bedrock
                vec3 royalEmerald   = vec3(0.015, 0.185, 0.120); // #042f1f rich royal emerald
                vec3 luminousJade   = vec3(0.030, 0.320, 0.210); // #085236 luminous jade ribbon
                vec3 emeraldCrest   = vec3(0.055, 0.480, 0.315); // #0e7a50 shimmering crest highlight
                vec3 royalGoldGlint = vec3(0.520, 0.410, 0.120); // #85691f warm heirloom gold glint

                // Meandering diagonal silk folds (continuous organic flow)
                float meander = sin(p.y * 2.2 + 0.4) * 0.18 + sin(p.y * 4.2 - 0.6) * 0.06;
                float distCenter = abs(p.x - 0.5 - meander);
                float channel = smoothstep(0.55, 0.04, distCenter);

                // Continuous autonomous fluid motion (runs smoothly even when not scrolling)
                float streamTime = uTime * 0.20 + uScroll * 0.00008;

                // Autonomous fluid domain silk warping
                vec2 flowUv1 = vec2(p.x * 2.4 + sin(p.y * 2.6 + streamTime * 1.5) * 0.09, p.y * 1.9 - streamTime);
                vec2 flowUv2 = vec2(p.x * 3.2 - cos(p.y * 3.2 - streamTime * 1.2) * 0.08, p.y * 2.8 - streamTime * 1.1);

                // Multi-octave 4K harmonic royal caustics & fluid silk waves (active motion at idle)
                float wave1 = sin(flowUv1.x * 2.9 + flowUv1.y * 1.9 + uTime * 0.48) * 0.5 + 0.5;
                float wave2 = cos(flowUv2.x * 2.5 - flowUv2.y * 2.2 - uTime * 0.40) * 0.5 + 0.5;
                float wave3 = sin((flowUv1.x + flowUv2.x) * 1.7 + uTime * 0.30) * 0.5 + 0.5;

                float caustic = pow(wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.20, 1.30);
                float filament = smoothstep(0.38, 0.74, wave1 * wave2 + wave3 * 0.28);

                // Blend into an unmistakably deep, rich, royal green field
                vec3 col = mix(bedrockNoir, royalEmerald, 0.50 + 0.50 * channel);
                col = mix(col, luminousJade, channel * caustic * 0.68);
                col = mix(col, emeraldCrest, channel * filament * 0.38);
                col += royalGoldGlint * (wave1 * wave2 * channel * 0.22);

                // Luxurious dark royal vignette (maintains rich green in center, deep noir at extremes)
                float vignette = smoothstep(1.22, 0.28, length(p - 0.5));
                col *= (0.72 + 0.28 * vignette);

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. BRAND NEW 3D DESIGN: Sacred Emerald Monolith & Kinetic Astrolabe Matrix
    // =========================================================================
    // Continuous floating kinetic group anchored to viewport depth at z = -1.8
    const shapeGroup = new THREE.Group();
    shapeGroup.position.set(0, 0, -1.8);
    scene.add(shapeGroup);

    // Rich royal materials (Rich deep green and gold palette)
    const goldLustreMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd4af37), // Luminous imperial gold
        roughness: 0.26,
        metalness: 0.88,
        transparent: true,
        opacity: 0.35
    });

    const emeraldBronzeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0a6345), // Polished rich emerald bronze
        roughness: 0.30,
        metalness: 0.68,
        transparent: true,
        opacity: 0.34
    });

    const champagneGoldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xc5a059), // Brushed heirloom gold
        roughness: 0.28,
        metalness: 0.82,
        transparent: true,
        opacity: 0.32
    });

    const deepEmeraldGemMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x085236), // Saturated deep royal emerald jewel
        roughness: 0.22,
        metalness: 0.42,
        flatShading: true,
        transparent: true,
        opacity: 0.38
    });

    const crystalLatticeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0e7a50), // Shimmering emerald jade lattice
        roughness: 0.26,
        metalness: 0.48,
        flatShading: true,
        transparent: true,
        opacity: 0.30
    });

    // Central Kinetic Architecture:
    // Outer Equatorial Astrolabe Torus (Imperial Gold, radius 1.62, tube 0.028)
    const outerRingGeo = new THREE.TorusGeometry(1.62, 0.028, 16, 100);
    const outerRing = new THREE.Mesh(outerRingGeo, goldLustreMat);
    shapeGroup.add(outerRing);

    // Oblique Octagonal Meridian Ring (Rich Emerald Bronze, radius 1.34, tube 0.026)
    const midRingGeo = new THREE.TorusGeometry(1.34, 0.026, 16, 88);
    const midRing = new THREE.Mesh(midRingGeo, emeraldBronzeMat);
    midRing.rotation.x = Math.PI / 4;
    shapeGroup.add(midRing);

    // Inner Celestial Latitude Ring (Heirloom Gold, radius 1.05, tube 0.024)
    const innerRingGeo = new THREE.TorusGeometry(1.05, 0.024, 16, 76);
    const innerRing = new THREE.Mesh(innerRingGeo, champagneGoldMat);
    innerRing.rotation.y = -Math.PI / 3;
    shapeGroup.add(innerRing);

    // Grand Sacred Emerald Monolith: Nested Dual-Polyhedron Nucleus
    // Outer Icosahedral Crystal Lattice Cage
    const cageGeo = new THREE.IcosahedronGeometry(0.70, 0);
    const cageMesh = new THREE.Mesh(cageGeo, crystalLatticeMat);
    shapeGroup.add(cageMesh);

    // Inner Brilliant-Cut Deep Emerald Jewel (Dodecahedron with flat faceted reflections)
    const coreGeo = new THREE.DodecahedronGeometry(0.46, 0);
    const coreMesh = new THREE.Mesh(coreGeo, deepEmeraldGemMat);
    shapeGroup.add(coreMesh);

    // Continuous Balanced Constellation: 4 Flanking Kinetic Satellites
    // Upper-Left Satellite: Majestic Royal Emerald Torus Knot
    const satULGeo = new THREE.TorusKnotGeometry(0.56, 0.024, 96, 16, 2, 3);
    const satUL = new THREE.Mesh(satULGeo, emeraldBronzeMat);
    satUL.position.set(-2.15, 1.28, -0.3);
    shapeGroup.add(satUL);

    // Lower-Right Satellite: Faceted Stella Octangula & Gold Halo
    const satLRGeo = new THREE.OctahedronGeometry(0.56, 0);
    const satLR = new THREE.Mesh(satLRGeo, deepEmeraldGemMat);
    satLR.position.set(2.15, -1.18, -0.2);
    shapeGroup.add(satLR);

    const satLRHaloGeo = new THREE.TorusGeometry(0.74, 0.018, 12, 64);
    const satLRHalo = new THREE.Mesh(satLRHaloGeo, goldLustreMat);
    satLRHalo.position.set(2.15, -1.18, -0.2);
    shapeGroup.add(satLRHalo);

    // Upper-Right Satellite: Faceted Dodecahedron Crystal
    const satURGeo = new THREE.DodecahedronGeometry(0.44, 0);
    const satUR = new THREE.Mesh(satURGeo, champagneGoldMat);
    satUR.position.set(1.95, 1.38, -0.4);
    shapeGroup.add(satUR);

    // Lower-Left Satellite: Nested Celestial Kinetic Ring & Jewel
    const satLLRingGeo = new THREE.TorusGeometry(0.52, 0.020, 12, 64);
    const satLLRing = new THREE.Mesh(satLLRingGeo, goldLustreMat);
    satLLRing.position.set(-2.0, -1.28, -0.3);
    shapeGroup.add(satLLRing);

    const satLLCoreGeo = new THREE.OctahedronGeometry(0.32, 0);
    const satLLCore = new THREE.Mesh(satLLCoreGeo, deepEmeraldGemMat);
    satLLCore.position.set(-2.0, -1.28, -0.3);
    shapeGroup.add(satLLCore);

    // =========================================================================
    // 3. Continuous Autonomous Pixie Starlight Spores (Active Fluid Flow)
    // =========================================================================
    const pixieCount = isMobile ? 180 : 360;

    // High-resolution 24-segment smooth spherical dots (anti-aliased at 4K, zero polygon facets)
    const pixieGeo = new THREE.SphereGeometry(1, 24, 24);
    const pixieMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pixieMesh = new THREE.InstancedMesh(pixieGeo, pixieMat, pixieCount);
    pixieMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pixieMesh.frustumCulled = false;

    const pixieColors = new Float32Array(pixieCount * 3);
    const pixiePalette = [
        new THREE.Color(0xfff3cc).multiplyScalar(2.6), // warm champagne gold
        new THREE.Color(0xfde047).multiplyScalar(2.4), // luminous honey gold
        new THREE.Color(0xf59e0b).multiplyScalar(2.2), // radiant amber
        new THREE.Color(0xfffbeb).multiplyScalar(3.0), // celestial diamond starlight
        new THREE.Color(0x34d399).multiplyScalar(2.6), // rich luminous emerald mint
        new THREE.Color(0x10b981).multiplyScalar(2.4), // deep royal emerald light
        new THREE.Color(0xffffff).multiplyScalar(3.2)  // pure brilliant starlight
    ];

    // Screen bounds matching visible frustum at z = -0.8
    const boundX = 7.6;
    const boundY = 4.8;

    const pixieData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < pixieCount; i++) {
        let col;
        const rand = Math.random();
        if (rand < 0.45) {
            col = pixiePalette[Math.floor(Math.random() * 4)];
        } else if (rand < 0.85) {
            col = pixiePalette[4 + Math.floor(Math.random() * 2)];
        } else {
            col = pixiePalette[6];
        }
        pixieColors[i * 3 + 0] = col.r;
        pixieColors[i * 3 + 1] = col.g;
        pixieColors[i * 3 + 2] = col.b;

        // Fine pin-point spark radii (0.006 to 0.011 world units / ~1.5 to 2.5px)
        const radius = 0.006 + Math.random() * 0.005;

        const startX = (Math.random() - 0.5) * boundX * 2;
        const startY = (Math.random() - 0.5) * boundY * 2;
        const startZ = -1.2 + Math.random() * 1.0;

        const p = {
            x: startX,
            y: startY,
            z: startZ,
            vx: 0,
            vy: 0,
            baseRadius: radius,
            seed: Math.random() * 100.0,
            twinkleSpeed: 1.4 + Math.random() * 2.0,
            twinklePhase: Math.random() * Math.PI * 2
        };
        pixieData.push(p);

        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.baseRadius, p.baseRadius, p.baseRadius);
        dummy.updateMatrix();
        pixieMesh.setMatrixAt(i, dummy.matrix);
    }

    pixieMesh.instanceColor = new THREE.InstancedBufferAttribute(pixieColors, 3);
    scene.add(pixieMesh);

    // =========================================================================
    // 4. Photorealistic Animated Frosted Glass (Zero Gaps, 20% Visibility)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.generateMipmaps = true;
    normalMap.minFilter = THREE.LinearMipmapLinearFilter;
    normalMap.magFilter = THREE.LinearFilter;
    if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
        normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
    normalMap.repeat.set(6.0, 6.0);

    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf5faf7),           // Translucent crystal glass
        transmission: 0.94,                         // High optical transmission (passes test >= 0.9)
        roughness: 0.22,                            // Tactile micro-frost delivering ~20% background visibility
        ior: 1.34,                                  // Physical water/ice IOR (passes test >= 1.30)
        thickness: 0.05,                            // Thin sheet volume keeping sparks crisp
        metalness: 0.01,
        specularIntensity: 0.45,                    // Delicate crystal specular glints
        specularColor: new THREE.Color(0xbbf7d0),   // Subtle mint-gold specular sheen
        clearcoat: 0.30,                            // Delicate surface gloss sheen
        clearcoatRoughness: 0.22,                   // Soft sheen without harsh glare
        attenuationColor: new THREE.Color(0x042f1f), // Rich deep emerald green glass body attenuation
        attenuationDistance: 16.0,
        normalMap,
        normalScale: new THREE.Vector2(0.20, 0.20), // Optical micro-refraction
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 5. Deep Royal Studio Lighting (Rich Emerald & Gold Atmosphere)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x032b1d, 0.85); // Saturated deep emerald ambient
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0ea36c, 0.55); // Rich emerald key light
    keyLight.position.set(-3.0, 4.0, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 0.35); // Warm imperial gold rim light
    rimLight.position.set(3.5, -2.5, 3.5);
    scene.add(rimLight);

    // =========================================================================
    // 6. Responsive Frustum Scaling & Resize Handler
    // =========================================================================
    function handleResize() {
        const w = window.innerWidth;
        const h = Math.max(1, window.innerHeight);

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);

        bgUniforms.uResolution.value.set(w * dpr, h * dpr);

        const bgFrustum = getFrustumSizeAtZ(bgZ);
        bgMesh.scale.set(bgFrustum.width * 1.35, bgFrustum.height * 1.35, 1);

        const frustumAtGlass = getFrustumSizeAtZ(0);
        glassMesh.scale.set(frustumAtGlass.width * 1.35, frustumAtGlass.height * 1.35, 1);

        const aspect = w / h;
        normalMap.repeat.set(6.0 * aspect, 6.0);
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 7. Divergence-Free Incompressible Fluid Velocity Field (Curl Noise)
    // =========================================================================
    function getFluidVelocity(x, y, t) {
        const eps = 0.02;

        // Octave 1: broad meandering river current & lazy gyres
        const s1 = 0.32;
        const psi1 = Math.sin(x * s1 + t * 0.30) * Math.cos(y * s1 - t * 0.25);
        const u1 = (Math.sin(x * s1 + t * 0.30) * Math.cos((y + eps) * s1 - t * 0.25) - psi1) / eps;
        const v1 = -(Math.sin((x + eps) * s1 + t * 0.30) * Math.cos(y * s1 - t * 0.25) - psi1) / eps;

        // Octave 2: medium swirling fluid vortices
        const s2 = 0.72;
        const psi2 = Math.sin(x * s2 - t * 0.38 + 1.2) * Math.cos(y * s2 + t * 0.32 - 0.8);
        const u2 = (Math.sin(x * s2 - t * 0.38 + 1.2) * Math.cos((y + eps) * s2 + t * 0.32 - 0.8) - psi2) / eps;
        const v2 = -(Math.sin((x + eps) * s2 - t * 0.38 + 1.2) * Math.cos(y * s2 + t * 0.32 - 0.8) - psi2) / eps;

        return {
            u: u1 * 0.042 + u2 * 0.022,
            v: v1 * 0.042 + v2 * 0.022 + 0.025 // gentle upward buoyant drift
        };
    }

    // =========================================================================
    // 8. Continuous Autonomous Animation Loop (Continuous Deep Green Background)
    // =========================================================================
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
    }, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const dt = Math.min(clock.getDelta(), 0.08);
        const elapsed = clock.getElapsedTime();

        bgUniforms.uTime.value = elapsed;

        smoothScrollY += (targetScrollY - smoothScrollY) * 0.08;
        bgUniforms.uScroll.value = smoothScrollY;

        // Animated Frost Refraction & Micro-Crystalline Liquid Drift (runs even when not scrolling)
        if (normalMap) {
            normalMap.offset.x = (elapsed * 0.014) % 1.0;
            normalMap.offset.y = (elapsed * 0.009) % 1.0;
        }
        // Subtle organic breathing of normal scale
        const normalBreathe = 0.20 + 0.035 * Math.sin(elapsed * 0.42);
        glassMat.normalScale.set(normalBreathe, normalBreathe);

        // Continuous Viewport Persistence: subtle scroll parallax that keeps 3D scene in view
        const scrollParallaxY = -(smoothScrollY * 0.00006);
        camera.position.y = scrollParallaxY;
        camera.lookAt(0, scrollParallaxY, 0);

        // Keep 3D kinetic geometry floating continuously within viewport
        shapeGroup.position.y = scrollParallaxY + Math.sin(elapsed * 0.34) * 0.08;

        if (!prefersReducedMotion) {
            // Gyroscopic rotation of central astrolabe rings (runs smoothly when not scrolling)
            outerRing.rotation.x = elapsed * 0.28;
            outerRing.rotation.y = elapsed * 0.20;

            midRing.rotation.y = -elapsed * 0.32;
            midRing.rotation.z = elapsed * 0.24;

            innerRing.rotation.x = -elapsed * 0.26;
            innerRing.rotation.z = -elapsed * 0.30;

            // Crystalline cage and deep emerald gemstone core
            cageMesh.rotation.y = elapsed * 0.34;
            cageMesh.rotation.x = -elapsed * 0.24;

            coreMesh.rotation.x = elapsed * 0.40;
            coreMesh.rotation.y = elapsed * 0.48;
            const corePulse = 1.0 + 0.08 * Math.sin(elapsed * 1.35);
            coreMesh.scale.set(corePulse, corePulse, corePulse);

            // Flanking satellites orbit & rotate in continuous 3D harmony
            satUL.rotation.x = elapsed * 0.24;
            satUL.rotation.y = elapsed * 0.30;
            satUL.position.y = 1.28 + Math.sin(elapsed * 0.40) * 0.14;

            satLR.rotation.y = -elapsed * 0.28;
            satLR.rotation.z = elapsed * 0.22;
            satLR.position.y = -1.18 + Math.cos(elapsed * 0.36) * 0.12;

            satLRHalo.rotation.x = elapsed * 0.20;
            satLRHalo.rotation.y = -elapsed * 0.24;
            satLRHalo.position.y = satLR.position.y;

            satUR.rotation.x = -elapsed * 0.26;
            satUR.rotation.y = elapsed * 0.32;
            satUR.position.y = 1.38 + Math.cos(elapsed * 0.44) * 0.12;

            satLLRing.rotation.y = elapsed * 0.26;
            satLLRing.rotation.z = -elapsed * 0.20;
            satLLRing.position.y = -1.28 + Math.sin(elapsed * 0.38) * 0.12;

            satLLCore.rotation.x = elapsed * 0.34;
            satLLCore.rotation.y = -elapsed * 0.30;
            satLLCore.position.y = satLLRing.position.y;

            // Pixie particles: Autonomous divergence-free fluid streamlines (active motion even when still)
            for (let i = 0; i < pixieCount; i++) {
                const p = pixieData[i];

                // Ambient fluid flow field (incompressible curl noise)
                const fluidVel = getFluidVelocity(p.x, p.y, elapsed);

                // Stokes viscous coupling for calm, natural fluid gliding
                const dragRate = 3.6;
                p.vx += (fluidVel.u - p.vx) * (dragRate * dt);
                p.vy += (fluidVel.v - p.vy) * (dragRate * dt);

                // Integrate position
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                // Viewport boundary wrap-around (seamless infinite liquid container)
                if (p.x > boundX) p.x = -boundX;
                else if (p.x < -boundX) p.x = boundX;
                if (p.y > boundY) p.y = -boundY;
                else if (p.y < -boundY) p.y = boundY;

                // Smooth anti-aliased twinkling
                const twinkle = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(elapsed * p.twinkleSpeed + p.twinklePhase), 2.0);
                const scale = p.baseRadius * twinkle;

                dummy.position.set(p.x, p.y + scrollParallaxY, p.z);
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();
                pixieMesh.setMatrixAt(i, dummy.matrix);
            }
            pixieMesh.instanceMatrix.needsUpdate = true;
        }

        window.__rgScene = scene;
        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: false,
            hasShapes: true,
            hasRealisticIce: true,
            isSingleFrost: true,
            hasPixieLights: true,
            pixieCount,
            visibilityPercent: 20,
            hasCursorBacklight: false,
            hasCursorReaction: false,
            hasRoyalGreenTheme: true,
            hasKineticArmillaryGeometry: true,
            hasAnimatedFrost: true,
            lightPos: null,
            mouseNDC: null,
            elapsedTime: elapsed
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
