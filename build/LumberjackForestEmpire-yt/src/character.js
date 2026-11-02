// Отрисовка человечка-лесоруба. Общая для игрока и помощников.
import { G } from './world.js';
import { hex } from './geometry.js';
import { part, node } from './rig.js';

export const PALETTES = {
  player: { shirt: 0xD94A3D, shirtD: 0xA8352B, pants: 0x35507E, skin: 0xEDB88F, beard: 0x6B4526, hat: 0x2C3B4E, boot: 0x3B2A1D },
  h0: { shirt: 0x4C9A4C, shirtD: 0x3A7A3A, pants: 0x4A4A55, skin: 0xE8B084, beard: 0x8A6236, hat: 0x8A5A2F, boot: 0x3B2A1D },
  h1: { shirt: 0x3D7FBF, shirtD: 0x2E639A, pants: 0x50463C, skin: 0xD9A377, beard: 0x3A2A1C, hat: 0xC9A227, boot: 0x3B2A1D },
  h2: { shirt: 0xB05FBF, shirtD: 0x8A46A0, pants: 0x3A4250, skin: 0xF0C39C, beard: 0xC0B0A0, hat: 0x505A66, boot: 0x3B2A1D },
  h3: { shirt: 0xE0A030, shirtD: 0xB07C1F, pants: 0x2F3A44, skin: 0xC68B5E, beard: 0x2A2018, hat: 0x7A3B2A, boot: 0x3B2A1D },
};

const cache = new Map();
function C(v, e = 0) {
  const k = v + '|' + e;
  let c = cache.get(k);
  if (!c) { const h = hex(v); c = [h[0], h[1], h[2], e]; cache.set(k, c); }
  return c;
}

export const MACHINE_STYLE = [
  null, null,
  { name: 'mini',  scale: 0.92, body: 0xE87A22, dark: 0xA8541A, cab: 0x2E3A45, glass: 0x8FD8F0, boom: 0xF0A83C },
  { name: 'full',  scale: 1.14, body: 0xE0C020, dark: 0x9C8412, cab: 0x25303A, glass: 0x9FE0F5, boom: 0xF2D64A },
  { name: 'mega',  scale: 1.38, body: 0xD03A2E, dark: 0x8A2018, cab: 0x1C242C, glass: 0xB0E8FF, boom: 0x2E3440 },
];

// Единая точка входа: пеший лесоруб или техника — решает тир
export function drawUnit(rd, base, o) {
  const tier = o.tier | 0;
  if (tier >= 2) drawMachine(rd, base, o);
  else drawCharacter(rd, base, o);
}

