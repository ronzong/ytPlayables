import { t } from './i18n.js';

const SUFFIX = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function fmtMoney(v) {
  if (!isFinite(v)) return '∞';
  const neg = v < 0; v = Math.abs(v);
  if (v < 1000) return (neg ? '-' : '') + (v < 10 ? Math.floor(v * 10) / 10 : Math.floor(v));
  let i = 0;
  while (v >= 1000 && i < SUFFIX.length - 1) { v /= 1000; i++; }
  let s = v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return (neg ? '-' : '') + s + SUFFIX[i];
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return h + t('timeHour') + ' ' + m + t('timeMinute');
  if (m) return m + t('timeMinute') + ' ' + s + t('timeSecond');
  return s + t('timeSecond');
}
