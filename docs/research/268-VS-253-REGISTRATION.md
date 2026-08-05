# 268-versus-253 — registration, DRAFT v2 2026-08-05, four adjudication amendments applied (POST-READ; the ledger search ran first; not frozen until committed on Chuck's word)

*The sixth catch (D110), carried as an open question through two rulings, arrives at the
head of the queue. The ledger search ran first, on the fourth practice, and returned the
item's entire history: the register has held every fact about this divergence except the
answer. Conduct statement (POST-READ), amended at adjudication to record TWO CROSSINGS,
both disclosed before the freeze: (1) the adjudicator's attack cited `combat-config.ts:232-233`
and `combat.ts:366` at line precision — locations outside every dated read scope, carried by
NO ledger row and NO committed artifact (verified at drafting: the only `combat.ts:36x`
citation in the ledger is D96's `:361`, `chargeBreakMargin`; the identifier
`killedToWoundedRatioBySide` appears in no committed report or doc); the attack's
attribution of the chain to D110's evidence column is CORRECTED here — D110's evidence
column names camp-defense, envelope, exam, objectives, and score lines, not this chain.
(2) The verifier's verification grep, mis-scoped repo-wide instead of docs-only, returned
eight engine-source lines at identifier granularity (`combat-config.ts:82/:232/:241/:252/:255/:259/:264`,
`combat.ts:366`), independently CONFIRMING the chain's existence: the map is built from
`range.best` at `:232` and consumed at `combat.ts:366`. No body context or arithmetic was
read in either crossing; R2's mechanism remains unread. Both crossings are recorded here
so the freeze can assign them whatever entries the register requires. Otherwise: drafted
from ruled rows, committed artifacts, and data surfaces only; file bodies open only under
§3's scoped ruling.*

## §1 — The ledger search: the trail the register already holds

**D71 (07-18):** 268 enters the register as historical-totals arithmetic anchoring
`combatFrictionFactor` 0.06. **D81 (07-22):** fire casualties split by a global [CAL]
ratio per side, sourced from "US: ~268 K / ~52 W hilltop-inclusive" — the ruling that
made 268/52 the ratio's source. **D110 (08-02), the SIXTH CATCH:** the us-7th range in
`KILLED_TO_WOUNDED_RATIO_RANGES` is MIXED-PROVENANCE across its bounds — low 235/60 and
high 285/45 are cross-products of the summed per-company `calibration.casualties` table
(side-scoped sums K 235/253/285, W 45/52/60, integer-recovered), while best's numerator
268 is the M5-SPEC hilltop-inclusive figure and appears nowhere in the scenario, eight
characters from the 253 the table sums to. Pin (a) assertion (3) froze 268/52 as a
DECLARED EXCEPTION: silently reconciling turns CI red and requires an argument.
**D112 (08-02), measured:** `sideBand` never returns `best`; scoring tests only
`actual >= low && actual <= high` — the divergence CANNOT reach the grading key, and it
DOES reach the engine (`combat-config.ts:231` consumes `range.best`). The structural
half closed by measurement (an explicit us-7th `sideCasualties` entry moves no leg; none
was added); the behavioral half — which numerator the engine RUNS — was queued, and is
this item. **PR-65:** the pin's wiring test fired and re-pinned; the us-7th assertions
untouched throughout.

**The research decomposition (docs/research/little-bighorn-research.md:309; O5 citation
verification), stated which-one-specifically because four numbers have four referents:**
**258** = 16 officers + 242 troopers killed or died of wounds; **263** = the 1881
monument's inscribed names; **268** = 263 + 5 enlisted died-of-wounds evacuees — the
"total dead including scouts and civilians"; **253** = the scenario's own per-company
killed-best sum. The wounded figure 52 counts 1 officer + 51 troopers; Scott et al. (via
secondary channels, p. 244) pair 268 with 55 wounded. **So 268/52 mixes counting frames
at the source level** — a scouts-and-civilians-inclusive numerator over an
officers-and-troopers-only denominator — before the scenario is even consulted.

**Committed-artifact facts verified at drafting (2026-08-05):** the committed D112
campaign rows carry `renoKilled` and coalition K/W only — NO per-seed US killed or
wounded totals exist in any committed campaign artifact (the `us-7th` strings in
`d112-campaign-results.json` are annihilation-row side labels). The coverage leg
therefore needs a probe; nothing can be sized from the shelf.

## §2 — The question, decomposed; the burden inherited

- **Q-POP (population):** which units constitute side `us-7th-cavalry` in the scenario,
  and which of them appear in `calibration.casualties`? What population does 253 sum
  over; what population does 268 count? The difference list — who is in the model but
  not the table, who is in 268 but not the model (staff, civilians, Arikara scouts if
  side-assigned here) — is the item's evidentiary core, and it is answerable from data
  surfaces alone. **Q-POP reports the population lists, not a verdict** (adjudication
  requirement): names in both difference directions, no conclusion about which numerator
  is correct — the THIRD-NUMBER-BY-CENSUS outcome exists precisely because the census
  might name a population matching neither figure, and a census that reports a verdict
  cannot reach it.
