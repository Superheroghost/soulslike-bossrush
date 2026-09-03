import { Entity } from './entity.js';
import { StateMachine, State } from '../systems/stateMachine.js';
import { StaminaSystem } from '../systems/stamina.js';

export class Player extends Entity {
    constructor(x, y, weapon, game) {
        super(x, y, 36, 60);
        this.game = game;
        this.weapon = weapon;

        this.maxHp = 200;
        this.hp = this.maxHp;
        this.maxFlasks = 3;
        this.flasks = this.maxFlasks;
        this.flaskHealAmount = 80;
        this.flaskHealBonus = 0;
        this.firstFlaskFast = false;
        this.firstFlaskUsed = false;

        this.stamina = new StaminaSystem(120, 0.6, 30);
        this.moveSpeed = 3.5;
        this.sprintSpeed = 5.5;
        this.sprinting = false;

        // Dodge
        this.dodgeSpeed = 7;
        this.dodgeDuration = 18;
        this.dodgeIFrames = 10;
        this.dodgeCooldown = 6;
        this.dodgeStamina = 18;
        this.dodgeDirection = 1;
        this.dodgeAttackTimer = 0;
        this.dodgeAttackBonus = false;

        // Parry
        this.parryWindow = 5;
        this.parryTimer = 0;
        this.isParryActive = false;
        this.blockStaminaDrain = 0.3; // per frame while blocking

        // Combat
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboResetTime = 20;
        this.damageMultiplier = 1.0;
        this.comboDamageBonus = false;

        this.attackHitboxCreated = false;

        this.groundY = y;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.bodyBob = 0;

        this.sm = new StateMachine(this);
        this.sm.addState('idle', new PlayerIdleState());
        this.sm.addState('move', new PlayerMoveState());
        this.sm.addState('sprint', new PlayerSprintState());
        this.sm.addState('dodge', new PlayerDodgeState());
        this.sm.addState('light_attack', new PlayerLightAttackState());
        this.sm.addState('heavy_attack', new PlayerHeavyAttackState());
        this.sm.addState('block', new PlayerBlockState());
        this.sm.addState('heal', new PlayerHealState());
        this.sm.addState('hurt', new PlayerHurtState());
        this.sm.addState('dead', new PlayerDeadState());
        this.sm.setState('idle');
    }

    update(dt) {
        super.update(dt);
        this.stamina.update(dt);
        this.sm.update(dt);

        if (this.dodgeAttackTimer > 0) this.dodgeAttackTimer -= dt;
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }

        // Simple bob animation
        if (this.sm.isState('move') || this.sm.isState('sprint')) {
            this.animTimer += dt * (this.sprinting ? 0.3 : 0.2);
            this.bodyBob = Math.sin(this.animTimer) * 2;
        } else {
            this.bodyBob *= 0.8;
        }

