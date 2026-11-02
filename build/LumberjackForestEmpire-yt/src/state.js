// Состояние: отдельно забег (сбрасывается) и мета-прогресс (навсегда).
import { UPGRADES, UPGRADE_BY_ID, META, META_BY_ID, MACHINE, RINGS, RING_COUNT,
         SAVE_VERSION, AD, PRESTIGE, GATE, acornsFor, speciesAt, forestCost } from './config.js';
import { sdk } from './sdk.js';

const START_LVL_IDS = ['axe', 'radius', 'bag', 'speed', 'price', 'unload'];

export const run = {
  money: 0,
  totalEarned: 0,
  carry: {},          // индекс леса -> количество брёвен
  carryCount: 0,
  upg: {},
  rings: 1,           // сколько колец открыто (1..5)
  scroll: 0,          // сколько раз лес прокрутился вглубь
  gateProgress: 0,
  boostUntil: 0,
  playTime: 0,
  helperEarned: 0,
  helperTime: 0,
  helperRate: 0,
  rush: null,         // активный радужный заезд: награда уже оплачена роликом
  haulBonusUntil: 0,  // временное удвоение добычи за просмотр ролика
  gateBoostUntil: 0,  // временная сила топора за ролик у ворот (ветка 'boost')
  adsThisForest: 0,   // сколько роликов посмотрели в текущем лесу
  forestStartedAt: 0, // playTime на момент открытия текущего леса
};

export const meta = {
  acorns: 0,
  m: {},
  runs: 0,
  bestForest: 1,
  lifetimeEarned: 0,
  lifetimeAcorns: 0,
  soundOn: true,
  volume: 0.5,
  tutorial: 0,        // номер пройденного шага обучения
  dailyDay: -1,
  dailyStreak: 0,
  rainbowTickets: 0,
  preparingRun: false,
  firstSeen: 0,       // когда игрок впервые запустил игру — по этому разгоняем рекламу
  manualHauls: 0,     // сколько раз игрок сам донёс рюкзак до пилорамы
  gateAdBurstCount: 0,    // просмотрено из серии 3 рекламных апов топора
  gateAdCooldownUntil: 0, // реальное время окончания трёхминутной паузы
  stats: {},          // хранилище метрик, целиком принадлежит metrics.js
};

export const state = { dirty: false, sessionTime: 0 };

for (const u of UPGRADES) run.upg[u.id] = 0;
for (const m of META) meta.m[m.id] = 0;

// ---------- Производные ----------
export function val(id) { return UPGRADE_BY_ID[id].value(run.upg[id]); }
export function mval(id) { return META_BY_ID[id].value(meta.m[id]); }

// Сколько часов прошло с первого запуска: по этому решаем, пора ли показывать фулскрины
export function playerAgeHours() {
  if (!meta.firstSeen) meta.firstSeen = Date.now();
  return (Date.now() - meta.firstSeen) / 3600000;
}

// 插屏的新手保护是否已经结束：两个条件都要满足——
//   1) 已经开到第 AD.firstRunFreeForest 个森林（deepestForest 是 1-based 的已开森林数）
//   2) 账号年龄达到 AD.quietMinutes 分钟（按 meta.firstSeen，不是本局时长）
// 放在 state.js 而不是 Game 类里，是为了能被 Node 自检直接调用（见 tools/verify-ad-gates.cjs）。
export function quietPeriodOver() {
  if (AD.firstRunFree && deepestForest() < AD.firstRunFreeForest) return false;
  return playerAgeHours() * 60 >= AD.quietMinutes;
}

export function machineTier() { return meta.m.machine | 0; }
export function chopRadius() { return val('radius') * MACHINE[machineTier()].r; }
export function moveSpeed() { return val('speed') * MACHINE[machineTier()].s; }
export function gateBoostActive() { return run.playTime < run.gateBoostUntil; }
export function chopPower() {
  const base = val('axe') * MACHINE[machineTier()].p;
  return gateBoostActive() ? base * AD.gateBoostMult : base;
}

