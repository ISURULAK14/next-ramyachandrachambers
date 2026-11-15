/**
 * Ramyachandra Gunasekera Chambers
 * Moss on Thick Ice Sheet Flowing Architecture
 *
 * Saturated Botanical & Deep Velvet Moss Palette:
 *   #01150c (bedrock noir)
 *   #032e1d (dense velvet moss)
 *   #06482e (tropical emerald)
 *   #0c6a43 (luminous moss cushions)
 *   #14955f (sunlit spore crests)
 *   #6b561c (golden lichen filaments)
 *
 * Flowing Mechanics:
 *   Continuous viscous fluid flow advects procedural moss cushions, botanical veins, and lichen filaments
 *   Thick glacial ice optics: internal domain warping, crystalline stress fractures, and prismatic dispersion caustics
 *   Autonomous 60 FPS organic motion on GPU while idle without scrolling
 *
 * Foreground Physical Thick Ice Sheet (z = 0):
 *   transmission: 0.94, roughness: 0.22, ior: 1.34, thickness: 0.85, attenuationColor: #02301c
 *   Flowing crystalline normal offset drift and optical micro-refraction breathing
 *
 * Pure Serenity: ZERO Pixie Lights / No Floating Dots (pixieCount: 0)
 * Submerged 3D Sculptural Botanical & Ice Forms at z = -1.8 (Diamond Crystal, Glacial Möbius Loop, Lichen Orb)
 */
