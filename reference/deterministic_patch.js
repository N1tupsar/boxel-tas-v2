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
    s.v.forEach((q, i) => { p.vertices[i].x = q[0]; p.vertices[i].y = q[1]; });
    s.ax.forEach((a, i) => { p.axes[i].x = a[0]; p.axes[i].y = a[1]; });
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
    const snap = new Map();
    for (const body of Matter.Composite.allBodies(app.engine.world))
      snap.set(body, body.parts.map(snapPart));   // parts[0] is the body itself
    window.__detSnap = snap;
    console.log('[det] snapshot of', snap.size, 'bodies taken');
  });

  // 3) On "t" (after the TAS mod's own handler has run retryLevel): restore the snapshot,
  //    clear Matter's collision-pair cache, reset the calibration log.
  window.__log = [];
  window.addEventListener('keydown', (e) => {
    if (e.key !== 't' || !window.__detSnap) return;
    for (const [body, parts] of window.__detSnap) body.parts.forEach((p, i) => parts[i] && restorePart(p, parts[i]));
    const P = app.engine.pairs;
    P.table = {}; P.list.length = 0; P.collisionStart.length = 0; P.collisionActive.length = 0; P.collisionEnd.length = 0;
    // Matter's broadphase keeps its body list sorted between steps; ties keep the previous order,
    // so that order carried history across attempts. Reset it to world order (as on a fresh level).
    app.engine.detector.bodies = Matter.Composite.allBodies(app.engine.world).slice(0);
    const b = app.player.body; app.player.rotation.z = -b.angle;
    app.player.position.x = b.position.x; app.player.position.y = -b.position.y;
    app.player.jumpReady = true; // the base game keeps jumpReady across restarts; theory mode starts WITH the jump available
    app.player.jumpBuffer = 0;
    window.__log = [];
    console.log('[det] exact start state restored');
  });

  // Calibration log: exact player state after each physics step (whole run, up to LOGN frames).
  // After a run:  copy(JSON.stringify(__log))  and paste it to the simulator side.
  addUpdateFunction(() => {
    if (window.__log.length >= LOGN) return;
    const b = app.player.body;
    window.__log.push([b.position.x, b.position.y, b.angle, b.velocity.x, b.velocity.y, app.player.jumpReady ? 1 : 0]);
  });
  console.log('[det] deterministic patch installed (alpha ' + ALPHA + '). Now open the level.');
})();
