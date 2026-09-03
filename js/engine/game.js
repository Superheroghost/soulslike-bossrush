export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 960;
        this.height = 540;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.TARGET_FPS = 60;
        this.FRAME_TIME = 1000 / this.TARGET_FPS;
        this.lastTime = 0;
        this.accumulator = 0;
        this.frameCount = 0;
        this.running = false;
        this.paused = false;

        this.state = 'menu'; // menu, playing, dead, victory, paused, phase_transition, buff_select
        this.currentBoss = null;
        this.player = null;
        this.entities = [];
        this.systems = {};

        this.fightTime = 0;
        this.deathCounts = {};
        this.totalDeaths = 0;
        this.parryCount = 0;
        this.damageTaken = 0;
        this.currentBossIndex = 0;
        this.gauntletMode = false;
        this.activeBuffs = [];

        this.slowMotion = { active: false, factor: 1, duration: 0, timer: 0 };
    }

    resizeCanvas() {
        const aspect = this.width / this.height;
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (w / h > aspect) {
            w = h * aspect;
        } else {
            h = w / aspect;
        }
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(currentTime) {
        if (!this.running) return;
        requestAnimationFrame((t) => this.loop(t));

        let elapsed = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (elapsed > 100) elapsed = 100;

        this.accumulator += elapsed;

        while (this.accumulator >= this.FRAME_TIME) {
            if (!this.paused && this.state === 'playing') {
                let dt = 1;
                if (this.slowMotion.active) {
                    dt = this.slowMotion.factor;
                    this.slowMotion.timer--;
                    if (this.slowMotion.timer <= 0) {
                        this.slowMotion.active = false;
                        this.slowMotion.factor = 1;
                    }
                }
                this.update(dt);
                this.frameCount++;
            }
            this.accumulator -= this.FRAME_TIME;
        }

        this.render();
    }

    triggerSlowMotion(factor, durationFrames) {
        this.slowMotion.active = true;
        this.slowMotion.factor = factor;
        this.slowMotion.duration = durationFrames;
        this.slowMotion.timer = durationFrames;
    }

    update(dt) {
        // Override in main
    }

    render() {
        // Override in main
    }
}
