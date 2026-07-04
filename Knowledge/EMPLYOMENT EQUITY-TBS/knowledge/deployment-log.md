# Deployment Log — Employment Equity Intelligence Dashboard

## Human-in-the-Loop Override Log
Any change to a dashboard finding must be recorded here with a timestamp and one-line reason (per CLAUDE.md rule).

| Timestamp | Finding changed | Reason | Reviewer |
|-----------|----------------|---------|----------|
| *(none yet)* | | | |

---

## Build Record

### Divergence Threshold — Empirical Derivation — 2026-06-30

**What changed:** Replaced the arbitrary 10-point experience-gap cutoff with a statistically defensible, per-group threshold derived from 2024 PSES microdata.

**Methodology (verifiable and reproducible):**

The divergence flag fires when a department's designated-group harassment score is more than **1 standard deviation below the PS-wide group average** — a standard statistical convention for "outside normal variation." Both the PS-wide averages and the department-level standard deviations were computed directly from `EEINFODV.csv` (latin-1 encoded, LEVEL1ID=0 for PS totals, LEVEL1ID≠0 for department rows, ANSCOUNT≥10, SCORE100<9000 to exclude suppression sentinel 9999).

| Designated Group | PS-wide avg (Q63) | Dept-level SD | 1-SD threshold | Flag if score below |
|-----------------|-------------------|--------------|----------------|---------------------|
| Women (D111A=1) | 59 | 8.8 (n=139) | 9 pts | 50 |
| Persons with Disabilities (D112=1) | 49 | 10.2 (n=126) | 10 pts | 39 |
| Indigenous Peoples (D113=1) | 53 | 11.2 (n=77) | 11 pts | 42 |
| Racialized Persons (D114=1) | 64 | 8.5 (n=128) | 9 pts | 55 |

**Notes:**
- Q63 is the PSES harassment experience question at the subindicator level (SUBINDICATORENG='Harassment'). The PS-wide aggregate (LEVEL1ID='0') has two rows per group — Q63 and Q64 — representing two survey questions under the Harassment subindicator. PS averages above are from Q63 only, consistent with how harassment scores are displayed in the dashboard.
- The pooled SD across all four groups is 10.2 — confirming that the previous arbitrary 10-point cutoff happened to land within 0.2 pts of the empirical 1-SD boundary. The per-group thresholds are more precise because they account for higher dispersion in Indigenous scores (smaller sample sizes, wider geographic range of departments).
- Thresholds are coded in `GROUP_PARAMS` in `dashboard-mockup.html` and referenced in all divergence-detection logic (portfolio counts, heatmap cells, alert banners, department priorities, bar chart coloring).
- The threshold applies to the harassment sub-indicator only. Experience theme cards (belonging, career, leadership, etc.) continue to use PS_AVG values for display context only — they are not used for divergence flagging.

**Human review required** before this threshold change is communicated externally or used to characterize any named department as underperforming.

---

### Data Pipeline Expansion — 2026-06-30 (update)

**What changed:** All 14 BT1-28 table types extracted from PDFs into structured CSVs and wired into app.py. Dashboard expanded from 3 tabs to 6 tabs. Representation vs WFA divergence detection now uses real extracted data, not a placeholder caption.

**New data files produced:**

| File | Rows | Content |
|------|------|---------|
| `knowledge/bt1_28_representation.csv` | 283 | Dept-level rep % vs WFA, FY2021-22 to FY2024-25 |
| `knowledge/tables/01_cpa_summary.csv` | 41 | CPA-wide rep vs WFA headline, all years |
| `knowledge/tables/02_historical_trend.csv` | 97 | Public service headcount and % since FY2015-16 |
| `knowledge/tables/03_executive_pipeline.csv` | 13 | EX-01 to EX-05 % by designated group |
| `knowledge/tables/04_workforce_flows.csv` | 59 | Hires, promotions, separations by group |
| `knowledge/tables/05_racialized_subgroups.csv` | 30 | Racialized subgroup headcount and % |
| `knowledge/tables/06_racialized_trend.csv` | 360 | Racialized subgroup long-format trend (2017/18 onward) |
| `knowledge/tables/07_indigenous_subgroups.csv` | 22 | First Nations, Metis, Inuit counts and % |
| `knowledge/tables/08_disability_subgroups.csv` | 22 | Disability type headcount and % |
| `knowledge/tables/09_disability_trend.csv` | 192 | Disability subgroup long-format trend |
| `knowledge/tables/10_salary_distribution.csv` | 72 | Salary band by designated group |
| `knowledge/tables/11_region_of_work.csv` | 76 | Region of work by designated group |
| `knowledge/tables/12_occupational_groups.csv` | 121 | Occupational group by designated group |
| `knowledge/tables/13_age_distribution.csv` | 45 | Age range by group |
| `knowledge/tables/14_wfa_benchmarks.csv` | 16 | WFA benchmark values by census year |

