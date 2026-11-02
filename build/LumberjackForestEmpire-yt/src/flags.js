// Фича-флаги. Всё, что связано с рекламой, включается и выключается отсюда,
// без пересборки. Порядок приоритета: значения по умолчанию → флаги Яндекса
// (консоль разработчика, эксперименты) → параметры URL (для ручной проверки).
//
// Правило: одновременно выпускаем только один новый rewarded-сценарий.
// Сейчас это помощь у ворот; остальные включаются отдельными экспериментами.

const DEFAULTS = {
  // Ролик у закрытых ворот.
  //   'levels' — поднять топор ровно до силы, нужной текущим воротам
  //   'off'    — оффера нет
  // Старые значения 'boost'/'auto' безопасно трактуются как 'levels'.
  gateOffer: 'levels',

  // Мгновенная сдача рюкзака. Показываем только тем, кто хотя бы раз донёс сам.
  haulOffer: false,
  haulNeedsManualHauls: 1,

  // Удвоение добычи после открытия нового леса. Только подсказка, без модалки.
  forestBonus: false,

  // +N% жёлудей за забег с экрана подготовки.
  // Выключено: слишком легко превращает каждый престиж в обязательную рекламу.
  prepAcornOffer: false,

  // Радужный заезд (существующий оффер).
  rainbowOffer: true,

  // Полноэкранная реклама.
  interstitial: true,

  // Sticky-баннер. Только десктоп: в портрете он съедает HUD.
  banner: false,

  // Номер собственного счётчика Яндекс.Метрики. 0 — пользовательские
  // события остаются только в локальной диагностике. Значение задаётся
  // удалённым флагом metrikaCounterId без пересборки игры.
  metrikaCounterId: 0,

  // ЗАРЕЗЕРВИРОВАНО ДЛЯ БУДУЩИХ КОНТЕНТНЫХ A/B-ТЕСТОВ.
  // Эти флаги пока ни к чему не подключены и не меняют игру. Строковые
  // варианты позволят проверить механику одной сборкой через Консоль Яндекса.
  // Значение 'off' гарантирует, что незавершённый контент не увидит игрок.
  chestExperiment: 'off',          // off / base / rewarded_150 / rewarded_200
  collectibleExperiment: 'off',    // off / nature_base / nature_dense
  collectionSkinExperiment: 'off', // off / progress / set_completion
  questExperiment: 'off',          // off / session / daily

  // Диагностическая панель (F3 / ?debug=1).
  debugPanel: false,
};

export const flags = { ...DEFAULTS };

export function localQaAllowed() {
  try {
    const h = String(location.hostname || '').toLowerCase();
    return location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  } catch (e) { return false; }
}

function coerce(def, raw) {
  if (typeof def === 'boolean') return raw === true || raw === '1' || raw === 'true' || raw === 'on';
  if (typeof def === 'number') { const n = Number(raw); return Number.isFinite(n) ? n : def; }
  return String(raw);
}

function apply(src, label) {
  if (!src) return;
  for (const k of Object.keys(DEFAULTS)) {
    if (src[k] === undefined || src[k] === null || src[k] === '') continue;
    flags[k] = coerce(DEFAULTS[k], src[k]);
  }
  flags._src = (flags._src ? flags._src + '+' : '') + label;
}

// Флаги из консоли Яндекса. Их же используют A/B-эксперименты площадки:
// одна и та же сборка, разным когортам разные значения.
export async function initFlags(ysdk) {
  try {
    if (ysdk && typeof ysdk.getFlags === 'function') {
      const remote = await ysdk.getFlags();
      apply(remote, 'yandex');
    }
  } catch (e) {}
  // URL-переопределения допустимы только на локальном стенде. Иначе игрок
  // мог бы самостоятельно сменить вариант эксперимента и загрязнить данные.
  if (localQaAllowed()) try {
    const q = new URLSearchParams(location.search);
    const url = {};
    for (const [k, v] of q.entries()) if (k in DEFAULTS) url[k] = v;
    apply(url, 'url');
    if (q.get('debug') === '1') flags.debugPanel = true;
  } catch (e) {}
  if (!localQaAllowed()) flags.debugPanel = false;
  return flags;
}
