# x=6624 residue measurement plan — FROZEN 2026-08-04 (three amendments and the adjudicator's registered prediction applied at adjudication; the movement implementation stays closed throughout)

*The STOP residue of D114, taken up under the discipline that ruled it: hypotheses
registered before the source opens. The question: what produces the x=6624 family —
high-frequency re-path destinations preserving one exact coordinate component of
cedar-coulee (6624,12030) while the other component is declared nowhere among the 993
audited scenario points? The family, seen: (6624,20006) ×493 events across 34 seeds,
(6624,19148), (6624,15124), and (240,12030) keeping cedar-coulee's exact y. The
temptation, named in advance and forbidden until this plan freezes: grepping the engine
source for `20006`. That answer would arrive with no registered prediction to score
against it, which is why it would be worth less than it looks. A second seduction is also
named: the dull answer just won at D114 — a coincidence dissolved into one coordinate
under two names — and that makes the dull answer FEEL due again. Feelings of dueness are
not evidence; all three hypotheses below start equal.*

## Hypotheses, registered

- **H-DECL2 (declared beyond the audit):** the undeclared components ARE declared — in
  data the D114 audit never reached. That audit walked `scenario.json` alone; the sim
  also loads the terrain directory (movement grids, bounds, dimensions, cell sizes) and
  whatever else `createSim` consumes as data. The dull answer, registered on its record,
  not its feel.
- **H-REF (computed from a fixed reference):** the destination is derived at runtime from
  a declared reference point — cedar-coulee — by a fixed transform: an offset, a
  projection, or a clamp against declared bounds, whose parameters are themselves
  declared scalars. The point is legitimately absent from all data while being fully
  determined by data. This is the family nobody wants, registered because it would
  explain an undeclared y beside a preserved x without any defect.
- **H-MIX2 (component mixing proper):** x inherited from the reference, y taken from an
  unrelated runtime quantity — another entity's coordinate, a wrongly-scoped variable —
  the defect family, back on the board at item scope after dying at world scope in D114.

## Seen versus unseen, stated — with a third class this time

**SEEN:** the four family terminals, their event counts, and their seed spreads.
**UNSEEN:** the contents of every data file outside `scenario.json` that the sim loads,
and the per-event tabulations below. **SEMI-SEEN, named honestly:** the per-event
tabulations draw on the committed Probe R1 log — data that exists in the repo and has
been displayed in fragments but never tabulated for these questions. Predictions over
semi-seen data are a weaker class than predictions over unseen data, and the ruling
weighs them accordingly; they are registered anyway because the alternative is not
registering them.

**"Unseen" here is a claim about CONDUCT, not access (Amendment 3):** the data files are
open by rule, and their contents are unseen only because nobody has read them — unlike
D114's engine source, which was closed by rule. The parties' statements, on the record at
the freeze: **the adjudicator** has not opened any terrain file and has not grepped
anything for 20006 or 6624. **The verifier** has not opened any file under
`data/terrain/`, has not grepped any source for 20006, 6624, 19148, 15124, or 240, and
notes for completeness that his instruments load the terrain data programmatically
through the public `TerrainMovementLoader` without displaying its contents. The
registration is worth what these assertions are worth, which is why they are written
down.

## Discriminators, with each hypothesis's expectation stated in advance

- **R1 — the full-surface audit (unseen).** Extend the coordinate audit to every file the
  sim loads as data: terrain movement grids, bounds, dimensions, cell sizes, elevation
  headers, and every numeric scalar in `scenario.json` (radii, ranges, speeds, times) —
  not only lat/lon pairs. H-DECL2: the family points appear WHOLE as declared values.
  H-REF: the points do not appear whole, but their offsets from cedar-coulee
  (Δy = +7976, +7118, +3094; Δx = −6384) or their absolute components (y=20006) match
  declared scalars, bounds, or dimension-times-cell-size products under ONE transform.
  H-MIX2: neither. **Registered overlap, stated:** if y=20006 exactly equals a declared
  bound, R1 alone cannot separate DECL2 from REF-as-clamp; separation then falls to R2
  and R3, and the ruling says so rather than picking.
- **R2 — constancy against geometry (semi-seen).** Per family event: destination versus
  unit position and old terminal. The family destinations are constant points (seen);
  H-DECL2 and H-REF both predict exactly that constancy. H-MIX2 with a LIVE unrelated
  y-source predicts variation across events — so R2 can KILL live-source MIX2 and is
  registered as UNABLE to kill constant-source MIX2. An instrument's blind spot named at
  registration, per the standing practice.
