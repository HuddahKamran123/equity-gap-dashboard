# Employment Equity Gap Dashboard — Project Handoff

**Course:** MMA 616 – Managing Intelligence | Dr. Vern L. Glaser, University of Alberta  
**Student:** Huddah Kamran (huddah@ualberta.ca)  
**Last updated:** 2026-06-27  
**All files live in:** `/Users/huddahkamran/Desktop/Knowledge/`

---

## What This Project Is

An interactive HTML dashboard for EDI policy leads at the Treasury Board of Canada Secretariat (TBS). It answers one question in under two minutes: *which departments, for which equity groups, are furthest below their workforce availability benchmark — and what kind of review does that signal?*

The dashboard is a **signal surface, not a decision engine.** Every flag requires human review before action. No causal claims. No composite scores. No staffing recommendations.

---

## Key Files

| File | Purpose |
|---|---|
| `Employment Equity Gap Dashboard · TBS 2024-25.html` | Main deliverable — 226KB self-contained HTML, all data embedded |
| `MMA616_Day2_Submission.html` + `.pdf` | Course assignment submission (capabilities write-up) |
| `data/processed/employment_equity_department_gaps.csv` | Master dataset — 424 rows (140 rows 2023-24 + 284 rows 2024-25) |
| `CLAUDE.md` | Living spec — read this first for full business rules |
| `data_dictionary.md` | Field definitions for CSV + dashboard D array |
| `data_profile.md` | Dataset shape, quality notes, WFA benchmarks |
| `what_claude_cannot_guess.md` | 23 business rules Claude must never violate |
| `source_links.md` | All TBS + PSES source URLs |
| `domain_research_note.md` | Employment equity framework, limitations, responsible use |
| `Dashboard_Walkthrough_Script.md` | 5-step guided walkthrough with "what you do / see / get" per step |
| `edi-data-guard.skill` | CSV validation skill (7 checks) |
| `interpretation-guardrails.skill` | Language enforcer skill (5 checks) |
| `trend-interpreter.skill` | YoY trend interpreter (Subagent + Skill) |
| `question-router.skill` | Routes user questions: Answer / Reframe / Refuse |
| `presentation-summary-render.skill` | 5-block briefing summary generator (Subagent) |

---

## Data Sources

### Source 1 — TBS Employment Equity Demographic Snapshots

- **Processed file:** `data/processed/employment_equity_department_gaps.csv`
- **424 rows total:** 140 (2023-24, 35 depts × 4 groups) + 284 (2024-25, 71 depts × 4 groups)
- **Unit:** One row = one department × one equity group × one fiscal year
- **Key computed fields:** `severity`, `recommendation`, `priority` (bool), `has_trend` (bool)
- **29 suppressed rows** in 2024-25 (blank `designated_group_members`/`gap`) — small N privacy suppression, treat as missing NOT zero

**WFA benchmarks (service-wide):**

| Group | 2023-24 | 2024-25 |
|---|---|---|
| Women | 55.3% | 54.9% |
| Indigenous Peoples | 4.1% | 4.0% |
| Persons with Disabilities | 12.0% | 12.0% |
| Members of Visible Minorities | 22.7% | 22.7% |

**Gap formula:** `gap = designated_group_members − expected_number` (negative = below benchmark)  
**Severity scale:** Slight <2pp · Moderate 2–4.9pp · Substantial 5–9.9pp · Severe ≥10pp  
**Priority flag:** bottom quartile of gaps per equity group

### Source 2 — PSES 2024 (Public Service Employee Survey)

- **Raw file:** `EEINFODV.csv` (1.6M rows, latin-1 encoding — do NOT load all at once)
- **Added 5 columns to CSV** for 2024-25 rows only: `pses_engagement`, `pses_diversity_inclusion`, `pses_harassment`, `pses_discrimination`, `pses_mobility_retention`
- **Coverage:** 187 of 284 2024-25 rows enriched. 97 = agencies not in PSES.
- **Suppressed = blank** (raw value 9999), NOT zero. 2023-24 rows have blank PSES columns.
- **PSES = context only.** Do not combine with rep% in formulas. Do not rank departments morally by PSES score.

---

## Dashboard Structure

**File:** `Employment Equity Gap Dashboard · TBS 2024-25.html`  
**Format:** 5-page tabbed app. Kinquiry-style left sidebar with numbered steps. Right panel shows live signal count, active guardrails, current step.

| Step | Page ID | Title | What it does |
|---|---|---|---|
| 1 | `overview` | Frame | KPI cards, severity donut, avg-gap bar chart. Live output box: below-benchmark count, priority count, severe/substantial count, YoY improving count. |
| 2 | `gaps` | Explore Gaps | Ranked bullet bars (rep% vs WFA line), raw N counts, signal text, ⚑ priority flags. |
| 3 | `heatmap` | Compare | Cross-group severity heatmap. Live count of departments flagged in 2+ groups. |
| 4 | `trends` | Track | YoY trend lines (35 depts). Movers list with trend classification labels. |
| 5 | `distribution` | Present | Gap histogram + scatter. Presentation summary generator. Actionable Recommendations panel. |

### D Array (embedded in HTML)

