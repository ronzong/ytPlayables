// Баланс и контент. Всё, что хочется покрутить, живёт здесь.
import { t } from './i18n.js';

export const WORLD = {
  islandRadius: 92,
  shoreStart: 86,
  plazaRadius: 10.5,
  gateWidth: 0.42,   // радианы: ширина прохода в заборе
  gateAngle: 0,      // проход смотрит в сторону +X
};

export const PLAYER = {
  radius: 0.62,
  accel: 42,
  friction: 16,
  turnSpeed: 14,
};

// Кольца леса — это геометрия острова. Порода в кольце зависит от прокрутки.
export const RINGS = [
  { i: 0, inner: 12.5, outer: 29, trees: 46 },
  { i: 1, inner: 29,   outer: 45, trees: 56 },
  { i: 2, inner: 45,   outer: 59, trees: 58 },
  { i: 3, inner: 59,   outer: 72, trees: 56 },
  { i: 4, inner: 72,   outer: 85, trees: 52 },
];
export const RING_COUNT = RINGS.length;

// Пять стартовых пород заданы вручную, дальше — бесконечная процедурная лесенка.
const BASE_SPECIES = [
  {
    key: 'birch', hp: 4, logs: 4, value: 8, respawn: 3.5,
    height: 5.0, trunkR: 0.26, crown: 'ico', crownR: 1.7, crownH: 3.1,
    trunk: 0xF0EDE4, crownCol: 0x8ED462, logCol: 0xE6DFCE, ground: 0x6FBF54, glow: 0,
  },
  {
    key: 'pine', hp: 15, logs: 6, value: 30, respawn: 5,
    height: 6.8, trunkR: 0.34, crown: 'cone3', crownR: 2.1, crownH: 5.0,
    trunk: 0x7A5334, crownCol: 0x2F7D4F, logCol: 0xA9764A, ground: 0x5AA84A, glow: 0,
  },
  {
    key: 'oak', hp: 50, logs: 9, value: 170, respawn: 6,
    height: 6.0, trunkR: 0.50, crown: 'ico', crownR: 2.9, crownH: 3.5,
    trunk: 0x6B4A2F, crownCol: 0x4E9B3A, logCol: 0x9C6E43, ground: 0x63A845, glow: 0,
  },
  {
    key: 'sequoia', hp: 180, logs: 13, value: 950, respawn: 7,
    height: 10.5, trunkR: 0.68, crown: 'cone3', crownR: 2.8, crownH: 6.8,
    trunk: 0x8C4A32, crownCol: 0x2A6B45, logCol: 0xB06A45, ground: 0x4A8F52, glow: 0,
  },
  {
    key: 'golden', hp: 600, logs: 18, value: 5200, respawn: 8,
    height: 7.6, trunkR: 0.60, crown: 'ico', crownR: 3.1, crownH: 3.9,
    trunk: 0x8A6B34, crownCol: 0xF2C43D, logCol: 0xD9A84B, ground: 0x86A24C, glow: 0.18,
  },
];

