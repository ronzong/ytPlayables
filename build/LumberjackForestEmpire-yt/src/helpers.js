// Помощники-лесорубы: сами ищут дерево, рубят, собирают и несут на лесопилку.
import { drawCharacter, PALETTES } from './character.js';
import { m4, angleLerp, TAU, rand } from './math.js';

const base = m4.create();
const PAL = [PALETTES.h0, PALETTES.h1, PALETTES.h2, PALETTES.h3];

export class Helper {
  constructor(i) {
    const a = (i / 4) * TAU + 0.7;
    this.x = Math.cos(a) * 8; this.z = Math.sin(a) * 8;
    this.ry = 0; this.phase = rand(0, 6); this.moveAmt = 0;
    this.mode = 'seek';
    this.target = null;
    this.carry = 0;
    this.carrySp = null;
    this.pendingLogs = 0;
    this.logMagnetSpeed = 320;
    this.chopT = 0;
    this.idle = rand(0, 0.6);
    this.pal = PAL[i % PAL.length];
    this.scale = 0.92;
  }

  release() { if (this.target) { this.target.claimed = null; this.target = null; } }

  update(dt, ctx) {
    const speed = ctx.speed;
    let tx = this.x, tz = this.z, arrive = 1.0;

    if (this.mode === 'seek') {
      if (!this.target || this.target.state !== 'alive') {
        this.release();
        this.target = ctx.findTree(this);
        if (this.target) this.target.claimed = this;
      }
      if (!this.target) {
        // Нет доступных деревьев — топчемся у центра
        tx = Math.cos(this.phase * 0.3) * 14; tz = Math.sin(this.phase * 0.3) * 14;
      } else {
        tx = this.target.x; tz = this.target.z;
        arrive = 2.0 + this.target.sp.crownR * 0.4;
        const d = Math.hypot(tx - this.x, tz - this.z);
        if (d < arrive) this.mode = 'chop';
      }
    }

    if (this.mode === 'chop') {
      const t = this.target;
      if (!t || t.state !== 'alive') { this.mode = 'seek'; this.target = null; }
      else {
        this.chopT += dt * 11;
        tx = this.x; tz = this.z;
        ctx.chop(t, ctx.power * dt, this);
        if (t.state !== 'alive') { this.mode = 'wait'; this.waitT = 0.55; }
      }
    }

    if (this.mode === 'wait') {
      this.waitT -= dt;
      tx = this.x; tz = this.z;
      // Не убегаем от брёвен: сначала даём магнитной анимации закончиться.
      // Отрицательный лимит — страховка на случай переполненного пула эффектов.
      if (this.waitT <= 0 && (this.pendingLogs <= 0 || this.waitT <= -1.0)) {
        this.release();
        this.mode = this.carry >= ctx.bag ? 'mill' : 'seek';
      }
    }

    if (this.mode === 'mill') {
      tx = 3.0; tz = 0;
      arrive = 3.6;
      const d = Math.hypot(tx - this.x, tz - this.z);
      if (d < arrive) {
        ctx.deliver(this);
        this.mode = 'seek';
      }
    }

    // Движение к цели
    const dx = tx - this.x, dz = tz - this.z;
    const d = Math.hypot(dx, dz);
    if (d > arrive * 0.7 && this.mode !== 'chop' && this.mode !== 'wait') {
      const step = Math.min(speed * dt, d);
      this.x += (dx / d) * step;
      this.z += (dz / d) * step;
      this.moveAmt = Math.min(1, this.moveAmt + dt * 6);
      this.ry = angleLerp(this.ry, Math.atan2(dx, dz), Math.min(1, dt * 9));
      this.phase += dt * (5.0 + speed * 0.5);
    } else {
      this.moveAmt = Math.max(0, this.moveAmt - dt * 8);
      if (this.mode === 'chop' && this.target) {
        this.ry = angleLerp(this.ry, Math.atan2(this.target.x - this.x, this.target.z - this.z), Math.min(1, dt * 9));
      }
    }
    if (this.mode !== 'chop') this.chopT = 0;
  }

  draw(rd, carryColor, tier) {
    m4.compose(base, this.x, 0, this.z, 0, this.ry, 0, this.scale, this.scale, this.scale);
    drawCharacter(rd, base, {
      palette: this.pal,
      phase: this.phase,
      moveAmt: this.moveAmt,
      chopAmt: this.mode === 'chop' ? this.chopT : 0,
      tier: Math.min(1, tier | 0),
      carryVisual: Math.min(12, this.carry | 0),
      carryColor,
    });
  }
}

export class HelperCrew {
  constructor() { this.list = []; }

  sync(n) {
    while (this.list.length < n) this.list.push(new Helper(this.list.length));
    while (this.list.length > n) { const h = this.list.pop(); h.release(); }
  }

  update(dt, ctx) { for (const h of this.list) h.update(dt, ctx); }
  draw(rd, col, tier) { for (const h of this.list) h.draw(rd, col, tier); }
}
