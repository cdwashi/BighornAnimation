# MEMORY.md — Session Record & Resume Brief (BighornAnimation)

Written 2026-07-18 at Chuck's request before a prolonged break. Purpose:
everything pertinent that lives in chat rather than in the repo, so any
future session (Fable, CC, or Chuck) resumes with zero loss.
**Commit this to docs/ — the repo is source of truth, so this file should
travel with it.**

## 1. State at break (all pushed, all verified)

- **M0–M4 COMPLETE.** Data → terrain → engine → spotting/viewshed → combat →
  UI, every milestone gate-proven, fresh-clone-verified by Fable from the
  public repo (github.com/cdwashi/BighornAnimation).
- **The machine derives June 25**: full-day baseline — Custer's five
  companies destroyed in place by pursuit/convergence/interdiction,
  Reno-Benteen holds the hill, village preserved, couriers through, Arikara
  withdrawn, ~8 s runtime. C4 observation exam **12/13** (last miss = the
  logged v2 edge-of-treeline item). Ledger through **D77**.
- **UI**: map (pan/zoom, scale ruler), timeline, POV viewshed (flashlight
  model per D77 — scrim + crossfaded beam), Reality/Belief/Split modes,
  decision index (32 entries incl. 3 emergent leader deaths), encounter
  tooltips, fall markers, losses panel (killed/wounded columns reserved,
  pending D81), legend, casualty ticks, engagement speed cap.
- Chuck has personally accepted every UI round (annotated-guide method;
  docs/PRELIM-USERS-GUIDE-M3B.md with "(Chuck)" notes = the requirements
  record).

## 2. NEXT ACTION on resume

**Write the M5 spec.** IMPORTANT HONESTY NOTE: the spec is *designed but not
yet written as a file* — the D78–D83 shape below was delivered only as a chat
summary. First deliverable of the next session is the actual M5-SPEC.md.

Designed shape (D-numbers reserved, next free is D78):
- **D78 Composite scorer**: C1–C4 gate together, PRD §8 weights
  (checkpoints .35 / casualties .25 / end-states .25 / observations .15),
  one accountability number + per-item report card.
- **D79 Calibration constitution**: every [CAL] moves only within its
  sourced range (R1); global-table-only (D49 precedent); before/after audit
  per round; **no mechanism changes during calibration** — unreachable gates
  inside sourced ranges = STOP + documented finding (R1 escape hatch).
- **D80 Seed-envelope methodology**: emergent outcomes (3 leader deaths,
  Arikara digit, rout composition) judged as distributions across N seeds vs
  history's envelope; shipping baseline seed = typical member, never
  cherry-picked.
- **D81 Killed/wounded split**: [CAL] ratio, sourced from calibration
  targets' own bands; fills the D76 reserved columns.
- **D82 Valley-fight intensity**: the item that decides whether Reno's
  currently-orderly withdrawal becomes history's rout; pre-registered
  prediction — fixing it also repopulates the ford choke with broken
  troopers (the historically correct dead).