**Coverage:** FY2021-22 through FY2024-25 for all department-level tables. FY2015-16 onward for historical trend. BT1-28 2020 and 2021 PDFs (covering FY2019-20 and FY2020-21) are narrative format only — no structured department annexes extractable.

**Extraction method:** Targeted page extraction via pdfplumber (skills/extract_all_tables.py). Pages pre-catalogued by index to avoid full-scan timeouts. Column naming fixed post-extraction for historical_trend, racialized_subgroups, executive_pipeline, occupational_groups, and region_of_work.

**Critical data cautions applied:**
- WFA benchmark labelled per year: 2016 Census for FY2021-22; 2021 Census from FY2022-23 onward
- "Visible minorities" label in 2022 report harmonised to "Racialized persons" in all CSVs
- 75 rows carry suppressed_flag="yes" (small departments with * cells in source PDFs)
- Disability subgroup codes are not mutually exclusive — headcount totals use D112, not subgroup sums

---

### Day 2 Build — 2026-06-30 (original)

**Stack:** HTML prototype (`dashboard-mockup.html`) + Streamlit live app (`app.py`)

**Capability-to-form map — updated:**

| # | Verb | Form |
|---|------|------|
| 1 | Load EEINFODV CSVs | Fixed pipeline (`load_eeinfodv` in suppression_guard.py) |
| 2 | Extract BT1-28 PDFs | Fixed pipeline (`skills/extract_bt128.py`, `skills/extract_all_tables.py`) |
| 3 | Suppress ANSCOUNT < 10 | **Skill: suppression-guard** (`skills/suppression_guard.py`) |
| 4 | Validate WFA scope | Skill: wfa-scope-guard (enforced via UI captions; full skill planned) |
| 5 | Compute gap to WFA | Native action (in app.py Portfolio and Department tabs, using real bt1_28_representation.csv) |
| 6 | Compute YoY rep trend | Native action (Representation Trends tab, using real 02_historical_trend.csv) |
| 7 | Aggregate PSES scores | Fixed pipeline (score_for_group in app.py) |
| 8 | Detect divergence signal | Native action (Portfolio tab — rep >= WFA AND exp gap <= -10, using real data) |
| 9 | Classify portfolio cells | Native action (status column: DIVERGENCE / Experience gap / Below WFA / Near avg) |
| 10 | Compute & interpret YoY experience trend | Subagent: trend-analyst + Skill: trend-comparability-guard |
| 11 | Generate executive summary | Subagent: summary-writer (simulated in HTML; future: live LLM) |
| 12 | Answer user questions in natural language | Connector: Ollama (`localhost:11434`, in HTML mockup) |
| 13 | Show data distribution / interactive explorer | Fixed pipeline (Explorer tab in HTML; Raw Data tab in app.py) |
| 14 | Show subgroup breakdown | Fixed pipeline (Subgroups tab in app.py, using 05-09 CSVs) |
| 15 | Show executive pipeline | Fixed pipeline (Annex Data tab, using 03_executive_pipeline.csv) |
| 16 | Show workforce flows / salary / region / occ | Fixed pipeline (Annex Data tab, using 04, 10, 11, 12 CSVs) |

**Skills built:**
- `skills/suppression_guard.py` — suppression-guard skill, 4/4 self-tests pass
- `skills/extract_bt128.py` — fixed pipeline for department-level representation extraction
- `skills/extract_all_tables.py` — fixed pipeline for all 14 BT1-28 table types

**Oracle tests run:**

| Test | Expected | Result |
|------|----------|--------|
| LEVEL1ID="00" excluded from output | Not in df | PASS |
| Low-ANSCOUNT row (n=5) suppressed | SCORE100 = NA | PASS |
| Valid row (n=500) not suppressed | SCORE100 = 81 | PASS |
| 2020 column names harmonized | POSITIVE in columns | PASS |
| bt1_28_representation.csv rows | 283 rows | PASS |
| WFA census labelled correctly | 2016 Census for FY2021-22; 2021 Census from FY2022-23 | PASS |

