#!/usr/bin/env python3
"""
build_service_wide_context.py — extract 6 real, service-wide-only BT1-28 tables
(racialized subgroups, Indigenous subgroups, disability subgroups, salary
distribution, age distribution, WFA benchmark history) for reference display.

These are genuinely real government tables (not fabricated), sourced from the
same "parallel build" investigated in the 2026-07-03 decisions (CLAUDE.md §3,
Deployment_Log.md) — but they are SERVICE-WIDE, not per-department, which is why
they're shown as reference context only, never mixed into the per-department
decision-support views (Explore/Compare/Track/Present).

The source CSVs are genuinely messy real-world extractions (notes embedded as
data rows, inconsistent column naming across fiscal-year print runs, a
duplicate/shifted "Indigenous Peoples" column in the salary and age tables, and
one confirmed data-quality bug: the Indigenous-subgroups table's most recent
year, FY2024-25, is mislabeled — it lists racialized subgroup names (Black,
Chinese, Filipino, etc.) instead of Indigenous ones (First Nations, Métis,
Inuit). That year is skipped in favour of the last correctly-labeled year,
FY2023-24. Each choice below is a deliberate, commented judgment call, not a
generic parser — matching this project's standard of never silently guessing.

Run:  python3 pipeline/build_service_wide_context.py
"""
import csv, json, re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RAW = REPO / "Knowledge" / "EMPLYOMENT EQUITY-TBS" / "knowledge" / "tables"
OUT_DIR = REPO / "web" / "src" / "data"


def rows(name):
    return list(csv.reader(open(RAW / name, encoding="utf-8-sig")))


def pct(v):
    v = (v or "").strip().replace("%", "").replace(",", "")
    if v in ("", "n/a", "n/a*", "*"):
        return None
    try:
        return float(v)
    except ValueError:
        return None


def num(v):
    v = (v or "").strip().replace(",", "")
    if v in ("", "*"):
        return None
    try:
        return int(v)
    except ValueError:
        return None


def racialized_subgroups():
    # Same mislabeling bug as the Indigenous table: FY2024-25 rows here list
    # Indigenous subgroup names (Inuit, Métis, First Nations) instead of
    # racialized ones — use FY2023-24 instead, the last correctly-labeled year
    # with a complete "Total" row. Columns 4/5 = overall n/%, 6/7 = executive n/%.
    out = []
    for r in rows("05_racialized_subgroups.csv")[1:]:
        if len(r) < 8 or r[0] != "FY2023-24" or r[3] == "Total" or r[3].startswith("Note"):
            continue
        out.append({
            "subgroup": r[3],
            "overall_n": num(r[4]),
            "overall_pct": pct(r[5]),
            "executive_n": num(r[6]),
            "executive_pct": pct(r[7]),
        })
    return {"fiscal_year": "2023-2024", "rows": out}


def indigenous_subgroups():
    # FY2024-25 rows in this table are mislabeled (racialized subgroup names
    # under designated_group="Indigenous peoples") — a confirmed source bug.
    # Use FY2023-24 instead: columns 6/7 = Overall number/%, 8/9 = Executives number/%.
    out = []
    for r in rows("07_indigenous_subgroups.csv")[1:]:
        if len(r) < 10 or r[0] != "FY2023-24" or r[3] == "Total" or r[3].startswith("Note"):
            continue
        out.append({
            "subgroup": r[3],
            "overall_n": num(r[6]),
            "overall_pct": pct(r[7]),
            "executive_n": num(r[8]),
            "executive_pct": pct(r[9]),
        })
    return {"fiscal_year": "2023-2024", "rows": out}


def disability_subgroups():
    # FY2024-25 is correctly labeled here (unlike the Indigenous table) and is
    # the most recent complete year: columns 10/11 = Overall number/%, 12/13 = Executives.
    out = []
    for r in rows("08_disability_subgroups.csv")[1:]:
        if len(r) < 14 or r[0] != "FY2024-25" or r[3] == "Total" or r[3].startswith("Note"):
            continue
        out.append({
            "subgroup": r[3],
            "overall_n": num(r[10]),
            "overall_pct": pct(r[11]),
            "executive_n": num(r[12]),
            "executive_pct": pct(r[13]),
        })
    return {"fiscal_year": "2024-2025", "rows": out}


