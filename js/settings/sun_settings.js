import { Vector3 } from "three";

class SunSettings {
    constructor(name, htmlPath, radius, location, rotationSpeed, widthSegments = 30, heightSegments = 30) {
        this.name = name;
        this.htmlPath = htmlPath;
        this.radius = radius;
        this.location = location;
        this.rotationSpeed = rotationSpeed;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }

    static fromJson(obj) {
        return new SunSettings(
            obj.name,
            obj.htmlPath,
            obj.radius,
            new Vector3(...obj.location),
            obj.rotationSpeed,
            obj.widthSegments,
            obj.heightSegments
        );
    }
}

export { SunSettings };