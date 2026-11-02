// Локальная аналитика — только собственные события и воронки.
//
// РАЗДЕЛЕНИЕ ОТВЕТСТВЕННОСТИ:
//   Консоль Яндекс Игр уже показывает D1/D3/D7/D14, вторую неделю и второй
//   месяц, длительность сессии и DAU. Дублировать это здесь бессмысленно.
//   Здесь живёт то, чего Консоль знать не может: какой оффер игрок увидел,
//   нажал ли, досмотрел ли ролик и открыл ли после этого ворота.
//   Наружу события уходят через sink — туда вешается Яндекс.Метрика.
//
// Счётчики ниже нужны только для отладочной панели: они локальные,
// по одному устройству, и источником правды не являются.

const DAY = 86400000;

// Зарезервированные события будущих механик. Самих механик в сборке ещё нет:
// список фиксирует контракт заранее, чтобы разные реализации и варианты A/B
// отправляли совместимые данные, а опечатка не создавала новую цель в Метрике.
export const FUTURE_CONTENT_EVENTS = Object.freeze([
  'chest_seen', 'chest_opened', 'chest_bonus_offered',
  'chest_bonus_rewarded', 'chest_reward_granted',
  'collectible_first', 'collectible_milestone', 'collection_completed',
  'skin_unlocked', 'skin_equipped',
  'quest_seen', 'quest_milestone', 'quest_completed', 'quest_reward_claimed',
]);
const FUTURE_CONTENT_EVENT_SET = new Set(FUTURE_CONTENT_EVENTS);