- **D83 Controls go live**: variant toggles + parameter panel in UI
  (Chuck's day-one "controllable" ask); only post-calibration values as
  defaults; user deviations from baseline visibly flagged.
- Three open questions were promised with the spec; one is pure product
  taste for Chuck: how much scorecard to expose to end users vs builders.

After M5: M6 polish (incl. real frontend-design-skill read by Fable for the
work order), then v1 ship per PRD §11.

## 3. The M5 calibration ledger (accumulated [CAL] debts, all sourced in repo reports)

- combatFrictionFactor 0.06 first-cut (D71) — the digit.
- Valley-fight intensity (Reno never breaks; ford choke under-populated).
- Arikara overshoot: 0 dead vs 3 named (D75 withdrawal thresholds/timing).
- Spotting table: fit to 11 events, threshold overfit to sparsest row
  (0.0001 margin, Weir row), skirmish-line anchor drifted to ~6 km
  visibility — redo with full scorer + the 2 promoted Crow's Nest events.
- Seed envelope for the 3 emergent leader deaths (which leaders; does the
  distribution bracket history).
- Keogh marquee number — now a simulated collapse; composite judges it.
- pursuitRepathCadenceTicks 10 [CAL] — F5 re-read owed IF it was changed
  for perf (check codex-report-m4a-d74.md; pooling landed as the pure fix).
- F6 gate portability note: assert deterministic work metrics
  (node-expansion ceiling, allocation count) as primary, wall-clock
  informational — can never flake on slow machines (Fable's sandbox reads
  ~10.08 s bare vs 10 s budget; machine of record green at 9.08 s).
- O5 re-sourcing: pony-herd literature (lodge-count arithmetic favors
  high range), plus the D16 weak-citation list, pre-publication.

## 4. Working conventions (the constitution of HOW we work — chat-born, now recorded)

- **Three parties**: Fable = specs, rulings, final review, fresh-clone
  verification (clones the public repo; can run the full quartet).
  CC (Claude Code) = dispatch, independent verification, live app drives.
  Codex = implementation from frozen work orders; never invents; STOPs.
- **Rhythm**: review → accept → commit → push. Never end a session with
  unpushed commits. Fable verifies pushes by fresh clone.
- **STOP/escalation culture**: gates going red on real defects is the system
  working; forbidden responses are tuning-to-green and per-event fudges.
  Four M4 STOPs held; Codex commended in the ledger (D71 row).
- **Mechanisms need sources; knobs need calibration.** New behavior requires
  documentation from the record (Fox's sentence, the pincer, the herd raid);
  new multipliers require sourced ranges and M5.
- **Pre-registered predictions**: batched rulings allowed only with
  disjoint falsifiable predictions written into the dispatch beforehand;
  verdicts accepted as they fall (standing policy since D52).
- **F5 review standard**: mechanisms before totals — did the hill hold for
  the right reasons, did the wing die for the right reasons.
- **Evidence standards**: work metrics over wall-clock for perf claims;
  structural proofs over symptom checks (e.g., canvas-count for the strobe).
- **Data conventions**: never average — spread carries the dispute
  (low/best/high with each bound sourced); integers for men (D26,
  parent-keeps-remainder); marker-vs-feature relocation (D27) with both
  coordinates kept; checkpoints sacred — source-semantics corrections
  allowed only by explicit human ruling (D44/D45/D53a lineage).
- **Ledger discipline**: ledger numbering is authoritative over spec
  proposals (the D60/D62 collision); rows dated on actual date (midnight
  rule); "Approved — pending Chuck" flips to "Approved" on his sign-off;
  bugs become rules become gates (D26/D29/D55 pattern); STOP reports and
  verification tooling (.claude/) are preserved as part of the record.
- **Work orders**: self-contained for a zero-context worker; spec wins on
  conflict; ambiguity protocol (flag, never guess); ledger rows embedded
  verbatim for CC to append; UI orders carry the design brief (period-map
  restraint) because the frontend-design skill exists only in Fable's
  environment.

## 5. Belief/Split (explained to Chuck 07-18; UNCHANGED by design)

Reality = ground truth. Belief = the selected leader's side's knowledge:
solid = spotted now; ghost = last-known, frozen where sight failed; absent =
never seen (truly absent). Split = both panes, same clock — the gap is the
information story. v1 caveat: spotted enemies show TRUE strength (no
estimation error); per-commander estimation is the v2 flagship
(V2-BACKLOG.md). Signature scene: Reno Hill 16:20 Split — reality shows the
wing dying, belief shows nothing there.

## 6. Small pending items (non-blocking)

- **M4-era user guide addendum** promised by Fable, not yet written (M4-B/C
  additions: morale cues, fall markers, losses panel, scale ruler, speed
  cap, tooltips). Fold into M6 docs or produce on request.
- **Chuck's v2 rendering suggestions**: still un-itemized; placeholder row
  waits in docs/V2-BACKLOG.md.
- One non-reproducible vitest teardown flake noted in the M4-B report
  (single run, clean on re-run) — watch, no action.

## 7. Resume line

Clone the repo, read docs/IMPLEMENTATION_HISTORY.md + this file, then:
**"Fable — write the M5 spec."** Everything else follows from there.
