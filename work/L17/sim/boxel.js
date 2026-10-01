// Headless replica of Boxel 3D 2.9.3 gameplay physics (Matter.js 0.19.0)
// Ported from the game's bundled code (classes HT, yE (player), zT (collision), DA (app)).
const Matter = require('matter-js');
const { Engine, Body, Bodies, Vector, Composite } = Matter;
const fs = require('fs');

const DT = 1000 / 60;

function vecFromAngle(e = 0) {
  const n = Math.PI, t = 1e3, r = -e * (180 / n);
  return { x: Math.round(Math.cos((90 - r) * (n / 180)) * t) / t, y: Math.round(Math.sin((90 - r) * (n / 180)) * t) / t };
}

class Obj {
  constructor(cls, sim) {
    this.sim = sim;
    this.cls = cls;
    this.scale = { x: 1, y: 1, z: 1 };
    this.rotZ = 0;
    this.position = { x: 0, y: 0, z: 0 };
    this.visible = true;
    this.hitbox = Bodies.rectangle(0, 0, 1, 1, { class: 'hitbox' });
    this.body = Body.create({ parts: [this.hitbox], friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 0, slop: 0, timeScale: 1, class: 'cube', object3D: this });
    this.setPosition({ x: 0, y: 0, z: 0 });
    this.setRotation(0);
    this.force = { x: 0, y: 0 };
    this.mode = 'default';
    this.jumpMode = 'limited';
    const sensorFull = () => { this.body_sensor = Bodies.rectangle(0, 0, 1, 1, { isSensor: true, density: 0, class: 'sensor' }); Body.setParts(this.body, [this.hitbox, this.body_sensor]); };
    const sensorTop = () => { this.body_sensor = Bodies.rectangle(0, -0.6, 0.6, 0.2, { isSensor: true, density: 0, class: 'sensor' }); Body.setParts(this.body, [this.hitbox, this.body_sensor]); };
    this.body.class = cls;
    switch (cls) {
      case 'player': break;
      case 'tip': case 'gravity': this.hitbox.isSensor = true; this.hitbox.class = 'sensor'; break;
      case 'bounce': case 'spike': sensorTop(); break;
      case 'checkpoint': case 'shrink': case 'grow': case 'resize': case 'control': case 'power': case 'teleport':
        this.hitbox.isSensor = true; sensorFull(); break;
      case 'direction': case 'grapple': case 'finish': sensorFull(); break;
      case 'reset': this.hitbox.isSensor = true; sensorFull(); break;
      default: this.body.class = 'cube';
    }
    this.setScale({ x: 16, y: 16, z: 16 });
  }
  setPosition(e) { this.position = { ...e }; Body.setPosition(this.body, { x: e.x, y: -e.y }); }
  setRotation(z) { this.rotZ = z; Body.setAngle(this.body, -z); }
  setScale(e) {
    const n = this.rotZ; this.setRotation(0);
    Body.scale(this.body, e.x / this.scale.x, e.y / this.scale.y);
    this.scale = { x: +e.x, y: +e.y, z: +e.z }; this.setRotation(n);
  }
  setStatic(e = true) { Body.setStatic(this.body, e); }
  setForce(e, t, n = false) { // bounce reflection
    const b = this.body; let s = t.body.angle, c = Math.atan2(b.position.y - b.positionPrev.y, b.position.x - b.positionPrev.x);
    if (n) { s = b.angle; c = b.angle + Math.PI / 2; e *= -1 * (+process.env.ISPEED || 1); }
    const l = Math.cos(c), u = Math.sin(c), d = -Math.sin(s), f = Math.cos(s), p = l * d + u * f, m = l - 2 * p * d, h = u - 2 * p * f;
    if (p < 0 && (Math.abs(m) == 1 || Math.abs(h) == 1)) e *= -1;
    Body.setVelocity(b, { x: m * e, y: h * e });
  }
  hide() { this.visible = false; this.body.collisionFilter.category = 0; Matter.Sleeping.set(this.body, true); }
}

