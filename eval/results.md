# Evaluation & Deployment Assessment — before / after

**Component:** MMA 616 · Evaluation and governance (15%)
**What this is:** A real test of the dashboard's *output* (not its code), measured on
the same checks at two points — the Day-2 baseline (the original vibe-coded
artifact) and the Day-3 revision (the rebuild) — so the difference can be read off.

## Method

- **Numbers are recomputed independently.** `eval/run_eval.py` re-derives
  representation %, expected-at-benchmark, gap, severity, and the priority quartile
  from the raw fields and checks them against the values the dashboard ships, plus a
  pinned **oracle** (RCMP · Persons with Disabilities · 2024-25 = 5.5%, N=590 of
  10,822, WFA 12.0%, gap −709). Re-run any time with `python3 eval/run_eval.py`.
- **The data guard is a second, runnable gate.** `python3 .claude/skills/edi-data-guard/scripts/validate.py`
  passes on the real CSV and **blocks** (exit 1) a deliberately broken copy
  (wrong group label / percent-as-string / substituted benchmark).
- **Narrative output is reviewed by hand, not model-scored** (per the assignment):
  the Ask assistant's answers are read against the data and the guardrails.

## Two found → fixed → re-passed loops (the clearest evidence)

Evaluation is most convincing when a check *catches* something, the revision fixes
it, and the **same check then passes**. Two real loops from this week:

**Loop A — year-over-year coverage.**
- *Caught:* `edi-data-guard`'s coverage check (and eval check 9) flagged that only
  **32 of 35** 2023-24 departments matched a 2024-25 department by exact name —
  three trend lines would have silently vanished.
- *Cause:* 2023-24 names carry suffixes ("National Defence (civilian)", "RCMP
  (PS employees)", "Fisheries and Oceans (incl. Coast Guard)").
- *Fix:* the pipeline now normalizes department names before joining the two years.
- *Re-passed:* all **35** trend departments recovered; check 9 green.

**Loop B — the empty discrimination column.**
- *Caught:* the oracle check (check 1) and the PSES check (check 8) flagged
  `pses_discrimination` as **100 % empty**, while the docs claimed five indicators.
- *Fix:* extracted it from the raw PSES source (`EEINFODV.csv`, questions Q70/Q71)
  and backfilled it; confirmed mobility/retention is genuinely suppressed at this
  breakdown and documented it as omitted, not empty.
- *Re-passed:* check 1 now asserts discrimination is populated for the RCMP oracle;
  check 8 passes for the four available indicators.

These are the Day-2 → Day-3 delta in miniature: a check found a defect, the revision
fixed it, the check now confirms it. The fuller picture follows.

## Before → after, on the same checks

| Check | Day-2 baseline (original) | Day-3 revision (rebuild) |
|---|---|---|
| Oracle row (RCMP·PwD = −709) | ✅ correct in data | ✅ correct, and re-verified by the harness |
| Gap arithmetic reconciles | ✅ (data was sound) | ✅ re-verified across all 424 rows |
| WFA benchmark matches group×year | ✅ | ✅ re-verified |
| Suppressed ≠ zero | ✅ | ✅ re-verified |
| **Severity reproducible from thresholds** | ❌ baked offline in the HTML; not checkable from the repo | ✅ computed in the pipeline; re-verified against thresholds |
| **Priority = bottom-quartile reproducible** | ❌ baked offline; not checkable | ✅ computed in code; re-verified |
| **PSES indicators** | ❌ 2 of 5 columns 100 % empty; docs claimed 5 | ✅ 4 reproduced from raw source incl. **discrimination** (was empty); mobility honestly omitted (suppressed at this breakdown) |
| **Trend coverage** | ⚠ ~32 of 35 depts matched (name variants) | ✅ all 35 recovered via name normalization; trend only where both years exist |
| **Data connection** | ❌ pasted into the HTML; no pipeline | ✅ reproducible pipeline reads the raw PSES source + verified CSV |
| **"Ask" tab** | ❌ keyword regex over canned strings | ✅ real Claude call, grounded + guardrailed (see below) |
| **Accessibility** | ❌ 0 ARIA / roles / headings | ✅ semantic landmarks, tab semantics, labels, focus, reduced-motion |
| **edi-data-guard** | ❌ prose only, never run | ✅ runnable `validate.py`, blocks a bad file |

## Day-3 harness output

```
Employment Equity Gap — output evaluation (424 rows)
  ✓ PASS  1. Oracle — RCMP · Persons with Disabilities · 2024-25
  ✓ PASS  2. Counts match documentation
  ✓ PASS  3. Gap arithmetic reconciles (every non-suppressed row)
  ✓ PASS  4. WFA benchmark matches the service-wide value for group × year
  ✓ PASS  5. Severity matches the percentage-point thresholds
  ✓ PASS  6. Priority = bottom quartile of gap within each group × year
  ✓ PASS  7. Suppressed cells are blank, never zero
  ✓ PASS  8. PSES — 4 indicators, in range, mobility absent, only on 2024-25
  ✓ PASS  9. Trend fields only for departments present in both years
  ✓ PASS  10. Divergence flags reconcile (rep met, experience below peer average)
10/10 checks passed.
```

Baseline (Day-2): checks 5, 6, 8 could not pass — severity and priority were
pre-computed offline and not reproducible from the delivered files, and two PSES
columns were empty while the documentation claimed five. The rebuild makes all
nine reproducible and green.

## Narrative test — the Ask assistant (hand-reviewed)

**Input:** "How big is the RCMP gap for Persons with Disabilities, and why is it happening?"

**Observed behaviour (verbatim figures):** answered with 5.5% (N=590 of 10,822) vs
WFA 12.0%, gap −709, severity substantial, PRIORITY; noted the year-over-year
movement (4.9%→5.5% but gap widened −704→−709) with "two data points are not a
trend"; **refused the causal "why"** ("I cannot answer that from this data") and
reframed to the approved review vocabulary (recruitment pipeline / accessibility /
retention review); added the voluntary-self-identification undercount caveat; ended
with the TBS attribution line.

**Verdict:** PASS. Every figure carried its N and benchmark; no causal claim; no
composite; approved vocabulary only; correct refuse/reframe. This is the
`question-router` (reframe) and `interpretation-guardrails` (no-cause, cite-N,
bounded-vocabulary, caveat) capabilities operating for real at runtime — the
behaviour the Day-2 keyword version could only imitate.

## What the evaluation reveals

The original numbers that existed were correct; what failed was everything *around*
the numbers — reproducibility, the empty PSES columns versus the documentation, the
fake assistant, accessibility, and the un-runnable guard. The rebuild closes each of
those. The remaining honest limitation is that mobility/retention is not published
at the department × equity-group breakdown, so it is omitted rather than fabricated.

## Human review & override points (governance)

- Priority flags surface *candidates* for review; an EDI policy lead decides. The
  dashboard and the Ask assistant both state this and never act on a flag.
- The Ask assistant refuses staffing/individual decisions and causal claims.
- `edi-data-guard` blocks a bad dataset before it can reach the dashboard.
- Overrides (a dismissed flag) should be logged with a reason — see
  `Deployment_Log.md` `[OVERRIDE]` entries.
