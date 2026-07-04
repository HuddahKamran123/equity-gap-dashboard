# Employment Equity Gap Dashboard — Living Spec (CLAUDE.md)

> The single source of truth for this project. It states the objective, what good
> looks like, scope, the data, the agentic capabilities, and where a human has the
> final word. Revised at Day 3 — see the revision log at the end.

## 0. User stories

1. **Priya, OCHRO equity analyst (primary).** Every Tuesday morning, before her
   weekly sync with the Director, she needs to scan all 72 departments × 4 groups
   ranked by gap severity, so that she can flag the handful of combinations that
   belong in this year's report or a deputy-head conversation — without manually
   cross-referencing four separate published tables.
2. **Marc, departmental EDI lead (secondary).** Ahead of his quarterly equity
   committee meeting, he needs to see his department's gap and trend against the
   service-wide WFA benchmark alongside PSES experience context, so that he can
   brief his committee accurately without overstating what the data proves.
3. **Priya, OCHRO equity analyst.** When a deputy head asks for a one-pager on a
   specific department-group, she needs a five-block briefing (finding, evidence,
   caveat, review required, next action) generated in under a minute, so that she
   has defensible, guardrailed language ready instead of drafting it from scratch
   each time.

**Interrogation of story #1** (sharpest — it carries the objective's "under two
minutes" claim and exercises the dashboard's primary view, Explore):
- She's on the hook for directing OCHRO's limited oversight attention to the right
  departments *before* the annual report ships — a missed severe gap surfaces later
  in an audit or a minister's briefing instead of from her own triage.
- Today, without this dashboard, she opens four separate flat tables (one per
  designated group), manually cross-references department names and percentages,
  and eyeballs a ranking — a process that doesn't scale across 72 departments and
  can't be done in under half a day.
- With it, she opens Explore, sorts by gap within a chosen group, and immediately
  sees priority-flagged rows with N, WFA, and severity — turning that half-day
  manual pass into the two-minute triage the objective claims.

## 1. Objective

**Primary user.** An employment-equity analyst/advisor in the Treasury Board
Secretariat's Office of the Chief Human Resources Officer (OCHRO) — the central
function statutorily accountable for monitoring employment equity across the federal
public service and reporting on it each year. (Secondary user: a *departmental* EDI
lead who reads their own rows against the service-wide picture.)

**Their lever is oversight, not operations.** OCHRO does not run hiring inside
departments — departments do. So the decision this dashboard changes is **where the
central function directs its limited attention**: which department × group
combinations to surface in the annual report, raise with a deputy head, or
prioritize for engagement and challenge in the coming year.

The data is published annually as four separate flat tables (one per designated
group) with no ranked, filterable, cross-group view. This dashboard answers in under
two minutes: **which departments, for which designated groups, are furthest below
their workforce-availability benchmark, and which way are they trending — so
attention goes where the signal is strongest.**

No-dataset sentence: *this lets a central employment-equity analyst triage 72
departments × 4 groups for where to direct oversight attention in two minutes, which
the four separate published tables do not allow.*

**Deliberate judgment — the benchmark.** Workforce availability (WFA) is the only
valid benchmark, but this dashboard uses the **service-wide** WFA for every
department, not departmental WFA (which reflects each department's occupational mix
and is not in the published cross-department data). That makes the ranking a
**triage signal, not a precise league table** — a heavily-operational department is
measured against the same bar as a policy shop. A high ranking means "look here,"
to be refined with departmental WFA before any conclusion. Combined with voluntary
self-identification (which undercounts, especially Persons with Disabilities), the
honest claim is *directional prioritization*, not exact placement.

**The output, in one line.** A deployed decision-support dashboard whose unit of
output is a **department × designated-group row** — representation % (with raw N),
the WFA benchmark, the signed gap, a severity band, a priority flag, year-over-year
movement, and PSES experience context — surfaced four ways: **ranked triage**
(Explore), **cross-cutting patterns** (Compare — compounding shortfalls + a
divergence lens), **year-over-year** (Track), and a generated **five-block briefing**
(Present) — plus a grounded, guardrailed **Q&A** (Ask). Every output is a signal for
human review; the project produces no decisions, no composite scores, and no causal
claims.

