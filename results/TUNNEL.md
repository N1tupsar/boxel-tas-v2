# Tunnelling study (agent A, work/tunnel/)
## Threshold (measured, sim = Matter 0.19, no CCD)
Test (work/tunnel/sim/ttest.js): cube (16x16) launched horizontally at the 16-px-wide static wall of L13 (x=-168), gravity off, 8 sub-pixel phases per speed.
Result: speed <=20 px/f never passes; 22-30 px/f passes only for some phases (phase-dependent: 22:2/8, 24:3/8, 26:3/8, 28:1/8, 30:0/8); >=32 px/f passes for most phases, >=38 for all phases. So tunnelling a 16-wide wall needs ~22+ px/frame along the wall normal (jump timing can set the phase).
## Per-level thin statics and speeds (stored routes)
Thin = any static non-sensor part whose smallest width <= 20 px (almost every wall is 16; L29 has 6-px pieces). vmax = max speed of the stored best route.

| level | thin parts | min width | vmax of stored route | at tick | frames |
|---|---|---|---|---|---|
| 1 | 30 | 16 | 12.8 | 167 | 214 |
| 2 | 14 | 16 | 15.3 | 180 | 189 |
| 3 | 13 | 16 | 9.4 | 306 | 328 |
| 4 | 10 | 16 | 7.8 | 206 | 276 |
| 5 | 28 | 16 | 13.3 | 238 | 266 |
| 6 | 39 | 16 | 12.7 | 235 | 236 |
| 7 | 42 | 16 | 11 | 206 | 237 |
| 8 | 0 | None | 17.1 | 320 | 346 |
| 9 | 24 | 16 | 13.3 | 200 | 341 |
| 10 | 1 | 16 | 8.9 | 46 | 176 |
| 11 | 5 | 16 | 17.7 | 59 | 197 |
| 12 | 3 | 16 | 13.8 | 244 | 245 |
| 13 | 35 | 16 | 24 | 192 | 288 |
| 14 | 33 | 16 | 13 | 258 | 279 |
| 15 | 26 | 16 | 13.4 | 381 | 390 |
| 16 | 19 | 16 | 9.9 | 196 | 211 |
| 18 | 80 | 16 | 18.6 | 215 | 276 |
| 19 | 26 | 16 | 19.1 | 222 | 223 |
| 20 | 48 | 16 | 22.5 | 141 | 510 |
| 21 | 31 | 16 | 12.6 | 276 | 479 |
| 22 | 44 | 16 | 9 | 75 | 134 |
| 23 | 35 | 16 | 16.2 | 370 | 380 |
| 24 | 118 | 16 | 14 | 155 | 255 |
| 25 | 33 | 16 | 6.7 | 50 | 44 |
| 26 | 75 | 16 | 9.8 | 399 | 585 |
| 27 | 63 | 16 | 8.4 | 97 | 121 |
| 28 | 19 | 16 | 11.6 | 449 | 478 |
| 29 | 37 | 6 | 12.2 | 570 | 642 |
| 30 | 17 | 16 | 16.6 | 216 | 258 |

Stored routes only exceed 22 px/f on L13 (24, bounce pad launch) and L20 (22.5); none of these hits are normal to a shortcut wall. Pure max-speed beam (work/tunnel/sim/speedbeam.js, W300, 40 s) reaches ~25-28 px/f on L1,2,4,6,7,8 but only by falling into the kill zone (y ~ 1000), i.e. not near a useful wall; L3/L5 stay at 6.7 (jump cap, no drop).
## Forced attempts (multibeam, WPS in game coords, ALPHAS=0.5 LAMBDA=0)
Euclid-guided = single waypoint on the finish (score ignores walls so the beam is attracted straight through them), W400, 80 s cap, TMIN 1000 / 4:
- L30: 300 / 297 (stored 271): no shortcut. L2: 194 / dead (stored 189). L5: dead / 275 (stored 267). L20: dead / dead (stored 510 route not reproduced). L13 and L23: no result in 80 s.
L13 (finish is 50 px left of the start behind a 16-wide, 512-long wall at x=-168; the pad at (-207,-32) launches at 24 px/f): forced pad route [[-152,150],[-200,60],[-200,615]] and [[-60,250,80],[-200,70],[-200,615]] (W500, TMIN 4 and 1000, 400 s cap): never finished (maxTicks): a straight-up pad shot needs vx~0 at the pad, which no beam reached. Stored route (288) uses the pad diagonally then a long loop.
## Verdict
No tunnelling route found, no results/LN.json changed. Only L13/L20 reach the ~22 px/f threshold at all; the geometry that would matter (L13 wall next to the finish, thick-enough approach run) lacks a run-up with horizontal speed toward the wall. Untried: targeted L13 search maximising -x speed at the wall top (y~-600) via the far-left pads (-887,-102),(-913,-308); L20 walls at its 22 px/f point; wall-grazing with corner contacts.
