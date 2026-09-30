# Agent brief (read CLAUDE.md fully first; it is the spec)
You are agent {A|B}. Orchestrator verified: setup OK, SELFTEST OK, gravity-block handling in sim/boxel.js matches the game source
(jump/controls use engine.gravity; direction arrows rotate by arrow angle only).
Rules: work only in work/LN/ (cp -r sim work/LN; run from work/LN/sim). Do NOT commit. Never open baselines/.
Use at most 2 heavy processes at once (4 cores shared with the other agent); beam widths <= 1500 (memory, 7GB each).
Build a numeric snapshot/restore of body state first if it is not already in your copy (big speedup), unless a faster tool exists.
Write idea list to results/LN.md FIRST, then test every idea (record possible/impossible + time). Be creative (see CLAUDE.md list).
Final: results/LN.json = {"level":N,"frames":F,"jumps":[...],"tas":[...],"by":"A|B"} (emulate the tas array with sim/tas.js emulate from a fresh sim to confirm frames),
results/LN.md with route, ideas tested, methods, untried items. Also note tips touched. Skip rate.js unless time remains.
Stick to the wall-clock limit given (check `date`); stop and report then. Final reply: <=5 lines: level, frames, tips touched, best ideas, what's untried.

# Budget mode (from user)
No narration; final summaries <=3 lines; check jobs every 10 min (orchestrator 15-20); pipe output via tail -5/grep/head; don't re-read big files; batch commands; effort into search ideas.

# Standing rule (all levels, agents, rounds)
1. Never dismiss an idea by reasoning. "Impossible" only after a forced search (waypoints/targeted beam) fails; LN.md must record how it was forced.
2. Force-test on every level at least: (a) direct route to finish ignoring the intended path; (b) every surface where the cube could turn around/change direction earlier than the current route; (c) hitting key walls/pads/blocks with a corner instead of a face, at many timings; (d) extra kicks/surfing to raise speed before long stretches; (e) skipping or reusing each special block (arrows, pads, gravity, resize, checkpoints).
3. Finish every level with a brute-force +-3-frame pass around every jump of the final route.
4. Round 2 agents: re-test anything Round 1 marked "impossible" without forcing it.
Applies retroactively to level 22 in its Round 2.
