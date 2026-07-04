# Employment Equity Intelligence Dashboard

MMA 616 group project (University of Alberta). A Streamlit dashboard that lets the
TBS Chief Human Resources Officer and Deputy Ministers see, for every department in
the Core Public Administration, which designated groups meet representation targets
on paper while reporting the worst workplace experiences in the public service.

## Run locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

The app loads from `knowledge/pses_prepared/` (~27 MB, committed) — no raw microdata
needed. If the raw EEINFODV CSVs are present in the project folder, it can fall back
to them.

## What's in here

| Path | What it is |
|------|-----------|
| `app.py` | The Streamlit app (deploy target) |
| `CLAUDE.md` | The living spec — objective, scope, fixed rules, data cautions |
| `knowledge/pses_prepared/` | Department-level PSES extracts, 2020/2022/2024 — suppression, sentinel-9999 removal, and LEVEL1ID padding applied at build time |
| `knowledge/bt1_28_representation.csv` + `knowledge/tables/` | Structured representation data extracted from BT1-28 annual reports |
| `knowledge/dept_name_mapping.csv` | BT1-28 ↔ PSES department mapping (explicit, no fuzzy fallbacks) |
| `knowledge/question_concordance.csv` | Cross-year question mapping — PSES renumbered its questions in 2024 |
| `skills/` | Guard modules: suppression-guard, wfa-scope-guard, trend-comparability-guard |
| `knowledge/deployment-log.md` | Build record, bugs found, human decisions, override log |
| `dashboard-mockup.html` | Original walking-skeleton prototype (not the deploy target) |

## Non-negotiable data rules

Cells with ANSCOUNT < 10 display "suppressed", never a score. No WFA comparison for
2SLGBTQIA+, religion, or ethnocultural origin groups (no benchmark exists). Scope is
Core Public Administration only — never "federal government". No causal language.
Multi-year question trends must go through `skills/trend_comparability_guard.py`.

## Governance

Every change to `main` passes one human review (pull request) before merge — a push
to `main` redeploys the live app. Overrides of dashboard findings are logged in
`knowledge/deployment-log.md`.
