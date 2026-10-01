const { Sim, loadLevel } = require('./boxel'); const { perturbedSim } = require('./perturb');
function run(s, j) { const J = new Set(j); while (!s.finished && !s.dead && s.tick < 3000) s.step({ jump: J.has(s.tick) }); return s.finished ? s.finishTick + 1 : s.dead; }
function alphaRob(n, j, alphas = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.99]) {
  const L = loadLevel(n); return alphas.map(a => run(new Sim(L, { alpha: a }), j)); }
function fullRob(n, j, count = 20) { const L = loadLevel(n); const out = []; for (let i = 0; i < count; i++) { const a = (i * 0.37) % 1; const s = perturbedSim(L, 700 + i, 1 + (i % 3)); s.alpha = a; out.push(run(s, j)); } return out; }
module.exports = { alphaRob, fullRob, run };
if (require.main === module) { const n = +process.argv[2]; const j = JSON.parse(process.argv[3]); console.log('alpha sweep:', alphaRob(n, j).join(' ')); console.log('perturbed+alpha:', fullRob(n, j).join(' ')); }
