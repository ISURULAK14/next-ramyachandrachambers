/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Frosted Ice Sheet + Realistic Natural Flowing Stream (Three.js WebGL)
 * High-performance analytical stream dynamics (dual wave interference caustics,
 * meandering current, capillary ripples, physical ice sheet refraction, zero backlight).
 */
import * as THREE from './vendor/three.module.js';

(function initFrostedIceStream() {
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
    // 1. Realistic Natural Flowing Stream Shader (Beneath the Ice Sheet at z = -1.5)
    // =========================================================================
    const bgZ = -1.5;
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

                // Natural meandering stream channel topology
                float meander = sin(p.y * 2.2 + 0.35) * 0.18 + sin(p.y * 4.8 - 0.5) * 0.07;
                float channelDist = abs(p.x - 0.5 - meander);

                // Hydrodynamic flow velocity (natural downstream current + scroll glide)
                float flowSpeed = 0.12;
                float scrollOffset = uScroll * 0.00024;
                float streamTime = uTime * flowSpeed + scrollOffset;

                // Dual-octave flowing coordinates with lateral meandering drift
                vec2 flowUv1 = vec2(p.x * 2.6 + sin(p.y * 2.8 + streamTime * 2.5) * 0.12, p.y * 2.1 - streamTime);
                vec2 flowUv2 = vec2(p.x * 3.8 - cos(p.y * 3.4 - streamTime * 2.0) * 0.10, p.y * 3.2 - streamTime * 1.35);

                // Fluid eddies & harmonic turbulence
                float turb1 = sin(flowUv1.x * 4.2 + flowUv1.y * 3.1 + uTime * 0.45) * 0.5
                            + cos(flowUv1.x * 2.8 - flowUv1.y * 4.6 - uTime * 0.35) * 0.5;
                float turb2 = cos(flowUv2.x * 5.4 - flowUv2.y * 2.8 + uTime * 0.55) * 0.5
                            + sin(flowUv2.x * 3.2 + flowUv2.y * 5.1 - uTime * 0.40) * 0.5;

                // Analytical water caustics (dancing liquid filament nets without loop overhead)
                vec2 cUv1 = flowUv1 * 5.5 + turb1 * 0.65;
                vec2 cUv2 = flowUv2 * 7.2 - turb2 * 0.55;

                float w1 = sin(cUv1.x + sin(cUv1.y + uTime * 0.8)) + cos(cUv1.y * 1.25 + cos(cUv1.x * 0.95 - uTime * 0.7));
                float w2 = sin(cUv2.x * 1.2 - sin(cUv2.y * 0.85 - uTime * 0.9)) + cos(cUv2.y + cos(cUv2.x * 1.1 + uTime * 0.65));

                float causticNet = pow(1.0 - clamp(abs(w1 * 0.48), 0.0, 1.0), 3.2) * 0.6
                                 + pow(1.0 - clamp(abs(w2 * 0.48), 0.0, 1.0), 3.5) * 0.5;

                // Capillary wave ripples along flow vectors
                float rippleWave = sin(flowUv1.y * 24.0 + turb1 * 4.0) * cos(flowUv1.x * 16.0 - turb2 * 3.5);
                float ripples = smoothstep(0.42, 0.94, rippleWave * 0.5 + 0.5);

                // Deep Imperial Emerald Noir Palette
                vec3 bedrockColor   = vec3(0.0118, 0.0549, 0.0431); // #030e0b deep abyss bedrock
                vec3 deepWater      = vec3(0.0235, 0.1373, 0.1059); // #06231b deep water pool
                vec3 channelCurrent = vec3(0.0392, 0.2588, 0.1961); // #0a4232 rushing main current
                vec3 emeraldLight   = vec3(0.0627, 0.7255, 0.5059); // #10b981 emerald current glow
                vec3 causticsFoam   = vec3(0.7843, 0.9412, 0.8824); // #c8f0e1 crystalline pale seafoam
                vec3 champagneGlint = vec3(0.8863, 0.7608, 0.4588); // #e2c275 subtle mineral refraction

                // Stream channel depth attenuation
                float channelIntensity = smoothstep(0.52, 0.05, channelDist);

                // Base liquid layering
                vec3 col = mix(bedrockColor, deepWater, 0.65 + 0.35 * channelIntensity);
                col = mix(col, channelCurrent, channelIntensity * (0.45 + 0.55 * (turb1 * 0.5 + 0.5)));

                // Living emerald current flow threads
                float currentThreads = smoothstep(0.20, 0.80, (turb1 * turb2) * 0.5 + 0.5);
                col += emeraldLight * currentThreads * channelIntensity * 0.35;

                // Refracted liquid water caustics
                col += causticsFoam * causticNet * (0.24 + 0.38 * channelIntensity);

                // Fine capillary ripple glints
                col += champagneGlint * ripples * causticNet * 0.20 * channelIntensity;

                // Soft vignette framing
                float vignette = smoothstep(0.98, 0.38, length(p - 0.5));
                col *= (0.78 + 0.22 * vignette);

                gl_FragColor = vec4(col, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. Frosted Ice Sheet Surface Micro-Texture (Normal Map via TextureLoader)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(4.0, 3.0);

    // =========================================================================
    // 3. Frosted Ice Sheet Material (MeshPhysicalMaterial on Full-Screen PlaneGeometry)
    // =========================================================================
    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x9bd8c8),
        transmission: 0.95,
        roughness: 0.66,
        ior: 1.309,              // Physical index of refraction for natural water ice
        thickness: 1.8,
        metalness: 0.0,
        clearcoat: 0.14,
        clearcoatRoughness: 0.62,
        attenuationColor: new THREE.Color(0x042218),
        attenuationDistance: 7.5,
        normalMap,
        normalScale: new THREE.Vector2(0.25, 0.25),
        transparent: true,
        opacity: 1.0
    });

    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0;
    scene.add(glassMesh);

    // =========================================================================
    // 4. Balanced Ambient & Directional Lighting (NO BACKLIGHT)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0a2f23, 0.72);
    scene.add(ambientLight);

    const iceFacetLight = new THREE.DirectionalLight(0xb5e8d8, 0.38);
    iceFacetLight.position.set(0.6, 1.2, 2.4);
    scene.add(iceFacetLight);

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
    const clock = new THREE.Clock();
    let rafId = 0;

    function renderFrame() {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;

        const scrollEase = 1 - Math.exp(-4.5 * dt);
        smoothScrollY += (targetScrollY - smoothScrollY) * scrollEase;

        bgUniforms.uTime.value = elapsed;
        bgUniforms.uScroll.value = smoothScrollY;

        renderer.render(scene, camera);

        window.__rgFrostedGlass = {
            active: true,
            transmission: glassMat.transmission,
            roughness: glassMat.roughness,
            ior: glassMat.ior,
            hasNormalMap: Boolean(glassMat.normalMap),
            hasGridOverlay: false,
            hasFlowingStream: true,
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
