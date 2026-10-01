const { Sim, loadLevel, cloneSim } = require('./boxel');

// hist: [{t, jump, left, right, rope, release}]
function applyAt(m, s) { const h = m.get(s.tick); return h ? { jump: !!h.jump, left: h.left, right: h.right, rope: h.rope, release: h.release } : {}; }

function simulate(level, hist, maxTicks, snapEvery = 0) {
  const s = new Sim(level); const m = new Map(hist.map(h => [h.t, h])); const snaps = [];
  while (s.tick < maxTicks && !s.finished && !s.dead) {
    if (snapEvery && s.tick % snapEvery === 0) snaps[s.tick] = cloneSim(s);
    s.step(applyAt(m, s));
  }
  return { ticks: s.finished ? s.finishTick + 1 : Infinity, snaps, sim: s };
}
function simulateFrom(snap, hist, maxTicks) {
  const s = cloneSim(snap); const m = new Map(hist.map(h => [h.t, h]));
  while (s.tick < maxTicks && !s.finished && !s.dead) s.step(applyAt(m, s));
  return s.finished ? s.finishTick + 1 : Infinity;
}

function refine(level, hist, { timeLimitMs = 30000, log = false, seed = 7 } = {}) {
  let rnd = (() => { let a = seed; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
  hist = hist.map(h => ({ ...h })).sort((a, b) => a.t - b.t);
  let base = simulate(level, hist, 5000, 1); let best = base.ticks;
  if (!isFinite(best)) return { ticks: best, hist };
  const t0 = Date.now(); let improved = true, rounds = 0;
  const tryCand = (cand, fromTick) => {
    cand.sort((a, b) => a.t - b.t);
    const ft = Math.max(0, Math.min(fromTick, best - 1));
    const snap = base.snaps[ft]; if (!snap) return Infinity;
    return simulateFrom(snap, cand, best + 1);
  };
  const accept = (cand, ticks) => {
    hist = cand; best = ticks; base = simulate(level, hist, 5000, 1);
    if (base.ticks !== best) { best = base.ticks; }
    improved = true; if (log) console.log('  refine ->', best, (best / 60).toFixed(3));
  };
  while (improved && Date.now() - t0 < timeLimitMs) {
    improved = false; rounds++;
    // 1) delete each action
    for (let i = hist.length - 1; i >= 0 && Date.now() - t0 < timeLimitMs; i--) {
      if (!hist[i].jump || hist[i].left !== undefined || hist[i].rope !== undefined) continue;
      const cand = hist.filter((_, j) => j !== i).map(h => ({ ...h }));
      const r = tryCand(cand, hist[i].t);
      if (r <= best) { if (r < best || cand.length < hist.length) { const imp = r < best; hist = cand; if (imp) accept(cand, r); else base = simulate(level, hist, 5000, 1); } }
    }
    // 2) shift each action
    for (let i = 0; i < hist.length && Date.now() - t0 < timeLimitMs; i++) {
      for (const d of [-1, 1, -2, 2, -3, 3, -5, 5, -8, 8]) {
        const nt = hist[i].t + d; if (nt < 0 || hist.some(h => h.t === nt)) continue;
        const cand = hist.map((h, j) => j === i ? { ...h, t: nt } : { ...h });
        const r = tryCand(cand, Math.min(nt, hist[i].t));
        if (r < best) { accept(cand, r); break; }
      }
    }
    // 3) random insertions of jumps
    for (let k = 0; k < 60 && Date.now() - t0 < timeLimitMs; k++) {
      const nt = Math.floor(rnd() * best); if (hist.some(h => h.t === nt)) continue;
      const cand = hist.map(h => ({ ...h })); cand.push({ t: nt, jump: true });
      const r = tryCand(cand, nt);
      if (r < best) accept(cand, r);
    }
  }
  return { ticks: best, hist };
}
module.exports = { refine, simulate };
