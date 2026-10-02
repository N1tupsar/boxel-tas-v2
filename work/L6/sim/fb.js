// fast beam: node fb.js W MAXT ; env ALPHA BETA GAMMA NOISE SEED PREJ T0 KQ
const { Sim, loadLevel } = require('./boxel');
const { mkFast } = require('./fast');
const W = +process.argv[2] || 1000, MAXT = +process.argv[3] || 300;
const A = +(process.env.ALPHA || 0), B = +(process.env.BETA || 0), G = +(process.env.GAMMA || 1), NOISE = +(process.env.NOISE || 0);
const YW = +(process.env.YW || 0);
let sd = +(process.env.SEED || 1); const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
const g = 0.001 * (1000 / 60) ** 2;
const S = new Sim(loadLevel(6)); const F = mkFast(S); const P = S.player, b = P.body;
const PREJ = process.env.PREJ ? new Set(JSON.parse(process.env.PREJ)) : new Set(); const T0 = +(process.env.T0 || 0);
const KQ = +(process.env.KQ || 3);
function hl(h) { const o = []; while (h) { o.push(h.t); h = h.prev; } return o.reverse(); }
function score() {
  const v2 = b.velocity.x ** 2 + b.velocity.y ** 2;
  const Hh = -b.position.y + G * v2 / (2 * g);
  return -Hh + A * b.position.x + B * b.velocity.x - YW * (-b.position.y) + (NOISE ? NOISE * (rnd() - 0.5) : 0);
}
let t = 0;
for (; t < T0; t++) S.step({ jump: PREJ.has(t) });
let beam = [{ snap: F.save(), hist: null, score: 0 }];
if (T0) { let h = null; for (const j of PREJ) if (j < T0) h = { t: j, prev: h }; beam[0].hist = h; }
let best = null;
for (; t < MAXT; t++) {
  const kids = new Map();
  for (const st of beam) {
    F.load(st.snap);
    const canJ = t >= 1 && P.mode === 'jump' && P.jumpReady;
    for (let k = 0; k < (canJ ? 2 : 1); k++) {
      if (k) F.load(st.snap);
      const j = canJ && k === 1;
      S.step({ jump: j });
      if (S.dead) continue;
      if (S.finished) { const r = { ticks: S.finishTick + 1, jumps: hl(j ? { t, prev: st.hist } : st.hist) }; if (!best || r.ticks < best.ticks) best = r; continue; }
      const sc = score();
      const key = [Math.round(b.position.x / KQ), Math.round(b.position.y / KQ), Math.round(b.velocity.x), Math.round(b.velocity.y), P.jumpReady ? 1 : 0].join();
      const pr = kids.get(key);
      if (!pr || pr.score > sc) kids.set(key, { score: sc, snap: F.save(), hist: j ? { t, prev: st.hist } : st.hist });
    }
  }
  if (best) break;
  beam = [...kids.values()].sort((a, b) => a.score - b.score).slice(0, W);
  if (process.env.LOG && t % 20 == 0) console.log(t, beam.length, kids.size, beam[0] && beam[0].score.toFixed(1));
  if (!beam.length) break;
}
console.log(best ? 'FINISH ' + best.ticks + ' ' + JSON.stringify(best.jumps) : 'none');
