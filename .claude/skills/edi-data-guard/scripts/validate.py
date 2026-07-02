#!/usr/bin/env python3
"""
edi-data-guard / validate.py

A hard gate for the Employment Equity Gap dataset. It runs seven checks against
the contract in references/columns.json and EXITS NON-ZERO if any check fails,
so a bad CSV blocks the build instead of silently shipping wrong numbers.

Usage:
    python3 validate.py [path/to/dataset.csv]

Default path: Knowledge/data/processed/employment_equity_department_gaps.csv

Exit codes:
    0  all checks passed (warnings allowed)
    1  one or more checks failed — DO NOT use this dataset
    2  could not read the file or the contract
"""

import csv
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CONTRACT_PATH = HERE.parent / "references" / "columns.json"
REPO_ROOT = HERE.parents[3]  # .claude/skills/edi-data-guard/scripts -> repo root
DEFAULT_CSV = REPO_ROOT / "Knowledge" / "data" / "processed" / "employment_equity_department_gaps.csv"

GREEN, RED, YELLOW, DIM, BOLD, RESET = (
    "\033[32m", "\033[31m", "\033[33m", "\033[2m", "\033[1m", "\033[0m"
)


class Report:
    def __init__(self):
        self.errors = 0
        self.warnings = 0

    def check(self, name):
        return _Check(self, name)


class _Check:
    def __init__(self, report, name):
        self.report = report
        self.name = name
        self.fails = []
        self.warns = []

    def fail(self, msg):
        self.fails.append(msg)

    def warn(self, msg):
        self.warns.append(msg)

    def done(self):
        if self.fails:
            self.report.errors += 1
            print(f"{RED}  ✗ FAIL{RESET}  {self.name}")
            for m in self.fails[:8]:
                print(f"{RED}         · {m}{RESET}")
            if len(self.fails) > 8:
                print(f"{DIM}         · …and {len(self.fails) - 8} more{RESET}")
        elif self.warns:
            self.report.warnings += len(self.warns)
            print(f"{YELLOW}  ⚠ WARN{RESET}  {self.name}")
            for m in self.warns[:8]:
                print(f"{YELLOW}         · {m}{RESET}")
        else:
            print(f"{GREEN}  ✓ PASS{RESET}  {self.name}")


def read_rows(path):
    for enc in ("utf-8-sig", "latin-1"):
        try:
            with open(path, newline="", encoding=enc) as f:
                rows = list(csv.DictReader(f))
            return rows, rows[0].keys() if rows else [], enc
        except (UnicodeDecodeError, IndexError):
            continue
    raise IOError(f"Could not decode {path} as utf-8 or latin-1")


def to_float(v):
    if v is None or str(v).strip() == "":
        return None
    try:
        return float(str(v).strip())
    except ValueError:
        return None  # malformed values are reported by check 3; don't crash here


