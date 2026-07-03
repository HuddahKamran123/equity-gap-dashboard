# Deployment Log — Employment Equity Gap Dashboard

The Use-phase record. Each entry is an episode that taught us something — what ran,
what worked, what fell short, what we overrode and why, and how people reacted.
Entry types: `[ORACLE]` `[EPISODE]` `[FAILURE]` `[OVERRIDE]` `[DECISION]` `[EXTERNAL]`.

Use week: 2026-06-28 → 2026-07-02. Day 3 (Evaluate): 2026-07-03.

---

### [ORACLE] — 2026-06-29 · pinned known-answer
Royal Canadian Mounted Police · Persons with Disabilities · 2024-25.
Verified against the source CSV **and** independently re-derived by `eval/run_eval.py`:
representation 5.5% (N=590 of 10,822), WFA 12.0%, expected 1,299, **gap −709**,
severity *substantial*, **priority**. The live dashboard and the Ask assistant both
return these exact values. **Status: ✅ confirmed end to end.**
How to check: Explore Gaps → filter Persons with Disabilities → find RCMP; or run
`python3 eval/run_eval.py`.

---

### [FAILURE] — 2026-06-29 · year-over-year coverage was quietly short
`edi-data-guard` flagged that only **32 of the 35** 2023-24 departments matched a
2024-25 department by exact name. Cause: the 2023-24 source carries name suffixes
("National Defence (civilian)", "RCMP (PS employees)", "Fisheries and Oceans
(incl. Coast Guard)") that don't match the 2024-25 names. Left as-is, three
departments would silently lose their trend line.
**Correction:** the pipeline now normalizes department names before joining years;
all **35** trend departments are recovered. **What it taught us:** a clean-looking
join can drop rows without erroring — the guard's coverage check earns its place.

---

### [FAILURE] — 2026-06-29 · two PSES columns were empty but documented as present
The delivered dataset had `pses_discrimination` and `pses_mobility_retention`
**100% empty**, while the data dictionary, profile, CLAUDE.md, and a worked example
all referred to five PSES indicators. A reader trusting the docs would believe
signals existed that did not.
**Correction:** traced both to the raw PSES source (`EEINFODV.csv`, 1.25 GB,
fetched from open.canada.ca). **Discrimination is computable** (questions Q70/Q71
carry a SCORE100) and is now backfilled. **Mobility/retention is structurally
suppressed** at the department × equity-group breakdown (its questions return the
9999 suppression code) — so it is honestly omitted, not fabricated. Docs corrected
to four indicators. **What it taught us:** "documented" is not "present" — verify
the data behind the docs.

---

### [OVERRIDE] — 2026-06-29 · replaced hand-transcribed PSES numbers (reason logged)
The original PSES scores (engagement / diversity-inclusion / harassment) did not
reproduce from the source by any standard method — they appear hand-approximated,
with no recorded method. **Decision:** override them with values computed
reproducibly from the raw microdata (mean of each subindicator's non-suppressed
SCORE100 questions, department × equity-group level), documented in
`web/src/data/meta.json`. **Reason:** reproducible, source-derived numbers are
defensible and auditable; hand figures are neither. The values differ from the
originals by a few points — expected, and an improvement.

---

### [EPISODE] — 2026-06-29 · the "Ask" tab was not AI; now it is
The original Ask tab was a keyword-regex matcher over canned strings (it could not
compare departments and returned a generic table for anything off-script). Rebuilt
as a real Claude API route with the guardrails in the system prompt.
**Test (hand-reviewed):** asked "How big is the RCMP gap for Persons with
Disabilities, and *why* is it happening?" — it grounded every figure (5.5%, N=590,
WFA 12.0%, gap −709), **refused the causal "why"** and reframed to the approved
review vocabulary, added the self-identification undercount caveat, and signed with
the attribution line. **What it taught us:** the guardrail skills are only real if
something actually enforces them at runtime — now the route does.

---

### [FAILURE] — 2026-07-02 · caught a false multi-year trajectory before it shipped
Folding in the 4-year representation series, the naive name match stitched the RCMP's
**Civilian Staff** figure (8,384 employees, 2021-22) to the **full force** (10,822,
2024-25) — two different populations under one "RCMP" line. The verification also
showed our own data carries two RCMP entities ("Royal Canadian Mounted Police" and
"…(PS employees)"). **Correction:** trajectories now stitch across years only when
the department's name (parentheticals kept, footnote digits stripped) is identical to
the current-year anchor; RCMP falls to a single year and is dropped from the
multi-year view (kept in the current-year data). National Defence / Fisheries (which
differ only by a footnote digit) stitch cleanly. **What it taught us:** a numeric
headcount check wasn't enough — the entity signal was in the name.

