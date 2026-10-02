// simulated annealing over jump list. node sa.js SEED SECONDS T0 [startJSON]
const { Sim, loadLevel } = require('./boxel');
const lv = loadLevel(6);
let sd = +(process.argv[2] || 1); const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
const SEC = +(process.argv[3] || 300), TEMP0 = +(process.argv[4] || 1.5);
let cur = JSON.parse(process.argv[5] || '[85,135,138,147,150,153,156,158,159,164,184]');
const MAXT = 250, FX = -88, FY = 40;
function evalJ(J) {
  const s = new Sim(lv); const set = new Set(J); let md = 1e9;
  while (s.tick < MAXT && !s.finished && !s.dead) { s.step({ jump: set.has(s.tick) }); const b = s.player.body; const d = Math.hypot(b.position.x - FX, b.position.y + FY); if (d < md) md = d; }
  if (s.finished) return s.finishTick + 1;
  return MAXT + md / 10;
}
let cc = evalJ(cur), best = cc, bj = cur.slice();
const t0 = Date.now(); let it = 0;
while (Date.now() - t0 < SEC * 1000) {
  it++;
  const T = TEMP0 * (1 - (Date.now() - t0) / (SEC * 1000)) + 0.05;
  let c = cur.slice(); const r = rnd();
  const k = Math.floor(rnd() * c.length);
  if (r < 0.45) c[k] += (rnd() < 0.5 ? -1 : 1) * (1 + Math.floor(rnd() * 2));
  else if (r < 0.6) c[k] += (rnd() < 0.5 ? -1 : 1) * (3 + Math.floor(rnd() * 8));
  else if (r < 0.75) { const k2 = Math.floor(rnd() * c.length); c[k] += (rnd() < 0.5 ? -1 : 1); c[k2] += (rnd() < 0.5 ? -1 : 1); }
  else if (r < 0.85) c.push(60 + Math.floor(rnd() * 180));
  else if (r < 0.95) c.splice(k, 1);
  else { c[k] += Math.round((rnd() - 0.5) * 40); }
  c = [...new Set(c.filter(x => x >= 1))].sort((a, b) => a - b);
  const v = evalJ(c);
  if (v <= cc || rnd() < Math.exp(-(v - cc) / T)) { cur = c; cc = v; if (v < best) { best = v; bj = c.slice(); console.log(it, best, JSON.stringify(bj)); } }
}
console.log('END', best, JSON.stringify(bj), 'iters', it);