// Породы дальше золотого леса: имя, цвета, форма кроны, свечение
const EXOTIC = [
  { key: 'emerald',   crown: 'crystal', crownCol: 0x2FD98A, trunk: 0x2E6B52, logCol: 0x4FE0A0, ground: 0x3E8F6B, glow: 0.30 },
  { key: 'chromatic', crown: 'ico',     crownCol: 0xE55FD0, trunk: 0x6B3A78, logCol: 0xF07FE0, ground: 0x7A4E90, glow: 0.34 },
  { key: 'diamond',   crown: 'crystal', crownCol: 0x9FE8FF, trunk: 0x53788C, logCol: 0xC4F2FF, ground: 0x6E9AAF, glow: 0.38 },
  { key: 'obsidian',  crown: 'cone3',   crownCol: 0x3A3550, trunk: 0x1E1B2C, logCol: 0x5A5478, ground: 0x413C58, glow: 0.22 },
  { key: 'amethyst',  crown: 'crystal', crownCol: 0xB07BF0, trunk: 0x4E3670, logCol: 0xCFA4FF, ground: 0x6B52A0, glow: 0.36 },
  { key: 'ruby',      crown: 'ico',     crownCol: 0xFF4D6A, trunk: 0x7A2436, logCol: 0xFF8098, ground: 0x9C3A52, glow: 0.36 },
  { key: 'plasma',    crown: 'cone3',   crownCol: 0xFF9640, trunk: 0x8A3F16, logCol: 0xFFC080, ground: 0xB3652C, glow: 0.42 },
  { key: 'lunar',     crown: 'ico',     crownCol: 0xDCE6FF, trunk: 0x54607F, logCol: 0xF0F4FF, ground: 0x7A87A8, glow: 0.34 },
  { key: 'astral',    crown: 'crystal', crownCol: 0x5C7BFF, trunk: 0x2E3A78, logCol: 0x92A8FF, ground: 0x47559C, glow: 0.44 },
  { key: 'quantum',   crown: 'ico',     crownCol: 0x35F5D8, trunk: 0x1B6B62, logCol: 0x7DFFEE, ground: 0x2E8F84, glow: 0.46 },
  { key: 'crystal',   crown: 'crystal', crownCol: 0xFFF2A8, trunk: 0x8A7B3A, logCol: 0xFFF9D0, ground: 0xB0A45E, glow: 0.40 },
  { key: 'titan',     crown: 'cone3',   crownCol: 0x8FA3B0, trunk: 0x46555F, logCol: 0xC0D0DA, ground: 0x63757F, glow: 0.26 },
  { key: 'neon',      crown: 'ico',     crownCol: 0x62FF3A, trunk: 0x2C6B18, logCol: 0xA8FF80, ground: 0x3F8F26, glow: 0.50 },
  { key: 'mithril',   crown: 'crystal', crownCol: 0xA8FFF0, trunk: 0x3E7A74, logCol: 0xD6FFF8, ground: 0x55A099, glow: 0.44 },
  { key: 'eternal',   crown: 'ico',     crownCol: 0xFFD9F0, trunk: 0x8A5A78, logCol: 0xFFEAF8, ground: 0xB07A9C, glow: 0.52 },
];

const HP_STEP = 2.2;      // во сколько раз крепче следующий лес
const VALUE_STEP = 3.0;   // во сколько раз дороже бревно (рюкзак — узкое место, доход растёт ~×3)
const CAP = 1e250;        // потолок, чтобы числа не сваливались в Infinity/NaN
const speciesCache = new Map();

// Порода по глобальному индексу леса (0 — берёза, дальше вглубь без конца)
export function speciesAt(index) {
  index = Math.max(0, Math.floor(index));
  let s = speciesCache.get(index);
  if (s) return s;
  if (index < BASE_SPECIES.length) {
    s = { ...BASE_SPECIES[index], index };
  } else {
    const n = index - BASE_SPECIES.length;      // 0, 1, 2, …
    const e = EXOTIC[n % EXOTIC.length];
    const cycle = Math.floor(n / EXOTIC.length); // второй круг имён — с римской цифрой
    const last = BASE_SPECIES[BASE_SPECIES.length - 1];
    const k = index - (BASE_SPECIES.length - 1);
    const wide = e.crown === 'ico';
    s = {
      ...e,
      index, cycle,
      hp: Math.min(CAP, last.hp * Math.pow(HP_STEP, k)),
      value: Math.min(CAP, last.value * Math.pow(VALUE_STEP, k)),
      logs: Math.min(40, 18 + Math.round(n * 0.8)),
      respawn: Math.min(11, 8 + n * 0.12),
      height: 6.4 + (n % 4) * 1.1,
      trunkR: 0.5 + (n % 3) * 0.09,
      crownR: wide ? 2.9 : 2.4,
      crownH: e.crown === 'cone3' ? 6.4 : 4.0,
    };
  }
  speciesCache.set(index, s);
  return s;
}

// Как зовётся лес с этим индексом
export function speciesName(index) {
  const s = speciesAt(index);
  const base = t('sp_' + s.key);
  if (!s.cycle) return base;
  return base + ' ' + ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][Math.min(s.cycle, 7)];
}

// Цена открытия леса с этим индексом (0-й бесплатный)
export function forestCost(index) {
  if (index <= 0) return 0;
  const c = 140 * Math.pow(2.9, index - 1);
  return c > 1e250 ? Infinity : Math.ceil(c);
}

const geo = (base, mult) => (lvl) => base * Math.pow(mult, lvl);

