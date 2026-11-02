// Эффекты: щепки, монеты, всплывающие числа.
import { G } from './world.js';
import { m4, rand, TAU } from './math.js';

const mat = m4.create();

export class Chips {
  constructor(n = 260) {
    this.pool = [];
    for (let i = 0; i < n; i++) this.pool.push({ a: false });
    this.i = 0;
  }

  burst(x, y, z, col, n = 5, power = 1) {
    for (let k = 0; k < n; k++) {
      const p = this.pool[this.i]; this.i = (this.i + 1) % this.pool.length;
      const a = Math.random() * TAU, s = rand(1.5, 5) * power;
      p.a = true; p.x = x; p.y = y; p.z = z;
      p.vx = Math.cos(a) * s; p.vz = Math.sin(a) * s; p.vy = rand(2.5, 7) * power;
      p.rx = Math.random() * TAU; p.ry = Math.random() * TAU; p.rz = Math.random() * TAU;
      p.sx = rand(6, 12) * dtSpin(); p.life = rand(0.5, 1.0); p.t = 0;
      p.s = rand(0.07, 0.17); p.col = col;
    }
  }

  update(dt) {
    for (const p of this.pool) {
      if (!p.a) continue;
      p.t += dt;
      if (p.t > p.life) { p.a = false; continue; }
      p.vy -= 26 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.rx += p.sx * dt; p.ry += p.sx * 0.7 * dt;
      if (p.y < 0.04) { p.y = 0.04; p.vy *= -0.3; p.vx *= 0.7; p.vz *= 0.7; }
    }
  }

  draw(rd) {
    for (const p of this.pool) {
      if (!p.a) continue;
      const k = 1 - p.t / p.life;
      const s = p.s * (0.4 + k * 0.6);
      m4.compose(mat, p.x, p.y, p.z, p.rx, p.ry, p.rz, s, s * 1.7, s * 0.6);
      rd.push(G.boxC, mat, p.col);
    }
  }
}

function dtSpin() { return Math.random() < 0.5 ? -1 : 1; }

export class Coins {
  constructor(n = 90) {
    this.pool = [];
    for (let i = 0; i < n; i++) this.pool.push({ a: false });
    this.i = 0;
  }

  burst(x, y, z, n = 3) {
    for (let k = 0; k < n; k++) {
      const p = this.pool[this.i]; this.i = (this.i + 1) % this.pool.length;
      const a = Math.random() * TAU, s = rand(0.8, 2.6);
      p.a = true; p.x = x; p.y = y; p.z = z;
      p.vx = Math.cos(a) * s; p.vz = Math.sin(a) * s; p.vy = rand(4.5, 7.5);
      p.rot = Math.random() * TAU; p.spin = rand(8, 16);
      p.t = 0; p.life = rand(0.7, 1.1);
    }
  }

  update(dt) {
    for (const p of this.pool) {
      if (!p.a) continue;
      p.t += dt;
      if (p.t > p.life) { p.a = false; continue; }
      p.vy -= 11 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.rot += p.spin * dt;
    }
  }

  draw(rd) {
    const col = [1, 1, 1, 0.55];
    for (const p of this.pool) {
      if (!p.a) continue;
      const k = 1 - p.t / p.life;
      const s = 0.26 * (0.5 + k * 0.8);
      m4.compose(mat, p.x, p.y, p.z, Math.PI / 2, p.rot, 0, s, s, s);
      rd.push(G.coin, mat, col);
    }
  }
}

// Всплывающие числа в DOM, позиционируются проекцией из мира
export class FloatText {
  constructor(layer, max = 384) {
    this.layer = layer;
    this.items = [];
    for (let i = 0; i < max; i++) {
      const el = document.createElement('div');
      el.className = 'float-num';
      el.style.display = 'none';
      layer.appendChild(el);
      this.items.push({ el, a: false });
    }
    this.i = 0;
  }

  spawn(x, y, z, text, cls = '') {
    const it = this.items[this.i]; this.i = (this.i + 1) % this.items.length;
    it.a = true; it.x = x; it.y = y; it.z = z; it.t = 0; it.life = 1.15;
    it.el.textContent = text;
    it.el.className = 'float-num ' + cls;
    it.el.style.display = 'block';
  }

  update(dt, viewProj, w, h) {
    for (const it of this.items) {
      if (!it.a) continue;
      it.t += dt;
      if (it.t > it.life) { it.a = false; it.el.style.display = 'none'; continue; }
      const k = it.t / it.life;
      const y = it.y + k * 1.9;
      const p = project(it.x, y, it.z, viewProj, w, h);
      if (!p) { it.el.style.display = 'none'; continue; }
      it.el.style.display = 'block';
      it.el.style.transform = `translate(-50%,-50%) translate(${p.x}px, ${p.y}px) scale(${1 + (1 - k) * 0.25})`;
      it.el.style.opacity = String(k < 0.15 ? k / 0.15 : 1 - Math.pow((k - 0.15) / 0.85, 2));
    }
  }
}

export function project(x, y, z, m, w, h) {
  const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (cw <= 0.01) return null;
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  return { x: (cx / cw * 0.5 + 0.5) * w, y: (-cy / cw * 0.5 + 0.5) * h };
}
