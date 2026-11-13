/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * One Single Monolithic Frosted Ice Plane with Realistic Hexagonal Dendritic Texture (Three.js WebGL)
 * 1:1 non-tiled seamless frost mapping (zero grid/tile seams, IOR 1.309, zero backlight).
 */
import * as THREE from './vendor/three.module.js';

(function initSingleFrostedIce() {
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
        return; // Fallback to CSS #03120e emerald base
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    if ('transmissionResolutionScale' in renderer) {
        renderer.transmissionResolutionScale = 0.5;
    }
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
    // 1. Deep Luxury Emerald Environment (Beneath Frost at z = -2.5)
    // =========================================================================
    const bgZ = -2.5;
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
                vec3 bedrockNoir  = vec3(0.0118, 0.0471, 0.0392); // #030c0a deep abyss
                vec3 deepEmerald  = vec3(0.0196, 0.1412, 0.1098); // #05241c velvety dark emerald
                vec3 royalEmerald = vec3(0.0392, 0.2745, 0.2078); // #0a4635 living royal emerald
                vec3 brightGlow   = vec3(0.0627, 0.7255, 0.5059); // #10b981 radiant emerald current
                vec3 champagne    = vec3(0.8863, 0.7608, 0.4588); // #e2c275 subtle antique gold glint

                // Meandering luxury river current thalweg
                float meander = sin(p.y * 2.2 + 0.35) * 0.18 + sin(p.y * 4.6 - 0.4) * 0.07;
                float distCenter = abs(p.x - 0.5 - meander);
                float channel = smoothstep(0.48, 0.05, distCenter);

                // Fluid downstream velocity + scroll glide
                float streamTime = uTime * 0.10 + uScroll * 0.00022;

                // Flowing fluid coordinates
                vec2 flowUv1 = vec2(p.x * 2.6 + sin(p.y * 3.0 + streamTime * 2.2) * 0.10, p.y * 2.0 - streamTime);
                vec2 flowUv2 = vec2(p.x * 3.6 - cos(p.y * 3.4 - streamTime * 1.8) * 0.08, p.y * 3.0 - streamTime * 1.3);

                // Harmonic fluid eddies
                float eddy1 = sin(flowUv1.x * 4.0 + flowUv1.y * 2.8 + uTime * 0.4) * 0.5
                            + cos(flowUv1.x * 2.5 - flowUv1.y * 4.4 - uTime * 0.3) * 0.5;
                float eddy2 = cos(flowUv2.x * 5.0 - flowUv2.y * 2.6 + uTime * 0.5) * 0.5
                            + sin(flowUv2.x * 3.0 + flowUv2.y * 5.0 - uTime * 0.35) * 0.5;

                // Smooth natural fluid ripples (zero sharp lines or caustic cell borders)
                float ripple1 = sin(flowUv1.x * 2.8 + flowUv1.y * 1.9 + uTime * 0.35) * 0.5 + 0.5;
                float ripple2 = cos(flowUv2.x * 2.4 - flowUv2.y * 2.2 - uTime * 0.28) * 0.5 + 0.5;
                float naturalFlow = smoothstep(0.12, 0.88, ripple1 * 0.55 + ripple2 * 0.45);

                // Base liquid layering with smooth gradient transitions
                vec3 col = mix(bedrockNoir, deepEmerald, 0.65 + 0.35 * channel);
                col = mix(col, royalEmerald, channel * (0.40 + 0.60 * naturalFlow));

                // Soft emerald luminescence in main current
                col += brightGlow * (naturalFlow * channel * 0.20);

                // Soft champagne mineral glints (smooth diffuse shimmer, zero lines)
                col += champagne * (ripple1 * ripple2 * channel * 0.12);

                // Deep luxury vignette (keeps center text corridor pristine)
                float vignette = smoothstep(0.98, 0.36, length(p - 0.5));
                col *= (0.76 + 0.24 * vignette);

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Underlying Geometric Crystals (Parallax Depth Beneath Ice at z = -1.6)
    // =========================================================================
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -1.6;
    scene.add(shapeGroup);

    const shapes = [];

    // 2A. Translucent Emerald Crystal (Geodesic Sphere - Zero Sharp Polygon Lines)
    const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x10b981),
        emissive: new THREE.Color(0x063124),
        emissiveIntensity: 0.35,
        roughness: 0.55,
        metalness: 0.10,
        transmission: 0.55,
        ior: 1.52,
        transparent: true,
        opacity: 0.45
    });
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 3), emeraldMat);
    icosahedron.position.set(-3.4, 1.6, -0.4);
    shapeGroup.add(icosahedron);
    shapes.push({ mesh: icosahedron, basePos: [-3.4, 1.6, -0.4], speed: 0.16, phase: 0 });

    // 2B. Polished Warm Amber Glow Orb
    const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xdfbe72),
        emissive: new THREE.Color(0x4a3610),
        emissiveIntensity: 0.30,
        roughness: 0.50,
        metalness: 0.40,
        transparent: true,
        opacity: 0.40
    });
    const octahedron = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 32), goldMat);
    octahedron.position.set(3.2, -1.4, -0.2);
    shapeGroup.add(octahedron);
    shapes.push({ mesh: octahedron, basePos: [3.2, -1.4, -0.2], speed: -0.18, phase: 1.57 });

    // 2C. Satin Jade Soft Ring
    const jadeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x34d399),
        emissive: new THREE.Color(0x04241a),
        emissiveIntensity: 0.25,
        roughness: 0.60,
        clearcoat: 0.25,
        clearcoatRoughness: 0.4,
        transparent: true,
        opacity: 0.35
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.10, 32, 64), jadeMat);
    torus.position.set(0.4, 0.3, -0.7);
    shapeGroup.add(torus);
    shapes.push({ mesh: torus, basePos: [0.4, 0.3, -0.7], speed: 0.10, phase: 3.14 });

    // 2D. Champagne Soft Glow Orb
    const champMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfae8b4),
        emissive: new THREE.Color(0x3e3012),
        emissiveIntensity: 0.25,
        roughness: 0.52,
        metalness: 0.35,
        transparent: true,
        opacity: 0.40
    });
    const dodecahedron = new THREE.Mesh(new THREE.SphereGeometry(1.10, 32, 32), champMat);
    dodecahedron.position.set(-1.8, -2.1, -0.1);
    shapeGroup.add(dodecahedron);
    shapes.push({ mesh: dodecahedron, basePos: [-1.8, -2.1, -0.1], speed: 0.20, phase: 4.71 });

    // =========================================================================
    // 3. One Single Monolithic Frosted Ice Sheet (Non-Tiled 1:1 Mapping at z = 0)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.ClampToEdgeWrapping;
    normalMap.wrapT = THREE.ClampToEdgeWrapping;
    normalMap.repeat.set(1.0, 1.0); // Single frost plane: 1:1 continuous mapping, zero seams

    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf4fcf8),
        transmission: 0.96,           // High optical transmission
        roughness: 0.46,              // Realistic frosted ice light scattering
        ior: 1.309,                   // True physical index of refraction for natural water ice
        thickness: 1.8,               // Physical refraction volume
        metalness: 0.02,
        specularIntensity: 0.90,
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 0.40,              // Clean, polished top ice sheen
        clearcoatRoughness: 0.22,     // Natural surface reflection
        attenuationColor: new THREE.Color(0x063124), // Pure emerald crystalline attenuation
        attenuationDistance: 8.0,     // Natural depth falloff
        normalMap,
        normalScale: new THREE.Vector2(0.32, 0.32),  // Natural isotropic micro-frost crystal facets
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Balanced Studio Lighting (NO BACKLIGHT)
    // =========================================================================
    // Deep emerald ambient fill
    const ambientLight = new THREE.AmbientLight(0x0c382b, 0.78);
    scene.add(ambientLight);

    // Cool ice grazing light catching dendritic facets evenly across the single sheet
    const iceGrazeLight = new THREE.DirectionalLight(0xd4f6ed, 0.58);
    iceGrazeLight.position.set(-2.0, 4.0, 3.0);
    scene.add(iceGrazeLight);

    // Warm champagne rim light balancing the composition
    const rimLight = new THREE.DirectionalLight(0xf5e6be, 0.28);
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

        // Maintain one single continuous frost texture across the entire screen
        normalMap.repeat.set(1.0, 1.0);
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 6. Hydrodynamic Scroll Drift
    // =========================================================================
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

        // Smooth scroll inertia
        const scrollEase = 1 - Math.exp(-4.5 * dt);
        smoothScrollY += (targetScrollY - smoothScrollY) * scrollEase;

        bgUniforms.uTime.value = elapsed;
        bgUniforms.uScroll.value = smoothScrollY;

        // Gentle orbital breathing for underlying geometric crystals
        if (!prefersReducedMotion) {
            shapes.forEach((item) => {
                item.mesh.rotation.x += 0.0018 * item.speed * 4;
                item.mesh.rotation.y += 0.0024 * item.speed * 4;
                item.mesh.position.y = item.basePos[1] + Math.sin(elapsed * 0.40 + item.phase) * 0.28;
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
            hasGridOverlay: false,
            hasShapes: true,
            hasRealisticIce: true,
            isSingleFrost: true,
            hasCursorBacklight: false,
            lightPos: null,
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
