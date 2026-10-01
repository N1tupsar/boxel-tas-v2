const { Sim, loadLevel, cloneSim } = require('./boxel');
const { buildGrid } = require('./search');

// Waypoints in GAME coords (y up). Converted to Matter coords (y down).
const WAYPOINTS_OLD = {
  6: [[568, -110], [1150, -70, 22], [1300, -70, 22], [1640, -50], [1655, 150], [1450, 215], [900, 215], [300, 215], [0, 215], [-88, 60]],
  26: [[1136, 140, 40], [48, 332, 45], [1136, 522, 45], [1076, 720, 40], [1076, 1000, 40]],
  13: [[-16, -40, 45], [-150, 130, 45], [-207, 66, 22]],
  9: [[1320, 40], [1376, 20], [1400, 140], [1200, 120], [700, 100], [300, 85]],
};
// Old hard-coded waypoints (levels 6,9,13,26) forced routes; disabled by default. Set USE_OLD_WP=1 to enable.
const WAYPOINTS = process.env.USE_OLD_WP === '1' ? WAYPOINTS_OLD : {};
const WR = 40;

function makeScorer(level, n, root, LA = 0) {
  const grid = buildGrid(root);
  const wps = (WAYPOINTS[n] || []).map(([x, y, r]) => ({ x, y: -y, r: r || WR }));
  // remaining polyline length after each waypoint (to last waypoint), finish via grid
  const rem = new Array(wps.length).fill(0);
  for (let i = wps.length - 2; i >= 0; i--) rem[i] = rem[i + 1] + Math.hypot(wps[i + 1].x - wps[i].x, wps[i + 1].y - wps[i].y);
  const lastToFinish = wps.length ? grid.at(wps[wps.length - 1].x, wps[wps.length - 1].y) : 0;
  return (s) => {
    const b = s.player.body; const p0 = b.position;
    let k0 = s.wp || 0;
    while (k0 < wps.length && Math.hypot(p0.x - wps[k0].x, p0.y - wps[k0].y) < wps[k0].r) k0++;
    s.wp = k0;
    const p = { x: p0.x + b.velocity.x * LA, y: p0.y + b.velocity.y * LA };
    const k = k0;
    if (k >= wps.length) { const d = grid.at(p.x, p.y); return process.env.TIME ? d / Math.max(Math.hypot(b.velocity.x, b.velocity.y), +process.env.TIME) : d; }
    return Math.hypot(p.x - wps[k].x, p.y - wps[k].y) + rem[k] + lastToFinish;
  };
}

