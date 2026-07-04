# Employment Equity Intelligence Dashboard — Living Spec

## Objective

This dashboard serves two named users with different zoom levels:

**Primary user — TBS Chief Human Resources Officer (and EE policy team)**
Portfolio view across all departments. Decision: which departments need system-wide intervention, and for which designated group or subgroup? Authority: directs EE resources, sets targets, reports to Parliament annually.

**Secondary user — Deputy Minister (and departmental EE coordinator)**
Single-department view. Decision: where should my department's EE action plan focus this year? Authority: directs HR investments and programs within their own department.

The no-dataset sentence: *This lets the TBS Chief Human Resources Officer and Deputy Ministers do something they cannot do today — see in one view, for every department, which designated groups meet representation targets on paper while reporting the worst workplace experiences in the public service, so the CHRO can direct system-wide interventions and each DM can focus their EE action plan on the right group.*

The user opens this dashboard to answer four questions:
1. Where are we below WFA, and for which group or subgroup specifically?
2. Is that gap closing year over year (2020–2025), or widening?
3. In departments where representation looks acceptable, are those employees actually included?
4. Which specific subgroup and which specific department should be the next intervention priority?

---

## What Good Looks Like

**The standard:** A good output names a specific group, subgroup, department, and metric — not a general observation. It shows both representation and experience where both exist, and flags when they diverge.

**Gold example:**  
> "At the Department of National Defence, Black employees represent 4.2% of the workforce vs. a WFA benchmark of 3.8% — above target. Yet their harassment and discrimination score is 31/100 against a public service average of 58/100, a 27-point experience gap that representation data alone would hide. This department warrants intervention on inclusion, not headcount."

**What the dashboard must always do:**
- Show ANSCOUNT alongside every experience score — never present a score without its sample size
- Show which WFA benchmark year is in effect for any representation comparison
- Distinguish between EE Act designated groups (representation + experience) and extended PSES groups (experience only — no WFA comparison)
- Display both main group and subgroup data; never collapse subgroups into a single designated-group average without offering the breakdown

**What the dashboard must never produce:**
- A single "diversity score" that averages across designated groups or subgroups
- A WFA gap comparison for 2SLGBTQIA+, religion, or ethnocultural origin groups — no benchmark exists
- A cell value where ANSCOUNT < 10, presented as if it were real data
- The word "caused" or "proves" in any narrative — this data shows correlations and gaps, not causation
- "Federal government-wide" — scope is Core Public Administration only

---

## Scope

**In scope — minimum viable version:**
- Representation view: all four EE Act designated groups + their subgroups vs. WFA, by department, for each year 2020–2025
- Experience view: PSES satisfaction scores (2020, 2022, 2024) for all designated groups + subgroups + extended PSES groups (2SLGBTQIA+, religion, ethnocultural origin), by department and PSES indicator theme, with year-over-year trend for questions consistent across cycles
- Divergence flag: departments where a group meets WFA but whose harassment score is more than 1 standard deviation below the group's PS-wide average (per-group thresholds derived from 2024 PSES microdata — Women: 9 pts, Persons with Disabilities: 10 pts, Indigenous Peoples: 11 pts, Racialized Persons: 9 pts)
- Department filter: user can select one or more departments to focus the view
- Group/subgroup filter: user can drill from designated group to subgroup

**One stretch goal:**
- Executive pipeline view: EX-01 through EX-05 representation by designated group, compared to WFA, with year-over-year trend

**Out of scope:**
- Individual employee records or identifiable data — ever
- Causal attribution ("this gap is caused by X policy")
- Departments outside the Core Public Administration (no Crown corporations, RCMP, Canadian Armed Forces)
- Multi-year PSES trends for questions that changed wording between cycles — verify comparability using the question concordance table before plotting any trend
- Ranking departments in a league table without surfacing the context behind each score

---

## Data

**Connected sources — read live, never paste fragments:**

**PSES experience microdata (latin-1 encoded):**

