# M-FLIP — the counterfactual arm (268-versus-253, §5; predictions frozen at `31c53b5`)

Run 2026-08-05 under the frozen registration (`dc39dab`) and the frozen bands
amendment. One token: `best: 268 / 52` → `best: 253 / 52`. Throwaway-patch
discipline honoured in full: EOL-aware anchor (exact-count guard), guarded restore,
rebuild, **tracked diff verified EMPTY**, no reseed, stream `68325eff` on every
figure. Probe and outputs: `.claude/us268-m-flip.mjs`, `.out.txt`, `.json`.

## The pin choreography, exactly as declared

Pin (a) assertion (3) went **RED while patched** — the named assertion, `d110-pins`
line 167, `expect(usRange.best).toBe(268 / 52)` — recorded, NOT repaired; three
sibling assertions stayed green. After the guarded restore: **GREEN**, byte-identity
verified. The second designed firing of pin (a); the pin did its job both times.

## P-A — HIT, exactly: the trajectory is invariant

Bout census: committed 120, patched 120, **removed 0, new 0 — IDENTICAL row for
row**. Application counts identical on every seed. The registered warrant held on
its primary leg: the ratio partitions a ledger; it does not size a loss.

## P-B — HIT, all bands

Pooled fire-killed delta **−78** (band [−120, −30]; expectation −69.6); fire-wounded
+78. Pooled final-killed delta **−48** (band [−85, −15]; expectation ~−45);
final-wounded +48 — the terminal conversion's erasure measured at the predicted
scale. Per-seed final-killed delta min −3, max 0 (band [−4, 0]).

## P-C — HIT on the prediction; the ARGUMENT takes a correction, reported by its author

**Exact composite equality 50/50** (verified at full precision, not display
rounding); median 54.7161 vs 54.7161, mean 52.5409 vs 52.5409 — deltas 0.0000 pp,
as registered. Per-seed US C2 leg outcomes identical: killed PASS on the same 7
seeds in both worlds, wounded FAIL 50/50 in both.

**The correction (the verifier's, against his own frozen text):** P-C's basis
claimed "no leg can cross a bound whose distance exceeds the maximum shift by a
factor of six" — a MEDIAN argument applied to a claim quantified over seeds, and
FALSE as stated: seven committed seeds sit INSIDE [235, 285], and seed 18760645's
committed killed 239 stands **4** above the low bound against a registered per-seed
shift band of [−4, 0]. A −4 draw — inside the registration's own band — would have
crossed the bound, flipped the leg, moved the envelope, and falsified P-C. The
realized shift was −2; the prediction survived by two counts, on the draw, not on
the argument. Recorded here before adjudication because a prediction that hits for
an unstated reason is the same defect class as a mechanism working by accident
(METHODS §6, which-one-specifically).

**Instrument shortfall, named:** the worker's component introspection returned no
`components` field (the score object does not expose one under that name), so
"every component identical" was not checked at component granularity. The
entailment that covers it: C1/C3/C4 read no casualty column (ruled reads + the
enumeration), so they cannot move; a C2 leg flip moves the composite by exactly
0.15/9 ≈ 1.667 pp; exact composite equality at 50/50 therefore entails C2
unchanged. Stated as an entailment, not a measurement.

## What the item now holds, for the ruling

The counterfactual is BEHAVIORALLY FREE: bit-identical trajectory, zero scoring
movement, a ledger shift of −48 killed / +48 wounded pooled that no committed
instrument reads. The census holds the substance: 68.6% fire share; the
253-population produces 99.9% of the side's casualties; the terminal conversion
erases the split on the destroyed; 268/52 mixes counting frames at the source.
The three §6 endings are all reachable; verdict lines are the adjudication's.
