#!/usr/bin/env python3
"""
run_eval.py — the dashboard's output evaluation harness.

Evaluation here is about the OUTPUT, not the code: it independently recomputes the
numbers the dashboard shows and checks them against known answers, including a
pinned oracle. It is re-runnable so a Day-2 baseline and a Day-3 revision can be
measured on the same tests and the difference read off.

Target: web/src/data/equity.json (produced by pipeline/build_dataset.py).

Run:  python3 eval/run_eval.py
Exit: 0 = all checks pass, 1 = at least one failed.
"""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATA = REPO / "web" / "src" / "data" / "equity.json"

WFA = {
    "2023-2024": {"Women": 55.3, "Indigenous Peoples": 4.1,
                  "Persons with Disabilities": 12.0, "Members of Visible Minorities": 22.7},
    "2024-2025": {"Women": 54.9, "Indigenous Peoples": 4.0,
                  "Persons with Disabilities": 12.0, "Members of Visible Minorities": 22.7},
}
PSES_KEEP = {"pses_engagement", "pses_diversity_inclusion", "pses_harassment", "pses_discrimination"}

results = []


def check(name):
    def deco(fn):
        def run(rows):
            try:
                fails = fn(rows)
            except Exception as e:  # noqa: BLE001
                fails = [f"exception: {e}"]
            results.append((name, fails))
        run.__name__ = fn.__name__
        return run
    return deco


def severity_of(rep, wfa):
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


def quartile(vals):
    s = sorted(vals)
    if not s:
        return None
    pos = 0.25 * (len(s) - 1)
    lo = int(pos)
    frac = pos - lo
    return s[lo] + frac * (s[lo + 1] - s[lo]) if lo + 1 < len(s) else s[lo]


# ---- known-answer test cases ----

@check("1. Oracle — RCMP · Persons with Disabilities · 2024-25")
def t_oracle(rows):
    r = next((x for x in rows if x["department"] == "Royal Canadian Mounted Police"
              and x["group"] == "Persons with Disabilities" and x["year"] == "2024-2025"), None)
    if not r:
        return ["oracle row not found"]
    want = {"rep_pct": 5.5, "members": 590, "all_employees": 10822, "wfa": 12.0,
            "expected": 1299, "gap": -709, "severity": "substantial", "priority": True}
    f = [f"{k}: got {r.get(k)!r}, want {v!r}" for k, v in want.items() if r.get(k) != v]
    # PSES discrimination must now be populated (was empty in the original dataset)
    if not (r.get("pses") and r["pses"].get("pses_discrimination") is not None):
        f.append("pses_discrimination missing (should be backfilled from raw source)")
    return f


@check("2. Counts match documentation")
def t_counts(rows):
    f = []
    if len(rows) != 576:
        f.append(f"total rows {len(rows)} != 576")
    d24 = {r["department"] for r in rows if r["year"] == "2024-2025"}
    d23 = {r["department"] for r in rows if r["year"] == "2023-2024"}
    if len(d24) != 72:
        f.append(f"2024-25 depts {len(d24)} != 72")
    if len(d23) != 72:
        f.append(f"2023-24 depts {len(d23)} != 72")
    supp = sum(1 for r in rows if r["suppressed"])
    if supp != 77:
        f.append(f"suppressed rows {supp} != 77")
    return f


@check("3. Gap arithmetic reconciles (every non-suppressed row)")
def t_arith(rows):
    f = []
    for r in rows:
        if r["suppressed"]:
            continue
        allv, m, wfa = r["all_employees"], r["members"], r["wfa"]
        if None in (allv, m, wfa):
            continue
        exp = allv * wfa / 100
        if abs(exp - r["expected"]) > 1:
            f.append(f"{r['department']}/{r['group']}: expected {r['expected']} != {exp:.1f}")
        if abs((m - exp) - r["gap"]) > 1:
            f.append(f"{r['department']}/{r['group']}: gap {r['gap']} != {(m-exp):.1f}")
        if abs(m / allv * 100 - r["rep_pct"]) > 0.15:
            f.append(f"{r['department']}/{r['group']}: rep {r['rep_pct']} != {m/allv*100:.2f}")
    return f[:5]


@check("4. WFA benchmark matches the service-wide value for group × year")
def t_wfa(rows):
    f = []
    for r in rows:
        want = WFA.get(r["year"], {}).get(r["group"])
        if want is not None and r["wfa"] is not None and abs(r["wfa"] - want) > 0.001:
            f.append(f"{r['department']}/{r['group']} {r['year']}: wfa {r['wfa']} != {want}")
    return f[:5]


