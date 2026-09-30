// Fix the route's jumps before tick T0, then run a wide time-scored beam from there.
const { Sim, loadLevel, cloneSim } = require('./boxel'); const { buildGrid } = require('./search');
const [n, T0, W, TMIN] = process.argv.slice(2).map(Number);
const L = loadLevel(n); const full = require('./b12.json')[String(n)];
const pre = full.filter(t => t < T0); const J = new Set(pre);
const root = new Sim(L); while (root.tick < T0) root.step({ jump: J.has(root.tick) });
const grid = buildGrid(new Sim(L));
const score = s => { const b = s.player.body; return grid.at(b.position.x, b.position.y) / Math.max(Math.hypot(b.velocity.x, b.velocity.y), TMIN); };
const key = s => { const b = s.player.body; return [Math.round(b.position.x), Math.round(b.position.y), Math.round(b.velocity.x * 4), Math.round(b.velocity.y * 4), Math.round((((b.angle % 1.5708) + 1.5708) % 1.5708) * 10), s.player.jumpReady ? 1 : 0].join(','); };
root.hist = null; let beam = [root]; let best = null;
for (let t = T0; t < T0 + 450; t++) {
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
console.log(JSON.stringify({ T0, W, TMIN, ...(best || { fail: true }) }));
