// Инстансный рендерер с одним источником света и картой теней.
import { createProgram, createShadowTarget } from './gl.js';
import { m4 } from './math.js';

const VS_MAIN = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNor;
layout(location=2) in vec3 aCol;
layout(location=3) in vec4 iM0;
layout(location=4) in vec4 iM1;
layout(location=5) in vec4 iM2;
layout(location=6) in vec4 iM3;
layout(location=7) in vec4 iCol;
uniform mat4 uViewProj;
uniform mat4 uLightVP;
out vec3 vNor;
out vec3 vCol;
out float vEmis;
out vec4 vShadow;
out float vDist;
void main(){
  mat4 M = mat4(iM0, iM1, iM2, iM3);
  vec4 wp = M * vec4(aPos, 1.0);
  vec3 s = vec3(length(iM0.xyz), length(iM1.xyz), length(iM2.xyz));
  vec3 n = aNor / max(s * s, vec3(1e-6));
  vNor = normalize(mat3(M) * n);
  vCol = aCol * iCol.rgb;
  vEmis = iCol.a;
  vShadow = uLightVP * wp;
  gl_Position = uViewProj * wp;
  vDist = gl_Position.w;
}`;

const FS_MAIN = `#version 300 es
precision highp float;
precision highp sampler2DShadow;
in vec3 vNor;
in vec3 vCol;
in float vEmis;
in vec4 vShadow;
in float vDist;
uniform vec3 uLightDir;
uniform vec3 uSun;
uniform vec3 uSkyAmb;
uniform vec3 uGroundAmb;
uniform vec3 uFog;
uniform float uFogDensity;
uniform float uShadowTexel;
uniform float uShadowOn;
uniform sampler2DShadow uShadow;
out vec4 outColor;

float shadowFactor(float ndl){
  if (uShadowOn < 0.5) return 1.0;
  vec3 p = vShadow.xyz * 0.5 + 0.5;
  if (p.z >= 1.0 || p.x < 0.001 || p.x > 0.999 || p.y < 0.001 || p.y > 0.999) return 1.0;
  float bias = mix(0.0055, 0.0014, ndl);
  float sum = 0.0;
  for (int y = -1; y <= 1; ++y){
    for (int x = -1; x <= 1; ++x){
      sum += texture(uShadow, vec3(p.xy + vec2(float(x), float(y)) * uShadowTexel, p.z - bias));
    }
  }
  return sum / 9.0;
}

void main(){
  vec3 N = normalize(vNor);
  float ndl = max(dot(N, uLightDir), 0.0);
  float sh = shadowFactor(ndl);
  vec3 amb = mix(uGroundAmb, uSkyAmb, N.y * 0.5 + 0.5);
  vec3 col = vCol * (amb + uSun * ndl * sh);
  col = mix(col, vCol * 1.15, vEmis);
  float f = 1.0 - exp(-pow(max(vDist - 24.0, 0.0) * uFogDensity, 2.0));
  col = mix(col, uFog, clamp(f, 0.0, 0.92));
  outColor = vec4(col, 1.0);
}`;

const VS_DEPTH = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=3) in vec4 iM0;
layout(location=4) in vec4 iM1;
layout(location=5) in vec4 iM2;
layout(location=6) in vec4 iM3;
uniform mat4 uLightVP;
void main(){
  mat4 M = mat4(iM0, iM1, iM2, iM3);
  gl_Position = uLightVP * M * vec4(aPos, 1.0);
}`;

const FS_DEPTH = `#version 300 es
precision highp float;
void main(){}`;

