/**
 * Ramyachandra Gunasekera Chambers — Staging (next.ramyachandrachambers.com)
 * Original First Frosted Glass (smooth, uncracked) + Hyper-Realistic Natural Flowing Stream
 * Physical Transmission blur, organic river thalweg, Voronoi/wave caustics, riverbed depth & zero backlight.
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
    // 1. Hyper-Realistic Natural Flowing Stream Shader (Beneath Frost at z = -1.5)
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

            // Fast pseudo-hash for riverbed pebbles / texture
            float hash12(vec2 p) {
                vec3 p3  = fract(vec3(p.xyx) * 0.1031);
                p3 += dot(p3, p3.yzx + 33.33);
                return fract((p3.x + p3.y) * p3.z);
            }

            void main() {
                vec2 p = vUv;

                // Natural meandering river thalweg (curving river centerline)
                float meander1 = sin(p.y * 2.1 + 0.3) * 0.19;
                float meander2 = sin(p.y * 4.4 - 0.4) * 0.08;
                float riverCenter = 0.5 + meander1 + meander2;
                float distToCenter = abs(p.x - riverCenter);

                // River channel cross-section profile: deep center channel, shallow banks
                float channelWidth = 0.48;
                float channel = smoothstep(channelWidth, 0.04, distToCenter);
                float riverBedDepth = channel * (0.65 + 0.35 * sin(p.y * 3.0 + 1.2));

                // Natural velocity gradient: fast current in deep channel, slow near banks
                float currentSpeed = mix(0.08, 0.16, channel);
                float scrollOffset = uScroll * 0.00022;
                float flowTime = uTime * currentSpeed + scrollOffset;

                // Streamline coordinates following the curving river
                vec2 streamUv = vec2((p.x - riverCenter) * 2.5, p.y * 2.4 - flowTime);

                // Centrifugal lateral current drift along river bends
                float bendCurvature = cos(p.y * 2.1 + 0.3) * 0.14;
                streamUv.x += bendCurvature;

                // Fluid eddies & harmonic turbulence
                float eddy1 = sin(streamUv.x * 3.8 + streamUv.y * 2.4 + uTime * 0.40) * 0.5
                            + cos(streamUv.x * 2.4 - streamUv.y * 4.2 - uTime * 0.30) * 0.5;
                float eddy2 = cos(streamUv.x * 5.2 - streamUv.y * 3.1 + uTime * 0.50) * 0.5
                            + sin(streamUv.x * 3.6 + streamUv.y * 5.6 - uTime * 0.35) * 0.5;

                // Flowing water coordinate layers with micro-vortices
                vec2 flowLayer1 = streamUv * 2.4 + vec2(eddy1 * 0.18, -flowTime * 0.6);
                vec2 flowLayer2 = streamUv * 3.8 + vec2(-eddy2 * 0.14, -flowTime * 1.1);

                // 1. Organic water caustics: dancing liquid light nets refracted by moving waves
                float cWave1 = sin(flowLayer1.x * 4.2 + sin(flowLayer1.y * 3.6 + uTime * 0.75))
                             + cos(flowLayer1.y * 4.0 + cos(flowLayer1.x * 3.2 - uTime * 0.65));
                float cWave2 = sin(flowLayer2.x * 5.4 - sin(flowLayer2.y * 4.2 - uTime * 0.85))
                             + cos(flowLayer2.y * 5.0 + cos(flowLayer2.x * 4.8 + uTime * 0.60));

                float caustic1 = pow(1.0 - clamp(abs(cWave1 * 0.46), 0.0, 1.0), 3.4);
                float caustic2 = pow(1.0 - clamp(abs(cWave2 * 0.46), 0.0, 1.0), 3.6);
                float caustics = (caustic1 * 0.58 + caustic2 * 0.42) * (0.35 + 0.65 * channel);

                // 2. Capillary ripples & surface wave reflections
                float ripplePattern = sin(flowLayer1.y * 22.0 + eddy1 * 3.5) * cos(flowLayer1.x * 14.0 - eddy2 * 3.0);
                float surfaceRipples = smoothstep(0.40, 0.92, ripplePattern * 0.5 + 0.5) * (0.2 + 0.8 * channel);

                // 3. Subsurface riverbed stones visible through clear water
                vec2 pebbleUv = vec2(p.x * 16.0, p.y * 14.0 + meander1 * 2.0);
                float pebbles = hash12(floor(pebbleUv));
                float pebbleDetail = smoothstep(0.35, 0.75, sin(pebbles * 6.28 + length(fract(pebbleUv) - 0.5) * 5.0));

                // 4. Foam flecks & laminar flow shear filaments
                float foamShear = pow(abs(eddy1 - eddy2), 2.2);
                float foamFlecks = smoothstep(0.55, 0.90, sin(flowLayer2.y * 18.0 + flowLayer2.x * 8.0) * foamShear) * channel;

                // =====================================================================
                // Deep Imperial Emerald Noir Palette
                // =====================================================================
                vec3 bedrockColor   = vec3(0.0118, 0.0471, 0.0392); // #030c0a deep abyss riverbed
                vec3 pebbleShade    = vec3(0.0196, 0.0980, 0.0784); // #051914 riverbed stones
                vec3 deepWaterPool  = vec3(0.0235, 0.1412, 0.1098); // #06241c clear emerald pool
                vec3 rushingThalweg = vec3(0.0431, 0.2824, 0.2118); // #0b4836 main river current
                vec3 livingEmerald  = vec3(0.0627, 0.7255, 0.5059); // #10b981 emerald current illumination
                vec3 causticGlint   = vec3(0.8196, 0.9490, 0.8980); // #d1f2e5 pale crystalline seafoam
                vec3 champagneGlint = vec3(0.9216, 0.8235, 0.5490); // #ebd28c champagne mineral refraction

                // Layered natural fluid rendering
                vec3 riverbed = mix(bedrockColor, pebbleShade, pebbleDetail * 0.35);
                vec3 waterColor = mix(riverbed, deepWaterPool, riverBedDepth * 0.85);
                waterColor = mix(waterColor, rushingThalweg, channel * (0.40 + 0.60 * (eddy1 * 0.5 + 0.5)));

                // Living current threads
                float currentThreads = smoothstep(0.18, 0.82, (eddy1 * eddy2) * 0.5 + 0.5);
                waterColor += livingEmerald * currentThreads * channel * 0.34;

                // Dancing water caustics
                waterColor += causticGlint * caustics * (0.28 + 0.42 * riverBedDepth);

                // Surface capillary wave reflections & champagne sparkles
                waterColor += champagneGlint * surfaceRipples * caustics * 0.22 * channel;

                // Delicate water foam flecks along current shear
                waterColor += causticGlint * foamFlecks * 0.18;

                // Vignette for seamless editorial framing
                float vignette = smoothstep(0.98, 0.36, length(p - 0.5));
                waterColor *= (0.76 + 0.24 * vignette);

                gl_FragColor = vec4(waterColor, 1.0);
            }
        `
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = bgZ;
    scene.add(bgMesh);

    // =========================================================================
    // 2. First Frosted Glass Surface Micro-Texture (Smooth, Uncracked Normal Map)
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load('assets/frosted-normal.png');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(5.0, 3.0);

    // =========================================================================
    // 3. First Frosted Glass Material (MeshPhysicalMaterial with Pure Frosted Blur)
    // =========================================================================
    const glassGeo = new THREE.PlaneGeometry(1, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xeefcf6),
        transmission: 0.96,
        roughness: 0.62,
        ior: 1.50,
        thickness: 1.2,
        metalness: 0.04,
        clearcoat: 0.25,
        clearcoatRoughness: 0.42,
        attenuationColor: new THREE.Color(0x0b3d2e),
        attenuationDistance: 8.5,
        normalMap,
        normalScale: new THREE.Vector2(0.38, 0.38),
        bumpMap: normalMap,
        bumpScale: 0.015,
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

    const softDirectional = new THREE.DirectionalLight(0xb5e8d8, 0.38);
    softDirectional.position.set(0.6, 1.2, 2.4);
    scene.add(softDirectional);

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