// Лесозаготовительная машина. Пивот на земле, кабиной в +Z
export function drawMachine(rd, base, o) {
  const st = MACHINE_STYLE[Math.min(o.tier | 0, MACHINE_STYLE.length - 1)] || MACHINE_STYLE[2];
  const model = (o.tier | 0) === 2 ? G.machineMini
    : (o.tier | 0) === 3 ? G.machineFull : G.machineMega;
  const k = st.scale;
  const move = o.moveAmt || 0;
  const chop = o.chopAmt || 0;
  const body = C(st.body), dark = C(st.dark), cab = C(st.cab),
        glass = C(st.glass, 0.5), boomC = C(st.boom), tyre = C(0x22262B), steel = C(0x9AA4AE);

  const bounce = Math.sin((o.wheelPhase || 0) * 2) * 0.035 * move;
  const rig = node(base, 0, bounce, 0, -0.02 * move, 0, 0,
    model ? 1 : k, model ? 1 : k, model ? 1 : k);

  // Новые GLB уже имеют правильный размер для каждого класса. Движение
  // сохраняет общий подпрыгивающий риг, а процедурная техника остаётся fallback.
  if (model) {
    rd.push(model, rig, C(0xFFFFFF));
    drawMachineCargo(rd, rig, o, (o.tier | 0) === 2 ? 0.82 : (o.tier | 0) === 3 ? 1 : 1.2);
    return;
  }

  // Колёса
  const wheelSpin = o.wheelPhase || 0;
  for (let i = 0; i < 4; i++) {
    const sx = i % 2 === 0 ? -1 : 1;
    const sz = i < 2 ? -1 : 1;
    const rr = sz > 0 ? 0.58 : 0.52;
    part(rd, G.cylC, rig, sx * 0.86, rr, sz * 1.02, 0, 0, Math.PI / 2, rr, 0.42, rr, tyre);
    part(rd, G.cylC, rig, sx * 0.98, rr, sz * 1.02, wheelSpin, 0, Math.PI / 2, rr * 0.5, 0.12, rr * 0.5, steel);
  }

  // Рама и корпус
  part(rd, G.boxC, rig, 0, 0.72, -0.1, 0, 0, 0, 1.66, 0.42, 3.0, dark);
  part(rd, G.boxC, rig, 0, 1.16, -0.55, 0, 0, 0, 1.5, 0.62, 1.8, body);
  part(rd, G.boxC, rig, 0, 1.02, 1.05, 0, 0, 0, 1.3, 0.42, 1.1, dark);

  // Кабина
  part(rd, G.boxC, rig, 0, 1.86, -0.5, 0, 0, 0, 1.16, 0.86, 1.15, cab);
  part(rd, G.boxC, rig, 0, 1.92, 0.06, 0, 0, 0, 0.98, 0.62, 0.06, glass);
  part(rd, G.boxC, rig, 0, 2.32, -0.5, 0, 0, 0, 1.24, 0.12, 1.24, dark);
  // Мигалка
  part(rd, G.ico0, rig, 0.4, 2.46, -0.5, 0, o.wheelPhase || 0, 0, 0.16, 0.18, 0.16, C(0xFFB020, 0.85));
  // Выхлоп
  part(rd, G.cylY, rig, 0.62, 1.5, -1.25, 0, 0, 0, 0.09, 0.95, 0.09, steel);

  // Стрела-манипулятор
  const swing = chop > 0 ? Math.sin(chop * 0.55) * 0.26 : Math.sin((o.wheelPhase || 0) * 0.5) * 0.03;
  // Опора стрелы
  part(rd, G.boxC, rig, 0, 1.35, 0.45, 0, 0, 0, 0.5, 0.7, 0.5, dark);
  const b1 = node(rig, 0, 1.62, 0.5, 0.28 + swing, 0, 0);
  part(rd, G.boxC, b1, 0, 0, 0.7, 0, 0, 0, 0.3, 0.3, 1.5, boomC);
  const b2 = node(b1, 0, 0, 1.4, 0.42 - swing * 1.4, 0, 0);
  part(rd, G.boxC, b2, 0, 0, 0.6, 0, 0, 0, 0.26, 0.26, 1.3, boomC);
  const head = node(b2, 0, 0, 1.22, 0.32, 0, 0);
  part(rd, G.boxC, head, 0, 0, 0.16, 0, 0, 0, 0.62, 0.5, 0.5, dark);
  // Захваты
  for (let i = 0; i < 2; i++) {
    const sx = i ? 1 : -1;
    part(rd, G.boxC, head, sx * 0.34, -0.05, 0.42, 0, 0, sx * 0.4, 0.12, 0.62, 0.2, steel);
  }
  // Пильный диск
  const sawSpin = chop > 0 ? chop * 3 : 0;
  part(rd, G.cylC, head, 0, -0.3, 0.2, 0, 0, sawSpin, 0.42, 0.08, 0.42, C(0xD8DEE6));

  // Брёвна в кузове
  const n = Math.min(o.carryVisual | 0, 24);
  if (n > 0) {
    const lc = o.carryColor || C(0xB8834F);
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 4), col = i % 4;
      part(rd, G.cylC, rig, -0.48 + col * 0.32, 1.28 + row * 0.26, 1.02,
        0, 0, Math.PI / 2, 0.13, 1.1, 0.13, lc);
    }
  }
}

function drawMachineCargo(rd, rig, o, scale) {
  const n = Math.min(o.carryVisual | 0, 24);
  if (n <= 0) return;
  const lc = o.carryColor || C(0xB8834F);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 4), col = i % 4;
    part(rd, G.cylC, rig,
      (-0.48 + col * 0.32) * scale,
      (1.02 + row * 0.24) * scale,
      -0.76 * scale,
      0, 0, Math.PI / 2,
      0.13 * scale, 1.0 * scale, 0.13 * scale, lc);
  }
}

