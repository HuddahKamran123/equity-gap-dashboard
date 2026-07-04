#!/usr/bin/env python3
"""
build_history.py — fold the verified 4-year TBS representation series in as a
multi-year trend source, SAFELY.

Input: Knowledge/data/raw/bt1_28_representation_2021_2025.csv (wide, FY2021-22 →
FY2024-25; verified identical to our canonical data on the two overlap years —
420/420 keys, 0 mismatches).

Two integrity hazards handled rather than papered over:

  1. Name → entity mapping. Departments are anchored to their CURRENT (2024-25)
     canonical name via an aggressive normalization (strip parentheticals + footnote
     digits). If a normalized name maps to more than one 2024-25 entity it is
     dropped as ambiguous.

  2. Entity drift across years. A trajectory is only stitched across years whose
     "strict" name (parentheticals KEPT, only footnote digits stripped) matches the
     2024-25 anchor. This is the real signal: "National Defence" → "National
     Defence1" is the same entity (footnote only, stitched), but "Royal Canadian
     Mounted Police (Civilian Staff)" (8,384) → "(RCMP)" (10,822) changes the
     reported population, so those years are NOT stitched — RCMP falls to a single
     anchor year and is dropped from the multi-year view (it stays in the current
     2-year data). A ±40% headcount band is a final backstop.

Benchmark rebase: availability was rebased in 2023-24 (PwD 9.x→12.0, Visible
Minorities 17.x→22.7). Representation % is benchmark-independent (a clean trend);
gap-to-benchmark is NOT comparable across that boundary. Each year carries an `era`
tag ("A" pre-2023, "B" from 2023-24).

Outputs: Knowledge/data/processed/representation_multiyear.csv (canonical schema →
guarded) and web/src/data/rep_history.json (per department|group trajectory).
"""
import csv, json, re
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RAW = REPO / "Knowledge" / "EMPLYOMENT EQUITY-TBS" / "knowledge" / "bt1_28_representation.csv"
EQUITY = REPO / "web" / "src" / "data" / "equity.json"
OUT_CSV = REPO / "Knowledge" / "data" / "processed" / "representation_multiyear.csv"
OUT_JSON = REPO / "web" / "src" / "data" / "rep_history.json"

YEAR_MAP = {"FY2021-22": "2021-2022", "FY2022-23": "2022-2023",
            "FY2023-24": "2023-2024", "FY2024-25": "2024-2025"}
YEARS = ["2021-2022", "2022-2023", "2023-2024", "2024-2025"]
GROUPS = {"women": "Women", "indigenous": "Indigenous Peoples",
          "disability": "Persons with Disabilities", "racialized": "Members of Visible Minorities"}
WFA = {
    "2021-2022": {"Women": 53.3, "Indigenous Peoples": 3.8, "Persons with Disabilities": 9.1, "Members of Visible Minorities": 17.2},
    "2022-2023": {"Women": 53.7, "Indigenous Peoples": 3.8, "Persons with Disabilities": 9.2, "Members of Visible Minorities": 17.3},
    "2023-2024": {"Women": 55.3, "Indigenous Peoples": 4.1, "Persons with Disabilities": 12.0, "Members of Visible Minorities": 22.7},
    "2024-2025": {"Women": 54.9, "Indigenous Peoples": 4.0, "Persons with Disabilities": 12.0, "Members of Visible Minorities": 22.7},
}
ERA = {"2021-2022": "A", "2022-2023": "A", "2023-2024": "B", "2024-2025": "B"}
COLS = ["department_agency", "equity_group", "fiscal_year", "all_employees",
        "designated_group_members", "representation_percent", "workforce_availability_percent",
        "expected_number", "gap", "pses_engagement", "pses_diversity_inclusion",
        "pses_harassment", "pses_discrimination", "pses_mobility_retention"]
DRIFT_LO, DRIFT_HI = 0.6, 1.667


def norm(name):  # aggressive — for mapping to the canonical current-year entity
    n = re.sub(r"\(.*?\)", " ", name.lower())
    n = re.sub(r"[^a-z ]", " ", n)
    return re.sub(r"\s+", " ", n).strip()


def strict(name):  # keep parentheticals; strip only footnote digits — for entity consistency
    n = re.sub(r"(?<=[a-z)])\d+", "", name.lower())
    return re.sub(r"\s+", " ", n).strip()


def num(v):
    v = (v or "").strip().replace(",", "")
    if v in ("", "n/a", "*", "-", "x", "X"):
        return None
    try:
        return float(v)
    except ValueError:
        return None


def severity(rep, wfa):
    if rep is None or wfa is None:
        return None
    pp = wfa - rep
    return "above" if pp <= 0 else "slight" if pp < 2 else "moderate" if pp < 5 else "substantial" if pp < 10 else "severe"