- **R3 — precondition coherence (semi-seen).** Which units, orders, morale states, and
  ticks produce family events, against the same tabulation for the declared retreat
  destinations (weir-point, reno-hill, last-stand-hill). H-DECL2: family destinations
  behave like the declared ones — same trigger class, interchangeable usage. H-REF:
  family events share a geometric precondition tied to the reference — they fire only
  for units whose route history touches cedar-coulee (the Custer battalion), never for
  units whose routes do not. H-MIX2: no coherent precondition. The registered check: does
  ANY family event involve a unit whose route never touched cedar-coulee? The committed
  log answers it. **Registered overlap, stated at adjudication (Amendment 1): route
  correlation does NOT separate REF from DECL2 — a declared point can be declared FOR
  those units, and a retreat destination configured for the Custer battalion produces
  exactly the correlation REF predicts. Separation falls to R3b.**
- **R3b — the generalisation test (Amendment 1; semi-seen).** REF claims a RULE —
  destinations derived from the unit's own route reference by a fixed transform — and a
  rule generalises: units whose route reference is a DIFFERENT landmark should produce
  their own family preserving THAT landmark's component. DECL2 predicts no analogous
  family exists elsewhere — a declared point is declared once, for whoever it is declared
  for. The registered check, answerable from the committed R1 log with no simulation: for
  every re-path destination in the log, does the preserved-component pattern recur
  against reference points other than cedar-coulee? Reno-battalion units producing
  destinations that preserve reno-hill's components supports REF and damages DECL2;
  cedar-coulee as the only family-spawning reference supports DECL2 and obliges REF to
  explain a rule that fires once.
- **R4 — the sibling constraint.** Whatever explains (6624,20006) must explain
  (6624,19148), (6624,15124), and (240,12030) under the SAME account. A hypothesis that
  covers only the flagship fails the item; partial coverage is reported as partial, not
  promoted. **The unifying frame is registered here in advance (Amendment 2), not
  discovered after: under a clamp account the four siblings are ONE structure — one
  component preserved, the other replaced — three preserving x with varied y, one
  preserving y with x = 240, a conspicuously small value. If R1 returns a clamp, this
  frame was predicted; noticed after the fact it would have read as a story, which is the
  shape D113's closing sentence named and D114 refused to repeat.**

**Separability check (corrected at Amendment 1):** R1 separates all three except the
stated DECL2/REF-clamp overlap; R2 separates live-source MIX2 from both; R3 separates
MIX2 from the other two and does NOT separate REF from DECL2 — the R1 overlap reappears
there, declared; **R3b is the discriminator that separates REF from DECL2**; R4
disciplines all three. No two hypotheses predict the same thing everywhere; the
registration is testable.

## Reading order, pre-committed

R1, then R2, then R3, then R3b, then R4 — the audit before the tabulations, so the
semi-seen class is read against declared facts rather than the reverse; R4 last as the
constraint that no verdict is issued on the flagship alone.

## The adjudicator's registered prediction, before R1 runs

Registered so it can miss, and specific: **y = 20006 and x = 240 are bounds-related** —
at or adjacent to the extremes of the movement grid's local extent, products of
dimension × cell size or their complements. Grounds: 240 is small enough to look like a
low-edge value rather than a battlefield coordinate, 20006 is large enough to look like
a high-edge one, and the preserved/replaced structure in R4's registered frame is what a
clamp produces. If it holds, H-REF-as-clamp is the live account, R1 alone cannot separate
it from DECL2, and the separation falls to R3b as registered. If it misses, the dull
answer is dead by the adjudicator's own prediction and H-MIX2 becomes considerably more
interesting.

## Kill-branches, registered

H-DECL2 dies if the full data surface declares none of the family points whole. H-REF
dies if no declared scalar, bound, or product reproduces the family under one transform
covering all four siblings. H-MIX2 dies if R2 shows constancy AND R3 shows a coherent
declared-parameter precondition (a defect does not respect route history), or if a single
declared transform covers the family. **All three dying is admissible** — STOP, report,
no interpretation. Any outcome nothing above predicted — STOP, report, no interpretation.

## Bound on the ruling

The item names what produces the family; it repairs nothing, reopens nothing in D114, and
does not touch the −1.6879 residual. The STEADY fix decision waits behind this ruling per
D114's queue clause. The historical reading stays out of every row, as it has twice now.

## Discipline

Probes preserved in `.claude/` with outputs; evidence-first commits; same-seed
re-simulation only if a tabulation requires it (R1–R4 as specified require NONE — the
audit reads data files, the tabulations read the committed log). **The boundary,
restated:** data files are OPEN — they are data, and R1 exists to read them; the
movement, retreat, and pathfinding implementation is CLOSED until this plan freezes by
commit, and `grep 20006` against engine source is the named violation. The first look at
the implementation after the freeze is recorded as a dated read.
