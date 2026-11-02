// Лес: расстановка по кольцам, рубка, падение, респавн, прокрутка вглубь.
import { RINGS, speciesAt } from './config.js';
import { G } from './world.js';
import { hex } from './geometry.js';
import { m4, rand, clamp, TAU, lerp } from './math.js';
import { part } from './rig.js';

const CELL = 8;
const scratchA = m4.create();

const colorCache = new Map();
export function speciesColors(sp) {
  let c = colorCache.get(sp.index);
  if (!c) {
    c = { trunk: hex(sp.trunk), crown: hex(sp.crownCol), log: hex(sp.logCol), ground: hex(sp.ground) };
    c.logCol = [c.log[0], c.log[1], c.log[2], sp.glow * 0.5];
    colorCache.set(sp.index, c);
  }
  return c;
}

// Стабильный радужный цвет по позиции дерева с медленной анимацией.
export function rainbowRgb(x, z, time = 0, offset = 0) {
  let h = (Math.atan2(z, x) / TAU + Math.hypot(x, z) * 0.018 + time * 0.08 + offset) % 1;
  if (h < 0) h += 1;
  const k = (n) => (n + h * 6) % 6;
  const f = (n) => 0.28 + 0.72 * (1 - clamp(Math.min(k(n), 4 - k(n)), 0, 1));
  return [f(5), f(3), f(1)];
}

export class Forest {
  constructor(density, scroll) {
    this.trees = [];
    this.grid = new Map();
    this.generate(density, scroll);
  }

  key(x, z) { return ((x / CELL) | 0) + ',' + ((z / CELL) | 0); }

  addToGrid(t) {
    const k = this.key(t.x, t.z);
    let a = this.grid.get(k);
    if (!a) { a = []; this.grid.set(k, a); }
    a.push(t);
  }

  generate(density = 1, scroll = 0) {
    this.trees.length = 0;
    this.grid.clear();
    for (const ring of RINGS) {
      const sp = speciesAt(scroll + ring.i);
      const want = Math.round(ring.trees * density);
      const minGap = Math.max(3.4, sp.crownR * 1.25 + 1.6) * clamp(1 / Math.sqrt(density), 0.62, 1);
      let placed = 0, guard = 0;
      while (placed < want && guard < want * 70) {
        guard++;
        const a = Math.random() * TAU;
        const r = ring.inner + 2.2 + Math.random() * (ring.outer - ring.inner - 4.4);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        let ok = true;
        for (const t of this.trees) {
          if ((t.x - x) ** 2 + (t.z - z) ** 2 < minGap * minGap) { ok = false; break; }
        }
        if (!ok) continue;
        const scale = rand(0.85, 1.18);
        const t = {
          x, z, ring: ring.i, sp,
          maxHp: sp.hp * scale, hp: sp.hp * scale,
          ry: Math.random() * TAU, scale,
          state: 'alive', fallT: 0, fallRy: 0, grow: 1,
          shake: 0, respawnT: 0, tint: rand(0.9, 1.1), claimed: null,
        };
        this.trees.push(t);
        this.addToGrid(t);
        placed++;
      }
    }
  }

  // После прокрутки леса все деревья перерождаются в новую породу
  rescroll(scroll) {
    for (const t of this.trees) {
      t.sp = speciesAt(scroll + t.ring);
      t.maxHp = t.sp.hp * t.scale;
      t.hp = t.maxHp;
      t.state = 'growing';
      t.grow = Math.random() * 0.25;
      t.fallT = 0;
      t.shake = 0;
      t.claimed = null;
    }
  }

  query(x, z, r, out) {
    out.length = 0;
    const cx = (x / CELL) | 0, cz = (z / CELL) | 0;
    const rad = Math.ceil(r / CELL) + 1;
    const r2 = r * r;
    for (let i = cx - rad; i <= cx + rad; i++) {
      for (let j = cz - rad; j <= cz + rad; j++) {
        const a = this.grid.get(i + ',' + j);
        if (!a) continue;
        for (const t of a) {
          if (t.state !== 'alive') continue;
          const dx = t.x - x, dz = t.z - z;
          if (dx * dx + dz * dz <= r2) out.push(t);
        }
      }
    }
    return out;
  }

  chop(t, dmg, fromX, fromZ) {
    if (t.state !== 'alive') return false;
    t.hp -= dmg;
    t.shake = Math.min(1, t.shake + 0.5);
    if (t.hp <= 0) {
      t.state = 'falling';
      t.fallT = 0;
      const dx = t.x - fromX, dz = t.z - fromZ;
      const l = Math.hypot(dx, dz) || 1;
      t.fallRy = Math.atan2(dx / l, dz / l);
      return true;
    }
    return false;
  }