284 rows (2024-25 only). Fields:  
`department_agency`, `equity_group`, `fiscal_year`, `all_employees`, `designated_group_members`, `representation_percent`, `workforce_availability_percent`, `expected_number`, `gap`, `severity`, `recommendation`, `prior_gap`, `prior_rep_pct`, `priority` (bool), `has_trend` (bool)

> **Note:** PSES columns are in the CSV but NOT yet in the D array. Next dashboard rebuild should embed them so PSES scores appear in tooltips/signal text.

### Key JS Functions

| Function | What it does |
|---|---|
| `fd()` | Filters D by current group G |
| `setPage(p)` | Switches active page, calls renderPage + updateRightPanel + updateStepOutputs |
| `setGroup(g)` | Changes equity group filter, re-renders everything |
| `renderPage()` | Routes to the right render function for current page |
| `renderBullets()` | Step 2 — ranked bullet bars with rep%, WFA, N, signal text |
| `renderPriority()` | Step 2 — priority flags panel (right panel) |
| `renderMovers()` | Step 4 — top improvers / declining list with trend labels |
| `trendLabel(r)` | Returns `{cls, txt}` trend classification per row (Genuine improvement / Worsening / etc.) |
| `renderTrend()` | Step 4 — YoY line chart |
| `renderHeatmap()` | Step 3 — cross-group severity heatmap |
| `renderHistogram()` | Step 5 — gap distribution histogram |
| `renderScatter()` | Step 5 — dept size vs gap scatter |
| `updateRightPanel()` | Updates live right panel (focus, signal count, step number) |
| `updateStepOutputs()` | Computes + renders live output boxes for all 5 pages |
| `renderPresummary()` | Step 5 — generates 5-block presentation summary from D array |
| `renderRecommendations()` | Step 5 — grouped actionable recommendations panel |
| `copyAllRecs()` | Copies full review queue as plain text to clipboard |

---

## Five Capabilities

| Capability | Form | What it does |
|---|---|---|
| `edi-data-guard` | **Skill** | 7-check CSV validator before any analysis runs |
| `interpretation-guardrails` | **Skill** | 5-check language enforcer — no causal claims, WFA named, bounded vocabulary |
| `trend-interpreter` | **Subagent + Skill** | Subagent reasons about genuine vs benchmark-driven gap changes; skill enforces classification vocabulary and output template |
| `question-router` | **Subagent** | Routes questions to Answer / Reframe / Refuse; blocks causal inference |
| `presentation-summary-render` | **Subagent** | 5-block summary (Key Finding · Evidence · Caveat · Human Review · Next Action); judgment required per dept–group combo |

**Capability form rules (hard rules):**
- Fixed pipeline = fully deterministic (gap formula, chart rendering)
- Skill = must produce consistent templated output every time
- Subagent = contextual judgment required
- Subagent + Skill = judgment AND consistent output format

---

## Absolute Rules (never violate)

1. Never average or combine rep% across equity groups into a composite score — each group's WFA is benchmarked against a different labour market
2. Always show WFA alongside rep% — never show one without the other
3. Always show raw N beside every rep% — e.g. "4.1% (N=312 of 7,612)"
4. Always display the responsible-use caveat on screen
5. Never make causal claims — gaps are signals for review, not proof of discrimination
6. WFA is the only valid benchmark — do not substitute public service averages
7. Blank = suppressed (privacy), NOT zero — do not impute
8. Trend lines only for departments present in both fiscal years (35 depts)
9. PSES scores = contextual signals only — do not use as denominator or combine with rep% in a formula
10. Priority flags surface candidates for human review — never act on them directly

**Approved review vocabulary:** recruitment pipeline review · retention review · promotion pipeline review · accessibility review · workplace inclusion review

---

## What's Done

All 33 tasks completed:

- ✅ Full CSV built (424 rows, TBS 2023-24 + 2024-25 + PSES 2024 enrichment)
- ✅ Dashboard built and fully interactive (226KB, embedded D array, 5-page tabbed app)
- ✅ Kinquiry-style sidebar with 5 numbered steps
- ✅ Live "YOUR OUTPUT FROM THIS STEP" boxes on every page
- ✅ Trend classification labels on movers list (Genuine improvement / Worsening / Benchmark-driven / etc.)
- ✅ Compounding gap counts on heatmap page
- ✅ Presentation summary generator (5-block, copy to clipboard)
- ✅ Actionable Recommendations panel (Step 5) — grouped by review type, time-bound next actions, "Copy review queue" button
- ✅ All 5 capabilities packaged as .skill files
- ✅ Course submission (MMA616_Day2_Submission.html + .pdf) with workflow pipeline, defined output section
- ✅ All 7 markdown documentation files updated (CLAUDE.md, data_dictionary.md, data_profile.md, what_claude_cannot_guess.md, source_links.md, domain_research_note.md, Dashboard_Walkthrough_Script.md)

---

## What's NOT Done Yet (known gaps)

- PSES columns not yet embedded in the dashboard D array — they're in the CSV, not in the HTML. Next rebuild should add them so PSES scores show in tooltips or signal text.
- Only service-wide WFA benchmarks used — departmental WFA benchmarks would be more precise but require data not yet integrated.