function keyOf(s) {
  const b = s.player.body;
  const ang = ((b.angle % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  return [s.wp || 0, Math.round(b.position.x), Math.round(b.position.y), Math.round(b.velocity.x * 4), Math.round(b.velocity.y * 4),
    Math.round(ang * 10), Math.round(b.angularVelocity * 50), s.player.jumpReady ? 1 : 0,
    Math.round(s.player.force.x * 1e5), Math.round(s.player.force.y * 1e5)].join(',');
}

function histList(h) { const out = []; while (h) { out.push(h.t); h = h.prev; } return out.reverse(); }

function beam(level, n, { W = 300, maxTicks = 1500, timeLimitMs = 120000, log = false, dumpWp = null, LA = 0 } = {}) {
  const root = new Sim(level); root.hist = null; root.wp = 0;
  const score = makeScorer(level, n, root, LA);
  let beamS = [root]; const t0 = Date.now(); let best = null;
  for (let t = 0; t < maxTicks; t++) {
    const kids = new Map();
    for (const s of beamS) {
      const P = s.player;
      const canJ = t >= 0 && P.mode === 'jump' && P.jumpReady;
      const acts = canJ ? [true, false] : [false];
      for (let k = 0; k < acts.length; k++) {
        const c = k === acts.length - 1 ? s : cloneSim(s);
        c.wp = s.wp;
        c.step({ jump: acts[k] });
        c.hist = acts[k] ? { t, prev: s.hist } : s.hist;
        if (c.finished) { best = { ticks: c.finishTick + 1, jumps: histList(c.hist) }; return best; }
        if (c.dead) continue;
        c.score = score(c);
        const key = keyOf(c); const pr = kids.get(key);
        if (!pr || pr.score > c.score) kids.set(key, c);
      }
    }
    beamS = [...kids.values()].sort((a, b) => a.score - b.score).slice(0, W);
    if (!beamS.length) return { fail: 'all dead', t };
    if (dumpWp !== null && beamS[0].wp >= dumpWp) return { dump: t, jumps: histList(beamS[0].hist) };
    if (log && t % 60 === 0) console.log(' t', t, 'best', beamS[0].score.toFixed(0), 'wp', beamS[0].wp, 'pos', beamS[0].player.body.position.x.toFixed(0), (-beamS[0].player.body.position.y).toFixed(0), 'v', beamS[0].player.body.velocity.x.toFixed(2), (-beamS[0].player.body.velocity.y).toFixed(2), ((Date.now() - t0) / 1000).toFixed(0) + 's');
    if (Date.now() - t0 > timeLimitMs) return { fail: 'timeout', t };
  }
  return { fail: 'maxTicks' };
}

// ---- exact replay & robustness ----
function replay(level, jumps, shift = 0, maxTicks = 3000) {
  const s = new Sim(level); const J = new Set(jumps.map(t => t + shift));
  while (s.tick < maxTicks && !s.finished && !s.dead) s.step({ jump: J.has(s.tick) });
  return s.finished ? s.finishTick + 1 : Infinity;
}
// cost under both possible hook timings
function robustCost(level, jumps, cap = 3000) {
  const a = replay(level, jumps, 0, cap); if (!isFinite(a)) return { a, b: Infinity, cost: Infinity };
  const b = replay(level, jumps, -1, cap);
  return { a, b, cost: Math.max(a, b) };
}

function refine(level, jumps, { timeLimitMs = 30000, robust = true, seed = 3, log = false } = {}) {
  let rnd = (() => { let a = seed; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
  const cost = (j) => robust ? robustCost(level, j).cost : replay(level, j);
  let cur = [...jumps].sort((a, b) => a - b); let best = cost(cur);
  const t0 = Date.now(); let improved = true;
  const tryC = (c) => { c = [...new Set(c)].filter(t => t >= 0).sort((a, b) => a - b); const v = cost(c); if (v < best || (v === best && c.length < cur.length)) { cur = c; best = v; improved = true; if (log) console.log('  ->', best); return true; } return false; };
  while (improved && Date.now() - t0 < timeLimitMs) {
    improved = false;
    for (let i = cur.length - 1; i >= 0; i--) tryC(cur.filter((_, j) => j !== i));
    for (let i = 0; i < cur.length && Date.now() - t0 < timeLimitMs; i++)
      for (const d of [-1, 1, -2, 2, -3, 3, -4, 4, -6, 6, -9, 9]) { const c = [...cur]; c[i] += d; if (tryC(c)) break; }
    for (let k = 0; k < 40 && Date.now() - t0 < timeLimitMs; k++) {
      const lim = isFinite(best) ? best : 600;
      const c = [...cur, 1 + Math.floor(rnd() * lim)]; tryC(c);
    }
  }
  return { jumps: cur, cost: best };
}

module.exports = { beam, replay, robustCost, refine, WAYPOINTS };

if (require.main === module) {
  const n = +process.argv[2], W = +(process.argv[3] || 300), T = +(process.argv[4] || 120000);
  const lvl = loadLevel(n);
  const LA = +(process.env.LA || 0);
  const r = beam(lvl, n, { W, timeLimitMs: T, log: !!process.env.LOG, LA });
  r.LA = LA;
  console.log(JSON.stringify({ level: n, W, ...r }));
}
