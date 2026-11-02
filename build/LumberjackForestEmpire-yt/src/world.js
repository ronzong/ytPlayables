// Геометрия мира: остров, вода, лесопилка, заборы, декор.
import { Builder, Geometry, hex } from './geometry.js';
import { WORLD, RINGS } from './config.js';
import { hash2, rand, TAU } from './math.js';

export const G = {};
export const props = [];   // столкновения с декором: {x, z, r}
export const decor = [];   // {geo, x, y, z, ry, s, col}

function jitter(col, k) {
  return [
    Math.min(1, col[0] * k), Math.min(1, col[1] * k), Math.min(1, col[2] * k),
  ];
}

// Земля строится по единой сетке вершин, но раскладывается в отдельные меши:
// площадь, пять колец и берег. Кольца тонируются отдельно — при прокрутке
// леса достаточно поменять цвет инстанса.
function buildGround() {
  const SEG = 84;
  const hAt = (r) => (r <= 85 ? 0 : -(Math.pow((r - 85) / (WORLD.islandRadius - 85), 1.7) * 3.4));

  // band: [r0, r1, steps, куда складывать]
  const bands = [
    [0, 10.5, 4, 'plaza', hex(0x9A8465)],
    [10.5, 12.5, 1, 'plaza', hex(0xB09A76)],
  ];
  for (const r of RINGS) {
    bands.push([r.inner, r.outer, Math.max(3, Math.round((r.outer - r.inner) / 2.4)), 'ring' + r.i, [1, 1, 1]]);
  }
  bands.push([85, 88.5, 2, 'shore', hex(0xE3D5A4)], [88.5, WORLD.islandRadius, 2, 'shore', hex(0xD9C894)]);

  const radii = [0], bandOf = [0];
  for (let bi = 0; bi < bands.length; bi++) {
    const [r0, r1, steps] = bands[bi];
    for (let s = 1; s <= steps; s++) { radii.push(r0 + ((r1 - r0) * s) / steps); bandOf.push(bi); }
  }
  const RN = radii.length;
  const vx = new Float32Array(RN * SEG), vy = new Float32Array(RN * SEG), vz = new Float32Array(RN * SEG);
  for (let ri = 0; ri < RN; ri++) {
    const r = radii[ri];
    const edge = ri === 0 || ri >= RN - 2;
    const gap = Math.min(ri > 0 ? r - radii[ri - 1] : 99, ri < RN - 1 ? radii[ri + 1] - r : 99);
    const amp = Math.min(1.5, gap * 0.55);
    for (let si = 0; si < SEG; si++) {
      const jr = edge ? 0 : (hash2(ri * 3.7 + 1.3, si * 5.1) - 0.5) * amp;
      const ja = edge ? 0 : (hash2(si * 2.9 + 7.7, ri * 1.9) - 0.5) * 0.022;
      const rr = Math.max(0, r + jr);
      const aa = (si / SEG) * TAU + ja;
      const idx = ri * SEG + si;
      vx[idx] = Math.cos(aa) * rr; vz[idx] = Math.sin(aa) * rr; vy[idx] = hAt(r);
    }
  }

  const builders = {};
  const get = (k) => (builders[k] || (builders[k] = new Builder()));
  for (let ri = 0; ri < RN - 1; ri++) {
    const band = bands[bandOf[ri + 1]];
    const b = get(band[3]);
    const col = band[4];
    for (let si = 0; si < SEG; si++) {
      const s1 = (si + 1) % SEG;
      const i00 = ri * SEG + si, i01 = ri * SEG + s1;
      const i10 = (ri + 1) * SEG + si, i11 = (ri + 1) * SEG + s1;
      const k1 = 0.93 + hash2(ri * 1.7 + 0.5, si * 3.1) * 0.14;
      const k2 = 0.93 + hash2(ri * 2.3 + 9.1, si * 5.7) * 0.14;
      if (ri === 0) {
        b.tri(vx[i00], vy[i00], vz[i00], vx[i11], vy[i11], vz[i11], vx[i10], vy[i10], vz[i10], jitter(col, k1));
      } else {
        b.tri(vx[i00], vy[i00], vz[i00], vx[i01], vy[i01], vz[i01], vx[i11], vy[i11], vz[i11], jitter(col, k1));
        b.tri(vx[i00], vy[i00], vz[i00], vx[i11], vy[i11], vz[i11], vx[i10], vy[i10], vz[i10], jitter(col, k2));
      }
    }
  }
  return builders;
}

// Плоский шеврон-указатель, смотрит в +Z
function buildChevron() {
  const b = new Builder(), c = [1, 1, 1];
  const P = (x, z) => [x, 0, z];
  b.quad(P(-0.5, -0.62), P(-0.5, -0.30), P(0, 0.20), P(0, -0.12), c);
  b.quad(P(0, 0.20), P(0.5, -0.30), P(0.5, -0.62), P(0, -0.12), c);
  return b;
}