// Сколько уровней топора нужно, чтобы ворота открылись (ближнее кольцо ≤ 1 сек).
// Ветка 'levels' даёт ровно столько — не больше. Реклама снимает блок,
// а не обгоняет обычную экономику.
export function axeLevelsToGate() {
  const u = UPGRADE_BY_ID.axe;
  const need = ringSpecies(0).hp / (MACHINE[machineTier()].p * GATE.maxChopSeconds);
  const lvl = Math.ceil(Math.log(need / u.vbase) / Math.log(u.vmult));
  return Math.max(0, lvl - (run.upg.axe || 0));
}

// Выдать ровно столько постоянных уровней, сколько требуется текущим воротам.
// Финальная проверка идёт по реальному времени рубки, поэтому погрешность
// логарифма на границе 1 секунды не оставит игрока перед закрытой стеной.
export function grantAxeToGate() {
  const before = run.upg.axe || 0;
  const max = UPGRADE_BY_ID.axe.max;
  run.upg.axe = Math.min(max, before + axeLevelsToGate());
  while (!forestGateOk() && run.upg.axe < max) run.upg.axe++;
  state.dirty = true;
  return run.upg.axe - before;
}

// Оффер у ворот показываем при любом ненулевом отставании. Награда больше не
// ограничена 12 уровнями: после оплаченного просмотра она обязана снять блок.
export function gateOfferCanDeliver() {
  const n = axeLevelsToGate();
  return n > 0 && run.upg.axe < UPGRADE_BY_ID.axe.max;
}
export function boostActive() { return run.playTime < run.boostUntil; }
export function haulBonusActive() { return run.playTime < run.haulBonusUntil; }
export function moneyMult() {
  return (boostActive() ? AD.boostMultiplier : 1) * (haulBonusActive() ? 2 : 1);
}
export function priceMult() { return val('price') * mval('priceMeta') * moneyMult(); }
export function helperCount() { return Math.min(14, run.upg.helpers + mval('crew')); }
// Наёмная бригада стартует с 55% эффективности; поздний «Бригадир» её поднимает.
export function helperIncomeMult() { return 0.55 * mval('foreman'); }
export function treeDensity() { return mval('density'); }

export function costOf(id) {
  const u = UPGRADE_BY_ID[id];
  if (run.upg[id] >= u.max) return Infinity;
  return Math.ceil(u.cost(run.upg[id]));
}
export function metaCostOf(id) {
  const m = META_BY_ID[id];
  if (meta.m[id] >= m.max) return Infinity;
  return Math.ceil(m.cost(meta.m[id]));
}

export function isLocked(id) {
  const u = UPGRADE_BY_ID[id];
  if (!u.requires) return false;
  for (const k in u.requires) if (run.upg[k] < u.requires[k]) return true;
  return false;
}
export function canBuy(id) { return !isLocked(id) && run.money >= costOf(id); }
export function canBuyMeta(id) { return meta.acorns >= metaCostOf(id); }

export function buy(id) {
  if (!canBuy(id)) return false;
  run.money -= costOf(id);
  run.upg[id]++;
  state.dirty = true;
  return true;
}

// Суммарная цена n уровней подряд (геометрическая прогрессия)
export function bulkCost(id, n) {
  const u = UPGRADE_BY_ID[id];
  const lvl = run.upg[id];
  const k = Math.max(0, Math.min(n, u.max - lvl));
  if (k === 0) return { n: 0, cost: Infinity };
  const m = u.cmult;
  const first = u.cbase * Math.pow(m, lvl);
  const cost = Math.ceil(first * (Math.pow(m, k) - 1) / (m - 1));
  return { n: k, cost };
}