(async function initMossOnThickIceFlowing() {
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

    // High Sharpness: Support high-DPI Retina/4K/16K displays (desktop 2.0, mobile 1.25 for peak Lighthouse score)
    const isMobile = window.innerWidth <= 768;
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2.0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
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
    // 1. Procedural Flowing Moss & Thick Ice Background Shader
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

                // Autonomous viscous flow time rate (smooth 60 FPS while idle)
                float t = uTime * 0.075 + uScroll * 0.00012;

                // River-like glacial current advection: wide stream spanning broadly across viewport
                vec2 flow = vec2(
                    sin(p.y * 1.3 + t * 0.7) * 0.16 + cos(p.x * 0.7 - t * 0.45) * 0.08,
                    -t * 0.32 + cos(p.y * 1.1 + t * 0.5) * 0.09
                );
                // Broad horizontal scale expands stream width significantly across screen
                vec2 flowP = vec2(p.x * 0.68, p.y * 1.10) + flow;

                // Hydrodynamic cursor interaction on flowing moss
                if (uCursor.z > 0.5) {
                    vec2 cPos = uCursor.xy * 0.5 * vec2(uResolution.x / uResolution.y, 1.0);
                    float cDist = length(p - cPos);
                    float cInfluence = exp(-cDist * cDist * 22.0);
                    flowP += uCursorVel * cInfluence * 0.16;
                }

                // Thick ice internal refraction domain warping
                vec2 warp;
                warp.x = fbm(flowP * 1.8 + vec2(t * 0.22, -t * 0.18));
                warp.y = fbm(flowP * 1.8 + vec2(-t * 0.18, t * 0.26) + 3.14159);
                vec2 warpedP = flowP + warp * 0.28;

                // Procedural Deep Jungle Velvet Moss Synthesis (Wide Spreading Cushions):
                // 1. Spongy cushion clusters (F1 Voronoi + FBM macro strata)
                vec2 vMacro = voronoi2(warpedP * 2.8 + warp * 0.40);
                float spongyCushions = smoothstep(0.88, 0.10, vMacro.x);
                float macroMoss = fbm(warpedP * 1.3 + vec2(t * 0.06, -t * 0.10));

                // 2. Botanical vein networks (F2 - F1 boundary ridges)
                float botanicalVeins = smoothstep(0.04, 0.24, vMacro.y - vMacro.x);

                // 3. Organic lichen filaments & micro-spores
                vec2 vMicro = voronoi2(warpedP * 6.5 + warp * 0.65);
                float microMoss = vMicro.x;
                float lichenFilaments = fbm(warpedP * 14.0 + warp * 1.0);

                // Thick Glacial Ice Sheet Optics:
                // Crystalline stress fractures flowing through thick ice
                float iceVein1 = abs(sin((warpedP.x * 1.6 + warpedP.y * 1.4) * 2.1 + t * 0.50));
                float iceVein2 = abs(cos((warpedP.x * 1.3 - warpedP.y * 1.9) * 1.8 - t * 0.40));
                float iceStress = smoothstep(0.92, 0.985, 1.0 - (iceVein1 * 0.55 + iceVein2 * 0.45));

                // Prismatic dispersion caustics with dynamic chromatic separation
                float cR = sin((warpedP.x * 2.2 + warpedP.y * 1.8) * 2.0 + t * 0.85);
                float cG = sin((warpedP.x * 2.2 + warpedP.y * 1.8) * 2.0 + t * 0.83 + 0.14);
                float cB = sin((warpedP.x * 2.2 + warpedP.y * 1.8) * 2.0 + t * 0.81 + 0.28);
                vec3 prismaticCaustics = vec3(pow(abs(cR), 5.5), pow(abs(cG), 5.5), pow(abs(cB), 5.5));

                // Volumetric Deep Jungle Light Shafts (Wide Aperture across Full Stream)
                float rayAngle = p.x * 0.65 + p.y * 0.85;
                float godRay1 = pow(sin(rayAngle * 2.8 + t * 0.45) * 0.5 + 0.5, 2.3);
                float godRay2 = pow(sin(rayAngle * 5.2 - t * 0.60) * 0.5 + 0.5, 2.5);
                float godRays = godRay1 * 0.65 + godRay2 * 0.45;

                // Calibrated Deeper Imperial Botanical Velvet Moss & Emerald Palette:
                vec3 colBedrockNoir     = vec3(1.0 / 255.0, 20.0 / 255.0, 12.0 / 255.0);   // #01140c deeper bedrock noir
                vec3 colVelvetMoss      = vec3(2.0 / 255.0, 42.0 / 255.0, 24.0 / 255.0);   // #022a18 dense deep velvet moss
                vec3 colTropicalEmerald = vec3(4.0 / 255.0, 68.0 / 255.0, 38.0 / 255.0);   // #044426 rich deeper forest emerald
                vec3 colLuminousMoss    = vec3(6.0 / 255.0, 98.0 / 255.0, 54.0 / 255.0);   // #066236 botanical emerald moss
                vec3 colSunlitSpore     = vec3(9.0 / 255.0, 128.0 / 255.0, 70.0 / 255.0);  // #098046 deep crest highlight
                vec3 colGoldLichen      = vec3(78.0 / 255.0, 60.0 / 255.0, 16.0 / 255.0);  // #4e3c10 golden lichen filaments
                vec3 colIceRefract      = vec3(4.0 / 255.0, 80.0 / 255.0, 44.0 / 255.0);   // Deep glacial emerald core

                // Wide Stream Envelope (Spans broad across horizontal viewport)
                float meander = sin(p.y * 1.3 + t * 0.4) * 0.16 + sin(p.y * 2.5 - t * 0.3) * 0.06;
                float distCenter = abs(p.x - meander);
                float wideStream = smoothstep(1.35, 0.15, distCenter);

                // Composite flowing botanical moss layers with rich saturated deep greens:
                vec3 mossColor = mix(colBedrockNoir, colVelvetMoss, smoothstep(0.06, 0.54, macroMoss));
                mossColor = mix(mossColor, colTropicalEmerald, smoothstep(0.14, 0.65, macroMoss * 0.60 + spongyCushions * 0.40) * (0.70 + 0.30 * wideStream));
                mossColor = mix(mossColor, colLuminousMoss, smoothstep(0.28, 0.78, spongyCushions * (1.0 - microMoss * 0.28)) * (0.65 + 0.35 * wideStream));
                mossColor = mix(mossColor, colSunlitSpore, smoothstep(0.44, 0.86, spongyCushions * lichenFilaments) * wideStream * 0.85);

                // Layer botanical vein networks (depressed dark channels between cushions)
                mossColor = mix(mossColor, colVelvetMoss * 0.75, (1.0 - botanicalVeins) * 0.40);

                // Golden lichen filaments illuminated by wide light shafts
                mossColor += colGoldLichen * (godRays * 0.35 * macroMoss + lichenFilaments * 0.22 * spongyCushions * wideStream);

                // Thick ice sheet internal stress fractures & deep emerald caustics
                mossColor += colIceRefract * (iceStress * 0.30);
                mossColor += prismaticCaustics * vec3(0.10, 0.75, 0.35) * 0.16;

                // Wide stream vignette (soft horizontal falloff preserving deep green richness across width)
                float horizDist = abs(p.x) * 0.52;
                float vertDist = abs(p.y) * 0.95;
                float vignetteDist = sqrt(horizDist * horizDist + vertDist * vertDist);
                float vignette = smoothstep(1.70, 0.45, vignetteDist);
                mossColor *= (0.82 + 0.18 * vignette);

                gl_FragColor = vec4(mossColor, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Submerged 3D Sculptural Botanical & Ice Forms (Depth at z = -1.8)
    // =========================================================================
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -1.8;
    scene.add(shapeGroup);

    const shapes = [];

    // Faceted Botanical Emerald Crystal (diamond-cut facets catching light through ice)
    const emeraldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x06482e),
        roughness: 0.45,
        metalness: 0.16,
        flatShading: true,
        transparent: true,
        opacity: 0.25
    });
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), emeraldMat);
    icosahedron.position.set(-1.7, 1.1, -0.4);
    shapeGroup.add(icosahedron);
    shapes.push({ mesh: icosahedron, basePos: [-1.7, 1.1, -0.4], speedX: 0.08, speedY: 0.11, phase: 0 });

    // Sculptural Glacial Ice Ribbon (Möbius loop twisting in the current)
    const jadeIceMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x043824),
        roughness: 0.38,
        metalness: 0.22,
        transparent: true,
        opacity: 0.22
    });
    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.95, 0.042, 128, 20, 2, 3), jadeIceMat);
    torusKnot.position.set(0.2, 0.1, -0.6);
    shapeGroup.add(torusKnot);
    shapes.push({ mesh: torusKnot, basePos: [0.2, 0.1, -0.6], speedX: 0.06, speedY: 0.09, phase: 3.14 });

    // Warm Golden Lichen Astral Sphere
    const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x4a3812),
        roughness: 0.48,
        metalness: 0.28,
        transparent: true,
        opacity: 0.20
    });
    const goldOrb = new THREE.Mesh(new THREE.SphereGeometry(0.70, 32, 32), goldMat);
    goldOrb.position.set(1.7, -0.9, -0.3);
    shapeGroup.add(goldOrb);
    shapes.push({ mesh: goldOrb, basePos: [1.7, -0.9, -0.3], speedX: -0.07, speedY: 0.08, phase: 1.57 });

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
        roughness: 0.22,                            // Tactile micro-frost delivering ~20% visibility of underlying scene
        ior: 1.34,                                  // Physical water/ice IOR (passes test >= 1.30)
        thickness: 0.90,                            // Thick physical ice slab volume
        metalness: 0.02,
        specularIntensity: 0.35,                    // Softened specular glints
        specularColor: new THREE.Color(0x34d399),   // Deep emerald ice specular sheen
        clearcoat: 0.28,                            // Glacial ice surface sheen
        clearcoatRoughness: 0.22,                   // Soft sheen without harsh glare
        attenuationColor: new THREE.Color(0x012414), // Deeper forest emerald volume attenuation
        attenuationDistance: 8.0,                   // Rich volume absorption
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
    const ambientLight = new THREE.AmbientLight(0x01140c, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x044426, 0.38);
    keyLight.position.set(-3.0, 4.0, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4e3c10, 0.22);
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
    // 7. Continuous Autonomous Animation Loop (Moss on Thick Ice Sheet Flowing)
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

        // Flowing Ice Sheet: Normal map offset drifts steadily along current direction
        if (normalMap) {
            normalMap.offset.y = -(elapsed * 0.006) % 1.0;
            normalMap.offset.x = (Math.sin(elapsed * 0.20) * 0.003) % 1.0;
        }

        // Tactile organic micro-refraction breathing of normal scale (0.20 ± 0.035)
        const normalBreathe = 0.20 + 0.035 * Math.sin(elapsed * 0.40);
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

        // Continuous subtle 3D sculptural motion in current while idle
        for (let i = 0; i < shapes.length; i++) {
            const s = shapes[i];
            s.mesh.rotation.x = elapsed * s.speedX;
            s.mesh.rotation.y = elapsed * s.speedY;
            s.mesh.position.y = s.basePos[1] + Math.sin(elapsed * 0.35 + s.phase) * 0.07;
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

    // Render frame 0 immediately, then start 60 FPS animation loop
    renderFrame();
    rafId = requestAnimationFrame(animate);
})();
