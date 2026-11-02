// Минимальная 3D-математика. Матрицы column-major, как в WebGL.

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const TAU = Math.PI * 2;

// Плавное приближение, независимое от частоты кадров
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

export function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return a + d * t;
}

export const m4 = {
  create() { const o = new Float32Array(16); o[0] = o[5] = o[10] = o[15] = 1; return o; },

  identity(o) {
    o[0]=1;o[1]=0;o[2]=0;o[3]=0; o[4]=0;o[5]=1;o[6]=0;o[7]=0;
    o[8]=0;o[9]=0;o[10]=1;o[11]=0; o[12]=0;o[13]=0;o[14]=0;o[15]=1; return o;
  },

  copy(o, a) { o.set(a); return o; },

  // Композиция: T * Ry * Rx * Rz * S
  compose(o, px, py, pz, rx, ry, rz, kx, ky, kz) {
    const sx = Math.sin(rx), cx = Math.cos(rx);
    const sy = Math.sin(ry), cy = Math.cos(ry);
    const sz = Math.sin(rz), cz = Math.cos(rz);

    const m00 = cy * cz + sy * sx * sz;
    const m01 = -cy * sz + sy * sx * cz;
    const m02 = sy * cx;
    const m10 = cx * sz;
    const m11 = cx * cz;
    const m12 = -sx;
    const m20 = -sy * cz + cy * sx * sz;
    const m21 = sy * sz + cy * sx * cz;
    const m22 = cy * cx;

    o[0] = m00 * kx; o[1] = m10 * kx; o[2] = m20 * kx; o[3] = 0;
    o[4] = m01 * ky; o[5] = m11 * ky; o[6] = m21 * ky; o[7] = 0;
    o[8] = m02 * kz; o[9] = m12 * kz; o[10] = m22 * kz; o[11] = 0;
    o[12] = px; o[13] = py; o[14] = pz; o[15] = 1;
    return o;
  },

  mul(o, a, b) {
    const a00=a[0],a01=a[1],a02=a[2],a03=a[3], a10=a[4],a11=a[5],a12=a[6],a13=a[7],
          a20=a[8],a21=a[9],a22=a[10],a23=a[11], a30=a[12],a31=a[13],a32=a[14],a33=a[15];
    for (let i = 0; i < 4; i++) {
      const b0=b[i*4], b1=b[i*4+1], b2=b[i*4+2], b3=b[i*4+3];
      o[i*4]   = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      o[i*4+1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      o[i*4+2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      o[i*4+3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    }
    return o;
  },

  perspective(o, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    o.fill(0);
    o[0] = f / aspect; o[5] = f; o[10] = (far + near) * nf; o[11] = -1; o[14] = 2 * far * near * nf;
    return o;
  },

  ortho(o, l, r, b, t, n, f) {
    o.fill(0);
    o[0] = 2 / (r - l); o[5] = 2 / (t - b); o[10] = 2 / (n - f); o[15] = 1;
    o[12] = (l + r) / (l - r); o[13] = (t + b) / (b - t); o[14] = (f + n) / (n - f);
    return o;
  },

  lookAt(o, ex, ey, ez, tx, ty, tz, ux, uy, uz) {
    let zx = ex - tx, zy = ey - ty, zz = ez - tz;
    let len = Math.hypot(zx, zy, zz) || 1; zx /= len; zy /= len; zz /= len;
    let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx;
    len = Math.hypot(xx, xy, xz) || 1; xx /= len; xy /= len; xz /= len;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    o[0]=xx; o[1]=yx; o[2]=zx; o[3]=0;
    o[4]=xy; o[5]=yy; o[6]=zy; o[7]=0;
    o[8]=xz; o[9]=yz; o[10]=zz; o[11]=0;
    o[12]=-(xx*ex+xy*ey+xz*ez); o[13]=-(yx*ex+yy*ey+yz*ez); o[14]=-(zx*ex+zy*ey+zz*ez); o[15]=1;
    return o;
  },
};

// Детерминированный псевдослучайный шум по 2D-координатам
export function hash2(x, y) {
  let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return h - Math.floor(h);
}
