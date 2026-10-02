const { Sim, loadLevel } = require('./boxel'); const { perturbedSim, runOn } = require('./perturb');
const n = +process.argv[2]; let cur = JSON.parse(process.argv[3]); const T = +(process.argv[4] || 200000);
const L = loadLevel(n); const SEEDS = [1,2,3,4,5,6,7,8,9,10,11];
const cost = (j) => { let fails = 0, m = 0; const f = runOn(new Sim(L), j); if (typeof f !== 'number') fails += 3; else m = f;
  for (const s of SEEDS) { const v = runOn(perturbedSim(L, s, 1 + (s % 3)), j); if (typeof v !== 'number') fails++; else m = Math.max(m, v); } return fails * 1000 + m; };
let best = cost(cur); console.error('start', best); const t0 = Date.now(); let r = 777; const rnd = () => (r = (r * 1664525 + 1013904223) >>> 0) / 4294967296;
const tryC = (c) => { c = [...new Set(c)].filter(t => t >= 1).sort((a, b) => a - b); const v = cost(c); if (v < best || (v === best && c.length < cur.length)) { const imp = v < best; cur = c; best = v; if (imp) console.error(' ->', best, JSON.stringify(cur)); return true; } return false; };
while (Date.now() - t0 < T) {
  for (let i = 0; i < cur.length && Date.now() - t0 < T; i++) for (const d of [-1, 1, -2, 2, -3, 3]) { const c = [...cur]; c[i] += d; if (tryC(c)) break; }
  for (let i = cur.length - 1; i >= 0 && Date.now() - t0 < T; i--) tryC(cur.filter((_, k) => k !== i));
  for (let k = 0; k < 40 && Date.now() - t0 < T; k++) tryC([...cur, 1 + Math.floor(rnd() * Math.min(best % 1000 || 400, 600))]);
}
const val = []; for (let s = 100; s < 130; s++) val.push(runOn(perturbedSim(L, s, 1 + (s % 4)), cur));
console.log(JSON.stringify({ level: n, cost: best, jumps: cur, heldOut: val }));