- **Q-MECH (mechanism):** what precisely consumes `range.best`, by what arithmetic does
  it split casualties, and does anything else consume `best` (or the range) behaviorally?
  Attested at line-number granularity only (the ruled rows' `:231`; the two disclosed
  crossings' `:232`/`:366`); unread. §3's scoped read answers it.
- **Q-BEHAVE (consequence):** what does the committed world's US casualty production
  look like (M-COVER), and what moves if 253 replaces 268 (M-FLIP)?

**The burden:** pin (a) assertion (3)'s comment demanded that anyone reconciling 268 to
253 argue for it in the open. This registration IS that argument surface, arriving
non-silently. Whatever is ruled, the exception comment, the pin value, and the config
byte move TOGETHER in a future frozen WO, or not at all — no in-item repair.

## §3 — The scoped source-read ruling (Amendment 1: TWO regions, ONE ruling; opens only on the freeze)

Adjudication found the drafted file-internal scope could not answer R2 — the ratio map
is CONFIG (`combat-config.ts` builds `killedToWoundedRatioBySide` from `range.best`);
the split that consumes it lives in `combat.ts`, in a region belonging to neither of
that file's two prior scoped reads (`:395-518`, `:513-577`). So the read would have
halted on its first substantive step. Per the E2 precedent (one ruling naming
`engagement.ts` whole plus the `combat.ts` loop extension), this ruling names BOTH
regions at the freeze: **(i)** `combat-config.ts`, scoped to the
`KILLED_TO_WOUNDED_RATIO_RANGES` declaration and every within-file consumer of the
range; **(ii)** `combat.ts`, scoped to the casualty-split consumption of
`killedToWoundedRatioBySide` (the `:366` region and its enclosing split routine).
Three questions with meanings in advance: **R1** — the call sites: what consumes
`range.best` and the map built from it, listed exhaustively within scope; **R2** — the
split arithmetic: per-event or aggregate, share-form or otherwise, rounding rule,
interaction with D26 integer construction; **R3** — other consumers: does `best` (or
low/high, or the map) feed anything beyond the killed/wounded split. **Transitive
halt:** any consumption path leaving the casualty-split machinery halts the read for
ruling rather than being followed; boundary crossings signature-only. The read is
logged dated in SOURCE-READ-LOG.md before any probe runs.

## §4 — M-COVER, the exposure census (X2 before X1 — coverage before flips)

Read-only probe, current stream `68325eff`, the committed 50 seeds, no patch: per-seed
US killed and wounded actuals; the count of split applications and their per-application
magnitudes as the mechanism exposes them (if sizing per-application requires
instrumentation, it runs under throwaway-patch discipline, declared in the probe).
Alongside it, the Q-POP census from `scenario.json` (data surface, open by rule),
reported as lists per §2's requirement. **Output: the exposure sized and the populations
named before any flip is computed** — D120's X2-before-X1 credit is the precedent; a
one-row reach kills a design before a flip census is ever paid for.

## §5 — M-FLIP, the counterfactual arm (conditional on §3+§4; predictions completed by dated amendment before it runs)

Throwaway patch, ONE token: the us-7th best numerator 268 → 253; nothing else moves.
N=50 envelope plus the annihilation-bout census row-for-row against the committed 120;
no reseed; tree restored under guard; byte-identity VERIFIED; stream lineage on every
figure.

**The pin fires by construction (Amendment 3, declared in advance):** the patched tree
falsifies pin (a) assertion (3), which pins the literal `268/52` as a declared
exception. The probe runs against a KNOWN-RED suite and records the red as EXPECTED,
with the assertion named. The pin is NOT updated — no ruling licenses it; this is a
measurement, not a payload change (WO-D111 Amendment 2's class: a payload pin updates
only when a ruling changes the datum). The guarded restore returns file and pin to
green, and the restore log records both. This is the second time pin (a) fires as
designed, and the firing is the pin doing its job.

**Direction, registered CONDITIONALLY (Amendment 2):** *IF R2 returns a share-form
mechanism* — the ratio consumed as killed share R/(R+1) — *then* killed share falls
0.83750 → 0.82951, about 0.80 pp of US casualties reassigned killed→wounded,
wounded-ward, US side only, marginally more US units alive but degraded. The
arithmetic presupposes the mechanism, and nobody has read the mechanism: if the split
is not share-form (a divisor, a cap, a per-event draw), the direction could be
different or nil, and a wrong direction under a wrong premise reads as a WRONG
PREMISE, not a wrong prediction. **The unconditional direction registers with the
bands, after §3 returns.**

**The bands gate (Amendment 4):** the dated amendment completing §5's prediction bands
commits BEFORE M-FLIP runs, may be informed by Q-POP, §3's read, and M-COVER — **and
by NO patched-world figure.** D118 measured "small perturbation, envelope moves
little" FALSE by a wide margin; D112's near-miss was exactly a verifier's "≈
noise-only" claim killed by measuring first; and the deferral's precedent is D112's
bands-by-amendment (`50f83da` + `993cf96`).

## §6 — Outcomes and bound

Three ruled endings, any of which this item may reach: **RUN-253** (the engine describes
the modeled population; the scenario-consistent numerator); **KEEP-268** (the declared
exception re-argued and re-documented with its provenance stated in the comment); or
**THIRD-NUMBER-BY-CENSUS** (Q-POP shows the modeled side matches neither figure — the
numerator is then whatever the census names, argued from the population list). Under
every ending: the grading key is untouched by construction (D112: `sideBand` never
returns `best`); any byte change is a FUTURE FROZEN WO moving value, pin, and comment
together, CI-visible; the −1.6879 residual, the three standing findings, and the
checkpoint-scan exposure are untouched. **Reading order: Q-POP, §3's read, M-COVER,
the dated amendment completing §5's bands, then M-FLIP; no verdict before its probe's
lines are written.**