        this.clampToArena(this.game.arenaLeft, this.game.arenaRight);
    }

    isParrying() {
        return this.isParryActive && this.parryTimer > 0;
    }

    isBlocking() {
        return this.sm.isState('block') && !this.isParrying();
    }

    endParry() {
        this.isParryActive = false;
        this.parryTimer = 0;
    }

    takeDamage(amount) {
        if (this.invincible || this.isDead) return;
        this.hp -= amount;
        this.flashTimer = 10;

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            this.sm.setState('dead');
        } else if (!this.sm.isState('block')) {
            this.sm.setState('hurt');
        }
    }

    createAttackHitbox(type) {
        const w = this.weapon;
        const isHeavy = type === 'heavy';
        let damage = isHeavy ? w.heavyDamage : w.lightDamage;
        damage *= this.damageMultiplier;

        if (this.comboDamageBonus && this.comboCount > 0) {
            damage *= (1 + this.comboCount * 0.1);
        }
        if (this.dodgeAttackBonus && this.dodgeAttackTimer > 0) {
            damage *= 1.3;
        }

        const hitbox = {
            x: this.facing === 1 ? this.x + this.width : this.x - w.range,
            y: this.y + 5,
            w: w.range,
            h: this.height - 10,
            damage: Math.floor(damage),
            poiseDamage: isHeavy ? w.heavyPoiseDamage : w.poiseDamage,
            type: type,
            target: 'boss',
            lifetime: 4,
            direction: this.facing,
            hasHit: new Set()
        };

        this.game.combat.addHitbox(hitbox);

        if (isHeavy) {
            this.game.audio.heavySwing();
        } else {
            this.game.audio.swordSwing();
        }
    }

    reset() {
        this.hp = this.maxHp;
        this.flasks = this.maxFlasks;
        this.firstFlaskUsed = false;
        this.stamina.current = this.stamina.max;
        this.stamina.depleted = false;
        this.isDead = false;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.flashTimer = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.dodgeAttackTimer = 0;
        this.sm.setState('idle');
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const drawX = Math.round(this.x);
        const drawY = Math.round(this.y + this.bodyBob);

        // Flash on hit
        const flashing = this.flashTimer > 0 && Math.floor(this.flashTimer) % 3 === 0;
        if (flashing && !this.isDead) return;

        // Dodge ghost effect
        if (this.sm.isState('dodge') && this.invincible) {
            ctx.globalAlpha = 0.3;
            this.drawBody(ctx, drawX - this.vx * 3, drawY, '#4466aa');
            ctx.globalAlpha = 1;
        }

        // Body
        const bodyColor = this.sm.isState('block') ? '#6080a0' :
                          this.sm.isState('heal') ? '#40aa60' :
                          this.invincible ? '#6688bb' : '#8899aa';

        this.drawBody(ctx, drawX, drawY, bodyColor);

        // Weapon
        this.drawWeapon(ctx, drawX, drawY);

        // DEBUG: draw hurtbox
        // const hb = this.getHurtbox();
        // renderer.drawRectOutline(hb.x, hb.y, hb.w, hb.h, 'lime', 1, 0.5);
    }

    drawBody(ctx, x, y, color) {
        // Head
        ctx.fillStyle = '#ccbbaa';
        ctx.fillRect(x + 10, y, 16, 14);

        // Helmet visor
        ctx.fillStyle = '#334';
        const visorX = this.facing === 1 ? x + 18 : x + 10;
        ctx.fillRect(visorX, y + 4, 8, 6);

        // Torso
        ctx.fillStyle = color;
        ctx.fillRect(x + 6, y + 14, 24, 22);

        // Cape/cloak back
        ctx.fillStyle = '#3a3050';
        if (this.facing === -1) {
            ctx.fillRect(x + 26, y + 14, 6, 26);
        } else {
            ctx.fillRect(x + 4, y + 14, 6, 26);
        }

        // Legs
        ctx.fillStyle = '#556';
        const legOffset = this.sm.isState('move') || this.sm.isState('sprint') ?
            Math.sin(this.animTimer * 2) * 3 : 0;
        ctx.fillRect(x + 8, y + 36, 8, 24);
        ctx.fillRect(x + 20, y + 36 + legOffset, 8, 24 - legOffset);

        // Feet
        ctx.fillStyle = '#443';
        ctx.fillRect(x + 6, y + 56, 12, 4);
        ctx.fillRect(x + 18, y + 56 + legOffset, 12, 4 - Math.max(0, legOffset));
    }

    drawWeapon(ctx, x, y) {
        const weaponColor = this.weapon.color || '#b0b0b0';
        const handleColor = '#5a4030';
        const state = this.sm.currentStateName;

        ctx.save();
        const handX = this.facing === 1 ? x + 28 : x + 8;
        const handY = y + 22;

        ctx.translate(handX, handY);
        ctx.scale(this.facing, 1);

        if (state === 'light_attack') {
            const progress = this.sm.currentState.timer / this.weapon.lightSpeed;
            const swingAngle = Math.sin(progress * Math.PI) * 1.5 - 0.3;
            ctx.rotate(swingAngle);
            ctx.fillStyle = handleColor;
            ctx.fillRect(0, -2, 12, 4);
            ctx.fillStyle = weaponColor;
            ctx.fillRect(12, -3, 30, 5);
            // Blade edge
            ctx.fillStyle = '#ddd';
            ctx.fillRect(12, -3, 30, 1);
        } else if (state === 'heavy_attack') {
            const progress = this.sm.currentState.timer / this.weapon.heavySpeed;
            let angle;
            if (progress < 0.4) {
                angle = -1.5; // wind up
            } else {
                angle = -1.5 + (progress - 0.4) / 0.3 * 3;
            }
            ctx.rotate(Math.min(angle, 1.8));
            ctx.fillStyle = handleColor;
            ctx.fillRect(0, -3, 14, 5);
            ctx.fillStyle = weaponColor;
            ctx.fillRect(14, -4, 35, 7);
            ctx.fillStyle = '#eee';
            ctx.fillRect(14, -4, 35, 2);
        } else if (state === 'block') {
            ctx.rotate(-0.3);
            // Shield-like block pose
            ctx.fillStyle = '#667';
            ctx.fillRect(-4, -15, 8, 30);
            ctx.fillStyle = weaponColor;
            ctx.fillRect(4, -8, 25, 4);
        } else {
            // Idle weapon position
            ctx.rotate(0.8);
            ctx.fillStyle = handleColor;
            ctx.fillRect(0, -2, 10, 4);
            ctx.fillStyle = weaponColor;
            ctx.fillRect(10, -2, 28, 4);
        }

        ctx.restore();
    }
}

