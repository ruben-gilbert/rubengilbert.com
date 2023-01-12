import { DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, RingGeometry, SphereGeometry } from 'three';

class Planet extends Mesh {
    constructor(texture, description, settings) {
        const geometry = new SphereGeometry(settings.radius, settings.widthSegments, settings.heightSegments);
        const material = new MeshStandardMaterial({ map: texture });
        super(geometry, material);

        this.name = settings.name;
        this.radius = settings.radius;
        this.description = description;
        this.texture = texture;
        this.settings = settings;

        const randAngle = Math.random() * (Math.PI * 2);
        const x = Math.cos(randAngle) * this.settings.orbitRadius;
        const z = Math.sin(randAngle) * this.settings.orbitRadius;
        this.position.set(x, 0, z);

        // TODO: Support orbits on altered planes...?  (i.e. rotate the orbitObj X oy Z)
        this.orbitObj = new Object3D();
        this.orbitObj.position.set(...this.settings.orbitOrigin);
        this.orbitObj.add(this);

        const orbitGeometry = new RingGeometry(this.settings.orbitRadius - 1.2, this.settings.orbitRadius, 150);
        const orbitMaterial = new MeshBasicMaterial({ color: 0x0657d1, transparent: true, opacity: 0.3 });
        orbitMaterial.side = DoubleSide;
        this.orbitPath = new Mesh(orbitGeometry, orbitMaterial);
        this.orbitPath.quaternion.copy(this.orbitObj.quaternion);
        this.orbitPath.rotateX(Math.PI / 2);    // Rings (BufferGeometry) are 90 degrees rotated from Object3D.

        // TODO: orbitPath needs to have correct position (if system isn't at 0,0,0)...
    }

    update() {
        this.orbitObj.rotateY(this.settings.orbitSpeed);
        this.rotateY(this.settings.rotationSpeed);
    }

    static async create(texture, settings) {
        const description = await Planet.fetchHTML(settings.htmlPath);
        return new Planet(texture, description, settings);
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

export { Planet };