// Построение low-poly геометрии с плоскими нормалями (flat shading).

export function hex(c) {
  return [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255];
}

export class Builder {
  constructor() { this.p = []; this.n = []; this.c = []; }

  tri(ax, ay, az, bx, by, bz, cx, cy, cz, col) {
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    this.p.push(ax, ay, az, bx, by, bz, cx, cy, cz);
    this.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
    const [r, g, b] = col;
    this.c.push(r, g, b, r, g, b, r, g, b);
    return this;
  }

  quad(a, b, c, d, col) {
    this.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], col);
    this.tri(a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2], col);
    return this;
  }

  // Коробка: пивот в центре по XZ, снизу по Y (y=0 — основание)
  box(x, y, z, w, h, d, col, ry = 0) {
    const hw = w / 2, hd = d / 2;
    const cs = Math.cos(ry), sn = Math.sin(ry);
    const P = (lx, ly, lz) => [x + lx * cs + lz * sn, y + ly, z - lx * sn + lz * cs];
    const a = P(-hw, 0, -hd), b = P(hw, 0, -hd), c = P(hw, 0, hd), e = P(-hw, 0, hd);
    const a2 = P(-hw, h, -hd), b2 = P(hw, h, -hd), c2 = P(hw, h, hd), e2 = P(-hw, h, hd);
    this.quad(e2, c2, b2, a2, col);      // верх
    this.quad(a, b, c, e, col);          // низ
    this.quad(e, c, c2, e2, col);        // +Z
    this.quad(b, a, a2, b2, col);        // -Z
    this.quad(c, b, b2, c2, col);        // +X
    this.quad(a, e, e2, a2, col);        // -X
    return this;
  }

  // Цилиндр/конус: пивот снизу по центру
  cyl(x, y, z, rBot, rTop, h, seg, col, capTop = true, capBot = true) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const p0 = [x + c0 * rBot, y, z + s0 * rBot], p1 = [x + c1 * rBot, y, z + s1 * rBot];
      const q0 = [x + c0 * rTop, y + h, z + s0 * rTop], q1 = [x + c1 * rTop, y + h, z + s1 * rTop];
      if (rTop < 1e-5) this.tri(p0[0], p0[1], p0[2], q0[0], q0[1], q0[2], p1[0], p1[1], p1[2], col);
      else if (rBot < 1e-5) this.tri(p0[0], p0[1], p0[2], q0[0], q0[1], q0[2], q1[0], q1[1], q1[2], col);
      else this.quad(p0, q0, q1, p1, col);
      if (capTop && rTop > 1e-5) this.tri(x, y + h, z, q1[0], q1[1], q1[2], q0[0], q0[1], q0[2], col);
      if (capBot && rBot > 1e-5) this.tri(x, y, z, p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], col);
    }
    return this;
  }

  // Плоский диск из концентрических колец (без длинных треугольников-вееров)
  disc(x, y, z, r, rings, seg, col) {
    for (let k = 0; k < rings; k++) {
      const r0 = (r * k) / rings, r1 = (r * (k + 1)) / rings;
      for (let i = 0; i < seg; i++) {
        const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
        const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
        if (k === 0) {
          this.tri(x, y, z, x + r1 * c1, y, z + r1 * s1, x + r1 * c0, y, z + r1 * s0, col);
        } else {
          this.quad([x + r0 * c0, y, z + r0 * s0], [x + r0 * c1, y, z + r0 * s1],
                    [x + r1 * c1, y, z + r1 * s1], [x + r1 * c0, y, z + r1 * s0], col);
        }
      }
    }
    return this;
  }

  // Кольцо (аннулус)
  annulus(x, y, z, rIn, rOut, seg, col) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      this.quad([x + rIn * c0, y, z + rIn * s0], [x + rIn * c1, y, z + rIn * s1],
                [x + rOut * c1, y, z + rOut * s1], [x + rOut * c0, y, z + rOut * s0], col);
    }
    return this;
  }

  // Икосфера, плоское затенение
  ico(x, y, z, r, subdiv, col, squash = 1) {
    const t = (1 + Math.sqrt(5)) / 2;
    let verts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ].map(v => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; });
    let faces = [
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
    ];
    for (let s = 0; s < subdiv; s++) {
      const nf = [];
      const cache = new Map();
      const mid = (i, j) => {
        const key = i < j ? i + ',' + j : j + ',' + i;
        if (cache.has(key)) return cache.get(key);
        const a = verts[i], b = verts[j];
        let m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        const l = Math.hypot(...m); m = [m[0] / l, m[1] / l, m[2] / l];
        verts.push(m); cache.set(key, verts.length - 1); return verts.length - 1;
      };
      for (const [a, b, c] of faces) {
        const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
        nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
      }
      faces = nf;
    }
    for (const [i, j, k] of faces) {
      const A = verts[i], B = verts[j], C = verts[k];
      this.tri(
        x + A[0] * r, y + A[1] * r * squash, z + A[2] * r,
        x + B[0] * r, y + B[1] * r * squash, z + B[2] * r,
        x + C[0] * r, y + C[1] * r * squash, z + C[2] * r, col);
    }
    return this;
  }

  build(gl) { return new Geometry(gl, this.p, this.n, this.c); }
}

const FLOATS_PER_INSTANCE = 20; // mat4 + vec4

export class Geometry {
  constructor(gl, pos, nor, col) {
    this.gl = gl;
    this.count = pos.length / 3;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const mk = (data, loc, size) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buf;
    };
    mk(pos, 0, 3); mk(nor, 1, 3); mk(col, 2, 3);

    this.cap = 32;
    this.data = new Float32Array(this.cap * FLOATS_PER_INSTANCE);
    this.n = 0;
    this.ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ibuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    const stride = FLOATS_PER_INSTANCE * 4;
    for (let i = 0; i < 5; i++) {
      const loc = 3 + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, stride, i * 16);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindVertexArray(null);
  }

  reset() { this.n = 0; }

  grow() {
    const gl = this.gl;
    this.cap *= 2;
    const nd = new Float32Array(this.cap * FLOATS_PER_INSTANCE);
    nd.set(this.data);
    this.data = nd;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ibuf);
    gl.bufferData(gl.ARRAY_BUFFER, nd.byteLength, gl.DYNAMIC_DRAW);
  }

  // Возвращает смещение для записи 20 чисел
  slot() {
    if (this.n >= this.cap) this.grow();
    return this.n++ * FLOATS_PER_INSTANCE;
  }

  upload() {
    if (this.n === 0) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ibuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, this.n * FLOATS_PER_INSTANCE);
  }

  draw() {
    if (this.n === 0) return;
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, this.count, this.n);
  }
}
