// Прокрутка списков магазина пальцем и мышью.
//
// Родная прокрутка браузера работает пальцем и колесом, но мышью список
// не потащишь — а на десктопе это первое, что пробует игрок. Плюс на
// части мобильных браузеров родное панорамирование внутри блока с
// overflow глохнет, если у предка стоит touch-action:none.
//
// Поэтому: колесо и палец оставляем браузеру (так плавнее — прокрутка
// идёт на композиторе), а поверх вешаем перетаскивание указателем.
// Для пальца оно включается только как страховка: если браузер за
// первые кадры движения ничего не прокрутил, дальше ведём сами.

const DRAG_START = 6;      // px, после которых это уже перетаскивание, а не тап
const TOUCH_RESCUE = 12;   // px движения пальцем без реакции браузера
const FRICTION = 0.94;     // затухание инерции за кадр
const MIN_V = 0.02;        // px/мс, ниже которой инерция останавливается
const MAX_V = 3.2;         // px/мс, потолок скорости броска

class Scroller {
  constructor(el) {
    this.el = el;
    this.id = null;          // активный указатель
    this.dragging = false;   // порог пройден, ведём прокрутку сами
    this.native = false;     // прокруткой занимается браузер, не мешаем
    this.startY = 0;
    this.startTop = 0;
    this.lastY = 0;
    this.lastT = 0;
    this.v = 0;
    this.raf = 0;
    this.moved = 0;

    el.addEventListener('pointerdown', (e) => this.down(e));
    el.addEventListener('pointermove', (e) => this.move(e));
    el.addEventListener('pointerup', (e) => this.up(e));
    el.addEventListener('pointercancel', (e) => this.up(e));
    // Клик после перетаскивания не должен покупать улучшение, на котором
    // игрок держал палец. Гасим в фазе перехвата, до обработчиков кнопок.
    el.addEventListener('click', (e) => {
      if (this.moved > DRAG_START) { e.stopPropagation(); e.preventDefault(); }
    }, true);
    el.addEventListener('scroll', () => this.shadows(), { passive: true });
    el.addEventListener('wheel', () => this.stop(), { passive: true });

    this.shadows();
  }

  scrollable() { return this.el.scrollHeight - this.el.clientHeight > 2; }

  down(e) {
    if (this.id !== null || !e.isPrimary) return;
    this.stop();
    if (!this.scrollable()) return;
    this.id = e.pointerId;
    this.dragging = false;
    // Палец сначала отдаём браузеру: его прокрутка идёт на композиторе и
    // выглядит заметно живее нашей.
    this.native = e.pointerType !== 'mouse';
    this.startY = this.lastY = e.clientY;
    this.startTop = this.el.scrollTop;
    this.lastT = e.timeStamp || performance.now();
    this.v = 0;
    this.moved = 0;
  }

  move(e) {
    if (e.pointerId !== this.id) return;
    const y = e.clientY;
    const now = e.timeStamp || performance.now();
    const dy = y - this.lastY;
    this.moved = Math.max(this.moved, Math.abs(y - this.startY));

    if (this.native) {
      // Браузер прокручивает сам — просто ждём. Если движение уже заметное,
      // а список стоит на месте, значит родное панорамирование здесь не
      // работает, и дальше тащим вручную.
      if (this.moved > TOUCH_RESCUE && this.el.scrollTop === this.startTop) {
        this.native = false;
        this.dragging = true;
        this.startY = y;
        this.grab(e);
      } else {
        this.lastY = y; this.lastT = now;
        return;
      }
    }

    if (!this.dragging) {
      if (this.moved < DRAG_START) { this.lastY = y; this.lastT = now; return; }
      this.dragging = true;
      this.startY = y;
      this.grab(e);
    }

    const dt = Math.max(1, now - this.lastT);
    this.v = Math.max(-MAX_V, Math.min(MAX_V, dy / dt));
    this.el.scrollTop -= dy;
    this.lastY = y;
    this.lastT = now;
    e.preventDefault();
  }

  grab(e) {
    this.el.classList.add('dragging');
    try { this.el.setPointerCapture(e.pointerId); } catch (err) {}
  }

  up(e) {
    if (e.pointerId !== this.id) return;
    this.id = null;
    this.el.classList.remove('dragging');
    // Захват браузер снимает и сам, но на части webview он остаётся
    // висеть, и следующий ввод уходит не туда.
    try {
      if (this.el.hasPointerCapture && this.el.hasPointerCapture(e.pointerId)) this.el.releasePointerCapture(e.pointerId);
    } catch (err) {}
    const wasDragging = this.dragging;
    this.dragging = false;
    this.native = false;
    // Палец отпустили давно — бросок засчитывать нечего.
    const idle = (e.timeStamp || performance.now()) - this.lastT;
    if (wasDragging && Math.abs(this.v) > MIN_V && idle < 90) this.fling();
    // moved сбрасываем после клика, который прилетит следом за pointerup
    window.__ytGameTimers.setTimeout(() => { this.moved = 0; }, 0);
  }

  fling() {
    const step = () => {
      this.v *= FRICTION;
      if (Math.abs(this.v) < MIN_V) { this.raf = 0; return; }
      const before = this.el.scrollTop;
      this.el.scrollTop -= this.v * 16;
      if (this.el.scrollTop === before) { this.raf = 0; return; }   // упёрлись в край
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
    this.v = 0;
  }

  // Тени у краёв: единственный намёк, что список продолжается.
  shadows() {
    const el = this.el;
    const max = el.scrollHeight - el.clientHeight;
    el.classList.toggle('more-up', max > 2 && el.scrollTop > 2);
    el.classList.toggle('more-down', max > 2 && el.scrollTop < max - 2);
  }
}

const made = new WeakMap();

export function attachScroll(el) {
  if (!el || made.has(el)) return made.get(el);
  const s = new Scroller(el);
  made.set(el, s);
  return s;
}

// Списки магазина перерисовываются целиком, поэтому тени надо обновлять
// не только по событию прокрутки, но и после смены содержимого.
export function refreshScroll(root = document) {
  for (const el of root.querySelectorAll('.sheet-body, .modal-card')) {
    // Скрытые списки не трогаем: чтение scrollHeight заставляет браузер
    // пересчитать раскладку, а магазин перерисовывается часто.
    if (el.classList.contains('hidden') || !el.offsetParent) continue;
    const s = attachScroll(el);
    if (s) s.shadows();
  }
}

export function initScroll() {
  refreshScroll();
  // Вкладки, покупки и открытие магазина меняют содержимое списков.
  // Наблюдаем только за магазином и модалкой: вешать наблюдателя на всё
  // тело нельзя — там каждый кадр летают всплывающие числа.
  let queued = false;
  const later = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; refreshScroll(); });
  };
  const mo = new MutationObserver(later);
  for (const id of ['shop', 'modal']) {
    const el = document.getElementById(id);
    if (el) mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  window.addEventListener('resize', later);
}
