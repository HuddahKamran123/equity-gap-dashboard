#!/usr/bin/env python3
"""
build_subgroup_pses.py — add subgroup + multi-cycle (2020/2022/2024) PSES
workplace-experience scores to the dashboard, sourced from a teammate's separate
project build (Lorraine, ldzeble@ualberta.ca — "Employment Equity Intelligence
Dashboard — TBS").

Revisits the 2026-07-02 "declined service-wide breadth" decision (CLAUDE.md §3,
Deployment_Log.md): that decision was about SERVICE-WIDE-ONLY breakdowns from the
same parallel build. This data is PER-DEPARTMENT (53 of our 71), which is the
specific bar the earlier data didn't clear — see the 2026-07-03 decision entries.

What this pulls in: PSES experience scores (harassment, belonging, career,
leadership, workplace, wellbeing) for the 4 designated groups AND 10 subgroups
(Black, South Asian, East Asian, Arab, First Nations, Métis, Inuit, Cognitive,
Mental health, Seeing), across survey cycles 2020/2022/2024.

What this does NOT pull in: subgroup representation/WFA (does not exist at the
department level in any available source — confirmed by the source's own
"subgroups": {} always being empty in its representation object); the source's
Executive Pipeline / Workforce Flows / Salary / Region / Occupation views (self-
disclosed mock data in the source, citing files that don't exist); GROUP_PARAMS
(the source's own UI color-threshold logic, not a data fact — this dashboard
already has its own divergence logic via DIVERGENCE_MARGIN in build_dataset.py).

Trust basis: this script re-runs, at build time, the cross-validation performed
during research — every resolvable department x group representation value in the
source's REP object is compared against our own already-verified equity.json for
2024-2025. That match rate gates the build (see MATCH_FAIL_THRESHOLD below). The
EXP (experience) data itself cannot be independently re-derived — the source's raw
2020/2022 PSES microdata, demographic-recoding concordance, and department-name
mapping files are not available to us — so it is shipped as cross-validated, not
independently verified, and labeled as such in the UI and in subgroup_pses_meta.json.

Run:  python3 pipeline/build_subgroup_pses.py
"""
import json, re, sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SOURCE_HTML = REPO / "Knowledge" / "EMPLYOMENT EQUITY-TBS" / "index.html"
EQUITY_JSON = REPO / "web" / "src" / "data" / "equity.json"
OUT_DIR = REPO / "web" / "src" / "data"

# Below this match rate on the REP cross-validation, abort rather than ship
# EXP data we can no longer trust was built by the same verified pipeline.
MATCH_FAIL_THRESHOLD = 0.98
MATCH_TOLERANCE_PP = 0.3

GROUP_MAP = {
    "women": "Women",
    "indigenous": "Indigenous Peoples",
    "disability": "Persons with Disabilities",
    "racialized": "Members of Visible Minorities",
}
SUBGROUP_LABELS = {
    "black": "Black", "southasian": "South Asian", "eastasian": "East Asian", "arab": "Arab",
    "firstnations": "First Nations", "metis": "Métis", "inuit": "Inuit",
    "cognitive": "Cognitive disability", "mental": "Mental health disability", "seeing": "Seeing disability",
}
THEMES = ["harassment", "belonging", "career", "leadership", "workplace", "wellbeing"]
YEARS = [2020, 2022, 2024]

# One manual alias for a machinery-of-government rename the source predates.
DEPT_ALIASES = {
    "infrastructure canada": "housing infrastructure and communities canada",
}