## 2. What good looks like

A good output row gives a policy lead everything needed to decide whether to act,
without leaving the screen.

**Gold example (verified — re-derived by `eval/run_eval.py`):**
> Royal Canadian Mounted Police · Persons with Disabilities · Representation **5.5%
> (N=590 of 10,822)** · WFA **12.0%** · Gap **−709** · Severity **Substantial** ·
> ⚑ Priority · Signal: *substantially below the workforce-availability benchmark;
> recommended focus: recruitment pipeline review, accessibility review.*

**Every figure must show:** the representation %, the raw N it came from, and the
WFA benchmark beside it. A percentage without its N, or a gap without its benchmark,
fails.

**Testable success criteria:** `eval/run_eval.py` re-derives every shown number and
passes 10/10 checks, including the oracle above; `edi-data-guard` passes on the real
data and blocks a broken file; the Ask assistant grounds every figure and refuses
causal/staffing requests (see `eval/results.md`).

**Must never produce:** causal claims ("caused by", "proves discrimination"); blame
or moral ranking of departments; any inference about individuals; automated hiring/
firing/staffing recommendations; a composite score averaging across the four groups
(each is benchmarked against a different labour market).

### How the thresholds were determined

- **Priority flag — data-driven, not asserted.** A row is flagged when its gap sits
  in the **bottom quartile within its own equity-group × fiscal-year cohort**. The
  cutoff is computed from the actual distribution (`eval/run_eval.py` re-derives it),
  so it adapts to each group — whose benchmarks and spreads differ — rather than
  imposing one arbitrary number across groups.
- **Severity bands — a documented interpretability scale.** Slight <2 / Moderate
  2–4.9 / Substantial 5–9.9 / Severe ≥10 **percentage points below WFA**. This is a
  fixed *communication* scale (like a heat scale) chosen for legibility, not a
  statistical claim; the cut points are shown on screen and are tunable in one place
  (`pipeline/build_dataset.py`). Distance is always in pp of representation below the
  benchmark, so a band means the same thing for every group.
- **Suppression — an external policy rule, not ours.** Small-population cells are
  suppressed per Statistics Canada / Employment-Equity publication policy; the
  dashboard shows them as suppressed, never zero, and `edi-data-guard` enforces it.
- **Divergence margin — a documented floor, ranking is the emphasis.** A department
  is flagged for divergence when it is at/above benchmark **and** ≥5 pp below the
  *same group's* public-service average on harassment or discrimination. 5 pp is a
  conservative "meaningfully below peer" floor; results are ranked by shortfall so
  the magnitude carries the signal, not the cutoff.

## 3. Scope

**Shipped:** department-level gap table for all four designated groups (Women,
Indigenous Peoples, Persons with Disabilities, Members of Visible Minorities),
filterable by group and ranked by gap; priority flag (bottom quartile of gap per
group × year); severity scale (Slight <2pp / Moderate 2–4.9 / Substantial 5–9.9 /
Severe ≥10); WFA and raw N beside every representation figure; multi-year
representation trends over up to four years (2021-22 → 2024-25) with the 2023-24
benchmark rebase marked and gaps never compared across it;
a cross-group compare view (compounding shortfalls **plus a divergence lens** —
representation met but experience below the peer-group average); a five-block
briefing generator; a real, guardrailed conversational Ask tab; a permanently
visible responsible-use caveat.

**Out of scope (do not build):** individual-level data; causal/regression analysis;
automated policy or staffing recommendations; any view that collapses the groups
into one scale.

**Considered and deliberately not built (recorded decision, 2026-07-02).**
Service-wide **subgroup** breakdowns (racialized subgroups, Indigenous subgroups),
**region-of-work**, and **age-distribution** tables. They exist in the published
source (and a parallel build surfaces them), but only at the *service-wide* level —
they are **not per-department**, so they do not serve this dashboard's decision,
which is directing *departmental* oversight attention. Adding them would widen the
surface without sharpening the decision — the "clever build with no clear decision"
failure mode. **Multi-year representation trends** — which *do* serve the decision —
were subsequently built (2021-22 → 2024-25; see §4). The **executive-pipeline gap**
(overall vs. leadership representation) would also serve it, but the source publishes
executive representation only **service-wide**, not per department, so it cannot be
built at this dashboard's per-department grain and stays out of scope until
per-department executive data exists.