**Human review flags (per CLAUDE.md):**
- Any narrative characterizing a specific department as "underperforming" → requires DM/CHRO review before external release
- Harassment/discrimination findings for specific groups → human confirms framing
- Any YoY trend claim spanning the FY2021-22 → FY2022-23 WFA benchmark change → caveat must be visible in output

**Known limitations (prototype):**
- Department name matching between BT1-28 and PSES is by string proximity — some departments may not auto-match; manual override available in Department tab
- BT1-28 coverage for dept-level tables starts at FY2021-22 (2020 and 2021 PDFs are narrative format only)
- PSES microdata covers 2020, 2022, 2024 only — no survey data for FY2021-22 or FY2023-24
- Ollama connector requires local `ollama serve` (HTML mockup only) — graceful error shown if offline
- Summary subagent simulated in HTML; wiring to live LLM call is a future step

**Next build steps:**
1. Deploy app.py to Streamlit Community Cloud (free public URL) — Task #13
2. Push all code + extracted CSVs to GitHub for group member access
3. Wire summary-writer subagent to Ollama or Claude API for live narratives
4. Add wfa-scope-guard skill (prevent WFA comparison for D117/D116/D115 groups programmatically)
5. Improve BT1-28 ↔ PSES department name matching (consider a mapping table)

---

### UI Refinement Session — 2026-07-02

**What changed:** Multiple UI improvements and bug fixes to `dashboard-mockup.html` across two sessions (2026-07-01 and 2026-07-02). No data logic or threshold changes.

**UI changes applied:**

| Change | Tab | Details |
|--------|-----|---------|
| "How to read this data" collapsible | All tabs | Collapsible panel at top of each tab with 5 context bullets per tab (portfolio, dept, explorer) |
| Dashboard goal card | Overview | No-dataset sentence + 4 user questions card; blue styled |
| Benchmark explanation card | Overview | Explains WFA, 2016 vs 2021 Census discontinuity, and what the gap means for action |
| Representation Trend chart removed | Overview | Removed CPA-wide trend line chart from Overview tab |
| Harassment line removed from priority cards | Department | Priority cards no longer show raw harassment score — reduces risk of out-of-context use |
| YoY Trend table repositioned | Department | Moved immediately below the Representation Trend chart (was at bottom of tab) |
| Experience vs. PS Average histogram removed | Department | Removed `expBarCard` (SVG bar chart) — replaced by subgroup experience panel |
| Subgroup Experience panel — all 6 themes | Department | Expanded from harassment-only to all 6 PSES themes (H&D, Belonging, Career, Leadership, Workplace, Wellbeing); colour-coded chips per subgroup |
| Overview chip removed from Explorer sidebar | Data Explorer | Removed 'Overview' chip from dataset view buttons |
| Explorer tab styling | Data Explorer | Updated to match Overview/Department tabs: `box-shadow: 0 1px 4px rgba(0,0,0,.06)`, background `#f0f2f5` |
| Executive Summary tab implemented | Executive Summary | 5 pre-written findings with type tags; human-in-the-loop caveat at bottom |
| Chat tab implemented | Chat | `renderChat()` + `async sendChat()` + suggested-prompt panel; graceful offline error |
| Footer deduplication guard | All tabs | `if(document.querySelector('.footer'))return;` prevents double-footer on tab switch |

**Bug fixes:**

| Bug | Root cause | Fix |
|-----|-----------|-----|
| Blank Overview tab | `function trendArrow(arr){` declared twice (nested) | Removed duplicate outer declaration |
| Syntax error in `buildHowToRead` | Unescaped single quotes inside single-quoted onclick string | Escaped with `\'` |
| Syntax error at `buildRepRows` | Orphan duplicate lines 750-752 after function close | Removed orphan lines |
| Orphan code after `buildTrendRows` | Old `buildExpBarChart` SVG body + duplicate function declarations left in file | Removed entire orphan block (33 lines) |
| Missing `glabel()` helper | Lost in corruption — never re-added | Added `function glabel(g){return{racialized:...,women:'Women'}[g]||g;}` to helpers section |
| Missing `renderSummary()` and `renderChat()` | Functions were completely absent from file | Implemented both functions |
| Raw JS code rendered as page text | `buildSubgroupView()` template literal was never closed; `renderSummary`/`renderChat` definitions missing | Closed template literal, added complete tbody content for all 3 subgroup tables (RAC_SUBS, IND_SUBS, DIS_SUBS), added both missing functions |
| 4152 null bytes in file | OneDrive truncation wrote null bytes | Truncated at first null byte using binary read |

