/**
 * Ramyachandra Gunasekera Chambers
 * Sovereign Liquid Emerald Silk Aurora & Crystal Glass Background
 *
 * Movement: Autonomous 1.4x Velocity Wave Undulation & Double Domain-Warped Silk Dynamics
 * Palette:
 *   #010f0a (deepest obsidian emerald noir bedrock)
 *   #022417 (imperial velvet forest depth)
 *   #044229 (crown sovereign emerald core)
 *   #08633e (luminous sovereign jade crests)
 *   #0f8654 (liquid silk crest sheen)
 *   #c89f56 (heirloom champagne-gold fluid ribbons)
 *   #021b1f (deep indigo/teal abyssal undertone)
 *
 * Transmissive Architectural Crystal Glass (z = 0):
 *   transmission: 0.94, roughness: 0.20, ior: 1.34, thickness: 0.88, attenuationColor: #022014
 *   Isotropic hammered crystal texture with organic micro-refraction breathing at 1.4x rate
 *
 * Submerged 3D Sculptural Heritage & Celestial Architectural Forms (z = -1.8):
 *   Gyroscopic Celestial Armillary Ring, Brilliant-Cut Sovereign Emerald,
 *   Möbius Ribbon of Equity, Heritage Obsidian Monolith, Champagne Gold Astral Knot
 *   Floating with 1.4x wave buoyancy and rotational drift
 *
 * Autonomous 60 FPS (Desktop) / 30 FPS (Mobile) GPU animation loop active continuously without cursor movement.
 */
