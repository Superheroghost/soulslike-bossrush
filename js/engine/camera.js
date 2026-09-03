export class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.shakeX = 0;
        this.shakeY = 0;
    }

    shake(intensity, duration) {
        if (intensity > this.shakeIntensity) {
            this.shakeIntensity = intensity;
            this.shakeDuration = duration;
            this.shakeTimer = duration;
        }
    }

    update() {
        if (this.shakeTimer > 0) {
            const progress = this.shakeTimer / this.shakeDuration;
            const currentIntensity = this.shakeIntensity * progress;
            this.shakeX = (Math.random() * 2 - 1) * currentIntensity;
            this.shakeY = (Math.random() * 2 - 1) * currentIntensity;
            this.shakeTimer--;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
            this.shakeIntensity = 0;
        }
    }
}
