const { Sim, loadLevel, cloneSim, run } = require('./boxel');
const { buildGrid } = require('./search');

function cellKey(s, CS) {
  const b = s.player.body, g = s.engine.gravity, P = s.player;
  return [Math.floor(b.position.x / CS), Math.floor(b.position.y / CS),
    Math.round(b.velocity.x / 1.5), Math.round(b.velocity.y / 1.5),
    g.x, g.y, P.mode, P.scale.x, Math.round(P.force.x * 1e5), Math.round(P.force.y * 1e5), P.jumpReady ? 1 : 0, P.checkpoint ? 1 : 0].join(',');
}
function histList(h) { const out = []; while (h) { out.push(h.a); h = h.prev; } return out.reverse(); }

// returns rng
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function goExplore(level, { timeLimitMs = 60000, CS = 16, rollout = 50, pJump = 0.12, seed = 1, log = false, maxTicks = 3600, D = 150, stopAfterImproveMs = Infinity } = {}) {
  const rnd = mulberry(seed);
  const root = new Sim(level); root.hist = null;
  const grid = buildGrid(root);
  const archive = new Map();
  const add = (s) => {
    const k = cellKey(s, CS);
    const d = grid.at(s.player.body.position.x, s.player.body.position.y);
    const e = archive.get(k);
    if (!e || s.tick < e.tick) {
      archive.set(k, { sim: cloneSim(s), tick: s.tick, visits: e ? e.visits : 0, d, hist: s.hist });
      return true;
    }
    return false;
  };
  add(root);
  let best = null; const t0 = Date.now(); let iters = 0, lastImprove = Date.now();
  let minD = Infinity;
  while (Date.now() - t0 < timeLimitMs) {
    if (best && Date.now() - lastImprove > stopAfterImproveMs) break;
    iters++;
    // select
    const entries = [...archive.values()];
    if (iters % 50 === 1) { minD = Math.min(...entries.map(e => e.d)); }
    let tot = 0; const w = new Float64Array(entries.length);
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (best && e.tick >= best.ticks) { w[i] = 0; continue; }
      w[i] = Math.exp(-(e.d - minD) / D) / Math.sqrt(1 + e.visits) + 1e-6;
      tot += w[i];
    }
    if (tot <= 0) break;
    let r = rnd() * tot, idx = 0; for (; idx < w.length - 1; idx++) { r -= w[idx]; if (r <= 0) break; }
    const E = entries[idx]; E.visits++;
    const s = cloneSim(E.sim); s.hist = E.hist;
    // rollout with random actions
    let held = { left: 0, right: 0 };
    const pj = pJump * (0.3 + rnd() * 1.4);
    for (let k = 0; k < rollout; k++) {
      if (s.finished || s.dead || s.tick >= maxTicks) break;
      if (best && s.tick >= best.ticks) break;
      const P = s.player;
      const a = { jump: false };
      const canJ = (P.mode === 'jump' || P.mode === 'control') && (P.jumpReady || P.jumpMode === 'unlimited');
      if (canJ && rnd() < pj) a.jump = true;
      if (P.mode === 'control') {
        if (rnd() < 0.1) { const d = Math.floor(rnd() * 3) - 1; held = { left: d < 0 ? -1 : 0, right: d > 0 ? 1 : 0 }; }
        a.left = held.left; a.right = held.right;
      }
      const t = s.tick;
      const changed = a.jump || (P.mode === 'control' && (a.left !== P.controls.left || a.right !== P.controls.right));
      s.step(a);
      if (changed) s.hist = { a: { t, ...a }, prev: s.hist };
      if (s.finished) {
        const ticks = s.finishTick + 1;
        if (!best || ticks < best.ticks) {
          best = { ticks, hist: histList(s.hist), events: s.events.filter(e => e[1] !== 'jump') };
          lastImprove = Date.now();
          if (log) console.log('  finish', ticks, (ticks / 60).toFixed(3) + 's', 'iter', iters, 'cells', archive.size, ((Date.now() - t0) / 1000).toFixed(1) + 's');
        }
        break;
      }
      if (s.dead) break;
      add(s);
    }
    if (log && iters % 2000 === 0) console.log('  iter', iters, 'cells', archive.size, 'minD', minD.toFixed(0), 'best', best && best.ticks, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  return { best, cells: archive.size, iters, minD };
}

module.exports = { goExplore };

if (require.main === module) {
  const n = +process.argv[2], T = +(process.argv[3] || 60000);
  const r = goExplore(loadLevel(n), { timeLimitMs: T, log: true });
  console.log(JSON.stringify({ level: n, ticks: r.best && r.best.ticks, secs: r.best && (r.best.ticks / 60).toFixed(3), minD: r.minD, cells: r.cells }));
}
