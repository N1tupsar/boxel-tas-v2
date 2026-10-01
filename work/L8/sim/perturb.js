const Matter = require('matter-js'); const { Body } = Matter;
const { Sim, loadLevel } = require('./boxel');
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// Emulate the game's retryLevel -> resetToOrigin on every object, `retries` times,
// with the player ending each "previous run" at a random position/angle.
function perturbedSim(level, seed, retries = 1) {
  const s = new Sim(level); const r = rng(seed);
  const origin = s.objects.map(o => ({ p: { ...o.position }, rot: o.rotZ, sc: { ...o.scale } }));
  for (let k = 0; k < retries; k++) {
    const P = s.player.body;
    Body.setPosition(P, { x: P.position.x + (r() * 2000 - 1000), y: P.position.y + (r() * 600 - 300) });
    Body.setAngle(P, (r() * 2 - 1) * 60);
    s.objects.forEach((o, i) => {
      o.setPosition(origin[i].p); o.setRotation(origin[i].rot); o.setScale(origin[i].sc);
      if (!o.body.isStatic) { Body.setVelocity(o.body, { x: 0, y: 0 }); Body.setAngularVelocity(o.body, 0); }
    });
  }
  return s;
}
function runOn(s, jumps, max = 3000) { const J = new Set(jumps); while (s.tick < max && !s.finished && !s.dead) s.step({ jump: J.has(s.tick) }); return s.finished ? s.finishTick + 1 : (s.dead || 'timeout'); }
function robustness(level, jumps, seeds = 12) { const out = []; for (let i = 1; i <= seeds; i++) out.push(runOn(perturbedSim(level, i, 1 + (i % 3)), jumps)); return out; }
module.exports = { perturbedSim, runOn, robustness };
if (require.main === module) {
  const best = require('./best.json');
  for (const n of Object.keys(best)) { const res = robustness(loadLevel(+n), best[n]); console.log('L' + n, 'fresh', runOn(new Sim(loadLevel(+n)), best[n]), 'perturbed', res.join(' ')); }
  console.log('L2 old', robustness(loadLevel(2), [44, 90, 224]).join(' '));
}
