const fs = require('fs');
const { loadLevel, Sim } = require('./boxel'); const { goExplore } = require('./explore'); const { refBeam, trajectory } = require('./refbeam');
const { perturbedSim, runOn } = require('./perturb');
const n = +process.argv[2], seed = +process.argv[3], T = +process.argv[4];
const L = loadLevel(n); const best0 = trajectory(L, require('./best.json')[String(n)]).N;
const robust = (j, t) => { const MR = +(process.env.MINRATE || 1); let ok = runOn(new Sim(L), j) === t ? 1 : 0; for (let s = 1; s <= 12; s++) if (runOn(perturbedSim(L, s, 1 + (s % 3)), j) === t) ok++; return ok / 13 >= MR; };
const g = goExplore(L, { timeLimitMs: T, seed, stopAfterImproveMs: T / 2 });
if (!g.best) { console.log(`L${n} seed${seed}: GE found nothing`); process.exit(0); }
let jumps = g.best.hist.filter(h => h.jump).map(h => h.t); let cur = trajectory(L, jumps).N;
let line = `L${n} seed${seed}: GE ${cur} (best ${best0})`;
if (cur < best0 * (+process.env.THR || 1.3)) {
  for (const cfg of [{ D: 90, VS: 5, VW: 2 }, { D: 60, VS: 3, VW: 1 }, { D: 150, VS: 8, VW: 3 }, { D: 90, VS: 5, VW: 0 }]) {
    const r = refBeam(L, jumps, { W: 400, ...cfg, timeLimitMs: 120000 });
    if (r.ticks && r.ticks < cur) { cur = r.ticks; jumps = r.jumps; }
  }
  line += ` -> refined ${cur}`;
  if (cur < best0) {
    if (robust(jumps, cur)) { const b = JSON.parse(fs.readFileSync('best.json')); b[String(n)] = jumps; fs.writeFileSync('best.json', JSON.stringify(b)); line += ' ROBUST NEW BEST'; }
    else { line += ' (fragile) ' + JSON.stringify(jumps); fs.appendFileSync('fragile.jsonl', JSON.stringify({ level: n, ticks: cur, jumps }) + '\n'); }
  }
}
console.log(line);
