export class InputManager {
    constructor() {
        this.keys = {};
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        this.prevKeys = {};
        this.mouse = { x: 0, y: 0, left: false, right: false };
        this.mouseJustPressed = { left: false, right: false };

        this.buffer = [];
        this.BUFFER_FRAMES = 8;

        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keysJustPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysJustReleased[e.code] = true;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouse.left = true;
                this.mouseJustPressed.left = true;
            }
            if (e.button === 2) {
                this.mouse.right = true;
                this.mouseJustPressed.right = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.left = false;
            if (e.button === 2) this.mouse.right = false;
        });

        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    update() {
        // Decay buffer
        for (let i = this.buffer.length - 1; i >= 0; i--) {
            this.buffer[i].frames--;
            if (this.buffer[i].frames <= 0) {
                this.buffer.splice(i, 1);
            }
        }

        // Buffer new inputs
        if (this.keysJustPressed['KeyJ'] || this.mouseJustPressed.left) {
            this.bufferAction('light_attack');
        }
        if (this.keysJustPressed['KeyK'] || (this.mouseJustPressed.left && this.keys['ShiftLeft'])) {
            this.bufferAction('heavy_attack');
        }
        if (this.keysJustPressed['Space']) {
            this.bufferAction('dodge');
        }
        if (this.keysJustPressed['KeyL']) {
            this.bufferAction('block');
        }
        if (this.keysJustPressed['KeyE']) {
            this.bufferAction('heal');
        }
    }

    postUpdate() {
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        this.mouseJustPressed = { left: false, right: false };
    }

    bufferAction(action) {
        // Don't duplicate
        const existing = this.buffer.find(b => b.action === action);
        if (!existing) {
            this.buffer.push({ action, frames: this.BUFFER_FRAMES });
        } else {
            existing.frames = this.BUFFER_FRAMES;
        }
    }

    consumeBuffer(action) {
        const idx = this.buffer.findIndex(b => b.action === action);
        if (idx !== -1) {
            this.buffer.splice(idx, 1);
            return true;
        }
        return false;
    }

    hasBuffered(action) {
        return this.buffer.some(b => b.action === action);
    }

    isDown(code) {
        return !!this.keys[code];
    }

    justPressed(code) {
        return !!this.keysJustPressed[code];
    }

    justReleased(code) {
        return !!this.keysJustReleased[code];
    }

    getMovement() {
        let x = 0;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
        return x;
    }
}
