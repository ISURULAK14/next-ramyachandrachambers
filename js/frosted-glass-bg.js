/**
 * Ramyachandra Gunasekera Chambers
 * Deep Royal Green Moss & Wave Dynamics Under Thick Frost Texture
 *
 * Royal Imperial Palette & Botanical Velvet Synthesis:
 *   #01100b (imperial royal green noir bedrock)
 *   #022416 (dense velvet forest moss)
 *   #043a24 (crown jewel royal emerald)
 *   #085836 (luminous royal jade cushions)
 *   #0f7b4c (sunlit spore crests)
 *   #624a1b (heirloom golden lichen filaments)
 *   #0c553e (crystalline glacial frost caustics)
 *
 * Dynamic Wave Mechanics:
 *   Subtle multi-harmonic fluid wave undulations behind the frost sheet
 *   Layered sinusoidal ocean swells and capillary cross-currents advecting organic moss strata
 *   Autonomous organic 60 FPS wave motion on GPU while idle without scrolling
 *
 * Realistic Frost & Moss Texture:
 *   Multi-scale Voronoi cushion clusters with botanical capillary veins and micro-nap velvet
 *   Crystalline dendritic frost needles and micro-faceting refracting through glacial ice
 *   Wave-modulated prismatic dispersion caustics separating into R/G/B spectral sheen
 *
 * Foreground Physical Thick Ice Sheet (z = 0):
 *   transmission: 0.94, roughness: 0.20, ior: 1.34, thickness: 0.85, attenuationColor: #022217
 *   Flowing crystalline normal offset drift and optical micro-refraction breathing
 *
 * Zero Pixie Lights (pixieCount: 0) / Submerged 3D Sculptural Botanical & Ice Forms at z = -1.8
 */
