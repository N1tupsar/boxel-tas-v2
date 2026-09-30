// Excerpts from Boxel 3D v2.9.3 (assets/index-iFbal--S.js, prettified). Z = Matter.js 0.19.0. For reference only.
// ---- util.getVectorFromAngle (used by gravity blocks) ----
      return Math.random() * (t - e) + e;
    }
    getVectorFromAngle(e = 0, t = 1) {
      var n = Math.PI,
        t = 1e3,
        r = -e * (180 / n);
      return {
        x: Math.round(Math.cos((90 - r) * (n / 180)) * t) / t,
        y: Math.round(Math.sin((90 - r) * (n / 180)) * t) / t,
      };
    }
    getAngleFromVector(e) {
      var t = (180 * Math.atan2(e.y, e.x)) / Math.PI;
      return this.degreesToRadians((360 + Math.round(t)) % 360);
    }
    radiansToDegrees(e) {
      return (180 / Math.PI) * e;

// ---- zT: collision handler (block effects) ----
  zT = class {
    constructor() {}
    checkPlayerCollision(e) {
      for (var t = e.pairs, n = 0; n < t.length; n++)
        for (var r = t[n], i = [r.bodyA, r.bodyB], a = 0; a < i.length; a++) {
          var o = i[(a + 0) % 2],
            s = i[(a + 1) % 2],
            c = o.parent.object3D,
            l = s.parent.object3D;
          if (
            c != null &&
            l != null &&
            (c.body.class == `player` && (app.player.jumpReady = !0),
            s.class != `sensor`)
          ) {
            if (o.class == `sensor`) {
              if (c.body.class == `tip`)
                l.body.class == `player` &&
                  (app.level.showTip(c.text), c.hide(!0));
              else if (c.body.class == `bounce`) {
                var u = c.scale.y / 2;
                (c.body.isStatic == 0 && c.setForce(u, l, !0),
                  l.body.isStatic == 0 && l.setForce(u, c),
                  l.body.class == `player` && app.assets.audio.play(`bounce`));
              } else if (c.body.class == `checkpoint`)
                l.body.class == `player` &&
                  (app.player.saveCheckpoint(c.position),
                  app.assets.audio.play(`success`));
              else if (c.body.class == `spike`)
                l.body.class == `player` && app.player.kill();
              else if (c.body.class == `shrink`)
                l.body.class == `player` && (app.player.shrink(), c.hide(!0));
              else if (c.body.class == `grow`)
                l.body.class == `player` && (app.player.grow(), c.hide(!0));
              else if (c.body.class == `resize`)
                l.isStatic() == 0 &&
                  (l.setScale(c.scale, !1),
                  l.body.class == `player` && app.assets.audio.play(`resize`));
              else if (c.body.class == `direction`) {
                var u = l.calculateForceDirection(c.body, l.body);
                (l.setForceDirection(u, !1),
                  l.body.class == `player` &&
                    app.assets.audio.play(`teleport`));
              } else if (c.body.class == `gravity`)
                l.body.class == `player` &&
                  (app.updateGravity(c.body.angle),
                  app.assets.audio.play(`teleport`));
              else if (c.body.class == `grapple`)
                l.body.class == `player` &&
                  (app.player.setMode(`grapple`, !1),
                  app.assets.audio.play(`teleport`));
              else if (c.body.class == `finish`)
                l.body.class == `player` && app.player.finish();
              else if (c.body.class == `reset`)
                l.body.class == `player` && app.player.reset();
              else if (c.body.class == `control`)
                l.body.class == `player` &&
                  (app.player.setMode(`control`, !1),
                  app.assets.audio.play(`teleport`));
              else if (c.body.class == `power`)
                l.body.class == `player` &&
                  (app.player.setJumpMode(`unlimited`, !1),
                  app.assets.audio.play(`teleport`));
              else if (c.body.class == `teleport`) {
                let e = c.text?.split(`,`) || [];
                (l.setPosition(
                  { x: Number(e[0] || 0), y: Number(e[1] || 0), z: 0 },
                  !1,
                ),
                  l.updateMatrixWorld(),
                  l.body.class == `player` &&
                    app.assets.audio.play(`teleport`));
              }
            } else if (c.body.class == `cube` && l.body.class == `player`) {
              let e = ip.randInt(-1200, 1200);
              app.assets.audio.play(`pop1`, { detune: e });

// ---- HT: base entity (position/rotation/scale/force/bounce/freeze) ----
  HT = class extends Y {
    constructor(e = {}) {
      (super(),
        (e.x = e.x == null ? 0 : e.x),
        (e.y = e.y == null ? 0 : e.y),
        (e.z = e.z == null ? 0 : e.z),
        (e.scaleX = e.scaleX == null ? 1 : e.scaleX),
        (e.scaleY = e.scaleY == null ? 1 : e.scaleY),
        (e.scaleZ = e.scaleZ == null ? 1 : e.scaleZ),
        (e.segments = e.segments == null ? 1 : e.segments),
        (e.radius = e.radius == null ? 0 : e.radius),
        (e.angle = e.angle == null ? 0 : e.angle),
        (e.color = e.color == null ? `#620460` : e.color),
        (e.debug = e.debug != null),
        (this.shapes = new VT()),
        this.shapes.addCube(e),
        this.setColors(e.color),
        this.add(this.shapes),
        (this.hitbox = Z.Bodies.rectangle(0, 0, e.scaleX, e.scaleY, {
          class: `hitbox`,
        })),
        (this.body = Z.Body.create({
          parts: [this.hitbox],
          friction: 0,
          frictionAir: 0,
          frictionStatic: 0,
          restitution: 0,
          slop: 0,
          timeScale: 1,
          name: this.uuid,
          class: `cube`,
          object3D: this,
        })),
        (this.helper = new rm()),
        (this.helper.visible = e.debug),
        this.addHelper(this.hitbox),
        (this.name = this.uuid),
        (this.isCube = !0),
        (this.textEnabled = !1),
        this.setPosition({ x: e.x, y: e.y, z: e.z }),
        this.setRotation(e.angle),
        this.setScale({ x: e.scaleX, y: e.scaleY, z: e.scaleZ }),
        this.setMode(),
        this.setJumpMode(),
        this.setForceDirection());
    }
    update(e, t) {
      (t &&
        ((this.position.x =
          this.body.positionPrev.x +
          (this.body.position.x - this.body.positionPrev.x) * t),
        (this.position.y = -(
          this.body.positionPrev.y +
          (this.body.position.y - this.body.positionPrev.y) * t
        )),
        (this.rotation.z = -(
          this.body.anglePrev +
          (this.body.angle - this.body.anglePrev) * t
        ))),
        this.position.y < -1e3 &&
          (this.getClass() == `player` && this.isStatic() == 0
            ? this.kill()
            : app.level.removeObject(this, !0)),
        this.updateHelper());
    }
    updateHelper() {
      this.helper &&
        this.helper.visible == 1 &&
        ((this.helper.position.x = this.body.position.x),
        (this.helper.position.y = -this.body.position.y),
        (this.helper.position.z = this.position.z),
        (this.helper.rotation.z = -this.body.anglePrev),
        this.helper.scale.copy(this.scale).multiplyScalar(1),
        this.helper.updateMatrixWorld());
    }
    addHelper(e, t) {
      ((t ??= {}), (t.position ??= { x: 0, y: 0 }), (t.color ??= `#00ff00`));
      var n = e.bounds.max.x - e.bounds.min.x,
        r = new Rg(n, e.bounds.max.y - e.bounds.min.y, n),
        i = new Tg(r, new wv({ color: t.color, wireframe: !0 }));
      (this.helper.add(i), r.translate(t.position.x, t.position.y, 0));
    }
    setColors(e, t = !0) {
      ((this.color = e), this.shapes.setColors(e, t));
    }
    setPosition(e = {}, t = !0) {
      ((e.x = e.x == null ? this.position.x : e.x),
        (e.y = e.y == null ? this.position.y : e.y),
        (e.z = e.z == null ? this.position.z : e.z),
        this.position.set(e.x, e.y, e.z),
        Z.Body.setPosition(this.body, { x: e.x, y: -e.y }),
        t == 1 && this.setPositionOrigin(e));
    }
    setPositionOrigin(e) {
      ((this.positionOrigin ??= {}),
        (this.positionOrigin.x = e.x),
        (this.positionOrigin.y = e.y),
        (this.positionOrigin.z = e.z));
    }
    getPosition() {
      return this.position;
    }
    setRotation(e, t = !0) {
      typeof e == `object`
        ? ((this.rotation.x = e.x),
          (this.rotation.y = e.y),
          (this.rotation.z = e.z),
          Z.Body.setAngle(this.body, -e.z),
          t == 1 && this.setRotationOrigin(e.z))
        : ((this.rotation.z = e),
          Z.Body.setAngle(this.body, -e),
          t == 1 && this.setRotationOrigin(e));
    }
    setRotationOrigin(e) {
      this.rotationOrigin = e;
    }
    getRotation(e = `radians`) {
      var t = this.rotation.z;
      return (
        e == `degrees` && (t = Math.round(this.rotation.z * (180 / Math.PI))),
        t
      );
    }
    getRotationOrigin() {
      return this.rotationOrigin;
    }
    setScale(e = {}, t = !0) {
      ((e.x = e.x == null ? this.scale.x : e.x),
        (e.y = e.y == null ? this.scale.y : e.y),
        (e.z = e.z == null ? this.scale.z : e.z));
      var n = this.rotation.z;
      (this.setRotation(0, !1),
        this.setBodyScale(e.x / this.scale.x, e.y / this.scale.y),
        (this.scale.x = e.x),
        (this.scale.y = e.y),
        (this.scale.z = e.z),
        this.setRotation(n, !1),
        t == 1 && this.setScaleOrigin({ x: e.x, y: e.y, z: e.z }));
    }
    setBodyScale(e, t) {
      Z.Body.scale(this.body, e, t);
    }
    getScale() {
      return this.scale;
    }
    getScaleOrigin() {
      return this.scaleOrigin;
    }
    setScaleOrigin(e) {
      ((this.scaleOrigin ??= {}),
        (this.scaleOrigin.x = e.x),
        (this.scaleOrigin.y = e.y),
        (this.scaleOrigin.z = e.z));
    }
    setForceDirection(e = { x: 0, y: 0 }, t = !0) {
      ((this.force = e), t == 1 && this.setForceDirectionOrigin(e));
    }
    setForceDirectionOrigin(e) {
      this.forceOrigin = e;
    }
    getForce() {
      return this.force;
    }
    calculateForceDirection(e, t) {
      var n = { x: 25e-5 * t.mass, y: 0 };
      return ((n = Z.Vector.rotate(n, e.angle)), n);
    }
    resetToOrigin() {
      (this.hide(!1),
        this.setPosition(this.positionOrigin, !1),
        this.setRotation(this.rotationOrigin, !1),
        this.setScale(
          {
            x: this.scaleOrigin.x,
            y: this.scaleOrigin.y,
            z: this.scaleOrigin.z,
          },
          !1,
        ),
        this.setForceDirection(this.forceOrigin, !1),
        this.setStatic(this.isStaticOrigin, !1),
        this.setFriction(this.frictionOrigin, !1),
        this.setMode(this.modeOrigin, !1),
        this.setJumpMode(this.jumpModeOrigin, !1),
        Z.Body.setVelocity(this.body, { x: 0, y: 0 }),
        Z.Body.setAngularVelocity(this.body, 0));
    }
    setStatic(e = !0, t = !0) {
      (Z.Body.setStatic(this.body, e), t == 1 && this.setStaticOrigin(e));
    }
    setStaticOrigin(e) {
      this.isStaticOrigin = e;
    }
    toggleStatic() {
      var e = !this.body.isStatic;
      return (this.setStatic(e), e);
    }
    isStatic() {
      return this.body.isStatic;
    }
    setFriction(e = 0.1, t = !0) {
      ((this.body.friction = parseFloat(e)),
        t == 1 && this.setFrictionOrigin(e));
    }
    setFrictionOrigin(e) {
      this.frictionOrigin = parseFloat(e);
    }
    getFriction() {
      return this.body.friction;
    }
    setMode(e, t = !0) {
      ((e ??= `default`),
        (this.mode = e),
        t == 1 && this.setModeOrigin(e),
        window.dispatchEvent(new CustomEvent(`setMode`, { detail: e })));
    }
    setModeOrigin(e) {
      this.modeOrigin = e;
    }
    setJumpMode(e, t = !0) {
      ((e ??= `limited`),
        (this.jumpMode = e),
        t == 1 && this.setJumpModeOrigin(e),
        window.dispatchEvent(new CustomEvent(`setJumpMode`, { detail: e })));
    }
    setJumpModeOrigin(e) {
      this.jumpModeOrigin = e;
    }
    getClass() {
      return this.body.class;
    }
    setText(e) {
      this.textEnabled === !0 && e != null && (this.text = e);
    }
    getText() {
      return this.text;
    }
    select(e = !0) {
      ((this.selected = e),
        e == 1
          ? (this.shapes.setColors(`#ffffff`, !1),
            this.shapes.setOpacities(0.9),
            Z.Body.setVelocity(this.body, { x: 0, y: 0 }),
            Z.Body.setAngularVelocity(this.body, 0))
          : (this.shapes.resetColors(), this.shapes.setOpacities(1)));
    }
    isSelected() {
      return this.selected;
    }
    setForce(e, t, n = !1) {
      var r = this.body.positionPrev.x,
        i = this.body.position.x,
        a = this.body.positionPrev.y,
        o = this.body.position.y,
        s = t.body.angle,
        c = Math.atan2(o - a, i - r);
      n == 1 &&
        ((s = this.body.angle),
        (c = this.body.angle + Math.PI / 2),
        (e *= -1 * app.interval.speed));
      var l = Math.cos(c),
        u = Math.sin(c),
        d = -Math.sin(s),
        f = Math.cos(s),
        p = l * d + u * f,
        m = l - 2 * p * d,
        h = u - 2 * p * f;
      return (
        p < 0 && (Math.abs(m) == 1 || Math.abs(h) == 1) && (e *= -1),
        Z.Body.setVelocity(this.body, { x: m * e, y: h * e }),
        e
      );
    }
    getVelocity(e = this) {
      return {
        x: e.body.position.x - e.body.positionPrev.x,
        y: e.body.position.y - e.body.positionPrev.y,
      };
    }
    freeze(e = !0) {
      ((this.body.collisionFilter.category = e == 1 ? 0 : 1),
        Z.Sleeping.set(this.body, e));
    }
    hide(e = !0) {
      ((this.visible = !e), this.freeze(e));
    }
    isFrozen() {

// ---- _E rope, rope joints, yE player (jump, controls, grapple rope) ----
      for (let r = 0; r < t; r += 3)
        ((n[2 * r] = e[r]),
          (n[2 * r + 1] = e[r + 1]),
          (n[2 * r + 2] = e[r + 2]),
          (n[2 * r + 3] = e[r + 3]),
          (n[2 * r + 4] = e[r + 4]),
          (n[2 * r + 5] = e[r + 5]));
      return (super.setColors(n), this);
    }
    setFromPoints(e) {
      let t = e.length - 1,
        n = new Float32Array(6 * t);
      for (let r = 0; r < t; r++)
        ((n[6 * r] = e[r].x),
          (n[6 * r + 1] = e[r].y),
          (n[6 * r + 2] = e[r].z || 0),
          (n[6 * r + 3] = e[r + 1].x),
          (n[6 * r + 4] = e[r + 1].y),
          (n[6 * r + 5] = e[r + 1].z || 0));
      return (super.setPositions(n), this);
    }
    fromLine(e) {
      let t = e.geometry;
      return (this.setPositions(t.attributes.position.array), this);
    }
  },
  gE = class extends mE {
    constructor(e = new hE(), t = new YT({ color: Math.random() * 16777215 })) {
      (super(e, t), (this.isLine2 = !0), (this.type = `Line2`));
    }
  },
  _E = class extends rm {
    constructor() {
      (super(), (this.radius = 4));
    }
    addJoints(e, t, n) {
      for (
        var r = e.position,
          i = n,
          a = Math.sqrt((r.x - i.x) ** 2 + (r.y - i.y) ** 2),
          o = 4,
          s = Math.ceil(a / (this.radius * 2) / o),
          c = 16 / o,
          l = 1 / o,
          u = 1;
        u <= o;
        u++
      ) {
        var d = u == o,
          f = u / o,
          p = { x: r.x + (i.x - r.x) * f, y: r.y + (i.y - r.y) * f };
        u > 1 && (e = this.children[this.children.length - 1].body);
        var m = new vE({
          bodyA: e,
          bodyB: t,
          isLastJoint: d,
          minLength: c,
          position: p,
          radius: this.radius,
          spacing: s,
          speed: l,
          texture: this.texture,
        });
        this.add(m);
      }
    }
    removeJoints() {
      for (var e = this.children.length - 1; e >= 0;) {
        var t = this.children[e];
        (t.removeConstraint(), t.removeBody(), this.remove(t), e--);
      }
    }
    resetToOrigin() {
      this.removeJoints();
    }
    updateJoints() {
      for (var e = 0; e < this.children.length; e++) this.children[e].shrink();
    }
    renderJoints(e) {
      for (var t = 0; t < this.children.length; t++) {
        var n = [],
          r = this.children[t],
          i = r.constraint.bodyA,
          a = r.constraint.bodyB,
          o = i.positionPrev.x + (i.position.x - i.positionPrev.x) * e,
          s = i.positionPrev.y + (i.position.y - i.positionPrev.y) * e,
          c = a.positionPrev.x + (a.position.x - a.positionPrev.x) * e,
          l = a.positionPrev.y + (a.position.y - a.positionPrev.y) * e;
        (r.line2 != null &&
          (n.push(o, -s, 0),
          n.push(c + r.offset.x, -(l + r.offset.y), 0),
          r.line2Geometry.setPositions(n),
          r.line2.computeLineDistances()),
          r.circleMesh != null && r.circleMesh.position.set(c, -l, 0));
      }
    }
  },
  vE = class extends rm {
    constructor(e) {
      (super(), this.addLineMesh(e), this.addBody(e), this.addConstraint(e));
    }
    addLineMesh(e) {
      ((this.speed = e.speed),
        (this.minLength = e.minLength),
        (this.line2Geometry = new hE()),
        (this.line2Material = new YT({
          color: `#ffffff`,
          dashed: !1,
          linewidth: 4,
          dashScale: 1,
          dashSize: 8,
          gapSize: 2,
          worldUnits: !0,
        })),
        (this.line2 = new gE(this.line2Geometry, this.line2Material)),
        this.add(this.line2));
    }
    addCircleMesh(e) {
      ((this.circle = new zg(e.radius, 12)),
        (this.circleMaterial = new xh({
          color: `#ffffff`,
          opacity: 1,
          transparent: !0,
        })),
        (this.circleMesh = new Y(this.circle, this.circleMaterial)),
        this.add(this.circleMesh));
    }
    removeCircleMesh() {
      this.remove(this.circleMesh);
    }
    addBody(e) {
      ((this.part = Z.Bodies.circle(e.position.x, e.position.y, e.radius, {
        isSensor: !0,
      })),
        (this.body = Z.Body.create({
          parts: [this.part],
          friction: 0,
          frictionAir: 0,
          frictionStatic: 0,
          restitution: 0,
        })),
        Z.World.add(app.engine.world, this.body));
    }
    removeBody() {
      Z.World.remove(app.engine.world, this.body);
    }
    addConstraint(e) {
      var t = this.body,
        n = { x: 0, y: 0 };
      (e.isLastJoint == 1 &&
        (this.removeBody(),
        this.removeCircleMesh(),
        (t = e.bodyB),
        (n = {
          x: -(t.position.x - e.position.x),
          y: -(t.position.y - e.position.y),
        })),
        (this.offset = n),
        (this.constraint = Z.Constraint.create({
          bodyA: e.bodyA,
          bodyB: t,
          mass: 0,
          pointB: n,
          stiffness: 1.5,
          shrink: !0,
        })),
        Z.World.add(app.engine.world, this.constraint));
    }
    removeConstraint() {
      Z.World.remove(app.engine.world, this.constraint);
    }
    shrink() {
      this.constraint.shrink == 1 &&
        (this.constraint.length > this.minLength
          ? (this.constraint.length -= this.speed)
          : ((this.constraint.length = this.minLength),
            (this.constraint.shrink = !1)));
    }
  },
  yE = class extends HT {
    constructor(e = {}) {
      (super(e),
        (this.body.class = `player`),
        this.setScale({ x: 16, y: 16, z: 16 }),
        this.setStatic(!1),
        (this.color = `#dc265a`),
        this.setColors(`#dc265a`),
        this.setMode(`jump`),
        this.setJumpMode(`limited`),
        (this.util = new Ou()),
        (this.mass = 5),
        (this.jumpReady = !1),
        (this.jumpBuffer = 0),
        (this.inputBuffer = 0),
        this.addLight(`#dc265a`, 16e3, 500, !1),
        (this.controls = { left: 0, right: 0, acceleration: 0.5, speed: 4 }),
        (this.rope = new _E()),
        (this.skin = { url: `` }),
        (this.plane = new Y(
          new sv(1e6, 1e6),
          new wv({ visible: !1, side: 2 }),
        )),
        this.add(this.plane));
    }
    setColors() {}
    setScale(e = {}, t = !0) {
      super.setScale(e, t);
    }
    update(e, t) {
      (this.jumpBuffer > 0 &&
        ((this.jumpBuffer -= e),
        this.jumpReady == 1 && ((this.jumpBuffer = 0), this.jump())),
        super.update(e, t));
    }
    jump() {
      if (this.mode == `jump` || this.mode == `control`)
        if (this.jumpReady == 1 || this.jumpMode == `unlimited`) {
          this.jumpReady = !1;
          var e = app.engine.world.gravity,
            t = Math.PI / 2 - Z.Vector.angle({ x: 0, y: 0 }, e),
            n = this.body.velocity,
            r = 1,
            i = Math.PI / 20,
            a = 0.025,
            o = {
              x: -(e.x * a * this.body.mass),
              y: -(e.y * a * this.body.mass),
            };
          ((n = Z.Vector.rotate(n, t)),
            (n.y = 0),
            (r = n.x >= 0 ? 1 : -1),
            (i *= r),
            (n = Z.Vector.rotate(n, -t)),
            this.body.speed < this.controls.speed * 0.25 && (i = 0),
            Z.Body.setVelocity(this.body, n),
            Z.Body.setAngularVelocity(this.body, i),
            Z.Body.applyForce(this.body, this.body.position, o),
            app.assets.audio.play(`pop2`));
        } else this.jumpBuffer = this.inputBuffer;
    }
    setControls(e, t) {
      this.controls[e] = t;
    }
    setInputBuffer(e) {
      this.inputBuffer = e;
    }
    updateControls() {
      if (this.mode == `control`) {
        var e = app.engine.world.gravity,
          t = this.controls.left + this.controls.right,
          n = { x: e.y * t, y: -e.x * t },
          r = this.body.velocity,
          i = Z.Vector.dot(r, n),
          a = 4,
          o = i + this.controls.acceleration,
          s = Math.max(i, Math.min(o, a)) - i;
        ((r.x += n.x * s), (r.y += n.y * s), Z.Body.setVelocity(this.body, r));
      }
    }
    addRope(e) {
      if (this.mode == `grapple` && this.isFrozen() == 0) {
        var t = 4,
          n = 400,
          r = e.x - this.position.x,
          i = e.y - this.position.y,
          a = Math.sqrt(r * r + i * i),
          o = { x: this.position.x, y: -this.position.y },
          s = {
            x: this.position.x + ((e.x - this.position.x) * n) / a,
            y: -(this.position.y + ((e.y - this.position.y) * n) / a),
          };
        this.removeRope();
        for (var c = 0; c < n; c += t) {
          var l = c / n,
            u = { x: o.x + (s.x - o.x) * l, y: o.y + (s.y - o.y) * l },
            d = Z.Query.point(app.engine.world.bodies, u);
          if (d.length > 0 && d[0].class != `player`) {
            var f = app.level.getObjectByName(d[0].name);
            if (f.visible == 1 && f.position.z == 0) {
              (app.level.add(this.rope),
                this.rope.addJoints(this.body, d[0], u),
                this.updateRope());
              break;
            }
          }
        }
        app.assets.audio.play(`ice`);
      }
    }
    updateForce() {
      this.body.speed < this.controls.speed &&
        Z.Body.applyForce(this.body, this.body.position, {
          x: this.force.x,
          y: this.force.y,
        });
    }
    updateRope() {
      this.rope.updateJoints();
    }
    renderRope(e) {
      this.rope.renderJoints(e);
    }
    removeRope() {
      (this.rope.removeJoints(), app.level.remove(this.rope));
    }
    kill() {
      if (this.isFrozen() == 0) {
        (this.freeze(!0),
          (this.visible = !1),
          (this.killTimeout = setTimeout(
            function () {
              this.restart();
            }.bind(this),
            1e3,
          )));
        for (
          var e = 4,
            t = 4,
            n = {
              x: this.scale.x / t,
              y: this.scale.y / e,
              z: this.scale.z / 4,
            },
            r = -e / 2;
          r < e / 2;
          r++
        )
          for (var i = -t / 2; i < t / 2; i++) {
            var a = this.util.randomNumber(0, (Math.PI / 180) * 360),
              o = {
                color: this.color,
                position: {
                  x: this.position.x + i * n.x + n.x / 2,
                  y: this.position.y + r * n.y + n.y / 2,
                  z: 0,
                },
                rotation: { x: 0, y: 0, z: a },
                scale: { x: n.x, y: n.y, z: n.z },
                isStatic: !1,
                friction: 0,
              },
              s = app.level.entityFactory.createObject(`cube`);
            (app.level.setObjectProperties(s, o),
              app.level.addObject(s),
              (s.isParticle = !0),
              s.setColors(this.color),
              Z.Body.setVelocity(s.body, this.body.velocity));
          }
      }
      (window.dispatchEvent(
        new CustomEvent(`playerKill`, { detail: { player: this } }),
      ),
        app.assets.audio.play(`glass`));
    }
    cancelRestart() {
      clearTimeout(this.killTimeout);
    }
    saveCheckpoint(e) {
      ((this.checkpoint ??= {}),
        (this.checkpoint.x = e.x),
        (this.checkpoint.y = e.y),
        (this.checkpoint.z = e.z));
    }
    removeCheckpoint() {
      this.checkpoint = null;
    }
    setPositionToCheckpoint() {
      this.checkpoint != null &&
        this.setPosition(
          {
            x: (this.position.x = this.checkpoint.x),
            y: (this.position.y = this.checkpoint.y),
            z: (this.position.z = this.checkpoint.z),
          },
          !1,
        );
    }
    respawn(e = !1) {
      (this.isFrozen() == 1 || e == 1) &&
        (app.level.removeParticles(),
        this.resetToOrigin(),
        this.setPositionToCheckpoint(),
        window.dispatchEvent(
          new CustomEvent(`playerRespawn`, { detail: { player: this } }),
        ));
    }
    restart() {
      (app.level.retryLevel(!0),
        window.dispatchEvent(
          new CustomEvent(`playerRestart`, { detail: { player: this } }),
        ));
    }
    finish() {
      if (app.play == 1) {
        var e = app.level.publishedFileId || app.level.name,
          t = app.timer.toString(),
          n = app.storage.saveScore(e, t);
        (app.timer.render(t),
          (app.play = !1),
          window.dispatchEvent(
            new CustomEvent(`levelFinish`, { detail: { time: t, level: e } }),
          ),
          app.isVerified() &&
            (t =
              `<span class="material-symbols-rounded">verified</span><br>` + t),
          window.dispatchEvent(
            new CustomEvent(`openPopup`, {
              detail: {
                title: t,
                text: `popup.text.seconds`,
                description: n ? `popup.description.new_record` : null,
                inputs: [
                  {
                    value: `popup.button.retry`,
                    type: `button`,
                    shortcut: `KeyR`,
                    callback: function () {
                      (app.level.retryLevel(),
                        window.dispatchEvent(new CustomEvent(`closePopup`)));
                    },
                  },
                  {
                    value: `popup.button.continue`,
                    type: `button`,
                    shortcut: `Space`,
                    callback: function () {
                      (app.level.exitLevel(),
                        window.dispatchEvent(new CustomEvent(`closePopup`)));
                    },
                  },
                ],
              },
            }),
          ),
          app.assets.audio.play(`clap`),
          app.assets.audio.play(`success`));
      }
    }
    shrink() {
      this.setScale(
        { x: this.scale.x / 2, y: this.scale.y / 2, z: this.scale.z / 2 },
        !1,
      );
    }
    grow() {
      this.setScale(
        { x: this.scale.x * 2, y: this.scale.y * 2, z: this.scale.z * 2 },
        !1,
      );
    }
    renderSpeed() {
      var e = this.body.speed,
        t = 10,
        n = 0,
        r = n + `%;`;
      (e > t && (e = t),
        (n = (e / t) * 100),
        (r = `width: calc(` + n + `% - 8px)`),
        app.document.getElementById(`speed`) &&
          app.document.getElementById(`speed`).setAttribute(`style`, r));
    }
    setSkin(e = {}) {
      this.addTexture(e);
    }
    reset() {
      (app.updateGravity(),
        this.setForceDirection(),
        this.setScale(
          {
            x: this.scaleOrigin.x,
            y: this.scaleOrigin.y,
            z: this.scaleOrigin.z,
          },
          !1,
        ),
        this.setMode(this.modeOrigin, !1),
        this.setJumpMode(this.jumpModeOrigin, !1),
        (this.controls.left = this.controls.right = 0),
        (this.jumpBuffer = 0),
        app.assets.audio.play(`teleport`));
    }
    addTexture(e) {
      e.url &&
        ((e.url = e.url.replace(`img/png/skins/`, `./png/`)),
        new ry().load(
          e.url,
          function (t) {
            ((t.colorSpace = ff),
              this.remove(this.skin),
              (this.shapes.visible = !1));
            var n = new GT(1, 1, 1, 1, 0.1),
              r = new wv({ map: t, transparent: !0, opacity: 1 });
            (this.shapes.setOpacities(0),
              (this.skin = new Y(n, r)),
              (this.skin.url = e.url),
              this.add(this.skin),
              this.updateMatrixWorld());
          }.bind(this),
          void 0,
          function (e) {
            console.error(`An error happened: `, e);
          }.bind(this),
        ));
    }
  };
new q();
var bE = class extends cT {
    constructor(e) {
      (super(),
        (e = Object.assign(
          { type: `div`, class: `CSS2DObject`, text: `Hello, World!` },

// ---- DA app: engine loop, gravity ----
          `pointerup`,
          function (e) {
            this.mouse.mouseUp(e);
          }.bind(this),
          !1,
        ),
        this.canvas.addEventListener(
          `wheel`,
          function (e) {
            this.mouse.wheel(e);
          }.bind(this),
          !1,
        ),
        this.window.addEventListener(
          `resize`,
          function (e) {
            this.resizeWindow(e);
          }.bind(this),
        ),
        this.window.addEventListener(`message`, (e) => this.onMessage(e)),
        Z.Events.on(
    updateGravity(e) {
      var t = this.util.getVectorFromAngle(e),
        n = app.engine.world.gravity,
        r = 1;
      ((n.x = t.x),
        (n.y = t.y),
        e != null && app.motion == 1
          ? ((e *= -1),
            e < 0 &&
              (app.camera.rotation.z =
                (app.camera.rotation.z - Math.PI * 2) % (Math.PI * 2)),
            (r = Math.abs((e + Math.PI) % Math.PI) / (Math.PI / 2) + 1),
            app.animation
              .tween({
                object: app.camera.rotation,
                to: { z: e },
                duration: 250,
              })
              .start(),
            app.background.animateScale(r))
          : ((app.camera.rotation.z = 0), app.background.animateScale(1)));
    }
    updateQuality(e) {
      (e <= 0 && (e = 1),
        this.graphics.setPixelRatio(this.window.devicePixelRatio / (10 / e)));
    }
    updateCameraMotion(e) {
      app.motion = e;
    }
    saveOrbitState() {
      this.state == `level-editor` &&
        ((this.camera.rotation.x = 0),
        (this.camera.rotation.y = 0),