// Улучшения забега. У всего, что должно догонять бесконечно растущий лес,
// потолка нет — иначе игра встаёт намертво.
export const UPGRADES = [
  { id: 'axe',    icon: 'axe',    max: 9999, cbase: 30,   cmult: 1.55, vbase: 4, vmult: 1.17, fmt: (v) => fmtRate(v) },
  { id: 'radius', icon: 'radius', max: 22,   cbase: 80,   cmult: 1.52, lin: [4.2, 0.48],      fmt: (v) => v.toFixed(1) + t('unit_m') },
  // Поздние уровни рюкзака дают больше места: радиус и число одновременно
  // срубленных деревьев растут, поэтому вечные +7 быстро переставали ощущаться.
  { id: 'bag',    icon: 'bag',    max: 9999, cbase: 45,   cmult: 1.30, curve: (l) => 18 + 7 * l + 0.32 * l * l, fmt: (v) => fmtInt(v) },
  { id: 'speed',  icon: 'boot',   max: 26,   cbase: 100,  cmult: 1.48, lin: [7.0, 0.55],      fmt: (v) => v.toFixed(1) + t('unit_ms') },
  { id: 'price',  icon: 'coin',   max: 9999, cbase: 200,  cmult: 1.50, vbase: 1, vmult: 1.11, fmt: (v) => '×' + (v < 10 ? v.toFixed(2) : fmtInt(v)) },
  { id: 'unload', icon: 'truck',  max: 90,   cbase: 50,   cmult: 1.28, lin: [14, 10],         fmt: (v) => fmtRate(v) },
  { id: 'helpers', icon: 'helper', max: 10,  cbase: 1600, cmult: 3.60, lin: [0, 1],           fmt: (v) => Math.round(v) + t('unit_pcs') },
  // Скорость перемещения помощников. Их доход теперь не разгоняется
  // тем же множителем: поздний рост вынесен в «Бригадира» за жёлуди.
  { id: 'helperSpeed', icon: 'bolt', max: 40, cbase: 3500, cmult: 1.50, lin: [1, 0.12], requires: { helpers: 1 }, fmt: (v) => '×' + v.toFixed(1) },
];

for (const u of UPGRADES) {
  u.cost = (lvl) => u.cbase * Math.pow(u.cmult, lvl);
  u.value = u.curve
    ? u.curve
    : u.lin
      ? (lvl) => u.lin[0] + lvl * u.lin[1]
      : (lvl) => { const v = u.vbase * Math.pow(u.vmult, lvl); return u.round ? Math.round(v) : v; };
}

export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

function fmtInt(v) {
  if (v < 1000) return String(Math.round(v));
  const S = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  let i = 0; while (v >= 1000 && i < S.length - 1) { v /= 1000; i++; }
  return (v < 10 ? v.toFixed(1).replace(/\.0$/, '') : Math.round(v)) + S[i];
}
function fmtRate(v) { return fmtInt(v) + t('unit_ps'); }

// ---------- Мета-улучшения за жёлуди (переживают забег) ----------
export const META = [
  { id: 'density',   icon: '🌲', max: 25, cost: geo(4, 1.30),  value: (l) => 1 + l * 0.08, fmt: (v) => '+' + Math.round((v - 1) * 100) + '%' },
  { id: 'startCash', icon: '💰', max: 40, cost: geo(2, 1.35),  value: (l) => (l === 0 ? 0 : Math.round(80 * Math.pow(2.3, l - 1))), fmt: (v) => fmtInt(v) },
  { id: 'startLvl',  icon: '⭐', max: 80, cost: geo(4, 1.28),  value: (l) => l, fmt: (v) => '+' + v + ' ' + t('lvl') },
  { id: 'machine',   icon: '🚜', max: 4,  cost: (l) => [12, 70, 400, 2200][l] ?? Infinity, value: (l) => l, fmt: (v) => t('mach_' + v) },
  { id: 'priceMeta', icon: '🪙', max: 60, cost: geo(5, 1.32),  value: (l) => 1 + l * 0.12, fmt: (v) => '×' + v.toFixed(2) },
  { id: 'crew',      icon: '👷', max: 10, cost: geo(10, 1.55), value: (l) => l, fmt: (v) => v + t('unit_pcs') },
  { id: 'harvest',   icon: '🌰', max: 40, cost: geo(8, 1.34),  value: (l) => 1 + l * 0.15, fmt: (v) => '×' + v.toFixed(2) },
  // Первый уровень стоит 80 жёлудей: это осознанная поздняя цель, а не разгон первого престижа.
  { id: 'foreman',   icon: '📣', max: 30, cost: geo(80, 1.45), value: (l) => 1 + l * 0.15, fmt: (v) => '×' + (0.55 * v).toFixed(2) },
];

