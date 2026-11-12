/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Option B: Heavy Frosted Glass + Thick Gradient Stripes + Behind-Glass Refracted Prism Beam
 * (No grid overlay; center text stays dark & crisp)
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

    function getFrustumSizeAtZ(zPlane) {
        const dist = camera.position.z - zPlane;
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFov / 2) * dist;
        const width = height * camera.aspect;
        return { width, height };
    }

    // =========================================================================
    // 1. Background Environment: Thick Gradient Stripes + Behind-Glass Prism Beam (Option B)
    // =========================================================================
    const bgZ = -1.5;
    const bgGeo = new THREE.PlaneGeometry(1, 1);
    const bgUniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uActiveSide: { value: 1.0 },
        uLightY: { value: 0.55 },
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
            uniform float uActiveSide;
            uniform float uLightY;
            uniform vec2 uResolution;

            void main() {
                vec2 p = vUv;

                vec3 baseNoir = vec3(0.0118, 0.0706, 0.0549);      // #03120e
                vec3 deepEmerald = vec3(0.0235, 0.1451, 0.1137);   // #06251d
                vec3 royalEmerald = vec3(0.0510, 0.3059, 0.2314);  // #0d4e3b
                vec3 brightEmerald = vec3(0.0627, 0.7255, 0.5059); // #10b981
                vec3 champagne = vec3(0.8863, 0.7608, 0.4588);     // #e2c275
                vec3 warmGold = vec3(0.9804, 0.9098, 0.7059);      // #fae8b4

                // Thick monumental diagonal gradient stripes
                float stripeCoord = (p.x * 0.94 + p.y * 0.34) * 3.0 + uTime * 0.04 + uScroll * 0.00022;
                float thickBand = sin(stripeCoord * 3.14159265) * 0.5 + 0.5;
                float bandCurve = smoothstep(0.15, 0.85, thickBand);

                float edgeMask = smoothstep(0.16, 0.48, abs(p.x - 0.5));

                vec3 col = mix(baseNoir, deepEmerald, bandCurve * 0.92);
                col = mix(col, royalEmerald, pow(bandCurve, 1.7) * (0.45 + 0.48 * edgeMask));

                // -------------------------------------------------------------
                // Option B: Behind-Glass Refracted Diagonal Prism Beam
                // Cursor & scroll smoothly tilt/glide the volumetric caustic beam
                // through the thick stripes along the outer empty margins.
                // -------------------------------------------------------------
                float targetX = mix(0.14, 0.86, clamp(uActiveSide * 0.5 + 0.5, 0.0, 1.0));
                float targetY = clamp(uLightY, 0.16, 0.84);

                // Beam tilts subtly with vertical cursor/scroll state
                float tilt = mix(-0.42, 0.42, targetY);
                vec2 rel = p - vec2(targetX, targetY);
                float beamAxis = rel.x * cos(tilt) - rel.y * sin(tilt);
                float beamAlong = rel.x * sin(tilt) + rel.y * cos(tilt);

                // Wide volumetric caustic core + secondary refraction halo
                float beamCore = exp(-pow(beamAxis / 0.16, 2.0)) * exp(-pow(beamAlong / 0.65, 2.0));
                float beamWide = exp(-pow(beamAxis / 0.30, 2.0)) * exp(-pow(beamAlong / 0.85, 2.0));

                // Amplify caustics where thick stripes intersect the prism beam, attenuated in center text zone
                float causticIntensity = (0.45 + 0.85 * bandCurve) * (0.18 + 0.82 * edgeMask);

                col += mix(brightEmerald, warmGold, 0.72) * beamCore * causticIntensity * 0.95;
                col += mix(royalEmerald, champagne, 0.45) * beamWide * causticIntensity * 0.38;

                // Subtle balancing emerald caustic on opposite margin
                float oppX = 1.0 - targetX;
                float oppY = 1.0 - targetY;
                float oppGlow = exp(-pow((p.x - oppX) / 0.18, 2.0)) * exp(-pow((p.y - oppY) / 0.45, 2.0));
                col += brightEmerald * oppGlow * (0.35 + 0.65 * bandCurve) * 0.32;

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Heavy Frosted Surface Micro-Texture (Normal Map via TextureLoader)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(4.5, 3);

    // =========================================================================
    // 3. Heavy Frosted Glass Shader (MeshPhysicalMaterial on Full-Screen PlaneGeometry)
    // =========================================================================
    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x9bd2be),
        transmission: 0.96,
        roughness: 0.72,
        ior: 1.52,
        thickness: 1.35,
        metalness: 0.02,
        clearcoat: 0.08,
        clearcoatRoughness: 0.75,
        attenuationColor: new THREE.Color(0x05241a),
        attenuationDistance: 9.0,
        normalMap,
        normalScale: new THREE.Vector2(0.24, 0.24),
        transparent: true,
        opacity: 1.0
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Gentle Edge Micro-Sheen Lighting (Main caustic is behind the glass)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0c382a, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 0.20);
    dirLight.position.set(-5, 4, 4);
    scene.add(dirLight);

    const cursorLight = new THREE.PointLight(0xf6dfa6, 2.8, 22, 1.8);
    cursorLight.position.set(5.0, 0.5, 4.4);
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
    // 6. Fluid Empty-Margin Prism Beam Tracking & Scroll Glide
    // =========================================================================
    const targetNDC = { x: 0.88, y: 0.15 };
    const currentNDC = { x: 0.88, y: 0.15 };
    let targetSide = 1.0;
    let currentSide = 1.0;
    let smoothScrollY = window.scrollY || 0;
    let targetScrollY = smoothScrollY;

    function projectToEmptySide(ndcX) {
        const sign = ndcX >= 0 ? 1 : -1;
        const mag = Math.min(1, Math.abs(ndcX));
        return sign * (0.80 + mag * 0.14);
    }

    window.addEventListener('mousemove', (event) => {
        const rawX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        const rawY = -(event.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
        targetNDC.x = projectToEmptySide(rawX);
        targetNDC.y = rawY * 0.78;
        targetSide = rawX >= 0 ? 1.0 : -1.0;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY || 0;
        const scrollPhase = targetScrollY * 0.0032;
        targetNDC.y = Math.sin(scrollPhase) * 0.68;
        const sideWave = Math.cos(targetScrollY * 0.0016);
        targetSide = sideWave >= 0 ? 1.0 : -1.0;
        targetNDC.x = targetSide * (0.82 + 0.12 * Math.abs(sideWave));
    }, { passive: true });

    // =========================================================================
    // 7. Smooth Frame-Rate Independent Animation Loop
    // =========================================================================
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;

        const posEase = 1 - Math.exp(-3.6 * dt);
        const sideEase = 1 - Math.exp(-2.8 * dt);
        const scrollEase = 1 - Math.exp(-4.5 * dt);

        smoothScrollY += (targetScrollY - smoothScrollY) * scrollEase;
        currentSide += (targetSide - currentSide) * sideEase;
        currentNDC.x += (targetNDC.x - currentNDC.x) * posEase;
        currentNDC.y += (targetNDC.y - currentNDC.y) * posEase;

        const safeNDCX = Math.abs(currentNDC.x) < 0.76
            ? (currentNDC.x >= 0 ? 0.76 : -0.76)
            : currentNDC.x;

        bgUniforms.uTime.value = elapsed;
        bgUniforms.uScroll.value = smoothScrollY;
        bgUniforms.uActiveSide.value = currentSide;
        bgUniforms.uLightY.value = currentNDC.y * 0.5 + 0.5;

        const worldX = safeNDCX * (frustumAtGlass.width * 0.5);
        const worldY = currentNDC.y * (frustumAtGlass.height * 0.5);
        cursorLight.position.set(worldX, worldY, 4.4);

        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: false,
            mouseNDC: { x: safeNDCX, y: currentNDC.y },
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
