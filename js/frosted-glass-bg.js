/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Architectural Textured Hammered Glass (Three.js WebGL) — Video Matched
 * Tactile hammered water-glass ripples, organic deep emerald botanical drift,
 * interactive cursor specular tracking, without square grid overlay ("sans the square grid").
 */
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
        return; // Graceful fallback to CSS #03120e emerald base
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

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
    // 1. Deep Luxury Emerald Botanic Environment Layer (z = -2.6)
    // =========================================================================
    const bgZ = -2.6;
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
                vec3 livingGreen  = vec3(0.0392, 0.2745, 0.2078); // #0a4635
                vec3 radiantLime  = vec3(0.0784, 0.5882, 0.3922); // #149664
                vec3 champagne    = vec3(0.8863, 0.7608, 0.4588); // #e2c275

                // Natural botanical river current
                float meander = sin(p.y * 2.2 + 0.35) * 0.16 + sin(p.y * 4.4 - 0.4) * 0.06;
                float distCenter = abs(p.x - 0.5 - meander);
                float channel = smoothstep(0.50, 0.04, distCenter);

                float streamTime = uTime * 0.10 + uScroll * 0.00022;

                vec2 flowUv1 = vec2(p.x * 2.5 + sin(p.y * 3.0 + streamTime * 2.0) * 0.09, p.y * 2.0 - streamTime);
                vec2 flowUv2 = vec2(p.x * 3.4 - cos(p.y * 3.2 - streamTime * 1.6) * 0.08, p.y * 3.0 - streamTime * 1.2);

                float ripple1 = sin(flowUv1.x * 2.8 + flowUv1.y * 1.8 + uTime * 0.35) * 0.5 + 0.5;
                float ripple2 = cos(flowUv2.x * 2.4 - flowUv2.y * 2.1 - uTime * 0.28) * 0.5 + 0.5;
                float fluidFlow = smoothstep(0.12, 0.88, ripple1 * 0.55 + ripple2 * 0.45);

                vec3 col = mix(abyssNoir, darkEmerald, 0.65 + 0.35 * channel);
                col = mix(col, livingGreen, channel * (0.42 + 0.58 * fluidFlow));
                col += radiantLime * (fluidFlow * channel * 0.20);
                col += champagne * (ripple1 * ripple2 * channel * 0.12);

                // Soft vignette
                float vignette = smoothstep(0.98, 0.36, length(p - 0.5));
                col *= (0.78 + 0.22 * vignette);

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Underlying Botanical Emerald Assets (Parallax Drift at z = -1.8)
    // =========================================================================
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -1.8;
    scene.add(shapeGroup);

    const shapes = [];

    // 2A. Translucent Emerald Moss Orb
    const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x10b981),
        emissive: new THREE.Color(0x064e3b),
        emissiveIntensity: 0.45,
        roughness: 0.40,
        metalness: 0.10,
        transmission: 0.50,
        ior: 1.50,
        transparent: true,
        opacity: 0.65
    });
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 3), emeraldMat);
    icosahedron.position.set(-3.2, 1.5, -0.4);
    shapeGroup.add(icosahedron);
    shapes.push({ mesh: icosahedron, basePos: [-3.2, 1.5, -0.4], speed: 0.16, phase: 0 });

    // 2B. Golden Sunlight Amber Orb
    const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xdfbe72),
        emissive: new THREE.Color(0x5a4316),
        emissiveIntensity: 0.35,
        roughness: 0.35,
        metalness: 0.45,
        transparent: true,
        opacity: 0.55
    });
    const octahedron = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 32), goldMat);
    octahedron.position.set(3.1, -1.3, -0.2);
    shapeGroup.add(octahedron);
    shapes.push({ mesh: octahedron, basePos: [3.1, -1.3, -0.2], speed: -0.18, phase: 1.57 });

    // 2C. Sage Jade Aquatic Ring
    const jadeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x34d399),
        emissive: new THREE.Color(0x052e22),
        emissiveIntensity: 0.35,
        roughness: 0.45,
        clearcoat: 0.30,
        clearcoatRoughness: 0.3,
        transparent: true,
        opacity: 0.50
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.12, 32, 64), jadeMat);
    torus.position.set(0.4, 0.3, -0.7);
    shapeGroup.add(torus);
    shapes.push({ mesh: torus, basePos: [0.4, 0.3, -0.7], speed: 0.10, phase: 3.14 });

    // 2D. Radiant Champagne Foliage Orb
    const champMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfae8b4),
        emissive: new THREE.Color(0x4a3a14),
        emissiveIntensity: 0.32,
        roughness: 0.42,
        metalness: 0.35,
        transparent: true,
        opacity: 0.55
    });
    const dodecahedron = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), champMat);
    dodecahedron.position.set(-1.8, -2.0, -0.1);
    shapeGroup.add(dodecahedron);
    shapes.push({ mesh: dodecahedron, basePos: [-1.8, -2.0, -0.1], speed: 0.20, phase: 4.71 });

    // =========================================================================
    // 3. Floating Pixie Lights Behind Frosted Glass (z in [-2.2, -0.15])
    // =========================================================================
    // Small luminous motes of light (fireflies/pixie lights) floating in 3D space
    // strictly behind the frosted glass plane (z < 0). Refracted and scattered
    // through the physical transmission, IOR, and normal map ripples of the glass.
    const pixieCount = 150;

    // Helper: Soft radial glow sprite for ethereal firefly aura
    function createPixieGlowTexture() {
        const sz = 128;
        const cvs = document.createElement('canvas');
        cvs.width = sz;
        cvs.height = sz;
        const ctx = cvs.getContext('2d');
        const grad = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.18, 'rgba(254, 240, 138, 0.95)');
        grad.addColorStop(0.42, 'rgba(234, 179, 8, 0.50)');
        grad.addColorStop(0.70, 'rgba(16, 185, 129, 0.22)');
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, sz, sz);
        return new THREE.CanvasTexture(cvs);
    }

    const pixieGeo = new THREE.SphereGeometry(1, 10, 10);
    const pixieMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pixieMesh = new THREE.InstancedMesh(pixieGeo, pixieMat, pixieCount);
    pixieMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pixieMesh.frustumCulled = false;

    // Points halo layer for soft ethereal diffusion
    const haloGeo = new THREE.BufferGeometry();
    const haloPositions = new Float32Array(pixieCount * 3);
    const haloColors = new Float32Array(pixieCount * 3);

    const pixieColors = new Float32Array(pixieCount * 3);
    const pixiePalette = [
        new THREE.Color(0xfff3cc).multiplyScalar(2.2), // glowing warm champagne
        new THREE.Color(0xfde047).multiplyScalar(2.0), // luminous honey gold
        new THREE.Color(0xf59e0b).multiplyScalar(1.9), // radiant amber
        new THREE.Color(0xfffbeb).multiplyScalar(2.3), // celestial white gold
        new THREE.Color(0x34d399).multiplyScalar(2.1), // luminous mint
        new THREE.Color(0x10b981).multiplyScalar(2.0), // vibrant emerald
        new THREE.Color(0x6ee7b7).multiplyScalar(2.2), // soft aquamarine
        new THREE.Color(0xffffff).multiplyScalar(2.5)  // pure diamond starlight
    ];

    const pixieData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < pixieCount; i++) {
        // Weighted selection: 60% gold/champagne, 30% emerald/mint, 10% pure diamond
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

        haloColors[i * 3 + 0] = col.r * 0.45;
        haloColors[i * 3 + 1] = col.g * 0.45;
        haloColors[i * 3 + 2] = col.b * 0.45;

        // Size tiered distribution: 70% small motes, 25% medium fireflies, 5% large depth orbs
        let radius;
        if (rand < 0.70) {
            radius = 0.045 + Math.random() * 0.045; // small sparkling motes
        } else if (rand < 0.95) {
            radius = 0.090 + Math.random() * 0.070; // medium glowing orbs
        } else {
            radius = 0.160 + Math.random() * 0.080; // radiant focal orbs
        }

        // Spread in 3D volume behind frosted glass (z between -2.2 and -0.15)
        const p = {
            baseX: (Math.random() - 0.5) * 16.5,
            baseY: (Math.random() - 0.5) * 10.5,
            baseZ: -2.2 + Math.random() * 2.05, // strictly behind glass at z = 0
            ampX: 0.22 + Math.random() * 0.45,
            ampY: 0.25 + Math.random() * 0.55,
            ampZ: 0.10 + Math.random() * 0.22,
            speedX: 0.15 + Math.random() * 0.28,
            speedY: 0.13 + Math.random() * 0.26,
            speedZ: 0.11 + Math.random() * 0.22,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            phaseZ: Math.random() * Math.PI * 2,
            baseRadius: radius,
            twinkleSpeed: 1.2 + Math.random() * 2.4,
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
        size: 0.60,
        map: createPixieGlowTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });
    const haloMesh = new THREE.Points(haloGeo, haloMat);
    haloMesh.frustumCulled = false;
    scene.add(haloMesh);

    // =========================================================================
    // 4. Architectural Hammered Textured Glass Plane (z = 0)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.ClampToEdgeWrapping;
    normalMap.wrapT = THREE.ClampToEdgeWrapping;
    normalMap.repeat.set(1.0, 1.0);

    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf6fcf9),
        transmission: 0.96,           // High optical clarity revealing background
        roughness: 0.21,              // Architectural textured glass with tactile ripple facets (video matched)
        ior: 1.52,                    // Architectural silica glass refraction
        thickness: 1.6,               // Physical refraction volume
        metalness: 0.02,
        specularIntensity: 1.0,
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 1.0,               // Polished glass surface sheen
        clearcoatRoughness: 0.08,     // Sharp sparkling specular glints on glass ripples
        attenuationColor: new THREE.Color(0x0a3d2e),
        attenuationDistance: 8.0,
        normalMap,
        normalScale: new THREE.Vector2(0.55, 0.55),  // High-frequency hammered glass ripples
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Balanced Studio Lighting (NO CURSOR BACKLIGHT)
    // =========================================================================
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x0a2f24, 0.76);
    scene.add(ambientLight);

    // High-angle grazing key light catching fine glass ripples evenly across surface
    const keyLight = new THREE.DirectionalLight(0xdcf8ee, 0.72);
    keyLight.position.set(-2.5, 4.5, 3.5);
    scene.add(keyLight);

    // Warm champagne rim light balancing depth
    const rimLight = new THREE.DirectionalLight(0xf5e6be, 0.32);
    rimLight.position.set(3.0, -2.5, 2.5);
    scene.add(rimLight);

    // =========================================================================
    // 5. Responsive Frustum Scaling & Resize Handler
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

        normalMap.repeat.set(1.0, 1.0);
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 6. Hydrodynamic Scroll & Subtle Parallax (No Backlight Hotspots)
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

    // =========================================================================
    // 7. Smooth 60fps Animation Loop with Pixie Lights Drift
    // =========================================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;

        // Smooth scroll
        const scrollEase = 1 - Math.exp(-4.5 * dt);
        smoothScrollY += (targetScrollY - smoothScrollY) * scrollEase;

        // Smooth mouse parallax
        const mouseEase = 1 - Math.exp(-3.0 * dt);
        mouseX += (targetMouseX - mouseX) * mouseEase;
        mouseY += (targetMouseY - mouseY) * mouseEase;

        bgUniforms.uTime.value = elapsed;
        bgUniforms.uScroll.value = smoothScrollY;

        // Gentle orbital drift for underlying botanical assets & 3D floating pixie lights
        if (!prefersReducedMotion) {
            shapes.forEach((item) => {
                item.mesh.rotation.x += 0.0018 * item.speed * 4;
                item.mesh.rotation.y += 0.0024 * item.speed * 4;
                item.mesh.position.y = item.basePos[1] + Math.sin(elapsed * 0.40 + item.phase) * 0.25;
                item.mesh.position.x = item.basePos[0] + Math.cos(elapsed * 0.32 + item.phase) * 0.12;
            });

            // 3D Harmonic floating motion for small pixie lights behind glass
            for (let i = 0; i < pixieCount; i++) {
                const p = pixieData[i];
                const depthParallax = (p.baseZ + 3.0) * 0.08;
                const px = p.baseX + Math.sin(elapsed * p.speedX + p.phaseX) * p.ampX + Math.cos(elapsed * 0.16 + p.phaseY) * 0.12 + mouseX * depthParallax;
                const py = p.baseY + Math.cos(elapsed * p.speedY + p.phaseY) * p.ampY + Math.sin(elapsed * 0.22 + p.phaseX) * 0.10 + mouseY * depthParallax - (smoothScrollY * 0.0004);
                const pz = p.baseZ + Math.sin(elapsed * p.speedZ + p.phaseZ) * p.ampZ;

                const breathe = Math.sin(elapsed * p.twinkleSpeed + p.twinklePhase);
                const scale = p.baseRadius * (0.72 + 0.48 * breathe);

                dummy.position.set(px, py, pz);
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();
                pixieMesh.setMatrixAt(i, dummy.matrix);

                haloPositions[i * 3 + 0] = px;
                haloPositions[i * 3 + 1] = py;
                haloPositions[i * 3 + 2] = pz;
            }
            pixieMesh.instanceMatrix.needsUpdate = true;
            haloGeo.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: false, // Explicitly sans the square grid
            hasShapes: true,
            hasRealisticIce: true,
            isSingleFrost: true,
            hasPixieLights: true,
            pixieCount,
            hasCursorBacklight: false, // Explicitly removed per user command
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
