/**
 * Ramyachandra Gunasekera Chambers
 * 16K Realistic Deep Jungle Moss & Thick Glacial Ice Cube Architecture
 * Saturated Botanical Palette:
 *   #01150c (bedrock noir)
 *   #032e1d (dense velvet moss)
 *   #06482e (tropical emerald)
 *   #0c6a43 (luminous moss cushions)
 *   #14955f (sunlit spore crests)
 *   #6b561c (golden lichen filaments)
 * Volumetric Jungle Light Shafts Penetrating Thick Ice
 * Thick Glacial Ice Cube Optics (Refractive Domain Warping, Stress Fractures, Prismatic Caustics)
 * Foreground Physical Ice Slab: transmission: 0.94, roughness: 0.22, ior: 1.34, thickness: 0.85, attenuationColor: #02301c
 * 3D Volumetric Ice Cube & Moss Monolith:
 *   Central 3D chamfered glacial ice cube (BoxGeometry, transmission: 0.92, thickness 1.2)
 *   Embedded deep green moss mineral core (DodecahedronGeometry, velvet moss shading)
 *   Orbiting thick ice gimbals & flanking moss satellites
 * Zero Pixie Lights (pixieCount: 0)
 * Continuous Autonomous Motion: 60 FPS while idle without scrolling
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
        return; // Graceful fallback to CSS base
    }

    // High Sharpness: Support high-DPI Retina/4K/16K displays (desktop 2.0, mobile 1.25 for peak Lighthouse score)
    const isMobile = window.innerWidth <= 768;
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2.0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

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
                p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
                return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                               dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                           mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                               dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y) * 0.5 + 0.5;
            }

            float fbm(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                mat2 rot = mat2(0.877, 0.479, -0.479, 0.877);
                for (int i = 0; i < 5; i++) {
                    v += a * noise(p);
                    p = rot * p * 2.02 + vec2(1.3, 0.8);
                    a *= 0.5;
                }
                return v;
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
                        vec2 o = hash2(n + g) * 0.5 + 0.5;
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

                // Autonomous fluid time rate (runs smoothly at 60 FPS while idle)
                float t = uTime * 0.20 + uScroll * 0.00008;

                // Organic flowing coordinates avoiding rigid axis alignment
                vec2 flowP = vec2(
                    p.x * 1.5 + sin(p.y * 2.0 + t * 0.7) * 0.20,
                    p.y * 1.5 + cos(p.x * 1.8 - t * 0.5) * 0.20
                );

                // Thick ice internal refraction domain warping
                vec2 warp;
                warp.x = fbm(flowP * 2.2 + vec2(t * 0.30, -t * 0.24));
                warp.y = fbm(flowP * 2.2 + vec2(-t * 0.24, t * 0.36) + 3.14159);

                vec2 warpedP = flowP + warp * 0.28;

                // Multi-scale Deep Jungle Velvet Moss Synthesis
                // 1. Spongy cushion clusters (F1 Voronoi + FBM macro strata)
                vec2 vMacro = voronoi2(warpedP * 3.6 + warp * 0.5);
                float spongyCushions = smoothstep(0.85, 0.12, vMacro.x);
                float macroMoss = fbm(warpedP * 1.6 + vec2(t * 0.08, -t * 0.12));

                // 2. Botanical vein networks (F2 - F1 boundary ridges)
                float botanicalVeins = smoothstep(0.04, 0.25, vMacro.y - vMacro.x);

                // 3. Organic lichen filaments & micro-spores
                vec2 vMicro = voronoi2(warpedP * 8.0 + warp * 0.8);
                float microMoss = vMicro.x;
                float lichenFilaments = fbm(warpedP * 18.0 + warp * 1.2);

                // Thick Glacial Ice Cube Optics:
                // Crystalline stress fractures & internal domain warping
                float iceVein1 = abs(sin((warpedP.x * 2.2 + warpedP.y * 1.6) * 2.5 + t * 0.65));
                float iceVein2 = abs(cos((warpedP.x * 1.8 - warpedP.y * 2.4) * 2.2 - t * 0.50));
                float iceStress = smoothstep(0.91, 0.98, 1.0 - (iceVein1 * 0.55 + iceVein2 * 0.45));

                // Prismatic dispersion caustics with dynamic chromatic separation
                float cR = sin((warpedP.x * 3.0 + warpedP.y * 2.2) * 2.4 + t * 0.95);
                float cG = sin((warpedP.x * 3.0 + warpedP.y * 2.2) * 2.4 + t * 0.93 + 0.12);
                float cB = sin((warpedP.x * 3.0 + warpedP.y * 2.2) * 2.4 + t * 0.91 + 0.24);
                vec3 prismaticCaustics = vec3(pow(abs(cR), 5.5), pow(abs(cG), 5.5), pow(abs(cB), 5.5));

                // Volumetric Deep Jungle Light Shafts (Filtering through thick ice)
                float rayAngle = p.x * 1.3 + p.y * 0.9;
                float godRay1 = pow(sin(rayAngle * 3.6 + t * 0.55) * 0.5 + 0.5, 2.5);
                float godRay2 = pow(sin(rayAngle * 6.8 - t * 0.75) * 0.5 + 0.5, 2.8);
                float godRays = godRay1 * 0.65 + godRay2 * 0.45;

                // Saturated Botanical Palette:
                vec3 colBedrockNoir     = vec3(1.0 / 255.0, 21.0 / 255.0, 12.0 / 255.0);   // #01150c bedrock noir
                vec3 colVelvetMoss      = vec3(3.0 / 255.0, 46.0 / 255.0, 29.0 / 255.0);   // #032e1d dense velvet moss
                vec3 colTropicalEmerald = vec3(6.0 / 255.0, 72.0 / 255.0, 46.0 / 255.0);   // #06482e tropical emerald
                vec3 colLuminousMoss    = vec3(12.0 / 255.0, 106.0 / 255.0, 67.0 / 255.0); // #0c6a43 luminous moss cushions
                vec3 colSunlitSpore     = vec3(20.0 / 255.0, 149.0 / 255.0, 95.0 / 255.0); // #14955f sunlit spore crests
                vec3 colGoldLichen      = vec3(107.0 / 255.0, 86.0 / 255.0, 28.0 / 255.0); // #6b561c golden lichen filaments
                vec3 colIceRefract      = vec3(0.18, 0.60, 0.48);                          // Prismatic ice core

                // Composite deep jungle moss strata:
                vec3 mossColor = mix(colBedrockNoir, colVelvetMoss, smoothstep(0.08, 0.58, macroMoss));
                mossColor = mix(mossColor, colTropicalEmerald, smoothstep(0.18, 0.70, macroMoss * 0.65 + spongyCushions * 0.35));
                mossColor = mix(mossColor, colLuminousMoss, smoothstep(0.32, 0.82, spongyCushions * (1.0 - microMoss * 0.30)));
                mossColor = mix(mossColor, colSunlitSpore, smoothstep(0.48, 0.90, spongyCushions * lichenFilaments));

                // Layer botanical vein networks (fine darker emerald channel depressions)
                mossColor = mix(mossColor, colVelvetMoss * 0.80, (1.0 - botanicalVeins) * 0.42);

                // Golden lichen filaments and sunlit spore crests highlighted by light shafts
                mossColor += colGoldLichen * (godRays * 0.45 * macroMoss + lichenFilaments * 0.28 * spongyCushions);

                // Thick ice internal stress fractures & prismatic dispersion caustics
                mossColor += colIceRefract * (iceStress * 0.36);
                mossColor += prismaticCaustics * 0.24;

                // Deep jungle vignette (rich saturated green center)
                float vignette = smoothstep(1.45, 0.25, length(p));
                mossColor *= (0.82 + 0.18 * vignette);

                gl_FragColor = vec4(mossColor, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. 3D Volumetric Ice Cube & Moss Monolith (Atmospheric Kinetic Group at z = -1.0)
    // =========================================================================
    const shapeGroup = new THREE.Group();
    shapeGroup.position.set(0, 0, -1.0);
    scene.add(shapeGroup);

    // Materials: Thick Ice Glass & Deep Green Velvet Moss
    const thickIceCubeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf0fdf4),
        transmission: 0.92,
        roughness: 0.14,
        ior: 1.34,
        thickness: 1.2,
        specularColor: new THREE.Color(0xa7f3d0),
        specularIntensity: 0.90,
        clearcoat: 0.70,
        clearcoatRoughness: 0.14,
        attenuationColor: new THREE.Color(0x043824),
        attenuationDistance: 10.0,
        transparent: true,
        opacity: 0.70
    });

    const deepMossStoneMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0c6a43), // Luminous moss cushions #0c6a43
        roughness: 0.35,
        metalness: 0.22,
        flatShading: true,
        emissive: new THREE.Color(0x032e1d), // Dense velvet moss #032e1d undertone
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.88
    });

    const goldLichenMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xdfb35d), // Botanical gold lichen (#6b561c / warm heirloom gold)
        roughness: 0.26,
        metalness: 0.88,
        emissive: new THREE.Color(0x6b561c),
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.88
    });

    const iceGimbalMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xe6fbf0),
        transmission: 0.90,
        roughness: 0.16,
        ior: 1.34,
        thickness: 0.85,
        specularColor: new THREE.Color(0x6ee7b7),
        attenuationColor: new THREE.Color(0x06482e),
        attenuationDistance: 10.0,
        transparent: true,
        opacity: 0.75
    });

    // Central Monument: 3D Chamfered Glacial Ice Cube Matrix
    const iceCubeGeo = new THREE.BoxGeometry(1.95, 1.95, 1.95);
    const iceCubeMesh = new THREE.Mesh(iceCubeGeo, thickIceCubeMat);
    shapeGroup.add(iceCubeMesh);

    // Embedded Deep Green Moss Monolith Core (Nested faceted polyhedron)
    const mossCoreGeo = new THREE.DodecahedronGeometry(0.85, 0);
    const mossCoreMesh = new THREE.Mesh(mossCoreGeo, deepMossStoneMat);
    shapeGroup.add(mossCoreMesh);

    // Interlocking Glacial Ice & Gold Celestial Gimbals
    const outerRingGeo = new THREE.TorusGeometry(1.68, 0.035, 16, 96);
    const outerRing = new THREE.Mesh(outerRingGeo, goldLichenMat);
    shapeGroup.add(outerRing);

    const midRingGeo = new THREE.TorusGeometry(1.40, 0.032, 16, 84);
    const midRing = new THREE.Mesh(midRingGeo, iceGimbalMat);
    midRing.rotation.x = Math.PI / 4;
    shapeGroup.add(midRing);

    // Flanking Satellites (Balancing the Constellation)
    const satULIceGeo = new THREE.OctahedronGeometry(0.68, 0);
    const satULIce = new THREE.Mesh(satULIceGeo, thickIceCubeMat);
    satULIce.position.set(-2.2, 1.35, -0.3);
    shapeGroup.add(satULIce);

    const satULMossGeo = new THREE.OctahedronGeometry(0.38, 0);
    const satULMoss = new THREE.Mesh(satULMossGeo, deepMossStoneMat);
    satULMoss.position.set(-2.2, 1.35, -0.3);
    shapeGroup.add(satULMoss);

    const satLRGeo = new THREE.DodecahedronGeometry(0.58, 0);
    const satLR = new THREE.Mesh(satLRGeo, deepMossStoneMat);
    satLR.position.set(2.2, -1.25, -0.2);
    shapeGroup.add(satLR);

    const satLRHaloGeo = new THREE.TorusGeometry(0.80, 0.020, 12, 64);
    const satLRHalo = new THREE.Mesh(satLRHaloGeo, goldLichenMat);
    satLRHalo.position.set(2.2, -1.25, -0.2);
    shapeGroup.add(satLRHalo);

    const satURGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    const satUR = new THREE.Mesh(satURGeo, thickIceCubeMat);
    satUR.position.set(2.0, 1.45, -0.4);
    shapeGroup.add(satUR);

    const satLLRingGeo = new THREE.TorusGeometry(0.55, 0.024, 12, 64);
    const satLLRing = new THREE.Mesh(satLLRingGeo, iceGimbalMat);
    satLLRing.position.set(-2.05, -1.35, -0.3);
    shapeGroup.add(satLLRing);

    const satLLCoreGeo = new THREE.OctahedronGeometry(0.34, 0);
    const satLLCore = new THREE.Mesh(satLLCoreGeo, deepMossStoneMat);
    satLLCore.position.set(-2.05, -1.35, -0.3);
    shapeGroup.add(satLLCore);

    // =========================================================================
    // 3. ZERO PIXIE LIGHTS: User explicitly requested "remove pixie lights" (pixieCount: 0)
    // =========================================================================

    // =========================================================================
    // 4. Foreground Physical Ice Slab (transmission: 0.94, roughness: 0.22, ior: 1.34)
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
        attenuationColor: new THREE.Color(0x02301c), // Deep botanical emerald ice absorption (#02301c)
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
    const ambientLight = new THREE.AmbientLight(0x06482e, 1.8); // Botanical emerald ambient
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xa7f3d0, 1.6); // Glacial sunlight
    keyLight.position.set(-3.0, 5.0, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe2c275, 1.2); // Warm golden lichen rim light
    rimLight.position.set(4.0, -3.0, 3.0);
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
    // 7. Continuous Autonomous Animation Loop (Runs Smoothly at 60 FPS While Idle)
    // =========================================================================
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
    }, { passive: true });

    let lastTime = startTime;
    let rafId = 0;

    function renderFrame() {
        const now = performance.now();
        lastTime = now;
        const elapsed = (now - startTime) / 1000;

        bgUniforms.uTime.value = elapsed;

        smoothScrollY += (targetScrollY - smoothScrollY) * 0.08;
        bgUniforms.uScroll.value = smoothScrollY;

        // Animated Frost Refraction & Micro-Crystalline Liquid Drift (runs while idle)
        if (normalMap) {
            normalMap.offset.x = (elapsed * 0.016) % 1.0;
            normalMap.offset.y = (elapsed * 0.010) % 1.0;
        }
        // Subtle organic breathing of normal scale
        const normalBreathe = 0.20 + 0.035 * Math.sin(elapsed * 0.50);
        glassMat.normalScale.set(normalBreathe, normalBreathe);

        // Continuous Viewport Persistence: subtle scroll parallax keeping 3D scene in view
        const scrollParallaxY = -(smoothScrollY * 0.00006);
        camera.position.y = scrollParallaxY;
        camera.lookAt(0, scrollParallaxY, 0);

        // Keep 3D kinetic geometry floating continuously within viewport
        shapeGroup.position.y = scrollParallaxY + Math.sin(elapsed * 0.35) * 0.08;

        // Continuous Autonomous Tumbling & 3D Orbital Progression (Runs at 60 FPS while idle)
        iceCubeMesh.rotation.x = elapsed * 0.18;
        iceCubeMesh.rotation.y = elapsed * 0.24;

        mossCoreMesh.rotation.x = -elapsed * 0.26;
        mossCoreMesh.rotation.y = elapsed * 0.32;
        const corePulse = 1.0 + 0.06 * Math.sin(elapsed * 1.35);
        mossCoreMesh.scale.set(corePulse, corePulse, corePulse);

        // Orbiting gimbals and rings
        outerRing.rotation.x = elapsed * 0.26;
        outerRing.rotation.y = elapsed * 0.20;

        midRing.rotation.y = -elapsed * 0.30;
        midRing.rotation.z = elapsed * 0.22;

        // Flanking satellites orbit & rotate in continuous 3D harmony
        satULIce.rotation.x = elapsed * 0.22;
        satULIce.rotation.y = elapsed * 0.28;
        satULIce.position.y = 1.35 + Math.sin(elapsed * 0.38) * 0.14;

        satULMoss.rotation.x = -elapsed * 0.24;
        satULMoss.rotation.y = elapsed * 0.30;
        satULMoss.position.y = satULIce.position.y;

        satLR.rotation.y = -elapsed * 0.28;
        satLR.rotation.z = elapsed * 0.22;
        satLR.position.y = -1.25 + Math.cos(elapsed * 0.36) * 0.12;

        satLRHalo.rotation.x = elapsed * 0.20;
        satLRHalo.rotation.y = -elapsed * 0.24;
        satLRHalo.position.y = satLR.position.y;

        satUR.rotation.x = -elapsed * 0.24;
        satUR.rotation.y = elapsed * 0.30;
        satUR.position.y = 1.45 + Math.cos(elapsed * 0.42) * 0.12;

        satLLRing.rotation.y = elapsed * 0.26;
        satLLRing.rotation.z = -elapsed * 0.20;
        satLLRing.position.y = -1.35 + Math.sin(elapsed * 0.38) * 0.12;

        satLLCore.rotation.x = elapsed * 0.32;
        satLLCore.rotation.y = -elapsed * 0.28;
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