// Сколько уровней можно взять на текущие деньги
export function maxAffordable(id) {
  const u = UPGRADE_BY_ID[id];
  const lvl = run.upg[id];
  if (lvl >= u.max || isLocked(id)) return { n: 0, cost: Infinity };
  const m = u.cmult;
  const first = u.cbase * Math.pow(m, lvl);
  if (run.money < first) return { n: 0, cost: Math.ceil(first) };
  const raw = Math.log(1 + (run.money * (m - 1)) / first) / Math.log(m);
  let n = Math.min(u.max - lvl, Math.max(1, Math.floor(raw)));
  // подстраховка от ошибок округления
  while (n > 1 && bulkCost(id, n).cost > run.money) n--;
  while (n < u.max - lvl && bulkCost(id, n + 1).cost <= run.money) n++;
  return bulkCost(id, n);
}

export function buyBulk(id, n) {
  const b = n === 'max' ? maxAffordable(id) : bulkCost(id, n);
  if (b.n <= 0 || b.cost > run.money || isLocked(id)) return 0;
  run.money -= b.cost;
  run.upg[id] += b.n;
  state.dirty = true;
  return b.n;
}
export function buyMeta(id) {
  if (!canBuyMeta(id)) return false;
  meta.acorns -= metaCostOf(id);
  meta.m[id]++;
  state.dirty = true;
  return true;
}

const MONEY_CAP = 1e250;   // выше числа перестают быть числами

export function addMoney(v, fromHelper = false) {
  if (!(v > 0)) return 0;
  run.money = Math.min(MONEY_CAP, run.money + v);
  run.totalEarned = Math.min(MONEY_CAP, run.totalEarned + v);
  if (fromHelper) run.helperEarned += v;
  state.dirty = true;
  return v;
}

// ---------- Лес и кольца ----------
export function ringSpeciesIndex(ring) { return run.scroll + ring; }
export function ringSpecies(ring) { return speciesAt(run.scroll + ring); }
export function deepestForest() { return run.scroll + run.rings; }   // сколько лесов открыто, 1-based
export function nextForestIndex() { return run.scroll + run.rings; }
export function nextForestCost() { return forestCost(nextForestIndex()); }
export function maxRadius() { return RINGS[run.rings - 1].outer; }
export function atLastRing() { return run.rings >= RING_COUNT; }

// Радиус, на котором стоит забор / ворота
export function gateRadius() {
  return atLastRing() ? RINGS[RING_COUNT - 1].outer : RINGS[run.rings].inner;
}

// Сколько секунд уходит на одно дерево в кольце
export function ringChopTime(i) {
  return ringSpecies(i).hp / Math.max(1e-9, chopPower());
}

// Пускать ли в следующий лес. Первые пять лесов — без ограничений,
// дальше требуем, чтобы ближний круг рубился быстрее секунды.
export function forestGateOk() {
  if (run.rings < RING_COUNT) return true;
  return ringChopTime(0) <= GATE.maxChopSeconds;
}

// Игрок всё-таки застрял (например, на старом сейве) — можно отступить
export function isStuck() {
  return run.scroll > 0 && ringChopTime(0) > GATE.stuckSeconds;
}

export function retreatForest() {
  if (run.scroll <= 0) return false;
  run.scroll--;
  run.gateProgress = 0;
  state.dirty = true;
  return true;
}

// Открыть следующий лес: либо новое кольцо, либо прокрутка вглубь
export function openNextForest() {
  if (!atLastRing()) run.rings++;
  else run.scroll++;
  run.gateProgress = 0;
  meta.bestForest = Math.max(meta.bestForest, deepestForest());
  state.dirty = true;
}

// ---------- Рюкзак ----------
export function bagCapacity() { return Math.round(val('bag')); }
export function bagFull() { return run.carryCount >= bagCapacity(); }

export function addLog(speciesIndex, n = 1) {
  const free = bagCapacity() - run.carryCount;
  if (free <= 0) return 0;
  const take = Math.min(free, n);
  run.carry[speciesIndex] = (run.carry[speciesIndex] || 0) + take;
  run.carryCount += take;
  return take;
}