class Sim {
  constructor(level, opts = {}) {
    this.alpha = opts.alpha === undefined ? (process.env.ALPHA !== undefined ? +process.env.ALPHA : 0.5) : opts.alpha;
    this.engine = Engine.create();
    this.engine.gravity.x = 0; this.engine.gravity.y = 1;
    this.objects = [];
    this.tick = 0; this.finished = false; this.dead = false; this.finishTick = null;
    // NOTE: this block runs before objects exist (a no-op); keep it that way - in-game tests match a start without it.
    // Level-load state as snapshotted by the deterministic patch: import, then resetScene -> resetToOrigin on every object.
    if (opts.loadReset !== undefined ? opts.loadReset : process.env.LOADRESET !== '0') {  // theory mode default
      for (const o of this.objects) {
        o.setPosition({ ...o.position }); o.setRotation(o.rotZ); o.setScale({ ...o.scale });
        if (!o.body.isStatic) { Body.setVelocity(o.body, { x: 0, y: 0 }); Body.setAngularVelocity(o.body, 0); }
      }
    }
    this.events = [];
    const startReady = opts.startJump !== undefined ? opts.startJump : process.env.STARTJUMP !== '0';  // real game keeps jumpReady across restarts
    for (const r of level.children) {
      const o = new Obj(r.class, this);
      o.setPosition({ x: +r.position.x, y: +r.position.y, z: +r.position.z });
      o.setScale({ x: +r.scale.x, y: +r.scale.y, z: +r.scale.z });
      o.setRotation(+r.rotation.z);
      o.setStatic(r.class === 'player' ? r.isStatic : (r.isStatic === undefined ? true : r.isStatic));
      o.body.friction = parseFloat(r.friction === undefined ? 0.1 : r.friction);
      o.text = r.text;
      if (r.class === 'player') { this.player = o; o.mode = 'jump'; o.jumpReady = startReady; o.controls = { left: 0, right: 0, acceleration: .5, speed: 4 }; }
      if (+r.position.z === 0) Composite.add(this.engine.world, o.body);
      this.objects.push(o);
    }
    if (opts.snap !== undefined ? opts.snap : process.env.SNAP !== '0') {  // the patch's exact fresh-cube corner snap (after objects exist)
      const pb = this.player.body;
      if (Math.abs(pb.angle) < 1e-9) {
        const hw = this.player.scale.x / 2, hh = this.player.scale.y / 2, c = pb.position;
        for (const part of pb.parts) { for (const v of part.vertices) { v.x = (v.x < c.x ? -hw : hw) + c.x; v.y = (v.y < c.y ? -hh : hh) + c.y; } part.position.x = c.x; part.position.y = c.y; }
        Body.scale(pb, 1, 1);
      }
      Body.setVelocity(pb, { x: 0, y: 0 }); Body.setAngularVelocity(pb, 0);
    }
    if (opts.preTouch !== undefined ? opts.preTouch : process.env.PRETOUCH === '1') {  // "p0" start: restart while touching a sensor keeps that contact active
      const pb = this.player.body; this.preTouch = new Set();
      for (const o of this.objects) { if (o === this.player || !o.body || !o.body.parts.some(p => p.isSensor)) continue;
        const bb = o.body.bounds, pbb = pb.bounds;
        if (bb.min.x <= pbb.max.x && bb.max.x >= pbb.min.x && bb.min.y <= pbb.max.y && bb.max.y >= pbb.min.y) this.preTouch.add(o.body); }
    }
    this.finishObjs = this.objects.filter(o => o.cls === 'finish');
    Matter.Events.on(this.engine, 'collisionStart', ev => this.onCollision(ev));
  }
  log(m) { this.events.push([this.tick, m]); }
  onCollision(ev) {
    const P = this.player;
    for (const pair of (process.env.VAR === 'revpairs' ? [...ev.pairs].reverse() : ev.pairs)) {
      if (this.tick === 0 && this.preTouch && (this.preTouch.has(pair.bodyA.parent) || this.preTouch.has(pair.bodyB.parent))) continue;
      const parts = [pair.bodyA, pair.bodyB];
      for (let a0 = 0; a0 < 2; a0++) {
        const a = process.env.VAR === 'rev' ? 1 - a0 : a0; const o = parts[a], s = parts[(a + 1) % 2];
        const c = o.parent.object3D, l = s.parent.object3D;
        if (!c || !l) continue;
        if (c.body.class === 'player') P.jumpReady = true;
        if (s.class === 'sensor') continue;
        if (o.class !== 'sensor') continue;
        const k = c.body.class, isP = l.body.class === 'player';
        if (k === 'tip') { if (isP) c.hide(); }
        else if (k === 'bounce') { const u = c.scale.y / 2; { const V = process.env.VAR || ''; const A = () => { if (!c.body.isStatic) c.setForce(u, l, true); }, B = () => { if (!l.body.isStatic) l.setForce(u, c); };
          if (V === 'noB') A(); else if (V === 'noA') B(); else if (V === 'swap') { B(); A(); } else { A(); B(); } } if (isP) this.log('bounce'); }
        else if (k === 'checkpoint') { if (isP) { P.checkpoint = { ...c.position }; this.log('checkpoint'); } }
        else if (k === 'spike') { if (isP) this.kill('spike'); }
        else if (k === 'resize') { if (!l.body.isStatic) { l.setScale(c.scale); if (isP) this.log('resize ' + c.scale.x); } }
        else if (k === 'direction') { const f = Vector.rotate({ x: 25e-5 * l.body.mass, y: 0 }, c.body.angle); l.force = f; if (isP) this.log('direction'); }
        else if (k === 'gravity') { if (isP) { const g = vecFromAngle(c.body.angle); this.engine.gravity.x = g.x; this.engine.gravity.y = g.y; this.log('gravity ' + JSON.stringify(g)); } }
        else if (k === 'grapple') { if (isP) { P.mode = 'grapple'; this.log('grapple mode'); } }
        else if (k === 'finish') { if (isP && !this.finished) { this.finished = true; this.finishTick = this.tick; } }
        else if (k === 'control') { if (isP) { P.mode = 'control'; this.log('control mode'); } }
        else if (k === 'power') { if (isP) { P.jumpMode = 'unlimited'; } }
        else if (k === 'reset') { if (isP) { this.engine.gravity.x = 0; this.engine.gravity.y = 1; P.force = { x: 0, y: 0 }; P.mode = 'jump'; } }
      }
    }
  }
  addRope(angle) { // angle in Matter coords (radians, y down)
    const P = this.player; if (P.mode !== 'grapple' || this.dead) return false;
    this.removeRope();
    const b = P.body, dir = { x: Math.cos(angle), y: Math.sin(angle) };
    const bodies = Composite.allBodies(this.engine.world).length ? this.engine.world.bodies : [];
    for (let c = 0; c < 400; c += 4) {
      const u = { x: b.position.x + dir.x * c, y: b.position.y + dir.y * c };
      const d = Matter.Query.point(this.engine.world.bodies, u);
      if (d.length > 0 && d[0].class !== 'player') {
        const obj = d[0].object3D; if (!obj || !obj.visible) continue;
        this.attachRope(b, d[0], u); return true;
      }
    }
    return false;
  }
  attachRope(A, B, n) {
    const r = { x: A.position.x, y: A.position.y };
    const rope = { bodies: [], cons: [], anchor: { x: n.x, y: n.y }, target: B.object3D.cls };
    let e = A;
    for (let u = 1; u <= 4; u++) {
      const last = u === 4, f = u / 4, p = { x: r.x + (n.x - r.x) * f, y: r.y + (n.y - r.y) * f };
      let t, off = { x: 0, y: 0 };
      if (!last) {
        const part = Bodies.circle(p.x, p.y, 4, { isSensor: true });
        t = Body.create({ parts: [part], friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 0 });
        Composite.add(this.engine.world, t); rope.bodies.push(t);
      } else { t = B; off = { x: -(t.position.x - p.x), y: -(t.position.y - p.y) }; }
      const con = Matter.Constraint.create({ bodyA: e, bodyB: t, mass: 0, pointB: off, stiffness: 1.5 });
      con.shrink = true; con.minLength = 4; con.speed = 0.25;
      Composite.add(this.engine.world, con); rope.cons.push(con);
      e = t;
    }
    this.rope = rope;
  }
  removeRope() {
    if (!this.rope) return;
    for (const c of this.rope.cons) Composite.remove(this.engine.world, c);
    for (const b of this.rope.bodies) Composite.remove(this.engine.world, b);
    this.rope = null;
  }
  updateRope() {
    if (!this.rope) return;
    for (const c of this.rope.cons) if (c.shrink) { if (c.length > c.minLength) c.length -= c.speed; else { c.length = c.minLength; c.shrink = false; } }
  }
  kill(why) { if (!this.dead) { this.dead = why; this.player.body.collisionFilter.category = 0; } }
  jump() {
    const P = this.player, b = P.body;
    if (!(P.mode === 'jump' || P.mode === 'control')) return false;
    if (!(P.jumpReady || P.jumpMode === 'unlimited')) return false;
    P.jumpReady = false;
    const e = this.engine.gravity, t = Math.PI / 2 - Vector.angle({ x: 0, y: 0 }, e);
    let n = { x: b.velocity.x, y: b.velocity.y }, i = Math.PI / 20;
    n = Vector.rotate(n, t); n.y = 0; const r = n.x >= 0 ? 1 : -1; i *= r; n = Vector.rotate(n, -t);
    if (b.speed < P.controls.speed * .25) i = 0;
    Body.setVelocity(b, n); Body.setAngularVelocity(b, i);
    Body.applyForce(b, b.position, { x: -(e.x * .025 * b.mass), y: -(e.y * .025 * b.mass) });
    return true;
  }
  step(input = {}) {
    if (this.finished || this.dead) return;
    const P = this.player, b = P.body;
    if (input.left !== undefined) P.controls.left = input.left;
    if (input.right !== undefined) P.controls.right = input.right;
    if (input.jump) { if (this.jump()) this.log('jump'); }
    if (input.release) this.removeRope();
    if (input.rope !== undefined) { if (this.addRope(input.rope)) this.log('rope ' + input.rope.toFixed(2)); }
    // Game's render loop sets the player's three.js rotation.z from the interpolated body angle;
    // HT.setScale (used by resize) restores the body angle from that rendered rotation.
    this.player.rotZ = -(b.anglePrev + (b.angle - b.anglePrev) * this.alpha);
    // updateControls
    if (P.mode === 'control') {
      const e = this.engine.gravity, t = P.controls.left + P.controls.right, n = { x: e.y * t, y: -e.x * t };
      const r = { x: b.velocity.x, y: b.velocity.y }, i = Vector.dot(r, n), o = i + P.controls.acceleration, s = Math.max(i, Math.min(o, 4)) - i;
      r.x += n.x * s; r.y += n.y * s; Body.setVelocity(b, r);
    }
    if (b.speed < P.controls.speed) Body.applyForce(b, b.position, { x: P.force.x, y: P.force.y });
    this.updateRope();
    Engine.update(this.engine, DT);
    this.tick++;
    if (b.position.y > 1000) this.kill('fell');
    if (this.finished && this.dead) { this.finished = false; this.finishTick = null; }  // conservative: a finish in a death frame is not a valid finish
  }
  state() { const b = this.player.body; return { x: b.position.x, y: -b.position.y, vx: b.velocity.x, vy: -b.velocity.y, a: b.angle, ready: this.player.jumpReady }; }
}