| Source | File | What one row is |
|--------|------|-----------------|
| PSES microdata 2024 | `EEINFODV.csv` | One survey question × one demographic group × one department |
| PSES microdata 2022 | `EEINFODV_2022_dept0-35.csv.csv` + `EEINFODV_2022_dept36-95.csv.csv` | Same structure — concatenate both for full 2022 coverage |
| PSES microdata 2020 | `EEINFODV_2020.csv.csv` | Same structure — SURVEYR = 2020 |
| Codebook | `2024 PSES Supporting Documentation.xlsx` | Question metadata, scale anchors, indicator groupings, cross-year question concordance |

**BT1-28 representation data — pre-extracted structured CSVs (use these; do not scan PDFs directly):**

| File | Rows | What one row is |
|------|------|-----------------|
| `knowledge/bt1_28_representation.csv` | 283 | One department × one fiscal year — rep % and headcount for all 4 EE groups vs WFA. Covers FY2021-22 through FY2024-25. |
| `knowledge/tables/01_cpa_summary.csv` | 41 | CPA-wide headline rep % vs WFA, one row per group per year |
| `knowledge/tables/02_historical_trend.csv` | 97 | CPA headcount and % since FY2015-16, all 4 groups |
| `knowledge/tables/03_executive_pipeline.csv` | 13 | EX-01 to EX-05 % by designated group |
| `knowledge/tables/04_workforce_flows.csv` | 59 | Hires, promotions, separations by group and year |
| `knowledge/tables/05_racialized_subgroups.csv` | 30 | Racialized subgroup headcount and % (overall + executives) |
| `knowledge/tables/06_racialized_trend.csv` | 360 | Racialized subgroup long-format trend, FY2017-18 onward |
| `knowledge/tables/07_indigenous_subgroups.csv` | 22 | First Nations, Métis, Inuit headcount and % |
| `knowledge/tables/08_disability_subgroups.csv` | 22 | Disability type headcount and % |
| `knowledge/tables/09_disability_trend.csv` | 192 | Disability subgroup long-format trend |
| `knowledge/tables/10_salary_distribution.csv` | 72 | Salary band distribution by designated group |
| `knowledge/tables/11_region_of_work.csv` | 76 | Region of work by designated group |
| `knowledge/tables/12_occupational_groups.csv` | 121 | Occupational group by designated group |
| `knowledge/tables/13_age_distribution.csv` | 45 | Age range distribution by designated group |
| `knowledge/tables/14_wfa_benchmarks.csv` | 16 | WFA benchmark % by census year and group |

**BT1-28 source PDFs (reference only — structured data already extracted above):**

| Source | File | Note |
|--------|------|------|
| Annual EE reports | `BT1-28-2020-eng.pdf` through `BT1-28-2025-eng.pdf` | PDFs are the authoritative source. The 2020 and 2021 PDFs are narrative-only (no structured department annexes). Department-level tables exist from FY2021-22 onward. |

**Before writing any data logic, read:**
- `knowledge/data-cautions.md` — 15 load-bearing cautions; items 1, 2, 3, 9, 10, 11 are the most likely to cause silent errors
- `knowledge/data-dictionary.md` — full BYCOND reference for all demographic groups and subgroups
- `knowledge/data-profile.md` — what each source covers and what it cannot support