def main():
    # anchor set = CURRENT-year (2024-25) canonical names
    canon = sorted({r["department"] for r in json.loads(EQUITY.read_text()) if r["year"] == "2024-2025"})
    by_norm = defaultdict(list)
    for d in canon:
        by_norm[norm(d)].append(d)
    unambiguous = {n: names[0] for n, names in by_norm.items() if len(names) == 1}
    ambiguous = {n for n, names in by_norm.items() if len(names) > 1}

    rows = list(csv.DictReader(open(RAW, encoding="utf-8-sig")))
    # (canonical, group) -> year -> list of candidate entries (each carries its strict name)
    traj = defaultdict(lambda: defaultdict(list))
    dropped_ambiguous, unmapped = set(), set()

    for r in rows:
        year = YEAR_MAP.get(r["fiscal_year"].strip())
        if not year:
            continue
        nm = norm(r["department"])
        if nm in ambiguous:
            dropped_ambiguous.add(r["department"].strip()); continue
        dept = unambiguous.get(nm)
        if not dept:
            unmapped.add(r["department"].strip()); continue
        st = strict(r["department"])
        allv = num(r["all_employees"])
        for col, grp in GROUPS.items():
            n = num(r.get(col + "_n"))
            wfa = WFA[year][grp]
            supp = n is None or allv is None
            rep = round(n / allv * 100, 1) if not supp else None
            exp = round(allv * wfa / 100) if allv is not None else None
            gap = int(round(n - exp)) if (not supp and exp is not None) else None
            traj[(dept, grp)][year].append({
                "strict": st, "all": int(allv) if allv is not None else None,
                "entry": {"year": year, "rep": rep, "wfa": wfa, "gap": gap, "sev": severity(rep, wfa),
                          "n": int(n) if n is not None else None, "all": int(allv) if allv is not None else None,
                          "era": ERA[year], "supp": supp},
            })

    history, entity_skips, drift_trims = {}, 0, 0
    for (dept, grp), years in traj.items():
        if "2024-2025" not in years:
            continue
        # anchor = the current-year candidate with the largest headcount (the main entity)
        anchor = max(years["2024-2025"], key=lambda c: c["all"] or 0)
        anchor_strict = anchor["strict"]
        picked = {}
        for y in YEARS:
            same = [c for c in years.get(y, []) if c["strict"] == anchor_strict]
            if same:
                picked[y] = max(same, key=lambda c: c["all"] or 0)
            elif years.get(y):
                entity_skips += 1  # a differently-named entity existed for this year — not stitched
        ordered = [picked[y] for y in YEARS if y in picked]
        # backstop: walk back from the anchor only while headcount stays within ±40%
        kept = [ordered[-1]]
        for c in reversed(ordered[:-1]):
            a1, a2 = c["all"], kept[0]["all"]
            if a1 and a2 and DRIFT_LO <= a1 / a2 <= DRIFT_HI:
                kept.insert(0, c)
            else:
                drift_trims += 1
                break
        if len(kept) >= 2:
            history[f"{dept}|{grp}"] = [c["entry"] for c in kept]

    out_rows = []
    for key, entries in history.items():
        dept, grp = key.split("|")
        for e in entries:
            out_rows.append({
                "department_agency": dept, "equity_group": grp, "fiscal_year": e["year"],
                "all_employees": e["all"] if e["all"] is not None else "",
                "designated_group_members": e["n"] if e["n"] is not None else "",
                "representation_percent": e["rep"] if e["rep"] is not None else "",
                "workforce_availability_percent": e["wfa"],
                "expected_number": round(e["all"] * e["wfa"] / 100) if e["all"] is not None else "",
                "gap": e["gap"] if e["gap"] is not None else "",
                "pses_engagement": "", "pses_diversity_inclusion": "",
                "pses_harassment": "", "pses_discrimination": "", "pses_mobility_retention": "",
            })
    out_rows.sort(key=lambda r: (r["department_agency"], r["equity_group"], r["fiscal_year"]))
    with open(OUT_CSV, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(out_rows)
    OUT_JSON.write_text(json.dumps(history, separators=(",", ":"), sort_keys=True))

    four = sum(1 for v in history.values() if len(v) == 4)
    print(f"✓ {OUT_JSON.name}: {len(history)} trajectories ({four} full 4-year); {len(out_rows)} rows → {OUT_CSV.name}")
    print(f"name-ambiguous drops: {sorted(dropped_ambiguous)}")
    print(f"entity-name mismatches not stitched (e.g. RCMP Civilian Staff↔full): {entity_skips}")
    print(f"headcount-drift back-trims: {drift_trims} · team names unmatched: {len(unmapped)}")
    for key in ["National Defence|Women", "Fisheries and Oceans Canada|Women", "Royal Canadian Mounted Police|Persons with Disabilities"]:
        h = history.get(key)
        print(f"\n{key}: {'(dropped from multi-year — kept in current-year view)' if not h else ''}")
        for e in (h or []):
            print(f"   {e['year']} [{e['era']}] rep {e['rep']}% (N={e['n']} of {e['all']}) vs WFA {e['wfa']}% · gap {e['gap']} · {e['sev']}")


if __name__ == "__main__":
    main()