// Снимает до n брёвен, начиная с самых дорогих
export function takeLogs(n) {
  const out = [];
  let left = Math.min(n, run.carryCount);
  const keys = Object.keys(run.carry).filter((k) => run.carry[k] > 0).sort((a, b) => b - a);
  for (const k of keys) {
    if (left <= 0) break;
    const take = Math.min(left, run.carry[k]);
    run.carry[k] -= take;
    run.carryCount -= take;
    left -= take;
    out.push({ idx: +k, n: take });
    if (run.carry[k] <= 0) delete run.carry[k];
  }
  return out;
}

// ---------- Престиж ----------
export function pendingAcorns() { return acornsFor(deepestForest(), mval('harvest')); }
export function canPrestige() { return pendingAcorns() >= PRESTIGE.minAcorns; }

// Жёлуди растут только с глубиной, поэтому прогресс — это прогресс к следующему лесу
export function acornProgress() {
  const cur = pendingAcorns();
  const next = acornsFor(deepestForest() + 1, mval('harvest'));
  const cost = nextForestCost();
  return {
    cur, next,
    forest: deepestForest() + 1,
    frac: Math.min(1, Math.max(0, (run.gateProgress + Math.min(run.money, cost)) / cost)),
  };
}

export function resetRun() {
  run.money = mval('startCash');
  run.totalEarned = 0;
  run.carry = {};
  run.carryCount = 0;
  const lvl = mval('startLvl');
  for (const u of UPGRADES) run.upg[u.id] = START_LVL_IDS.includes(u.id) ? Math.min(u.max, lvl) : 0;
  run.rings = 1;
  run.scroll = 0;
  run.gateProgress = 0;
  run.boostUntil = 0;
  run.playTime = 0;
  run.helperEarned = 0;
  run.helperTime = 0;
  run.helperRate = 0;
  run.rush = null;
  run.haulBonusUntil = 0;
  run.gateBoostUntil = 0;
  run.adsThisForest = 0;
  run.forestStartedAt = 0;
  state.dirty = true;
}

export function doPrestige() {
  const got = pendingAcorns();
  meta.acorns += got;
  meta.lifetimeAcorns += got;
  meta.lifetimeEarned += run.totalEarned;
  meta.runs++;
  meta.bestForest = Math.max(meta.bestForest, deepestForest());
  resetRun();
  return got;
}

// ---------- Сохранение ----------
export function serialize() {
  const now = Date.now();
  const rate = run.helperTime > 5 ? run.helperEarned / run.helperTime : run.helperRate;
  return {
    v: SAVE_VERSION,
    savedAt: now,
    run: {
      money: run.money, totalEarned: run.totalEarned, upg: { ...run.upg },
      rings: run.rings, scroll: run.scroll, gateProgress: run.gateProgress,
      carry: { ...run.carry }, playTime: run.playTime, hRate: rate,
      rush: run.rush ? { ...run.rush } : null, haulBonusUntil: run.haulBonusUntil,
      gateBoostUntil: run.gateBoostUntil, adsThisForest: run.adsThisForest,
      forestStartedAt: run.forestStartedAt,
    },
    meta: {
      acorns: meta.acorns, m: { ...meta.m }, runs: meta.runs, bestForest: meta.bestForest,
      lifetimeEarned: meta.lifetimeEarned, lifetimeAcorns: meta.lifetimeAcorns,
      sound: meta.soundOn, volume: meta.volume, tutorial: meta.tutorial,
      dailyDay: meta.dailyDay, dailyStreak: meta.dailyStreak,
      rainbowTickets: meta.rainbowTickets, preparingRun: meta.preparingRun,
      firstSeen: meta.firstSeen, manualHauls: meta.manualHauls,
      gateAdBurstCount: meta.gateAdBurstCount,
      gateAdCooldownUntil: meta.gateAdCooldownUntil,
      stats: meta.stats,
    },
  };
}