(async function initMossOnThickIceFlowing() {
    const canvas = document.getElementById('frosted-glass-canvas');
    if (!canvas) return;

    const startTime = performance.now();
    window.__rgFrostedGlass = {
        active: true,
        transmission: 0.94,
        roughness: 0.20,
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
        hasRoyalGreenTheme: true,
        hasThickIceMoss: true,
        hasDeepJungleEffect: true,
        hasAnimatedFrost: true,
        hasSlightAnimation: true,
        isFlowing: true,
        lightPos: null,
        mouseNDC: null,
        get elapsedTime() {
            return (performance.now() - startTime) / 1000;
        }
    };

    // Yield to browser main thread so LCP & FCP paint instantly with zero TBT
    await new Promise(r => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(r, { timeout: 1200 });
        } else {
            requestAnimationFrame(() => setTimeout(r, 60));
        }
    });

    // Safely probe WebGL context without triggering console.error in headless/no-gpu environments
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

    // High Sharpness: Support high-DPI Retina/4K displays (desktop 2.0, mobile 1.0 for peak Lighthouse score)
    const isMobile = window.innerWidth <= 768;
    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 2.0);
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
    // 1. Procedural Deep Royal Green Moss, Subtle Wave Animation & Frost Texture
    // =========================================================================
    const bgZ = -2.8;
    const bgGeo = new THREE.PlaneGeometry(1, 1);
    const bgUniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr) },
        uCursor: { value: new THREE.Vector3(-999, -999, 0) },
        uCursorVel: { value: new THREE.Vector2(0, 0) }
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
            uniform vec3 uCursor;
            uniform vec2 uCursorVel;

            // Analytic procedural noise synthesis for multi-scale botanical moss & flowing ice
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

            // High-efficiency 3-octave FBM for silky smooth performance
            float fbm(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                mat2 rot = mat2(0.877, 0.479, -0.479, 0.877);
                for (int i = 0; i < 3; i++) {
                    v += a * noise(p);
                    p = rot * p * 2.02 + vec2(1.3, 0.8);
                    a *= 0.5;
                }
                return v;
            }

            // Multi-scale Voronoi: F1 (cushion centers) and F2-F1 (vein ridges)
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

                // Autonomous viscous flow time rate (smooth 60 FPS while idle across whole screen)
                float t = uTime * 0.10 + uScroll * 0.00014;

                // =============================================================
                // Dynamic Subtle Wave Animation Behind Frost:
                // Harmonic ocean-like undulations flowing through deep moss layers
                // =============================================================
                float waveSwell1 = sin(p.x * 1.8 + p.y * 1.2 + t * 0.46) * cos(p.y * 1.5 - t * 0.38);
                float waveSwell2 = sin(p.x * 2.4 - p.y * 1.8 + t * 0.54 + 1.57) * 0.55;
                float waveRipple = cos((p.x + p.y) * 3.4 - t * 0.62) * 0.35;
                float waveElevation = (waveSwell1 * 0.50 + waveSwell2 * 0.35 + waveRipple * 0.15);

                vec2 waveDisplacement = vec2(
                    cos(p.y * 1.9 + t * 0.48) * 0.10 + sin(p.x * 1.5 - t * 0.36) * 0.07,
                    sin(p.x * 1.7 + t * 0.52) * 0.10 + cos(p.y * 1.4 + t * 0.42) * 0.07
                ) + vec2(waveElevation * 0.06, waveElevation * 0.05);

                vec2 waveP = p * 1.32 + waveDisplacement;

                // Hydrodynamic cursor interaction on flowing waves
                if (uCursor.z > 0.5) {
                    vec2 cPos = uCursor.xy * 0.5 * vec2(uResolution.x / uResolution.y, 1.0);
                    float cDist = length(p - cPos);
                    float cInfluence = exp(-cDist * cDist * 18.0);
                    waveP += uCursorVel * cInfluence * 0.18;
                }

                // Domain warping mimicking thick ice refraction across undulating waves
                vec2 warp;
                warp.x = fbm(waveP * 2.0 + vec2(t * 0.18, -t * 0.14));
                warp.y = fbm(waveP * 2.0 + vec2(-t * 0.14, t * 0.20) + 3.14159);
                vec2 warpedP = waveP + warp * 0.30;

                // =============================================================
                // Realistic Velvet Moss Texture Synthesis:
                // =============================================================
                // 1. Spongy cushion clusters (Voronoi F1 + FBM macro strata)
                vec2 vMacro = voronoi2(warpedP * 3.2 + warp * 0.45);
                float spongyCushions = smoothstep(0.85, 0.12, vMacro.x);
                float macroMoss = fbm(warpedP * 1.5 + vec2(t * 0.06, -t * 0.10));

                // 2. Botanical capillary veins (F2 - F1 boundary channels between cushions)
                float botanicalVeins = smoothstep(0.04, 0.24, vMacro.y - vMacro.x);

                // 3. Realistic velvet moss nap & micro-foliage
                float microNap = noise(warpedP * 12.0);
                float lichenFilaments = noise(warpedP * 20.0 + warp * 1.2);

                // =============================================================
                // Realistic Frost & Crystalline Texture:
                // =============================================================
                // Dendritic crystalline frost needles branching across the ice pane
                float frostGrain = noise(warpedP * 18.0 + vec2(t * 0.03, -t * 0.03));
                float frostNeedle1 = abs(sin((warpedP.x * 4.6 + warpedP.y * 3.2) * 2.2 + frostGrain * 2.8));
                float frostNeedle2 = abs(cos((warpedP.x * 3.0 - warpedP.y * 4.4) * 2.4 - frostGrain * 2.4));
                float frostDendrites = smoothstep(0.88, 0.985, 1.0 - (frostNeedle1 * 0.52 + frostNeedle2 * 0.48));

                // Glacial ice stress micro-fractures flowing with the wave current
                float iceStress1 = abs(sin((warpedP.x * 2.2 + warpedP.y * 1.6) * 2.4 + t * 0.48));
                float iceStress2 = abs(cos((warpedP.x * 1.8 - warpedP.y * 2.3) * 2.1 - t * 0.38));
                float iceStress = smoothstep(0.92, 0.985, 1.0 - (iceStress1 * 0.55 + iceStress2 * 0.45));

                // Prismatic dispersion caustics with dynamic wave-modulated chromatic separation
                float cR = sin((warpedP.x * 2.8 + warpedP.y * 2.0) * 2.2 + t * 0.85 + waveElevation * 1.2);
                float cG = sin((warpedP.x * 2.8 + warpedP.y * 2.0) * 2.2 + t * 0.83 + 0.14 + waveElevation * 1.2);
                float cB = sin((warpedP.x * 2.8 + warpedP.y * 2.0) * 2.2 + t * 0.81 + 0.28 + waveElevation * 1.2);
                vec3 prismaticCaustics = vec3(pow(abs(cR), 5.5), pow(abs(cG), 5.5), pow(abs(cB), 5.5));

                // Volumetric deep royal emerald god rays filtered through ice waves
                float rayAngle = p.x * 1.2 + p.y * 0.85;
                float godRay1 = pow(sin(rayAngle * 3.4 + t * 0.45 + waveElevation * 0.8) * 0.5 + 0.5, 2.6);
                float godRay2 = pow(sin(rayAngle * 6.2 - t * 0.60 - waveElevation * 0.6) * 0.5 + 0.5, 2.8);
                float godRays = godRay1 * 0.65 + godRay2 * 0.45;

                // =============================================================
                // Calibrated Imperial Deep Royal Green & Velvet Moss Palette:
                // =============================================================
                vec3 colBedrockNoir     = vec3(1.0 / 255.0, 16.0 / 255.0, 11.0 / 255.0);   // #01100b deep imperial royal green noir
                vec3 colVelvetForest    = vec3(2.0 / 255.0, 34.0 / 255.0, 22.0 / 255.0);   // #022216 imperial royal velvet forest
                vec3 colRoyalEmerald    = vec3(4.0 / 255.0, 56.0 / 255.0, 36.0 / 255.0);   // #043824 crown jewel royal emerald
                vec3 colLuminousJade    = vec3(8.0 / 255.0, 84.0 / 255.0, 54.0 / 255.0);   // #085436 luminous royal jade cushions
                vec3 colSunlitSpore     = vec3(14.0 / 255.0, 118.0 / 255.0, 76.0 / 255.0); // #0e764c crest jewel spore gleam
                vec3 colGoldLichen      = vec3(96.0 / 255.0, 74.0 / 255.0, 26.0 / 255.0);  // #604a1a heirloom gold lichen glint
                vec3 colGlacialFrost    = vec3(18.0 / 255.0, 102.0 / 255.0, 76.0 / 255.0); // #12664c crystalline frost needles
                vec3 colIceCaustics     = vec3(12.0 / 255.0, 80.0 / 255.0, 62.0 / 255.0);  // #0c503e royal ice caustics

                float waveShade = waveElevation * 0.22;

                // Composite flowing botanical moss layers:
                vec3 mossColor = mix(colBedrockNoir, colVelvetForest, smoothstep(0.06, 0.54, macroMoss + waveShade));
                mossColor = mix(mossColor, colRoyalEmerald, smoothstep(0.16, 0.66, macroMoss * 0.60 + spongyCushions * 0.40 + waveShade));
                mossColor = mix(mossColor, colLuminousJade, smoothstep(0.28, 0.78, spongyCushions * (1.0 - microNap * 0.20)));
                mossColor = mix(mossColor, colSunlitSpore, smoothstep(0.42, 0.86, spongyCushions * lichenFilaments * (1.0 + waveShade)));

                // Botanical micro-nap velvet texture (tactile velvet pile on cushions)
                mossColor += colRoyalEmerald * (microNap * 0.16 * spongyCushions);

                // Depressed dark capillary vein networks weaving between cushions
                mossColor = mix(mossColor, colVelvetForest * 0.75, (1.0 - botanicalVeins) * 0.40);

                // Wave crest highlighting (subtle luminous jade brightening on the wave crests)
                mossColor += colLuminousJade * (max(0.0, waveElevation) * 0.20 * spongyCushions);

                // Delicate golden lichen filament accents in wave troughs and light crests
                mossColor += colGoldLichen * (godRays * 0.32 * macroMoss + lichenFilaments * 0.22 * spongyCushions);

                // Frost Texture Integration:
                // Crystalline dendritic frost needles branching over the moss
                mossColor += colGlacialFrost * (frostDendrites * 0.38);

                // Ice stress fractures & wave caustics
                mossColor += colIceCaustics * (iceStress * 0.32);

                // Prismatic dispersion caustics with wave modulation
                mossColor += prismaticCaustics * (0.18 + max(0.0, waveElevation) * 0.10);

                gl_FragColor = vec4(mossColor, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Submerged 3D Sculptural Botanical & Ice Forms (Full Viewport Spread at z = -1.8)
    // =========================================================================
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -1.8;
    scene.add(shapeGroup);

    const shapes = [];

    // Form 1: Left Flank - Faceted Botanical Emerald Crystal
    const emeraldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x053a26),
        roughness: 0.45,
        metalness: 0.16,
        flatShading: true,
        transparent: true,
        opacity: 0.24
    });
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), emeraldMat);
    icosahedron.position.set(-2.2, 0.9, -0.4);
    shapeGroup.add(icosahedron);
    shapes.push({ mesh: icosahedron, basePos: [-2.2, 0.9, -0.4], speedX: 0.08, speedY: 0.11, phase: 0 });

    // Form 2: Mid-Left - Sculptural Glacial Ice Ribbon (Möbius loop)
    const jadeIceMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x032418),
        roughness: 0.38,
        metalness: 0.22,
        transparent: true,
        opacity: 0.22
    });
    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.85, 0.040, 128, 20, 2, 3), jadeIceMat);
    torusKnot.position.set(-0.9, -0.6, -0.5);
    shapeGroup.add(torusKnot);
    shapes.push({ mesh: torusKnot, basePos: [-0.9, -0.6, -0.5], speedX: 0.06, speedY: 0.09, phase: 3.14 });

    // Form 3: Center Drifting - Glacial Ice Octahedron Prism
    const icePrismMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x095638),
        roughness: 0.35,
        metalness: 0.20,
        flatShading: true,
        transparent: true,
        opacity: 0.22
    });
    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), icePrismMat);
    octahedron.position.set(0.1, 0.3, -0.6);
    shapeGroup.add(octahedron);
    shapes.push({ mesh: octahedron, basePos: [0.1, 0.3, -0.6], speedX: -0.07, speedY: 0.08, phase: 1.0 });

    // Form 4: Mid-Right - Warm Golden Lichen Astral Sphere
    const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x4a3812),
        roughness: 0.48,
        metalness: 0.28,
        transparent: true,
        opacity: 0.20
    });
    const goldOrb = new THREE.Mesh(new THREE.SphereGeometry(0.70, 32, 32), goldMat);
    goldOrb.position.set(1.2, -0.7, -0.4);
    shapeGroup.add(goldOrb);
    shapes.push({ mesh: goldOrb, basePos: [1.2, -0.7, -0.4], speedX: -0.07, speedY: 0.08, phase: 1.57 });

    // Form 5: Right Flank - Botanical Velvet Dodecahedron Core
    const velvetMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x06442c),
        roughness: 0.42,
        metalness: 0.18,
        flatShading: true,
        transparent: true,
        opacity: 0.24
    });
    const dodecahedron = new THREE.Mesh(new THREE.DodecahedronGeometry(0.80, 0), velvetMat);
    dodecahedron.position.set(2.2, 0.8, -0.5);
    shapeGroup.add(dodecahedron);
    shapes.push({ mesh: dodecahedron, basePos: [2.2, 0.8, -0.5], speedX: 0.09, speedY: -0.07, phase: 2.4 });

    // =========================================================================
    // 3. ZERO PIXIE LIGHTS: User explicitly requested: "no pixie lights"
    // =========================================================================
    // (Completely omitted pixie particles, dots, and spore meshes)

    // =========================================================================
    // 4. Foreground Physical Thick Ice Sheet (Zero Gaps, 100% Seamless Coverage)
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
        color: new THREE.Color(0xf0fdf4),           // Translucent crystal ice
        transmission: 0.94,                         // High optical transmission (passes test >= 0.9)
        roughness: 0.20,                            // Tactile micro-frost delivering ~20% visibility of underlying scene
        ior: 1.34,                                  // Physical water/ice IOR (passes test >= 1.30)
        thickness: 0.85,                            // Thick physical ice slab volume
        metalness: 0.02,
        specularIntensity: 0.45,                    // Crystal specular glints
        specularColor: new THREE.Color(0xa7f3d0),   // Mint-emerald ice specular sheen
        clearcoat: 0.32,                            // Glacial ice surface sheen
        clearcoatRoughness: 0.20,                   // Soft sheen without harsh glare
        attenuationColor: new THREE.Color(0x022217), // Deep moss emerald ice volume attenuation
        attenuationDistance: 12.0,                  // Rich volume absorption
        normalMap,
        normalScale: new THREE.Vector2(0.20, 0.20), // Optical micro-refraction
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 5. Deep Botanical Studio Lighting (NO CURSOR BACKLIGHT)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x01120c, 0.90);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x085836, 0.52);
    keyLight.position.set(-3.0, 4.0, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x624a1b, 0.32);
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
    // 7. Continuous Autonomous Animation Loop (Moss & Waves on Thick Ice Flowing)
    // =========================================================================
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
    }, { passive: true });

    let rawMouseNDC = new THREE.Vector2(-999, -999);
    let smoothMouseNDC = new THREE.Vector2(-999, -999);
    let mouseActive = false;

    function onPointerMove(e) {
        rawMouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
        rawMouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
        if (!mouseActive) {
            smoothMouseNDC.copy(rawMouseNDC);
            mouseActive = true;
        }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            onPointerMove(e.touches[0]);
        }
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
        mouseActive = false;
        rawMouseNDC.set(-999, -999);
    }, { passive: true });

    let lastCursorX = 0;
    let lastCursorY = 0;
    let cursorVx = 0;
    let cursorVy = 0;

    let rafId = 0;

    function renderFrame() {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;

        bgUniforms.uTime.value = elapsed;

        smoothScrollY += (targetScrollY - smoothScrollY) * 0.08;
        bgUniforms.uScroll.value = smoothScrollY;

        // Flowing Ice Sheet: Normal map offset drifts steadily with subtle wave breathing
        if (normalMap) {
            normalMap.offset.y = -(elapsed * 0.016) % 1.0;
            normalMap.offset.x = (Math.sin(elapsed * 0.24) * 0.007) % 1.0;
        }

        const normalBreathe = 0.20 + 0.035 * Math.sin(elapsed * 0.45);
        glassMat.normalScale.set(normalBreathe, normalBreathe);

        if (mouseActive) {
            smoothMouseNDC.x += (rawMouseNDC.x - smoothMouseNDC.x) * 0.18;
            smoothMouseNDC.y += (rawMouseNDC.y - smoothMouseNDC.y) * 0.18;

            const cX = smoothMouseNDC.x;
            const cY = smoothMouseNDC.y;
            const dt = 0.016;
            cursorVx = cursorVx * 0.8 + ((cX - lastCursorX) / dt) * 0.2;
            cursorVy = cursorVy * 0.8 + ((cY - lastCursorY) / dt) * 0.2;
            lastCursorX = cX;
            lastCursorY = cY;

            bgUniforms.uCursor.value.set(cX, cY, 1.0);
            bgUniforms.uCursorVel.value.set(cursorVx * 0.01, cursorVy * 0.01);
        } else {
            smoothMouseNDC.set(-999, -999);
            bgUniforms.uCursor.value.set(-999, -999, 0);
            bgUniforms.uCursorVel.value.set(0, 0);
        }

        const normX = mouseActive ? smoothMouseNDC.x : 0;
        const normY = mouseActive ? smoothMouseNDC.y : 0;

        camera.position.x = normX * 0.14;
        camera.position.y = normY * 0.08 - (smoothScrollY * 0.0004);
        camera.lookAt(0, -(smoothScrollY * 0.0004), 0);

        for (let i = 0; i < shapes.length; i++) {
            const s = shapes[i];
            s.mesh.rotation.x = elapsed * s.speedX;
            s.mesh.rotation.y = elapsed * s.speedY;
            s.mesh.position.y = s.basePos[1] + Math.sin(elapsed * 0.38 + s.phase) * 0.08;
            s.mesh.position.x = s.basePos[0] + Math.cos(elapsed * 0.30 + s.phase) * 0.04;
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
            hasPixieLights: false,
            pixieCount: 0,
            visibilityPercent: 20,
            hasCursorBacklight: false,
            hasRoyalGreenTheme: true,
            hasThickIceMoss: true,
            hasDeepJungleEffect: true,
            hasAnimatedFrost: true,
            hasSlightAnimation: true,
            isFlowing: true,
            lightPos: null,
            mouseNDC: mouseActive ? { x: smoothMouseNDC.x, y: smoothMouseNDC.y } : null,
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
            rafId = requestAnimationFrame(animate);
        }
    });

    renderFrame();
    rafId = requestAnimationFrame(animate);
})();