// Плоская полоса-дорога, единичная по длине (вдоль +Z) и ширине
function buildRoadSeg() {
  const b = new Builder(), c = [1, 1, 1];
  b.quad([-0.5, 0, 0], [-0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 0], c);
  return b;
}

function buildWater() {
  const b = new Builder();
  const R = 300, SEG = 48;
  const col = hex(0x3E86C4);
  for (let i = 0; i < SEG; i++) {
    const a0 = (i / SEG) * TAU, a1 = ((i + 1) / SEG) * TAU;
    b.tri(0, 0, 0, R * Math.cos(a1), 0, R * Math.sin(a1), R * Math.cos(a0), 0, R * Math.sin(a0),
      jitter(col, 0.96 + hash2(i, 3) * 0.09));
  }
  return b;
}

function buildSawmill() {
  const b = new Builder();
  const wood = hex(0x8A5A36), woodD = hex(0x6B4327), roof = hex(0xC24B3F);
  const stone = hex(0xB9B2A4), metal = hex(0x7C8894);

  // Плоский настил вровень с землёй — персонаж по нему просто бегает
  b.disc(0, 0.05, 0, 10.4, 5, 56, hex(0xB79A72));
  b.annulus(0, 0.07, 0, 9.2, 10.4, 56, hex(0x9C7C56));
  b.annulus(0, 0.09, 0, 9.35, 9.75, 56, hex(0xE0B45C));

  // Домик лесопилки
  const hx = -6.6, hz = 0;
  b.box(hx, 0.1, hz, 5.4, 3.2, 4.4, wood, 0.4);
  b.box(hx, 3.3, hz, 6.1, 0.35, 5.1, woodD, 0.4);
  b.cyl(hx, 3.64, hz, 3.6, 0.0, 2.3, 4, roof, false, false);
  b.box(hx - 1.2, 3.64, hz + 1.0, 0.7, 2.0, 0.7, stone, 0.4);
  b.box(hx + 2.5, 0.1, hz + 0.4, 0.15, 2.0, 1.2, hex(0x4A2F1C), 0.4);
  b.cyl(hx + 1.2, 1.7, hz - 2.6, 1.0, 1.0, 0.12, 18, metal, true, true);

  // Приёмная площадка под брёвна
  b.disc(3.0, 0.12, 0, 3.3, 3, 26, hex(0x8B6A45));
  b.annulus(3.0, 0.14, 0, 3.0, 3.3, 26, hex(0x6B4A2F));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    b.box(3.0 + Math.cos(a) * 3.5, 0.06, Math.sin(a) * 3.5, 0.3, 1.2, 0.3, woodD);
  }

  // Столбы с фонарями по краю настила
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.39;
    const px = Math.cos(a) * 9.9, pz = Math.sin(a) * 9.9;
    b.cyl(px, 0.06, pz, 0.17, 0.14, 1.7, 6, woodD);
    b.box(px, 1.76, pz, 0.5, 0.5, 0.5, hex(0xFFF3C0));
    b.cyl(px, 2.26, pz, 0.4, 0.0, 0.34, 5, hex(0x4A3524));
  }
  return b;
}

function buildFencePost() {
  const b = new Builder();
  const wood = hex(0x7B5433), dark = hex(0x5C3D24);
  b.box(0, 0, 0, 0.32, 2.5, 0.32, wood);
  b.cyl(0, 2.5, 0, 0.24, 0.0, 0.34, 5, dark);
  return b;
}

function buildFenceRail() {
  const b = new Builder();
  b.box(0, 1.15, 0, 1, 0.24, 0.16, hex(0x6E4A2C));
  b.box(0, 1.85, 0, 1, 0.24, 0.16, hex(0x7B5433));
  return b;
}

function buildRock() {
  const b = new Builder();
  b.ico(0, 0, 0, 1, 1, hex(0x9AA0A6), 0.72);
  return b;
}

function buildBush() {
  const b = new Builder();
  b.ico(0, 0.55, 0, 0.8, 1, hex(0x4E9A48), 0.85);
  b.ico(0.55, 0.35, 0.3, 0.55, 1, hex(0x58A852), 0.85);
  b.ico(-0.45, 0.32, -0.25, 0.5, 1, hex(0x46903F), 0.85);
  return b;
}

function buildStump() {
  const b = new Builder();
  b.cyl(0, 0, 0, 0.55, 0.5, 0.55, 9, hex(0x6B4A2F));
  b.cyl(0, 0.55, 0, 0.5, 0.5, 0.06, 9, hex(0xC49A6C));
  return b;
}

function buildRing() {
  return new Builder().annulus(0, 0, 0, 0.9, 1.0, 56, [1, 1, 1]);
}

function buildCoin() {
  const b = new Builder();
  b.cyl(0, -0.06, 0, 1, 1, 0.12, 10, hex(0xFFD34D));
  return b;
}

