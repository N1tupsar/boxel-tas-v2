const fs = require('fs');
const { loadLevel, Sim } = require('./boxel'); const { refBeam, trajectory } = require('./refbeam');
const { perturbedSim, runOn } = require('./perturb');
const n = +process.argv[2], W = +(process.argv[3] || 400), iters = +(process.argv[4] || 6);
const L = loadLevel(n); let jumps = require('./best.json')[String(n)]; let best = trajectory(L, jumps).N;
const robust = (j, t) => { const MR = +(process.env.MINRATE || 1); let ok = runOn(new Sim(L), j) === t ? 1 : 0; for (let s = 1; s <= 12; s++) if (runOn(perturbedSim(L, s, 1 + (s % 3)), j) === t) ok++; return ok / 13 >= MR; };
const configs = [{ D: 90, VS: 5, VW: 2 }, { D: 150, VS: 8, VW: 3 }, { D: 90, VS: 5, VW: 0 }, { D: 60, VS: 3, VW: 1 }, { D: 200, VS: 10, VW: 1 }];
let stale = 0;
for (let it = 0; it < iters && stale < configs.length; it++) {
  const cfg = configs[it % configs.length];
  const r = refBeam(L, jumps, { W, ...cfg, timeLimitMs: 150000 });
  let msg = r.ticks || r.fail;
  if (r.ticks && r.ticks < best) {
    if (robust(r.jumps, r.ticks)) { best = r.ticks; jumps = r.jumps; stale = 0; msg += ' ROBUST-accepted';
      const b = JSON.parse(fs.readFileSync('best.json')); b[String(n)] = jumps; fs.writeFileSync('best.json', JSON.stringify(b)); }
    else { msg += ' fragile-rejected ' + JSON.stringify(r.jumps); stale++; fs.appendFileSync('fragile.jsonl', JSON.stringify({ level: n, ticks: r.ticks, jumps: r.jumps }) + '\n'); }
  } else stale++;
  console.log(`L${n} it${it} ${JSON.stringify(cfg)} -> ${msg} | best ${best}`);
}
