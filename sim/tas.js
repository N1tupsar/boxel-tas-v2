const { Sim, loadLevel } = require('./boxel');

// jump ticks (sim step index where jump is applied before the step) -> TAS array
// TAS frame F (F-th afterUpdate after pressing t) applies before step F.
function toTas(jumps) {
  const js = [...new Set(jumps)].sort((a, b) => a - b);
  const out = []; let last = 1; // frame 1 is the first frame inputs are consumed
  if (js[0] === 0) { out.push('j0'); js.shift(); } // tick-0 jump: patch jumps right after restoring the start state
  js.forEach((t, i) => {
    if (t < 1) throw new Error('negative jump tick');
    const wait = i === 0 ? t - 1 : t - last;
    if (wait > 0) out.push(wait);
    out.push('j'); last = t;
  });
  return out;
}

// Faithful copy of the TAS mod's consumeInputs (jump-only subset)
function emulate(level, inputs, maxTicks = 4000) {
  const temp = [...inputs];
  const s = new Sim(level);
  let pendingJump = false; const jumped = [];
  if (temp[0] === 'j0') { temp.shift(); pendingJump = true; } // jump before step 0
  while (s.tick < maxTicks && !s.finished && !s.dead) {
    if (pendingJump) jumped.push(s.tick);
    s.step({ jump: pendingJump }); pendingJump = false;
    // afterUpdate -> TAS frame
    if (temp.length === 0) continue;
    for (let i = 0; i < 4; i++) {
      if (temp.length === 0) break;
      const next = temp[0];
      if (typeof next === 'number') {
        if (next === 0) { temp.splice(0, 1); continue; }
        temp[0]--; break;
      }
      temp.splice(0, 1);
      if (next === 'j') pendingJump = true;
    }
  }
  return { finished: s.finished, ticks: s.finished ? s.finishTick + 1 : null, dead: s.dead, jumped };
}

module.exports = { toTas, emulate };
