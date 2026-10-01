const { loadLevel, Sim } = require('./boxel'); const { perturbedSim, runOn } = require('./perturb');
function rate(n, j, N = 60, start = 3000) { const L = loadLevel(n); const c = {}; let ok = 0, best = Infinity;
  for (let i = 0; i < N; i++) { const s = perturbedSim(L, start + i, 1 + (i % 3)); s.alpha = (i * 0.618) % 1; const r = runOn(s, j); c[r] = (c[r] || 0) + 1; if (typeof r === 'number') { ok++; best = Math.min(best, r); } }
  return { fresh: runOn(new Sim(L), j), success: `${ok}/${N}`, pct: Math.round(100 * ok / N), outcomes: c }; }
module.exports = { rate };
if (require.main === module) console.log(JSON.stringify(rate(+process.argv[2], JSON.parse(process.argv[3]))));
