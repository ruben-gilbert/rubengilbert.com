class PlanetSettings {
    constructor(initialLocation, orbitLocation, orbitSpeed, rotationSpeed, widthSegments = 30, heightSegments = 30) {
        this.initialLocation = initialLocation;
        this.orbitLocation = orbitLocation;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }
}

export { PlanetSettings };