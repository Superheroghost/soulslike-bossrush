// Merged into Camera class - this file exports utility
export class HitStop {
    constructor() {
        this.active = false;
        this.duration = 0;
        this.timer = 0;
    }

    trigger(frames) {
        this.active = true;
        this.duration = frames;
        this.timer = frames;
    }

    update() {
        if (this.active) {
            this.timer--;
            if (this.timer <= 0) {
                this.active = false;
            }
            return true; // game should freeze
        }
        return false;
    }

    isActive() {
        return this.active;
    }
}
