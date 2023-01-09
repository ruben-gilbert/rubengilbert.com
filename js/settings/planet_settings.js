class PlanetSettings {
    constructor(name, orbitRadius, orbitOrigin, orbitSpeed, rotationSpeed, widthSegments = 30, heightSegments = 30) {
        this.name = name;
        this.orbitRadius = orbitRadius;
        this.orbitOrigin = orbitOrigin;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }
}

export { PlanetSettings };