export const metrics = {
  sink: null,          // function(event, params) — сюда вешается Метрика
  device: 'unknown',
  sessionStart: 0,
  sessionEnded: true,
  sessionId: '',
  lastAdEnd: 0,        // wall clock конца последней рекламы
  exposures: null,     // показ варианта эксперимента в текущей сессии
  data: null,

  init(store, device) {
    this.data = store;
    this.device = device;
    const d = this.data;
    d.days = d.days || [];
    d.byTrigger = d.byTrigger || {};
    this.markDay();
    this.resumeSession();
  },

  // ---------- Локальные заходы по дням ----------
  // Не ретенция: это один игрок на одном устройстве. Настоящие когорты —
  // в Консоли Яндекс Игр. Здесь только чтобы видеть в отладке «вернулся ли я».
  markDay(firstSeen) {
    const d = this.data;
    if (!d) return;
    if (firstSeen) d.firstSeen = firstSeen;
    if (!d.firstSeen) d.firstSeen = Date.now();
    const day = Math.floor((Date.now() - d.firstSeen) / DAY);
    if (!d.days.includes(day)) {
      d.days.push(day);
      if (d.days.length > 40) d.days.shift();
    }
  },

  returnedOn(day) { return !!(this.data && this.data.days && this.data.days.includes(day)); },

  // ---------- Сессии ----------
  sessionSeconds() { return this.sessionEnded ? 0 : (Date.now() - this.sessionStart) / 1000; },

  resumeSession() {
    const d = this.data;
    if (!d || !this.sessionEnded) return;
    this.sessionStart = Date.now();
    this.sessionEnded = false;
    this.sessionId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    this.exposures = new Set();
    d.sessions = (d.sessions || 0) + 1;
    this.emit('session_start', { sessions: d.sessions, device: this.device });
  },

  avgSessionSeconds() {
    const d = this.data;
    if (!d || !d.sessions) return 0;
    return (d.playSeconds || 0) / d.sessions;
  },

  endSession(reason = 'hidden') {
    const d = this.data;
    if (!d || this.sessionEnded) return;
    const seconds = this.sessionSeconds();
    this.sessionEnded = true;
    d.playSeconds = (d.playSeconds || 0) + seconds;
    d.exits = (d.exits || 0) + 1;
    // Выход в первую минуту после рекламы — главный признак, что реклама
    // сломала сессию. Считаем отдельно.
    if (this.lastAdEnd && Date.now() - this.lastAdEnd < 60000) {
      d.exitsAfterAd = (d.exitsAfterAd || 0) + 1;
      this.emit('exit_after_ad', { withinSec: Math.round((Date.now() - this.lastAdEnd) / 1000) });
    }
    this.emit('session_end', { seconds: Math.round(seconds), reason });
  },

  exitAfterAdRate() {
    const d = this.data;
    if (!d || !d.adsEndedShown) return 0;
    return (d.exitsAfterAd || 0) / d.adsEndedShown;
  },

  // ---------- Реклама ----------
  // Оффер появился на экране. Это НЕ показ рекламы — только кнопка.
  offerShown(id) {
    const b = this.bucket(id);
    b.offered++;
    this.emit('ad_offer_shown', { id });
    if (id === 'haul') this.emit('bag_unload_offer', { bag: 'full' });
  },

  // Игрок нажал на оффер. Дальше площадка может ролик и не отдать.
  offerClicked(id) {
    const b = this.bucket(id);
    b.clicked++;
    this.emit('ad_offer_clicked', { id });
  },

  adOpened(id, kind) { this.emit('ad_opened', { id, kind }); },

  // Ролик досмотрен и награда засчитана.
  adRewarded(id) {
    const b = this.bucket(id);
    b.rewarded++;
    const d = this.data;
    d.rewardedShown = (d.rewardedShown || 0) + 1;
    this.emit('ad_rewarded', { id });
  },

  adClosed(id, kind, shown) {
    const d = this.data;
    if (kind === 'interstitial' && shown) d.interstitialShown = (d.interstitialShown || 0) + 1;
    if (shown) {
      d.adsEndedShown = (d.adsEndedShown || 0) + 1;
      this.lastAdEnd = Date.now();
    }
    this.emit('ad_closed', { id, kind, shown: shown ? 1 : 0 });
  },

  adError(id, kind, message) {
    this.emit('ad_error', { id, kind, message: String(message || 'unknown').slice(0, 120) });
  },

  bucket(id) {
    const d = this.data;
    if (!d.byTrigger[id]) d.byTrigger[id] = { offered: 0, clicked: 0, rewarded: 0 };
    const b = d.byTrigger[id];
    if (b.taken !== undefined) { b.clicked = b.clicked || b.taken; delete b.taken; }
    if (b.rewarded === undefined) b.rewarded = 0;
    return b;
  },

  // Доля нажатий на оффер. Полезно, но НЕ главная метрика: высокая конверсия
  // может означать, что бесплатная экономика задушена.
  rate(id) {
    const b = this.data && this.data.byTrigger && this.data.byTrigger[id];
    return b && b.offered ? b.clicked / b.offered : 0;
  },

  rewardedPerSession() {
    const d = this.data;
    if (!d || !d.sessions) return 0;
    return (d.rewardedShown || 0) / d.sessions;
  },

  // ---------- Прогрессия и ворота ----------
  // Скорость прогрессии с рекламой и без: считаем секунды на лес отдельно
  // для забегов, где ролик смотрели, и где нет.
  forestUnlocked(seconds, usedAd, forest) {
    const d = this.data;
    const k = usedAd ? 'ad' : 'noad';
    d.forest = d.forest || { ad: { n: 0, sec: 0 }, noad: { n: 0, sec: 0 } };
    d.forest[k].n++;
    d.forest[k].sec += seconds;
    this.emit('forest_unlocked', { seconds: Math.round(seconds), usedAd: usedAd ? 1 : 0, forest });
  },

  // ГЛАВНАЯ метрика оффера у ворот. Не «нажал на рекламу», а «открыл ворота
  // в течение 120 секунд после неё». Если ролик кончился, а стена стоит —
  // игрок считает это обманом, и никакая конверсия по клику это не покажет.
  gateResolved(variant, seconds, opened, forest) {
    const d = this.data;
    d.gate = d.gate || {};
    const g = d.gate[variant] || (d.gate[variant] = { tried: 0, opened: 0 });
    g.tried++;
    if (opened) g.opened++;
    this.emit('gate_opened_120s', {
      variant,
      seconds: Math.round(seconds),
      opened: opened ? 1 : 0,
      forest: Math.max(1, Math.floor(forest || 1)),
    });
  },

  gateWinRate(variant) {
    const g = this.data && this.data.gate && this.data.gate[variant];
    return g && g.tried ? g.opened / g.tried : 0;
  },

  runFinished(params) { this.emit('run_finished', params || {}); },

  // ---------- Контракт будущих A/B-тестов ----------
  // Вызывать не при загрузке флага, а только когда игрок действительно увидел
  // механику. Один вариант пишется один раз за сессию, иначе активный игрок
  // искусственно перевесит выборку десятками одинаковых экспозиций.
  experimentExposed(experiment, variant, context) {
    const exp = String(experiment || '').slice(0, 48);
    const arm = String(variant || 'off').slice(0, 48);
    if (!exp || arm === 'off') return false;
    if (!this.exposures) this.exposures = new Set();
    const key = exp + ':' + arm;
    if (this.exposures.has(key)) return false;
    this.exposures.add(key);
    this.emit('experiment_exposure', { experiment: exp, variant: arm, ...(context || {}) });
    return true;
  },

  // Единая безопасная точка для будущих сундуков, коллекций, скинов и заданий.
  // В params передаём только агрегаты: variant, forest, amount, milestone,
  // reward_type. Координаты, имена и другие персональные данные не нужны.
  futureContent(event, params) {
    if (!FUTURE_CONTENT_EVENT_SET.has(event)) return false;
    this.emit(event, params || {});
    return true;
  },

  forestPace(usedAd) {
    const f = this.data && this.data.forest;
    const k = usedAd ? 'ad' : 'noad';
    if (!f || !f[k] || !f[k].n) return 0;
    return f[k].sec / f[k].n;
  },

  gateStuck(seconds, forest) {
    const d = this.data;
    d.gateStuckSessions = (d.gateStuckSessions || 0) + 1;
    d.gateStuckSeconds = (d.gateStuckSeconds || 0) + seconds;
    this.emit('gate_stuck', { seconds: Math.round(seconds), forest: Math.max(1, Math.floor(forest || 1)) });
  },

  gateStuckShare() {
    const d = this.data;
    if (!d || !d.sessions) return 0;
    return (d.gateStuckSessions || 0) / d.sessions;
  },

  // ---------- Доход ----------
  noteEarned(v) {
    const d = this.data;
    d.earned = (d.earned || 0) + v;
  },

  emit(event, params) {
    try {
      this.sink && this.sink(event, {
        session_id: this.sessionId,
        device: this.device,
        ...(params || {}),
      });
    } catch (e) {}
  },
};

