# Boxel 3D TAS v2: truly optimal routes for campaign levels 1–30

Read this whole file before starting.

## The goal
For every campaign level 1–30 **except 17**, find the **truly optimal, unbeatable** input
sequence in **theory mode** (deterministic, see below), delivered as a `loadInputs([...])`
array for Charlieee1's TAS mod. "Good" isn't enough. Assume a faster route exists until you
have exhausted every idea. Reliability doesn't matter in theory mode.

## Be creative (this matters more than anything else)
Earlier attempts found good routes, but they missed strategies. Think like a top speedrunner
who knows the engine's physics code. Before and during the search, brainstorm widely, then
**test every idea explicitly** (force it with waypoints or a targeted search) and record
whether it works. Idea families to consider on every level (not exhaustive, invent more):
- Skipping sections entirely: loops, detours, "intended" paths. Going under, over, around or
  behind structures. Leaving the visible level area and coming back.
- Entering the finish from any side (it triggers on touch from any direction).
- Jump refills from ANY contact: walls, ceilings, undersides, and **sensor blocks** (tips,
  checkpoints, arrows, resize, gravity blocks all re-arm the jump on contact).
- Ceiling surfing (jumping into sloped undersides turns the jump into sideways speed),
  corner kicks (jumping into block corners), wall-jump chains, bonk chains.
- Bounce pads used unconventionally: from the side, at odd angles, twice, not at all.
- Direction arrows: their push only applies below speed 4. Exceed it with kicks and
  slopes; skip arrows; use them in reverse.
- Gravity blocks: jumps and arrows rotate with gravity. Where can a gravity change be
  exploited or skipped?
- Rotation/spin: the cube is a rotating square; corners landing or levering off edges change
  speed and direction.
- Resize blocks: a different size may fit gaps or change collisions; the cube may be able to
  avoid or reuse them.
- Engine quirks: Matter.js has no continuous collision detection, so at high speed a body can
  tunnel through thin geometry. Also contact resolution pushes and velocity kept along
  frictionless surfaces. Loose (non-static) objects can be pushed, ridden or used as
  platforms.
- The TAS supports `"c"` (respawn at checkpoint) and holding inputs; think about whether
  anything like that could ever help.

## Blind re-examination of levels 1–16, 18–20
Earlier routes exist for these levels, but they're **sealed in `baselines/`**. Don't open
anything there for a level until your own search on that level is finished and you are
confident it's optimal. Then compare: if the baseline is faster, work out *why* (what
strategy you missed), learn from it, and try to beat it. Report both numbers.

## Theory mode (the only mode for searching)
The user runs routes in the real game with `reference/deterministic_patch.js`, which pins
the player's rendered transform to render-alpha 0.5, restores an exact snapshot of every body
on each TAS start, snaps the player to an exact fresh-cube state, clears the collision
caches, and stops fallen objects from being deleted. The simulator matches this by default:
`new Sim(level)` uses alpha 0.5 and the level-load reset pass. This was verified in-game
(levels 14 and 19 replayed exactly). **Always search and verify in this default mode.**

## Setup
```
./setup.sh                  # matter-js 0.19.0 + lodash (falls back to vendor/ copies)
cd sim && node selftest.js  # must print SELFTEST OK
```
`render.py` needs Pillow (`pip install pillow`); otherwise make an SVG renderer or read the
JSON directly.

## Two competing agents, swapping levels (budget)
The user has about **$78** of credit. One agent costs roughly **$2.2 per hour** of activity.
Structure (you are the **orchestrator**; you mostly sleep and coordinate):
- First do Setup and verify gravity blocks (below) yourself.
- Run **exactly 2 agents at a time** (call them A and B). Work through the levels in pairs,
  e.g. (1,2), (3,4), … Suggested order: 21–30 first (no routes exist yet), then 1–16, 18–20.
  Level 17 is excluded.
- **Round 1 (blind, ~35 min each):** A takes level X, B takes level Y. Full workflow.
- **Round 2 (the fight, ~25 min each):** they swap. A attacks Y, B attacks X. First read the
  other agent's `results/LN.md` (idea list and results) so you don't repeat work, then go
  after everything **not** tried and try to beat the time. The faster verified route stays
  as `results/LN.json`, and both agents' notes go into `results/LN.md`.
- **Round 3 (levels ≤ 20 only, ~15 min, only if needed):** open `baselines/` for that level.
  If the sealed baseline is faster than both agents, the free agent works out why (what
  strategy was missed), records it, and tries to beat the baseline.
- Budget: about 1 agent-hour per level, which is ~$65 for 29 levels. Track the estimated spend
  (agent-hours × $2.2 + your own time). Stop starting new rounds around ~$70 and commit.
  If time is short, skip Round 2 on levels where Round 1 converged strongly (several
  independent methods agree and every idea on the list was tested).
- Both agents share one machine: check `nproc` and give each agent half of the heavy-job
  slots.
