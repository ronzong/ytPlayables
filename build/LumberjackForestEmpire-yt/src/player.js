// Персонаж игрока: движение, столкновения, анимация.
import { PLAYER } from './config.js';
import { drawUnit, PALETTES } from './character.js';
import { props, G } from './world.js';
import { m4, damp, angleLerp, clamp } from './math.js';

const base = m4.create();

export class Player {
  constructor() {
    this.x = 0; this.z = 14.5;
    this.vx = 0; this.vz = 0;
    this.ry = Math.PI;
    this.phase = 0;
    this.chopT = 0;
    this.chopping = false;
    this.moveAmt = 0;
    this.wheelPhase = 0;
  }

  update(dt, dir, speed, limitR) {
    const tx = dir.x * speed * dir.mag;
    const tz = dir.y * speed * dir.mag;
    const k = dir.mag > 0 ? PLAYER.accel : PLAYER.friction;
    this.vx = damp(this.vx, tx, k / 3, dt);
    this.vz = damp(this.vz, tz, k / 3, dt);

    this.x += this.vx * dt;
    this.z += this.vz * dt;

    // Препятствия
    for (const p of props) {
      const dx = this.x - p.x, dz = this.z - p.z;
      const rr = p.r + PLAYER.radius;
      const d2 = dx * dx + dz * dz;
      if (d2 < rr * rr && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        this.x = p.x + (dx / d) * rr;
        this.z = p.z + (dz / d) * rr;
      }
    }

    // Граница открытой территории
    const r = Math.hypot(this.x, this.z);
    if (r > limitR) {
      this.x = (this.x / r) * limitR;
      this.z = (this.z / r) * limitR;
      this.vx *= 0.4; this.vz *= 0.4;
    }

    const sp = Math.hypot(this.vx, this.vz);
    this.wheelPhase += (sp * dt) / 0.55;
    this.moveAmt = clamp(sp / Math.max(speed, 0.001), 0, 1);
    if (sp > 0.35) {
      this.ry = angleLerp(this.ry, Math.atan2(this.vx, this.vz), Math.min(1, dt * PLAYER.turnSpeed));
      this.phase += dt * (5.2 + sp * 0.55);
    } else {
      this.phase = damp(this.phase % (Math.PI * 2), 0, 6, dt) + Math.floor(this.phase / (Math.PI * 2)) * Math.PI * 2;
      this.moveAmt = damp(this.moveAmt, 0, 10, dt);
    }

    if (this.chopping) this.chopT += dt * 11; else this.chopT = 0;
  }

  draw(rd, carryVisual, carryColor, tier) {
    m4.compose(base, this.x, 0, this.z, 0, this.ry, 0, 1, 1, 1);
    drawUnit(rd, base, {
      palette: PALETTES.player,
      phase: this.phase,
      moveAmt: this.moveAmt,
      chopAmt: this.chopping ? this.chopT : 0,
      wheelPhase: this.wheelPhase,
      tier: tier | 0,
      carryVisual, carryColor,
    });
  }
}
