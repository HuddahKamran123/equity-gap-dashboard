#!/usr/bin/env python3
"""
build_dataset.py — the reproducible data pipeline for the Employment Equity Gap
dashboard. It is the single source of the app's data.

Flow:
  1. GATE: run edi-data-guard/validate.py on the canonical TBS CSV; abort on failure.
  2. Read the verified TBS representation/gap rows (the decision-driving data).
  3. Join PSES 2024 subindicator scores extracted from the raw microdata
     (pipeline/pses_dept_scores.json, produced by extract_pses.py).
  4. Compute severity, priority (bottom quartile of gap per group×year), and
     year-over-year trend fields in code (not baked offline).
  5. Emit web/src/data/equity.json (+ meta.json) — the file the app reads.

Run:  python3 pipeline/build_dataset.py
"""
import csv, json, re, subprocess, sys
from pathlib import Path
from collections import defaultdict

REPO = Path(__file__).resolve().parent.parent
TBS_CSV = REPO / "Knowledge" / "data" / "processed" / "employment_equity_department_gaps.csv"
PSES_JSON = REPO / "pipeline" / "pses_dept_scores.json"
GUARD = REPO / ".claude" / "skills" / "edi-data-guard" / "scripts" / "validate.py"
OUT_DIR = REPO / "web" / "src" / "data"

WFA = {
    "2023-2024": {"Women": 55.3, "Indigenous Peoples": 4.1,
                  "Persons with Disabilities": 12.0, "Members of Visible Minorities": 22.7},
    "2024-2025": {"Women": 54.9, "Indigenous Peoples": 4.0,
                  "Persons with Disabilities": 12.0, "Members of Visible Minorities": 22.7},
}
# PSES indicators we publish (mobility_retention is fully suppressed at the
# department × equity-group breakdown, so it is honestly omitted, not fabricated).
PSES_KEEP = ["pses_engagement", "pses_diversity_inclusion", "pses_harassment", "pses_discrimination"]

# Manual aliases: TBS name -> PSES DEPT_E name, for departments whose names differ
# between the two sources beyond what normalization catches.
PSES_ALIASES = {
    "western economic diversification canada": "prairies economic development canada",
    "canadian northern economic development agency": "canadian northern economic development agency cannor",
}


