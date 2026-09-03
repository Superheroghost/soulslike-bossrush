import { Entity } from './entity.js';
import { StaggerSystem } from '../systems/stagger.js';
import { StateMachine } from '../systems/stateMachine.js';

export class Boss extends Entity {
    constructor(x, y, data, game) {
        const w = data.width || 70;
        const h = data.height || 90;
        super(x, y, w, h);
        this.game = game;
        this.data = data;
        this.name = data.name;
        this.title = data.title;

        this.maxHp = data.hp;
        this.hp = data.hp;
        this.phase = 1;
        this.maxPhase = data.maxPhase || 2;

        this.stagger = new StaggerSystem(data.poise);
        this.sm = new StateMachine(this);

        this.color = data.color;
        this.accentColor = data.accentColor;
        this.currentColor = data.color;
        this.currentAccent = data.accentColor;

        this.attackCooldown = 0;
        this.attackCooldownBase = 40;
        this.aggressionTimer = 0;
        this.currentAttack = null;

        this.groundY = y;
        this.gravity = 0.5;
        this.onGround = true;

        this.phaseTransitioning = false;
        this.showNameTimer = 120;

        this.bodyBob = 0;
        this.bobTimer = 0;
    }

    update(dt) {
        super.update(dt);
        this.stagger.update(dt);

        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.showNameTimer > 0) this.showNameTimer -= dt;

        this.bobTimer += dt * 0.05;
        this.bodyBob = Math.sin(this.bobTimer) * 2;

        // Face player
        if (!this.phaseTransitioning && !this.stagger.staggered &&
            this.game.player && !this.isDead) {
            const px = this.game.player.x + this.game.player.width / 2;
            const bx = this.x + this.width / 2;
            if (Math.abs(px - bx) > 10) {
                this.facing = px > bx ? 1 : -1;
            }
        }

        // Gravity
        if (!this.onGround) {
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.onGround = true;
            }
        }

        // Phase check
        this.checkPhase();

        // State machine
        this.sm.update(dt);

        this.clampToArena(this.game.arenaLeft, this.game.arenaRight);
    }

    checkPhase() {
        if (this.phaseTransitioning || this.isDead) return;

        const hpPercent = this.hp / this.maxHp;

        if (this.phase === 1 && hpPercent <= 0.5) {
            this.triggerPhaseTransition(2);
        } else if (this.phase === 2 && this.maxPhase >= 3 && hpPercent <= 0.2) {
            this.triggerPhaseTransition(3);
        }
    }

    triggerPhaseTransition(newPhase) {
        this.phaseTransitioning = true;
        this.phase = newPhase;
        this.invincible = true;
        this.game.combat.clearHitboxes();

        // Visual effects
        this.game.audio.bossPhase();
        this.game.camera.shake(15, 30);
        this.game.particles.phaseTransition(this.x + this.width / 2, this.y + this.height / 2);

        // Update colors for phase 2
        if (newPhase === 2) {
            this.currentColor = this.data.phase2Color || this.color;
            this.currentAccent = this.data.phase2AccentColor || this.accentColor;
        }

        // Show phase transition UI
        const overlay = document.getElementById('phase-transition');
        const text = overlay.querySelector('.phase-text');
        text.textContent = newPhase === 2 ? 'THE REAL FIGHT BEGINS' : 'DESPERATION';
        overlay.classList.add('active');
        overlay.style.display = 'flex';

        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            this.phaseTransitioning = false;
            this.invincible = false;
            this.onPhaseChange(newPhase);
        }, 2000);
    }

    onPhaseChange(phase) {
        // Override in subclass
    }

    onStagger() {
        this.sm.setState('stagger');
        this.game.audio.stagger();
        this.game.particles.sparks(this.x + this.width / 2, this.y + 20, '#ffff00', 15);
    }

    takeDamage(amount, poiseDamage) {
        if (this.invincible || this.isDead) return;

        this.hp -= amount;
        this.flashTimer = 8;

        if (!this.stagger.staggered) {
            const staggered = this.stagger.addPoise(poiseDamage);
            if (staggered) {
                this.onStagger();
            }
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            this.sm.setState('death');
        }
    }

    createAttackHitbox(config) {
        const hitbox = {
            x: config.x !== undefined ? config.x : (this.facing === 1 ? this.x + this.width : this.x - config.range),
            y: config.y !== undefined ? config.y : this.y + (config.yOffset || 10),
            w: config.range || 60,
            h: config.height || this.height - 20,
            damage: config.damage,
            poiseDamage: config.poiseDamage || 10,
            type: config.type || 'boss_attack',
            target: 'player',
            lifetime: config.lifetime || 4,
            direction: this.facing,
            hasHit: new Set()
        };

        this.game.combat.addHitbox(hitbox);
    }

    getDistanceToPlayer() {
        if (!this.game.player) return 999;
        const px = this.game.player.x + this.game.player.width / 2;
        const bx = this.x + this.width / 2;
        return Math.abs(px - bx);
    }

    getDirectionToPlayer() {
        if (!this.game.player) return 1;
        const px = this.game.player.x + this.game.player.width / 2;
        const bx = this.x + this.width / 2;
        return px > bx ? 1 : -1;
    }

    renderBossBase(renderer) {
        const ctx = renderer.ctx;
        const drawX = Math.round(this.x);
        const drawY = Math.round(this.y + this.bodyBob);

        const flashing = this.flashTimer > 0 && Math.floor(this.flashTimer) % 3 === 0;
        if (flashing) return;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, this.groundY + this.height, this.width * 0.6, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        return { drawX, drawY, ctx };
    }

    render(renderer) {
        // Override in subclass
    }

    // Boss name display
    renderName(renderer) {
        if (this.showNameTimer > 0) {
            const alpha = Math.min(1, this.showNameTimer / 30);
            const cx = this.game.width / 2;
            renderer.drawText(this.name, cx, this.game.height - 100,
                `rgba(232,213,163,${alpha})`, 28, 'center');
            renderer.drawText(this.title, cx, this.game.height - 70,
                `rgba(138,122,90,${alpha})`, 14, 'center', 'Crimson Text');
        }
    }
}
