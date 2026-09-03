export class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.connect(this.audioCtx.destination);
            this.masterGain.gain.value = 0.5;

            this.sfxGain = this.audioCtx.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = 0.6;

            this.musicGain = this.audioCtx.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = 0.3;

            this.initialized = true;
        } catch (e) {
            console.warn('Audio not supported');
        }
    }

    playTone(freq, duration, type = 'square', volume = 0.3, detune = 0) {
        if (!this.initialized) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playNoise(duration, volume = 0.2) {
        if (!this.initialized) return;
        const bufferSize = this.audioCtx.sampleRate * duration;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        source.start();
    }

    // SFX presets
    swordSwing() {
        this.playNoise(0.12, 0.15);
        this.playTone(800, 0.08, 'sawtooth', 0.1);
    }

    heavySwing() {
        this.playNoise(0.2, 0.2);
        this.playTone(400, 0.15, 'sawtooth', 0.15);
    }

    hit() {
        this.playNoise(0.08, 0.3);
        this.playTone(200, 0.1, 'square', 0.2);
        this.playTone(150, 0.15, 'sawtooth', 0.15);
    }

    heavyHit() {
        this.playNoise(0.15, 0.4);
        this.playTone(100, 0.2, 'square', 0.3);
        this.playTone(80, 0.25, 'sawtooth', 0.2);
    }

    parry() {
        this.playTone(1200, 0.15, 'square', 0.3);
        this.playTone(1600, 0.1, 'square', 0.2);
        this.playNoise(0.05, 0.3);
    }

    dodge() {
        this.playNoise(0.1, 0.08);
        this.playTone(500, 0.06, 'sine', 0.08);
    }

    heal() {
        this.playTone(600, 0.3, 'sine', 0.15);
        this.playTone(800, 0.3, 'sine', 0.1);
        setTimeout(() => this.playTone(1000, 0.2, 'sine', 0.1), 150);
    }

    block() {
        this.playTone(300, 0.1, 'square', 0.2);
        this.playNoise(0.06, 0.15);
    }

    death() {
        this.playTone(200, 0.5, 'sawtooth', 0.2);
        this.playTone(150, 0.8, 'square', 0.15);
        setTimeout(() => this.playTone(100, 0.6, 'sawtooth', 0.15), 200);
    }

    bossRoar() {
        this.playTone(80, 0.6, 'sawtooth', 0.3);
        this.playTone(100, 0.5, 'square', 0.2);
        this.playNoise(0.4, 0.2);
    }

    bossPhase() {
        this.playTone(150, 0.4, 'sawtooth', 0.25);
        this.playTone(200, 0.3, 'square', 0.2);
        setTimeout(() => {
            this.playTone(300, 0.5, 'square', 0.2);
            this.playTone(400, 0.4, 'sine', 0.15);
        }, 200);
    }

    riposte() {
        this.playTone(300, 0.2, 'square', 0.3);
        this.playTone(600, 0.15, 'sawtooth', 0.25);
        this.playNoise(0.1, 0.3);
    }

    stagger() {
        this.playTone(150, 0.3, 'square', 0.25);
        this.playTone(100, 0.4, 'sawtooth', 0.2);
    }

    victory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => this.playTone(n, 0.4, 'sine', 0.15), i * 200);
        });
    }

    menuSelect() {
        this.playTone(800, 0.1, 'sine', 0.1);
    }
}
