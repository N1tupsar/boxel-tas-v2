// Boxel 3D — deterministic "theory mode" patch for Charlieee1's TAS mod.
// NOT base-game behaviour: it removes the two sources of run-to-run variation so a TAS
// replays identically every attempt (to test theoretical best routes).
//
// Use:  reload the page -> paste the TAS quick-start -> paste THIS -> THEN open the level
//       (opening the level after installing matters: objects deleted earlier are only restored by a fresh open).
//       loadInputs([...]) -> click the game -> press t.  Don't use TAS savestates with this.
//       Switching levels is fine: a new snapshot is taken every time a level is opened.
(function () {
  const ALPHA = 0.5;      // render interpolation used by resize/grapple; must match the simulator
  const LOGN = 20000;     // frames of player state recorded for calibration (window.__log)

  // 1) Fixed render timing: after every draw, overwrite the player's rendered transform
  //    (which resize and grapple read) with a fixed interpolation of the physics body.
  window.addEventListener('renderUpdated', () => {
    const p = app.player, b = p && p.body; if (!b) return;
    p.position.x = b.positionPrev.x + (b.position.x - b.positionPrev.x) * ALPHA;
    p.position.y = -(b.positionPrev.y + (b.position.y - b.positionPrev.y) * ALPHA);
    p.rotation.z = -(b.anglePrev + (b.angle - b.anglePrev) * ALPHA);
  });

  // 0) Pin app.interval.speed (loose bounce pads multiply their launch speed by it; the simulator assumes 1).
  //    Re-applied every frame and on level start in case the game replaces the app.interval object.
  //    window.__ispeedReads counts how often the game actually read the pinned value.
  window.__ISPEED = 1; window.__ispeedReads = 0;
  const pinInterval = () => {
    const iv = app.interval;
    if (!iv || typeof iv !== 'object' || iv.__detPinned) return;
    try {
      console.log('[det] app.interval.speed was', iv.speed, '- pinning to', window.__ISPEED);
      Object.defineProperty(iv, 'speed', { configurable: true, enumerable: true, get() { window.__ispeedReads++; return window.__ISPEED; }, set() {} });
      Object.defineProperty(iv, '__detPinned', { value: true });
    } catch (err) { console.warn('[det] could not pin app.interval.speed', err); }
  };
  pinInterval();
  window.addEventListener('levelStart', pinInterval);
  addUpdateFunction(pinInterval);

  // 1a) Tick-0 jump: a leading "j0" in loadInputs([...]) jumps immediately when the run starts,
  //     before the first physics step (same as pressing jump in the same frame as restarting).
  //     A leading "p0" = "pre-touched" start: sensor blocks the player overlaps at spawn don't
  //     trigger on the first step (like restarting while already standing on them). Tokens may be
  //     combined in any order, e.g. ["p0","j0", ...].
  window.__j0 = false; window.__p0 = false;
  const origLoadInputs = window.loadInputs;
  window.loadInputs = function (arr) {
    arr = Array.isArray(arr) ? [...arr] : arr;
    window.__j0 = false; window.__p0 = false;
    while (Array.isArray(arr) && (arr[0] === 'j0' || arr[0] === 'p0')) { if (arr[0] === 'j0') window.__j0 = true; else window.__p0 = true; arr.shift(); }
    return origLoadInputs(arr);
  };
  let __muted = [];
  addUpdateFunction(() => { for (const [b, cls] of __muted) b.class = cls; __muted = []; });  // unmute after step 0

  // 1b) The game permanently deletes any non-player object whose *rendered* y drops below -1000
  //     (render-timed, and never undone by restarting), so each attempt started with a different
  //     set of loose objects. Keep fallen objects in the world instead (they just keep falling).
  const origRemove = app.level.removeObject.bind(app.level);
  app.level.removeObject = function (e, t) {
    if (t && e && e !== app.player && e.position && e.position.y < -1000) return;
    return origRemove(e, t);
  };

  // 2) Exact snapshot of every physics body right when the level starts.
  const VEC = ['position', 'positionPrev', 'velocity', 'force', 'positionImpulse', 'constraintImpulse'];
  const NUM = ['angle', 'anglePrev', 'angularVelocity', 'speed', 'angularSpeed', 'motion', 'torque',
               'totalContacts', 'area', 'mass', 'inverseMass', 'inertia', 'inverseInertia', 'density',
               'sleepCounter', 'deltaTime'];
  const snapPart = (p) => ({
    v: p.vertices.map(q => [q.x, q.y]), ax: p.axes.map(a => [a.x, a.y]),
    bd: [p.bounds.min.x, p.bounds.min.y, p.bounds.max.x, p.bounds.max.y],
    vec: VEC.map(k => (p[k] ? [p[k].x, p[k].y] : null)), num: NUM.map(k => p[k]),
    cat: p.collisionFilter.category, mask: p.collisionFilter.mask, sleep: p.isSleeping,
  });
  const restorePart = (p, s) => {
    // Vertex/axis counts can differ from the snapshot (Matter dedupes axes, bodies get re-shaped):
    // rebuild the arrays in that case instead of writing into missing entries.
    if (p.vertices.length !== s.v.length) {
      console.warn('[det] vertex count changed', p.label, p.vertices.length, '->', s.v.length);
      p.vertices = Matter.Vertices.create(s.v.map(q => ({ x: q[0], y: q[1] })), p);
    } else s.v.forEach((q, i) => { p.vertices[i].x = q[0]; p.vertices[i].y = q[1]; });
    if (p.axes.length !== s.ax.length) p.axes = s.ax.map(a => ({ x: a[0], y: a[1] }));
    else s.ax.forEach((a, i) => { p.axes[i].x = a[0]; p.axes[i].y = a[1]; });
    p.bounds.min.x = s.bd[0]; p.bounds.min.y = s.bd[1]; p.bounds.max.x = s.bd[2]; p.bounds.max.y = s.bd[3];
    VEC.forEach((k, i) => { if (s.vec[i] && p[k]) { p[k].x = s.vec[i][0]; p[k].y = s.vec[i][1]; } });
    NUM.forEach((k, i) => { if (s.num[i] !== undefined) p[k] = s.num[i]; });
    p.collisionFilter.category = s.cat; p.collisionFilter.mask = s.mask; p.isSleeping = s.sleep;
  };
  window.__detSnap = null;
  window.addEventListener('levelStart', () => {
    // 'levelStart' fires only when a level is opened (never on retry), so always re-snapshot here.
    // The game reuses one player object across levels, so its corners carry rounding errors from
    // wherever it was before. Snap them to the exact values of a freshly created (unrotated) cube,
    // then let Matter recompute axes/area/mass/inertia/bounds from them.
    const pb = app.player.body;
    if (Math.abs(pb.angle) < 1e-9) {
      const hw = app.player.scale.x / 2, hh = app.player.scale.y / 2, c = pb.position;
      for (const part of pb.parts) {
        for (const v of part.vertices) { v.x = (v.x < c.x ? -hw : hw) + c.x; v.y = (v.y < c.y ? -hh : hh) + c.y; }
        part.position.x = c.x; part.position.y = c.y;
      }
      Matter.Body.scale(pb, 1, 1);
    } else console.warn('[det] player spawns rotated; corner snapping skipped');
    // Opening a level with a click/Enter/Space is also a jump input, so the player can already
    // have a pending jump force (and changed velocity) at this instant. A fresh level has none:
    // clear every pending force/torque and put the player exactly at rest before snapshotting.
    for (const body of Matter.Composite.allBodies(app.engine.world))
      for (const part of body.parts) { part.force.x = 0; part.force.y = 0; part.torque = 0; }
    Matter.Body.setVelocity(pb, { x: 0, y: 0 }); Matter.Body.setAngularVelocity(pb, 0);
    app.player.jumpBuffer = 0;
    const snap = new Map();
    for (const body of Matter.Composite.allBodies(app.engine.world))
      snap.set(body, body.parts.map(snapPart));   // parts[0] is the body itself
    window.__detSnap = snap;
    // Diagnostics: world body order (affects Matter's pair/solver order) at level start.
    window.__order = Matter.Composite.allBodies(app.engine.world).map(b => [b.class || b.label, +b.position.x.toFixed(1), +b.position.y.toFixed(1), b.isStatic ? 1 : 0]);
    console.log('[det] snapshot of', snap.size, 'bodies taken');
  });

  window.__log = []; window.__loose = {};
  // 3) On "t": only flag a pending start. The actual restore (+ optional tick-0 jump) happens at
  //    the very start of the next physics step (inside player.updateControls, which the game calls
  //    right before Engine.update), i.e. after every keydown handler, including the TAS mod's
  //    retryLevel (which resets gravity), has finished. This makes it independent of listener order.
  let pendingStart = false;
  window.addEventListener('keydown', (e) => { if (e.key === 't' && window.__detSnap) pendingStart = true; });
  const origUpdateControls = app.player.updateControls.bind(app.player);
  app.player.updateControls = function (...args) {
    if (pendingStart) {
      pendingStart = false;
      for (const [body, parts] of window.__detSnap) {
        try { body.parts.forEach((p, i) => parts[i] && restorePart(p, parts[i])); }
        catch (err) { console.warn('[det] restore failed for', body.label, body.class, err); }
      }
      const P = app.engine.pairs;
      P.table = {}; P.list.length = 0; P.collisionStart.length = 0; P.collisionActive.length = 0; P.collisionEnd.length = 0;
      // Matter's broadphase keeps its body list sorted between steps; ties keep the previous order,
      // so that order carried history across attempts. Reset it to world order (as on a fresh level).
      app.engine.detector.bodies = Matter.Composite.allBodies(app.engine.world).slice(0);
      const b = app.player.body; app.player.rotation.z = -b.angle;
      app.player.position.x = b.position.x; app.player.position.y = -b.position.y;
      // The base game keeps jumpReady across restarts (touch the ground, then restart -> a jump is
      // available from frame 1). Theory mode always starts WITH the jump available.
      app.player.jumpReady = true; app.player.jumpBuffer = 0;
      window.__log = []; window.__loose = {};
      if (window.__p0) {  // mute effects of sensors already overlapping the player (pairs still form)
        const pbb = b.bounds;
        for (const o of Matter.Composite.allBodies(app.engine.world)) {
          if (o === b || !o.parts.some(q => q.isSensor)) continue;
          if (o.bounds.min.x <= pbb.max.x && o.bounds.max.x >= pbb.min.x && o.bounds.min.y <= pbb.max.y && o.bounds.max.y >= pbb.min.y) { __muted.push([o, o.class]); o.class = 'muted'; }
        }
        console.log('[det] pre-touched start, muted', __muted.length, 'sensor(s)');
      }
      if (window.__j0) { app.player.jump(); console.log('[det] tick-0 jump'); }
      console.log('[det] exact start state restored');
    }
    return origUpdateControls(...args);
  };

  // Calibration log: exact player state after each physics step (whole run, up to LOGN frames).
  // After a run:  copy(JSON.stringify(__log))  and paste it to the simulator side.
  addUpdateFunction(() => {
    if (window.__log.length >= LOGN) return;
    const b = app.player.body;
    window.__log.push([b.position.x, b.position.y, b.angle, b.velocity.x, b.velocity.y, app.player.jumpReady ? 1 : 0]);
    const n = window.__log.length;  // = number of physics steps since the start
    if (n === 1 || n === 30 || (n >= 100 && n <= 340 && n % 10 === 0))
      window.__loose[n] = Matter.Composite.allBodies(app.engine.world).filter(q => !q.isStatic && q !== b).slice(0, 20).map(q => [+q.position.x.toFixed(1), +q.position.y.toFixed(1), +q.angle.toFixed(2)]);
  });
  console.log('[det] deterministic patch installed (alpha ' + ALPHA + '). Now open the level.');
})();
