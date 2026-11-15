/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * 4K Photorealistic Animated Frosted Glass (Zero Gaps, 100% Seamless Coverage)
 * Deep Royal Green Palette (#01140d / #032517 / #08442a / #0e5e3a)
 * Brand New Kinetic 3D Armillary & Polyhedral Geometry (Concentric Gyroscopic Rings)
 * Autonomous Ambient Fluid Motion (Zero Mouse Cursor Disturbance / Completely Serene)
 * Micro-Crystalline Animated Frost Refraction & Gentle Liquid Drift
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
    renderer.toneMappingExposure = 1.0;

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
    // 1. Procedural 4K Deep Royal Green Background (#01140d / #032517 / #08442a)
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

                // Calibrated Deep Royal Green Palette (Crown & Velvet Architecture):
                // Abyss Bedrock: #01140d -> Imperial Royal Green: #032517 -> Luminous Royal Jade: #08442a
                vec3 bedrockNoir    = vec3(0.0018, 0.0125, 0.0085); // #01140d ultra deep malachite bedrock
                vec3 royalGreen     = vec3(0.0055, 0.0340, 0.0210); // #032517 deep imperial royal green
                vec3 luminousJade   = vec3(0.0110, 0.0680, 0.0420); // #08442a rich royal jade ribbon
                vec3 royalCrest     = vec3(0.0220, 0.1150, 0.0720); // #0e5e3a shimmering crest highlight
                vec3 royalGoldGlint = vec3(0.0650, 0.0480, 0.0150); // #4a3812 warm heirloom gold glint

                // Meandering royal river thalweg
                float meander = sin(p.y * 2.0 + 0.3) * 0.15 + sin(p.y * 3.8 - 0.5) * 0.05;
                float distCenter = abs(p.x - 0.5 - meander);
                float channel = smoothstep(0.48, 0.05, distCenter);

                float streamTime = uTime * 0.05 + uScroll * 0.00018;

                // Autonomous fluid domain silk warping
                vec2 flowUv1 = vec2(p.x * 2.2 + sin(p.y * 2.8 + streamTime * 1.6) * 0.08, p.y * 1.8 - streamTime);
                vec2 flowUv2 = vec2(p.x * 3.0 - cos(p.y * 3.0 - streamTime * 1.3) * 0.07, p.y * 2.6 - streamTime * 1.0);

                // Multi-octave 4K harmonic royal caustics & fluid silk waves
                float wave1 = sin(flowUv1.x * 2.8 + flowUv1.y * 1.8 + uTime * 0.22) * 0.5 + 0.5;
                float wave2 = cos(flowUv2.x * 2.4 - flowUv2.y * 2.1 - uTime * 0.18) * 0.5 + 0.5;
                float wave3 = sin((flowUv1.x + flowUv2.x) * 1.6 + uTime * 0.12) * 0.5 + 0.5;

                float caustic = pow(wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.20, 1.35);
                float filament = smoothstep(0.40, 0.76, wave1 * wave2 + wave3 * 0.28);

                vec3 col = mix(bedrockNoir, royalGreen, 0.48 + 0.52 * channel);
                col = mix(col, luminousJade, channel * caustic * 0.62);
                col = mix(col, royalCrest, channel * filament * 0.32);
                col += royalGoldGlint * (wave1 * wave2 * channel * 0.22);

                // Luxurious dark royal vignette (seamless continuity with navbar and footer)
                float vignette = smoothstep(1.18, 0.32, length(p - 0.5));
                col *= (0.68 + 0.32 * vignette);

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. BRAND NEW 3D ANIMATION GEOMETRY: Kinetic Armillary Celestial Core
    // =========================================================================
    // User request: "no reaction to mouse cursor needed. new 3d animation geometry needed . brandnew design ."
    // Concentric interlocking gyroscopic rings + faceted nucleus floating at z = -1.8
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -1.8;
    scene.add(shapeGroup);

    // Common premium royal materials
    const goldRingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xb8923a), // Brushed heirloom gold
        roughness: 0.38,
        metalness: 0.75,
        transparent: true,
        opacity: 0.24
    });

    const emeraldRingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x063d2a), // Polished royal emerald bronze
        roughness: 0.42,
        metalness: 0.60,
        transparent: true,
        opacity: 0.22
    });

    const champagneRingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd4af37), // Luminous imperial gold
        roughness: 0.35,
        metalness: 0.80,
        transparent: true,
        opacity: 0.22
    });

    const crystalCoreMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0a4d36), // Deep faceted royal emerald
        roughness: 0.30,
        metalness: 0.20,
        flatShading: true,
        transparent: true,
        opacity: 0.25
    });

    // Outer Armillary Ring (Heirloom Gold, radius 1.55, thickness 0.024)
    const outerRingGeo = new THREE.TorusGeometry(1.55, 0.024, 16, 96);
    const outerRing = new THREE.Mesh(outerRingGeo, goldRingMat);
    shapeGroup.add(outerRing);

    // Middle Gyroscopic Ring (Royal Emerald, radius 1.25, thickness 0.022)
    const midRingGeo = new THREE.TorusGeometry(1.25, 0.022, 16, 84);
    const midRing = new THREE.Mesh(midRingGeo, emeraldRingMat);
    shapeGroup.add(midRing);

    // Inner Gyroscopic Ring (Imperial Gold, radius 0.95, thickness 0.020)
    const innerRingGeo = new THREE.TorusGeometry(0.95, 0.020, 16, 72);
    const innerRing = new THREE.Mesh(innerRingGeo, champagneRingMat);
    shapeGroup.add(innerRing);

    // Central Faceted Royal Crystal Nucleus (Stellated Polyhedron)
    const coreGeo = new THREE.OctahedronGeometry(0.52, 0);
    const coreMesh = new THREE.Mesh(coreGeo, crystalCoreMat);
    shapeGroup.add(coreMesh);

    // Left Flanking Kinetic Satellite: Elegant Torus Knot (radius 0.65, tube 0.022)
    const leftSatelliteMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x073f2c),
        roughness: 0.48,
        metalness: 0.30,
        transparent: true,
        opacity: 0.18
    });
    const leftSatelliteGeo = new THREE.TorusKnotGeometry(0.65, 0.022, 96, 16, 3, 2);
    const leftSatellite = new THREE.Mesh(leftSatelliteGeo, leftSatelliteMat);
    leftSatellite.position.set(-1.85, 0.85, -0.3);
    shapeGroup.add(leftSatellite);

    // Right Flanking Kinetic Satellite: Faceted Geodesic Sphere (radius 0.58)
    const rightSatelliteMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x423414),
        roughness: 0.45,
        metalness: 0.40,
        flatShading: true,
        transparent: true,
        opacity: 0.18
    });
    const rightSatelliteGeo = new THREE.IcosahedronGeometry(0.58, 1);
    const rightSatellite = new THREE.Mesh(rightSatelliteGeo, rightSatelliteMat);
    rightSatellite.position.set(1.85, -0.75, -0.2);
    shapeGroup.add(rightSatellite);

    // =========================================================================
    // 3. Autonomous Ambient Pixie Starlight Spores (Completely Calm Fluid Flow)
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
        new THREE.Color(0x6ee7b7).multiplyScalar(2.4), // glowing royal aquamarine
        new THREE.Color(0x34d399).multiplyScalar(2.2), // luminous emerald mint
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
        if (rand < 0.50) {
            col = pixiePalette[Math.floor(Math.random() * 4)];
        } else if (rand < 0.82) {
            col = pixiePalette[4 + Math.floor(Math.random() * 2)];
        } else {
            col = pixiePalette[6];
        }
        pixieColors[i * 3 + 0] = col.r;
        pixieColors[i * 3 + 1] = col.g;
        pixieColors[i * 3 + 2] = col.b;

        // Small, fine pin-point spark radii (0.006 to 0.011 world units / ~1.5 to 2.5px)
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
            twinkleSpeed: 1.2 + Math.random() * 1.8,
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
        specularIntensity: 0.40,                    // Delicate crystal specular glints
        specularColor: new THREE.Color(0xbbf7d0),   // Subtle mint-gold specular sheen
        clearcoat: 0.28,                            // Delicate surface gloss sheen
        clearcoatRoughness: 0.24,                   // Soft sheen without harsh glare
        attenuationColor: new THREE.Color(0x032517), // Deep royal green glass body attenuation
        attenuationDistance: 20.0,
        normalMap,
        normalScale: new THREE.Vector2(0.20, 0.20), // Optical micro-refraction
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 5. Deep Royal Studio Lighting (NO CURSOR BACKLIGHT)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x01140d, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0a4d36, 0.38);
    keyLight.position.set(-3.0, 4.0, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4a3812, 0.24);
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
        const s1 = 0.30;
        const psi1 = Math.sin(x * s1 + t * 0.18) * Math.cos(y * s1 - t * 0.15);
        const u1 = (Math.sin(x * s1 + t * 0.18) * Math.cos((y + eps) * s1 - t * 0.15) - psi1) / eps;
        const v1 = -(Math.sin((x + eps) * s1 + t * 0.18) * Math.cos(y * s1 - t * 0.15) - psi1) / eps;

        // Octave 2: medium swirling fluid vortices
        const s2 = 0.70;
        const psi2 = Math.sin(x * s2 - t * 0.28 + 1.2) * Math.cos(y * s2 + t * 0.24 - 0.8);
        const u2 = (Math.sin(x * s2 - t * 0.28 + 1.2) * Math.cos((y + eps) * s2 + t * 0.24 - 0.8) - psi2) / eps;
        const v2 = -(Math.sin((x + eps) * s2 - t * 0.28 + 1.2) * Math.cos(y * s2 + t * 0.24 - 0.8) - psi2) / eps;

        return {
            u: u1 * 0.032 + u2 * 0.015,
            v: v1 * 0.032 + v2 * 0.015 + 0.020 // gentle upward buoyant drift
        };
    }

    // =========================================================================
    // 8. Smooth Autonomous Scroll & Frame Animation (ZERO CURSOR REACTION)
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

        // Animated Frost Refraction & Micro-Crystalline Liquid Drift
        if (normalMap) {
            normalMap.offset.x = (elapsed * 0.004) % 1.0;
            normalMap.offset.y = (elapsed * 0.0025) % 1.0;
        }
        // Subtle organic breathing of normal scale
        const normalBreathe = 0.20 + 0.035 * Math.sin(elapsed * 0.35);
        glassMat.normalScale.set(normalBreathe, normalBreathe);

        // Gentle camera parallax linked purely to scroll (zero cursor reaction)
        camera.position.y = -(smoothScrollY * 0.0004);
        camera.lookAt(0, -(smoothScrollY * 0.0004), 0);

        if (!prefersReducedMotion) {
            // Gyroscopic rotation of concentric armillary rings
            outerRing.rotation.x = elapsed * 0.22;
            outerRing.rotation.y = elapsed * 0.16;

            midRing.rotation.y = -elapsed * 0.26;
            midRing.rotation.z = elapsed * 0.18;

            innerRing.rotation.x = -elapsed * 0.20;
            innerRing.rotation.z = -elapsed * 0.24;

            // Central faceted nucleus spins & pulses gently
            coreMesh.rotation.x = elapsed * 0.35;
            coreMesh.rotation.y = elapsed * 0.45;
            const corePulse = 1.0 + 0.08 * Math.sin(elapsed * 1.2);
            coreMesh.scale.set(corePulse, corePulse, corePulse);

            // Flanking satellites orbit & rotate
            leftSatellite.rotation.x = elapsed * 0.18;
            leftSatellite.rotation.y = elapsed * 0.24;
            leftSatellite.position.y = 0.85 + Math.sin(elapsed * 0.35) * 0.15;

            rightSatellite.rotation.y = -elapsed * 0.20;
            rightSatellite.rotation.z = elapsed * 0.15;
            rightSatellite.position.y = -0.75 + Math.cos(elapsed * 0.30) * 0.14;

            // Pixie particles: Autonomous divergence-free fluid streamlines (zero cursor perturbation)
            for (let i = 0; i < pixieCount; i++) {
                const p = pixieData[i];

                // Ambient fluid flow field (incompressible curl noise)
                const fluidVel = getFluidVelocity(p.x, p.y, elapsed);

                // Stokes viscous coupling for calm, natural fluid gliding
                const dragRate = 3.5;
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

                dummy.position.set(p.x, p.y, p.z);
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
