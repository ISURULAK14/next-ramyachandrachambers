/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Three.js Transmissive Frosted Glass Background + Uniform Grid + Dynamic Cursor Light
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

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    // Helper: compute exact world-space frustum width & height at a given Z plane
    function getFrustumSizeAtZ(zPlane) {
        const dist = camera.position.z - zPlane;
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFov / 2) * dist;
        const width = height * camera.aspect;
        return { width, height };
    }

    // =========================================================================
    // 1. Background Environment Layer (Preserved Emerald Colors & Geometric Shapes)
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
            void main() {
                vec2 p = vUv;
                vec3 baseNoir = vec3(0.0118, 0.0706, 0.0549);      // #03120e
                vec3 deepEmerald = vec3(0.0196, 0.1569, 0.1216);   // #05281f
                vec3 royalEmerald = vec3(0.0431, 0.2392, 0.1804);  // #0b3d2e
                vec3 champagneGlow = vec3(0.886, 0.761, 0.459);    // #e2c275

                float drift1 = sin(uTime * 0.25) * 0.05;
                float drift2 = cos(uTime * 0.20) * 0.05;

                float d1 = length(p - vec2(0.18 + drift1, 0.85));
                float d2 = length(p - vec2(0.86 - drift2, 0.22));
                float d3 = length(p - vec2(0.50, 0.50 + drift1 * 0.6));

                vec3 col = baseNoir;
                col = mix(col, royalEmerald, smoothstep(0.95, 0.05, d1) * 0.90);
                col = mix(col, deepEmerald, smoothstep(0.90, 0.05, d2) * 0.85);
                col += royalEmerald * smoothstep(0.75, 0.0, d3) * 0.35;
                col += champagneGlow * smoothstep(0.55, 0.0, length(p - vec2(0.24, 0.78))) * 0.10;
                col += champagneGlow * smoothstep(0.50, 0.0, length(p - vec2(0.78, 0.28))) * 0.08;

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // Preserved underlying geometric shapes behind the transmissive glass layer
    const shapeGroup = new THREE.Group();
    shapeGroup.position.z = -0.95;
    scene.add(shapeGroup);

    const shapes = [];
    const shapeSpecs = [
        { geo: new THREE.IcosahedronGeometry(1.95, 0), color: 0x10b981, emissive: 0x0f7655, pos: [-3.2, 1.4, -0.25], speed: 0.18, opacity: 0.88 },
        { geo: new THREE.OctahedronGeometry(1.65, 0), color: 0xe2c275, emissive: 0xb88d3b, pos: [3.1, -1.2, -0.15], speed: -0.22, opacity: 0.82 },
        { geo: new THREE.TorusGeometry(2.25, 0.22, 18, 56), color: 0x34d399, emissive: 0x0b533d, pos: [0.2, 0.15, -0.45], speed: 0.12, opacity: 0.78 },
        { geo: new THREE.DodecahedronGeometry(1.35, 0), color: 0xf4d08a, emissive: 0x9c7628, pos: [-1.7, -1.9, -0.1], speed: 0.24, opacity: 0.78 }
    ];

    shapeSpecs.forEach((spec, i) => {
        const mat = new THREE.MeshStandardMaterial({
            color: spec.color,
            emissive: spec.emissive,
            emissiveIntensity: 1.15,
            roughness: 0.28,
            metalness: 0.35,
            transparent: true,
            opacity: spec.opacity
        });
        const mesh = new THREE.Mesh(spec.geo, mat);
        mesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);

        shapeGroup.add(mesh);
        shapes.push({ mesh, basePos: [...spec.pos], speed: spec.speed, phase: i * 1.4 });
    });

    // =========================================================================
    // 2. Surface Displacement (Normal Map via THREE.TextureLoader)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(5, 3);

    // =========================================================================
    // 3. Frosted Glass Shader (MeshPhysicalMaterial on Full-Screen PlaneGeometry)
    // =========================================================================
    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x9bd4bf),
        transmission: 0.96,
        roughness: 0.46,
        ior: 1.5,
        thickness: 1.0,
        metalness: 0.02,
        clearcoat: 0.1,
        clearcoatRoughness: 0.6,
        attenuationColor: new THREE.Color(0x06291e),
        attenuationDistance: 9.0,
        normalMap,
        normalScale: new THREE.Vector2(0.35, 0.35),
        bumpMap: normalMap,
        bumpScale: 0.012,
        transparent: true,
        opacity: 1.0
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Distinct, Fine, Uniform Screen-Space Grid Overlay
    // =========================================================================
    const gridGeo = new THREE.PlaneGeometry(1, 1);
    const gridUniforms = {
        uGridSize: { value: 44.0 },
        uLineColor: { value: new THREE.Color(0xe2c275) },
        uAccentColor: { value: new THREE.Color(0x34d399) }
    };
    const gridMat = new THREE.ShaderMaterial({
        uniforms: gridUniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uGridSize;
            uniform vec3 uLineColor;
            uniform vec3 uAccentColor;
            void main() {
                vec2 coord = gl_FragCoord.xy / uGridSize;
                vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
                float line = min(grid.x, grid.y);
                float minorAlpha = (1.0 - min(line, 1.0)) * 0.085;

                // Subtle major intersection crosshairs every 4 cells
                vec2 majorCoord = gl_FragCoord.xy / (uGridSize * 4.0);
                vec2 majorGrid = abs(fract(majorCoord - 0.5) - 0.5) / fwidth(majorCoord);
                float majorLine = min(majorGrid.x, majorGrid.y);
                float majorAlpha = (1.0 - min(majorLine, 1.0)) * 0.065;

                vec3 color = mix(uAccentColor, uLineColor, 0.65);
                float alpha = clamp(minorAlpha + majorAlpha, 0.0, 0.14);
                gl_FragColor = vec4(color, alpha);
            }
        `
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.position.z = 0.02;
    scene.add(gridMesh);

    // =========================================================================
    // 5. Dynamic Lighting In Front of the Glass Plane
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x104536, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 0.55);
    dirLight.position.set(-4, 5, 4);
    scene.add(dirLight);

    const cursorLight = new THREE.PointLight(0xd4b978, 3.8, 18, 1.85);
    cursorLight.position.set(0, 0, 3.2);
    scene.add(cursorLight);

    // =========================================================================
    // 6. Responsive Frustum Scaling & Resize Handler
    // =========================================================================
    let frustumAtGlass = getFrustumSizeAtZ(0);

    function handleResize() {
        const w = window.innerWidth;
        const h = Math.max(1, window.innerHeight);

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);

        bgUniforms.uResolution.value.set(w, h);

        const bgFrustum = getFrustumSizeAtZ(bgZ);
        bgMesh.scale.set(bgFrustum.width * 1.02, bgFrustum.height * 1.02, 1);

        frustumAtGlass = getFrustumSizeAtZ(0);
        glassMesh.scale.set(frustumAtGlass.width * 1.02, frustumAtGlass.height * 1.02, 1);

        const gridFrustum = getFrustumSizeAtZ(0.02);
        gridMesh.scale.set(gridFrustum.width * 1.02, gridFrustum.height * 1.02, 1);

        normalMap.repeat.set(Math.max(2, (w / 320)), Math.max(2, (h / 320)));
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // =========================================================================
    // 7. Interactivity: Normalized Cursor Tracking (-1 to +1)
    // =========================================================================
    const mouse = { x: 0, y: 0 };
    const currentLight = { x: 0, y: 0 };

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        mouse.y = -(event.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
    }, { passive: true });

    // =========================================================================
    // 8. Animation Loop (requestAnimationFrame)
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
        currentLight.x += (targetX - currentLight.x) * 0.12;
        currentLight.y += (targetY - currentLight.y) * 0.12;
        cursorLight.position.set(currentLight.x, currentLight.y, 3.2);

        // Gentle drift for underlying geometric shapes behind the glass
        if (!prefersReducedMotion) {
            shapes.forEach((item) => {
                item.mesh.rotation.x += 0.0022 * item.speed * 4;
                item.mesh.rotation.y += 0.0031 * item.speed * 4;
                item.mesh.position.y = item.basePos[1] + Math.sin(elapsed * 0.45 + item.phase) * 0.35;
            });
        }

        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: Boolean(gridMesh.visible),
            mouseNDC: { x: mouse.x, y: mouse.y },
            lightPos: { x: cursorLight.position.x, y: cursorLight.position.y, z: cursorLight.position.z }
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
