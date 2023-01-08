import { Mesh, MeshStandardMaterial, Object3D, SphereGeometry } from 'three';

class Planet extends Mesh {
    constructor(radius, texture, settings) {
        const geometry = new SphereGeometry(radius, settings.widthSegments, settings.heightSegments);
        const material = new MeshStandardMaterial({ map: texture });
        super(geometry, material);

        this.radius = radius;
        this.texture = texture;
        this.settings = settings;

        const randAngle = Math.random() * (Math.PI * 2);
        const x = Math.cos(randAngle) * this.settings.orbitRadius;
        const z = Math.sin(randAngle) * this.settings.orbitRadius;
        this.position.set(x, 0, z);

        this.orbitObj = new Object3D();
        this.orbitObj.position.set(...this.settings.orbitOrigin);
        this.orbitObj.add(this);
    }

    update() {
        this.orbitObj.rotateY(this.settings.orbitSpeed);
        this.rotateY(this.settings.rotationSpeed);
    }
}

export { Planet };