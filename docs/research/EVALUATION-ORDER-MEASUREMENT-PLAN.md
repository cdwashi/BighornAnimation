# Evaluation-order measurement plan — FROZEN 2026-08-04 (three amendments and the file-scope ruling at adjudication; POST-READ; ledger search run first; the mechanism is already located)

*The item registered by name at the M1–M3 adjudication (`EVALUATION-ORDER-ITEM.md`) and
handed its mechanism by D118: `resolveShock` sets the defender ROUTED mid-resolution
(`combat.ts:457-458`), and later same-tick bouts read the mutated field. Unusual for
this register: every prior item hypothesised about an UNLOCATED mechanism; this one
begins located. The question is therefore not WHAT — it is **whether the ordering is a
DEFECT or a DESIGN**, and this registration's job is to make both answerable. Conduct
statement (POST-READ): the drafter has read the five ruled files and the scoped
finishing region; his lean is DECLARED rather than withheld — sequencing-per-se
plausibly models a collapse cascade, while the ORDER SOURCE is plausibly unwarranted —
and the discriminators below are built to break either half of that lean.*

## The ledger search, run first — what the register rules and does not

- **D64** rules per-tick FIRE resolution as an aggregate formula — all shooters, one
  computation, casualties applied per tick. The CODE's comment (`combat.ts:512`) calls
  this "D64 simultaneous fire resolution"; **the D64 row itself never uses the word** —
  the simultaneity of fire is code-asserted and ledger-implied, a traceability note in
  the D117 family, recorded here.
- **D30** rules determinism — declared-order iteration, no key-order dependence — and is
  SILENT on semantics: it guarantees the same order every run, not that the order means
  anything.
- **D105** rules the melee bout's existence and attacker selection; **D107** rules the
  finishing predicate. NEITHER rules within-tick bout ORDERING.
- **The yield: sequential-against-a-mutating-field is UNRULED.** Fire is simultaneous by
  formula; melee mutates mid-tick; no row warrants the asymmetry, and no row forbids it.

## The candidates, registered — a design adjudication, not a discovery

- **H-DESIGN (the cascade is the model):** melee collapse within a 30-second tick is
  genuinely sequential — panic propagates; Fox's disintegration model (cited at D105 as
  corroboration) describes spreading break, not synchronized break. For this to be a
  DESIGN rather than a defense, its burden: the bout ORDER must have a temporal warrant
  — bouts should resolve in something like contact chronology, not in an accident of
  array construction.
- **H-ARTIFACT (the ordering is an iteration accident):** the model intent of the
  D64 era is per-tick simultaneity; melee should evaluate against the TICK-START field
  with mutations applied after, and the cascade is an unintended consequence of loop
  structure. Its burden: it must show the order is both arbitrary in origin AND
  load-bearing in outcome — an arbitrary order that changes nothing is a style point,
  not a defect. **Registered constraint (Amendment 3): H-ARTIFACT's intent premise
  currently rests on a CODE COMMENT citing a row that does not say it** — the D64
  traceability note above, second confirmed instance of the D117 family. E2's read must
  report whether D64's actual scope covers melee at all or only fire; if fire-only,
  H-ARTIFACT loses its warrant and the asymmetry is simply UNRULED — which strengthens
  UNDERDETERMINED rather than either candidate.
- **The admissible third outcome, registered as such: UNDERDETERMINED-PENDING-RULING.**
  If the measurements show a warranted-enough order (or an unwarranted-but-inert one),
  defect-versus-design is not a fact to discover but a design ruling for the
  adjudicator and Chuck, made on the evidence below. The item's deliverable is the
  adjudication basis, not necessarily a verdict.

## Reads this plan requires — RULED at adjudication, one amendment covering both

- **`engine/src/engagement.ts` OPENS** (5,836 bytes, previously unopened): what creates
  engagements and what determines `state.engagements` iteration order — E2's entire
  subject. Scoped to engagement creation and ordering; transitive halt rule live; first
  look recorded as a dated read.
- **`combat.ts`'s scope EXTENDS** to `resolveCombat`'s iteration structure from `:513` —
  the finishing region is open, the loop that orders it now is too. Signature-only
  beyond. Two reads, one ruling: two halts for one question would be ceremony, and the
  boundary is still crossed by ruling.

## Discriminators, with expectations stated in advance

- **E2 — the order's origin (read).** Does bout order follow contact chronology
  (engagement creation tick), or an arbitrary structural order? H-DESIGN expects
  chronology or something defensibly like it; H-ARTIFACT expects array-order accident.
- **E3 — order sensitivity, TWO ARMS (Amendment 1; throwaway-patch probes, M4
  discipline).** Arm one, the registered named permutation: REVERSE the within-tick
  bout resolution order under the same seeds. Arm two, what makes arm one's number
  interpretable: RANDOMIZE the within-tick order per tick under a fixed probe seed,
  across SEVERAL arrangements, so E3 reports a DISTRIBUTION of envelope deltas rather
  than one number — a single reversal measures the same mechanism under a different
  arbitrary order and could be one arrangement's luck. "The order is load-bearing"
  becomes a measured spread against the ~0.5 pp floor. H-ARTIFACT expects spread above
  the floor; H-DESIGN makes no magnitude prediction but requires that sensitivity, if
  present, ride a warranted order (E2). A tight near-zero spread means the order is
  INERT regardless of origin, and the item moves to UNDERDETERMINED on measurement
  rather than argument.
- **E4 — the snapshot counterfactual (throwaway-patch probe, M4 discipline).** Evaluate
  the finishing predicate (defender-already-routed AND the shelter check) against the
  TICK-START morale field — the simultaneity semantics — same seeds; measure the
  annihilation set and envelope, and specifically how much of M2's 99-versus-0
  timing fact this removes. H-ARTIFACT expects the snapshot world to be coherent and
  the committed world's in-place annihilation sequence to survive in it. **H-DESIGN's
  support is TIGHTENED (Amendment 2): degradation must appear in the specific
  historical structure the cascade is claimed to model — the named statistic,
  registered before the run: the COUNT AND TIMING of same-tick sequential
  annihilations at the Calhoun and Last Stand collapses** (the structure M2's
  99-versus-0 fact and D118's co-i-at-t1684 finding describe). A composite or envelope
  movement is REPORTED and constitutes E4 support for NEITHER hypothesis — the
  composite is a low-resolution instrument by METHODS §6's own clause, and a leg
  wobble read as a verdict on within-tick ordering semantics is a longer inferential
  distance than this register accepts.
- **E1 stands complete:** the ledger warrant search, above — no ruling either way.

## Outcome branches, registered

H-ARTIFACT is supported if E2 returns accident AND E3 returns sensitivity above noise
AND E4's snapshot world holds or improves the historical legs. H-DESIGN is supported if
E2 returns chronology AND E4's snapshot world degrades the historical legs. Every other
combination lands in UNDERDETERMINED-PENDING-RULING with the evidence tabled — an
admissible outcome, stated in advance, not a failure. Mixed outcomes nothing above
predicts: STOP, report, no interpretation. **Nothing in this plan authorises a
committed byte; E3/E4 patches live in their probes under the M4 discipline** — tree
restored under guard, byte-identity verified, no reseed, stream lineage declared.

## Bound

The item rules (or tables) the ordering semantics question. It does not reopen D118, does
not touch the five-relation inconsistency (its own registered finding), and does not
touch the −1.6879 residual. Reading order: E2, then E3, then E4; no envelope figure read
before its probe's verdict lines are written.
