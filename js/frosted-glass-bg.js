/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Three.js Realistic Transmissive Frosted Glass + Physical Underlying Solids + Refined Soft Cursor Light (Grid Removed)
 */
import * as THREE from './vendor/three.module.js';

(function initFrostedGlassBackground() {
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    if ('transmissionResolutionScale' in renderer) {
        renderer.transmissionResolutionScale = 0.5;
    }
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

    // Helper: compute exact world-space frustum dimensions at given Z plane
    function getFrustumSizeAtZ(zPlane) {
        const dist = camera.position.z - zPlane;
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFov / 2) * dist;
        const width = height * camera.aspect;
        return { width, height };
    }

    // =========================================================================
    // 1. Background Environment Layer (Deep Imperial Emerald Radial Gradients)
    // =========================================================================
    const bgZ = -3.0;
    const bgGeo = new THREE.PlaneGeometry(1, 1);
    const bgUniforms = {
        uTime: { value: 0 },
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
            uniform vec2 uResolution;

            void main() {
                vec2 p = vUv;
                vec3 baseNoir     = vec3(0.0118, 0.0549, 0.0431); // #030e0b deep abyss
                vec3 deepEmerald  = vec3(0.0196, 0.1569, 0.1216); // #05281f
                vec3 royalEmerald = vec3(0.0431, 0.2588, 0.1961); // #0b4232
                vec3 champagne    = vec3(0.8863, 0.7608, 0.4588); // #e2c275

                float drift1 = sin(uTime * 0.22) * 0.06;
                float drift2 = cos(uTime * 0.18) * 0.06;

                float d1 = length(p - vec2(0.20 + drift1, 0.82));
                float d2 = length(p - vec2(0.84 - drift2, 0.24));
                float d3 = length(p - vec2(0.50, 0.50 + drift1 * 0.5));

                vec3 col = baseNoir;
                col = mix(col, royalEmerald, smoothstep(0.95, 0.05, d1) * 0.88);
                col = mix(col, deepEmerald, smoothstep(0.90, 0.05, d2) * 0.82);
                col += royalEmerald * smoothstep(0.75, 0.0, d3) * 0.30;
                col += champagne * smoothstep(0.55, 0.0, length(p - vec2(0.26, 0.76))) * 0.08;
                col += champagne * smoothstep(0.50, 0.0, length(p - vec2(0.76, 0.30))) * 0.06;

                // Subtle organic vignette
                float vignette = smoothstep(0.98, 0.35, length(p - 0.5));
                col *= (0.78 + 0.22 * vignette);

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Realistic Physical Geometric Solids (Floating Behind Glass at z = -1.6)
    // =========================================================================
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -1.6;
    scene.add(shapeGroup);

    const shapes = [];

    // 2A. Emerald crystal (Icosahedron)
    const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x10b981),
        emissive: new THREE.Color(0x063124),
        emissiveIntensity: 0.65,
        roughness: 0.24,
        metalness: 0.15,
        transmission: 0.42,
        ior: 1.57,
        transparent: true,
        opacity: 0.88
    });
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 0), emeraldMat);
    icosahedron.position.set(-3.4, 1.6, -0.4);
    shapeGroup.add(icosahedron);
    shapes.push({ mesh: icosahedron, basePos: [-3.4, 1.6, -0.4], speed: 0.18, phase: 0 });

    // 2B. Polished Gold Octahedron
    const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xdfbe72),
        emissive: new THREE.Color(0x5a4316),
        emissiveIntensity: 0.55,
        roughness: 0.22,
        metalness: 0.88,
        transparent: true,
        opacity: 0.85
    });
    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(1.45, 0), goldMat);
    octahedron.position.set(3.2, -1.4, -0.2);
    shapeGroup.add(octahedron);
    shapes.push({ mesh: octahedron, basePos: [3.2, -1.4, -0.2], speed: -0.20, phase: 1.57 });

    // 2C. Satin Jade Torus
    const jadeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x34d399),
        emissive: new THREE.Color(0x04241a),
        emissiveIntensity: 0.50,
        roughness: 0.36,
        clearcoat: 0.35,
        clearcoatRoughness: 0.4,
        transparent: true,
        opacity: 0.75
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.15, 16, 48), jadeMat);
    torus.position.set(0.4, 0.3, -0.7);
    shapeGroup.add(torus);
    shapes.push({ mesh: torus, basePos: [0.4, 0.3, -0.7], speed: 0.12, phase: 3.14 });

    // 2D. Champagne Dodecahedron
    const champMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfae8b4),
        emissive: new THREE.Color(0x524018),
        emissiveIntensity: 0.50,
        roughness: 0.28,
        metalness: 0.65,
        transparent: true,
        opacity: 0.78
    });
    const dodecahedron = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 0), champMat);
    dodecahedron.position.set(-1.8, -2.1, -0.1);
    shapeGroup.add(dodecahedron);
    shapes.push({ mesh: dodecahedron, basePos: [-1.8, -2.1, -0.1], speed: 0.22, phase: 4.71 });

    // =========================================================================
    // 3. Hyper-Realistic Frosted Glass Material (MeshPhysicalMaterial)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(5.0, 3.0);

    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf2fcf7),
        transmission: 0.96,
        roughness: 0.58,              // Refined optical frosted diffusion
        ior: 1.52,                    // Realistic crown glass refraction
        thickness: 1.6,               // Physical optical volume
        metalness: 0.02,
        specularIntensity: 0.88,
        specularColor: new THREE.Color(0xfff5db),
        clearcoat: 0.35,              // Dual-layer: polished outer reflection + frosted interior
        clearcoatRoughness: 0.28,
        attenuationColor: new THREE.Color(0x063124),
        attenuationDistance: 7.2,
        normalMap,
        normalScale: new THREE.Vector2(0.28, 0.28),
        bumpMap: normalMap,
        bumpScale: 0.012,
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Refined Balanced Lighting (Reduced, Subtle Cursor PointLight)
    // =========================================================================
    // Soft, deep ambient illumination
    const ambientLight = new THREE.AmbientLight(0x0c382b, 0.80);
    scene.add(ambientLight);

    // Soft directional key light catching the glass bevel
    const keyLight = new THREE.DirectionalLight(0x9ee0cb, 0.45);
    keyLight.position.set(-3, 4, 3);
    scene.add(keyLight);

    // Warm subtle fill light from lower right
    const fillLight = new THREE.DirectionalLight(0xe8cf8c, 0.25);
    fillLight.position.set(3, -2, 2);
    scene.add(fillLight);

    // Reduced, gentle cursor specular tracking light (non-glaring, localized highlight)
    const cursorLight = new THREE.PointLight(0xfae8b4, 2.4, 15, 2.0);
    cursorLight.position.set(0, 0, 2.5);
    scene.add(cursorLight);

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

        normalMap.repeat.set(Math.max(2, w / 340), Math.max(2, h / 340));
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 6. Interactivity: Normalized Cursor Coordinates Tracking (-1 to +1)
    // =========================================================================
    const mouse = { x: 0, y: 0 };
    const currentLight = { x: 0, y: 0 };

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        mouse.y = -(event.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
    }, { passive: true });

    // =========================================================================
    // 7. Smooth 60fps Animation Loop
    // =========================================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const elapsed = clock.getElapsedTime();
        bgUniforms.uTime.value = elapsed;

        // Smoothly map normalized [-1, +1] cursor coordinates to light world position
        const targetX = mouse.x * (frustumAtGlass.width * 0.5);
        const targetY = mouse.y * (frustumAtGlass.height * 0.5);
        currentLight.x += (targetX - currentLight.x) * 0.10;
        currentLight.y += (targetY - currentLight.y) * 0.10;
        cursorLight.position.set(currentLight.x, currentLight.y, 2.5);

        // Orbital breathing and rotation for underlying geometric shapes
        if (!prefersReducedMotion) {
            shapes.forEach((item) => {
                item.mesh.rotation.x += 0.0020 * item.speed * 4;
                item.mesh.rotation.y += 0.0028 * item.speed * 4;
                item.mesh.position.y = item.basePos[1] + Math.sin(elapsed * 0.42 + item.phase) * 0.32;
                item.mesh.position.x = item.basePos[0] + Math.cos(elapsed * 0.35 + item.phase) * 0.15;
            });
        }

        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: false, // Grid removed per user instruction
            hasShapes: true,
            mouseNDC: { x: mouse.x, y: mouse.y },
            lightPos: { x: cursorLight.position.x, y: cursorLight.position.y, z: cursorLight.position.z },
            lightIntensity: cursorLight.intensity,
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