export const META_BY_ID = Object.fromEntries(META.map((m) => [m.id, m]));

// Бонусы техники: радиус, скорость и мощность рубки
export const MACHINE = [
  { r: 1.00, s: 1.00, p: 1.00 },
  { r: 1.14, s: 1.10, p: 1.18 },
  { r: 1.32, s: 1.26, p: 1.45 },
  { r: 1.54, s: 1.45, p: 1.85 },
  { r: 1.80, s: 1.68, p: 2.40 },
];

export const PRESTIGE = {
  fromForest: 4,        // с какого леса начинают капать жёлуди
  step: 1.30,           // во сколько раз больше за каждый следующий лес
  minAcorns: 3,         // раньше не пускаем в новый забег
};

// Жёлуди зависят ТОЛЬКО от глубины леса. Множители цены их не раздувают.
export function acornsFor(deepestForest, harvestMult) {
  const d = Math.floor(deepestForest) - PRESTIGE.fromForest;
  if (d < 1) return 0;
  return Math.floor(Math.pow(PRESTIGE.step, d) * harvestMult);
}

// Предохранитель от софтлока: в новый лес не пускаем, пока ближний круг
// не рубится за это время. Иначе hp обгоняет топор и игра встаёт.
export const GATE = {
  maxChopSeconds: 1.0,
  stuckSeconds: 25,     // дольше — предлагаем отступить на лес назад
};

export const AD = {
  // ---------- Полноэкранная реклама ----------
  // Требование площадки (Расположение рекламы, п.4): показывать только в
  // естественных паузах и никогда во время активного взаимодействия —
  // иначе случайные клики и рекламный фрод. У нас это смена леса и престиж.
  // 本地测试节奏（2026-09-27 调整）：原 480 秒 → 60 秒，页面开满 1 分钟即可第一次出插屏。
  interstitialCooldown: 60,
  // 新手保护：开到第 firstRunFreeForest 个森林之前不出插屏。
  // 原判定是“完成一次 prestige（runs>0）”，首次 prestige 要打到第 9 个森林才够橡果，
  // 短时间测试根本走不到，因此改为按森林深度判定。
  firstRunFree: true,
  firstRunFreeForest: 2,
  // 账号年龄下限：原 12 分钟 → 2 分钟（按 meta.firstSeen 计算，不是本局时长）。
  quietMinutes: 2,
  warnSeconds: 2,          // предупреждение перед показом

  boostDuration: 180,
  boostMultiplier: 2,
  skipMinutes: 5,

  // ---------- Rewarded ----------
  // Частоту площадка не лимитирует, но показ обязан запускаться по желанию
  // игрока. «Не лимитировано» ≠ «можно навязывать»: паузы ниже — наши, а не
  // площадки, и нужны чтобы кнопки не мигали в кадре постоянно.
  bonusCooldown: 120,
  freeLevelCooldown: 180,
  freeLevelFirstDelay: 90,
  bonusFirstDelay: 60,
  rainbowFirstDelay: 150,
  rainbowCooldown: 420,
  rainbowOfferMin: 60,
  rainbowOfferMax: 180,
  rainbowDuration: 20,
  rewardedGap: 90,         // минимум между любыми двумя роликами

  // ---------- Контекстные офферы ----------
  gateStuckSeconds: 30,    // после этого пишем метрику «застрял у ворот»
  gateOfferDelay: 4,       // а добровольную помощь показываем вместе с плашкой
  gateBurstMax: 3,         // до трёх апов топора подряд
  gateBurstCooldown: 180,  // затем пауза на три минуты
  gateBoostMult: 3,        // ветка 'boost': временная сила
  gateBoostDuration: 45,
  haulDistance: 40,        // полный рюкзак дальше этого — предлагаем мгновенную сдачу
  haulCooldown: 150,
  forestBonusWindow: 12,   // сколько секунд после открытия леса виден оффер
  forestBonusDuration: 45,
  prepBonusMult: 1.25,     // если оффер жёлудей включат — начинать с +25%, не +50%

  offlineCapHours: 3,
  offlineRate: 0.55,
};
export const LEADERBOARD = 'totalEarned';
export const SAVE_VERSION = 5;