- Agent rules:
  - Work only in `work/LN/` (first `cp -r sim work/LN`, then run tools from
    `work/LN/sim`) so agents never overwrite each other's files.
  - Write findings to `results/LN.md` and the route to `results/LN.json`
    (`{"level":N,"frames":F,"jumps":[...],"tas":[...],"by":"A"}`); in Round 2, only replace
    the JSON if your verified time is strictly better.
  - Launch long searches in the background (`nohup … &`), check back with 5–10 minute
    sleeps and short `tail`s. Keep outputs small. Don't commit.
- After each pair of levels, the orchestrator verifies both `results/LN.json` (emulate from
  a fresh sim), updates `results/RESULTS.md` (who found the winning route, whether the
  swap improved it) and commits + pushes.
- Keep messages to the user short. If you notice you're running low on budget, commit
  results before anything else.

## Mechanics (verified against the game's source: reference/game_source_excerpts.js)
- Matter.js 0.19.0, fixed step `Engine.update(engine, 1000/60)`, gravity scale 0.001. Player
  16×16, friction 0, frictionAir 0. Horizontal speed is conserved in the air and on flat
  ground.
- **Jump:** zeroes velocity along gravity, keeps the perpendicular component, adds
  0.025·mass·g (≈6.67 px/frame). Spin ±π/20 if speed ≥ 1.
- **Jump re-arm:** ANY collisionStart involving the player, including sensors.
- **Bounce pads:** speed = pad scale.y/2; direction = incoming direction reflected about the
  pad normal.
- **Direction arrows:** constant force 25e-5·mass rotated by the arrow angle, only while
  speed < 4.
- **Gravity blocks** (levels 21–25, 28): `app.updateGravity(block.body.angle)` via
  `util.getVectorFromAngle`. **Orchestrator: verify `sim/boxel.js`'s gravity handling,
  including how jump and arrows rotate with gravity, against the excerpt before wave 1.**
- **Resize:** restores the body angle from the rendered rotation (alpha 0.5 in theory mode).
- **Spikes:** kill sensor only on the spike's top face (rotates with the spike).
- **Tips** pause the game (the user clicks Continue); count how many a route touches.

## The TAS tool
TAS frame F acts before simulator step F. Array format `[wait, "j", gap, "j", ...]`: a
leading N means the first jump is on frame N+1. `sim/tas.js` has `toTas(jumpTicks)` and
`emulate(level, tasArray)` (an exact replica of the mod, whose source is in
reference/tas_mod.js). **Always emulate the final array.**

## Tools (in `sim/`)
| Tool | Use |
|---|---|
| `boxel.js` | Simulator: `Sim`, `loadLevel`, `cloneSim`. |
| `search2.js N W T` | Beam search. Env `TIME=k` (score = dist/speed, try 4–8), `LA=k` lookahead, `LOG=1`. Waypoints via the `WAYPOINTS` table. |
| `suffix.js N T0 W TMIN` | Fix best.json's jumps before tick T0, then a wide beam for the rest. The strongest polisher; sweep T0 across the level. TMIN 1000 = plain distance scoring (use when time scoring misleads). |
| `improve.js N W iters` | Reference-guided beam from best.json (env `MINRATE=0`). |
| `explore.js`, `ge_save.js N seed ms`, `explore_improve.js` | Go-Explore: creative route discovery. Use many seeds. |
| `multibeam.js` | Beam with waypoints (`WPS='[[x,y,r],...]'`, game coords) and prefix fixing (`T0`); `ALPHAS=0.5 LAMBDA=0` = single-sim. Best way to **force** a shortcut idea. |
| `robref.js` / `robref2.js` | Local jump-timing hill climbing (make the cost a single clean sim). |
| `tas.js` | `toTas`, `emulate`. |
| `rate.js N '[ticks]'` | Estimated success rate in the **unpatched** game (random restart noise + render timing). Use only for the final report. |

Speed: `cloneSim` costs ~3 ms. A numeric snapshot/restore of body state (~25 µs) was built
before and gave >100× faster beams and Go-Explore. **Building it first is worth it.** Watch
memory: beam widths of 1500–3000 were OOM-killed on a 16 GB box.

## Per-level workflow
1. Inspect the layout (render + JSON). Brainstorm every strategy from "Be creative" and new
   ones specific to this level. Write the list to `results/LN.md` first.
2. Broad search: time-scored and plain beams, lookahead, several Go-Explore seeds.
3. Test each idea explicitly (waypoints, forced searches). Record possible/impossible and
   the best time for each.
4. Trace the best route (position/velocity every ~10 ticks, jumps, events) to find where time
   is lost; generate new ideas from that.
5. Polish: `improve.js`, then `suffix.js` from many T0 values with W 1500–3000 and several
   TMIN values; brute-force short windows. Done only when independent methods agree and the
   idea list is exhausted.
6. Levels ≤ 20: the baseline comparison happens in Round 3 (see above), never before.
7. Emulate the TAS array, run `rate.js` for the base-game estimate, write `results/LN.md`
   and `results/LN.json`.

## Deliverables
- `results/RESULTS.md`: per level: frames, seconds, `loadInputs` array, tips touched,
  base-game success estimate, one-line route summary, baseline comparison; plus the total.
- `results/LN.md`: route description, ideas tested (possible/impossible, times), methods and
  seeds, anything left untried.
- Final message to the user: the table and total, briefly.
