// Управление: виртуальный джойстик (тач/мышь) + клавиатура.

export class Input {
  constructor(surface, joyEl) {
    this.dir = { x: 0, y: 0 };
    this.mag = 0;
    this.keys = new Set();
    this.pointerId = null;
    this.origin = { x: 0, y: 0 };
    this.joyEl = joyEl;
    this.knob = joyEl ? joyEl.querySelector('.joy-knob') : null;
    this.maxDist = 62;
    this.enabled = true;
    this.usedTouch = false;

    const down = (e) => {
      if (!this.enabled) return;
      if (e.target.closest('.ui-block')) return;
      if (this.pointerId !== null) return;
      this.pointerId = e.pointerId;
      this.usedTouch = e.pointerType !== 'mouse';
      this.origin.x = e.clientX; this.origin.y = e.clientY;
      this._showJoy(e.clientX, e.clientY, 0, 0);
      // Быстрый тап/синтетическое событие: указателя может уже не быть,
      // и вызов бросает NotFoundError прямо в обработчике. Игра при этом падает,
      // а headless-проверка Яндекса ловит JS-ошибку при модерации.
      try { surface.setPointerCapture && surface.setPointerCapture(e.pointerId); } catch (err) {}
    };
    const move = (e) => {
      if (e.pointerId !== this.pointerId) return;
      let dx = e.clientX - this.origin.x;
      let dy = e.clientY - this.origin.y;
      // Основание закреплено в точке первого касания до pointerup. Раньше при
      // выходе за радиус оно догоняло палец, из-за чего джойстик плавал.
      const nd = Math.hypot(dx, dy);
      const dead = 6;
      if (nd < dead) { this.dir.x = 0; this.dir.y = 0; this.mag = 0; }
      else {
        this.dir.x = dx / nd; this.dir.y = dy / nd;
        this.mag = Math.min(1, (nd - dead) / (this.maxDist - dead));
      }
      this._showJoy(this.origin.x, this.origin.y, dx, dy);
    };
    const up = (e) => {
      if (e.pointerId !== this.pointerId) return;
      this.pointerId = null;
      this.dir.x = 0; this.dir.y = 0; this.mag = 0;
      this._hideJoy();
    };

    surface.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    surface.addEventListener('lostpointercapture', up);
    window.addEventListener('resize', () => this.reset());
    document.addEventListener('fullscreenchange', () => this.reset());

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => { this.keys.clear(); up({ pointerId: this.pointerId }); });
  }

  _showJoy(x, y, dx, dy) {
    if (!this.joyEl) return;
    this.joyEl.style.display = 'block';
    const root = document.getElementById('game-root').getBoundingClientRect();
    const margin = Math.min(90, root.width / 2, root.height / 2);
    this.joyEl.style.left = Math.max(margin, Math.min(root.width - margin, x - root.left)) + 'px';
    this.joyEl.style.top = Math.max(margin, Math.min(root.height - margin, y - root.top)) + 'px';
    const d = Math.hypot(dx, dy);
    const k = d > this.maxDist ? this.maxDist / d : 1;
    if (this.knob) this.knob.style.transform = `translate(${dx * k - 26}px, ${dy * k - 26}px)`;
  }

  _hideJoy() { if (this.joyEl) this.joyEl.style.display = 'none'; }

  reset() {
    this.keys.clear(); this.pointerId = null;
    this.dir.x = 0; this.dir.y = 0; this.mag = 0;
    this._hideJoy();
  }

  // Возвращает вектор направления в координатах мира (x — вправо, y — вглубь экрана)
  read() {
    if (!this.enabled) return { x: 0, y: 0, mag: 0 };
    let x = 0, y = 0;
    const k = this.keys;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (k.has('KeyW') || k.has('ArrowUp')) y -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) y += 1;
    if (x || y) {
      const l = Math.hypot(x, y);
      return { x: x / l, y: y / l, mag: 1 };
    }
    if (this.mag > 0) return { x: this.dir.x, y: this.dir.y, mag: this.mag };
    return { x: 0, y: 0, mag: 0 };
  }
}
