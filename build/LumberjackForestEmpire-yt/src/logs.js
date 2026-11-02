// Летающие брёвна: разлёт из дерева, магнит к персонажу, сдача на лесопилку.
import { G } from './world.js';
import { m4, rand, TAU } from './math.js';

const MAX = 520;
const mat = m4.create();

export class LogSwarm {
  constructor() {
    this.pool = [];
    this.free = [];
    for (let i = 0; i < MAX; i++) {
      this.pool.push({ active: false, i, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, spin: 0, rot: 0, ry: 0, t: 0, mode: 0, col: null, target: null, onArrive: null, len: 1, r: 0.16, speed: 0 });
      this.free.push(i);
    }
    this.cursor = 0;
  }

  // Свободные слоты держим списком: при большом радиусе за кадр рождаются
  // сотни брёвен, и линейный поиск по пулу становится узким местом
  spawn(x, y, z, col, target, onArrive, burst = true, scale = 1) {
    let l;
    if (this.free.length) {
      l = this.pool[this.free.pop()];
    } else {
      l = this.pool[this.cursor];
      this.cursor = (this.cursor + 1) % MAX;
      if (l.active && l.onArrive) l.onArrive(l);   // не теряем брёвна при переполнении
    }
    l.active = true;
    l.x = x; l.y = y; l.z = z;
    l.col = col;
    l.target = target; l.onArrive = onArrive;
    l.t = 0; l.speed = 6;
    l.len = rand(0.75, 1.05) * scale;
    l.r = rand(0.13, 0.19) * scale;
    l.ry = Math.random() * TAU;
    l.rot = Math.random() * TAU;
    l.spin = rand(-9, 9);
    if (burst) {
      const a = Math.random() * TAU, s = rand(2.5, 6.0);
      l.vx = Math.cos(a) * s; l.vz = Math.sin(a) * s; l.vy = rand(5, 9.5);
      l.mode = 0;
    } else {
      const a = Math.random() * TAU, s = rand(1.5, 3.5);
      l.vx = Math.cos(a) * s; l.vz = Math.sin(a) * s; l.vy = rand(4, 6.5);
      l.mode = 0; l.t = 0.16;
    }
    return l;
  }

  update(dt) {
    for (const l of this.pool) {
      if (!l.active) continue;
      l.t += dt;
      l.rot += l.spin * dt;
      if (l.mode === 0) {
        l.vy -= 26 * dt;
        l.x += l.vx * dt; l.y += l.vy * dt; l.z += l.vz * dt;
        if (l.y < 0.25) { l.y = 0.25; l.vy *= -0.35; l.vx *= 0.6; l.vz *= 0.6; }
        if (l.t > 0.3) { l.mode = 1; l.speed = Math.hypot(l.vx, l.vy, l.vz) * 0.4 + 4; }
      } else {
        const tg = l.target;
        if (!tg) { l.active = false; this.free.push(l.i); continue; }
        const tx = tg.x, ty = (tg.y || 0) + 1.1, tz = tg.z;
        let dx = tx - l.x, dy = ty - l.y, dz = tz - l.z;
        const d = Math.hypot(dx, dy, dz) || 1;
        const fastTarget = Math.max(0, +(tg.logMagnetSpeed || 0));
        const maxSpeed = fastTarget || 34;
        l.speed = Math.min(l.speed + (fastTarget ? 460 : 62) * dt, maxSpeed);
        // Быстрый помощник не должен обгонять собственную добычу.
        const chaseSpeed = fastTarget ? Math.min(maxSpeed, Math.max(l.speed, d * 10)) : l.speed;
        const step = Math.min(chaseSpeed * dt, d);
        l.x += (dx / d) * step; l.y += (dy / d) * step; l.z += (dz / d) * step;
        l.spin += dt * 26;
        if (d < 0.85 || l.t > 4) {
          l.active = false;
          this.free.push(l.i);
          l.onArrive && l.onArrive(l);
        }
      }
    }
  }

  draw(rd) {
    for (const l of this.pool) {
      if (!l.active) continue;
      m4.compose(mat, l.x, l.y, l.z, 0, l.ry, Math.PI / 2 + l.rot, l.r, l.len, l.r);
      rd.push(G.cylC, mat, l.col);
    }
  }

  clear() {
    this.free.length = 0;
    for (const l of this.pool) { l.active = false; this.free.push(l.i); }
  }
}

// Куча брёвен на лесопилке — чисто визуальная, тает со временем
export class LogPile {
  constructor(x, z, y) {
    this.x = x; this.z = z; this.y = y;
    this.count = 0;
    this.items = [];
  }

  add(col) {
    this.count = Math.min(this.count + 1, 45);
    this.items.push({ col, t: 0 });
    if (this.items.length > 45) this.items.shift();
  }

  update(dt) {
    for (const it of this.items) it.t += dt;
    while (this.items.length && this.items[0].t > 7) this.items.shift();
    this.count = this.items.length;
  }

  draw(rd) {
    // Ровный прямоугольный короб строго внутри приёмной площадки: в каждом
    // слое 3 бревна в длину × 5 рядов в глубину, всего три слоя. Все брёвна
    // параллельны и слегка соприкасаются, поэтому штабель выглядит цельным,
    // не рассыпается и не висит над настилом.
    const columns = 3, rows = 5, perLayer = columns * rows;
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      const layer = Math.floor(i / perLayer), slot = i % perLayer;
      const column = slot % columns, row = Math.floor(slot / columns);
      const fade = it.t > 6 ? 1 - (it.t - 6) : 1;
      m4.compose(mat,
        this.x + (column - (columns - 1) / 2) * 0.98,
        this.y + layer * 0.34,
        this.z + (row - (rows - 1) / 2) * 0.36,
        0, 0, Math.PI / 2,
        0.18 * fade, 1.0, 0.18 * fade);
      rd.push(G.cylC, mat, it.col);
    }
  }
}