export function deserialize(d) {
  // Версия 5 добавила рекламные и аналитические поля, но базовая структура
  // v4 совместима. Принимаем старый сейв и сразу помечаем его для пересохранения.
  if (!d || (d.v !== SAVE_VERSION && d.v !== 4)) return { offline: 0 };
  const migrated = d.v !== SAVE_VERSION;
  const r = d.run || {}, m = d.meta || {};

  for (const mu of META) meta.m[mu.id] = Math.min(mu.max, Math.max(0, (m.m && m.m[mu.id]) | 0));
  meta.acorns = Math.max(0, +m.acorns || 0);
  meta.runs = Math.max(0, m.runs | 0);
  meta.bestForest = Math.max(1, m.bestForest | 0);
  meta.lifetimeEarned = +m.lifetimeEarned || 0;
  meta.lifetimeAcorns = +m.lifetimeAcorns || 0;
  meta.soundOn = m.sound !== false;
  meta.volume = typeof m.volume === 'number' ? Math.min(1, Math.max(0, m.volume)) : 0.5;
  meta.tutorial = m.tutorial | 0;
  meta.dailyDay = Number.isFinite(+m.dailyDay) ? (+m.dailyDay | 0) : -1;
  meta.dailyStreak = Math.min(7, Math.max(0, m.dailyStreak | 0));
  meta.rainbowTickets = Math.min(9, Math.max(0, m.rainbowTickets | 0));
  meta.preparingRun = m.preparingRun === true;
  meta.firstSeen = +m.firstSeen > 0 ? +m.firstSeen : Date.now();
  meta.manualHauls = Math.max(0, m.manualHauls | 0);
  meta.gateAdBurstCount = Math.min(AD.gateBurstMax, Math.max(0, m.gateAdBurstCount | 0));
  meta.gateAdCooldownUntil = Math.max(0, +m.gateAdCooldownUntil || 0);
  if (meta.gateAdCooldownUntil <= Date.now()) meta.gateAdCooldownUntil = 0;
  meta.stats = (m.stats && typeof m.stats === 'object') ? m.stats : {};

  run.money = +r.money || 0;
  run.totalEarned = +r.totalEarned || 0;
  run.rings = Math.min(RING_COUNT, Math.max(1, r.rings | 0 || 1));
  run.scroll = Math.max(0, r.scroll | 0);
  run.gateProgress = +r.gateProgress || 0;
  run.playTime = +r.playTime || 0;
  run.helperRate = +r.hRate || 0;
  // Заезд оплачен просмотром рекламы — он обязан пережить перезагрузку
  run.haulBonusUntil = +r.haulBonusUntil || 0;
  run.gateBoostUntil = +r.gateBoostUntil || 0;
  run.adsThisForest = Math.max(0, r.adsThisForest | 0);
  run.forestStartedAt = +r.forestStartedAt || 0;
  run.rush = (r.rush && isFinite(+r.rush.target) && +r.rush.target > 0)
    ? { mult: +r.rush.mult || 2, target: +r.rush.target, paid: +r.rush.paid || 0, endsAt: +r.rush.endsAt || 0 }
    : null;
  for (const u of UPGRADES) run.upg[u.id] = Math.min(u.max, Math.max(0, (r.upg && r.upg[u.id]) | 0));

  run.carry = {}; run.carryCount = 0;
  if (r.carry) for (const k in r.carry) {
    const n = Math.max(0, r.carry[k] | 0);
    if (n > 0) { run.carry[k] = n; run.carryCount += n; }
  }
  if (run.carryCount > bagCapacity()) { run.carry = {}; run.carryCount = 0; }

  let offline = 0;
  if (helperCount() > 0 && run.helperRate > 0 && d.savedAt) {
    const elapsed = Math.max(0, (Date.now() - d.savedAt) / 1000);
    const capped = Math.min(elapsed, AD.offlineCapHours * 3600);
    if (capped > 60) offline = Math.floor(run.helperRate * capped * AD.offlineRate);
  }
  if (migrated) state.dirty = true;
  return { offline, migrated };
}

export function pushSave(immediate = false) {
  sdk.save(serialize(), immediate);
  state.dirty = false;
}
