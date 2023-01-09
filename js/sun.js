import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

class Sun extends Mesh {
    constructor(radius, texture, settings) {
        const geometry = new SphereGeometry(radius, settings.widthSegments, settings.heightSegments);
        const material = new MeshBasicMaterial({ map: texture });
        super(geometry, material);

        this.name = settings.name;
        this.radius = radius;
        this.texture = texture;
        this.settings = settings;
    }

    update() {
        this.rotateY(this.settings.rotationSpeed);
    }
}

export { Sun };