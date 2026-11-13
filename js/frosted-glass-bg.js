/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Photorealistic Frosted Ice Plane + Deep Luxury Emerald Currents (Three.js WebGL)
 * Physical ice optics (IOR 1.309, dual-layer clearcoat, volumetric attenuation, zero backlight).
 */
import * as THREE from './vendor/three.module.js';

(function initPhotorealisticFrostedIce() {
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
    // 1. Deep Luxury Emerald Environment (Beneath Ice Sheet at z = -2.5)
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

                // Water caustics refracted by moving waves under ice
                vec2 cUv1 = flowUv1 * 5.0 + eddy1 * 0.55;
                vec2 cUv2 = flowUv2 * 6.5 - eddy2 * 0.45;
                float w1 = sin(cUv1.x + sin(cUv1.y + uTime * 0.7)) + cos(cUv1.y * 1.2 + cos(cUv1.x * 0.9 - uTime * 0.6));
                float w2 = sin(cUv2.x * 1.2 - sin(cUv2.y * 0.8 - uTime * 0.8)) + cos(cUv2.y + cos(cUv2.x * 1.1 + uTime * 0.6));
                float caustics = pow(1.0 - clamp(abs(w1 * 0.46), 0.0, 1.0), 3.4) * 0.55
                               + pow(1.0 - clamp(abs(w2 * 0.46), 0.0, 1.0), 3.6) * 0.45;

                // Base liquid layering
                vec3 col = mix(bedrockNoir, deepEmerald, 0.60 + 0.40 * channel);
                col = mix(col, royalEmerald, channel * (0.45 + 0.55 * (eddy1 * 0.5 + 0.5)));

                // Living current threads
                float currentThreads = smoothstep(0.20, 0.80, (eddy1 * eddy2) * 0.5 + 0.5);
                col += brightGlow * currentThreads * channel * 0.32;

                // Subtle refracted caustics in deep emerald water
                col += vec3(0.78, 0.94, 0.88) * caustics * (0.22 + 0.35 * channel);

                // Soft champagne mineral glints
                col += champagne * caustics * smoothstep(0.40, 0.90, eddy1 * 0.5 + 0.5) * 0.18 * channel;

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

    // 2A. Translucent Emerald Crystal (Icosahedron)
    const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x10b981),
        emissive: new THREE.Color(0x063124),
        emissiveIntensity: 0.65,
        roughness: 0.22,
        metalness: 0.15,
        transmission: 0.45,
        ior: 1.57,
        transparent: true,
        opacity: 0.85
    });
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 0), emeraldMat);
    icosahedron.position.set(-3.4, 1.6, -0.4);
    shapeGroup.add(icosahedron);
    shapes.push({ mesh: icosahedron, basePos: [-3.4, 1.6, -0.4], speed: 0.16, phase: 0 });

    // 2B. Polished Gold Octahedron
    const goldMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xdfbe72),
        emissive: new THREE.Color(0x5a4316),
        emissiveIntensity: 0.50,
        roughness: 0.20,
        metalness: 0.88,
        transparent: true,
        opacity: 0.80
    });
    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(1.45, 0), goldMat);
    octahedron.position.set(3.2, -1.4, -0.2);
    shapeGroup.add(octahedron);
    shapes.push({ mesh: octahedron, basePos: [3.2, -1.4, -0.2], speed: -0.18, phase: 1.57 });

    // 2C. Satin Jade Torus
    const jadeMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x34d399),
        emissive: new THREE.Color(0x04241a),
        emissiveIntensity: 0.45,
        roughness: 0.32,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
        transparent: true,
        opacity: 0.72
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.15, 16, 48), jadeMat);
    torus.position.set(0.4, 0.3, -0.7);
    shapeGroup.add(torus);
    shapes.push({ mesh: torus, basePos: [0.4, 0.3, -0.7], speed: 0.10, phase: 3.14 });

    // 2D. Champagne Dodecahedron
    const champMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfae8b4),
        emissive: new THREE.Color(0x524018),
        emissiveIntensity: 0.45,
        roughness: 0.26,
        metalness: 0.65,
        transparent: true,
        opacity: 0.75
    });
    const dodecahedron = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 0), champMat);
    dodecahedron.position.set(-1.8, -2.1, -0.1);
    shapeGroup.add(dodecahedron);
    shapes.push({ mesh: dodecahedron, basePos: [-1.8, -2.1, -0.1], speed: 0.20, phase: 4.71 });

    // =========================================================================
    // 3. Clear, High-Clarity Frosted Ice Sheet (MeshPhysicalMaterial at z = 0)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(4.5, 3.2);

    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf6fcf9),
        transmission: 0.97,           // High optical clarity revealing the background
        roughness: 0.42,              // Crisp frosted diffusion (clean frost without mud)
        ior: 1.309,                   // True physical index of refraction for natural water ice
        thickness: 1.8,               // Physical refraction volume
        metalness: 0.02,
        specularIntensity: 1.0,
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 0.70,              // Crisp, distinct physical ice glaze surface
        clearcoatRoughness: 0.18,     // Sharp surface reflection defining the ice plane
        attenuationColor: new THREE.Color(0x0a382a), // Pure emerald crystalline attenuation
        attenuationDistance: 8.0,     // Clear depth falloff
        normalMap,
        normalScale: new THREE.Vector2(0.36, 0.36),  // Distinct, discernible frost micro-texture
        bumpMap: normalMap,
        bumpScale: 0.015,
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Balanced Studio Lighting for Ice Clarity (NO BACKLIGHT)
    // =========================================================================
    // Clean emerald ambient fill
    const ambientLight = new THREE.AmbientLight(0x0c382b, 0.75);
    scene.add(ambientLight);

    // Crisp directional light catching frost facets across the surface
    const iceGrazeLight = new THREE.DirectionalLight(0xd4f6ed, 0.65);
    iceGrazeLight.position.set(-2.0, 4.0, 3.0);
    scene.add(iceGrazeLight);

    // Warm champagne rim light bringing out depth
    const rimLight = new THREE.DirectionalLight(0xf5e6be, 0.35);
    rimLight.position.set(3.0, -2.5, 2.5);
    scene.add(rimLight);

    // ZERO cursor backlight (completely removed per user command)

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
