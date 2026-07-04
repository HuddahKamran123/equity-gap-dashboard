"""
Fixed pipeline: generate the dashboard's JS data objects (DEPTS, REP, EXP,
PS_AVG) from the real prepared data, for injection into dashboard-live.html.

Sources (all build-time, no runtime dependency):
  knowledge/pses_prepared/*.csv.gz      dept-level PSES, suppression applied
  knowledge/bt1_28_representation.csv   rep % vs WFA, FY2021-22..FY2024-25
  knowledge/dept_name_mapping.csv       BT1-28 name <-> PSES LEVEL1ID
  knowledge/demographic_concordance.csv per-year BYCOND codes per group

Cell semantics in output:
  number  -> real score / rep %
  "s"     -> surveyed but suppressed (ANSCOUNT < 10 or sentinel)
  null    -> not surveyed / no code exists that cycle ("n/a", never "s")

Run:  python3 skills/build_dashboard_data.py  ->  /tmp/dashboard_data.js
"""
import pandas as pd
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
K = os.path.join(BASE, "knowledge")

THEMES = {
    "harassment": ("SUBINDICATORENG", "Harassment"),
    "belonging":  ("SUBINDICATORENG", "Diversity and inclusion"),
    "career":     ("SUBINDICATORENG", "Job fit and development"),
    "leadership": ("INDICATORENG",    "Leadership"),
    "workplace":  ("INDICATORENG",    "Workplace"),
    "wellbeing":  ("INDICATORENG",    "well-being"),
}
YEARS = [2020, 2022, 2024]

def load_pses():
    files = {2020: ["pses_2020"], 2022: ["pses_2022a", "pses_2022b"], 2024: ["pses_2024"]}
    dfs = []
    for yr, fs in files.items():
        d = pd.concat([pd.read_csv(os.path.join(K, "pses_prepared", f + ".csv.gz"),
                                   dtype=str) for f in fs], ignore_index=True)
        d["YEAR"] = yr
        dfs.append(d)
    d = pd.concat(dfs, ignore_index=True)
    d["LEVEL1ID"] = d["LEVEL1ID"].str.strip()
    d["BYCOND"] = d["BYCOND"].fillna("").str.strip()
    d["SCORE100"] = pd.to_numeric(d["SCORE100"], errors="coerce")
    d["ANSCOUNT"] = pd.to_numeric(d["ANSCOUNT"], errors="coerce")
    d["SUPPRESSED"] = d["SUPPRESSED"].astype(str).eq("True")
    return d

def theme_mask(d, theme):
    col, pat = THEMES[theme]
    m = d[col].str.contains(pat, case=False, na=False)
    if theme == "workplace":
        m = m & ~d["INDICATORENG"].str.contains("well-being", case=False, na=False)
    return m

def build_lookup(d):
    lut = {}
    for theme in THEMES:
        sub = d[theme_mask(d, theme)]
        ok = sub[~sub["SUPPRESSED"]].dropna(subset=["SCORE100"])
        agg = ok.groupby(["YEAR", "LEVEL1ID", "BYCOND"]).agg(
            score=("SCORE100", "mean"), n=("ANSCOUNT", "sum"))
        for (yr, l1, bc), r in agg.iterrows():
            lut[(theme, yr, l1, bc)] = (int(round(r["score"])), int(r["n"]))
        allc = set(map(tuple, sub[["YEAR", "LEVEL1ID", "BYCOND"]].drop_duplicates().values))
        for (yr, l1, bc) in allc:
            if (theme, yr, l1, bc) not in lut:
                lut[(theme, yr, l1, bc)] = ("s", 0)
    return lut

def cell(lut, dept, code, theme, year):
    if not code:
        return None, 0
    return lut.get((theme, year, dept, code), (None, 0))