def main():
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV

    try:
        contract = json.loads(CONTRACT_PATH.read_text())
    except Exception as e:  # noqa: BLE001
        print(f"{RED}Could not read contract {CONTRACT_PATH}: {e}{RESET}")
        return 2

    if not csv_path.exists():
        print(f"{RED}Dataset not found: {csv_path}{RESET}")
        return 2

    print(f"{BOLD}edi-data-guard{RESET}  validating {DIM}{csv_path}{RESET}")
    try:
        rows, header, enc = read_rows(csv_path)
    except IOError as e:
        print(f"{RED}{e}{RESET}")
        return 2
    print(f"{DIM}  {len(rows)} rows · encoding {enc}{RESET}\n")

    r = Report()
    groups = set(contract["valid_equity_groups"])
    years = set(contract["valid_fiscal_years"])
    wfa = contract["workforce_availability_benchmarks"]
    tol = contract["tolerances"]

    # 1 — columns present and exactly named
    c = r.check("1. Required columns present and correctly named")
    have = list(header)
    for col in contract["required_columns"]:
        if col not in have:
            c.fail(f"missing required column: '{col}'")
    extra = [h for h in have if h not in contract["required_columns"]]
    for h in extra:
        c.fail(f"unexpected column (possible rename/typo): '{h}'")
    c.done()
    if any("missing required column" in m for m in c.fails):
        print(f"\n{RED}Column contract broken — stopping.{RESET}")
        return 1

    # 2 — equity_group labels are exactly the four canonical values
    c = r.check("2. Equity-group labels are canonical")
    for i, row in enumerate(rows, start=2):
        g = (row.get("equity_group") or "").strip()
        if g not in groups:
            c.fail(f"row {i}: invalid equity_group '{g}' "
                   f"(must be one of {sorted(groups)})")
    c.done()

    # 3 — percent/numeric columns are clean floats (no '%' strings, no junk)
    c = r.check("3. Numeric columns are clean (percents not stored as strings)")
    for i, row in enumerate(rows, start=2):
        for col in contract["numeric_columns"]:
            raw = (row.get(col) or "").strip()
            if raw == "":
                continue
            if "%" in raw:
                c.fail(f"row {i}: '{col}' contains a '%' — store as float, not '{raw}'")
                continue
            try:
                float(raw)
            except ValueError:
                c.fail(f"row {i}: '{col}' is not numeric: '{raw}'")
    c.done()

    # 4 — suppression handled correctly (blank ≠ zero; blanks are consistent)
    c = r.check("4. Suppressed cells kept blank, not zero-imputed")
    for i, row in enumerate(rows, start=2):
        dgm = (row.get("designated_group_members") or "").strip()
        rep = (row.get("representation_percent") or "").strip()
        gap = (row.get("gap") or "").strip()
        if dgm == "":
            if rep != "" or gap != "":
                c.fail(f"row {i}: designated_group_members blank but "
                       f"representation_percent/gap populated — inconsistent suppression")
        else:
            if dgm == "0":
                c.warn(f"row {i}: designated_group_members = 0 — confirm a genuine "
                       f"zero, not a suppressed cell imputed to 0")
    c.done()

    # 5 — WFA benchmark matches the known service-wide value for group × year
    c = r.check("5. WFA benchmark matches service-wide value for each group × year")
    for i, row in enumerate(rows, start=2):
        g = (row.get("equity_group") or "").strip()
        y = (row.get("fiscal_year") or "").strip()
        if g not in groups or y not in years:
            continue
        expected = wfa.get(y, {}).get(g)
        got = to_float(row.get("workforce_availability_percent"))
        if expected is None or got is None:
            continue
        if abs(got - expected) > 0.001:
            c.fail(f"row {i}: {g} {y} WFA is {got}, expected {expected} "
                   f"(do not substitute another denominator)")
    c.done()

    # 6 — arithmetic reconciles: expected_number, gap, representation_percent
    c = r.check("6. Gap arithmetic reconciles (expected, gap, representation%)")
    for i, row in enumerate(rows, start=2):
        allv = to_float(row.get("all_employees"))
        dgm = to_float(row.get("designated_group_members"))
        wfav = to_float(row.get("workforce_availability_percent"))
        exp = to_float(row.get("expected_number"))
        gap = to_float(row.get("gap"))
        rep = to_float(row.get("representation_percent"))
        if allv and wfav is not None and exp is not None:
            calc_exp = allv * wfav / 100.0
            if abs(calc_exp - exp) > tol["expected_number_abs"]:
                c.fail(f"row {i}: expected_number {exp} ≠ all×WFA/100 {calc_exp:.1f}")
        if dgm is not None and exp is not None and gap is not None:
            calc_gap = dgm - exp
            if abs(calc_gap - gap) > tol["gap_abs"]:
                c.fail(f"row {i}: gap {gap} ≠ dgm−expected {calc_gap:.1f}")
        if allv and dgm is not None and rep is not None:
            calc_rep = dgm / allv * 100.0
            if abs(calc_rep - rep) > tol["representation_percent_pp"]:
                c.fail(f"row {i}: representation_percent {rep} ≠ dgm/all×100 {calc_rep:.2f}")
    c.done()

    # 7 — year-over-year coverage (trend lines only for depts in both years)
    c = r.check("7. Year-over-year coverage is sound")
    by_year = {}
    for row in rows:
        by_year.setdefault((row.get("fiscal_year") or "").strip(), set()).add(
            (row.get("department_agency") or "").strip()
        )
    d_2023 = by_year.get("2023-2024", set())
    d_2024 = by_year.get("2024-2025", set())
    both = d_2023 & d_2024
    print(f"{DIM}         · {len(d_2023)} depts in 2023-24, {len(d_2024)} in 2024-25, "
          f"{len(both)} in both (trend-eligible){RESET}")
    missing = d_2023 - d_2024
    for d in sorted(missing):
        c.warn(f"dept in 2023-24 but absent in 2024-25: '{d}'")
    c.done()

    # summary
    print()
    if r.errors:
        print(f"{RED}{BOLD}BLOCKED{RESET} — {r.errors} check(s) failed, "
              f"{r.warnings} warning(s). This dataset must not be used.")
        return 1
    print(f"{GREEN}{BOLD}PASSED{RESET} — all 7 checks clean"
          + (f", {r.warnings} warning(s) to confirm." if r.warnings else "."))
    return 0


if __name__ == "__main__":
    sys.exit(main())
