// Точка входа: инициализация SDK, загрузка сейва, старт игры.
import { Game } from './game.js';
import { ui } from './ui.js';
import { sdk } from './sdk.js';
import { audio } from './audio.js';
import { setLang, getLang, t } from './i18n.js';
import { state, meta, pushSave } from './state.js';
import { flags, initFlags, localQaAllowed } from './flags.js';
import { metrics, connectYandexMetrika } from './metrics.js';
import { debug } from './debug.js';
import { loadSawmillModel, loadMachineModels } from './model.js';
import { initLayout } from './layout.js';
import { initScroll } from './scroller.js';

initLayout();
initScroll();

function fatal(msg) {
  const el = document.getElementById('fatal');
  el.querySelector('div').textContent = msg;
  el.classList.remove('hidden');
  document.getElementById('loader').style.display = 'none';
}

// Последняя страховка: что бы ни подвисло — SDK, флаги, модель — игрок не
// должен остаться перед вечным экраном загрузки.
const watchdog = window.__ytGameTimers.setTimeout(() => {
  const l = document.getElementById('loader');
  if (l && l.style.display !== 'none') fatal(t('loadingError'));
}, 15000);

async function boot() {
  ui.setLoading(0.08, t('loading'));

  const q = location.search;
  const fresh = localQaAllowed() && /[?&](reset|fresh)\b/.test(q);
  if (localQaAllowed() && /[?&]reset\b/.test(q)) {
    try { window.__ytStorage.removeItem('lumberjack_save_v4'); } catch (e) {}
  }

  await sdk.init();
  // Флаги читаем до создания игры: от них зависит, какие офферы вообще живут.
  await initFlags(sdk.ysdk);
  metrics.sink = connectYandexMetrika(flags.metrikaCounterId);
  // 默认英文；?lang=ru|en 可显式指定，用于本地对照测试。
  const langParam = new URLSearchParams(location.search).get('lang');
  setLang(langParam || sdk.lang);
  document.documentElement.lang = getLang();
  document.title = t('gameTitle');
  const loaderName = document.getElementById('game-name');
  if (loaderName) loaderName.textContent = t('gameShortName').toUpperCase();
  ui.setLoading(0.3, t('loading'));

  let sawmillModel = null;
  let machineModels = {};
  try {
    [sawmillModel, machineModels] = await Promise.all([
      loadSawmillModel(),
      loadMachineModels(),
    ]);
  } catch (e) {
    console.warn('Новая модель лесопилки не загрузилась, используется резервная:', e);
    machineModels = await loadMachineModels();
  }

  let game;
  try {
    game = new Game(document.getElementById('c'), sawmillModel, machineModels);
  } catch (e) {
    console.error(e);
    fatal(t('noWebgl'));
    return;
  }
  if (localQaAllowed()) window.game = game;

  ui.init(game);
  ui.applyLang();
  ui.setLoading(0.62, t('loading'));

  let saved = null;
  if (!fresh) { try { saved = await sdk.load(); } catch (e) {} }
  const res = game.applySave(saved);

  // Метрика поднимается после сейва: ей нужен meta.stats и firstSeen.
  metrics.init(meta.stats, sdk.isDesktop() ? 'desktop' : 'mobile');
  metrics.markDay(meta.firstSeen);
  if (res.migrated) pushSave(true);
  if (flags.debugPanel) debug.init(game);

  ui.setLoading(0.9, t('loading'));
  ui.updateHud();

  // Звук стартует только после жеста пользователя
  const wake = () => {
    audio.init();
    audio.setEnabled(meta.soundOn);
    audio.resume();
    window.removeEventListener('pointerdown', wake);
    window.removeEventListener('keydown', wake);
  };
  window.addEventListener('pointerdown', wake);
  window.addEventListener('keydown', wake);

  game.start();

  requestAnimationFrame(() => {
    window.__ytGameTimers.clearTimeout(watchdog);
    ui.setLoading(1, t('loading'));
    window.__ytGameTimers.setTimeout(() => {
      ui.hideLoader();
      sdk.gameReady();
      // Первый GameplayAPI.start разрешён только после Game Ready и только
      // если поверх игры нет магазина, награды или другого модального окна.
      game.syncGameplayState();
      if (flags.banner && !game.preRun) sdk.showBanner();
      if (res.offline > 0) game.showOffline(res.offline);
    }, 260);
  });

  window.__ytGameTimers.setInterval(() => { if (state.dirty) pushSave(); }, 20000);
  // Длительность сессии пишем и по visibilitychange: на мобильном pagehide
  // срабатывает далеко не всегда.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) metrics.endSession('hidden');
    else metrics.resumeSession();
  });
  window.addEventListener('pageshow', () => metrics.resumeSession());
}

document.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('error', (e) => console.error('Runtime error:', e.message, e.filename, e.lineno));
boot().catch((err) => { console.error(err); fatal(t('loadingError')); });