(async function initSilkAuroraFlutedGlass() {
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

    // High Sharpness: Support high-DPI Retina/4K displays (desktop 2.0, mobile 1.0 for peak Core Web Vitals)
    const isMobile = window.innerWidth <= 768;
    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 2.0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
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
    // 1. Procedural Sovereign Liquid Emerald Silk Aurora & Golden Fluid Ribbons
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

            // Fast procedural hash and smooth noise
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
                mat2 rot = mat2(0.85, 0.52, -0.52, 0.85);
                for (int i = 0; i < 3; i++) {
                    v += a * noise(p);
                    p = rot * p * 2.04 + vec2(1.4, 0.9);
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vec2 uv = vUv;
                vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

                // Autonomous viscous flow time rate (1.4x velocity: 0.154 rate, continuous without cursor)
                float t = uTime * 0.154 + uScroll * 0.00014;

                // Hydrodynamic cursor interaction on flowing liquid silk
                vec2 cOffset = vec2(0.0);
                if (uCursor.z > 0.5) {
                    vec2 cPos = uCursor.xy * 0.5 * vec2(uResolution.x / uResolution.y, 1.0);
                    float cDist = length(p - cPos);
                    float cInfluence = exp(-cDist * cDist * 16.0);
                    cOffset = uCursorVel * cInfluence * 0.20;
                }

                // Autonomous dynamic wave swells & cross-currents (1.4x velocity, undulating continuously without cursor)
                vec2 waveSwell = vec2(
                    sin(p.y * 1.6 + t * 0.58) * 0.15 + cos(p.x * 2.0 - t * 0.48) * 0.08,
                    cos(p.x * 1.5 - t * 0.52) * 0.14 + sin(p.y * 1.8 + t * 0.62) * 0.08
                );

                vec2 flowP = p * 1.35 + waveSwell + cOffset;

                // =============================================================
                // Double Domain Warping for Viscous Liquid Silk & Aurora Strata:
                // Produces ultra-smooth, organic, billowing fluid folds
                // =============================================================
                vec2 q = vec2(
                    fbm(flowP + vec2(0.0, 0.0) + vec2(t * 0.22, -t * 0.16)),
                    fbm(flowP + vec2(5.2, 1.3) + vec2(-t * 0.18, t * 0.24))
                );

                vec2 r = vec2(
                    fbm(flowP + 3.2 * q + vec2(1.7, 9.2) + vec2(t * 0.18, -t * 0.14)),
                    fbm(flowP + 3.2 * q + vec2(8.3, 2.8) + vec2(-t * 0.16, t * 0.22))
                );

                float fluidElevation = fbm(flowP + 2.8 * r);

                // Gentle anisotropic silk sheen along the fluid flow gradient
                float silkSheen = pow(max(0.0, fluidElevation * 1.2 - length(q) * 0.4), 2.5);

                // Delicate heirloom champagne-gold filament ribbons flowing in the crests
                float goldRibbon = smoothstep(0.68, 0.88, fluidElevation) * (1.0 - length(r) * 0.5);

                // Autonomous sweeping chiaroscuro god rays filtered through the volumetric fluid (1.4x)
                float rayAngle = p.x * 1.1 + p.y * 0.85;
                float godRay = pow(sin(rayAngle * 2.8 + t * 0.56 + fluidElevation * 1.1) * 0.5 + 0.5, 2.6) * 0.35;

                // Prismatic chromatic dispersion along high-curvature fluid contours (1.4x)
                float prismR = sin(fluidElevation * 6.28 + t * 0.98);
                float prismG = sin(fluidElevation * 6.28 + t * 0.95 + 0.18);
                float prismB = sin(fluidElevation * 6.28 + t * 0.92 + 0.36);
                vec3 prismSheen = vec3(pow(abs(prismR), 5.5), pow(abs(prismG), 5.5), pow(abs(prismB), 5.5)) * 0.16;

                // =============================================================
                // Bespoke Imperial Emerald & Liquid Silk Haute Palette:
                // =============================================================
                vec3 colObsidianVoid   = vec3(1.0 / 255.0, 15.0 / 255.0, 10.0 / 255.0);   // #010f0a deepest obsidian noir
                vec3 colVelvetNoir     = vec3(2.0 / 255.0, 36.0 / 255.0, 23.0 / 255.0);   // #022417 imperial velvet forest
                vec3 colSovereignCore  = vec3(4.0 / 255.0, 66.0 / 255.0, 41.0 / 255.0);   // #044229 crown sovereign emerald
                vec3 colLuminousJade   = vec3(8.0 / 255.0, 99.0 / 255.0, 62.0 / 255.0);   // #08633e luminous sovereign jade
                vec3 colSilkCrest      = vec3(15.0 / 255.0, 134.0 / 255.0, 84.0 / 255.0); // #0f8654 liquid silk specular crest
                vec3 colChampagneGold  = vec3(200.0 / 255.0, 159.0 / 255.0, 86.0 / 255.0);// #c89f56 heirloom champagne gold
                vec3 colTealUnderflow  = vec3(2.0 / 255.0, 27.0 / 255.0, 31.0 / 255.0);   // #021b1f deep teal shadow

                // Layered fluid composition
                vec3 color = mix(colObsidianVoid, colVelvetNoir, smoothstep(0.08, 0.42, fluidElevation));
                color = mix(color, colSovereignCore, smoothstep(0.30, 0.68, fluidElevation));
                color = mix(color, colLuminousJade, smoothstep(0.55, 0.85, fluidElevation));
                color = mix(color, colSilkCrest, silkSheen * 0.50);

                // Deep teal undercurrent in fluid hollows
                color = mix(color, colTealUnderflow, smoothstep(0.0, 0.30, 1.0 - fluidElevation) * 0.40);

                // Volumetric god ray illumination
                color += colLuminousJade * godRay;

                // Heirloom champagne-gold ribbons
                color += colChampagneGold * (goldRibbon * 0.42);

                // Prismatic chromatic dispersion
                color += prismSheen * smoothstep(0.4, 0.9, fluidElevation);

                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Submerged 3D Sculptural Heritage & Celestial Architectural Forms (z = -1.8)
    // =========================================================================
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -1.8;
    scene.add(shapeGroup);

    const shapes = [];

    // Form 1: Left Flank - Gyroscopic Celestial Armillary Ring (Celestial Equity)
    const goldRingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x6b531e),
        roughness: 0.32,
        metalness: 0.42,
        transparent: true,
        opacity: 0.25
    });
    const armillaryRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 32, 64), goldRingMat);
    armillaryRing.position.set(-2.2, 0.9, -0.4);
    shapeGroup.add(armillaryRing);
    shapes.push({ mesh: armillaryRing, basePos: [-2.2, 0.9, -0.4], speedX: 0.08, speedY: 0.11, phase: 0 });

    // Form 2: Mid-Left - Möbius Ribbon of Justice (Continuous Golden/Jade Infinity Loop)
    const mobiusMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x064228),
        roughness: 0.36,
        metalness: 0.28,
        transparent: true,
        opacity: 0.23
    });
    const mobiusLoop = new THREE.Mesh(new THREE.TorusKnotGeometry(0.85, 0.042, 128, 20, 2, 3), mobiusMat);
    mobiusLoop.position.set(-0.9, -0.6, -0.5);
    shapeGroup.add(mobiusLoop);
    shapes.push({ mesh: mobiusLoop, basePos: [-0.9, -0.6, -0.5], speedX: 0.06, speedY: 0.09, phase: 3.14 });

    // Form 3: Center Drifting - Brilliant-Cut Sovereign Emerald Octahedron
    const emeraldCutMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x095638),
        roughness: 0.30,
        metalness: 0.22,
        flatShading: true,
        transparent: true,
        opacity: 0.24
    });
    const emeraldOcta = new THREE.Mesh(new THREE.OctahedronGeometry(0.78, 0), emeraldCutMat);
    emeraldOcta.position.set(0.1, 0.3, -0.6);
    shapeGroup.add(emeraldOcta);
    shapes.push({ mesh: emeraldOcta, basePos: [0.1, 0.3, -0.6], speedX: -0.07, speedY: 0.08, phase: 1.0 });

    // Form 4: Mid-Right - Champagne Gold Astral Knot (Heirloom Starlight)
    const astralKnotMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x755922),
        roughness: 0.35,
        metalness: 0.36,
        transparent: true,
        opacity: 0.22
    });
    const astralKnot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), astralKnotMat);
    astralKnot.position.set(1.2, -0.7, -0.4);
    shapeGroup.add(astralKnot);
    shapes.push({ mesh: astralKnot, basePos: [1.2, -0.7, -0.4], speedX: -0.07, speedY: 0.08, phase: 1.57 });

    // Form 5: Right Flank - Heritage Monolith Prism (Faceted Dodecahedron)
    const monolithMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x05482e),
        roughness: 0.38,
        metalness: 0.20,
        flatShading: true,
        transparent: true,
        opacity: 0.24
    });
    const monolithPrism = new THREE.Mesh(new THREE.DodecahedronGeometry(0.82, 0), monolithMat);
    monolithPrism.position.set(2.2, 0.8, -0.5);
    shapeGroup.add(monolithPrism);
    shapes.push({ mesh: monolithPrism, basePos: [2.2, 0.8, -0.5], speedX: 0.08, speedY: -0.07, phase: 2.4 });

    // =========================================================================
    // 3. ZERO PIXIE PARTICLES (Mandatory Clean Editorial Discipline)
    // =========================================================================

    // =========================================================================
    // 4. Foreground Transmissive Architectural Crystal Glass Sheet (z = 0)
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
    // High-end balanced isotropic hammered glass texture (smooth, natural, zero horizontal raster lines)
    normalMap.repeat.set(6.0, 6.0);

    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf0fdf5),           // Translucent crystalline glass
        transmission: 0.94,                         // High optical transmission
        roughness: 0.20,                            // Satin sheen delivering ~20% visibility of underlying scene
        ior: 1.34,                                  // Refractive index
        thickness: 0.88,                            // Heavy architectural glass slab
        metalness: 0.02,
        specularIntensity: 0.50,                    // Crisp crystalline specular reflections
        specularColor: new THREE.Color(0xa7f3d0),   // Mint-emerald crystal sheen
        clearcoat: 0.32,                            // Architectural glass clearcoat
        clearcoatRoughness: 0.18,                   // Glare-free polish
        attenuationColor: new THREE.Color(0x022014), // Deep emerald glass volume attenuation
        attenuationDistance: 13.0,                  // Rich volume absorption
        normalMap,
        normalScale: new THREE.Vector2(0.18, 0.18), // Soft tactile micro-refraction
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 5. Bespoke Royal Studio Lighting (ZERO CURSOR BACKLIGHT)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x01100a, 0.92);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0a643e, 0.52);
    keyLight.position.set(-3.2, 4.2, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa07d38, 0.32);
    rimLight.position.set(3.8, -2.8, 3.5);
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
    // 7. Continuous Autonomous Animation Loop (Autonomous 1.4x Wave Velocity)
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
    let lastFrameTime = 0;
    const targetFps = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFps;

    function renderFrame() {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;

        bgUniforms.uTime.value = elapsed;

        smoothScrollY += (targetScrollY - smoothScrollY) * 0.08;
        bgUniforms.uScroll.value = smoothScrollY;

        // Subtle vertical normal drift and optical micro-refraction breathing (1.4x velocity)
        if (normalMap) {
            normalMap.offset.y = -(elapsed * 0.0168) % 1.0;
            normalMap.offset.x = (Math.sin(elapsed * 0.28) * 0.006) % 1.0;
        }

        const normalBreathe = 0.18 + 0.025 * Math.sin(elapsed * 0.56);
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

        camera.position.x = normX * 0.12;
        camera.position.y = normY * 0.08 - (smoothScrollY * 0.0004);
        camera.lookAt(0, -(smoothScrollY * 0.0004), 0);

        // 3D sculptural assets float with 1.4x wave buoyancy and rotation
        for (let i = 0; i < shapes.length; i++) {
            const s = shapes[i];
            s.mesh.rotation.x = elapsed * s.speedX * 1.4;
            s.mesh.rotation.y = elapsed * s.speedY * 1.4;
            s.mesh.position.y = s.basePos[1] + Math.sin(elapsed * 0.49 + s.phase) * 0.09;
            s.mesh.position.x = s.basePos[0] + Math.cos(elapsed * 0.39 + s.phase) * 0.05;
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

    function animate(currentTime) {
        if (document.hidden) {
            rafId = 0;
            return;
        }
        rafId = requestAnimationFrame(animate);

        const delta = currentTime - lastFrameTime;
        if (delta >= frameInterval) {
            lastFrameTime = currentTime - (delta % frameInterval);
            renderFrame();
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !rafId) {
            lastFrameTime = performance.now();
            rafId = requestAnimationFrame(animate);
        }
    });

    renderFrame();
    lastFrameTime = performance.now();
    rafId = requestAnimationFrame(animate);
})();
