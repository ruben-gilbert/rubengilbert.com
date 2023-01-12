import {
    AmbientLight,
    MathUtils,
    PointLight,
    Raycaster,
    Scene,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { FXAAShader } from 'three/addons/shaders/FXAAShader';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import { Planet } from './planet.js';
import { Sun } from './sun.js';
import { TrackingCamera } from './camera.js';
import { CameraSettings } from './settings/camera_settings.js';
import { PlanetSettings } from './settings/planet_settings.js';
import { SunSettings } from './settings/sun_settings.js';

async function createSolarSystem(config) {
    const planets = [];
    const orbits = [];
    const textureLoader = new TextureLoader();

    const sunTexture = textureLoader.load(config.sun.texturePath);
    const sunSettings = SunSettings.fromJson(config.sun.settings);
    const sun = await Sun.create(sunTexture, sunSettings);

    for await (const planetConf of config.planets) {
        // Runtime patch the settings to orbit around wherever the Sun is.  Unlikely to ever need
        // planets orbiting something that is NOT the sun, but support it anyway :^).
        if (planetConf.orbitOrigin === undefined) {
            planetConf.settings.orbitOrigin = config.sun.settings.location;
        }
        const texture = textureLoader.load(planetConf.texturePath);
        const settings = PlanetSettings.fromJson(planetConf.settings);
        const planet = await Planet.create(texture, settings);
        planets.push(planet);
        orbits.push(planet.orbitPath);
    };

    return {
        sun: sun,
        planets: planets,
        allBodies: [sun].concat(planets),
        orbits: orbits
    };
}

// TODO: Refactor much of this into its own class...
async function main() {
    const canvas = document.querySelector('#mainCanvas');
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onMouseClick);
    const renderer = new WebGLRenderer({ canvas, antialias: true });
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    const scene = new Scene();
    const bgLoader = new TextureLoader();
    const bgTexture = bgLoader.load("./assets/img/stars.jpg");
    scene.background = bgTexture;

    const lights = [];
    const pointLight = new PointLight(0xFFFFFF, 1.5);
    const ambientLight = new AmbientLight(0xFFFFFF, 0.2);
    lights.push(pointLight);
    lights.push(ambientLight);
    lights.forEach(l => { scene.add(l); });

    const config = await fetch("../config/default.json")
        .then(response => response.json());
    const system = await createSolarSystem(config);
    scene.add(system.sun);
    system.planets.forEach(planet => { scene.add(planet.orbitObj); });
    system.orbits.forEach(orbit => { scene.add(orbit); });

    const cameraSettings = CameraSettings.fromJson(config.camera);
    const camera = new TrackingCamera(system.sun.getWorldPosition(new Vector3()), cameraSettings);
    updateLocationName();

    // POST-PROCESSING

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera);
    const fxaaShaderPass = new ShaderPass(FXAAShader);
    fxaaShaderPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

    composer.addPass(renderPass);
    composer.addPass(outlinePass);
    composer.addPass(fxaaShaderPass);

    function updateLocationName() {
        const locationDiv = document.getElementsByClassName("locationOverlay")[0];
        if (camera.currentTrackedObj == null) {
            locationDiv.innerHTML = "Ruben<br>Gilbert";
        } else {
            locationDiv.innerHTML = `${camera.currentTrackedObj.name}`
        }
    }

    function updateSimpleOverlay() {
        const simpleDiv = document.getElementsByClassName("instructions")[0];
        if (camera.currentTrackedObj == null) {
            simpleDiv.classList.remove("hideHorizontal");
            simpleDiv.classList.add("showHorizontal");
        } else {
            simpleDiv.classList.add("hideHorizontal");
            simpleDiv.classList.remove("showHorizontal");
        }
    }

    function updateDescription() {
        const descriptionDiv = document.getElementsByClassName("description")[0];
        if (camera.currentTrackedObj == null) {
            descriptionDiv.classList.remove("showVertical");
            descriptionDiv.classList.add("hideVertical");
            descriptionDiv.innerHTML = "";
        } else {
            descriptionDiv.innerHTML = camera.currentTrackedObj.description;
            descriptionDiv.classList.add("showVertical");
            descriptionDiv.classList.remove("hideVertical");
        }
    }

    // EVENT HANDLING

    function onMouseMove(event) {
        // Calculate (x,y) in normalized devices coordinates between -1 and 1.
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function onMouseClick(event) {
        // Calculate (x,y) in normalized devices coordinates between -1 and 1.
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        let trackingChange = false;
        const clickedObject = checkForMouseIntersection(system.allBodies);
        if (clickedObject != null) {
            trackingChange = camera.track(clickedObject);
            system.orbits.forEach(orbit => { orbit.visible = false; });
        } else {
            trackingChange = camera.reset();
            system.orbits.forEach(orbit => { orbit.visible = true; });
        }

        if (trackingChange) {
            updateLocationName();
            updateSimpleOverlay();
            updateDescription();
        }
    }

    function checkForMouseIntersection(objects) {
        raycaster.setFromCamera(mouse, camera);
        const intersected = raycaster.intersectObjects(objects);

        if (intersected.length > 0) {
            return intersected[0].object;
        } else {
            return null;
        }
    }

    // RENDERING

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            if (camera.aspect > camera.settings.targetAspect) {
                const height = Math.tan(MathUtils.degToRad(camera.settings.targetFov / 2));
                const ratio = camera.aspect / camera.settings.targetAspect;
                const adjustedCameraHeight = height / ratio;
                const adjustedFov = MathUtils.radToDeg(Math.atan(adjustedCameraHeight)) * 2;
                camera.fov = adjustedFov;
            } else {
                camera.fov = camera.settings.targetFov;
            }
            camera.updateProjectionMatrix();
        }

        system.allBodies.forEach(body => { body.update(); });

        camera.update();

        // Only show hover border if we aren't tracking something.
        const hovered = camera.currentTrackedObj == null ? checkForMouseIntersection(system.allBodies) : null;
        if (hovered != null) {
            outlinePass.selectedObjects = [hovered];
        } else {
            outlinePass.selectedObjects = [];
        }

        composer.render();

        requestAnimationFrame(render);
    }

    function resizeRendererToDisplaySize() {
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;

        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
            composer.setSize(width, height, false);
            fxaaShaderPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        }
        return needResize;
    }

    requestAnimationFrame(render);
}

await main();