**OneDrive truncation pattern documented:**
Every large `Edit` tool call on `dashboard-mockup.html` (which is OneDrive-synced) truncates the file — typically losing `</script>`, `</body>`, `</html>`. Recovery procedure: `cat >>` append with the missing closing tags, then verify `</script>` count = 1 and `node --check` passes. Future edits near the end of the file should use `bash cat >>` instead of the Edit tool.

**Human review flags:** None — no data thresholds, suppression logic, or divergence characterizations changed.


---

### Step 5a — Department-name mapping + LEVEL1ID bug fix — 2026-07-02

**Capability built:** `knowledge/dept_name_mapping.csv` — explicit BT1-28 ↔ PSES LEVEL1ID mapping replacing string-proximity matching. 79 departments, all accounted for: 53 exact, 6 manual (renames/variants/typos), 16 micro-orgs (PSES [95] combined only), 2 review_needed (FedNor — rejected wrong fuzzy match to Southern Ontario [93]; Info+Privacy Commissioners — partial overlap with [80]), 2 excluded ("Total" aggregate rows from PDF extraction).

**Bug found and fixed:** PS-wide aggregate LEVEL1ID is "00" in 2020/2024 files but unpadded "0" in 2022 files; 2022 dept IDs also unpadded ("1" vs "01"). `suppression_guard.py` excluded only "00", so the 2022 PS-wide row leaked into department-level analysis and cross-year joins on LEVEL1ID silently failed. Fix: zero-pad LEVEL1ID on load (`.str.zfill(2)`), then exclude "00". New oracle test added (2022-style "0" excluded, "1" → "01"); verified against real EEINFODV_2022_dept0-35 rows. CLAUDE.md and data-cautions.md corrected (both previously stated a single-year fact as universal).

**Note:** stale `skills/__pycache__` can shadow the fixed module (OneDrive preserves old mtimes). Delete `skills/__pycache__` from Windows Explorer, or run Python with a fresh copy, before trusting test output.

**Human review:** two review_needed mapping rows await a human decision before those departments join representation×experience views.

---

### Step 5b + 5c — wfa-scope-guard and trend-comparability-guard — 2026-07-02

**5b — `skills/wfa_scope_guard.py` (hard gate).** `assert_wfa_allowed(group)` raises `WfaScopeError` for D115/D116/D117 (by code or display name, accent-insensitive) and for any unrecognized group (fail closed); passes the four designated groups, their subgroups, and label variants incl. "Visible minorities". Wired into app.py at all 3 `GROUP_REP_COLS` call sites — no WFA comparison can now render unguarded. Self-test: 3/3 pass.

**5c — `skills/trend_comparability_guard.py` (advisory) + `knowledge/question_concordance.csv`.** MAJOR FINDING: PSES renumbered its questions in 2024 — the same code points to different questions across cycles (harassment: Q63/2024 = Q62/2022 = Q60/2020; Q02/2024 ≠ Q02/2020-2022). Concordance built by matching question WORDING across all three years' microdata: 127 comparable_3yr, 11 comparable_3yr_minor_wording, 7 comparable_2yr, 3 new_in_2024, 79 discontinued_after_2022. `check_trend(code)` returns per-year codes + warnings. Wired into app.py YoY harassment trend — replaced a hardcoded caption that claimed guard verification before the guard existed. Self-test: 3/3 pass (oracles: Q63 mapped correctly; Q02 same-code join caught; unknown question fails safe). CLAUDE.md critical facts updated.

**Verification:** `app.py` parses clean; end-to-end import test passes (guards resolve from app.py context, D117 blocked, Q63 concordance correct).

**Human review:** the 11 minor-wording questions and the theme-level averaging note (scores average the full Harassment indicator theme, not Q63 alone) should be reviewed before any external trend claim.

**Mapping decisions — 2026-07-02 (human approved):** FedNor and Offices of the Information and Privacy Commissioners set to `unmatched` — representation shown, no experience scores. Rationale: FedNor has no PSES equivalent; Info+Privacy is a combined BT1-28 entity vs a single PSES office ([80]) — pairing would mislead.

---

### Step 6 — Pre-aggregated PSES prepared files — 2026-07-02

