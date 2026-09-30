const { loadLevel, Sim } = require('./boxel'); const { goExplore } = require('./explore2'); const { replay } = require('./search2'); const fs = require('fs');
const [n, seed, T] = process.argv.slice(2).map(Number);
const r = goExplore(loadLevel(n), { timeLimitMs: T, seed, stopAfterImproveMs: T * 0.6, maxTicks: 2000 });
if (!r.best) { console.log('none'); process.exit(0); }
const j = r.best.hist.filter(h => h.jump).map(h => h.t); const v = replay(loadLevel(n), j);
fs.appendFileSync(`l${n}_found.jsonl`, JSON.stringify({ seed, ticks: r.best.ticks, verified: v, jumps: j }) + '\n');
console.log('FOUND', r.best.ticks, 'verified', v, JSON.stringify(j));
const J = new Set(j); const s = new Sim(loadLevel(n)); while (!s.finished && !s.dead) { s.step({ jump: J.has(s.tick) }); const b = s.player.body; if (s.tick % 20 == 0) console.log(s.tick, b.position.x.toFixed(0), (-b.position.y).toFixed(0), b.velocity.x.toFixed(1), (-b.velocity.y).toFixed(1), s.events.filter(e => e[1] !== 'jump' && e[0] > s.tick - 20).map(e => e[1]).join(',')); }
