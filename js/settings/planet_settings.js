class PlanetSettings {
    constructor(orbitRadius, orbitOrigin, orbitSpeed, rotationSpeed, widthSegments = 30, heightSegments = 30) {
        this.orbitRadius = orbitRadius;
        this.orbitOrigin = orbitOrigin;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }
}

export { PlanetSettings };