// Подключение Яндекс.Метрики. Счётчик ставится отдельно (тег на странице),
// здесь только мост: metrics.sink = ymSink(<id счётчика>).
export function ymSink(counterId) {
  return (event, params) => {
    if (typeof window.ym !== 'function') return;
    window.ym(counterId, 'reachGoal', event, params);
  };
}

// Поднимает стандартный тег Яндекс.Метрики и возвращает sink для событий.
// Номер счётчика приходит удалённым флагом, поэтому в архиве нет секретов
// и для смены счётчика не требуется новая сборка.
export function connectYandexMetrika(counterId) {
  const id = Math.floor(Number(counterId));
  if (!Number.isFinite(id) || id <= 0 || typeof window === 'undefined') return null;

  if (typeof window.ym !== 'function') {
    const queued = function () { (queued.a = queued.a || []).push(arguments); };
    queued.l = Date.now();
    window.ym = queued;
  }

  if (typeof document !== 'undefined' && !document.querySelector('script[data-lumberjack-metrika]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    script.dataset.lumberjackMetrika = '1';
    document.head.appendChild(script);
  }

  window.__lumberjackYmCounters = window.__lumberjackYmCounters || {};
  if (!window.__lumberjackYmCounters[id]) {
    window.__lumberjackYmCounters[id] = true;
    window.ym(id, 'init', {
      clickmap: false,
      trackLinks: false,
      accurateTrackBounce: true,
      webvisor: false,
    });
  }
  return ymSink(id);
}
