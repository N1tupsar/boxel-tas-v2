// first-jump sweep: for each t0 in [lo,hi], fix jump at t0, beam the rest. usage: node sweep.js N W TMIN lo hi [step]
const { Sim, loadLevel, cloneSim } = require('./boxel'); const { buildGrid } = require('./search');
const [n, W, TMIN, lo, hi, step = 1] = process.argv.slice(2).map(Number);
const L = loadLevel(n); const grid = buildGrid(new Sim(L));
const score = s => { const b = s.player.body; return grid.at(b.position.x, b.position.y) / Math.max(Math.hypot(b.velocity.x, b.velocity.y), TMIN); };
const key = s => { const b = s.player.body; return [Math.round(b.position.x), Math.round(b.position.y), Math.round(b.velocity.x * 4), Math.round(b.velocity.y * 4), Math.round((((b.angle % 1.5708) + 1.5708) % 1.5708) * 10), Math.round(b.angularVelocity * 50), s.player.jumpReady ? 1 : 0].join(','); };
function run(pre) {
  const T0 = (pre.length ? pre[pre.length - 1] + 1 : 0); const J = new Set(pre);
  const root = new Sim(L); while (root.tick < T0) root.step({ jump: J.has(root.tick) });
  root.hist = null; let beam = [root]; let best = null;
  for (let t = T0; t < T0 + 330 && !best; t++) {
    const kids = new Map();
    for (const s of beam) {
      const acts = s.player.jumpReady ? [true, false] : [false];
      for (let k = 0; k < acts.length; k++) {
        const c = k === acts.length - 1 ? s : cloneSim(s); c.step({ jump: acts[k] }); c.hist = acts[k] ? { t, prev: s.hist } : s.hist;
        if (c.finished) { const js = []; let h = c.hist; while (h) { js.push(h.t); h = h.prev; } best = { ticks: c.finishTick + 1, jumps: [...pre, ...js.reverse()] }; break; }
        if (c.dead) continue; c.score = score(c); const kk = key(c); const p = kids.get(kk); if (!p || p.score > c.score) kids.set(kk, c);
      }
      if (best) break;
    }
    if (best) break;
    beam = [...kids.values()].sort((a, b) => a.score - b.score).slice(0, W); if (!beam.length) break;
  }
  return best;
}
for (let t0 = lo; t0 <= hi; t0 += step) { const r = run([t0]); console.log(JSON.stringify({ t0, W, TMIN, ticks: r && r.ticks, jumps: r && r.jumps })); }
