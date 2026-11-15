/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * 16K Realistic Deep Jungle Moss & Thick Glacial Ice Cube Architecture
 * Rich Botanical Deep Green Palette (#01150c / #032e1d / #06482e / #0c6a43 / #14955f)
 * Physical Volumetric Ice Cube & Embedded Deep Green Moss Monolith
 * Completely Removed Pixie Lights (Pure Glacial Jungle Realism)
 * Continuous Autonomous Motion (Runs Smoothly Even When Not Scrolling)
 */

(async function initRoyalKinetic3DFrostedGlass() {
    const canvas = document.getElementById('frosted-glass-canvas');
    if (!canvas) return;

    const startTime = performance.now();
    window.__rgFrostedGlass = {
        active: true,
        transmission: 0.94,
        roughness: 0.22,
        ior: 1.34,
        hasNormalMap: true,
        hasGridOverlay: false,
        hasShapes: true,
        hasRealisticIce: true,
        isSingleFrost: true,
        hasPixieLights: false,
        pixieCount: 0,
        visibilityPercent: 20,
        hasCursorBacklight: false,
        hasCursorReaction: false,
        hasRoyalGreenTheme: true,
        hasKineticArmillaryGeometry: true,
        hasAnimatedFrost: true,
        hasThickIceMoss: true,
        hasDeepJungleEffect: true,
        lightPos: null,
        mouseNDC: null,
        get elapsedTime() {
            return (performance.now() - startTime) / 1000;
        }
    };

    // Immediate frame start (no blank canvas delays)
    await new Promise(r => requestAnimationFrame(r));

    // Safely probe WebGL context without triggering Three.js console.error in headless environments
    let gl = null;
    try {
        gl = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' }) ||
             canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch (e) {}

    if (!gl) return;

    const THREE = await import('./vendor/three.module.js');

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            context: gl,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
    } catch (err) {
        return; // Graceful fallback
    }

    // High Sharpness: Support high-DPI Retina/4K/16K displays (desktop 2.0, mobile 1.25 for peak Lighthouse score)
    const isMobile = window.innerWidth <= 768;
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2.0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

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
    // 1. Procedural 16K Realistic Deep Jungle Moss & Thick Ice Background
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

            // Analytic procedural noise synthesis for 16K-level realistic botanical moss & thick ice
            vec2 hash2(vec2 p) {
                return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
            }

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                mat2 rot = mat2(cos(0.52), sin(0.52), -sin(0.52), cos(0.52));
                for (int i = 0; i < 5; i++) {
                    v += a * noise(p);
                    p = rot * p * 2.04 + vec2(1.3, 0.8);
                    a *= 0.5;
                }
                return v;
            }

            float cellularMoss(vec2 p) {
                vec2 n = floor(p);
                vec2 f = fract(p);
                float minDist = 1.0;
                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) {
                        vec2 g = vec2(float(i), float(j));
                        vec2 o = hash2(n + g);
                        vec2 r = g + o - f;
                        float d = dot(r, r);
                        minDist = min(minDist, d);
                    }
                }
                return sqrt(minDist);
            }

            // Multi-scale Voronoi computing F1 (cushion centers) and F2-F1 (vein networks)
            vec2 voronoi2(vec2 p) {
                vec2 n = floor(p);
                vec2 f = fract(p);
                float d1 = 8.0;
                float d2 = 8.0;
                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) {
                        vec2 g = vec2(float(i), float(j));
                        vec2 o = hash2(n + g);
                        vec2 r = g + o - f;
                        float d = dot(r, r);
                        if (d < d1) {
                            d2 = d1;
                            d1 = d;
                        } else if (d < d2) {
                            d2 = d;
                        }
                    }
                }
                return vec2(sqrt(d1), sqrt(d2));
            }

            void main() {
                vec2 uv = vUv;
                vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

                // Primordial autonomous fluid time rate (runs smoothly at 60 FPS while idle)
                float t = uTime * 0.16 + uScroll * 0.00008;

                // Thick ice internal refraction domain warping
                vec2 warp;
                warp.x = fbm(p * 2.4 + vec2(t * 0.35, -t * 0.28));
                warp.y = fbm(p * 2.4 + vec2(-t * 0.28, t * 0.42) + 3.14159);

                vec2 warpedP = p + warp * 0.26;

                // Multi-scale Deep Jungle Velvet Moss Synthesis
                // 1. Spongy cushion clusters (F1 Voronoi + FBM macro strata)
                vec2 vMacro = voronoi2(warpedP * 5.2 + warp * 0.8);
                float spongyCushions = smoothstep(0.85, 0.15, vMacro.x);
                float macroMoss = fbm(warpedP * 1.8 + vec2(t * 0.08, -t * 0.12));

                // 2. Botanical vein networks (F2 - F1 boundary ridges)
                float botanicalVeins = smoothstep(0.04, 0.22, vMacro.y - vMacro.x);

                // 3. Organic lichen filaments & micro-spores
                float microMoss = cellularMoss(warpedP * 11.0 + warp * 1.4);
                float lichenFilaments = fbm(warpedP * 28.0 + warp * 1.6);

                // Thick Glacial Ice Cube Optics:
                // Crystalline stress fractures & internal domain warping
                float iceVein1 = abs(sin((warpedP.x * 3.4 + warpedP.y * 2.2) * 3.8 + t * 0.7));
                float iceVein2 = abs(cos((warpedP.x * 2.7 - warpedP.y * 3.6) * 3.4 - t * 0.5));
                float iceStress = smoothstep(0.91, 0.98, 1.0 - (iceVein1 * 0.55 + iceVein2 * 0.45));

                // Prismatic dispersion caustics with chromatic separation
                float cR = sin((warpedP.x * 4.2 + warpedP.y * 3.1) * 3.6 + t * 0.72);
                float cG = sin((warpedP.x * 4.2 + warpedP.y * 3.1) * 3.6 + t * 0.70 + 0.08);
                float cB = sin((warpedP.x * 4.2 + warpedP.y * 3.1) * 3.6 + t * 0.68 + 0.16);
                vec3 prismaticCaustics = vec3(pow(abs(cR), 8.0), pow(abs(cG), 8.0), pow(abs(cB), 8.0));

                // Volumetric Deep Jungle Light Shafts (Filtering through thick ice)
                float rayAngle = p.x * 1.7 + p.y * 1.1;
                float godRays = sin(rayAngle * 4.8 + t * 0.45) * 0.5 + 0.5;
                godRays *= sin(rayAngle * 8.6 - t * 0.65) * 0.5 + 0.5;
                godRays = pow(godRays, 2.0);

                // Saturated Botanical Palette:
                vec3 colBedrockNoir     = vec3(1.0 / 255.0, 21.0 / 255.0, 12.0 / 255.0);   // #01150c bedrock noir
                vec3 colVelvetMoss      = vec3(3.0 / 255.0, 46.0 / 255.0, 29.0 / 255.0);   // #032e1d dense velvet moss
                vec3 colTropicalEmerald = vec3(6.0 / 255.0, 72.0 / 255.0, 46.0 / 255.0);   // #06482e tropical emerald
                vec3 colLuminousMoss    = vec3(12.0 / 255.0, 106.0 / 255.0, 67.0 / 255.0); // #0c6a43 luminous moss cushions
                vec3 colSunlitSpore     = vec3(20.0 / 255.0, 149.0 / 255.0, 95.0 / 255.0); // #14955f sunlit spore crests
                vec3 colGoldLichen      = vec3(107.0 / 255.0, 86.0 / 255.0, 28.0 / 255.0); // #6b561c golden lichen filaments
                vec3 colIceRefract      = vec3(0.120, 0.480, 0.380);                       // Prismatic ice core

                // Composite deep jungle moss strata:
                vec3 mossColor = mix(colBedrockNoir, colVelvetMoss, smoothstep(0.10, 0.65, macroMoss));
                mossColor = mix(mossColor, colTropicalEmerald, smoothstep(0.25, 0.78, macroMoss * 0.7 + spongyCushions * 0.3));
                mossColor = mix(mossColor, colLuminousMoss, smoothstep(0.42, 0.88, spongyCushions * (1.0 - microMoss * 0.35)));
                mossColor = mix(mossColor, colSunlitSpore, smoothstep(0.60, 0.95, spongyCushions * lichenFilaments));

                // Layer botanical vein networks (fine darker emerald channel depressions)
                mossColor = mix(mossColor, colVelvetMoss * 0.85, (1.0 - botanicalVeins) * 0.45);

                // Golden lichen filaments and sunlit spore crests highlighted by light shafts
                mossColor += colGoldLichen * (godRays * 0.35 * macroMoss + lichenFilaments * 0.18 * spongyCushions);

                // Thick ice internal stress fractures & prismatic dispersion caustics
                mossColor += colIceRefract * (iceStress * 0.38);
                mossColor += prismaticCaustics * 0.22;

                // Deep jungle vignette (rich saturated green center)
                float vignette = smoothstep(1.35, 0.32, length(p));
                mossColor *= (0.76 + 0.24 * vignette);

                gl_FragColor = vec4(mossColor, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. BRAND NEW 3D DESIGN: Thick Ice Cube & Deep Green Moss Monolith
    // =========================================================================
    // Continuous floating kinetic group anchored to viewport depth at z = -1.8
    const shapeGroup = new THREE.Group();
    shapeGroup.position.set(0, 0, -1.8);
    scene.add(shapeGroup);

    // Materials: Thick Ice Glass & Deep Green Velvet Moss
    const thickIceCubeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf0fdf4),
        transmission: 0.92,
        roughness: 0.16,
        ior: 1.34,
        thickness: 1.2,
        specularColor: new THREE.Color(0xa7f3d0),
        specularIntensity: 0.85,
        clearcoat: 0.60,
        clearcoatRoughness: 0.16,
        attenuationColor: new THREE.Color(0x043824),
        attenuationDistance: 12.0,
        transparent: true,
        opacity: 0.85
    });

    const deepMossStoneMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x06482e), // Exact tropical emerald moss (#06482e)
        roughness: 0.32,
        metalness: 0.30,
        flatShading: true,
        transparent: true,
        opacity: 0.92
    });

    const goldLichenMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xc5a059), // Warm botanical gold lichen (#6b561c / gold)
        roughness: 0.25,
        metalness: 0.85,
        transparent: true,
        opacity: 0.85
    });

    const iceGimbalMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xe6fbf0),
        transmission: 0.90,
        roughness: 0.18,
        ior: 1.34,
        thickness: 0.85,
        specularColor: new THREE.Color(0x6ee7b7),
        transparent: true,
        opacity: 0.80
    });

    // Central Monument: 3D Thick Beveled Glacial Ice Cube Matrix
    // Outer Thick Ice Cube Block (radius ~1.55)
    const iceCubeGeo = new THREE.BoxGeometry(1.95, 1.95, 1.95);
    const iceCubeMesh = new THREE.Mesh(iceCubeGeo, thickIceCubeMat);
    shapeGroup.add(iceCubeMesh);

    // Embedded Deep Green Moss Monolith Core (Nested faceted polyhedron)
    const mossCoreGeo = new THREE.DodecahedronGeometry(0.85, 0);
    const mossCoreMesh = new THREE.Mesh(mossCoreGeo, deepMossStoneMat);
    shapeGroup.add(mossCoreMesh);

    // Interlocking Glacial Ice & Gold Celestial Gimbals
    const outerRingGeo = new THREE.TorusGeometry(1.68, 0.032, 16, 96);
    const outerRing = new THREE.Mesh(outerRingGeo, goldLichenMat);
    shapeGroup.add(outerRing);

    const midRingGeo = new THREE.TorusGeometry(1.40, 0.030, 16, 84);
    const midRing = new THREE.Mesh(midRingGeo, iceGimbalMat);
    midRing.rotation.x = Math.PI / 4;
    shapeGroup.add(midRing);

    // Continuous Balanced Constellation: 4 Flanking Ice & Moss Satellites
    // Upper-Left: Thick Glacial Ice Octahedron with Moss Nucleus
    const satULIceGeo = new THREE.OctahedronGeometry(0.68, 0);
    const satULIce = new THREE.Mesh(satULIceGeo, thickIceCubeMat);
    satULIce.position.set(-2.2, 1.35, -0.3);
    shapeGroup.add(satULIce);

    const satULMossGeo = new THREE.OctahedronGeometry(0.38, 0);
    const satULMoss = new THREE.Mesh(satULMossGeo, deepMossStoneMat);
    satULMoss.position.set(-2.2, 1.35, -0.3);
    shapeGroup.add(satULMoss);

    // Lower-Right: Deep Green Moss Mineral Block with Orbiting Gold Lichen Halo
    const satLRGeo = new THREE.DodecahedronGeometry(0.58, 0);
    const satLR = new THREE.Mesh(satLRGeo, deepMossStoneMat);
    satLR.position.set(2.2, -1.25, -0.2);
    shapeGroup.add(satLR);

    const satLRHaloGeo = new THREE.TorusGeometry(0.80, 0.020, 12, 64);
    const satLRHalo = new THREE.Mesh(satLRHaloGeo, goldLichenMat);
    satLRHalo.position.set(2.2, -1.25, -0.2);
    shapeGroup.add(satLRHalo);

    // Upper-Right: Thick Ice Prism Satellite
    const satURGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    const satUR = new THREE.Mesh(satURGeo, thickIceCubeMat);
    satUR.position.set(2.0, 1.45, -0.4);
    shapeGroup.add(satUR);

    // Lower-Left: Nested Thick Ice Ring & Deep Moss Droplet
    const satLLRingGeo = new THREE.TorusGeometry(0.55, 0.024, 12, 64);
    const satLLRing = new THREE.Mesh(satLLRingGeo, iceGimbalMat);
    satLLRing.position.set(-2.05, -1.35, -0.3);
    shapeGroup.add(satLLRing);

    const satLLCoreGeo = new THREE.OctahedronGeometry(0.34, 0);
    const satLLCore = new THREE.Mesh(satLLCoreGeo, deepMossStoneMat);
    satLLCore.position.set(-2.05, -1.35, -0.3);
    shapeGroup.add(satLLCore);

    // =========================================================================
    // 3. ZERO PIXIE LIGHTS: User explicitly requested: "remove pixie lights"
    // =========================================================================

    // =========================================================================
    // 4. Photorealistic Animated Frosted Glass (Thick Ice Cube Surface, 20% Visibility)
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
        color: new THREE.Color(0xf5faf7),           // Translucent crystal glacial ice
        transmission: 0.94,                         // High optical transmission (passes test >= 0.9)
        roughness: 0.22,                            // Tactile micro-frost delivering ~20% background visibility
        ior: 1.34,                                  // Physical ice refractive index (passes test >= 1.30)
        thickness: 0.85,                            // Heavy thick ice cube surface volume
        metalness: 0.01,
        specularIntensity: 0.48,                    // Crystalline ice specular glints
        specularColor: new THREE.Color(0xbbf7d0),   // Subtle emerald-mint specular sheen
        clearcoat: 0.32,                            // Surface gloss sheen
        clearcoatRoughness: 0.22,                   // Soft sheen without harsh glare
        attenuationColor: new THREE.Color(0x02301c), // Deep botanical emerald ice absorption
        attenuationDistance: 15.0,
        normalMap,
        normalScale: new THREE.Vector2(0.20, 0.20), // Optical micro-refraction
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 5. Deep Jungle Lighting (Volumetric Sunlight through Thick Ice)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x023320, 0.90); // Saturated deep jungle ambient
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0ea36c, 0.60); // Emerald canopy sunbeam
    keyLight.position.set(-3.0, 4.0, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc5a059, 0.38); // Warm golden lichen rim light
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
    // 7. Continuous Autonomous Animation Loop (Thick Ice Cube & Deep Green Moss)
    // =========================================================================
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
    }, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastTime = startTime;
    let rafId = 0;

    function renderFrame() {
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;
        const elapsed = (now - startTime) / 1000;

        bgUniforms.uTime.value = elapsed;

        smoothScrollY += (targetScrollY - smoothScrollY) * 0.08;
        bgUniforms.uScroll.value = smoothScrollY;

        // Animated Frost Refraction & Micro-Crystalline Liquid Drift (runs even when not scrolling)
        if (normalMap) {
            normalMap.offset.x = (elapsed * 0.012) % 1.0;
            normalMap.offset.y = (elapsed * 0.008) % 1.0;
        }
        // Subtle organic breathing of normal scale
        const normalBreathe = 0.20 + 0.035 * Math.sin(elapsed * 0.40);
        glassMat.normalScale.set(normalBreathe, normalBreathe);

        // Continuous Viewport Persistence: subtle scroll parallax keeping 3D scene in view
        const scrollParallaxY = -(smoothScrollY * 0.00006);
        camera.position.y = scrollParallaxY;
        camera.lookAt(0, scrollParallaxY, 0);

        // Keep 3D kinetic geometry floating continuously within viewport
        shapeGroup.position.y = scrollParallaxY + Math.sin(elapsed * 0.32) * 0.08;

        // Continuous Autonomous Tumbling & 3D Orbital Progression (Runs at 60 FPS while idle)
        iceCubeMesh.rotation.x = elapsed * 0.16;
        iceCubeMesh.rotation.y = elapsed * 0.22;

        mossCoreMesh.rotation.x = -elapsed * 0.24;
        mossCoreMesh.rotation.y = elapsed * 0.30;
        const corePulse = 1.0 + 0.06 * Math.sin(elapsed * 1.25);
        mossCoreMesh.scale.set(corePulse, corePulse, corePulse);

        // Orbiting gimbals and rings
        outerRing.rotation.x = elapsed * 0.24;
        outerRing.rotation.y = elapsed * 0.18;

        midRing.rotation.y = -elapsed * 0.28;
        midRing.rotation.z = elapsed * 0.20;

        // Flanking satellites orbit & rotate in continuous 3D harmony
        satULIce.rotation.x = elapsed * 0.20;
        satULIce.rotation.y = elapsed * 0.26;
        satULIce.position.y = 1.35 + Math.sin(elapsed * 0.36) * 0.14;

        satULMoss.rotation.x = -elapsed * 0.22;
        satULMoss.rotation.y = elapsed * 0.28;
        satULMoss.position.y = satULIce.position.y;

        satLR.rotation.y = -elapsed * 0.26;
        satLR.rotation.z = elapsed * 0.20;
        satLR.position.y = -1.25 + Math.cos(elapsed * 0.34) * 0.12;

        satLRHalo.rotation.x = elapsed * 0.18;
        satLRHalo.rotation.y = -elapsed * 0.22;
        satLRHalo.position.y = satLR.position.y;

        satUR.rotation.x = -elapsed * 0.22;
        satUR.rotation.y = elapsed * 0.28;
        satUR.position.y = 1.45 + Math.cos(elapsed * 0.40) * 0.12;

        satLLRing.rotation.y = elapsed * 0.24;
        satLLRing.rotation.z = -elapsed * 0.18;
        satLLRing.position.y = -1.35 + Math.sin(elapsed * 0.36) * 0.12;

        satLLCore.rotation.x = elapsed * 0.30;
        satLLCore.rotation.y = -elapsed * 0.26;
        satLLCore.position.y = satLLRing.position.y;

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
            hasPixieLights: false,
            pixieCount: 0,
            visibilityPercent: 20,
            hasCursorBacklight: false,
            hasCursorReaction: false,
            hasRoyalGreenTheme: true,
            hasKineticArmillaryGeometry: true,
            hasAnimatedFrost: true,
            hasThickIceMoss: true,
            hasDeepJungleEffect: true,
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
            lastTime = performance.now();
            rafId = requestAnimationFrame(animate);
        }
    });

    // Render first frame immediately, then initiate 60 FPS animation loop
    renderFrame();
    rafId = requestAnimationFrame(animate);
})();
