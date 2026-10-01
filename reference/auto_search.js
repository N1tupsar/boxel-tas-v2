// In-game route hill-climber. Paste AFTER the TAS mod and deterministic_patch.js, with the level open.
// Uses the real game as the physics oracle (the patched game replays identically), so it works even
// where the simulator can't (level 17's loose-pad pile). Keep this tab visible/focused while it runs.
// Stop it with:  window.__stop = true     Best route so far: window.__bestTas
(async function () {
  const BASE = window.__BASE || [53,125,202,217,223,259,290,335,339,344,348,355,363,368,372,376,377,378,382,383,384];
  const FROM = window.__FROM || 280;        // only jumps at or after this tick are perturbed
  const MAXFRAMES = window.__MAXFRAMES || 520;
  const FIN = { x: 1800, y: -40, hw: 80 };  // finish centre / half width, in the patch's (y-down) coordinates
  const toTas = (j) => { const out = []; let last = 1; j.forEach((t, i) => { const w = i === 0 ? t - 1 : t - last; if (w > 0) out.push(w); out.push('j'); last = t; }); return out; };
  let finished = false, died = false, started = false;
  window.addEventListener('levelFinish', () => { if (started) finished = true; });
  window.addEventListener('playerRespawn', () => { if (started && window.__log.length > 5) died = true; });
  const runOnce = (jumps) => new Promise((resolve) => {
    const oldRef = window.__log; started = false; finished = false; died = false;
    window.loadInputs(toTas(jumps));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
    let seen = 0, best = 1e9; const t0 = performance.now();
    const poll = () => {
      const log = window.__log;
      if (!started) { if (log !== oldRef) { started = true; seen = 0; } else if (performance.now() - t0 > 5000) return resolve({ finished: false, frames: 0, best: 1e9 }); }
      if (started) {
        let fell = false;
        for (; seen < log.length; seen++) {
          const x = log[seen][0], y = log[seen][1];
          const d = Math.hypot(Math.max(0, Math.abs(x - FIN.x) - FIN.hw), y - FIN.y); if (d < best) best = d;
          if (y > 1000) fell = true;
        }
        if (finished) return resolve({ finished: true, frames: log.length, best: 0 });
        if (fell || died || log.length > MAXFRAMES) return resolve({ finished: false, frames: log.length, best });
      }
      setTimeout(poll, 4);
    };
    setTimeout(poll, 30);
  });
  const better = (a, b) => a.finished ? (!b.finished || a.frames < b.frames) : (!b.finished && a.best < b.best);
  const fmt = (r) => r.finished ? 'FINISHED in ' + r.frames + ' frames' : 'best distance to finish ' + r.best.toFixed(1) + 'px';
  let cur = BASE.slice(), curRes = await runOnce(cur);
  console.log('[search] start:', fmt(curRes));
  window.__bestTas = toTas(cur);
  const tried = new Set([cur.join(',')]); let n = 0;
  while (!window.__stop && n < (window.__MAXITER || 400)) {
    const cand = cur.slice(), k = Math.random() < 0.3 ? 2 : 1;
    for (let m = 0; m < k; m++) {
      const idxs = cand.map((t, i) => i).filter((i) => cand[i] >= FROM);
      const i = idxs[Math.floor(Math.random() * idxs.length)];
      cand[i] += (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.3 ? 2 : 1);
    }
    let ok = cand[0] >= 1; for (let i = 1; i < cand.length; i++) if (cand[i] <= cand[i - 1]) ok = false;
    const key = cand.join(','); if (!ok || tried.has(key)) continue;
    tried.add(key); n++;
    await new Promise((r) => setTimeout(r, 200));
    const res = await runOnce(cand);
    if (better(res, curRes)) {
      cur = cand; curRes = res; window.__bestTas = toTas(cur);
      console.log('[search] #' + n + ' improved:', fmt(res), '\nloadInputs(' + JSON.stringify(window.__bestTas) + ')');
      if (res.finished && !window.__keepGoing) { console.log('[search] finished the level - keep going for a faster time with window.__keepGoing=true and re-running'); break; }
    } else if (n % 10 === 0) console.log('[search] #' + n + ' no better yet (' + fmt(curRes) + ')');
  }
  console.log('[search] done. Best:', fmt(curRes), '\nloadInputs(' + JSON.stringify(window.__bestTas) + ')');
})();
