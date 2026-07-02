# Data Dictionary

## TBS Employment Equity Fields

| Field | Meaning | Notes |
|---|---|---|
| department_agency | Federal department or agency name | Main comparison unit; names match TBS snapshot exactly |
| equity_group | Employment equity group | One of: Women, Indigenous Peoples, Persons with Disabilities, Members of Visible Minorities |
| fiscal_year | Fiscal year of the snapshot | "2023-2024" or "2024-2025" |
| all_employees | Total employees in the department | Used as denominator for rep% and for gap headcount context |
| designated_group_members | Number of employees in the equity group | Actual representation count; blank = suppressed (small N, not zero) |
| representation_percent | designated_group_members / all_employees × 100 | Stored as float; arrives as string in raw CSV (e.g. "4.1%") — cast before use |
| workforce_availability_percent | Service-wide WFA benchmark for the equity group and fiscal year | Stored as float; use only the service-wide figures in this dataset |
| expected_number | all_employees × (workforce_availability_percent / 100) | The headcount the department would have at benchmark |
| gap | designated_group_members − expected_number | Negative = below benchmark; blank if designated_group_members is suppressed |

## PSES 2024 Fields (2024-25 rows only)

These columns are populated for 2024-25 rows where a matching department exists in the PSES 2024 survey. Blank = department not in PSES or result suppressed (small N). Do not treat blank as zero.

| Field | PSES Subindicator | Meaning | Range |
|---|---|---|---|
| pses_engagement | Employee engagement | Overall employee engagement score for the equity group in this department | 0–100 |
| pses_diversity_inclusion | Diversity and inclusion | Score on diversity and inclusion survey questions | 0–100 |
| pses_harassment | Harassment | Score on harassment questions — higher means less harassment reported | 0–100 |
| pses_discrimination | Discrimination | Score on discrimination questions — higher means less discrimination reported | 0–100 |

> **Correction (Day 3):** Only these **four** PSES indicators are published at the
> department × equity-group breakdown and are used by the rebuilt dashboard.
> *Mobility and retention* is **suppressed at this granularity** (its questions
> return the 9999 code), so it is omitted rather than shown empty. Each indicator
> is computed as the mean of its non-suppressed SCORE100 questions from the raw
> `EEINFODV.csv`. Authoritative definitions: `CLAUDE.md` and `web/src/data/meta.json`.

## Dashboard-Computed Fields (not in CSV, computed in D array)

| Field | Meaning |
|---|---|
| severity | Categorical gap severity: slight / moderate / substantial / severe / above (if above benchmark) |
| recommendation | Plain-language signal text produced by interpretation-guardrails |
| prior_gap | Gap value from the prior fiscal year (blank if no trend data) |
| prior_rep_pct | Representation % from the prior fiscal year |
| priority | Boolean — true if in the bottom quartile of gaps for the equity group |
| has_trend | Boolean — true if the department appears in both fiscal years |

## Key Rules

- `representation_percent` must never be averaged across equity groups — each group's WFA is benchmarked against a different segment of the Canadian labour market.
- WFA is the only valid benchmark for gap calculation. Do not substitute total public service averages.
- Blank `designated_group_members` means the value was suppressed to protect privacy. Treat as missing, not zero.
- PSES scores are contextual signals only — do not combine them with rep% in a formula or use them as a ranking denominator.
