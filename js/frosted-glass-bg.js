import * as THREE from './vendor/three.module.js';

(function initVideoMatchedTexturedGlass() {
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
        return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10;

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
    // 1. Deep Luxury Emerald Base Environment Layer (z = -3.0)
    // =========================================================================
    const bgZ = -3.0;
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

                // Deep Imperial Emerald Noir palette
                vec3 abyssNoir    = vec3(0.0118, 0.0471, 0.0392); // #030c0a
                vec3 darkEmerald  = vec3(0.0196, 0.1412, 0.1098); // #05241c
                vec3 livingGreen  = vec3(0.0353, 0.2353, 0.1765); // #093c2d
                vec3 deepGold     = vec3(0.24, 0.18, 0.06);

                // Gentle organic ambient gradient
                float streamTime = uTime * 0.08 + uScroll * 0.00015;
                float wave = sin(p.x * 3.0 + p.y * 2.0 + streamTime) * 0.5 + 0.5;
                float wave2 = cos(p.x * 2.2 - p.y * 2.8 - streamTime * 0.8) * 0.5 + 0.5;
                float blend = wave * 0.6 + wave2 * 0.4;

                vec3 col = mix(abyssNoir, darkEmerald, blend);
                col = mix(col, livingGreen, (1.0 - p.y) * 0.25 * blend);
                col += deepGold * (sin(p.x * 4.0 + streamTime * 0.5) * 0.04 + 0.04);

                // Smooth vignette
                float vignette = smoothstep(1.1, 0.25, length(p - 0.5));
                col *= (0.75 + 0.25 * vignette);

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Underlying Botanical Emerald Assets (Deep Parallax at z = -2.2)
    // =========================================================================
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -2.2;
    scene.add(shapeGroup);

    const shapes = [];

    // Translucent Emerald Moss Orb
    const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x10b981),
        emissive: new THREE.Color(0x064e3b),
        emissiveIntensity: 0.5,
        roughness: 0.35,
        metalness: 0.10,
        transmission: 0.60,
        ior: 1.50,
        transparent: true,
        opacity: 0.60
    });
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), emeraldMat);
    icosahedron.position.set(-3.5, 1.8, -0.4);
    shapeGroup.add(icosahedron);
    shapes.push({ mesh: icosahedron, basePos: [-3.5, 1.8, -0.4], speed: 0.20, phase: 0 });

    // Golden Sunlight Amber Orb
    const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xdfbe72),
        emissive: new THREE.Color(0x5a4316),
        emissiveIntensity: 0.4,
        roughness: 0.30,
        metalness: 0.40,
        transparent: true,
        opacity: 0.55
    });
    const octahedron = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 32), goldMat);
    octahedron.position.set(3.4, -1.5, -0.2);
    shapeGroup.add(octahedron);
    shapes.push({ mesh: octahedron, basePos: [3.4, -1.5, -0.2], speed: -0.22, phase: 1.57 });

    // Sage Jade Aquatic Ring
    const jadeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x34d399),
        emissive: new THREE.Color(0x052e22),
        emissiveIntensity: 0.4,
        roughness: 0.35,
        transparent: true,
        opacity: 0.50
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.10, 24, 48), jadeMat);
    torus.position.set(0.6, 0.4, -0.7);
    shapeGroup.add(torus);
    shapes.push({ mesh: torus, basePos: [0.6, 0.4, -0.7], speed: 0.15, phase: 3.14 });

    // =========================================================================
    // 3. Small Floating Pixie Lights Behind Frosted Glass (z in [-2.5, -0.2])
    // =========================================================================
    const pixieCount = 200;

    function createPixieGlowTexture() {
        const sz = 128;
        const cvs = document.createElement('canvas');
        cvs.width = sz;
        cvs.height = sz;
        const ctx = cvs.getContext('2d');
        const grad = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
        grad.addColorStop(0.00, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.15, 'rgba(255, 244, 180, 0.95)');
        grad.addColorStop(0.38, 'rgba(250, 204, 21, 0.65)');
        grad.addColorStop(0.65, 'rgba(16, 185, 129, 0.30)');
        grad.addColorStop(1.00, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, sz, sz);
        return new THREE.CanvasTexture(cvs);
    }

    const glowTexture = createPixieGlowTexture();

    // 3A. Physical Core Spheres (Captured in transmission buffer)
    const pixieGeo = new THREE.SphereGeometry(1, 10, 10);
    const pixieMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pixieMesh = new THREE.InstancedMesh(pixieGeo, pixieMat, pixieCount);
    pixieMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pixieMesh.frustumCulled = false;

    // 3B. Soft Radiant Halo Points (depth-attenuated fairy light aura)
    const haloGeo = new THREE.BufferGeometry();
    const haloPositions = new Float32Array(pixieCount * 3);
    const haloColors = new Float32Array(pixieCount * 3);

    const pixieColors = new Float32Array(pixieCount * 3);
    const pixiePalette = [
        new THREE.Color(0xfff3cc).multiplyScalar(2.5), // glowing warm champagne
        new THREE.Color(0xfde047).multiplyScalar(2.4), // luminous honey gold
        new THREE.Color(0xf59e0b).multiplyScalar(2.2), // radiant amber
        new THREE.Color(0xfffbeb).multiplyScalar(2.8), // celestial white gold
        new THREE.Color(0x34d399).multiplyScalar(2.3), // luminous mint
        new THREE.Color(0x10b981).multiplyScalar(2.2), // vibrant emerald
        new THREE.Color(0x6ee7b7).multiplyScalar(2.4), // soft aquamarine
        new THREE.Color(0xffffff).multiplyScalar(3.0)  // pure diamond starlight
    ];

    const pixieData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < pixieCount; i++) {
        let col;
        const rand = Math.random();
        if (rand < 0.60) {
            col = pixiePalette[Math.floor(Math.random() * 4)];
        } else if (rand < 0.90) {
            col = pixiePalette[4 + Math.floor(Math.random() * 3)];
        } else {
            col = pixiePalette[7];
        }
        pixieColors[i * 3 + 0] = col.r;
        pixieColors[i * 3 + 1] = col.g;
        pixieColors[i * 3 + 2] = col.b;

        haloColors[i * 3 + 0] = Math.min(1.0, col.r * 0.85);
        haloColors[i * 3 + 1] = Math.min(1.0, col.g * 0.85);
        haloColors[i * 3 + 2] = Math.min(1.0, col.b * 0.85);

        // Small realistic pixie light radius (0.08 to 0.22 world units)
        let radius;
        if (rand < 0.65) {
            radius = 0.08 + Math.random() * 0.06;  // small sparkling motes
        } else if (rand < 0.92) {
            radius = 0.14 + Math.random() * 0.07;  // medium glowing fireflies
        } else {
            radius = 0.22 + Math.random() * 0.08;  // focal firefly orbs
        }

        const p = {
            baseX: (Math.random() - 0.5) * 12.0,
            baseY: (Math.random() - 0.5) * 8.0,
            baseZ: -2.4 + Math.random() * 2.1,  // strictly behind glass at z = 0
            speedY: 0.28 + Math.random() * 0.42, // buoyant vertical drift
            swayAmpX: 0.35 + Math.random() * 0.50,
            swayFreqX: 0.35 + Math.random() * 0.45,
            bobFreqZ: 0.25 + Math.random() * 0.35,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            phaseZ: Math.random() * Math.PI * 2,
            baseRadius: radius,
            twinkleSpeed: 1.8 + Math.random() * 2.5,
            twinklePhase: Math.random() * Math.PI * 2
        };
        pixieData.push(p);

        dummy.position.set(p.baseX, p.baseY, p.baseZ);
        dummy.scale.set(p.baseRadius, p.baseRadius, p.baseRadius);
        dummy.updateMatrix();
        pixieMesh.setMatrixAt(i, dummy.matrix);

        haloPositions[i * 3 + 0] = p.baseX;
        haloPositions[i * 3 + 1] = p.baseY;
        haloPositions[i * 3 + 2] = p.baseZ;
    }

    pixieMesh.instanceColor = new THREE.InstancedBufferAttribute(pixieColors, 3);
    scene.add(pixieMesh);

    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
    haloGeo.setAttribute('color', new THREE.BufferAttribute(haloColors, 3));
    const haloMat = new THREE.PointsMaterial({
        size: 0.75,
        sizeAttenuation: true,
        map: glowTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });
    const haloMesh = new THREE.Points(haloGeo, haloMat);
    haloMesh.frustumCulled = false;
    scene.add(haloMesh);

    // =========================================================================
    // 4. Architectural Frosted Frozen Water Glass Plane (z = 0)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    // High-frequency tactile frost crystalline facets across the full surface
    normalMap.repeat.set(12.0, 7.5);

    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf6fcf9),
        transmission: 0.95,           // Reveals floating pixie lights with optical clarity
        roughness: 0.20,              // Tactile frosted glass texture with crystalline micro-facets
        ior: 1.54,                    // Optical ice IOR
        thickness: 0.35,              // Physical refraction volume without clamp-to-edge streaking
        metalness: 0.02,
        specularIntensity: 1.5,       // Crisp crystal specular glints
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 1.0,               // Polished ice surface gloss
        clearcoatRoughness: 0.05,     // Sparkling specular glints catching lights
        attenuationColor: new THREE.Color(0x063a2c),
        attenuationDistance: 10.0,
        normalMap,
        normalScale: new THREE.Vector2(0.60, 0.60),  // Tactile frozen water crystal facets
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 5. Studio Lighting (NO CURSOR BACKLIGHT)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x082b21, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xe2fbf0, 0.85);
    keyLight.position.set(-3.0, 5.0, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfae8b4, 0.45);
    rimLight.position.set(3.5, -3.0, 3.0);
    scene.add(rimLight);

    // =========================================================================
    // 6. Responsive Frustum Scaling & Resize Handler
    // =========================================================================
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

        const frustumAtGlass = getFrustumSizeAtZ(0);
        glassMesh.scale.set(frustumAtGlass.width * 1.02, frustumAtGlass.height * 1.02, 1);

        // Aspect-ratio aware repeat so frost crystals remain square & uniform
        const aspect = w / h;
        normalMap.repeat.set(8.0 * aspect, 8.0);
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 7. Interactive Parallax & Animation Loop
    // =========================================================================
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
    }, { passive: true });

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    window.addEventListener('pointermove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;

        const scrollEase = 1 - Math.exp(-4.5 * dt);
        smoothScrollY += (targetScrollY - smoothScrollY) * scrollEase;

        const mouseEase = 1 - Math.exp(-3.0 * dt);
        mouseX += (targetMouseX - mouseX) * mouseEase;
        mouseY += (targetMouseY - mouseY) * mouseEase;

        bgUniforms.uTime.value = elapsed;
        bgUniforms.uScroll.value = smoothScrollY;

        if (!prefersReducedMotion) {
            shapes.forEach((item) => {
                item.mesh.rotation.x += 0.0030 * Math.abs(item.speed) * 4;
                item.mesh.rotation.y += 0.0038 * Math.abs(item.speed) * 4;
                item.mesh.position.y = item.basePos[1] + Math.sin(elapsed * 0.45 + item.phase) * 0.35;
                item.mesh.position.x = item.basePos[0] + Math.cos(elapsed * 0.35 + item.phase) * 0.20;
            });

            // 3D Harmonic buoyant upward floating motion for pixie lights behind glass
            const totalH = 8.6;
            const frustumHalfW = 6.4;
            const frustumHalfH = 3.8;

            function smoothFade(val, maxVal, fadeDist) {
                const distFromEdge = maxVal - Math.abs(val);
                if (distFromEdge <= 0) return 0;
                if (distFromEdge >= fadeDist) return 1;
                const t = distFromEdge / fadeDist;
                return t * t * (3 - 2 * t);
            }

            for (let i = 0; i < pixieCount; i++) {
                const p = pixieData[i];
                const depthParallax = (p.baseZ + 3.0) * 0.08;

                // Continuous upward buoyancy with wrap-around
                const yRaw = (p.baseY + elapsed * p.speedY) % totalH;
                const py = (yRaw < 0 ? yRaw + totalH : yRaw) - totalH / 2 + mouseY * depthParallax - (smoothScrollY * 0.0004);

                // Sinusoidal lateral sway & depth bobbing
                const px = p.baseX + Math.sin(elapsed * p.swayFreqX + p.phaseX) * p.swayAmpX + Math.cos(elapsed * 0.30 + p.phaseY) * 0.20 + mouseX * depthParallax;
                const pz = p.baseZ + Math.sin(elapsed * p.bobFreqZ + p.phaseZ) * 0.20;

                // Edge fade to 0 scale before reaching camera frustum bounds (prevents clamp-to-edge refraction streaking)
                const fadeX = smoothFade(px, frustumHalfW, 1.4);
                const fadeY = smoothFade(py, frustumHalfH, 1.1);
                const edgeFade = fadeX * fadeY;

                if (edgeFade <= 0.001) {
                    dummy.position.set(0, 0, -100);
                    dummy.scale.set(0, 0, 0);
                    dummy.updateMatrix();
                    pixieMesh.setMatrixAt(i, dummy.matrix);

                    haloPositions[i * 3 + 0] = 0;
                    haloPositions[i * 3 + 1] = 0;
                    haloPositions[i * 3 + 2] = -100;
                } else {
                    // Twinkle sparkle breathing (pulsing size & brilliance)
                    const breathe = 0.5 + 0.5 * Math.sin(elapsed * p.twinkleSpeed + p.twinklePhase);
                    const scale = p.baseRadius * (0.65 + 0.70 * breathe) * edgeFade;

                    dummy.position.set(px, py, pz);
                    dummy.scale.set(scale, scale, scale);
                    dummy.updateMatrix();
                    pixieMesh.setMatrixAt(i, dummy.matrix);

                    haloPositions[i * 3 + 0] = px;
                    haloPositions[i * 3 + 1] = py;
                    haloPositions[i * 3 + 2] = pz;
                }
            }
            pixieMesh.instanceMatrix.needsUpdate = true;
            haloGeo.attributes.position.needsUpdate = true;
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
            hasCursorBacklight: false,
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
