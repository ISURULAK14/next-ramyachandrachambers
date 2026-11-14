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

                // Deep Imperial Emerald Noir palette (video matched)
                vec3 abyssNoir    = vec3(0.0118, 0.0471, 0.0392); // #030c0a
                vec3 darkEmerald  = vec3(0.0196, 0.1412, 0.1098); // #05241c
                vec3 livingGreen  = vec3(0.0353, 0.2353, 0.1765); // #093c2d
                vec3 deepGold     = vec3(0.24, 0.18, 0.06);

                float streamTime = uTime * 0.12 + uScroll * 0.00018;
                float wave = sin(p.x * 2.8 + p.y * 2.2 + streamTime) * 0.5 + 0.5;
                float wave2 = cos(p.x * 2.0 - p.y * 2.6 - streamTime * 0.7) * 0.5 + 0.5;
                float blend = wave * 0.6 + wave2 * 0.4;

                vec3 col = mix(abyssNoir, darkEmerald, blend);
                col = mix(col, livingGreen, (1.0 - p.y) * 0.28 * blend);
                col += deepGold * (sin(p.x * 3.5 + streamTime * 0.6) * 0.04 + 0.04);

                float vignette = smoothstep(1.15, 0.28, length(p - 0.5));
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
        emissiveIntensity: 0.4,
        roughness: 0.40,
        metalness: 0.10,
        transmission: 0.60,
        ior: 1.50,
        transparent: true,
        opacity: 0.45
    });
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 2), emeraldMat);
    icosahedron.position.set(-3.6, 1.8, -0.4);
    shapeGroup.add(icosahedron);
    shapes.push({ mesh: icosahedron, basePos: [-3.6, 1.8, -0.4], speed: 0.18, phase: 0 });

    // Golden Sunlight Amber Orb
    const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xdfbe72),
        emissive: new THREE.Color(0x5a4316),
        emissiveIntensity: 0.35,
        roughness: 0.35,
        metalness: 0.40,
        transparent: true,
        opacity: 0.45
    });
    const octahedron = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 24), goldMat);
    octahedron.position.set(3.5, -1.6, -0.2);
    shapeGroup.add(octahedron);
    shapes.push({ mesh: octahedron, basePos: [3.5, -1.6, -0.2], speed: -0.20, phase: 1.57 });

    // Sage Jade Aquatic Ring
    const jadeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x34d399),
        emissive: new THREE.Color(0x052e22),
        emissiveIntensity: 0.35,
        roughness: 0.40,
        transparent: true,
        opacity: 0.40
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 20, 40), jadeMat);
    torus.position.set(0.5, 0.3, -0.7);
    shapeGroup.add(torus);
    shapes.push({ mesh: torus, basePos: [0.5, 0.3, -0.7], speed: 0.12, phase: 3.14 });

    // =========================================================================
    // 3. Small Floating Pixie Lights Moving All Over Screen (z in [-2.4, -0.2])
    // =========================================================================
    // 300 small, sparkling pixie light motes wandering actively across full viewport
    const pixieCount = 300;

    // Small sphere geometry for crisp, tiny pixie cores
    const pixieGeo = new THREE.SphereGeometry(1, 8, 8);
    const pixieMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pixieMesh = new THREE.InstancedMesh(pixieGeo, pixieMat, pixieCount);
    pixieMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pixieMesh.frustumCulled = false;

    const pixieColors = new Float32Array(pixieCount * 3);
    const pixiePalette = [
        new THREE.Color(0xfff3cc).multiplyScalar(2.6), // glowing warm champagne
        new THREE.Color(0xfde047).multiplyScalar(2.5), // luminous honey gold
        new THREE.Color(0xf59e0b).multiplyScalar(2.2), // radiant amber
        new THREE.Color(0xfffbeb).multiplyScalar(2.8), // celestial white gold
        new THREE.Color(0x34d399).multiplyScalar(2.4), // luminous mint
        new THREE.Color(0x10b981).multiplyScalar(2.2), // vibrant emerald
        new THREE.Color(0x6ee7b7).multiplyScalar(2.5), // soft aquamarine
        new THREE.Color(0xffffff).multiplyScalar(3.0)  // pure diamond starlight
    ];

    // Particle flight state across the entire screen
    // Frustum at z = -1.5 is approximately [-10, 10] in X, [-6, 6] in Y
    const boundX = 10.5;
    const boundY = 6.5;

    const pixieData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < pixieCount; i++) {
        let col;
        const rand = Math.random();
        if (rand < 0.55) {
            col = pixiePalette[Math.floor(Math.random() * 4)];
        } else if (rand < 0.88) {
            col = pixiePalette[4 + Math.floor(Math.random() * 3)];
        } else {
            col = pixiePalette[7];
        }
        pixieColors[i * 3 + 0] = col.r;
        pixieColors[i * 3 + 1] = col.g;
        pixieColors[i * 3 + 2] = col.b;

        // "lights must be small": tiny pinpoint radii 0.007 to 0.016 units
        const radius = 0.007 + Math.random() * 0.009;

        // Slow, gentle, buoyant movement all over the screen:
        // Position scattered uniformly across the entire screen bounds
        const startX = (Math.random() - 0.5) * boundX * 2;
        const startY = (Math.random() - 0.5) * boundY * 2;
        const startZ = -2.1 + Math.random() * 1.8;

        // Slow drifting velocity vectors (0.05 to 0.14 units/sec)
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.05 + Math.random() * 0.09;

        const p = {
            x: startX,
            y: startY,
            z: startZ,
            vx: Math.cos(angle) * speed * 0.7,
            vy: (Math.sin(angle) * 0.25 + 0.75) * speed, // slow upward buoyant drift
            baseRadius: radius,
            swayFreq: 0.45 + Math.random() * 0.65,
            swayAmp: 0.04 + Math.random() * 0.06,
            swayPhase: Math.random() * Math.PI * 2,
            twinkleSpeed: 1.8 + Math.random() * 2.6,
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
    // 4. Architectural Hammered Textured Glass Plane (z = 0)
    // =========================================================================
    // Video matched: Fine hammered cathedral glass ripples across the whole surface
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(5.0, 5.0);

    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf6fcf9),
        transmission: 0.95,           // Reveals floating pixie lights with optical clarity
        roughness: 0.22,              // Tactile frosted glass texture with rounded cathedral ripples
        ior: 1.50,                    // Architectural silica glass
        thickness: 0.06,              // Thin sheet glass: crisp refraction without border ray clamping
        metalness: 0.02,
        specularIntensity: 0.85,      // Even crystal specular glints across ripples
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 0.60,              // Polished glass surface gloss
        clearcoatRoughness: 0.30,     // Soft, broad specular sheen catching lights without hotspot
        attenuationColor: new THREE.Color(0x063a2c),
        attenuationDistance: 10.0,
        normalMap,
        normalScale: new THREE.Vector2(0.50, 0.50),  // Rounded hammered ripples matching video
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 5. Studio Lighting (NO CURSOR BACKLIGHT)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0e3b2e, 1.10);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xe8faf3, 0.65);
    keyLight.position.set(-3.0, 4.0, 5.0);
    scene.add(keyLight);

    const frontLight = new THREE.DirectionalLight(0xd1fae5, 0.40);
    frontLight.position.set(2.0, 3.5, 6.0);
    scene.add(frontLight);

    const rimLight = new THREE.DirectionalLight(0xfae8b4, 0.35);
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

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
        renderer.setSize(w, h, false);

        bgUniforms.uResolution.value.set(w, h);

        const bgFrustum = getFrustumSizeAtZ(bgZ);
        bgMesh.scale.set(bgFrustum.width * 1.05, bgFrustum.height * 1.05, 1);

        const frustumAtGlass = getFrustumSizeAtZ(0);
        glassMesh.scale.set(frustumAtGlass.width * 1.05, frustumAtGlass.height * 1.05, 1);

        const aspect = w / h;
        normalMap.repeat.set(4.0 * aspect, 4.0);
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 7. Interactive Parallax & Active Motion Animation Loop
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
                item.mesh.rotation.x += 0.0025 * Math.abs(item.speed) * 4;
                item.mesh.rotation.y += 0.0032 * Math.abs(item.speed) * 4;
                item.mesh.position.y = item.basePos[1] + Math.sin(elapsed * 0.40 + item.phase) * 0.30;
                item.mesh.position.x = item.basePos[0] + Math.cos(elapsed * 0.30 + item.phase) * 0.18;
            });

            // Pixie lights active continuous motion across the entire screen
            for (let i = 0; i < pixieCount; i++) {
                const p = pixieData[i];

                // Update position with individual velocity
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                // Seamless screen wrapping across all 4 bounds
                if (p.x > boundX) p.x = -boundX;
                else if (p.x < -boundX) p.x = boundX;

                if (p.y > boundY) p.y = -boundY;
                else if (p.y < -boundY) p.y = boundY;

                // Sinusoidal organic flutter sway
                const swayX = Math.sin(elapsed * p.swayFreq + p.swayPhase) * p.swayAmp;
                const swayY = Math.cos(elapsed * (p.swayFreq * 0.8) + p.swayPhase) * (p.swayAmp * 0.6);

                const depthParallax = (p.z + 3.0) * 0.06;
                const finalX = p.x + swayX + mouseX * depthParallax;
                const finalY = p.y + swayY + mouseY * depthParallax - (smoothScrollY * 0.0003);
                const finalZ = p.z;

                // Gentle sparkling twinkle
                const twinkle = 0.5 + 0.5 * Math.sin(elapsed * p.twinkleSpeed + p.twinklePhase);
                const scale = p.baseRadius * (0.75 + 0.50 * twinkle);

                dummy.position.set(finalX, finalY, finalZ);
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
