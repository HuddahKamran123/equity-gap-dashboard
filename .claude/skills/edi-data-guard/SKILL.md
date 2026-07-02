---
name: edi-data-guard
description: Validate the Employment Equity Gap dataset before any analysis, dashboard build, or publication. Use whenever a new or updated employment-equity CSV (TBS representation + PSES) is about to be processed — it runs seven checks (columns, equity-group labels, numeric formatting, suppression handling, WFA benchmark match, gap arithmetic, year-over-year coverage) and blocks the run if any fail. Use before building data/equity.json or refreshing the dashboard.
---

# edi-data-guard

A **hard gate** for the Employment Equity Gap dataset. Government equity numbers are read confidently and acted on — a wrong column, a substituted benchmark, or a suppressed cell quietly imputed to zero ships as a "correct" number and misdirects a real review. This skill writes the standard down once (`references/columns.json`) and enforces it in code (`scripts/validate.py`) on every run, so the rule is enforced, not hoped for.

## When to run it

- Before the data pipeline builds `web/data/equity.json`.
- Whenever the TBS representation CSV or the PSES enrichment is refreshed.
- Before publishing or quoting any number from the dataset.

## How to run it

```bash
python3 .claude/skills/edi-data-guard/scripts/validate.py [path/to/dataset.csv]
```

Default path is `Knowledge/data/processed/employment_equity_department_gaps.csv`.
It **exits 0** when clean and **exits 1** when any check fails — wire it as a build
gate so a failing dataset stops the pipeline.

## The seven checks

1. **Columns** — every required column is present and exactly named (catches renames/typos that silently drop data).
2. **Equity-group labels** — every `equity_group` is one of the four canonical values: `Women`, `Indigenous Peoples`, `Persons with Disabilities`, `Members of Visible Minorities`. Rejects variants like `Visible Minorities`.
3. **Numeric formatting** — percent/numeric columns are clean floats; a value like `"4.1%"` (percent stored as a string) fails before it corrupts a computation.
4. **Suppression** — a blank `designated_group_members` must have a blank `representation_percent` and `gap` too; blanks mean *suppressed for privacy*, never zero. Genuine zeros are surfaced for confirmation.
5. **WFA benchmark** — `workforce_availability_percent` matches the known service-wide value for that group and fiscal year (see `references/columns.json`). WFA is the only valid benchmark; substituting another denominator fails.
6. **Gap arithmetic** — independently recomputes `expected_number = all_employees × WFA/100`, `gap = members − expected`, and `representation_percent = members/all × 100`, and fails on any mismatch beyond tolerance.
7. **Year-over-year coverage** — reports departments present in both fiscal years (the only ones eligible for trend lines) and warns when a department drops out.

## Editing the rules

The benchmarks, valid labels, required columns, and tolerances live in
`references/columns.json` — update that file when TBS publishes new WFA values or
adds a fiscal year. Do not hard-code rules in the script; the reference file is the
single source of truth so the standard is auditable and changes in one place.

## Output

Per-check `PASS` / `WARN` / `FAIL` lines with the offending rows, then a final
`PASSED` or `BLOCKED` summary. A non-zero exit is the proof it works — verify
behaviour by running it on a deliberately broken copy, not by trusting a green line.
