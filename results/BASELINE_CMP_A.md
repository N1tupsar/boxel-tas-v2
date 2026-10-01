# Baseline comparison (agent A): levels 3, 4, 7, 8, 9, 10
Baseline routes replayed from baselines/BASELINE_RESULTS.md loadInputs arrays with the current sim (start-jump + snap), TAS emulate, !dead required.

| level | baseline claimed | baseline replayed now | our final (results/LN.json) | verdict |
|---|---|---|---|---|
| 3 | 311 | FAIL: dies on a spike at tick 116 (valid only with SNAP=0: 311) | 328 | baseline invalid under the snap fix; ours stands (328) |
| 4 | 276 | 276 | 259 | ours faster by 17 |
| 7 | 237 | 237 | 237 | tie (same jump set) |
| 8 | 346 | 346 | 346 | tie (same jump set) |
| 9 | 349 | 349 | 337 | ours faster by 12 |
| 10 | 145 | 145 | 145 | baseline faster than our R2 (158): adopted, results/L10.json = baseline route (jumps [29,42,47,56,62,65,73,82,86,98,105,119,124,133,136]) |

Missed strategy / what differed:
- L10: our route and the baseline follow the same path (identical to tick ~48; both climb the tower by a wall-jump chain), the baseline just has better jump cadence in the ladder (ticks 96-144: baseline reaches y=551 by tick 144, ours 488 at tick 144). Not a different shortcut: our beams/refprog land in a different local basin of a chaotic ladder. Lesson: ladder timing is very basin-dependent; Go-Explore-seeded refprog gave 158, only the baseline basin gives 145.
- L3: the baseline's 311 route grazes a spike that the snapped cube dies on; hill-climb from it (1500 trials) and prefix-fixed suffix beams from T0 61/100/112 gave 420-434, no valid improvement over our 328.
- L4, L9: baseline used as refprog reference (W800, R15-30): 276-280 / 340-354, no gain over ours.
- L7, L8: same routes as baseline.
Attempts to beat the new best L10 (145): refprog (180s), suffix W1000 T0 30..110 (T0<=70 worse; 110 -> 145), 800-trial hill-climb: no gain.