**Built:** `knowledge/pses_prepared/` — pses_2020.csv.gz, pses_2022a/b.csv.gz, pses_2024.csv.gz (~27 MB total vs 2.3 GB raw). One offline pass per file through suppression_guard: latin-1, column harmonization, LEVEL1ID zero-padding, aggregate-row exclusion, ANSCOUNT<10 suppression, dept-level rows only (LEVEL2ID=0). app.py `load_all_pses()` now prefers these files and falls back to raw microdata when present — the app can deploy to Streamlit Cloud within GitHub limits.

**Two bugs found by the oracle check (DND × Women × Harassment × 2024):**
1. `score_for_group` filtered on INDICATORENG only, but Harassment exists only at SUBINDICATORENG level in all three PSES years — every harassment score in app.py silently returned "no data". Fixed: theme mask now checks both columns.
2. PSES sentinel 9999 ("not calculable") in SCORE100 passed suppression when ANSCOUNT>=10, inflating means (oracle first returned 9585/100 — impossible). Fixed in suppression_guard (rule 4: SCORE100>=9000 suppressed, reason "score not calculable (sentinel 9999)"); 297,642 sentinel rows suppressed in 2024 prepared file alone; all four prepared files patched.

**Oracle result (after fixes):** DND × Women × Harassment × 2024 = 62.0/100, ANSCOUNT 12,155, 2 question cells — identical from prepared file and independent raw computation. Value plausible.

**Chat tab decision (human approved):** dropped for deployed version — Ollama is localhost-only; app.py has no chat dependency. HTML mockup chat unaffected for local demos.

**Note:** GROUP_PARAMS divergence thresholds were derived WITH the SCORE100<9000 filter, so they are unaffected by bug 2.

---

### Step 8 (during live testing) — PSES demographic re-coding discovered; app.py group codes fixed — 2026-07-03

**Finding (load-bearing):** PSES re-coded its demographic BYCOND codes every cycle, exactly as it renumbered questions. 2020: D115B=Woman-as-'Female gender', D117x=Indigenous subgroups, D119x=disability subgroups, D121x=visible-minority subgroups — NO overall codes for Indigenous/disability/racialized. 2022: EEDV_02=Woman, EEDV_21=Racialized — NO overall Indigenous/disability codes. 2024: D111A/D112/D113/D114 + EEDV subgroups. Consequences: (1) app.py's GROUPS had Indigenous=D112/disability=D113 SWAPPED for 2024 and matched nothing in 2020/2022 — live app showed harassment scores only for 2024 and would have mislabeled Indigenous↔disability; (2) group-level 3-cycle trends are only honest for Women (with a 'Female gender' 2020 definitional caveat); Racialized = 2022+2024 only; Indigenous & disability = 2024 only at group level; (3) subgroup lineages (First Nations, Métis, Inuit, Black, South Asian, cognitive, mental-health, seeing) DO span all three cycles.

**Built:** `knowledge/demographic_concordance.csv` — canonical group/subgroup → per-year BYCOND, with per-row caveats. `app.py` GROUPS now per-year dicts; `score_for_group`/`suppressed_count` resolve codes per year and return "no data" (never zero/suppressed) when a group has no code that cycle.

**Oracle (3-cycle, DND × Women × Harassment):** 2020=69.0 (n=12,788), 2022=64.0 (n=11,310), 2024=62.0 (n=12,155) — plausible declining trend, verified from prepared files.

**Pending:** wire real data into dashboard-mockup.html (user directive: deployed app must look exactly like the mockup) via a generated JS data block + static hosting.

---

### index.html — the mockup wired to real data — 2026-07-03

**Built:** `index.html` = pixel-identical copy of dashboard-mockup.html with all mock data replaced by generated real data (skills/build_dashboard_data.py): DEPTS/REP from bt1_28_representation.csv via dept_name_mapping (53 departments), EXP from prepared PSES via demographic_concordance (14 group/subgroup lineages × 6 themes × 3 cycles), PS_AVG from PS-wide (LEVEL1ID=00) 2024 rows. 18 counted code patches add a third cell state: number = score, 's' = suppressed (n<10/sentinel), null = "n/a — not surveyed that cycle" (never displayed as suppressed). Rep year slots = fiscal years; FY2020-21 slot is n/a (BT1-28 has no dept annex before FY2021-22). Dept-level subgroup representation left empty — BT1-28 publishes no dept-level subgroup annex; subgroup EXPERIENCE is real and dept-level.

