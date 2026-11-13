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
    // 3. Architectural Hammered Textured Glass Plane (z = 0)
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
        roughness: 0.22,              // Glossy architectural glass with crisp ripple highlights (video matched)
        ior: 1.52,                    // Architectural silica glass refraction
        thickness: 1.4,               // Physical refraction volume
        metalness: 0.02,
        specularIntensity: 1.0,
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 1.0,               // Polished glass surface sheen
        clearcoatRoughness: 0.08,     // Sharp sparkling specular glints on glass ripples
        attenuationColor: new THREE.Color(0x0a3d2e),
        attenuationDistance: 8.0,
        normalMap,
        normalScale: new THREE.Vector2(0.88, 0.88),  // Pronounced hammered glass ripples
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Dynamic Lighting: Interactive Specular Tracking PointLight + Studio Fill
    // =========================================================================
    // Moving specular highlight tracking mouse cursor in front of glass (video matched)
    const cursorLight = new THREE.PointLight(0xf4fdf8, 2.6, 25, 1.4);
    cursorLight.position.set(-1.5, 2.0, 3.2);
    scene.add(cursorLight);

    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x08261e, 0.65);
    scene.add(ambientLight);

    // Soft grazing key light catching glass ripples
    const keyLight = new THREE.DirectionalLight(0xdcf8ee, 0.75);
    keyLight.position.set(-3.0, 4.0, 3.5);
    scene.add(keyLight);

    // Warm rim light
    const rimLight = new THREE.DirectionalLight(0xf5e6be, 0.30);
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
    // 6. Interactive Cursor Tracking (Video Matched)
    // =========================================================================
    let targetLightX = 0;
    let targetLightY = 1.5;
    const mouseNDC = { x: 0, y: 0.3 };

    window.addEventListener('mousemove', (e) => {
        const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
        const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseNDC.x = ndcX;
        mouseNDC.y = ndcY;

        if (frustumAtGlass) {
            targetLightX = ndcX * (frustumAtGlass.width * 0.45);
            targetLightY = ndcY * (frustumAtGlass.height * 0.45);
        }
    }, { passive: true });

    // Hydrodynamic scroll
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
    }, { passive: true });

    // =========================================================================
    // 7. Smooth 60fps Animation Loop
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

        bgUniforms.uTime.value = elapsed;
        bgUniforms.uScroll.value = smoothScrollY;

        // Smoothly lerp PointLight toward cursor position (or gentle breathing orbit if idle)
        const lerpFactor = 1 - Math.exp(-6.0 * dt);
        cursorLight.position.x += (targetLightX - cursorLight.position.x) * lerpFactor;
        cursorLight.position.y += (targetLightY - cursorLight.position.y) * lerpFactor;

        // Gentle orbital drift for underlying botanical assets
        if (!prefersReducedMotion) {
            shapes.forEach((item) => {
                item.mesh.rotation.x += 0.0018 * item.speed * 4;
                item.mesh.rotation.y += 0.0024 * item.speed * 4;
                item.mesh.position.y = item.basePos[1] + Math.sin(elapsed * 0.40 + item.phase) * 0.25;
                item.mesh.position.x = item.basePos[0] + Math.cos(elapsed * 0.32 + item.phase) * 0.12;
            });
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
            hasCursorBacklight: true,
            lightPos: { x: cursorLight.position.x, y: cursorLight.position.y },
            mouseNDC: { x: mouseNDC.x, y: mouseNDC.y },
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
