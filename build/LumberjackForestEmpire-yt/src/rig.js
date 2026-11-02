// Иерархия трансформаций без аллокаций: пул матриц, сбрасываемый каждый кадр.
import { m4 } from './math.js';

const pool = [];
let idx = 0;

export function resetPool() { idx = 0; }

function take() {
  if (idx >= pool.length) pool.push(m4.create());
  return pool[idx++];
}

// Матрица узла: base * T(p) * R(yxz) * S(s)
export function node(base, px, py, pz, rx, ry, rz, sx = 1, sy = 1, sz = 1) {
  const l = take();
  m4.compose(l, px, py, pz, rx, ry, rz, sx, sy, sz);
  if (!base) return l;
  const o = take();
  m4.mul(o, base, l);
  return o;
}

// Рисует примитив в локальных координатах base
export function part(rd, geo, base, px, py, pz, rx, ry, rz, sx, sy, sz, col) {
  rd.push(geo, node(base, px, py, pz, rx, ry, rz, sx, sy, sz), col);
}
