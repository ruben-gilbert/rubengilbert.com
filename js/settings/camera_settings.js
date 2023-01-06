class CameraSettings {
    constructor(fov, aspect, near, far, position, lerpSpeed, slerpSpeed) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.initialPosition = position;
        this.lerpSpeed = lerpSpeed;
        this.slerpSpeed = slerpSpeed;
    }
}

export { CameraSettings };