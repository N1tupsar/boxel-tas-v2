const _ = require('lodash');
const { Sim, loadLevel } = require('./boxel');
const BF = ['speed','angularSpeed','angle','anglePrev','angularVelocity','torque','motion','totalContacts','isSleeping','sleepCounter'];
const VF = ['position','positionPrev','velocity','force','positionImpulse','constraintImpulse'];
function mkFast(sim) {
  const b = sim.player.body, P = sim.player, E = sim.engine;
  const live = new Map(); // body objects to share
  const share = (v) => { if (!v || typeof v !== 'object') return undefined; if (v.type === 'body') return v; if (typeof v.index === 'number' && v.body && v.body.type === 'body' && 'isInternal' in v) return v.body.vertices[v.index]; return undefined; };
  function save() {
    const s = { b: {}, v: {}, vert: b.vertices.map(p => [p.x, p.y]), axes: b.axes.map(p => [p.x, p.y]), bounds: [b.bounds.min.x, b.bounds.min.y, b.bounds.max.x, b.bounds.max.y],
      ts: E.timing.timestamp, tick: sim.tick, finished: sim.finished, dead: sim.dead, finishTick: sim.finishTick,
      jr: P.jumpReady, pf: { x: P.force.x, y: P.force.y }, mode: P.mode, wp: sim.wp, gx: E.gravity.x, gy: E.gravity.y,
      evl: sim.events.length, cat: b.collisionFilter.category };
    for (const k of BF) s.b[k] = b[k];
    for (const k of VF) s.v[k] = [b[k].x, b[k].y, b[k].angle];
    s.parts = b.parts.slice(1).map(p => ({ pos: [p.position.x, p.position.y], pp: [p.positionPrev.x, p.positionPrev.y], ang: p.angle, ap: p.anglePrev, vert: p.vertices.map(q => [q.x, q.y]), axes: p.axes.map(q => [q.x, q.y]), bounds: [p.bounds.min.x, p.bounds.min.y, p.bounds.max.x, p.bounds.max.y] }));
    s.pairs = _.cloneDeepWith(E.pairs, (v, key) => { const r = share(v); return r; });
    return s;
  }
  function load(s) {
    for (const k of BF) b[k] = s.b[k];
    for (const k of VF) { b[k] = s.v[k][2] === undefined ? { x: s.v[k][0], y: s.v[k][1] } : { x: s.v[k][0], y: s.v[k][1], angle: s.v[k][2] }; }
    for (let i = 0; i < b.vertices.length; i++) { b.vertices[i].x = s.vert[i][0]; b.vertices[i].y = s.vert[i][1]; }
    for (let i = 0; i < b.axes.length; i++) { b.axes[i].x = s.axes[i][0]; b.axes[i].y = s.axes[i][1]; }
    b.bounds.min.x = s.bounds[0]; b.bounds.min.y = s.bounds[1]; b.bounds.max.x = s.bounds[2]; b.bounds.max.y = s.bounds[3];
    b.parts.slice(1).forEach((p, i) => { const q = s.parts[i]; p.position = { x: q.pos[0], y: q.pos[1] }; p.positionPrev = { x: q.pp[0], y: q.pp[1] }; p.angle = q.ang; p.anglePrev = q.ap;
      p.vertices.forEach((v, j) => { v.x = q.vert[j][0]; v.y = q.vert[j][1]; }); p.axes.forEach((v, j) => { v.x = q.axes[j][0]; v.y = q.axes[j][1]; });
      p.bounds.min.x = q.bounds[0]; p.bounds.min.y = q.bounds[1]; p.bounds.max.x = q.bounds[2]; p.bounds.max.y = q.bounds[3]; });
    E.timing.timestamp = s.ts;
    sim.tick = s.tick; sim.finished = s.finished; sim.dead = s.dead; sim.finishTick = s.finishTick;
    P.jumpReady = s.jr; P.force = { x: s.pf.x, y: s.pf.y }; P.mode = s.mode; sim.wp = s.wp; E.gravity.x = s.gx; E.gravity.y = s.gy;
    sim.events.length = s.evl; b.collisionFilter.category = s.cat;
    if (sim.dead) { /* collisionFilter category was zeroed */ }
    const np = _.cloneDeepWith(s.pairs, (v) => share(v)); for (const k in np) E.pairs[k] = np[k];
    // body.position etc may be shared objects with parts[0]; fine (single part)
    b.position = b.position; 
  }
  return { save, load };
}
module.exports = { mkFast };
if (require.main === module) {
  // validation
  const lv = loadLevel(6);
  const ref = new Sim(lv), t = new Sim(lv); const F = mkFast(t);
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const snaps = []; let bad = 0;
  for (let k = 0; k < 400; k++) {
    const j = rnd() < 0.04;
    ref.step({ jump: j }); t.step({ jump: j });
    if (k % 10 === 0) snaps.push([k, F.save(), t.player.body.position.x]);
    // random detour: run random steps then restore
    if (k % 25 === 5) { const s = F.save(); for (let q = 0; q < 30; q++) t.step({ jump: rnd() < 0.2 }); F.load(s); }
    const a = ref.player.body, c = t.player.body;
    if (Math.abs(a.position.x - c.position.x) > 1e-9 || Math.abs(a.position.y - c.position.y) > 1e-9 || Math.abs(a.velocity.x - c.velocity.x) > 1e-9) { bad++; if (bad < 4) console.log('DIFF at', k, a.position, c.position); }
  }
  console.log('bad', bad, 'final', ref.player.body.position, t.player.body.position, ref.tick, t.tick);
  // timing
  let t0 = Date.now(); const s = F.save(); for (let i = 0; i < 2000; i++) { F.load(s); t.step({}); F.save(); } console.log('us/iter', (Date.now() - t0) / 2000 * 1000);
}