function buildArrow() {
  const b = new Builder();
  b.cyl(0, 0, 0, 1, 0, 1.6, 4, hex(0xFFE066));
  return b;
}

export function buildWorld(gl, sawmillModel = null, machineModels = {}) {
  // Инстансируемые примитивы (единичный размер)
  const u = (fn) => fn().build(gl);
  G.cylY = u(() => new Builder().cyl(0, 0, 0, 1, 1, 1, 9, [1, 1, 1]));
  G.cylTaper = u(() => new Builder().cyl(0, 0, 0, 1, 0.72, 1, 9, [1, 1, 1]));
  G.cylC = u(() => new Builder().cyl(0, -0.5, 0, 1, 1, 1, 8, [1, 1, 1]));
  G.cone = u(() => new Builder().cyl(0, 0, 0, 1, 0, 1, 7, [1, 1, 1]));
  G.box = u(() => new Builder().box(0, 0, 0, 1, 1, 1, [1, 1, 1]));
  G.boxC = u(() => new Builder().box(0, -0.5, 0, 1, 1, 1, [1, 1, 1]));
  G.ico1 = u(() => new Builder().ico(0, 0, 0, 1, 1, [1, 1, 1]));
  G.ico0 = u(() => new Builder().ico(0, 0, 0, 1, 0, [1, 1, 1]));
  G.disc = u(() => new Builder().disc(0, 0, 0, 1, 3, 24, [1, 1, 1]));

  const gb = buildGround();
  G.groundPlaza = gb.plaza.build(gl);
  G.groundShore = gb.shore.build(gl);
  G.ringGround = RINGS.map((r) => gb['ring' + r.i].build(gl));
  G.chevron = buildChevron().build(gl);
  G.roadSeg = buildRoadSeg().build(gl);
  G.water = buildWater().build(gl);
  // Новый GLB использует ту же систему координат и vertex colors, что и игра.
  // Процедурная версия остаётся безопасным fallback при ошибке загрузки файла.
  G.sawmill = sawmillModel
    ? new Geometry(gl, sawmillModel.pos, sawmillModel.nor, sawmillModel.col)
    : buildSawmill().build(gl);
  G.machineMini = machineModels[2]
    ? new Geometry(gl, machineModels[2].pos, machineModels[2].nor, machineModels[2].col) : null;
  G.machineFull = machineModels[3]
    ? new Geometry(gl, machineModels[3].pos, machineModels[3].nor, machineModels[3].col) : null;
  G.machineMega = machineModels[4]
    ? new Geometry(gl, machineModels[4].pos, machineModels[4].nor, machineModels[4].col) : null;
  G.post = buildFencePost().build(gl);
  G.rail = buildFenceRail().build(gl);
  G.rock = buildRock().build(gl);
  G.bush = buildBush().build(gl);
  G.stump = buildStump().build(gl);
  G.coin = buildCoin().build(gl);
  G.ring = buildRing().build(gl);
  G.arrow = buildArrow().build(gl);

  buildDecor();
  return G;
}

function buildDecor() {
  decor.length = 0; props.length = 0;

  // Камни и кусты по всему острову
  for (let i = 0; i < 190; i++) {
    const a = Math.random() * TAU;
    const r = 13 + Math.pow(Math.random(), 0.7) * 71;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const roll = Math.random();
    if (roll < 0.3) {
      const s = rand(0.5, 1.5);
      decor.push({ geo: G.rock, x, y: -0.15, z, ry: Math.random() * TAU, sx: s, sy: s * rand(0.7, 1.2), sz: s, col: [rand(0.85, 1.05), rand(0.85, 1.05), rand(0.88, 1.05), 0] });
      if (s > 1.0) props.push({ x, z, r: s * 0.8 });
    } else if (roll < 0.75) {
      const s = rand(0.6, 1.25);
      decor.push({ geo: G.bush, x, y: 0, z, ry: Math.random() * TAU, sx: s, sy: s, sz: s, col: [rand(0.85, 1.1), rand(0.9, 1.1), rand(0.85, 1.05), 0] });
    } else {
      const s = rand(0.7, 1.1);
      decor.push({ geo: G.stump, x, y: 0, z, ry: Math.random() * TAU, sx: s, sy: s, sz: s, col: [1, 1, 1, 0] });
    }
  }

  // Трава-кустики на площади
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * TAU, r = rand(11, 12.4);
    decor.push({ geo: G.bush, x: Math.cos(a) * r, y: 0, z: Math.sin(a) * r, ry: Math.random() * TAU, sx: 0.5, sy: 0.5, sz: 0.5, col: [1, 1, 1, 0] });
  }

  // Домик лесопилки — препятствие
  props.push({ x: -6.4, z: 0, r: 3.1 });
}

// Точка внутри проёма забора?
export function inGate(angle) {
  let d = ((angle - WORLD.gateAngle + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return Math.abs(d) < WORLD.gateWidth;
}
