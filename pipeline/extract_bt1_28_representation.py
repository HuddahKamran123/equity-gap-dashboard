#!/usr/bin/env python3
"""
extract_bt1_28_representation.py — reshape the wide-format
Knowledge/EMPLYOMENT EQUITY-TBS/knowledge/bt1_28_representation.csv (one row
per department x fiscal year, one column set per group) into the long-format
canonical CSV edi-data-guard validates (one row per department x group x
fiscal year) — the shape the original, now-deleted
Knowledge/data/processed/employment_equity_department_gaps.csv had.

Why this exists: the Knowledge/ folder was replaced with a fuller sync of a
teammate's project (2026-07-04), which included this wide-format source but
not the pre-computed long-format file build_dataset.py's gate expects. This
script rebuilds that file from the new source.

Trust basis: the new source's RCMP x Persons with Disabilities x FY2024-25
values exactly match the long-standing oracle (5.5%, N=590 of 10,822, WFA
12.0%, gap -709) — see eval/run_eval.py. The new source also has fuller
department coverage for 2023-24 (72 departments vs. the original 35) — a
deliberate scope expansion, not a data error (confirmed by spot-checking
several previously-absent departments' 2024-25 figures agree with their
2023-24 figures on continuity).

Run:  python3 pipeline/extract_bt1_28_representation.py
"""
import csv, re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SOURCE = REPO / "Knowledge" / "EMPLYOMENT EQUITY-TBS" / "knowledge" / "bt1_28_representation.csv"
OUT = REPO / "Knowledge" / "data" / "processed" / "employment_equity_department_gaps.csv"

YEAR_MAP = {"FY2023-24": "2023-2024", "FY2024-25": "2024-2025"}
GROUP_COLS = {
    "women": "Women",
    "indigenous": "Indigenous Peoples",
    "disability": "Persons with Disabilities",
    "racialized": "Members of Visible Minorities",
}
# Our own canonical WFA (matches the guard's contract exactly) — used instead
# of the source's own {group}_wfa columns so there is one benchmark authority.
WFA = {
    "2023-2024": {"Women": 55.3, "Indigenous Peoples": 4.1,
                  "Persons with Disabilities": 12.0, "Members of Visible Minorities": 22.7},
    "2024-2025": {"Women": 54.9, "Indigenous Peoples": 4.0,
                  "Persons with Disabilities": 12.0, "Members of Visible Minorities": 22.7},
}
COLS = ["department_agency", "equity_group", "fiscal_year", "all_employees",
        "designated_group_members", "representation_percent", "workforce_availability_percent",
        "expected_number", "gap", "pses_engagement", "pses_diversity_inclusion",
        "pses_harassment", "pses_discrimination", "pses_mobility_retention"]


# Known OCR typo in the source PDFs, confirmed by comparing across fiscal
# years (correct spelling appears in FY2024-25): a lowercase "l" instead of
# capital "I". Documented, not silently guessed — this exact string only.
# The RCMP entry carries a redundant self-referential "(RCMP)" suffix in this
# source; stripped to match the name used everywhere else in the app
# (subgroup_pses.json, the oracle in eval/run_eval.py, PresentView's default).
NAME_FIXES = {
    "lmpact Assessment Agency of Canada": "Impact Assessment Agency of Canada",
    "Royal Canadian Mounted Police (RCMP)": "Royal Canadian Mounted Police",
}


def strip_footnote(name):
    # PDF-extraction footnote markers are trailing digits, either right after
    # a letter/closing paren ("...(RCMP)3") or space-separated ("...Canada 5")
    # — same problem build_history.py's strict()/norm() already solve.
    name = re.sub(r"(?<=[a-zA-Z)])\d+$", "", name)
    name = re.sub(r"\s+\d+$", "", name)
    name = NAME_FIXES.get(name.strip(), name.strip())
    return name


def num(v):
    v = (v or "").strip()
    if v in ("", "*"):
        return None
    try:
        return float(v.replace(",", ""))
    except ValueError:
        return None


def main():
    rows = list(csv.DictReader(open(SOURCE, encoding="utf-8-sig")))
    out_rows = []
    skipped_years = set()

    for r in rows:
        year = YEAR_MAP.get(r["fiscal_year"].strip())
        if year is None:
            skipped_years.add(r["fiscal_year"])
            continue
        dept = strip_footnote(r["department"].strip())
        all_emp = num(r["all_employees"])
        for col, group in GROUP_COLS.items():
            n = num(r.get(col + "_n"))
            wfa = WFA[year][group]
            suppressed = n is None or all_emp is None
            rep_pct = round(n / all_emp * 100, 1) if not suppressed else None
            expected = round(all_emp * wfa / 100) if all_emp is not None else None
            gap = int(round(n - expected)) if (not suppressed and expected is not None) else None
            out_rows.append({
                "department_agency": dept,
                "equity_group": group,
                "fiscal_year": year,
                "all_employees": int(all_emp) if all_emp is not None else "",
                "designated_group_members": int(n) if n is not None else "",
                "representation_percent": rep_pct if rep_pct is not None else "",
                "workforce_availability_percent": wfa,
                "expected_number": expected if expected is not None else "",
                "gap": gap if gap is not None else "",
                # PSES columns are joined later by build_dataset.py from
                # pipeline/pses_dept_scores.json — left blank here, same as
                # the file this script replaces.
                "pses_engagement": "", "pses_diversity_inclusion": "",
                "pses_harassment": "", "pses_discrimination": "", "pses_mobility_retention": "",
            })

    out_rows.sort(key=lambda r: (r["fiscal_year"], r["department_agency"], r["equity_group"]))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLS)
        w.writeheader()
        w.writerows(out_rows)

    by_year = {}
    for r in out_rows:
        by_year.setdefault(r["fiscal_year"], set()).add(r["department_agency"])
    print(f"✓ wrote {OUT} ({len(out_rows)} rows)")
    for y, depts in sorted(by_year.items()):
        print(f"  {y}: {len(depts)} departments x 4 groups = {len(depts) * 4} rows")
    if skipped_years:
        print(f"  skipped fiscal years outside 2023-24/2024-25: {sorted(skipped_years)}")
    suppressed_n = sum(1 for r in out_rows if r["designated_group_members"] == "")
    print(f"  suppressed rows: {suppressed_n}")


if __name__ == "__main__":
    main()
