import { CollisionSystem } from '../engine/collision.js';

export class CombatSystem {
    constructor(game) {
        this.game = game;
        this.hitboxes = [];
    }

    addHitbox(hitbox) {
        this.hitboxes.push(hitbox);
    }

    update() {
        // Process hitboxes
        for (let i = this.hitboxes.length - 1; i >= 0; i--) {
            const hb = this.hitboxes[i];
            hb.lifetime--;

            if (hb.lifetime <= 0) {
                this.hitboxes.splice(i, 1);
                continue;
            }

            // Check against targets
            if (hb.target === 'boss' && this.game.currentBoss) {
                const boss = this.game.currentBoss;
                if (!hb.hasHit.has(boss) && !boss.isDead) {
                    const bossRect = boss.getHurtbox();
                    if (CollisionSystem.rectIntersects(hb, bossRect)) {
                        this.onHitBoss(hb, boss);
                        hb.hasHit.add(boss);
                    }
                }
            }

            if (hb.target === 'player' && this.game.player) {
                const player = this.game.player;
                if (!hb.hasHit.has(player) && !player.isDead) {
                    const playerRect = player.getHurtbox();
                    if (player.invincible) continue;

                    if (CollisionSystem.rectIntersects(hb, playerRect)) {
                        // Check parry
                        if (player.isParrying()) {
                            this.onParry(hb, player);
                        } else if (player.isBlocking()) {
                            this.onBlock(hb, player);
                        } else {
                            this.onHitPlayer(hb, player);
                        }
                        hb.hasHit.add(player);
                    }
                }
            }
        }
    }

    onHitBoss(hitbox, boss) {
        let damage = hitbox.damage;
        let poiseDmg = hitbox.poiseDamage || 10;

        // Check if riposte
        if (boss.stagger.staggered && hitbox.type === 'light') {
            damage *= 3;
            poiseDmg = 0;
            this.game.audio.riposte();
            this.game.camera.shake(10, 15);
            this.game.hitStop.trigger(8);
            this.game.particles.sparks(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2, '#ff4400', 20);
        } else if (hitbox.type === 'heavy') {
            this.game.camera.shake(6, 8);
            this.game.hitStop.trigger(5);
            this.game.audio.heavyHit();
            this.game.particles.sparks(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2, '#ffd700', 12);
        } else {
            this.game.camera.shake(3, 4);
            this.game.hitStop.trigger(3);
            this.game.audio.hit();
            this.game.particles.sparks(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2, '#ffa500', 6);
        }

        // Apply buffs
        for (const buff of this.game.activeBuffs) {
            if (buff.id === 'heavy_heal' && hitbox.type === 'heavy') {
                this.game.player.hp = Math.min(this.game.player.maxHp, this.game.player.hp + this.game.player.maxHp * 0.05);
            }
            if (buff.id === 'crit_chance') {
                if (Math.random() < 0.15) damage *= 1.5;
            }
        }

        boss.takeDamage(damage, poiseDmg);
        this.game.particles.blood(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2, hitbox.direction || 1, 8);
    }

    onHitPlayer(hitbox, player) {
        let damage = hitbox.damage;
        this.game.camera.shake(8, 10);
        this.game.hitStop.trigger(4);
        this.game.audio.heavyHit();
        this.game.particles.blood(player.x + player.width / 2, player.y + player.height / 2, -player.facing, 10);
        player.takeDamage(damage);
        this.game.damageTaken += damage;
    }

    onParry(hitbox, player) {
        this.game.audio.parry();
        this.game.camera.shake(5, 8);
        this.game.hitStop.trigger(6);
        this.game.triggerSlowMotion(0.3, 10);
        this.game.parryCount++;

        const px = player.x + (player.facing === 1 ? player.width : 0);
        const py = player.y + player.height * 0.4;
        this.game.particles.parryFlash(px, py);

        // Add extra poise damage on parry
        let poiseDmg = (hitbox.poiseDamage || 10) + 20;
        for (const buff of this.game.activeBuffs) {
            if (buff.id === 'parry_poise') poiseDmg += 10;
        }
        if (this.game.currentBoss) {
            const staggered = this.game.currentBoss.stagger.addPoise(poiseDmg);
            if (staggered) {
                this.game.audio.stagger();
                this.game.camera.shake(12, 20);
                this.game.currentBoss.onStagger();
            }
        }

        // Parry restores a bit of stamina
        player.stamina.current = Math.min(player.stamina.max, player.stamina.current + 20);
        player.endParry();
    }

    onBlock(hitbox, player) {
        this.game.audio.block();
        this.game.camera.shake(3, 5);
        let staminaCost = hitbox.damage * 1.2;
        const blocked = player.stamina.consume(staminaCost);
        if (!blocked) {
            // Guard break
            this.onHitPlayer(hitbox, player);
        } else {
            player.takeDamage(Math.floor(hitbox.damage * 0.15)); // chip damage
            this.game.particles.sparks(
                player.x + (player.facing === 1 ? player.width : 0),
                player.y + player.height * 0.4,
                '#aaaaaa',
                5
            );
        }
    }

    clearHitboxes() {
        this.hitboxes = [];
    }
}
