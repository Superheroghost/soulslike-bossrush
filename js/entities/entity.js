export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1 = right, -1 = left
        this.hp = 100;
        this.maxHp = 100;
        this.isDead = false;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.flashTimer = 0;
    }

    getHurtbox() {
        return {
            x: this.x + this.width * 0.2,
            y: this.y + this.height * 0.1,
            w: this.width * 0.6,
            h: this.height * 0.85
        };
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    update(dt) {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }
    }

    clampToArena(arenaLeft, arenaRight) {
        if (this.x < arenaLeft) this.x = arenaLeft;
        if (this.x + this.width > arenaRight) this.x = arenaRight - this.width;
    }
}