def norm(name):
    n = name.lower().strip()
    n = re.sub(r"\(.*?\)", " ", n)
    n = n.replace("&", "and")
    n = re.sub(r"[^a-z0-9 ]", " ", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n


def f(v):
    v = (v or "").strip()
    if v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def i(v):
    x = f(v)
    return None if x is None else int(round(x))


def severity(rep, wfa):
    if rep is None or wfa is None:
        return None
    pp = wfa - rep
    if pp <= 0:
        return "above"
    if pp < 2:
        return "slight"
    if pp < 5:
        return "moderate"
    if pp < 10:
        return "substantial"
    return "severe"


def quartile_threshold(values):
    """25th percentile (linear interpolation) of a list of numbers."""
    if not values:
        return None
    s = sorted(values)
    pos = 0.25 * (len(s) - 1)
    lo = int(pos)
    frac = pos - lo
    if lo + 1 < len(s):
        return s[lo] + frac * (s[lo + 1] - s[lo])
    return s[lo]


def run_guard():
    print("→ gate: edi-data-guard")
    res = subprocess.run([sys.executable, str(GUARD), str(TBS_CSV)])
    if res.returncode != 0:
        print("✗ edi-data-guard BLOCKED the dataset — aborting build.")
        sys.exit(1)
    print("✓ data-guard passed\n")


def main():
    run_guard()

    pses = json.loads(PSES_JSON.read_text())
    pses_by_norm = {norm(d): v for d, v in pses.items()}

    rows = list(csv.DictReader(open(TBS_CSV, encoding="utf-8-sig")))

    # --- normalize + structure rows ---
    recs = []
    for r in rows:
        dept = r["department_agency"].strip()
        grp = r["equity_group"].strip()
        year = r["fiscal_year"].strip()
        rep = f(r["representation_percent"])
        wfa = f(r["workforce_availability_percent"])
        gap = f(r["gap"])
        rec = {
            "department": dept,
            "department_key": norm(dept),
            "group": grp,
            "year": year,
            "all_employees": i(r["all_employees"]),
            "members": i(r["designated_group_members"]),
            "rep_pct": rep,
            "wfa": wfa,
            "expected": i(r["expected_number"]),
            "gap": None if gap is None else int(round(gap)),
            "pp_below": None if (rep is None or wfa is None) else round(wfa - rep, 1),
            "severity": severity(rep, wfa),
            "suppressed": r["designated_group_members"].strip() == "",
        }
        recs.append(rec)

    # --- priority: bottom quartile of gap within each (group, year) ---
    by_cohort = defaultdict(list)
    for rec in recs:
        if rec["gap"] is not None:
            by_cohort[(rec["group"], rec["year"])].append(rec["gap"])
    thresholds = {k: quartile_threshold(v) for k, v in by_cohort.items()}
    for rec in recs:
        t = thresholds.get((rec["group"], rec["year"]))
        rec["priority"] = bool(
            rec["gap"] is not None and t is not None and rec["gap"] <= t and rec["gap"] < 0
        )

    # --- year-over-year trend (match on normalized dept + group) ---
    prior = {}
    for rec in recs:
        if rec["year"] == "2023-2024":
            prior[(rec["department_key"], rec["group"])] = rec
    for rec in recs:
        rec["has_trend"] = False
        rec["prior_gap"] = None
        rec["prior_rep_pct"] = None
        if rec["year"] == "2024-2025":
            p = prior.get((rec["department_key"], rec["group"]))
            if p:
                rec["has_trend"] = True
                rec["prior_gap"] = p["gap"]
                rec["prior_rep_pct"] = p["rep_pct"]

    # --- join PSES (2024-25 only) ---
    pses_matched = set()
    pses_missing = set()
    for rec in recs:
        rec["pses"] = None
        if rec["year"] != "2024-2025":
            continue
        key = norm(rec["department"])
        alias = PSES_ALIASES.get(key)
        sc = pses_by_norm.get(key) or (pses_by_norm.get(norm(alias)) if alias else None)
        if not sc:
            pses_missing.add(rec["department"])
            continue
        grp_scores = sc.get(rec["group"], {})
        kept = {k: grp_scores[k] for k in PSES_KEEP if k in grp_scores and grp_scores[k] is not None}
        if kept:
            rec["pses"] = kept
            pses_matched.add(rec["department"])

    # --- divergence: representation met, but experience lags the peer group ---
    # Flag a 2024-25 row when the group is AT/ABOVE its representation benchmark yet
    # scores materially below the SAME group's public-service-wide average on an
    # experience-risk indicator (harassment or discrimination). This pairs two
    # separately-shown signals — it is NOT a composite score, and asserts no cause.
    baseline = pses.get("Public Service", {})
    RISK = ["pses_harassment", "pses_discrimination"]
    DIVERGENCE_MARGIN = 5.0  # points below the peer-group PS average; a documented floor, ranking is the emphasis
    div_count = 0
    for rec in recs:
        rec["divergence"] = False
        rec["divergence_shortfall"] = None
        rec["divergence_indicator"] = None
        if rec["year"] != "2024-2025" or not rec["pses"] or rec["gap"] is None or rec["gap"] < 0:
            continue
        grp_base = baseline.get(rec["group"], {})
        worst = None
        for ind in RISK:
            b, v = grp_base.get(ind), rec["pses"].get(ind)
            if b is None or v is None:
                continue
            short = round(b - v, 1)  # positive = below the peer-group average
            if worst is None or short > worst[0]:
                worst = (short, ind)
        if worst and worst[0] >= DIVERGENCE_MARGIN:
            rec["divergence"] = True
            rec["divergence_shortfall"] = worst[0]
            rec["divergence_indicator"] = worst[1]
            div_count += 1

    # --- drop helper key, write output ---
    for rec in recs:
        rec.pop("department_key", None)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "equity.json").write_text(json.dumps(recs, separators=(",", ":")))

    depts_2024 = sorted({r["department"] for r in recs if r["year"] == "2024-2025"})
    depts_2023 = sorted({r["department"] for r in recs if r["year"] == "2023-2024"})
    pses_rows = sum(1 for r in recs if r["pses"])
    meta = {
        "generated_by": "pipeline/build_dataset.py",
        "sources": {
            "tbs_representation": "Treasury Board Annual Report on the Public Service Employment "
                                  "Equity Act 2024-25 (BT1-28-2025) + 2023-24 demographic snapshot; "
                                  "processed CSV verified by edi-data-guard.",
            "pses": "2024 Public Service Employee Survey — Employment Equity Derived Variable "
                    "dataset (EEINFODV.csv), https://open.canada.ca/data/en/dataset/"
                    "7f625e97-9d02-4c12-a756-1ddebb50e69f",
        },
        "pses_method": "Subindicator score = mean of the non-suppressed (≠9999) SCORE100 of its "
                       "constituent questions, at the department × equity-group level (LEVEL2–5=0).",
        "pses_indicators": PSES_KEEP,
        "pses_unavailable": ["pses_mobility_retention"],
        "pses_unavailable_reason": "Mobility & retention questions (D57_1/D57_2) are suppressed "
                                   "(SCORE100=9999) at the department × equity-group breakdown.",
        "wfa_by_year": WFA,
        "severity_thresholds_pp": {"slight": "<2", "moderate": "2–4.9",
                                   "substantial": "5–9.9", "severe": "≥10"},
        "priority_rule": "Bottom quartile of (negative) gap within each equity group × fiscal year.",
        "divergence_rule": "Representation at/above benchmark (gap >= 0) AND experience at least "
                           f"{DIVERGENCE_MARGIN} points below the same group's public-service average on "
                           "harassment or discrimination. Two signals shown separately — not a composite. "
                           "Ranked by shortfall; the margin is a floor.",
        "pses_ps_baseline": baseline,
        "counts": {
            "rows": len(recs),
            "divergence_rows": div_count,
            "depts_2024_25": len(depts_2024),
            "depts_2023_24": len(depts_2023),
            "suppressed_rows": sum(1 for r in recs if r["suppressed"]),
            "pses_enriched_rows": pses_rows,
            "trend_eligible_rows": sum(1 for r in recs if r["has_trend"]),
            "priority_rows": sum(1 for r in recs if r["priority"]),
        },
    }
    (OUT_DIR / "meta.json").write_text(json.dumps(meta, indent=2))

    # --- report + oracle ---
    print(f"✓ wrote {OUT_DIR/'equity.json'} ({len(recs)} rows)")
    print(f"✓ wrote {OUT_DIR/'meta.json'}")
    print(f"\ncounts: {json.dumps(meta['counts'])}")
    print(f"PSES matched depts: {len(pses_matched)} / {len(depts_2024)}  "
          f"(missing: {len(pses_missing)})")
    if pses_missing:
        print("  no PSES match: " + ", ".join(sorted(pses_missing)[:12])
              + (" …" if len(pses_missing) > 12 else ""))

    oracle = next((r for r in recs if r["department"] == "Royal Canadian Mounted Police"
                   and r["group"] == "Persons with Disabilities" and r["year"] == "2024-2025"), None)
    print("\nORACLE — RCMP · Persons with Disabilities · 2024-25:")
    if oracle:
        ok = (oracle["rep_pct"] == 5.5 and oracle["members"] == 590
              and oracle["all_employees"] == 10822 and oracle["wfa"] == 12.0
              and oracle["gap"] == -709)
        print(f"  rep={oracle['rep_pct']}% N={oracle['members']} of {oracle['all_employees']} "
              f"WFA={oracle['wfa']} gap={oracle['gap']} severity={oracle['severity']} "
              f"priority={oracle['priority']}")
        print(f"  PSES: {oracle['pses']}")
        print("  " + ("✓ ORACLE MATCHES" if ok else "✗ ORACLE MISMATCH"))
        if not ok:
            sys.exit(1)
    else:
        print("  ✗ oracle row not found"); sys.exit(1)


if __name__ == "__main__":
    main()