  update(dt, onFell) {
    for (const t of this.trees) {
      if (t.shake > 0) t.shake = Math.max(0, t.shake - dt * 3.2);
      if (t.state === 'falling') {
        t.fallT += dt * 2.6;
        if (t.fallT >= 1) {
          t.state = 'gone';
          t.respawnT = t.sp.respawn;
          t.grow = 0;
          onFell && onFell(t);
        }
      } else if (t.state === 'gone') {
        t.respawnT -= dt;
        if (t.respawnT <= 0) { t.state = 'growing'; t.grow = 0; t.hp = t.maxHp; }
      } else if (t.state === 'growing') {
        t.grow = Math.min(1, t.grow + dt * 1.8);
        if (t.grow >= 1) t.state = 'alive';
      }
    }
  }

  draw(rd, camX, camZ, viewR, maxRing, rainbow = 0, time = 0) {
    const vr2 = viewR * viewR;
    for (const t of this.trees) {
      if (t.state === 'gone' || t.ring > maxRing) continue;
      const dx = t.x - camX, dz = t.z - camZ;
      if (dx * dx + dz * dz > vr2) continue;
      this.drawTree(rd, t, rainbow, time);
    }
  }

  drawTree(rd, t, rainbow = 0, time = 0) {
    const sp = t.sp;
    const c = speciesColors(sp);
    const grow = t.state === 'growing' ? t.grow : 1;
    let tilt = 0;
    if (t.state === 'falling') {
      const p = t.fallT;
      tilt = (Math.PI / 2) * (p < 0.35 ? (p / 0.35) * (p / 0.35) * 0.28 : 0.28 + Math.pow((p - 0.35) / 0.65, 0.8) * 0.72);
    }
    const shakeR = t.shake > 0 ? Math.sin(performance.now() * 0.045) * t.shake * 0.05 : 0;
    const s = t.scale * grow;
    const h = sp.height * s;

    m4.compose(scratchA, t.x, 0, t.z, tilt + shakeR, t.fallRy || t.ry, 0, 1, 1, 1);
    const hurt = t.state === 'alive' ? clamp(t.hp / t.maxHp, 0, 1) : 1;
    const flash = lerp(1.25, 1, hurt);
    const rt = rainbow > 0 ? rainbowRgb(t.x, t.z, time, 0.08) : c.trunk;
    const rc = rainbow > 0 ? rainbowRgb(t.x, t.z, time, 0.42) : c.crown;
    const col = [rt[0] * t.tint * flash, rt[1] * t.tint, rt[2] * t.tint, rainbow > 0 ? 0.35 : sp.glow * 0.4];
    part(rd, G.cylTaper, scratchA, 0, 0, 0, 0, t.ry, 0, sp.trunkR * s, h, sp.trunkR * s, col);

    const cc = [rc[0] * t.tint * flash, rc[1] * t.tint, rc[2] * t.tint, rainbow > 0 ? 0.65 : sp.glow];
    const R = sp.crownR * s;

    if (sp.crown === 'cone3') {
      const levels = [[0.26, 1.0], [0.5, 0.78], [0.72, 0.5]];
      for (const [yy, rr] of levels) {
        part(rd, G.cone, scratchA, 0, h * yy, 0, 0, t.ry, 0,
          R * rr, sp.crownH * s * (1.15 - yy * 0.5), R * rr, cc);
      }
    } else if (sp.crown === 'crystal') {
      // Гранёный кристалл: вытянутый октаэдр из двух конусов плюс осколки
      const CH = sp.crownH * s;
      part(rd, G.cone, scratchA, 0, h * 0.62, 0, 0, t.ry, 0, R * 0.72, CH * 1.15, R * 0.72, cc);
      part(rd, G.cone, scratchA, 0, h * 0.62 + CH * 0.02, 0, Math.PI, t.ry, 0, R * 0.72, CH * 0.55, R * 0.72, cc);
      for (let i = 0; i < 3; i++) {
        const a = t.ry + (i / 3) * TAU;
        part(rd, G.cone, scratchA, Math.cos(a) * R * 0.62, h * 0.5, Math.sin(a) * R * 0.62,
          0, a, 0, R * 0.3, CH * 0.62, R * 0.3, cc);
      }
    } else {
      part(rd, G.ico1, scratchA, 0, h * 0.8, 0, 0, t.ry, 0, R, sp.crownH * s * 0.66, R, cc);
      part(rd, G.ico0, scratchA, R * 0.62, h * 0.63, R * 0.2, 0, t.ry * 1.7, 0, R * 0.62, R * 0.52, R * 0.62, cc);
      part(rd, G.ico0, scratchA, -R * 0.55, h * 0.68, -R * 0.35, 0, t.ry * 0.6, 0, R * 0.58, R * 0.48, R * 0.58, cc);
    }
  }
}
