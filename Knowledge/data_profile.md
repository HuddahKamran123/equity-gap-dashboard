# Data Profile

> **Day-3 correction.** This note describes the original processed CSV. The rebuilt
> dashboard is fed by a reproducible pipeline (`pipeline/`) that recomputes PSES
> from the raw `EEINFODV.csv`. Two changes supersede the figures below: **four**
> PSES indicators are used, not five (*mobility & retention* is suppressed at the
> department × equity-group breakdown and omitted), and **discrimination is now
> populated** (it was empty in the original). Authoritative shape/coverage:
> `web/src/data/meta.json`; method and rules: `CLAUDE.md`.

## Datasets

### Dataset 1 — TBS Employment Equity Demographic Snapshots

**Name:** Government of Canada Public Service Employment Equity Representation Data  
**Source:** Treasury Board of Canada Secretariat — published annually  
**Processed file:** `data/processed/employment_equity_department_gaps.csv`

**Shape:**
- 424 rows total
- 140 rows: 2023-24 (35 departments × 4 equity groups)
- 284 rows: 2024-25 (71 departments × 4 equity groups)
- 29 suppressed rows (blank designated_group_members/gap) in 2024-25

**Unit of analysis:** One row = one department × one equity group × one fiscal year

**Equity groups:** Women, Indigenous Peoples, Persons with Disabilities, Members of Visible Minorities

**Key fields:** department_agency, equity_group, fiscal_year, all_employees, designated_group_members, representation_percent, workforce_availability_percent, expected_number, gap

**Known quality issues:**
- Some values may be suppressed (blank) to protect privacy in small departments
- Department names may differ slightly between fiscal years — check before joining
- 2023-24 data was truncated at 35 departments (TBS snapshot page covered fewer agencies)
- Percent columns arrive as strings in raw source (e.g. "4.1%") — cast to float before computation
- Self-identification is voluntary; Persons with Disabilities is likely undercounted

**WFA benchmarks (service-wide):**

| Group | 2023-24 | 2024-25 |
|---|---|---|
| Women | 55.3% | 54.9% |
| Indigenous Peoples | 4.1% | 4.0% |
| Persons with Disabilities | 12.0% | 12.0% |
| Members of Visible Minorities | 22.7% | 22.7% |

---

### Dataset 2 — PSES 2024 (Public Service Employee Survey)

**Name:** Public Service Employee Survey 2024 — results by equity group and department  
**Source:** EEINFODV.csv (raw file in uploads)  
**Processed into:** 5 additional columns in `employment_equity_department_gaps.csv` (2024-25 rows only)

**Shape (raw):** 1,627,293 rows × 35 columns  
**Shape (extracted):** 280 dept × equity group combinations × 5 key subindicators

**Key equity group codes used:**
- D111A = 1 → Women
- D112 = 1 → Persons with Disabilities
- D113 = 1 → Indigenous Peoples
- D114 = 1 → Members of Visible Minorities

**Subindicators extracted:**
- Employee engagement → pses_engagement
- Diversity and inclusion → pses_diversity_inclusion
- Harassment → pses_harassment
- Discrimination → pses_discrimination
- Mobility and retention → pses_mobility_retention

**Coverage in CSV:** 187 of 284 2024-25 rows enriched (66%). 97 gaps are smaller agencies not covered in PSES.

**Known quality issues:**
- SCORE100 = 9999 is a suppression code — stored as blank, not zero
- PSES 2024 maps to 2024-25 fiscal year only; 2023-24 rows have blank PSES columns
- Department names in PSES differ slightly from TBS names in a few cases (mapped during processing)
- PSES measures employee *experience*, not representation — do not conflate with gap data

---

## Responsible-Use Note

Representation gaps should be interpreted as signals for further human review, not proof of discrimination or automatic evidence of policy failure. PSES scores provide contextual experience data that can inform the type of review recommended, but they do not establish causes. Both datasets are aggregate-level and must not be used to make claims about individuals.
