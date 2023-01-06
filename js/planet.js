import { Mesh, MeshStandardMaterial, Object3D, SphereGeometry } from 'three';

class Planet extends Mesh {
    constructor(radius, texture, settings) {
        const geometry = new SphereGeometry(radius, settings.widthSegments, settings.heightSegments);
        const material = new MeshStandardMaterial({ map: texture });
        super(geometry, material);
        this.position.set(...settings.initialLocation);

        this.radius = radius;
        this.texture = texture;
        this.settings = settings;

        this.orbitObj = new Object3D();
        this.orbitObj.position.set(...this.settings.orbitLocation);
        this.orbitObj.add(this);
    }

    update() {
        this.orbitObj.rotateY(this.settings.orbitSpeed);
        this.rotateY(this.settings.rotationSpeed);
    }
}

export { Planet };