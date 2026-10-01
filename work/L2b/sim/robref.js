const { Sim, loadLevel } = require('./boxel'); const { perturbedSim, runOn } = require('./perturb');
const n = +process.argv[2]; let cur = JSON.parse(process.argv[3]); const T = +(process.argv[4] || 200000);
const L = loadLevel(n); const SEEDS = [1,2,3,4,5,6,7,8,9,10];
const cost = (j) => { let m = runOn(new Sim(L), j); if (typeof m !== 'number') return 1e9; for (const s of SEEDS) { const v = runOn(perturbedSim(L, s, 1 + (s % 3)), j); if (typeof v !== 'number') return 1e9; m = Math.max(m, v); } return m; };
let best = cost(cur); console.error('start', best); const t0 = Date.now(); let r = 12345; const rnd = () => (r = (r * 1664525 + 1013904223) >>> 0) / 4294967296;
let improved = true;
const tryC = (c) => { c = [...new Set(c)].filter(t => t >= 0).sort((a, b) => a - b); const v = cost(c); if (v < best || (v === best && c.length < cur.length)) { cur = c; best = v; improved = true; console.error(' ->', best, JSON.stringify(cur)); return true; } return false; };
while (Date.now() - t0 < T) {
  improved = false;
  for (let i = cur.length - 1; i >= 0; i--) tryC(cur.filter((_, k) => k !== i));
  for (let i = 0; i < cur.length && Date.now() - t0 < T; i++) for (const d of [-1, 1, -2, 2, -3, 3, -5, 5, -8, 8, -12, 12]) { const c = [...cur]; c[i] += d; if (tryC(c)) break; }
  for (let k = 0; k < 60 && Date.now() - t0 < T; k++) tryC([...cur, 1 + Math.floor(rnd() * Math.min(best, 600))]);
  if (!improved && Date.now() - t0 > T / 3) break;
}
// validate on 30 held-out perturbations
const val = []; for (let s = 100; s < 130; s++) val.push(runOn(perturbedSim(L, s, 1 + (s % 4)), cur));
console.log(JSON.stringify({ level: n, cost: best, jumps: cur, fresh: runOn(new Sim(L), cur), heldOut: val }));
