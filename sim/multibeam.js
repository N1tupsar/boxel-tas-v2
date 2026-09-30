// Beam search where each node = K sims with different render-timing alphas; all must survive.
const { Sim, loadLevel, cloneSim } = require('./boxel'); const { buildGrid } = require('./search');
const n = +process.argv[2], W = +process.argv[3], TMIN = +process.argv[4], T = +(process.argv[5] || 140000);
const ALPHAS = (process.env.ALPHAS || '0.05,0.5,0.95').split(',').map(Number);
const L = loadLevel(n); const grid = buildGrid(new Sim(L));
const WPS = JSON.parse(process.env.WPS || '[]').map(([x, y, r]) => ({ x, y: -y, r }));
const rem = WPS.map(() => 0); for (let i = WPS.length - 2; i >= 0; i--) rem[i] = rem[i + 1] + Math.hypot(WPS[i + 1].x - WPS[i].x, WPS[i + 1].y - WPS[i].y);
const lastF = WPS.length ? grid.at(WPS[WPS.length - 1].x, WPS[WPS.length - 1].y) : 0;
const sc = (s, k) => { const b = s.player.body, p = b.position; const v = Math.max(Math.hypot(b.velocity.x, b.velocity.y), TMIN);
  let pen = 0; if (process.env.ORIENT && s.player.scale.y === 64) { const m = ((b.angle % Math.PI) + Math.PI) % Math.PI; pen = 60 * Math.abs(m - Math.PI / 2); }
  if (k >= WPS.length) return grid.at(p.x, p.y) / v + pen; return (Math.hypot(p.x - WPS[k].x, p.y - WPS[k].y) + rem[k] + lastF) / v + pen; };
const key = s => { const b = s.player.body; return [Math.round(b.position.x), Math.round(b.position.y), Math.round(b.velocity.x * 4), Math.round(b.velocity.y * 4), Math.round((((b.angle % 1.5708) + 1.5708) % 1.5708) * 10), s.player.jumpReady ? 1 : 0, s.player.scale.x, s.player.scale.y].join(','); };
const { perturbedSim } = require('./perturb');
const initSims = process.env.PERT ? [new Sim(L), ...process.env.PERT.split(',').map(Number).map(sd => perturbedSim(L, sd, 1 + (sd % 3)))] : ALPHAS.map(a => new Sim(L, { alpha: a }));
let startT = 0, preHist = null;
if (process.env.T0) { startT = +process.env.T0; const pre = require('./best.json')[String(n)].filter(t => t < startT); const PJ = new Set(pre);
  for (const s of initSims) while (s.tick < startT) s.step({ jump: PJ.has(s.tick) });
  for (const t of pre) preHist = { t, prev: preHist }; }
let beam = [{ sims: initSims, hist: preHist, wp: 0 }]; const t0 = Date.now();
for (let t = startT; t < 1500; t++) {
  const kids = new Map();
  for (const node of beam) {
    const canJ = t >= 1 && node.sims.every(s => s.player.jumpReady && !s.finished && !s.dead);
    const acts = canJ ? [true, false] : [false];
    for (let k = 0; k < acts.length; k++) {
      const sims = k === acts.length - 1 ? node.sims : node.sims.map(cloneSim);
      let dead = false, fin = 0;
      for (const s of sims) { s.step({ jump: acts[k] }); if (s.dead) dead = true; if (s.finished) fin++; }
      if (dead) continue;
      const hist = acts[k] ? { t, prev: node.hist } : node.hist;
      let wp = node.wp; while (wp < WPS.length && sims.every(s => Math.hypot(s.player.body.position.x - WPS[wp].x, s.player.body.position.y - WPS[wp].y) < WPS[wp].r)) wp++;
      if (fin === sims.length) { const js = []; let h = hist; while (h) { js.push(h.t); h = h.prev; } console.log(JSON.stringify({ level: n, W, TMIN, alphas: ALPHAS, ticks: Math.max(...sims.map(s => s.finishTick + 1)), jumps: js.reverse() })); process.exit(0); }
      const mid = sims[Math.floor(sims.length / 2)].player.body; let spread = 0;
      for (const s of sims) { const b = s.player.body; if (s.finished) continue; const da = Math.abs(((b.angle - mid.angle) % 1.5708 + 1.5708 + 0.7854) % 1.5708 - 0.7854);
        spread = Math.max(spread, Math.hypot(b.position.x - mid.position.x, b.position.y - mid.position.y) + 40 * da + 2 * Math.hypot(b.velocity.x - mid.velocity.x, b.velocity.y - mid.velocity.y)); }
      const score = Math.max(...sims.map(x => x.finished ? 0 : sc(x, wp))) + spread * (+process.env.LAMBDA || 0.3); const kk = key(sims[1] || sims[0]); const p = kids.get(kk + '|' + wp);
      if (!p || p.score > score) kids.set(kk + '|' + wp, { sims, hist, score, wp });
    }
  }
  beam = [...kids.values()].sort((a, b) => a.score - b.score).slice(0, W);
  if (process.env.DBG && t % 20 === 0 && beam.length) { const top = beam.slice(0, 3).map(nd => nd.sims.map(s => { const b = s.player.body; return `(${b.position.x.toFixed(0)},${(-b.position.y).toFixed(0)} ${s.player.scale.x}x${s.player.scale.y} ang${(b.angle % 6.283).toFixed(2)} w${b.angularVelocity.toFixed(3)})`; }).join('|')); console.error('t', t, 'n', beam.length, top[0]); }
  if (!beam.length) { console.log(JSON.stringify({ level: n, fail: 'all dead', t })); process.exit(0); }
  if (Date.now() - t0 > T) { console.log(JSON.stringify({ level: n, fail: 'timeout', t })); process.exit(0); }
}