def salary_distribution():
    # FY2023-24 is the last year with a complete "Total" row. The "Indigenous
    # peoples" column (index 5) is blank for this year; the real values are in
    # a duplicate trailing column (index 7) — a shift artifact in the source.
    out = []
    for r in rows("10_salary_distribution.csv")[1:]:
        if len(r) < 8 or r[0] != "FY2023-24" or r[2].startswith(("Notes", "Total", "1 EE")):
            continue
        out.append({
            "band": r[2],
            "all_employees": pct(r[3]),
            "women": pct(r[4]),
            "indigenous": pct(r[7]),  # shifted column, see docstring
            "disability": pct(r[5]),
            "visible_minorities": pct(r[6]),
        })
    return {"fiscal_year": "2023-2024", "rows": out}


def age_distribution():
    # Same shifted-Indigenous-column pattern as salary_distribution.
    out = []
    for r in rows("13_age_distribution.csv")[1:]:
        if len(r) < 8 or r[0] != "FY2023-24" or r[2].startswith(("Notes", "Total", "*")):
            continue
        out.append({
            "band": r[2],
            "all_employees": pct(r[3]),
            "women": pct(r[4]),
            "indigenous": pct(r[7]),
            "disability": pct(r[5]),
            "visible_minorities": pct(r[6]),
        })
    return {"fiscal_year": "2023-2024", "rows": out}


def wfa_benchmark_history():
    # A historical reference list of past census-based benchmarks, not tied to
    # one fiscal year — dedupe by benchmark description across repeated
    # fiscal-year print runs. Real values sit in the "colN" placeholder columns
    # (5,7,9,11); the named columns are literally "n/a*" in the source, another
    # header/data misalignment artifact.
    seen, out = set(), []
    for r in rows("14_wfa_benchmarks.csv")[1:]:
        if len(r) < 12 or r[2].startswith(("* n/a", "n/a: not applicable")):
            continue
        desc = r[2].strip()
        if desc in seen:
            continue
        women, indigenous, disability, vismin = pct(r[5]), pct(r[7]), pct(r[9]), pct(r[11])
        if women is None:
            continue
        seen.add(desc)
        out.append({
            "benchmark": desc,
            "women": women,
            "indigenous": indigenous,
            "disability": disability,
            "visible_minorities": vismin,
        })
    return out


def main():
    data = {
        "racialized_subgroups": racialized_subgroups(),
        "indigenous_subgroups": indigenous_subgroups(),
        "disability_subgroups": disability_subgroups(),
        "salary_distribution": salary_distribution(),
        "age_distribution": age_distribution(),
        "wfa_benchmark_history": wfa_benchmark_history(),
    }
    meta = {
        "generated_by": "pipeline/build_service_wide_context.py",
        "source": "BT1-28 annual reports (Treasury Board of Canada Secretariat), extracted "
                   "tables from a teammate project's build process — real government data, "
                   "not fabricated.",
        "scope_note": "Service-wide only, not per-department — shown as reference context, "
                       "never mixed into the per-department decision-support views (Explore, "
                       "Compare, Track, Present). Subgroup and demographic representation does "
                       "not exist at the department level in any available source.",
        "data_quality_note": "The Indigenous-subgroups source table's most recent year "
                              "(FY2024-25) is mislabeled in the original BT1-28 extraction — it "
                              "lists racialized subgroup names under designated_group='Indigenous "
                              "peoples'. The last correctly-labeled year (FY2023-24) is used "
                              "instead; not corrected or reinterpreted, simply skipped.",
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "service_wide_context.json").write_text(json.dumps(data, indent=2))
    (OUT_DIR / "service_wide_context_meta.json").write_text(json.dumps(meta, indent=2))

    print(f"✓ wrote {OUT_DIR/'service_wide_context.json'}")
    print(f"  racialized_subgroups: {len(data['racialized_subgroups']['rows'])} rows "
          f"({data['racialized_subgroups']['fiscal_year']})")
    print(f"  indigenous_subgroups: {len(data['indigenous_subgroups']['rows'])} rows "
          f"({data['indigenous_subgroups']['fiscal_year']})")
    print(f"  disability_subgroups: {len(data['disability_subgroups']['rows'])} rows "
          f"({data['disability_subgroups']['fiscal_year']})")
    print(f"  salary_distribution: {len(data['salary_distribution']['rows'])} rows "
          f"({data['salary_distribution']['fiscal_year']})")
    print(f"  age_distribution: {len(data['age_distribution']['rows'])} rows "
          f"({data['age_distribution']['fiscal_year']})")
    print(f"  wfa_benchmark_history: {len(data['wfa_benchmark_history'])} distinct benchmarks")


if __name__ == "__main__":
    main()