**Critical facts the agent cannot guess:**
- All EEINFODV files are latin-1 encoded — open with `encoding='latin-1'`
- The public-service-wide aggregate LEVEL1ID differs by survey year: `"00"` in the 2020/2024 files, unpadded `"0"` in the 2022 files — and 2022 department IDs are unpadded too (`"1"` vs `"01"`). Zero-pad LEVEL1ID to 2 digits on load, then exclude `"00"`; `suppression_guard.load_eeinfodv()` enforces both (verified against all three years' files, 2026-07-02)
- Disability subgroup codes (EEDV_01–EEDV_15) are not mutually exclusive — do not sum them for a total disability count; use `D112` for headcounts
- WFA benchmark changed between the 2022 and 2023 BT1-28 reports (2016 Census → 2021 Census)
- "Visible Minorities" in 2020–2022 reports = "Racialized persons" in 2023–2025 reports — same population, harmonize label to "Racialized persons"
- Never show a WFA comparison for D117 (2SLGBTQIA+), D116 (religion), or D115 (ethnocultural origin) groups
- Column names differ across PSES years — `POSITIVE/NEUTRAL/NEGATIVE` (2024) vs `MOST_POSITIVE_OR_LEAST_NEGATIVE/NEUTRAL_OR_MIDDLE_CATEGORY/MOST_NEGATIVE_OR_LEAST_POSITIVE` (2020/2022); harmonize on load before any join
- The two 2022 files must be concatenated for full department coverage; each covers a different LEVEL1ID range
- The 2020/2022 files have a `.csv.csv` double extension — use exact filenames
- PSES RENUMBERED ITS QUESTIONS IN 2024 — the same code is a different question across cycles (e.g., harassment is Q63 in 2024 = Q62 in 2022 = Q60 in 2020; Q02 in 2024 is a different question than Q02 in 2020/2022). Never join years on QUESTION alone; use `knowledge/question_concordance.csv` (wording-matched, built 2026-07-02) via `skills/trend_comparability_guard.check_trend()` before plotting any multi-year experience trend
- PSES ALSO RE-CODED ITS DEMOGRAPHICS EVERY CYCLE — BYCOND codes mean different groups in different years (2020: D115B=Woman/'Female gender', D117x=Indigenous subgroups; 2022: EEDV_02=Woman, EEDV_21=Racialized; 2024: D111A/D112/D113/D114). No overall Indigenous or disability code exists in 2020/2022, and no overall racialized code in 2020 — group-level 3-cycle experience trends are only honest for Women (with a 'Female gender' caveat); subgroup lineages (First Nations, Métis, Inuit, Black, South Asian, cognitive, mental-health, seeing) span all three cycles. Never join years on BYCOND alone; use `knowledge/demographic_concordance.csv` (label-matched, built 2026-07-03)

---

## Capabilities

**Agent decides on its own:**
- How to compute gap-to-WFA (representation rate minus WFA benchmark, both from BT1-28)
- Which indicator themes to surface as headline metrics (use PSES themes: Workplace, Leadership, Wellbeing, Harassment and Discrimination, Career Development)
- How to visually flag the divergence signal (representation ≥ WFA but harassment score > 1 SD below the group's PS-wide average — thresholds derived from 2024 PSES; see GROUP_PARAMS in dashboard-mockup.html)
- How to handle departments with mixed suppression (some subgroup cells suppressed, others not) — show available cells, note suppressed ones explicitly

**Agent behavior is fixed — no discretion:**
- ANSCOUNT < 10 → display "suppressed (n < 10)", never a score
- WFA comparison → only for the four EE Act designated groups and their subgroups
- Scope label → always "core public administration", never "federal government"
- Causal language → never use "caused by", "proves", or "demonstrates discrimination"
- Subgroup data → always offer the breakdown; never hide it inside a group average

---

## Human-in-the-Loop

**Where the human has the final word:**
1. Any narrative that characterizes a specific named department as "underperforming" or "at risk" — human reviews before the output is shared externally
2. Any finding about harassment or discrimination scores for a specific group in a specific department — human confirms the framing before it is used in a presentation or report
3. Any year-over-year trend claim that spans the WFA benchmark change (2022 → 2023 reports) — human confirms the caveat about benchmark discontinuity is visible in the output

**Override rule:** If the human changes or removes a dashboard finding, that override is logged with a timestamp and a one-line reason. The log is part of the deployment record.

**What the agent does when uncertain:** Surfaces the uncertainty explicitly ("ANSCOUNT for this subgroup is below threshold in 14 of 20 departments — results are only reliable for the 6 departments shown") rather than silently dropping cells or filling with estimates.

---

## Current Prototype State — `dashboard-mockup.html`

Single-file HTML/JS/CSS prototype. No external dependencies except optional Ollama at `localhost:11434` for the Chat tab.

**Tabs implemented:**
- **Overview** — "How to read this data" collapsible section; Dashboard goal card (no-dataset sentence + 4 user questions); Benchmark explanation card (WFA definition, 2016 vs 2021 Census, what the gap means); Responsible Use amber caveat banner; KPI donut cards (CPA rep % vs WFA for all 4 groups); Representation vs. WFA bar chart; Divergence Signal Summary (stat boxes + segmented bar + dept×group priority table); Experience scores grid (4 groups × 6 PSES themes); Portfolio heatmap. *(Representation Trend line chart removed.)*
- **Department** — "How to read this data" collapsible section; Priority assessment cards (recruitment/culture/divergence/on-track — harassment score line removed from card body); Rep vs WFA table with subgroups; Intervention Recommendation card; Representation Trend chart (all groups); Year-over-Year Trend table (positioned immediately below trend chart); PSES experience theme cards (6 themes with PS avg comparison); Subgroup Experience panel (all 4 designated groups × 6 PSES themes — colour-coded chips). *(Experience vs. PS Average histogram removed.)*
- **Data Explorer** — "How to read this data" info panel (inline, not collapsible); sidebar dataset chips: Exec Pipeline, Workforce Flows, Salary, Subgroups, Region & Occ *(Overview chip removed)*; styled to match Overview/Department tabs (box-shadow, `#f0f2f5` background); filterable views of all 14 extracted BT1-28 CSV datasets
- **Executive Summary** — Implemented: 5 pre-written example findings with department/group tags, colour-coded by finding type (divergence, recruitment gap, widening gap, pipeline leakage, on track); human-in-the-loop caveat at bottom
- **Chat (Ollama)** — natural language Q&A via Ollama API (requires local Ollama instance); `async sendChat()` function with graceful offline error message; suggested-prompt panel

**Mock data scope (current):**
- REP object: 6 departments explicitly defined (DND, CRA, ESDC, IRCC, Health Canada, ISC); all other departments use `mkRep()` fallback and appear only in the Department tab
- EXP object: same 6 departments; others use `mkExp()` fallback
- Portfolio tables (heatmap, divergence table) show only the 6 explicitly defined departments — will expand automatically when wired to live `bt1_28_representation.csv`

**Divergence threshold (implemented):**
```javascript
const GROUP_PARAMS = {
  women:      { psH: 59, divT: 9  },  // PS avg=59, dept SD=8.8, n=139
  disability: { psH: 49, divT: 10 },  // PS avg=49, dept SD=10.2, n=126
  indigenous: { psH: 53, divT: 11 },  // PS avg=53, dept SD=11.2, n=77
  racialized: { psH: 64, divT: 9  },  // PS avg=64, dept SD=8.5, n=128
};
```
Derived from 2024 PSES EEINFODV.csv, n=470 dept-level observations (ANSCOUNT ≥ 10, SCORE100 < 9000). Source: Q63 harassment sub-indicator at LEVEL1ID='0'.

**Responsible use caveat:** Static amber banner at top of Overview tab — replaces automated divergence alert. Text: "Responsible use: This dashboard surfaces patterns for human review only. Gaps reflect representation relative to workforce availability benchmarks — they do not imply causation, discrimination, or individual misconduct. Every flagged department requires review by an EDI policy lead before any action is taken. Self-identification is voluntary; Persons with Disabilities counts are likely undercounted. Scope: Core Public Administration only."

**Known gaps before live deployment:**
- EXP data is mock — PSES microdata not yet parsed into the JS data objects
- Only 6 of ~80 in-scope departments have explicit mock data (DND, CRA, ESDC, IRCC, Health Canada, ISC); others use `mkRep()`/`mkExp()` fallbacks
- Chat tab requires Ollama running locally; not suitable for shared/hosted use without a backend
- No authentication or role-based view separation (CHRO vs DM view)

**File stability note:**
`dashboard-mockup.html` is synced via OneDrive. Large `Edit` tool calls on this file cause OneDrive to truncate it (drops `</script>`, `</body>`, `</html>`). After any edit, always verify with `node --check` and check that `</script>` count = 1. Use `bash cat >>` appends instead of `Edit` for content near the end of the file.