@check("5. Severity matches the percentage-point thresholds")
def t_severity(rows):
    f = []
    for r in rows:
        want = severity_of(r["rep_pct"], r["wfa"]) if not r["suppressed"] else None
        if r["severity"] != want:
            f.append(f"{r['department']}/{r['group']}: severity {r['severity']} != {want}")
    return f[:5]


@check("6. Priority = bottom quartile of gap within each group × year")
def t_priority(rows):
    f = []
    thr = {}
    cohort = {}
    for r in rows:
        if r["gap"] is not None:
            cohort.setdefault((r["group"], r["year"]), []).append(r["gap"])
    for k, v in cohort.items():
        thr[k] = quartile(v)
    for r in rows:
        t = thr.get((r["group"], r["year"]))
        want = bool(r["gap"] is not None and t is not None and r["gap"] <= t and r["gap"] < 0)
        if r["priority"] != want:
            f.append(f"{r['department']}/{r['group']}: priority {r['priority']} != {want}")
    return f[:5]


@check("7. Suppressed cells are blank, never zero")
def t_suppression(rows):
    f = []
    for r in rows:
        if r["suppressed"]:
            if r["rep_pct"] is not None or r["gap"] is not None or r["members"] is not None:
                f.append(f"{r['department']}/{r['group']}: suppressed but has values")
            if r["severity"] is not None:
                f.append(f"{r['department']}/{r['group']}: suppressed but severity set")
    return f[:5]


@check("8. PSES — 4 indicators, in range, mobility absent, only on 2024-25")
def t_pses(rows):
    f = []
    enriched = 0
    for r in rows:
        if r["pses"]:
            enriched += 1
            if r["year"] != "2024-2025":
                f.append(f"{r['department']}/{r['group']}: PSES on non-2024-25 row")
            for k, v in r["pses"].items():
                if k not in PSES_KEEP:
                    f.append(f"{r['department']}/{r['group']}: unexpected PSES key {k}")
                elif v is not None and not (0 <= v <= 100):
                    f.append(f"{r['department']}/{r['group']}: PSES {k}={v} out of range")
            if "pses_mobility_retention" in r["pses"]:
                f.append(f"{r['department']}/{r['group']}: mobility/retention should be omitted")
    if enriched == 0:
        f.append("no PSES-enriched rows found")
    return f[:5]


@check("9. Trend fields only for departments present in both years")
def t_trend(rows):
    f = []
    for r in rows:
        if r["has_trend"]:
            if r["year"] != "2024-2025":
                f.append(f"{r['department']}/{r['group']}: has_trend on non-current row")
            if r["prior_rep_pct"] is None or r["prior_gap"] is None:
                f.append(f"{r['department']}/{r['group']}: has_trend but missing prior values")
    return f[:5]


@check("10. Divergence flags reconcile (rep met, experience below peer average)")
def t_divergence(rows):
    meta = json.loads((REPO / "web" / "src" / "data" / "meta.json").read_text())
    base = meta.get("pses_ps_baseline", {})
    RISK = ["pses_harassment", "pses_discrimination"]
    MARGIN = 5.0
    f = []
    n = 0
    for r in rows:
        want = False
        if r["year"] == "2024-2025" and r.get("pses") and r.get("gap") is not None and r["gap"] >= 0:
            gb = base.get(r["group"], {})
            shorts = [round(gb[i] - r["pses"][i], 1) for i in RISK if i in gb and i in r["pses"]]
            want = bool(shorts and max(shorts) >= MARGIN)
        if bool(r.get("divergence")) != want:
            f.append(f"{r['department']}/{r['group']}: divergence {r.get('divergence')} != {want}")
        if r.get("divergence"):
            n += 1
    if n == 0:
        f.append("no divergence rows flagged")
    return f[:5]


def main():
    if not DATA.exists():
        print(f"data not found: {DATA} — run pipeline/build_dataset.py first")
        return 2
    rows = json.loads(DATA.read_text())

    checks = [t_oracle, t_counts, t_arith, t_wfa, t_severity, t_priority,
              t_suppression, t_pses, t_trend, t_divergence]
    for c in checks:
        c(rows)

    print(f"Employment Equity Gap — output evaluation ({len(rows)} rows)\n")
    passed = 0
    for name, fails in results:
        if not fails:
            print(f"  \033[32m✓ PASS\033[0m  {name}")
            passed += 1
        else:
            print(f"  \033[31m✗ FAIL\033[0m  {name}")
            for m in fails:
                print(f"           · {m}")
    total = len(results)
    print(f"\n{passed}/{total} checks passed.")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
