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

function createSolarSystem(sunLocation = new Vector3(0, 0, 0)) {
    const planets = [];

    const textureLoader = new TextureLoader();
    // TODO: Get a sun texture downloaded or made!
    const sunTexture = textureLoader.load('./assets/img/about.png');
    const aboutTexture = textureLoader.load('./assets/img/about.png');
    const linkedInTexture = textureLoader.load('./assets/img/linkedin.png');
    const githubTexture = textureLoader.load('./assets/img/github.png');

    // Sun
    const sunSettings = new SunSettings(sunLocation, 0.001);
    const sun = new Sun(15, sunTexture, sunSettings);

    // About Me
    const aboutSettings = new PlanetSettings(20, sunLocation, 0.003, 0.03);
    const aboutPlanet = new Planet(3, aboutTexture, aboutSettings);
    planets.push(aboutPlanet);

    // LinkedIn
    const linkedInSettings = new PlanetSettings(30, sunLocation, 0.002, 0.02);
    const linkedInPlanet = new Planet(5, linkedInTexture, linkedInSettings);
    planets.push(linkedInPlanet);

    // Github
    const githubSettings = new PlanetSettings(50, sunLocation, 0.001, 0.01);
    const githubPlanet = new Planet(5.5, githubTexture, githubSettings);
    planets.push(githubPlanet);

    // TODO: Projects separate from github?
    // TODO: "Adobe" planet for resume?

    return {
        sun: sun,
        planets: planets,
        allBodies: [sun].concat(planets),
        orbits: planets.map(planet => planet.orbitPath)
    };
}

// TODO: Refactor much of this into its own class...
function main() {
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

    const system = createSolarSystem();
    scene.add(system.sun);
    system.planets.forEach(planet => { scene.add(planet.orbitObj); });
    system.orbits.forEach(orbit => { scene.add(orbit); });

    const cameraSettings = new CameraSettings(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
        new Vector3(0, 100, 200),
        0.02,
        0.03,
    );
    const camera = new TrackingCamera(system.sun.getWorldPosition(new Vector3()), cameraSettings);

    // POST-PROCESSING

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera);
    const fxaaShaderPass = new ShaderPass(FXAAShader);
    fxaaShaderPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

    composer.addPass(renderPass);
    composer.addPass(outlinePass);
    composer.addPass(fxaaShaderPass);

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

        const clickedObject = checkForMouseIntersection(system.allBodies);
        // TODO: Only track planets -- resetting comes through UI menu of some kind...
        // if (clickedObject != null && clickedObject instanceof Planet) {
        if (clickedObject != null) {
            if (clickedObject instanceof Planet) {
                camera.track(clickedObject);
                system.orbits.forEach(orbit => { orbit.visible = false; });
            } else {
                camera.reset();
                system.orbits.forEach(orbit => { orbit.visible = true; });
            }
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
    const TARGET_VFOV = 45;
    const TARGET_ASPECT_RATIO = 16 / 9;
    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            if (camera.aspect > TARGET_ASPECT_RATIO) {
                const height = Math.tan(MathUtils.degToRad(TARGET_VFOV / 2));
                const ratio = camera.aspect / TARGET_ASPECT_RATIO;
                const adjustedCameraHeight = height / ratio;
                const adjustedFov = MathUtils.radToDeg(Math.atan(adjustedCameraHeight)) * 2;
                camera.fov = adjustedFov;
            } else {
                camera.fov = TARGET_VFOV;
            }
            camera.updateProjectionMatrix();
        }

        system.allBodies.forEach(body => { body.update(); });

        camera.update();

        const hovered = checkForMouseIntersection(system.allBodies);
        if (hovered != null && hovered instanceof Planet) {
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

main();