// base — матрица позиции/поворота персонажа (пивот в ступнях, лицом в +Z)
export function drawCharacter(rd, base, o) {
  const p = o.palette || PALETTES.player;
  const move = o.moveAmt || 0;
  const ph = o.phase || 0;
  const chop = o.chopAmt || 0;
  const sw = Math.sin(ph);
  const bob = Math.abs(Math.sin(ph)) * 0.055 * move;
  const lean = -0.13 * move;

  const shirt = C(p.shirt), shirtD = C(p.shirtD), pants = C(p.pants),
        skin = C(p.skin), beard = C(p.beard), hat = C(p.hat), boot = C(p.boot);

  // Ноги
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const ang = sw * side * 0.85 * move;
    const hip = node(base, side * 0.145, 0.62 + bob * 0.4, 0, ang, 0, 0);
    part(rd, G.boxC, hip, 0, -0.31, 0, 0, 0, 0, 0.2, 0.62, 0.22, pants);
    part(rd, G.boxC, hip, 0, -0.68, 0.04, 0, 0, 0, 0.24, 0.16, 0.34, boot);
  }

  // Корпус
  const torso = node(base, 0, 0.6 + bob, 0, lean, 0, 0);
  part(rd, G.boxC, torso, 0, 0.32, 0, 0, 0, 0, 0.58, 0.66, 0.38, shirt);
  part(rd, G.boxC, torso, 0, 0.03, 0, 0, 0, 0, 0.6, 0.1, 0.4, C(0x3B2A1D));
  part(rd, G.boxC, torso, 0, 0.34, 0.2, 0, 0, 0, 0.16, 0.5, 0.03, shirtD);

  // Голова
  const head = node(torso, 0, 0.66, 0, 0, Math.sin(ph * 0.5) * 0.05 * move, 0);
  part(rd, G.boxC, head, 0, 0.2, 0, 0, 0, 0, 0.44, 0.4, 0.42, skin);
  part(rd, G.boxC, head, 0, 0.1, 0.14, 0, 0, 0, 0.36, 0.24, 0.2, beard);
  part(rd, G.boxC, head, 0, 0.22, 0.22, 0, 0, 0, 0.1, 0.1, 0.1, C(0xD9A47C));
  part(rd, G.boxC, head, -0.11, 0.28, 0.215, 0, 0, 0, 0.07, 0.08, 0.03, C(0x241A12));
  part(rd, G.boxC, head, 0.11, 0.28, 0.215, 0, 0, 0, 0.07, 0.08, 0.03, C(0x241A12));
  if ((o.tier | 0) >= 1) {
    const helm = C(0xFFC93C);
    part(rd, G.boxC, head, 0, 0.43, 0.06, 0, 0, 0, 0.5, 0.08, 0.56, helm);
    part(rd, G.ico0, head, 0, 0.46, 0, 0, 0, 0, 0.26, 0.2, 0.26, helm);
  } else {
    part(rd, G.boxC, head, 0, 0.42, 0.02, 0, 0, 0, 0.5, 0.09, 0.48, hat);
    part(rd, G.boxC, head, 0, 0.53, 0, 0, 0, 0, 0.38, 0.18, 0.36, hat);
  }

  // Руки
  const armL = node(torso, -0.36, 0.55, 0, -sw * 0.7 * move, 0, -0.12);
  part(rd, G.boxC, armL, 0, -0.24, 0, 0, 0, 0, 0.16, 0.48, 0.17, shirtD);
  part(rd, G.boxC, armL, 0, -0.52, 0, 0, 0, 0, 0.17, 0.14, 0.18, skin);

  const chopAng = chop > 0 ? -2.0 + Math.sin(chop) * 1.5 : sw * 0.7 * move;
  const armR = node(torso, 0.36, 0.55, 0, chopAng, 0, 0.12);
  part(rd, G.boxC, armR, 0, -0.24, 0, 0, 0, 0, 0.16, 0.48, 0.17, shirtD);
  part(rd, G.boxC, armR, 0, -0.52, 0, 0, 0, 0, 0.17, 0.14, 0.18, skin);

  // Инструмент: топор или бензопила
  if (o.axe !== false) {
    const tool = node(armR, 0, -0.55, 0.02, 0.35, 0, 0);
    if ((o.tier | 0) >= 1) {
      // Бензопила: корпус, рукоять и длинная шина с бегущей цепью
      part(rd, G.boxC, tool, 0, -0.2, 0.02, 0, 0, 0, 0.24, 0.3, 0.42, C(0xE2582C));
      part(rd, G.boxC, tool, 0, -0.2, -0.2, 0, 0, 0, 0.16, 0.22, 0.12, C(0x2E3138));
      part(rd, G.boxC, tool, 0, -0.24, 0.62, 0, 0, 0, 0.1, 0.17, 0.86, C(0xC8CDD4));
      const spin = chop > 0 ? Math.sin(chop * 4) * 0.03 : 0;
      part(rd, G.boxC, tool, 0, -0.24 + spin, 0.62, 0, 0, 0, 0.13, 0.05, 0.9, C(0x8A9099));
      part(rd, G.cylC, tool, 0, -0.34, 0.05, 0, 0, Math.PI / 2, 0.07, 0.3, 0.07, C(0x3A3F47));
    } else {
      part(rd, G.cylC, tool, 0, -0.22, 0, 0, 0, 0, 0.045, 0.86, 0.045, C(0x8A5A36));
      part(rd, G.boxC, tool, 0, -0.62, 0.06, 0, 0, 0, 0.09, 0.26, 0.3, C(0xBFC7D0));
      part(rd, G.boxC, tool, 0, -0.62, 0.2, 0, 0, 0.0, 0.07, 0.2, 0.1, C(0xE4EAF0));
    }
  }

  // Брёвна за спиной
  const n = o.carryVisual | 0;
  if (n > 0) {
    const lc = o.carryColor || C(0xB8834F);
    const packRy = 0;
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 3), col = i % 3;
      const wob = Math.sin((row * 1.7 + col) * 2.1) * 0.03;
      part(rd, G.cylC, torso,
        -0.22 + col * 0.22, 0.16 + row * 0.24 + wob, -0.34 - (row % 2) * 0.03,
        0, packRy, Math.PI / 2, 0.105, 0.62, 0.105, lc);
    }
  }
}
