export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(config) {
        const count = config.count || 1;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: config.x + (Math.random() - 0.5) * (config.spread || 0),
                y: config.y + (Math.random() - 0.5) * (config.spread || 0),
                vx: (config.vx || 0) + (Math.random() - 0.5) * (config.vxRandom || 0),
                vy: (config.vy || 0) + (Math.random() - 0.5) * (config.vyRandom || 0),
                size: config.size || 3,
                sizeDecay: config.sizeDecay || 0.05,
                color: config.color || '#fff',
                alpha: config.alpha || 1,
                alphaDecay: config.alphaDecay || 0.02,
                life: config.life || 30,
                maxLife: config.life || 30,
                gravity: config.gravity || 0,
                friction: config.friction || 0.98,
                shape: config.shape || 'rect', // rect, circle, spark
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2,
                trail: config.trail || false,
            });
        }
    }

    // Preset emitters
    sparks(x, y, color = '#ffd700', count = 8) {
        this.emit({
            x, y, count,
            vxRandom: 8, vyRandom: 8,
            vy: -2,
            size: 2, sizeDecay: 0.03,
            color,
            alphaDecay: 0.03,
            life: 20,
            gravity: 0.15,
            shape: 'spark'
        });
    }

    blood(x, y, direction = 1, count = 12) {
        this.emit({
            x, y, count,
            vx: direction * 3, vxRandom: 4,
            vy: -3, vyRandom: 5,
            size: 3, sizeDecay: 0.04,
            color: '#8b0000',
            alphaDecay: 0.015,
            life: 40,
            gravity: 0.2,
            shape: 'circle'
        });
    }

    heal(x, y) {
        this.emit({
            x, y: y + 20, count: 15,
            spread: 20,
            vx: 0, vxRandom: 2,
            vy: -3, vyRandom: 2,
            size: 3, sizeDecay: 0.02,
            color: '#44ff88',
            alphaDecay: 0.02,
            life: 40,
            gravity: -0.05,
            shape: 'circle'
        });
    }

    parryFlash(x, y) {
        this.emit({
            x, y, count: 20,
            vxRandom: 12, vyRandom: 12,
            size: 4, sizeDecay: 0.05,
            color: '#ffffff',
            alphaDecay: 0.04,
            life: 15,
            shape: 'spark'
        });
        this.emit({
            x, y, count: 10,
            vxRandom: 6, vyRandom: 6,
            size: 3, sizeDecay: 0.03,
            color: '#ffd700',
            alphaDecay: 0.03,
            life: 20,
            shape: 'spark'
        });
    }

    phaseTransition(x, y) {
        this.emit({
            x, y, count: 40,
            spread: 30,
            vxRandom: 10, vyRandom: 10,
            size: 5, sizeDecay: 0.03,
            color: '#ff4400',
            alphaDecay: 0.015,
            life: 50,
            gravity: -0.1,
            shape: 'circle'
        });
    }

    dust(x, y, direction = 0) {
        this.emit({
            x, y: y + 5, count: 5,
            vx: direction * 2, vxRandom: 2,
            vy: -1, vyRandom: 1,
            size: 3, sizeDecay: 0.06,
            color: '#6a5a3a',
            alpha: 0.6,
            alphaDecay: 0.03,
            life: 20,
            shape: 'circle'
        });
    }

    fire(x, y, count = 5) {
        this.emit({
            x, y, count,
            spread: 10,
            vxRandom: 2,
            vy: -2, vyRandom: 2,
            size: 4, sizeDecay: 0.06,
            color: Math.random() > 0.5 ? '#ff6600' : '#ff3300',
            alphaDecay: 0.03,
            life: 25,
            gravity: -0.08,
            shape: 'circle'
        });
    }

    update(dt = 1) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.size -= p.sizeDecay * dt;
            p.alpha -= p.alphaDecay * dt;
            p.life -= dt;
            p.rotation += p.rotSpeed * dt;

            if (p.life <= 0 || p.alpha <= 0 || p.size <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;

            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(Math.round(p.x), Math.round(p.y), Math.max(0.5, p.size), 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 'spark') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-p.size / 2, -p.size * 1.5, p.size, p.size * 3);
                ctx.restore();
            } else {
                ctx.fillRect(
                    Math.round(p.x - p.size / 2),
                    Math.round(p.y - p.size / 2),
                    Math.ceil(p.size),
                    Math.ceil(p.size)
                );
            }
        }
        ctx.globalAlpha = 1;
    }

    clear() {
        this.particles = [];
    }
}
