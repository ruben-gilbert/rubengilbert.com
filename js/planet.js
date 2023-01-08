import { DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, RingGeometry, SphereGeometry } from 'three';

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

        // TODO: Support orbits on altered planes...?  (i.e. rotate the orbitObj X oy Z)
        this.orbitObj = new Object3D();
        this.orbitObj.position.set(...this.settings.orbitOrigin);
        this.orbitObj.add(this);

        const orbitGeometry = new RingGeometry(this.settings.orbitRadius - 0.5, this.settings.orbitRadius, 70);
        const orbitMaterial = new MeshBasicMaterial({ color: 0x14186 });
        orbitMaterial.side = DoubleSide;
        this.orbitPath = new Mesh(orbitGeometry, orbitMaterial);
        this.orbitPath.quaternion.copy(this.orbitObj.quaternion);
        this.orbitPath.rotateX(Math.PI / 2);    // Rings (BufferGeometry) are 90 degrees rotated from Object3D.
    }

    update() {
        this.orbitObj.rotateY(this.settings.orbitSpeed);
        this.rotateY(this.settings.rotationSpeed);
    }
}

export { Planet };