// Player States
class PlayerIdleState extends State {
    update(dt) {
        super.update(dt);
        const input = this.owner.game.input;
        const player = this.owner;

        const move = input.getMovement();
        if (move !== 0) {
            player.facing = move;
            this.machine.setState('move');
            return;
        }

        player.vx = 0;

        if (input.consumeBuffer('dodge') && player.stamina.canAct()) {
            this.machine.setState('dodge');
        } else if (input.consumeBuffer('light_attack') && player.stamina.canAct()) {
            this.machine.setState('light_attack');
        } else if (input.consumeBuffer('heavy_attack') && player.stamina.canAct()) {
            this.machine.setState('heavy_attack');
        } else if (input.consumeBuffer('block')) {
            this.machine.setState('block');
        } else if (input.consumeBuffer('heal') && player.flasks > 0) {
            this.machine.setState('heal');
        }
    }
}

class PlayerMoveState extends State {
    update(dt) {
        super.update(dt);
        const input = this.owner.game.input;
        const player = this.owner;
        const move = input.getMovement();

        if (move === 0) {
            this.machine.setState('idle');
            return;
        }

        player.facing = move;
        player.vx = move * player.moveSpeed;
        player.x += player.vx * dt;

        if (input.isDown('ShiftLeft') || input.isDown('ShiftRight')) {
            this.machine.setState('sprint');
            return;
        }

        if (input.consumeBuffer('dodge') && player.stamina.canAct()) {
            this.machine.setState('dodge');
        } else if (input.consumeBuffer('light_attack') && player.stamina.canAct()) {
            this.machine.setState('light_attack');
        } else if (input.consumeBuffer('heavy_attack') && player.stamina.canAct()) {
            this.machine.setState('heavy_attack');
        } else if (input.consumeBuffer('block')) {
            this.machine.setState('block');
        } else if (input.consumeBuffer('heal') && player.flasks > 0) {
            this.machine.setState('heal');
        }
    }
}

class PlayerSprintState extends State {
    update(dt) {
        super.update(dt);
        const input = this.owner.game.input;
        const player = this.owner;
        const move = input.getMovement();

        if (!input.isDown('ShiftLeft') && !input.isDown('ShiftRight')) {
            this.machine.setState(move !== 0 ? 'move' : 'idle');
            return;
        }

        if (move === 0) {
            this.machine.setState('idle');
            return;
        }

        if (!player.stamina.consume(0.4 * dt)) {
            this.machine.setState('move');
            return;
        }

        player.facing = move;
        player.sprinting = true;
        player.vx = move * player.sprintSpeed;
        player.x += player.vx * dt;

        if (input.consumeBuffer('dodge') && player.stamina.canAct()) {
            this.machine.setState('dodge');
        } else if (input.consumeBuffer('light_attack') && player.stamina.canAct()) {
            this.machine.setState('light_attack');
        }
    }

    exit() {
        this.owner.sprinting = false;
    }
}

class PlayerDodgeState extends State {
    enter() {
        super.enter();
        const player = this.owner;
        const input = player.game.input;

        if (!player.stamina.consume(player.dodgeStamina)) {
            this.machine.setState('idle');
            return;
        }

        const move = input.getMovement();
        player.dodgeDirection = move !== 0 ? move : player.facing;
        player.invincible = true;
        player.invincibleTimer = player.dodgeIFrames;
        player.game.audio.dodge();
        player.game.particles.dust(player.x + player.width / 2, player.y + player.height, -player.dodgeDirection);
    }

    update(dt) {
        super.update(dt);
        const player = this.owner;

        if (this.timer < player.dodgeDuration) {
            const speed = player.dodgeSpeed * (1 - this.timer / player.dodgeDuration * 0.5);
            player.vx = player.dodgeDirection * speed;
            player.x += player.vx * dt;
        }

        if (this.timer >= player.dodgeDuration + player.dodgeCooldown) {
            if (player.dodgeAttackBonus) {
                player.dodgeAttackTimer = 30;
            }
            this.machine.setState('idle');
        }
    }

    exit() {
        this.owner.invincible = false;
    }
}

class PlayerLightAttackState extends State {
    enter() {
        super.enter();
        const player = this.owner;

        if (!player.stamina.consume(player.weapon.lightStamina)) {
            this.machine.setState('idle');
            return;
        }

        player.attackHitboxCreated = false;
        player.comboCount++;
        if (player.comboCount > player.weapon.lightCombo) {
            player.comboCount = 1;
        }
        player.comboTimer = player.comboResetTime + player.weapon.lightSpeed;
        player.vx = player.facing * 1.5; // slight lunge
    }

