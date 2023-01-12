import { Vector3 } from "three";

class PlanetSettings {
    constructor(name, htmlPath, radius, orbitRadius, orbitOrigin, orbitSpeed, rotationSpeed, widthSegments = 30, heightSegments = 30) {
        this.name = name;
        this.htmlPath = htmlPath;
        this.radius = radius;
        this.orbitRadius = orbitRadius;
        this.orbitOrigin = orbitOrigin;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }

    static fromJson(obj) {
        return new PlanetSettings(
            obj.name,
            obj.htmlPath,
            obj.radius,
            obj.orbitRadius,
            new Vector3(...obj.orbitOrigin),
            obj.orbitSpeed,
            obj.rotationSpeed,
            obj.widthSegments,
            obj.heightSegments
        )
    }
}

export { PlanetSettings };