def main():
    pses = load_pses()
    conc = pd.read_csv(os.path.join(K, "demographic_concordance.csv")).fillna("")
    mapping = pd.read_csv(os.path.join(K, "dept_name_mapping.csv"), dtype=str).fillna("")
    rep_src = pd.read_csv(os.path.join(K, "bt1_28_representation.csv"), dtype=str)

    mapped = mapping[mapping["match_type"].isin(["exact", "manual"])]
    dept_keys = {}
    for _, r in mapped.iterrows():
        dept_keys[r["bt128_name_clean"]] = ("d" + r["pses_level1id"], r["pses_level1id"])

    FY_SLOT = {"FY2021-22": 1, "FY2022-23": 2, "FY2023-24": 3, "FY2024-25": 4}
    GRP_COLS = {"women": "women", "indigenous": "indigenous",
                "disability": "disability", "racialized": "racialized"}
    rep_clean = (rep_src["department"].str.replace("£", "", regex=False)
                 .str.replace("lmpact", "Impact", regex=False)
                 .str.replace(r"\s*\d+\s*$", "", regex=True).str.strip())
    REP, DEPTS = {}, {}
    for bt_name, (jsk, l1) in sorted(dept_keys.items(), key=lambda x: x[0]):
        rows = rep_src[rep_clean.eq(bt_name)]
        if rows.empty:
            continue
        entry = {}
        for gkey, col in GRP_COLS.items():
            rep_arr = [None] * 5
            wfa_val = None
            for _, r in rows.iterrows():
                slot = FY_SLOT.get(str(r["fiscal_year"]).strip())
                if slot is None:
                    continue
                try:
                    rep_arr[slot] = round(float(r[f"{col}_pct"]), 1)
                except (TypeError, ValueError):
                    rep_arr[slot] = None
                try:
                    wfa_val = round(float(r[f"{col}_wfa"]), 1)
                except (TypeError, ValueError):
                    pass
            entry[gkey] = {"rep": rep_arr, "wfa": wfa_val, "subgroups": {}}
        REP[jsk] = entry
        DEPTS[jsk] = bt_name

    lut = build_lookup(pses)
    EXP = {}
    codes = {r["canonical_key"]: {2020: r["bycond_2020"], 2022: r["bycond_2022"],
                                  2024: r["bycond_2024"]}
             for _, r in conc.iterrows()}
    for jsk in DEPTS:
        l1 = jsk[1:]
        entry = {}
        for ckey, per_year in codes.items():
            g = {}
            n_latest = 0
            for theme in THEMES:
                vals = []
                for yr in YEARS:
                    v, n = cell(lut, l1, per_year[yr], theme, yr)
                    vals.append(v)
                    if theme == "harassment" and yr == 2024:
                        n_latest = n
                g[theme] = vals
            g["n"] = n_latest if n_latest else "<10"
            entry[ckey] = g
        EXP[jsk] = entry

    PS_AVG = {}
    for theme in THEMES:
        rows = pses[(pses["YEAR"] == 2024) & (pses["BYCOND"] == "")
                    & theme_mask(pses, theme) & ~pses["SUPPRESSED"]].dropna(subset=["SCORE100"])
        per_dept = rows.groupby("LEVEL1ID")["SCORE100"].mean()
        PS_AVG[theme] = int(round(per_dept.mean())) if len(per_dept) else None

    js = (
        "// REAL DATA - generated by skills/build_dashboard_data.py from BT1-28 + PSES\n"
        "// prepared files on 2026-07-03. Cell semantics: number = score; 's' = suppressed\n"
        "// (n<10 or sentinel); null = not surveyed under any code that cycle (n/a).\n"
        "const DEPTS=" + json.dumps(DEPTS, ensure_ascii=False) + ";\n"
        "const REP=" + json.dumps(REP, ensure_ascii=False) + ";\n"
        "const EXP=" + json.dumps(EXP, ensure_ascii=False) + ";\n"
        "const PS_AVG=" + json.dumps(PS_AVG, ensure_ascii=False) + ";\n"
    )
    out = "/tmp/dashboard_data.js"
    with open(out, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"depts: {len(DEPTS)} | REP: {len(REP)} | EXP: {len(EXP)} | PS_AVG: {PS_AVG}")
    print(f"written: {out} ({os.path.getsize(out)//1024} KB)")

if __name__ == "__main__":
    main()
