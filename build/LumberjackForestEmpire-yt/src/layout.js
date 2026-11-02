// Reference-resolution scaling applies only to UI; WebGL keeps the full viewport.
export function initLayout() {
  const root = document.createElement('main');
  root.id = 'game-root';
  const overlay = document.createElement('div');
  overlay.id = 'ui-root';
  for (const el of [...document.body.children]) {
    if (el.tagName === 'SCRIPT') continue;
    if (['c', 'world-layer', 'joy'].includes(el.id)) root.append(el);
    else overlay.append(el);
  }
  root.append(overlay);
  document.body.append(root);
  const tutorial = document.getElementById('tut');
  let pending = false;
  const update = () => {
    pending = false;
    const w = root.clientWidth, h = root.clientHeight;
    const portrait = h > w;
    const scale = Math.min(1, Math.max(portrait ? .78 : .55,
      Math.min(w / (portrait ? 390 : 900), h / (portrait ? 700 : 600))));
    root.dataset.uiScale = scale.toFixed(4);
    // Весь интерфейс ужимается трансформом, вместе с ним ужимаются и
    // кнопки: 42px в системе координат оверлея при масштабе 0.65 — это
    // 27 реальных пикселей, по которым на телефоне уже неудобно попадать.
    // Отдаём масштаб в CSS, чтобы зоны нажатия считались от него.
    overlay.style.setProperty('--ui-scale', scale.toFixed(4));
    overlay.style.width = `${w / scale}px`;
    overlay.style.height = `${h / scale}px`;
    overlay.style.transform = `scale(${scale})`;
    overlay.classList.toggle('narrow-ui', w / scale < 640);
    // Низкий кадр: телефон в горизонтали, зум браузера, окно, ужатое
    // рекламным блоком. Там магазину остаётся мало высоты, и подвал с
    // «Новым забегом» съедает её наравне со списком. Порог считаем по
    // высоте кадра, а не по остатку под магазином: остаток зависит от
    // плашки обучения, которую этот же класс и ужимает — вышло бы
    // самовозбуждение, класс мигал бы каждый кадр.
    overlay.classList.toggle('short-ui', h / scale <= 620);
    const tutorialVisible = !tutorial.classList.contains('hidden') && !document.body.classList.contains('prep-open');
    const shopTop = tutorialVisible ? tutorial.offsetTop + tutorial.offsetHeight + 10 : 12;
    overlay.style.setProperty('--shop-top', `${shopTop}px`);
  };
  const schedule = () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  };
  const observer = new ResizeObserver(schedule);
  [root, tutorial].forEach(el => observer.observe(el));
  new MutationObserver(schedule).observe(document.body, {attributes:true,attributeFilter:['class']});
  window.visualViewport?.addEventListener('resize', schedule);
  document.addEventListener('fullscreenchange', schedule);
  update();
}