### [DECISION] — 2026-07-02 · executive-pipeline left out of scope (recorded)
Investigated adding an executive-pipeline gap (overall vs. leadership representation).
The source publishes executive (EX-01–EX-05) representation **service-wide only** —
no department column — so it can't be built at this dashboard's per-department grain.
Recorded as out of scope until per-department executive data exists, rather than
shipping a service-wide view that doesn't serve the departmental decision.

### [DECISION] — 2026-07-02 · declined service-wide breadth (recorded on purpose)
Reviewed the parallel build's extra dimensions — racialized/Indigenous **subgroups**,
**region-of-work**, **age distribution** — and **chose not to add them**. Reason:
the published data carries these only at the **service-wide** level, not per
department, so they don't serve this dashboard's decision (directing *departmental*
oversight attention). Adding them would widen surface area without sharpening the
decision. **Kept as candidates instead:** multi-year representation trends and the
executive-pipeline gap, which *do* serve the decision. Logged so the refusal is a
conscious choice, not an oversight. (Also in `CLAUDE.md` §3.)

---

### [DECISION] — 2026-07-03 · reopened the service-wide-breadth call for per-department PSES experience data
A teammate's parallel build (Lorraine, `ldzeble@ualberta.ca`) was investigated
again after the group asked why our dashboard doesn't show its extra dimensions.
Most of it — Executive Pipeline, Workforce Flows, Salary, Region, Occupation,
subgroup headcount tables — turned out to be **hardcoded mock data**, self-
disclosed in the source's own UI copy ("Prototype — data is mock") and citing
source files that don't exist anywhere in that project. Not merged.

One part is real and **per-department**, which is the specific bar the 2026-07-02
decision above said the service-wide data didn't clear: PSES **workplace-
experience** scores (harassment, belonging, career, leadership, workplace,
wellbeing) for the 4 designated groups and 10 subgroups (Black, South Asian, East
Asian, Arab, First Nations, Métis, Inuit, Cognitive, Mental health, Seeing), across
survey cycles 2020/2022/2024, for 53 of our 71 departments.

**Verification, since we cannot independently re-derive this data** (the source's
raw 2020/2022 PSES microdata, demographic-recoding concordance, and department-
name mapping files aren't available to us): extracted the source's representation
data and cross-validated every resolvable department × group pair for FY2024-25
against our own verified `equity.json`. **195 of 195 matched within 0.3 percentage
points (100%)**, after normalizing one machinery-of-government rename
("Infrastructure Canada" → "Housing, Infrastructure and Communities Canada"). This
gate is re-run at build time by `pipeline/build_subgroup_pses.py` (hard-fails
below 98% match) so a future refresh can't silently ship a regressed source.

**Decision:** merge the experience data into Explore's row detail only, labeled
explicitly as a cross-validated external source — not our own independently-
verified figure, and never rendered next to or averaged with the existing 2024-only
4-indicator PSES field. **Not merged:** subgroup representation/WFA (still doesn't
exist at the department level in any source — the parallel build's own subgroup
representation field is always empty); `GROUP_PARAMS` (the source's own UI
color-threshold logic, not a data fact — this dashboard already has
`DIVERGENCE_MARGIN` for that concept); Compare/Track/Present views (out of scope
for this pass — see `CLAUDE.md` §3). Also in `CLAUDE.md` §3.

---

### [EXTERNAL] — pending live use (2026-06-28 → 07-02)
*To be filled once the deployed URL is in front of someone outside the build.*
Capture: who used it, what they asked, where it helped, where it confused them, and
any flag they would have acted on (and whether they should have).
- Who used it:
- What happened:
- Significance:

---

### [EXTERNAL] — pending live use
- Who used it:
- What happened:
- Significance:

---

## Weekly summary (fill before Day 3)
- **Most useful:** the Explore ranking + the grounded Ask assistant for "where do I
  look first and what review does it signal."
- **Where it fell short:** _(fill from live use)_
- **What we changed because of the week:** name-normalized trends; backfilled
  discrimination; replaced fake Ask with a real guardrailed one; corrected PSES docs.
- **Open limitation:** mobility/retention unavailable at this breakdown; PSES
  coverage 51/71 departments (smaller agencies suppressed or unsurveyed).
