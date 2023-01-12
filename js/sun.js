import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

class Sun extends Mesh {
    constructor(texture, description, settings) {
        const geometry = new SphereGeometry(settings.radius, settings.widthSegments, settings.heightSegments);
        const material = new MeshBasicMaterial({ map: texture });
        super(geometry, material);

        this.position.set(...settings.location);

        this.name = settings.name;
        this.radius = settings.radius;
        this.description = description;
        this.texture = texture;
        this.settings = settings;
    }

    update() {
        this.rotateY(this.settings.rotationSpeed);
    }

    static async create(texture, settings) {
        const description = await Sun.fetchHTML(settings.htmlPath);
        return new Sun(texture, description, settings);
    }

    static async fetchHTML(path) {
        try {
            const response = await fetch(path);
            return response.text();
        } catch (error) {
            console.error(`Could not load ${path}.`);
        }
    }
}

export { Sun };