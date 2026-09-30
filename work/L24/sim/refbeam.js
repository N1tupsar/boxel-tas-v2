const { Sim, loadLevel, cloneSim } = require('./boxel');

function trajectory(level, jumps) {
  const s = new Sim(level); const J = new Set(jumps); const pts = [];
  while (s.tick < 4000 && !s.finished && !s.dead) {
    s.step({ jump: J.has(s.tick) });
    const b = s.player.body; pts.push([b.position.x, b.position.y, b.velocity.x, b.velocity.y]);
  }
  return { pts, N: s.finished ? s.finishTick + 1 : Infinity };
}

function keyOf(s) {
  const b = s.player.body;
  const ang = ((b.angle % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  return [Math.round(b.position.x), Math.round(b.position.y), Math.round(b.velocity.x * 4), Math.round(b.velocity.y * 4),
    Math.round(ang * 10), Math.round(b.angularVelocity * 50), s.player.jumpReady ? 1 : 0,
    Math.round(s.player.force.x * 1e5), Math.round(s.player.force.y * 1e5)].join(',');
}
function histList(h) { const out = []; while (h) { out.push(h.t); h = h.prev; } return out.reverse(); }

function refBeam(level, refJumps, { W = 800, D = 90, VS = 5, VW = 2, timeLimitMs = 120000, rnd = null } = {}) {
  const { pts, N } = trajectory(level, refJumps);
  const est = (s, t) => {
    const b = s.player.body; let best = Infinity;
    const lo = Math.max(0, t - D), hi = Math.min(pts.length - 1, t + D);
    for (let i = lo; i <= hi; i++) {
      const q = pts[i];
      const d = Math.hypot(b.position.x - q[0], b.position.y - q[1]) / VS + Math.hypot(b.velocity.x - q[2], b.velocity.y - q[3]) * VW;
      const v = (N - 1 - i) + d; if (v < best) best = v;
    }
    return best + (rnd ? rnd() * 1e-6 : 0);
  };
  const root = new Sim(level); root.hist = null;
  let beam = [root]; const t0 = Date.now();
  for (let t = 0; t < N + 5; t++) {
    const kids = new Map();
    for (const s of beam) {
      const canJ = t >= 1 && s.player.mode === 'jump' && s.player.jumpReady;
      const acts = canJ ? [true, false] : [false];
      for (let k = 0; k < acts.length; k++) {
        const c = k === acts.length - 1 ? s : cloneSim(s);
        c.step({ jump: acts[k] });
        c.hist = acts[k] ? { t, prev: s.hist } : s.hist;
        if (c.finished) return { ticks: c.finishTick + 1, jumps: histList(c.hist), ref: N };
        if (c.dead) continue;
        c.score = est(c, t);
        const key = keyOf(c); const pr = kids.get(key);
        if (!pr || pr.score > c.score) kids.set(key, c);
      }
    }
    beam = [...kids.values()].sort((a, b) => a.score - b.score).slice(0, W);
    if (!beam.length) return { fail: 'all dead', ref: N };
    if (Date.now() - t0 > timeLimitMs) return { fail: 'timeout', ref: N };
  }
  return { fail: 'no improvement', ref: N };
}

module.exports = { refBeam, trajectory };

if (require.main === module) {
  const n = +process.argv[2]; let jumps = JSON.parse(process.argv[3]);
  const W = +(process.argv[4] || 800), iters = +(process.argv[5] || 4);
  const lvl = loadLevel(n); let best = trajectory(lvl, jumps).N;
  const configs = [{ D: 90, VS: 5, VW: 2 }, { D: 60, VS: 3, VW: 1 }, { D: 150, VS: 8, VW: 3 }, { D: 90, VS: 5, VW: 0 }];
  let stale = 0;
  for (let it = 0; it < iters && stale < configs.length; it++) {
    const cfg = configs[it % configs.length];
    const r = refBeam(lvl, jumps, { W, ...cfg, timeLimitMs: 150000 });
    if (r.ticks && r.ticks < best) { best = r.ticks; jumps = r.jumps; stale = 0; } else stale++;
    console.error(`L${n} it${it} cfg${JSON.stringify(cfg)} -> ${r.ticks || r.fail} best ${best}`);
  }
  console.log(JSON.stringify({ level: n, ticks: best, jumps }));
}
