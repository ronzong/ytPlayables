// Процедурный звук на WebAudio — ни одного файла в сборке.

export const audio = {
  ctx: null,
  master: null,
  enabled: true,
  _last: {},

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    this._noise = this._makeNoise();
  },

  volume: 0.5,
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  setEnabled(v, volume) {
    this.enabled = v;
    if (typeof volume === 'number') this.volume = Math.min(1, Math.max(0, volume));
    this._apply();
  },
  mute(v) { this._muted = v; this._apply(); },
  _apply() {
    if (!this.master) return;
    this.master.gain.value = (this._muted || !this.enabled) ? 0 : this.volume;
  },

  _makeNoise() {
    const len = this.ctx.sampleRate * 0.6;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  },

  _throttle(key, ms) {
    const now = performance.now();
    if (this._last[key] && now - this._last[key] < ms) return false;
    this._last[key] = now;
    return true;
  },

  _tone(freq, dur, type = 'sine', gain = 0.25, slideTo = null, delay = 0) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  },

  _noiseBurst(dur, freq, q, gain, delay = 0, type = 'bandpass') {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + delay;
    const s = this.ctx.createBufferSource();
    s.buffer = this._noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master);
    s.start(t); s.stop(t + dur + 0.02);
  },

  chop() {
    if (!this._throttle('chop', 60)) return;
    this._noiseBurst(0.09, 900 + Math.random() * 500, 1.2, 0.22);
    this._tone(150 + Math.random() * 40, 0.07, 'square', 0.05);
  },

  treeFall() {
    if (!this._throttle('fall', 90)) return;
    this._noiseBurst(0.45, 320, 0.8, 0.3, 0, 'lowpass');
    this._tone(90, 0.35, 'sine', 0.16, 45);
  },

  pickup() {
    if (!this._throttle('pickup', 45)) return;
    this._tone(520 + Math.random() * 120, 0.06, 'triangle', 0.1, 900);
  },

  coin() {
    if (!this._throttle('coin', 55)) return;
    this._tone(1180, 0.05, 'square', 0.05);
    this._tone(1760, 0.09, 'square', 0.045, null, 0.04);
  },

  buy() {
    this._tone(523, 0.1, 'triangle', 0.2);
    this._tone(659, 0.1, 'triangle', 0.2, null, 0.07);
    this._tone(784, 0.22, 'triangle', 0.2, null, 0.14);
  },

  deny() { this._tone(190, 0.14, 'sawtooth', 0.12, 130); },

  unlock() {
    const n = [523, 659, 784, 1046];
    n.forEach((f, i) => this._tone(f, 0.32, 'triangle', 0.2, null, i * 0.09));
    this._noiseBurst(0.5, 2600, 0.6, 0.12, 0.1, 'highpass');
  },

  full() { if (!this._throttle('full', 2800)) return; this._tone(240, 0.11, 'square', 0.085, 170); },
};
