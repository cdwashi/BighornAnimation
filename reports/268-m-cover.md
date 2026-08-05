# M-COVER — the exposure census, VALIDATED (268-versus-253, §4; stream `68325eff`)

Run 2026-08-05 under the frozen registration (`dc39dab`), after Q-POP and the §3
two-region read, per the frozen reading order. Read-only, no patch, no reseed; the 50
committed seeds read from the committed results file; full-day t0..2160. Probe and
outputs: `.claude/us268-m-cover.mjs`, `.claude/us268-m-cover.out.txt`,
`.claude/us268-m-cover.json` (per-unit finals included).

## Validity

**50/50 MATCH** on the corrected leg: per-seed co-a/co-g/co-m killed equals the
committed rows' `renoKilled` on every seed — the committed definition, verified in the
committed instruments. **Run 1's leg was wrong and caught itself:** it compared a
SEVEN-company Reno-Benteen sum against the three-company committed column — a label
assumption made without checking the committed instrument's definition (the
verifier's, named) — and refused to validate at 38/50. Output preserved at
`.claude/us268-m-cover.run1-labelerror.out.txt`; dated correction in the probe header.
Every census figure below reproduced identically across both runs (deterministic
world, untouched); only the cross-check column changed.

## The census (distributions over 50 seeds; median = floor-quantile, the registered convention)

| quantity | median | mean | min | max |
|---|---:|---:|---:|---:|
| US final killed | 210 | 213.30 | 168 | 324 |
| US final wounded | 19 | 18.50 | 3 | 35 |
| US fire-path killed (casualty-resolution events) | 143 | 146.38 | 81 | 217 |
| US fire-path wounded | 28 | 27.94 | 14 | 38 |
| US non-fire killed (final − fire events) | 63 | 66.92 | 37 | 123 |
| split applications per seed | 98 | 100.20 | 71 | 142 |
| Custer-wing killed | 183 | 172.88 | 123 | 200 |
| Custer-wing wounded | 14 | 13.34 | 0 | 27 |
| Reno-Benteen (7 co.) killed | 31 | 40.16 | 21 | 130 |
| Reno-Benteen wounded | 5 | 5.08 | 0 | 11 |
| non-company killed | 0 | 0.26 | 0 | 6 |
| non-company wounded | 0 | 0.08 | 0 | 2 |

**The fire share — the number the ruling turns on: 68.6%** of pooled US killed (7,319
of 10,665) flows through the ratio's one call site; 31.4% is non-fire accounting.
Custer wing carries 81.1% of all US killed; Reno-Benteen 18.8%; **the four
Q-POP-uncovered units carry 0.1%** (13 killed pooled) — structurally on the side,
behaviorally invisible.

**Per-application magnitudes:** dominated by 1 (3,433 of 5,010 pooled applications);
tail to 16. The split binds ~98 times a seed at small integers.

## The terminal-conversion identity (measured, then confirmed at identifier level)

Pooled fire wounded 1,397 vs final wounded 925: deficit **472** — exactly the non-fire
killed that `unit-destroyed` events don't carry (3,346 − 2,874 = 472). **At
destruction, accumulated wounded convert to killed.** Mechanism confirmed by disclosed
grep at identifier level: `combat.ts:461-463` (`defender.killed += defender.wounded;
defender.wounded = 0`), consistent with D81's "terminal accounting differs."
**Consequence for the item: for units that end DESTROYED, final killed = total
casualties + terminal strength regardless of the split — the ratio's final-state
effect exists ONLY on surviving units.**

## The reader enumeration (provenance per the fifth practice)

Readers of `unit.killed`/`unit.wounded` in `engine/src` — **provenance: disclosed
grep, identifier level, this census:** the split writes (`combat.ts:370-371`); the
destruction conversion (`combat.ts:461-463`) and terminal-killed writes
(`combat.ts:469,478`; `morale.ts:211,220`) — ledger-to-ledger, at or after
destruction; envelope REPORT columns (`envelope.ts:35-53,115-120` — ford-choke
tallies from events, `arikaraKilled/Wounded`); `baseline-selection.ts:23,45` — the
D80 typical-seed selection criteria read ford-choke killed+wounded (selection-level,
not trajectory-level); declaration/init (`state.ts`). **No movement, morale, combat,
or pathing decision reads either column.**

Scoring — **provenance: an UNRULED READ, confessed:** the verifier opened
`score.ts:190-249` without a scoped-read ruling (the item's third crossing, the
verifier's second; the corpse-drift precedent shows the right order and it was not
followed). What it established, used under that confession: `sideBand` falls back to
summed per-company bands where `sideCasualties` lacks a side entry, so C2 carries
`us-7th:killed` against [235, 285] and `us-7th:wounded` against [45, 60], actuals =
side-aggregated `unit[column]` (`score.ts:211-247`); C2's nine legs = four
side-column bands plus five flagship end-states (`score.ts:267`). Against the census
actuals (killed median 210, wounded median 19), **both US legs already FAIL LOW in
the committed world on the typical seed** — which closes an internal consistency
check: coalition killed PASS + coalition wounded FAIL (the 160 equality) + both US
legs FAIL + five flagship = 6/9 = 0.6667, the committed C2 median exactly.

## Census texture, recorded without interpretation

The committed world's US killed (median 210) sits BELOW the per-company low sum 235,
and its US wounded (median 19) far below the [45, 60] band — the model under-kills
and under-wounds the US side against its own per-company table, the wounded partly by
terminal conversion. Recorded as census fact for whatever future item owns it; not
this item's question.
