export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.shakeX = 0;
        this.shakeY = 0;
    }

    clear() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }

    applyShake(x, y) {
        this.shakeX = x;
        this.shakeY = y;
    }

    beginFrame() {
        this.ctx.save();
        this.ctx.translate(Math.round(this.shakeX), Math.round(this.shakeY));
    }

    endFrame() {
        this.ctx.restore();
    }

    drawRect(x, y, w, h, color, alpha = 1) {
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        this.ctx.globalAlpha = 1;
    }

    drawRectOutline(x, y, w, h, color, lineWidth = 1, alpha = 1) {
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        this.ctx.globalAlpha = 1;
    }

    drawCircle(x, y, r, color, alpha = 1) {
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    drawLine(x1, y1, x2, y2, color, width = 1, alpha = 1) {
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawText(text, x, y, color = '#c8b88a', size = 16, align = 'left', font = 'Cinzel') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px ${font}, serif`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, Math.round(x), Math.round(y));
    }
}