**Revisiting the 2026-07-02 decision (2026-07-03).** That decision declined the
parallel build's extra dimensions because they were **service-wide-only** and
therefore didn't sharpen the departmental-oversight decision. Its PSES
**workplace-experience** data (not representation) — subgroup breakdowns (Black,
South Asian, East Asian, Arab, First Nations, Métis, Inuit, Cognitive, Mental
health, Seeing) across 6 themes and 3 survey cycles (2020/2022/2024) — is
**per-department** (53 of our 72), which is the specific bar the service-wide data
didn't clear. Before merging, its representation data was cross-validated against
our own verified `equity.json`: **195 of 195 comparable department × group pairs
for 2024-25 matched within 0.3 percentage points.** That gives confidence the
source pipeline is genuine, though the experience scores themselves cannot be
independently re-derived by our own pipeline (the source's raw 2020/2022 PSES
microdata, demographic-recoding concordance, and department-name mapping files
aren't available to us) — shown in Explore's row detail only, labeled as a
cross-validated external source, not our own verified figure. **Subgroup
representation/WFA remains out of scope** — it does not exist at the department
level in any available source (confirmed by the source's own subgroup
representation field always being empty). See `Deployment_Log.md` for the full
cross-validation record.

**Adding service-wide reference tables + an illustrative preview (2026-07-03).**
Two further additions from the same parallel build, requested so the team's
work is visible to reviewers who compare the two builds directly:
- **Service-wide reference tables** — Indigenous subgroups, disability
  subgroups, salary distribution, age distribution, and WFA-benchmark history.
  These are **real** BT1-28 government data (not fabricated), extracted by
  `pipeline/build_service_wide_context.py`, but they are service-wide, not
  per-department — so they're shown collapsed, clearly labeled as reference
  context, on Frame, and never mixed into the per-department decision-support
  views. One data-quality issue was found and documented, not corrected: the
  source's Indigenous-subgroups table mislabels its most recent year
  (FY2024-25 lists racialized subgroup names) — the last correctly-labeled year
  is used instead.
- **An illustrative `/preview` page** — Executive Pipeline, Workforce Flows,
  Region of work, and Occupational groups, using the source's own **fabricated
  mock numbers**, verbatim, with an unmissable "ILLUSTRATIVE — NOT REAL DATA"
  label on every section. This shows what these views would look like once
  real per-department data exists, without presenting fake numbers as
  findings. Salary distribution is deliberately **not** duplicated here —
  a real version already exists in the service-wide reference tables above,
  so the fake version was dropped rather than shown alongside a real one.

**Adding racialized subgroups + repointing the pipeline (2026-07-04).** The
project's `Knowledge/` folder was subsequently replaced wholesale with a fuller
sync of the parallel build (see `Deployment_Log.md`), which moved the source
tables to `Knowledge/EMPLYOMENT EQUITY-TBS/knowledge/tables/` and broke
`pipeline/build_service_wide_context.py`'s old path. Fixed the path and used
the occasion to add the one service-wide subgroup table that was missing:
**racialized subgroups** (Black, Chinese, Filipino, South Asian, Korean,
Japanese, Southeast Asian, West Asian/Arab, Latin American, mixed origin) —
same treatment as Indigenous and disability subgroups: real, service-wide,
collapsed on Frame, not per-department. Same mislabeling bug found in this
table's FY2024-25 rows (lists Indigenous subgroup names) — FY2023-24 used
instead, consistent with the Indigenous-subgroups fix. `build_dataset.py`,
`build_history.py`, and `build_subgroup_pses.py` remain broken by the
Knowledge/ replacement — not addressed in this pass.

## 4. Data

**Two sources, one reproducible pipeline** (`pipeline/`):
- **Representation & benchmark** — Treasury Board Employment Equity data, 2023-24
  and 2024-25. The input of record is `Knowledge/EMPLYOMENT EQUITY-TBS/knowledge/
  bt1_28_representation.csv` (283 rows, FY2021-22 → FY2024-25, wide format — one
  row per department per year), reshaped into the long-format canonical CSV
  `pipeline/extract_bt1_28_representation.py` produces and `edi-data-guard`
  validates: 576 rows = 288 (2023-24, 72 depts × 4) + 288 (2024-25, 72 depts × 4);
  77 suppressed. (2026-07-04: expanded from an earlier 35/71-department extract of
  the same source family to this source's full department coverage — see
  `Deployment_Log.md`.) A **four-year series** (2021-22 → 2024-25,
  `pipeline/build_history.py`, same source file) feeds the Track view: verified
  identical to the canonical data on the two overlap years (536/536 keys, 0
  mismatches), gated by `edi-data-guard`, and stitched across years **only where a
  department is unambiguously the same entity** — the RCMP's reported population
  changed across years (Civilian Staff → full force), so it is
  not stitched and stays current-year only.
- **Employee experience** — the **2024 Public Service Employee Survey**, Employment
  Equity Derived Variable dataset (`EEINFODV.csv`, fetched from open.canada.ca).
  `pipeline/extract_pses.py` reads the raw microdata; `pipeline/build_dataset.py`
  joins it, gated by `edi-data-guard`, and emits `web/src/data/equity.json`.

**PSES — four indicators (method documented in `web/src/data/meta.json`):**
engagement, diversity & inclusion, harassment, discrimination. Each subindicator
score is the mean of its **non-suppressed** SCORE100 questions at the department ×
equity-group level. **Mobility & retention is omitted** — its questions are
suppressed (code 9999) at this breakdown, so it cannot be computed and is not
fabricated. PSES is **context only**: never combined with representation in a
formula, never used to rank.

**Do not guess:** WFA is the only valid benchmark (service-wide values per group ×
year, in `meta.json` and `edi-data-guard`'s `references/columns.json`); blank means
suppressed for privacy, never zero; self-identification is voluntary, so groups —
especially Persons with Disabilities — may be undercounted; trends only for
departments present in both years; two data points are not a trend. **WFA is
periodically rebased**: the availability benchmark was substantially updated in
2023-24 (Persons with Disabilities 9.2 → 12.0, Members of Visible Minorities
17.3 → 22.7). Across that boundary a *gap* change reflects the rebase, not hiring —
the Track view marks it and never classifies a cross-boundary change as improvement;
representation % (members/all) is benchmark-independent and is the clean trend.

## 5. Capabilities (the agentic workspace)

Five capabilities are installed as **real Claude Code skills** under
`.claude/skills/<name>/SKILL.md`, and three are also wired as **subagents** under
`.claude/agents/`. Each is placed at the simplest form that does its job.

**The flow — validate → build → interpret → present.** Each stage names the
capability that governs it:

```
  raw sources            edi-data-guard            build_dataset.py            interpretation-guardrails
  TBS CSV +        ─▶    Skill + validate.py  ─▶   severity · priority   ─▶    trend-interpreter
  PSES EEINFODV          (blocks a bad file)       divergence · trends         question-router
                                                          │                    presentation-summary-render
                                                          ▼                              │
                                                  web/src/data/*.json  ────────▶   dashboard + Ask
                                                                                  (guardrails live)
```

The guard **gates** the data; the pipeline **computes** the derived fields; the
guardrail skills + subagents **shape** every interpretation and answer; the
dashboard and the Ask route are where it **reaches a human**.

| Capability | Form | Where it runs | What it does |
|---|---|---|---|
| `edi-data-guard` | **Skill + runnable check** | build / pipeline gate | `scripts/validate.py` runs 7 checks and **exits non-zero** on a bad dataset, blocking the build. Demonstrable on a deliberately broken CSV. |
| `interpretation-guardrails` | **Skill** | Ask route system prompt; signal logic | Enforces cautious language: no causal claim, no blame, WFA named, bounded action vocabulary, PwD caveat. |
| `question-router` | **Skill + Subagent** | Ask route (runtime); `.claude/agents/question-router.md` | Routes a question to Answer / Reframe / Refuse. Enforced live in `web/src/app/api/ask/route.ts`. |
| `trend-interpreter` | **Skill + Subagent** | dashboard code; `.claude/agents/trend-interpreter.md` | Classifies YoY movement (genuine / benchmark-driven / worsening / stable). Realized deterministically in `web/src/lib/signal.ts`; the subagent is the workspace tool. |
| `presentation-summary-render` | **Skill + Subagent** | Present view; `.claude/agents/presentation-summary-render.md` | The fixed 5-block briefing. Realized in `web/src/views/PresentView.tsx`. |

**Connector:** none, and that is deliberate — the pipeline reads a local/published
file and writes a local data file; there is no live external system to reach at
analysis time. (The Ask route reaches the Claude API, which is the reasoning layer,
not a data connector.)

**The honest runtime picture:** the deployed dashboard is a static Next.js app; its
deterministic logic (severity, priority, trend classification, the 5-block summary)
ships in code. The **Ask route is the live agentic surface** — it calls Claude with
`question-router` + `interpretation-guardrails` in the system prompt and the data as
grounded context. The skills/subagents are the build-time contracts and workspace
tools that produced and govern that behaviour. Nothing in the UI claims a runtime
capability the source does not have.

## 6. Human-in-the-loop & governance

The dashboard is a **signal surface, not a decision engine** — a human makes every
consequential call.
- Priority flags surface *candidates* for review; an EDI policy lead or HR executive
  must review before any action. The UI and the Ask assistant both state this.
- The Ask assistant **refuses** staffing/hiring/firing/individual-promotion requests
  and **reframes** causal questions; it never asserts cause.
- `edi-data-guard` is the data membrane: a bad dataset is blocked before it reaches
  the dashboard.
- Overrides (a dismissed flag, a replaced number) are logged with a reason in
  `Deployment_Log.md`.
- Deployment governance: changes reach the live site only through a reviewed pull
  request to `main` (branch protection); a human owns what crosses into production.

---

## Revision log

**Day 3 — 2026-06-29 (rebuild).** This spec was rewritten from the Day-1 version to
match what was actually built and to fix inaccuracies the deployment week surfaced
(see `Deployment_Log.md`):
- **Gold example** changed from RCMP · Indigenous (WFA 3.8%, a value not present in
  the data) to the **verified** RCMP · Persons with Disabilities oracle.
- **PSES** corrected from five claimed indicators to **four** that are reproducible
  from source; mobility/retention documented as suppressed at this breakdown.
  Discrimination — previously empty — is now backfilled from the raw microdata.
- **Capabilities** rewritten to describe real installed skills + subagents and where
  each runs, replacing the Day-1 claims that the dashboard invoked them at runtime.
- **Data** section now describes a reproducible pipeline (data connected, not
  pasted), gated by a runnable guard.
- **Success criteria** are now an executable harness (`eval/run_eval.py`, 10/10)
  plus the guard, rather than prose.

**Day 3 addendum — 2026-07-02 (response to instructor feedback).**
- **Capability flow** made explicit (validate → build → interpret → present), in §5
  and surfaced in the app.
- **Project output** stated in one line at the end of §1.
- **Threshold determination** documented (§2 "How the thresholds were determined"):
  priority is a data-driven quartile; severity is a documented interpretability
  scale; suppression is external policy; divergence uses a documented floor + ranking.
- **Divergence lens** added: representation met but experience below the same group's
  public-service average — two signals shown separately, never a composite (§2, §3).
- **Census-rebase** discontinuity documented as a trend caveat (§4).
- Chat already works via the Claude API (Ollama was the instructor's suggestion for a
  local option; the API route is grounded and deploys — Ollama would not run on the
  serverless host).
- **Multi-year trends** added (2021-22 → 2024-25) after verifying the team's 4-year
  file matches ours on the two overlap years (420/420 keys, 0 mismatches); stitched
  only where a department is unambiguously the same entity across years, gated by the
  guard; the 2023-24 benchmark rebase is marked and never crossed for gap claims.
- **Executive-pipeline** investigated and left out of scope: the source publishes
  executive representation service-wide only, not per department, so it cannot be
  built at this dashboard's grain.
