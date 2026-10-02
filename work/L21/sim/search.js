const Matter = require('matter-js');
const { Sim, loadLevel, cloneSim } = require('./boxel');

function buildGrid(sim, cell = 8, goalPt = null) {
  const bodies = sim.objects.filter(o => o.position.z === 0 && o.cls !== 'player').map(o => o.body);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const b of bodies.concat([sim.player.body])) { minX = Math.min(minX, b.bounds.min.x); minY = Math.min(minY, b.bounds.min.y); maxX = Math.max(maxX, b.bounds.max.x); maxY = Math.max(maxY, b.bounds.max.y); }
  minX -= 400; minY -= 400; maxX += 400; maxY += 400;
  const W = Math.ceil((maxX - minX) / cell), H = Math.ceil((maxY - minY) / cell);
  if (process.env.DBG) console.log('grid bounds', minX, minY, maxX, maxY, W, H);
  const solid = new Uint8Array(W * H), goal = new Uint8Array(W * H);
  const solidParts = []; const finishParts = [];
  for (const o of sim.objects) {
    if (o.position.z !== 0 || o.cls === 'player') continue;
    for (const p of o.body.parts.slice(o.body.parts.length > 1 ? 1 : 0)) {
      if (o.cls === 'finish') finishParts.push(p);
      else if (!p.isSensor) solidParts.push(p);
    }
  }
  const mark = (parts, arr) => {
    for (const p of parts) {
      const x0 = Math.max(0, Math.floor((p.bounds.min.x - minX) / cell)), x1 = Math.min(W - 1, Math.floor((p.bounds.max.x - minX) / cell));
      const y0 = Math.max(0, Math.floor((p.bounds.min.y - minY) / cell)), y1 = Math.min(H - 1, Math.floor((p.bounds.max.y - minY) / cell));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const pt = { x: minX + (x + .5) * cell, y: minY + (y + .5) * cell };
        if (Matter.Vertices.contains(p.vertices, pt)) arr[y * W + x] = 1;
      }
    }
  };
  mark(solidParts, solid); if (goalPt) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const px = minX + (x + .5) * cell, py = minY + (y + .5) * cell; if (Math.hypot(px - goalPt.x, py - goalPt.y) <= 10) goal[y * W + x] = 1; } } else mark(finishParts, goal);
  // BFS (Dijkstra-lite with 8-neighbours) from goal cells
  const dist = new Float64Array(W * H).fill(1e9);
  let frontier = [];
  for (let i = 0; i < W * H; i++) if (goal[i]) { dist[i] = 0; frontier.push(i); }
  // simple bucketed dijkstra
  const N = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
  let heap = frontier.map(i => [0, i]);
  const push = (d, i) => { heap.push([d, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break;[heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (; ;) { let l = 2 * k + 1, r = l + 1, m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break;[heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  heap.sort((a, b) => a[0] - b[0]);
  while (heap.length) {
    const [d, i] = pop(); if (d > dist[i]) continue;
    const x = i % W, y = (i / W) | 0;
    for (const [dx, dy, c] of N) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx; if (solid[j] && !goal[j]) continue;
      const nd = d + c; if (nd < dist[j]) { dist[j] = nd; push(nd, j); }
    }
  }
  const at = (px, py) => {
    const x = Math.floor((px - minX) / cell), y = Math.floor((py - minY) / cell);
    if (x < 0 || y < 0 || x >= W || y >= H) return 1e9;
    let best = dist[y * W + x];
    if (best >= 1e9) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) best = Math.min(best, dist[yy * W + xx] + 2); }
    return best * cell;
  };
  return { at, W, H, minX, minY, cell, dist, solid };
}

function keyOf(s) {
  const b = s.player.body, g = s.engine.gravity;
  const ang = ((b.angle % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  return [Math.round(b.position.x), Math.round(b.position.y), Math.round(b.velocity.x * 4), Math.round(b.velocity.y * 4), Math.round(ang * 10), Math.round(b.angularVelocity * 50), g.x, g.y, s.player.jumpReady ? 1 : 0, s.player.mode, Math.round(s.player.force.x * 1e5), Math.round(s.player.force.y * 1e5), s.player.scale.x].join(',');
}

// actions: jump-mode -> [no, jump]; control-mode -> {left,right} x jump
function actionsFor(s, t) {
  const P = s.player;
  const canJump = (P.mode === 'jump' || P.mode === 'control') && (P.jumpReady || P.jumpMode === 'unlimited');
  const js = canJump ? [false, true] : [false];
  if (P.mode === 'control') {
    const out = [];
    for (const d of [-1, 0, 1]) for (const j of js) out.push({ jump: j, left: d < 0 ? -1 : 0, right: d > 0 ? 1 : 0 });
    return out;
  }
  return js.map(j => ({ jump: j }));
}

function beamSearch(level, { W = 80, maxTicks = 1500, log = false, timeLimitMs = 120000 } = {}) {
  const root = new Sim(level);
  const grid = buildGrid(root);
  root.hist = null; // linked list of [tick, action]
  let beam = [root];
  let bestDist = Infinity;
  const t0 = Date.now();
  for (let t = 0; t < maxTicks; t++) {
    const kids = new Map();
    for (const s of beam) {
      const acts = actionsFor(s, t);
      for (let k = 0; k < acts.length; k++) {
        const a = acts[k];
        const c = k === acts.length - 1 ? s : cloneSim(s);
        const didJump = a.jump && ((c.player.jumpReady || c.player.jumpMode === 'unlimited') && (c.player.mode === 'jump' || c.player.mode === 'control'));
        c.step(a);
        const changed = didJump || (a.left !== undefined && (a.left !== s._lastL || a.right !== s._lastR));
        c.hist = (didJump || a.left || a.right) ? { t, a, prev: s.hist } : s.hist;
        if (c.finished) {
          return { ok: true, ticks: c.finishTick + 1, hist: histList(c.hist), events: c.events, grid };
        }
        if (c.dead) continue;
        const d = grid.at(c.player.body.position.x, c.player.body.position.y);
        c.score = d;
        const key = keyOf(c);
        const prev = kids.get(key);
        if (!prev || prev.score > c.score) kids.set(key, c);
      }
    }
    beam = [...kids.values()].sort((a, b) => a.score - b.score).slice(0, W);
    if (!beam.length) return { ok: false, reason: 'all dead', t, bestDist, grid };
    bestDist = Math.min(bestDist, beam[0].score);
    if (log && t % 60 === 0) console.log('t', t, 'beam', beam.length, 'best', beam[0].score.toFixed(0), 'pos', beam[0].player.body.position.x.toFixed(0), (-beam[0].player.body.position.y).toFixed(0), ((Date.now() - t0) / 1000).toFixed(1) + 's');
    if (Date.now() - t0 > timeLimitMs) return { ok: false, reason: 'timeout', t, bestDist, grid };
  }
  return { ok: false, reason: 'maxTicks', bestDist, grid };
}
function histList(h) { const out = []; while (h) { out.push({ t: h.t, ...h.a }); h = h.prev; } return out.reverse(); }

module.exports = { beamSearch, buildGrid };

if (require.main === module) {
  const n = +process.argv[2], W = +(process.argv[3] || 80);
  const r = beamSearch(loadLevel(n), { W, log: true, timeLimitMs: +(process.argv[4] || 120000) });
  console.log(JSON.stringify({ level: n, ok: r.ok, ticks: r.ticks, secs: r.ticks && (r.ticks / 60).toFixed(3), reason: r.reason, jumps: r.hist && r.hist.filter(h => h.jump).map(h => h.t), events: r.events && r.events.filter(e => e[1] !== 'jump') }));
}