**Verified:** node --check clean; single </script>; 4 oracles pass in Node: DND women harassment [69,64,62]; DND women rep FY2022-23 = 42.4 (matches live Streamlit app); DND indigenous harassment [null,null,58] (no overall code pre-2024 — honest n/a); DND First Nations [62,64,57] (3-cycle subgroup lineage).

**Hosting decision (user):** Vercel Hobby (free, supports private repo, auto-deploys from main — same governance as Streamlit app).

**index.html fix — 2026-07-03:** live-site check caught the department <select> still carrying the 26 hardcoded mock departments (old keys -> would have routed to fabricated mkRep/mkExp fallback data). Rebuilt options from real DEPTS (53 departments, alphabetical) and neutered mkRep/mkExp to all-null shapes — fallback can now only ever display "n/a", never fabricated scores. Node checks: 53/53 keys have REP+EXP; no digits in fallbacks.

**index.html — live-use feedback round 1 — 2026-07-03:** (1) Executive Summary was still the 5 hardcoded mock findings citing numbers that contradict the real data — replaced with renderSummary() that COMPUTES findings from live REP/EXP at render time (top-3 divergence flags, top-3 recruitment gaps, 1 on-track; per-group 1-SD thresholds; ANSCOUNT shown; human-review banner; "Regenerate" button). First real computed findings: CBSA racialized + Indigenous divergence, GAC racialized divergence. (2) Chat tab now states plainly it cannot work on the hosted site (Ollama is local-only) with instructions for local use. (3) Reported tab-switching failure could not be reproduced — all 5 tabs render in simulation; suspected stale browser cache of previous deployment; awaiting user hard-refresh confirmation.

**index.html — live-use feedback round 2 — 2026-07-03:** user requested the Executive Summary be generated on demand and scoped to the selected filters (like the chat Send button). Implemented generateSummary(): reads department/group/subgroup/year filters, computes findings for that scope only — divergence flags, recruitment gaps, experience gaps, on-track, plus honest no-data cards (with the "no overall Indigenous/disability code before 2024" note) and suppressed cards. Subgroup selections produce experience-only findings (no WFA — none exists at dept-subgroup level) with 3-cycle trends. All-departments scope caps at top 8 by severity. Verified in simulation: DND+Women+2024 recruitment-gap card; DND+Indigenous+2020 no-data note; DND+First Nations 3-cycle trend card; All+Racialized surfaces GAC divergence (30.2% rep vs 22.7% WFA, harassment 48/100 vs 64 avg) — the CLAUDE.md gold-example pattern, from real data.

**index.html — live-use feedback round 3 — 2026-07-03:** user found generated summaries too thin vs the mockup narratives. Enriched generateSummary(): each finding now includes representation trend with the 2016→2021 Census benchmark-change caveat when the trend spans it (CLAUDE.md human-review item 3), harassment trend across cycles, weakest non-harassment theme vs PS average, worst-scoring subgroup callout ("the group average hides this"), and the voluntary self-ID caveat for disability findings. Verified example (Administrative Tribunals × Racialized): on-track headline now also surfaces Black employees at 40/100 harassment vs group average 68 — the divergence-in-miniature the dashboard exists to expose.

**index.html — grounded chat — 2026-07-03:** chat system prompt now carries (1) a source registry — BT1-28 annual reports (canada.ca) and PSES EEINFODV microdata (open.canada.ca), with the census benchmark-change note; (2) CPA-wide representation aggregates FY2022-23..FY2024-25 computed from the BT1-28 annex rows (labelled as computed, verified against published figures); (3) the currently selected department's full REP+EXP snapshot with cell-semantics legend; (4) PS_AVG + GROUP_PARAMS; (5) hard grounding rules: answer only from provided data, name the source document when data is absent, never invent a number, no causal language. ~1.4k tokens per message. Verified in simulation: prompt contains DND snapshot incl. rep 42.4 when DND selected. Full ask-anything over raw PDFs/microdata noted as out of scope for a static page — requires a retrieval backend (Day 3 future-work item).

**Deployment confirmed live — 2026-07-03:** cache-busted fetch of emplyoment-equity-tbs.vercel.app confirms the current build is serving (53 real departments, scoped summary, grounded chat). Earlier "stale site" reports were CDN/browser cache. Known cosmetic issue for next round: two department names carry a stray '¥' from PDF extraction ("Crown-Indigenous Relations and Northern Affairs Canada¥", "Health Canada¥") — harmless, cleans up in dept_name_mapping + regeneration. Day 2 complete; Use week begins.