function loadLevel(n) {
  const p = typeof n === 'number' ? require('path').join(__dirname, '..', 'levels', `Campaign Level ${n}.json`) : n;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// run with a set of jump ticks (and optional per-tick control inputs)
function run(level, jumps, maxTicks = 1800, opts = {}) {
  const sim = new Sim(level); const J = new Set(jumps);
  const trace = [];
  while (sim.tick < maxTicks && !sim.finished && !sim.dead) {
    const inp = { jump: J.has(sim.tick) };
    if (opts.control) Object.assign(inp, opts.control(sim.tick));
    sim.step(inp);
    if (opts.trace) trace.push(sim.state());
    if (opts.onTick) opts.onTick(sim);
  }
  return { sim, trace };
}

module.exports = { Sim, loadLevel, run, vecFromAngle, DT };

const _ = require('lodash');
function cloneSim(sim) {
  const c = _.cloneDeepWith(sim, (v, key) => {
    if (key === 'hist' || key === 'grid') return v;
    if (v && typeof v === 'object' && v.type === 'body') {
      const par = v.parent || v;
      if (par.isStatic && par.class !== 'tip') return v; // share immutable static bodies
    }
    if (typeof v === 'function') return v;
    return undefined;
  });
  c.engine.events = {};
  Matter.Events.on(c.engine, 'collisionStart', ev => c.onCollision(ev));
  return c;
}
module.exports.cloneSim = cloneSim;