def norm(name):
    n = name.replace("¥", "")  # PDF-extraction footnote marker, same problem build_history.py solves for digits
    n = n.lower().strip()
    n = re.sub(r"\(.*?\)", " ", n)
    n = n.replace("&", "and")
    n = re.sub(r"[^a-z0-9 ]", " ", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n


def extract_const(html, varname):
    m = re.search(r"const " + varname + r"\s*=\s*(\{.*?\}|\[.*?\]);", html, re.DOTALL)
    if not m:
        print(f"✗ could not find `const {varname}` in source HTML — aborting.")
        sys.exit(1)
    return json.loads(re.sub(r"\bNaN\b", "null", m.group(1)))


def cross_validate(depts, rep, our_rows):
    """Re-check the source's REP data against our own verified 2024-2025 rows."""
    our_by_key = {}
    for row in our_rows:
        if row["year"] != "2024-2025":
            continue
        our_by_key.setdefault(norm(row["department"]), {})[row["group"]] = row

    compared = matched = 0
    mismatches, unresolved_depts = [], []
    for code, name in depts.items():
        key = norm(name)
        key = norm(DEPT_ALIASES.get(key, key))
        if key not in our_by_key:
            unresolved_depts.append(name)
            continue
        for src_group, our_group in GROUP_MAP.items():
            their = rep.get(code, {}).get(src_group)
            ours = our_by_key[key].get(our_group)
            if not their or not ours:
                continue
            their_rep, their_wfa = their["rep"][4], their["wfa"]  # index 4 = FY2024-25
            our_rep, our_wfa = ours["rep_pct"], ours["wfa"]
            if their_rep is None or our_rep is None:
                continue
            compared += 1
            if abs(their_rep - our_rep) <= MATCH_TOLERANCE_PP and abs((their_wfa or 0) - (our_wfa or 0)) <= MATCH_TOLERANCE_PP:
                matched += 1
            else:
                mismatches.append((name, our_group, their_rep, our_rep, their_wfa, our_wfa))
    return compared, matched, mismatches, unresolved_depts


def build_entries(depts, exp):
    """Flatten the source's per-department EXP object into SubgroupPsesEntry records."""
    our_names = {}  # dept code -> our canonical department name
    for code, name in depts.items():
        key = norm(name)
        key = norm(DEPT_ALIASES.get(key, key))
        our_names[code] = key

    entries = []
    skipped_no_data = 0
    for code, groups in exp.items():
        dept_key = our_names.get(code)
        if dept_key is None:
            continue
        has_any = False
        for src_key, data in groups.items():
            group = GROUP_MAP.get(src_key)
            subgroup = None if group else SUBGROUP_LABELS.get(src_key)
            if group is None and subgroup is None:
                continue  # unknown key — skip rather than guess
            # a subgroup entry's parent group is implied by which lineage it belongs to;
            # racialized subgroups -> Members of Visible Minorities, etc.
            parent_group = group or {
                "black": "Members of Visible Minorities", "southasian": "Members of Visible Minorities",
                "eastasian": "Members of Visible Minorities", "arab": "Members of Visible Minorities",
                "firstnations": "Indigenous Peoples", "metis": "Indigenous Peoples", "inuit": "Indigenous Peoples",
                "cognitive": "Persons with Disabilities", "mental": "Persons with Disabilities", "seeing": "Persons with Disabilities",
            }[src_key]

            themes = {}
            any_non_null = False
            for theme in THEMES:
                cells = data.get(theme, [None, None, None])
                normed = []
                for cell in cells:
                    if cell == "s":
                        normed.append("suppressed")
                    elif cell is None:
                        normed.append(None)
                    else:
                        normed.append(cell)
                        any_non_null = True
                themes[theme] = normed
            if not any_non_null:
                continue  # nothing surveyed for this lineage at this department

            n_raw = data.get("n")
            n = n_raw if isinstance(n_raw, (int, str)) else None

            entries.append({
                "department_key": dept_key,
                "group": parent_group,
                "subgroup": subgroup,
                "n": n,
                "themes": themes,
            })
            has_any = True
        if not has_any:
            skipped_no_data += 1
    return entries, skipped_no_data


def main():
    if not SOURCE_HTML.exists():
        print(f"✗ source not found: {SOURCE_HTML}")
        sys.exit(1)

    html = SOURCE_HTML.read_text(encoding="utf-8")
    depts = extract_const(html, "DEPTS")
    rep = extract_const(html, "REP")
    exp = extract_const(html, "EXP")
    ps_avg = extract_const(html, "PS_AVG")

    our_rows = json.loads(EQUITY_JSON.read_text())

    # --- gate: cross-validate their representation data against our verified data ---
    print("→ gate: cross-validate source REP against verified equity.json (2024-2025)")
    compared, matched, mismatches, unresolved = cross_validate(depts, rep, our_rows)
    rate = matched / compared if compared else 0.0
    print(f"  {matched}/{compared} department×group pairs matched within {MATCH_TOLERANCE_PP}pp ({rate:.1%})")
    if unresolved:
        print(f"  department names not resolved to our canonical list: {unresolved}")
    if mismatches:
        print(f"  mismatches ({len(mismatches)}):")
        for m in mismatches[:20]:
            print(f"    {m}")
    if rate < MATCH_FAIL_THRESHOLD:
        print(f"✗ cross-validation BLOCKED the build — match rate {rate:.1%} below "
              f"{MATCH_FAIL_THRESHOLD:.0%} threshold. Aborting.")
        sys.exit(1)
    print("✓ cross-validation passed\n")

    # --- map department codes to our canonical names (current year only —
    # some departments in 2023-2024 don't carry into 2024-2025, e.g. renames,
    # so counting across both years would overstate the current department total) ---
    our_dept_by_key = {}
    for row in our_rows:
        if row["year"] == "2024-2025":
            our_dept_by_key[norm(row["department"])] = row["department"]

    entries, skipped_no_data = build_entries(depts, exp)

    resolved_depts = set()
    output = []
    for e in entries:
        canonical = our_dept_by_key.get(e["department_key"])
        if canonical is None:
            continue  # couldn't resolve to a real department name — drop rather than guess
        resolved_depts.add(canonical)
        output.append({
            "department": canonical,
            "group": e["group"],
            "subgroup": e["subgroup"],
            "n": e["n"],
            "themes": e["themes"],
        })

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "subgroup_pses.json").write_text(json.dumps(output, separators=(",", ":")))

    meta = {
        "generated_by": "pipeline/build_subgroup_pses.py",
        "source": "Teammate project (Lorraine, ldzeble@ualberta.ca), 'Employment Equity "
                   "Intelligence Dashboard — TBS' — PSES workplace-experience data extracted "
                   "from its deployed dashboard.",
        "verification": "Not independently re-derived (source raw 2020/2022 PSES microdata, "
                         "demographic-recoding concordance, and department-name mapping are "
                         "unavailable to us). Cross-validated instead: representation values "
                         f"for every resolvable department x group pair matched our own "
                         f"verified 2024-2025 equity.json within {MATCH_TOLERANCE_PP}pp — "
                         f"{matched}/{compared} ({rate:.1%}).",
        "coverage": {
            "departments_with_data": len(resolved_depts),
            "departments_total": len(our_dept_by_key),
            "departments_skipped_no_survey_data": skipped_no_data,
        },
        "themes": THEMES,
        "years": YEARS,
        "ps_wide_average": ps_avg,
        "caveats": [
            "No subgroup representation or workforce-availability data exists at the "
            "department level in any available source — this is experience scores only.",
            "PSES renumbered its questions in 2024 and re-coded demographic BYCOND codes "
            "every cycle; group-level 3-cycle trends are honest only for Women per the "
            "source's own documented limitation (no overall Indigenous/disability/"
            "racialized code existed before 2024). Subgroup lineages (Black, First "
            "Nations, etc.) span all three cycles.",
            "'suppressed' means surveyed but below the reporting threshold; null means "
            "not surveyed that cycle — these are not the same and must not be rendered "
            "identically.",
            "Covers 53 of our 71 departments (the source's own scope).",
        ],
    }
    (OUT_DIR / "subgroup_pses_meta.json").write_text(json.dumps(meta, indent=2))

    print(f"✓ wrote {OUT_DIR/'subgroup_pses.json'} ({len(output)} entries, "
          f"{len(resolved_depts)} departments)")
    print(f"✓ wrote {OUT_DIR/'subgroup_pses_meta.json'}")

    rcmp = [e for e in output if e["department"] == "Royal Canadian Mounted Police"
            and e["group"] == "Persons with Disabilities"]
    print(f"\nspot check — RCMP x Persons with Disabilities entries: {len(rcmp)}")
    for e in rcmp:
        print(f"  subgroup={e['subgroup']} n={e['n']} harassment={e['themes']['harassment']}")


if __name__ == "__main__":
    main()