const VS_SKY = `#version 300 es
out vec2 vUv;
void main(){
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FS_SKY = `#version 300 es
precision highp float;
in vec2 vUv;
uniform vec3 uTop;
uniform vec3 uBottom;
out vec4 outColor;
void main(){
  float t = pow(clamp(vUv.y, 0.0, 1.0), 0.85);
  outColor = vec4(mix(uBottom, uTop, t), 1.0);
}`;

export class Renderer {
  constructor(gl, opts = {}) {
    this.gl = gl;
    this.progMain = createProgram(gl, VS_MAIN, FS_MAIN);
    this.progDepth = createProgram(gl, VS_DEPTH, FS_DEPTH);
    this.progSky = createProgram(gl, VS_SKY, FS_SKY);

    const size = opts.shadowSize || 2048;
    this.shadow = createShadowTarget(gl, size);
    this.shadowEnabled = !!this.shadow;

    this.viewProj = m4.create();
    this.lightVP = m4.create();
    this._proj = m4.create();
    this._view = m4.create();
    this._lp = m4.create();
    this._lv = m4.create();

    this.geometries = new Set();
    this.sky = { top: [0.42, 0.70, 0.94], bottom: [0.78, 0.90, 0.98] };
    this.fog = [0.72, 0.86, 0.95];
    this.fogDensity = 0.011;
    this.lightDir = [0.42, 0.82, 0.39];
    this.sun = [0.62, 0.60, 0.54];
    this.skyAmb = [0.60, 0.64, 0.72];
    this.groundAmb = [0.34, 0.36, 0.34];
  }

  setQuality(shadowSize) {
    if (!this.shadow || this.shadow.size === shadowSize) return;
    const gl = this.gl;
    gl.deleteTexture(this.shadow.tex);
    gl.deleteFramebuffer(this.shadow.fbo);
    this.shadow = createShadowTarget(gl, shadowSize);
    this.shadowEnabled = !!this.shadow;
  }

  begin() {
    for (const g of this.geometries) g.reset();
    this.geometries.clear();
  }

  // mat — Float32Array(16); col — [r,g,b,emissive]
  push(geo, mat, col) {
    const o = geo.slot();
    const d = geo.data;
    d.set(mat, o);
    d[o + 16] = col[0]; d[o + 17] = col[1]; d[o + 18] = col[2]; d[o + 19] = col[3] || 0;
    this.geometries.add(geo);
  }

  setCamera(eye, target, fov, aspect, near, far, up = [0, 1, 0]) {
    m4.perspective(this._proj, fov, aspect, near, far);
    m4.lookAt(this._view, eye[0], eye[1], eye[2], target[0], target[1], target[2], up[0], up[1], up[2]);
    m4.mul(this.viewProj, this._proj, this._view);
  }

  setLight(cx, cz, extent) {
    const L = this.lightDir;
    const dist = 90;
    const ex = cx + L[0] * dist, ey = L[1] * dist, ez = cz + L[2] * dist;
    m4.lookAt(this._lv, ex, ey, ez, cx, 0, cz, 0, 1, 0);
    // Привязка центра к сетке текселей — убирает дрожание теней
    const texel = (extent * 2) / (this.shadow ? this.shadow.size : 1024);
    const sx = Math.round(this._lv[12] / texel) * texel;
    const sy = Math.round(this._lv[13] / texel) * texel;
    this._lv[12] = sx; this._lv[13] = sy;
    m4.ortho(this._lp, -extent, extent, -extent, extent, 1, dist * 2.2);
    m4.mul(this.lightVP, this._lp, this._lv);
  }

  render(width, height) {
    const gl = this.gl;
    for (const g of this.geometries) g.upload();

    if (this.shadowEnabled) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadow.fbo);
      gl.viewport(0, 0, this.shadow.size, this.shadow.size);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(2.2, 4.0);
      gl.useProgram(this.progDepth);
      gl.uniformMatrix4fv(this.progDepth.u.uLightVP, false, this.lightVP);
      for (const g of this.geometries) g.draw();
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    gl.viewport(0, 0, width, height);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // Небо
    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.progSky);
    gl.uniform3fv(this.progSky.u.uTop, this.sky.top);
    gl.uniform3fv(this.progSky.u.uBottom, this.sky.bottom);
    gl.bindVertexArray(null);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);

    const p = this.progMain;
    gl.useProgram(p);
    gl.uniformMatrix4fv(p.u.uViewProj, false, this.viewProj);
    gl.uniformMatrix4fv(p.u.uLightVP, false, this.lightVP);
    gl.uniform3fv(p.u.uLightDir, this.lightDir);
    gl.uniform3fv(p.u.uSun, this.sun);
    gl.uniform3fv(p.u.uSkyAmb, this.skyAmb);
    gl.uniform3fv(p.u.uGroundAmb, this.groundAmb);
    gl.uniform3fv(p.u.uFog, this.fog);
    gl.uniform1f(p.u.uFogDensity, this.fogDensity);
    gl.uniform1f(p.u.uShadowOn, this.shadowEnabled ? 1 : 0);
    if (this.shadowEnabled) {
      gl.uniform1f(p.u.uShadowTexel, 1 / this.shadow.size);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.shadow.tex);
      gl.uniform1i(p.u.uShadow, 0);
    }
    for (const g of this.geometries) g.draw();
    gl.bindVertexArray(null);
  }
}
