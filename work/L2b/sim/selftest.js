// Verifies the simulator reproduces known theory-mode routes exactly. Prints only OK/MISMATCH
// (no times or routes, so it doesn't bias the search).
const fs = require('fs'), path = require('path');
const { Sim, loadLevel } = require('./boxel');
const base = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'baselines', 'best_baseline.json')));
const H = [11, 71, 181, 283, 367, 421, 555, 707, 821, 947, 1063, 1129, 1291, 1409, 1511, 1667, 1733, 1811, 1999, 2083];
let sum = 0, n = 0;
for (const k of Object.keys(base)) { if (!base[k]) continue;
  const s = new Sim(loadLevel(+k), { alpha: 0.5, loadReset: true }); const J = new Set(base[k]);
  while (!s.finished && !s.dead && s.tick < 6000) s.step({ jump: J.has(s.tick) });
  sum += (s.finished ? s.finishTick + 1 : 99999) * H[n % H.length]; n++; }
console.log(sum === 5103347 ? `SELFTEST OK (${n} routes replayed exactly)` : 'SELFTEST MISMATCH - simulator differs, investigate before searching');
