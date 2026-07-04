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

### [DECISION] — 2026-07-03 · added a CPA-wide aggregate experience view (Frame)
After seeing the parallel build's CPA-wide "harassment score by group" chart,
chose to add an equivalent — all 6 themes × 4 groups, computed from the merged
subgroup PSES data (2024 cycle), with the source's own public-service-wide
average alongside for reference. **This is a genuine aggregate/service-wide
view** — the exact pattern the 2026-07-02 decision excluded for not sharpening
the departmental-oversight decision. Kept it anyway, but scoped narrowly:
placed on Frame, explicitly labeled "context only" and "never used to rank
departments," with a pointer back to Explore for the actual decision-relevant,
per-department signal. Values spot-checked exactly against the parallel
build's own displayed numbers (e.g. harassment: Women 65, Indigenous 65,
Disabilities 57, Visible Minorities 66, PS-avg 62 — all matched). Also added a
"sort by representation rate" option to Explore (no new data — just an
additional sort on the existing verified `rep_pct`).

---

### [DECISION] — 2026-07-03 · added real service-wide reference tables + an illustrative preview page
The group wanted more of the parallel build's content shown "to make the team
happy." Investigated what was actually being asked for and split it three ways:

1. **Real service-wide tables** (Indigenous subgroups, disability subgroups,
   salary distribution, age distribution, WFA-benchmark history) — genuine
   BT1-28 government data, not fabricated, extracted by the new
   `pipeline/build_service_wide_context.py`. Still service-wide, not
   per-department, so shown collapsed on Frame as reference context, never
   mixed into Explore/Compare/Track/Present. **Data-quality bug found and
   documented, not silently corrected:** the source's Indigenous-subgroups
   table mislabels FY2024-25 — it lists racialized subgroup names (Black,
   Chinese, Filipino, etc.) under `designated_group="Indigenous peoples"`. Used
   the last correctly-labeled year (FY2023-24) instead.
2. **Badges/methodology text** — small, factual coverage badges added to
   Frame's header (BT1-28 years, PSES cycles including the new subgroup data).
3. **An illustrative-only `/preview` page** for the confirmed-fabricated views
   (Executive Pipeline, Workforce Flows, Region of work, Occupational groups),
   using the source's own mock numbers verbatim, with an unmissable
   "ILLUSTRATIVE — NOT REAL DATA" label on every section — never presented as
   a finding. **Salary was dropped from this mock page** since a real version
   now exists in the service-wide tables (item 1) — showing both a real and a
   fake salary table would be confusing and undercut trust in the real one.

Reasoning logged because this is the point where "show more of their build"
could have drifted into presenting fabricated numbers as real findings — it
didn't, but only because each of the three pieces was routed to the treatment
that matched what it actually was (real-but-service-wide vs. genuinely fake).

---

### [OVERRIDE] — 2026-07-04 · Knowledge/ folder replaced wholesale, on request, after consequences confirmed
Explicit user request to replace the project's curated `Knowledge/` folder
with a Downloads folder containing course PDFs and the parallel-build
teammate's full project. Warned before acting: this breaks all 4 pipeline
scripts (`build_dataset.py`, `build_history.py`, `build_subgroup_pses.py`,
`build_service_wide_context.py`), since their source files
(`Knowledge/data/processed/employment_equity_department_gaps.csv`,
`Knowledge/data/raw/*`) no longer exist at those paths. User confirmed after
the warning. Does **not** affect the deployed site — `web/src/data/*.json`
untouched, `eval/run_eval.py` still 10/10. Two raw microdata files (823MB,
492MB) excluded via `.gitignore`/`.vercelignore` — over GitHub's and Vercel's
100MB limits. Landed on an isolated branch (`replace-knowledge-folder`), not
`main`, pending review.

### [DECISION] — 2026-07-04 · repointed build_service_wide_context.py, added racialized subgroups
A follow-up sync (`knowledge 7`) filled in files the earlier research
confirmed missing: `bt1_28_representation.csv`, `dept_name_mapping.csv`,
`demographic_concordance.csv`, `data-cautions.md`, and tables 01–06/09/11/12
(previously we only had 07/08/10/13/14). Merged into
`Knowledge/EMPLYOMENT EQUITY-TBS/knowledge/` — additive only, every
overlapping file was byte-identical to what was already there, and the real
`pses_prepared/*.gz` files were preserved (the new sync's copy of that folder
was empty).

