import { MathUtils, PerspectiveCamera, Vector3 } from "three";

class TrackingCamera extends PerspectiveCamera {
    constructor(defaultLookAt, settings) {
        super(settings.fov, settings.aspect, settings.near, settings.far);
        this.settings = settings;

        this.position.set(...settings.initialPosition);
        this.targetPosition = settings.initialPosition;
        this.defaultLookAt = defaultLookAt;

        this.currentTrackedObj = null;
        this.currentTrackedObjWorldPos = new Vector3();
        this.trackDistance = 0;

        this.tracker = new PerspectiveCamera(
            this.settings.fov,
            this.settings.aspect,
            this.settings.near,
            this.settings.far
        );
        this.tracker.position.set(...this.position);
        this.tracker.lookAt(this.defaultLookAt);
        this.lookAt(this.defaultLookAt);
    }

    track(obj) {
        if (this.currentTrackedObj != null) {
            return;
        }

        this.currentTrackedObj = obj;
        const verticalFitDistance = (this.currentTrackedObj.radius * 2) / (2 * Math.tan(MathUtils.degToRad(this.fov / 2)));
        this.trackDistance = this.currentTrackedObj.radius + verticalFitDistance;

    }

    reset() {
        this.targetPosition = this.settings.initialPosition;
        this.currentTrackedObj = null;
        this.trackDistance = 0;
        this.tracker.position.set(...this.targetPosition);
        this.tracker.lookAt(this.defaultLookAt);
    }

    update() {
        if (this.currentTrackedObj != null) {
            this.currentTrackedObj.getWorldPosition(this.currentTrackedObjWorldPos);
            this.targetPosition = this.currentTrackedObjWorldPos
                .clone()
                .add(new Vector3(0, 0, this.trackDistance));

            this.tracker.position.lerp(this.targetPosition, this.settings.lerpSpeed);
            this.tracker.lookAt(this.currentTrackedObjWorldPos);
        }

        this.position.lerp(this.targetPosition, this.settings.lerpSpeed);
        this.quaternion.slerp(this.tracker.quaternion, this.settings.slerpSpeed);
    }
}

export { TrackingCamera };