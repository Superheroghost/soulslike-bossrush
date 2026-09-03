export class StaminaSystem {
    constructor(max, regenRate, regenDelay) {
        this.max = max;
        this.current = max;
        this.regenRate = regenRate;      // per frame
        this.regenDelay = regenDelay;    // frames before regen starts
        this.regenTimer = 0;
        this.depleted = false;
        this.depletedRecoveryThreshold = 0.3; // 30% before can act again
    }

    consume(amount) {
        if (this.depleted) return false;
        if (this.current < amount) {
            this.depleted = true;
            this.current = 0;
            return false;
        }
        this.current -= amount;
        this.regenTimer = this.regenDelay;
        if (this.current <= 0) {
            this.current = 0;
            this.depleted = true;
        }
        return true;
    }

    update(dt = 1) {
        if (this.regenTimer > 0) {
            this.regenTimer -= dt;
        } else {
            this.current = Math.min(this.max, this.current + this.regenRate * dt);
        }

        if (this.depleted && this.current >= this.max * this.depletedRecoveryThreshold) {
            this.depleted = false;
        }
    }

    getPercent() {
        return this.current / this.max;
    }

    canAct() {
        return !this.depleted;
    }
}
