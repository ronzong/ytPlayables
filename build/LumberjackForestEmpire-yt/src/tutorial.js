// Пошаговое обучение: баннер, маркер над целью, подсветка кнопки.
import { run, meta, deepestForest, pushSave } from './state.js';
import { G } from './world.js';
import { m4 } from './math.js';
import { t } from './i18n.js';
import { sdk } from './sdk.js';
import { ui } from './ui.js';

const mat = m4.create();
const PILE = { x: 3.0, z: 0 };

const STEPS = [
  {
    id: 'move',
    text: () => (sdk.isMobile ? t('tut_move') : t('tut_moveDesktop')),
    check: (g) => g.moved > 10,
    target: null,
  },
  {
    id: 'chop',
    text: () => t('tut_chop'),
    check: (g) => g.treesChopped >= 2,
    target: (g) => {
      let best = null, bd = Infinity;
      for (const tr of g.forest.trees) {
        if (tr.state !== 'alive' || tr.ring > run.rings - 1) continue;
        const d = (tr.x - g.player.x) ** 2 + (tr.z - g.player.z) ** 2;
        if (d < bd) { bd = d; best = tr; }
      }
      return best ? { x: best.x, z: best.z, y: 5 } : null;
    },
  },
  {
    id: 'sell',
    text: () => t('tut_sell'),
    check: () => run.totalEarned > 0,
    target: () => ({ x: PILE.x, z: PILE.z, y: 4.2 }),
  },
  {
    id: 'openShop',
    text: () => t('tut_openShop'),
    check: () => ui.shopOpen,
    target: null,
    dom: 'btn-shop',
  },
  {
    id: 'buy',
    text: () => t('tut_buy'),
    check: (g) => g.upgradesBought >= 1,
    target: null,
    dom: 'shop-list',
  },
  {
    id: 'upgrades',
    text: () => t('tut_upgrades'),
    info: true,
    target: null,
  },
  {
    id: 'closeShop',
    text: () => t('tut_closeShop'),
    check: () => !ui.shopOpen,
    target: null,
    dom: 'shop-close',
  },
  {
    id: 'gate',
    text: () => t('tut_gate'),
    check: () => deepestForest() >= 2,
    target: (g) => { const p = g.gatePos(); return { x: p.x, z: p.z, y: 4.4 }; },
  },
  {
    id: 'acorns',
    text: () => t('tut_acorns'),
    info: true,
    target: null,
  },
  {
    id: 'meta',
    text: () => t('tut_meta'),
    info: true,
    target: null,
  },
];

export class Tutorial {
  constructor() {
    this.step = 0;
    this.done = false;
    this.t = 0;
    this.markerPos = null;
    this.shown = -1;
  }

  restore(n) {
    this.step = Math.max(0, n | 0);
    this.done = this.step >= STEPS.length;
    if (this.done) ui.setTutorial(null);
  }

  current() { return this.done ? null : STEPS[this.step]; }

  update(dt, game) {
    if (this.done) { this.markerPos = null; return; }
    const s = STEPS[this.step];
    this.t += dt;

    if (this.shown !== this.step) {
      this.shown = this.step;
      ui.setTutorial(s.text(), this.step + 1, STEPS.length, !!s.info);
      ui.highlight(s.dom || null);
    }

    this.markerPos = s.target ? s.target(game) : null;

    if (s.check && s.check(game)) this.advance();
  }

  ack() {
    const s = this.current();
    if (s && s.info) this.advance();
  }

  advance() {
    this.step++;
    this.t = 0;
    this.shown = -1;
    if (this.step >= STEPS.length) {
      this.done = true;
      ui.setTutorial(null);
      ui.highlight(null);
      ui.showHint(t('tut_done'), 4);
    }
    meta.tutorial = this.step;
    pushSave();
  }

  draw(rd, game) {
    const p = this.markerPos;
    if (!p) return;
    const bob = Math.sin(this.t * 4) * 0.35;
    const y = (p.y || 4) + 1.6 + bob;
    // Крупная парящая стрелка вниз
    m4.compose(mat, p.x, y, p.z, Math.PI, this.t * 2.0, 0, 0.85, 1.7, 0.85);
    rd.push(G.cone, mat, [1.0, 0.85, 0.2, 0.95]);
    m4.compose(mat, p.x, y + 1.5, p.z, 0, this.t * 2.0, 0, 0.34, 1.0, 0.34);
    rd.push(G.box, mat, [1.0, 0.9, 0.3, 0.95]);
    // Круг на земле
    m4.compose(mat, p.x, 0.14, p.z, 0, 0, 0, 2.0 + Math.sin(this.t * 3) * 0.12, 1, 2.0 + Math.sin(this.t * 3) * 0.12);
    rd.push(G.ring, mat, [1.0, 0.9, 0.3, 0.9]);
  }
}
