export class StaggerSystem {
    constructor(maxPoise) {
        this.maxPoise = maxPoise;
        this.currentPoise = 0;
        this.staggered = false;
        this.staggerDuration = 90; // frames
        this.staggerTimer = 0;
        this.decayRate = 0.15; // poise decays per frame when not being hit
        this.decayDelay = 60; // frames before decay starts
        this.decayTimer = 0;
    }

    addPoise(amount) {
        this.currentPoise += amount;
        this.decayTimer = this.decayDelay;

        if (this.currentPoise >= this.maxPoise && !this.staggered) {
            this.staggered = true;
            this.staggerTimer = this.staggerDuration;
            this.currentPoise = 0;
            return true; // stagger triggered
        }
        return false;
    }

    update(dt = 1) {
        if (this.staggered) {
            this.staggerTimer -= dt;
            if (this.staggerTimer <= 0) {
                this.staggered = false;
                this.currentPoise = 0;
            }
        } else {
            if (this.decayTimer > 0) {
                this.decayTimer -= dt;
            } else {
                this.currentPoise = Math.max(0, this.currentPoise - this.decayRate * dt);
            }
        }
    }

    getPercent() {
        return this.currentPoise / this.maxPoise;
    }

    reset() {
        this.currentPoise = 0;
        this.staggered = false;
        this.staggerTimer = 0;
    }
}
