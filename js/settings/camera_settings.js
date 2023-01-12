import { Vector3 } from "three";

class CameraSettings {
    constructor(targetFov, targetAspect, near, far, position, lerpSpeed, slerpSpeed) {
        this.targetFov = targetFov;
        this.targetAspect = targetAspect;
        this.near = near;
        this.far = far;
        this.initialPosition = position;
        this.lerpSpeed = lerpSpeed;
        this.slerpSpeed = slerpSpeed;
    }

    static fromJson(obj) {
        return new CameraSettings(
            obj.targetFov,
            obj.targetAspect,
            obj.near,
            obj.far,
            new Vector3(...obj.initialPosition),
            obj.lerpSpeed,
            obj.slerpSpeed
        );
    }
}

export { CameraSettings };