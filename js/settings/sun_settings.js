class SunSettings {
    constructor(name, location, rotationSpeed, widthSegments = 30, heightSegments = 30) {
        this.name = name;
        this.location = location;
        this.rotationSpeed = rotationSpeed;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }
}

export { SunSettings };