    update(dt) {
        super.update(dt);
        const player = this.owner;
        const attackTime = player.weapon.lightSpeed;

        player.x += player.vx * dt;
        player.vx *= 0.85;

        // Create hitbox at the right moment (about 30-40% through the swing)
        if (!player.attackHitboxCreated && this.timer >= attackTime * 0.3) {
            player.createAttackHitbox('light');
            player.attackHitboxCreated = true;
        }

        // Can cancel into dodge in last 30% of animation
        if (this.timer >= attackTime * 0.7) {
            const input = player.game.input;
            if (input.consumeBuffer('dodge') && player.stamina.canAct()) {
                this.machine.setState('dodge');
                return;
            }
        }

        if (this.timer >= attackTime) {
            // Can chain into next light attack
            const input = player.game.input;
            if (input.consumeBuffer('light_attack') && player.stamina.canAct() &&
                player.comboCount < player.weapon.lightCombo) {
                this.machine.setState('light_attack');
                return;
            }
            if (input.consumeBuffer('heavy_attack') && player.stamina.canAct()) {
                this.machine.setState('heavy_attack');
                return;
            }
            this.machine.setState('idle');
        }
    }
}

class PlayerHeavyAttackState extends State {
    enter() {
        super.enter();
        const player = this.owner;

        if (!player.stamina.consume(player.weapon.heavyStamina)) {
            this.machine.setState('idle');
            return;
        }

        player.attackHitboxCreated = false;
        player.comboCount = 0;
        player.vx = 0;
    }

    update(dt) {
        super.update(dt);
        const player = this.owner;
        const attackTime = player.weapon.heavySpeed;

        // Lunge forward on the downswing
        if (this.timer >= attackTime * 0.4 && this.timer < attackTime * 0.55) {
            player.x += player.facing * 3 * dt;
        }

        if (!player.attackHitboxCreated && this.timer >= attackTime * 0.45) {
            player.createAttackHitbox('heavy');
            player.attackHitboxCreated = true;
        }

        // Can cancel late
        if (this.timer >= attackTime * 0.8) {
            const input = player.game.input;
            if (input.consumeBuffer('dodge') && player.stamina.canAct()) {
                this.machine.setState('dodge');
                return;
            }
        }

        if (this.timer >= attackTime) {
            this.machine.setState('idle');
        }
    }
}

class PlayerBlockState extends State {
    enter() {
        super.enter();
        const player = this.owner;
        player.isParryActive = true;
        player.parryTimer = player.parryWindow;
        player.vx = 0;
    }

    update(dt) {
        super.update(dt);
        const player = this.owner;
        const input = player.game.input;

        if (player.parryTimer > 0) {
            player.parryTimer -= dt;
            if (player.parryTimer <= 0) {
                player.isParryActive = false;
            }
        }

        // Drain stamina while blocking
        if (!player.stamina.consume(player.blockStaminaDrain * dt)) {
            this.machine.setState('idle');
            return;
        }

        if (!input.isDown('KeyL')) {
            this.machine.setState('idle');
            return;
        }

        if (input.consumeBuffer('dodge') && player.stamina.canAct()) {
            this.machine.setState('dodge');
        }
    }

    exit() {
        this.owner.isParryActive = false;
        this.owner.parryTimer = 0;
    }
}

class PlayerHealState extends State {
    enter() {
        super.enter();
        const player = this.owner;
        if (player.flasks <= 0) {
            this.machine.setState('idle');
            return;
        }
        player.vx = 0;
        this.healDuration = 60; // ~1 second
        if (player.firstFlaskFast && !player.firstFlaskUsed) {
            this.healDuration = 30;
        }
        this.healed = false;
    }

    update(dt) {
        super.update(dt);
        const player = this.owner;

        if (this.timer >= this.healDuration * 0.7 && !this.healed) {
            const healAmount = player.flaskHealAmount * (1 + player.flaskHealBonus);
            player.hp = Math.min(player.maxHp, player.hp + Math.floor(healAmount));
            player.flasks--;
            if (player.firstFlaskFast) player.firstFlaskUsed = true;
            this.healed = true;
            player.game.audio.heal();
            player.game.particles.heal(player.x + player.width / 2, player.y + player.height / 2);
        }

        if (this.timer >= this.healDuration) {
            this.machine.setState('idle');
        }
    }
}

class PlayerHurtState extends State {
    enter() {
        super.enter();
        const player = this.owner;
        player.vx = -player.facing * 3;
        this.duration = 15;
    }

    update(dt) {
        super.update(dt);
        const player = this.owner;
        player.x += player.vx * dt;
        player.vx *= 0.85;

        if (this.timer >= this.duration) {
            this.machine.setState('idle');
        }
    }
}

class PlayerDeadState extends State {
    enter() {
        super.enter();
        this.owner.vx = 0;
        this.owner.game.audio.death();
    }

    update(dt) {
        super.update(dt);
    }
}