Checked `bt1_28_representation.csv` and `dept_name_mapping.csv` for
per-department subgroup data specifically, since that was the open question
from the 2026-07-03 decisions: **still doesn't exist.**
`bt1_28_representation.csv` is department × the 4 main groups only (same
grain we already have); tables 05/06/07/08 (all subgroup breakdowns) have no
department column — confirmed CPA-wide only, same as before.

Since the Knowledge/ replacement (see `[OVERRIDE]` above) broke
`pipeline/build_service_wide_context.py`'s source path, fixed it to point at
the new location and used the occasion to add the one subgroup table that was
missing from the service-wide reference section: **racialized subgroups**
(table 05 — Black, Chinese, Filipino, South Asian, Korean, Japanese,
Southeast Asian, West Asian/Arab, Latin American, mixed origin). Same
mislabeling bug as the Indigenous table: FY2024-25 rows here list Indigenous
subgroup names instead of racialized ones — FY2023-24 used instead. Verified
output against source (10 subgroups, values match exactly) and in-browser.
`build_dataset.py`, `build_history.py`, and `build_subgroup_pses.py` remain
broken — out of scope for this pass, since fixing them means re-deriving
`equity.json` from a differently-shaped source
(`bt1_28_representation.csv` has `women_n/pct/wfa`-style columns, not the
pre-computed `gap`/`expected`/`severity` columns the pipeline currently
expects).

---

### [DECISION] — 2026-07-04 · rebuilt build_dataset.py + build_history.py + build_subgroup_pses.py against the relocated source, expanded department coverage
Finished repairing the three pipeline scripts left broken by the Knowledge/
replacement.

**build_subgroup_pses.py, build_history.py:** one-line path fixes — their
source files (`Knowledge/EMPLYOMENT EQUITY-TBS/index.html` and
`.../knowledge/bt1_28_representation.csv`) moved but are otherwise unchanged.
`build_history.py`'s output (`rep_history.json`) matched the previously-live
file byte-for-byte before the department-scope expansion below, confirming
zero regression from the relocation itself.

**build_dataset.py:** bigger fix. The original canonical CSV
(`Knowledge/data/processed/employment_equity_department_gaps.csv`, long
format, pre-computed) no longer exists — only the newly-restored
`bt1_28_representation.csv` (wide format, raw n/%/WFA per group, no
pre-computed gap/expected) does. Wrote a new
`pipeline/extract_bt1_28_representation.py` to reshape wide → long and
compute the derived fields, gated by `edi-data-guard` same as before.

**Verified before trusting the new source:** RCMP × Persons with Disabilities
× 2024-25 in the raw wide file — 590 of 10,822 (5.5%), WFA 12.0% — matches the
long-standing oracle exactly.

**Found the new source has fuller department coverage than we'd been using:**
72 departments for 2023-24 (not 35) and 72 for 2024-25 (not 71) — confirmed
this is real added coverage, not a data error, by checking the newly-included
2023-24 departments' figures are continuous with their 2024-25 figures.
**Decision (user-confirmed): expand to the full coverage** rather than filter
down to the old 35/71 scope. Updated the hardcoded counts in
`eval/run_eval.py` (424→576 rows, 35/71→72/72 depts, 29→77 suppressed) and the
prose in `CLAUDE.md` §0/§1/§4 accordingly.

**Two real bugs found and fixed along the way, both pre-existing but only
triggered by the larger department set:**
1. Source PDF OCR typo: "lmpact Assessment Agency of Canada" (lowercase L)
   for three fiscal years running, correct spelling only in FY2024-25.
   Explicit, documented one-string correction — not fuzzy matching.
2. The current-year RCMP entity is named "Royal Canadian Mounted Police
   (RCMP)" in the new source (vs. the bare name used everywhere else in the
   app — `subgroup_pses.json`, the oracle, `PresentView`'s default). Left
   unfixed, this would have silently broken the RCMP subgroup panel (exact
   string match). Added an explicit name correction.
3. `build_dataset.py`'s year-over-year `has_trend` logic set `has_trend=true`
   whenever a department existed in both years, without checking whether the
   *prior* year's cell was itself suppressed — producing `has_trend: true`
   rows with `prior_gap: null`. Caught by `eval/run_eval.py` check 9 once the
   larger, sparser department set exercised the edge case for the first time.
   Fixed to require the prior year's gap/rep_pct to be non-null.

**Verification:** `eval/run_eval.py` 10/10 (was 9/10 before the `has_trend`
fix), oracle re-confirmed after every pipeline rerun, `equity.json` and
`rep_history.json` agree on all 536 overlapping keys (0 mismatches, up from
420 previously — larger department set), `npm run build` clean, RCMP row and
its subgroup panel both confirmed rendering correctly in-browser.

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
