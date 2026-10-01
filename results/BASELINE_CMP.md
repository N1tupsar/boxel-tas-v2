# Baseline comparison (current sim: j0/p0/snap)
| level | ours (results) | baseline replayed in current sim |
|---|---|---|
| 1 | 214 | 214 |
| 2 | 189 | 189 |
| 5 | 266 | 267 |
| 6 | 236 | 253 |
| 11 | 197 | 199 |
| 12 | 245 | 254 |
| 13 | 288 | 287 |
| 14 | 279 | 279 |
| 15 | 390 | 390 |
| 16 | 204 | 214 |
| 18 | 276 | 276 |
| 19 | 223 | 238 |
| 20 | 510 | 414 |

Baseline faster (before Round 3 action): L13 (287 vs ours 288), L20 (414 vs ours 510). Results JSON for L13 and L20 were replaced by the baseline routes (verified, strictly better). Everywhere else ours <= baseline: L1,2,14,15,18 tie; L5 -1; L6 -17; L11 -2; L12 -9; L16 -10; L19 -15.
Seeding refprog (REF=baseline, T0=0) on L6, L12, L11, L19: 255/226/204 or fail, no improvement over ours.
