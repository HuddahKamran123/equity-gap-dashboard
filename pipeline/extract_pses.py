#!/usr/bin/env python3
"""
extract_pses.py — one-time extraction of PSES 2024 employment-equity subindicator
scores from the raw EEINFODV.csv (1.2 GB) into a compact intermediate JSON.

We read the 1.2 GB file ONCE and write pipeline/pses_dept_scores.json so the main
build pipeline never has to touch the giant file again.

Department-level rows only (LEVEL2..LEVEL5 == "0"). For each
(department, equity group, subindicator) we average the question-level SCORE100
values (excluding the 9999 suppression code), rounded to 1 decimal.

It also prints a verification table comparing the recomputed engagement /
diversity-inclusion / harassment scores against the team's existing processed CSV,
to confirm the aggregation method before we trust it for the two empty columns.
"""
import csv, json, re, sys
from pathlib import Path
from collections import defaultdict

REPO = Path(__file__).resolve().parent.parent
RAW = REPO / "Knowledge" / "data" / "raw" / "EEINFODV.csv"
PROCESSED = REPO / "Knowledge" / "data" / "processed" / "employment_equity_department_gaps.csv"
OUT = REPO / "pipeline" / "pses_dept_scores.json"

GROUP_BY_CODE = {
    "D111A = 1": "Women",
    "D112 = 1": "Persons with Disabilities",
    "D113 = 1": "Indigenous Peoples",
    "D114 = 1": "Members of Visible Minorities",
}
SUBIND = {
    "Employee engagement": "pses_engagement",
    "Diversity and inclusion": "pses_diversity_inclusion",
    "Harassment": "pses_harassment",
    "Discrimination": "pses_discrimination",
    "Mobility and retention": "pses_mobility_retention",
}
SUPPRESS = "9999"


def norm(name):
    """Normalize a department name for cross-source matching."""
    n = name.lower().strip()
    n = re.sub(r"\(.*?\)", " ", n)            # drop parentheticals e.g. "(civilian)"
    n = n.replace("&", "and")
    n = re.sub(r"[^a-z0-9 ]", " ", n)          # drop punctuation/accents
    n = re.sub(r"\s+", " ", n).strip()
    return n


def main():
    if not RAW.exists():
        print(f"raw file not found: {RAW}")
        return 2

    acc = defaultdict(list)   # (dept, group, col) -> [scores]
    depts = set()
    n = 0
    with open(RAW, newline="", encoding="latin-1") as f:
        r = csv.reader(f)
        H = {name: i for i, name in enumerate(next(r))}
        iL2, iL3, iL4, iL5 = H["LEVEL2ID"], H["LEVEL3ID"], H["LEVEL4ID"], H["LEVEL5ID"]
        iSurv, iBy, iSub = H["SURVEYR"], H["BYCOND"], H["SUBINDICATORENG"]
        iDept, iScore = H["DEPT_E"], H["SCORE100"]
        for row in r:
            n += 1
            if row[iSurv] != "2024":
                continue
            if not (row[iL2] == "0" and row[iL3] == "0" and row[iL4] == "0" and row[iL5] == "0"):
                continue
            grp = GROUP_BY_CODE.get(row[iBy].strip())
            if grp is None:
                continue
            col = SUBIND.get(row[iSub])
            if col is None:
                continue
            sc = row[iScore].strip()
            if sc == "" or sc == SUPPRESS:
                continue
            try:
                val = float(sc)
            except ValueError:
                continue
            dept = row[iDept].strip()
            depts.add(dept)
            acc[(dept, grp, col)].append(val)

    scores = defaultdict(dict)  # dept -> group -> {col: mean}
    for (dept, grp, col), vals in acc.items():
        scores[dept].setdefault(grp, {})[col] = round(sum(vals) / len(vals), 1)

    OUT.write_text(json.dumps(scores, indent=1, sort_keys=True))
    print(f"scanned {n} rows; extracted {len(depts)} departments -> {OUT}\n")

    # ---- verification vs the team's processed CSV ----
    proc = list(csv.DictReader(open(PROCESSED, encoding="utf-8-sig")))
    pnorm = {norm(d): d for d in depts}
    print("VERIFICATION — recomputed vs existing (eng / div / harass), + NEW (discrim / mob):")
    print(f"{'dept (TBS)':36.36} {'grp':4} | exist e/d/h | calc e/d/h | NEW disc/mob")
    shown = 0
    matches = {"pses_engagement": [0, 0], "pses_diversity_inclusion": [0, 0], "pses_harassment": [0, 0]}
    unmatched_depts = set()
    for row in proc:
        if row["fiscal_year"] != "2024-2025":
            continue
        dept_tbs = row["department_agency"].strip()
        grp = row["equity_group"].strip()
        key = pnorm.get(norm(dept_tbs))
        if not key:
            unmatched_depts.add(dept_tbs)
            continue
        sc = scores.get(key, {}).get(grp, {})
        g = lambda col: ("" if row[col].strip() == "" else float(row[col]))
        c = lambda col: sc.get(col, "")
        for col in matches:
            ev, cv = g(col), c(col)
            if ev != "" and cv != "":
                matches[col][1] += 1
                if abs(ev - cv) <= 1.5:
                    matches[col][0] += 1
        if shown < 16 and grp in ("Persons with Disabilities", "Women"):
            print(f"{dept_tbs:36.36} {grp[:4]:4} | "
                  f"{g('pses_engagement')!s:>4}/{g('pses_diversity_inclusion')!s:>4}/{g('pses_harassment')!s:>4} | "
                  f"{c('pses_engagement')!s:>4}/{c('pses_diversity_inclusion')!s:>4}/{c('pses_harassment')!s:>4} | "
                  f"{c('pses_discrimination')!s:>4}/{c('pses_mobility_retention')!s:>4}")
            shown += 1
    print("\nmatch rate (recomputed within 1.5 pts of existing):")
    for col, (ok, tot) in matches.items():
        pct = f"  ({100*ok//tot}%)" if tot else ""
        print(f"  {col:28} {ok}/{tot}{pct}")
    print(f"\nTBS depts (2024-25) with no PSES name match: {len(unmatched_depts)}")
    for d in sorted(unmatched_depts)[:30]:
        print(f"  - {d}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
