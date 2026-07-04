"""
extract_all_tables.py  —  Fixed pipeline
Extracts every relevant table from BT1-28 annual reports (FY2021-22 → FY2024-25)
and writes one CSV per table type into knowledge/tables/

Table outputs:
  01_cpa_summary.csv           - CPA-wide representation vs WFA by year
  02_historical_trend.csv      - Public service representation since 2015
  03_executive_pipeline.csv    - EX-01 to EX-05 by designated group
  04_workforce_flows.csv       - Hires / promotions / separations
  05_racialized_subgroups.csv  - Racialized subgroup headcount and % (snapshot)
  06_racialized_trend.csv      - Racialized subgroup % trend by year
  07_indigenous_subgroups.csv  - Indigenous subgroup headcount and %
  08_disability_subgroups.csv  - Disability subgroup headcount and %
  09_disability_trend.csv      - Disability subgroup % trend by year
  10_salary_distribution.csv   - Salary range by designated group
  11_region_of_work.csv        - Region of work by designated group
  12_occupational_groups.csv   - Occupational group by designated group
  13_age_distribution.csv      - Age range by designated group
  14_wfa_benchmarks.csv        - WFA benchmark values by census year

Run: python skills/extract_all_tables.py
"""

import os, re, csv, pdfplumber

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(BASE, "knowledge", "tables")
os.makedirs(OUT, exist_ok=True)

# ── Page targets (0-indexed) ──────────────────────────────────────────────
# Format: {fiscal_year: (pdf_filename, report_year, {table_key: [page_indices]})}
TARGETS = {
    "FY2021-22": ("BT1-28-2022-eng.pdf", 2022, {
        "workforce_flows":       [6],
        "salary_distribution":   [55],
        "region_of_work":        [51, 52],
        "occupational_groups":   [53],
        "age_distribution":      [56, 57],
        "historical_trend":      [58],
        "racialized_subgroups":  [39, 40],
    }),
    "FY2022-23": ("BT1-28-2023-eng.pdf", 2023, {
        "cpa_summary":           [5, 6],
        "historical_trend":      [69],
        "executive_pipeline":    [11],
        "workforce_flows":       [28, 33, 34, 40, 41, 48, 49],
        "racialized_subgroups":  [50],
        "indigenous_subgroups":  [35],
        "disability_subgroups":  [42],
        "salary_distribution":   [65, 66],
        "region_of_work":        [60, 61],
        "occupational_groups":   [62, 63],
        "age_distribution":      [67, 68],
        "wfa_benchmarks":        [70],
    }),
    "FY2023-24": ("BT1-28-2024-eng (1).pdf", 2024, {
        "cpa_summary":           [8],
        "historical_trend":      [86],
        "executive_pipeline":    [10],
        "workforce_flows":       [75, 76],
        "racialized_subgroups":  [64],
        "racialized_trend":      [68, 69],
        "indigenous_subgroups":  [50],
        "disability_subgroups":  [57],
        "disability_trend":      [60, 61],
        "salary_distribution":   [83, 84],
        "region_of_work":        [80],
        "occupational_groups":   [81],
        "age_distribution":      [85],
        "wfa_benchmarks":        [87],
    }),
    "FY2024-25": ("BT1-28-2025-eng.pdf", 2025, {
        "cpa_summary":           [5, 6],
        "historical_trend":      [63, 64],
        "executive_pipeline":    [23],
        "workforce_flows":       [53, 54],
        "racialized_subgroups":  [29],
        "racialized_trend":      [47, 48],
        "indigenous_subgroups":  [43],
        "disability_subgroups":  [36],
        "disability_trend":      [39, 40],
        "salary_distribution":   [61],
        "region_of_work":        [58],
        "occupational_groups":   [59],
        "age_distribution":      [62],
        "wfa_benchmarks":        [65],
    }),
}

def cn(v):
    """Clean and convert cell to float or None."""
    if v is None: return None
    s = str(v).strip().replace(",", "").replace("%", "").replace("\n", " ")
    if s in ("*", "", "-", "–", "—", "n/a", "N/A", "None"): return None
    try: return float(s)
    except: return None

def cs(v):
    """Clean cell to string."""
    if v is None: return ""
    return str(v).strip().replace("\n", " ").replace("  ", " ")

def get_pages(pdf, indices):
    """Extract and concatenate tables from given 0-based page indices."""
    rows = []
    header = None
    for i in indices:
        if i >= len(pdf.pages): continue
        t = pdf.pages[i].extract_table()
        if not t: continue
        if header is None:
            header = t[0]
            rows.extend(t[1:])
        else:
            # Skip header row if repeated
            start = 1 if str(t[0]) == str(header) else 0
            rows.extend(t[start:])
    return header, rows

def write_csv(filename, fieldnames, rows):
    path = os.path.join(OUT, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    return len(rows)

# ══════════════════════════════════════════════════════════════════════════
# TABLE EXTRACTORS
# ══════════════════════════════════════════════════════════════════════════

# ── 01 CPA Summary ────────────────────────────────────────────────────────
def extract_cpa_summary(pdf, fy, yr, page_ids):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    out = []
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or r0.lower() in ("employment equity designated group","group",""):
            continue
        # Try to find year columns
        rec = {"fiscal_year": fy, "report_year": yr, "group": r0}
        for i, cell in enumerate(row[1:], 1):
            h = cs(hdr[i]) if i < len(hdr) else f"col{i}"
            if h: rec[h] = cs(cell)
        out.append(rec)
    return out

# ── 02 Historical Trend ───────────────────────────────────────────────────
def extract_historical_trend(pdf, fy, yr, page_ids):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    out = []
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or "representation" in r0.lower(): continue
        rec = {"source_report_fy": fy, "source_report_year": yr}
        for i, h in enumerate(hdr):
            if h: rec[cs(h)] = cs(row[i]) if i < len(row) else ""
        out.append(rec)
    return out

# ── 03 Executive Pipeline ─────────────────────────────────────────────────
def extract_executive_pipeline(pdf, fy, yr, page_ids):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    out = []
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or r0.lower() in ("employment equity designated group","group",""): continue
        rec = {"fiscal_year": fy, "report_year": yr, "group": r0}
        for i in range(1, len(hdr)):
            h = cs(hdr[i]) if i < len(hdr) and hdr[i] else f"col{i}"
            rec[h] = cs(row[i]) if i < len(row) else ""
        out.append(rec)
    return out

# ── 04 Workforce Flows ────────────────────────────────────────────────────
def extract_workforce_flows(pdf, fy, yr, page_ids):
    out = []
    for pi in page_ids:
        if pi >= len(pdf.pages): continue
        t = pdf.pages[pi].extract_table()
        if not t or len(t) < 2: continue
        hdr = [cs(h) for h in t[0]]
        for row in t[1:]:
            if not row or not row[0]: continue
            rec = {"fiscal_year": fy, "report_year": yr}
            for i, h in enumerate(hdr):
                if h: rec[h] = cs(row[i]) if i < len(row) else ""
            out.append(rec)
    return out

# ── 05 Racialized Subgroups Snapshot ─────────────────────────────────────
def extract_subgroup_snapshot(pdf, fy, yr, page_ids, group_label):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    out = []
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or r0.lower() in ("subgroup","subgroup population","group",""): continue
        rec = {"fiscal_year": fy, "report_year": yr, "designated_group": group_label, "subgroup": r0}
        for i in range(1, len(hdr)):
            h = cs(hdr[i]) if i < len(hdr) and hdr[i] else f"col{i}"
            rec[h] = cs(row[i]) if i < len(row) else ""
        out.append(rec)
    return out

# ── 06/09 Subgroup Trend ──────────────────────────────────────────────────
def extract_subgroup_trend(pdf, fy, yr, page_ids, group_label):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    # Wide → long: one row per (subgroup, year)
    out = []
    years = [cs(h) for h in hdr[1:] if h and re.match(r'20\d\d', cs(h or ""))]
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or r0.lower() in ("subgroup","group",""): continue
        for j, y in enumerate(years, 1):
            val = cs(row[j]) if j < len(row) else ""
            out.append({
                "fiscal_year": fy, "report_year": yr,
                "designated_group": group_label, "subgroup": r0,
                "data_year": y, "value": val,
            })
    return out

# ── 10 Salary Distribution ────────────────────────────────────────────────
def extract_salary_distribution(pdf, fy, yr, page_ids):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    out = []
    # Detect column structure: salary_range | all_emp | [group | none | none ...]
    # Build clean column names
    col_names = []
    pending = None
    for h in hdr:
        s = cs(h)
        if s and s not in ("None",""):
            pending = s
            col_names.append(s)
        else:
            col_names.append(pending or "")
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or "salary" in r0.lower() or "range" in r0.lower(): continue
        rec = {"fiscal_year": fy, "report_year": yr, "salary_range": r0}
        for i in range(1, len(col_names)):
            if col_names[i]: rec[col_names[i]] = cs(row[i]) if i < len(row) else ""
        out.append(rec)
    return out

# ── 11 Region of Work ─────────────────────────────────────────────────────
def extract_region_of_work(pdf, fy, yr, page_ids):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    out = []
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or "region" in r0.lower(): continue
        rec = {"fiscal_year": fy, "report_year": yr, "region": r0}
        for i in range(1, len(hdr)):
            h = cs(hdr[i]) if i < len(hdr) and hdr[i] else f"col{i}"
            if h: rec[h] = cs(row[i]) if i < len(row) else ""
        out.append(rec)
    return out

# ── 12 Occupational Groups ────────────────────────────────────────────────
def extract_occupational_groups(pdf, fy, yr, page_ids):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    out = []
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or "occupational" in r0.lower(): continue
        rec = {"fiscal_year": fy, "report_year": yr, "occupational_group": r0}
        for i in range(1, len(hdr)):
            h = cs(hdr[i]) if i < len(hdr) and hdr[i] else f"col{i}"
            if h: rec[h] = cs(row[i]) if i < len(row) else ""
        out.append(rec)
    return out

# ── 13 Age Distribution ───────────────────────────────────────────────────
def extract_age_distribution(pdf, fy, yr, page_ids):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    col_names = []
    pending = None
    for h in hdr:
        s = cs(h)
        if s and s not in ("None",""):
            pending = s; col_names.append(s)
        else:
            col_names.append(pending or "")
    out = []
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or "age" in r0.lower() or "range" in r0.lower(): continue
        rec = {"fiscal_year": fy, "report_year": yr, "age_range": r0}
        for i in range(1, len(col_names)):
            if col_names[i]: rec[col_names[i]] = cs(row[i]) if i < len(row) else ""
        out.append(rec)
    return out

# ── 14 WFA Benchmarks ─────────────────────────────────────────────────────
def extract_wfa_benchmarks(pdf, fy, yr, page_ids):
    hdr, rows = get_pages(pdf, page_ids)
    if not hdr: return []
    out = []
    for row in rows:
        if not row or not row[0]: continue
        r0 = cs(row[0])
        if not r0 or "workforce" in r0.lower() or "availability" in r0.lower(): continue
        rec = {"fiscal_year": fy, "report_year": yr, "census_benchmark": r0}
        for i in range(1, len(hdr)):
            h = cs(hdr[i]) if i < len(hdr) and hdr[i] else f"col{i}"
            if h: rec[h] = cs(row[i]) if i < len(row) else ""
        out.append(rec)
    return out


# ══════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════
def main():
    # Collect all records per table type
    tables = {
        "01_cpa_summary":          [],
        "02_historical_trend":     [],
        "03_executive_pipeline":   [],
        "04_workforce_flows":      [],
        "05_racialized_subgroups": [],
        "06_racialized_trend":     [],
        "07_indigenous_subgroups": [],
        "08_disability_subgroups": [],
        "09_disability_trend":     [],
        "10_salary_distribution":  [],
        "11_region_of_work":       [],
        "12_occupational_groups":  [],
        "13_age_distribution":     [],
        "14_wfa_benchmarks":       [],
    }

    for fy, (fname, yr, tmap) in TARGETS.items():
        path = os.path.join(BASE, fname)
        if not os.path.exists(path):
            print(f"  SKIP {fy}: not found"); continue
        print(f"\n  {fy} ({fname})")
        with pdfplumber.open(path) as pdf:

            if "cpa_summary" in tmap:
                r = extract_cpa_summary(pdf, fy, yr, tmap["cpa_summary"])
                tables["01_cpa_summary"].extend(r)
                print(f"    cpa_summary:          {len(r)} rows")

            if "historical_trend" in tmap:
                r = extract_historical_trend(pdf, fy, yr, tmap["historical_trend"])
                tables["02_historical_trend"].extend(r)
                print(f"    historical_trend:     {len(r)} rows")

            if "executive_pipeline" in tmap:
                r = extract_executive_pipeline(pdf, fy, yr, tmap["executive_pipeline"])
                tables["03_executive_pipeline"].extend(r)
                print(f"    executive_pipeline:   {len(r)} rows")

            if "workforce_flows" in tmap:
                r = extract_workforce_flows(pdf, fy, yr, tmap["workforce_flows"])
                tables["04_workforce_flows"].extend(r)
                print(f"    workforce_flows:      {len(r)} rows")

            if "racialized_subgroups" in tmap:
                r = extract_subgroup_snapshot(pdf, fy, yr, tmap["racialized_subgroups"], "Racialized persons")
                tables["05_racialized_subgroups"].extend(r)
                print(f"    racialized_subgroups: {len(r)} rows")

            if "racialized_trend" in tmap:
                r = extract_subgroup_trend(pdf, fy, yr, tmap["racialized_trend"], "Racialized persons")
                tables["06_racialized_trend"].extend(r)
                print(f"    racialized_trend:     {len(r)} rows")

            if "indigenous_subgroups" in tmap:
                r = extract_subgroup_snapshot(pdf, fy, yr, tmap["indigenous_subgroups"], "Indigenous peoples")
                tables["07_indigenous_subgroups"].extend(r)
                print(f"    indigenous_subgroups: {len(r)} rows")

            if "disability_subgroups" in tmap:
                r = extract_subgroup_snapshot(pdf, fy, yr, tmap["disability_subgroups"], "Persons with disabilities")
                tables["08_disability_subgroups"].extend(r)
                print(f"    disability_subgroups: {len(r)} rows")

            if "disability_trend" in tmap:
                r = extract_subgroup_trend(pdf, fy, yr, tmap["disability_trend"], "Persons with disabilities")
                tables["09_disability_trend"].extend(r)
                print(f"    disability_trend:     {len(r)} rows")

            if "salary_distribution" in tmap:
                r = extract_salary_distribution(pdf, fy, yr, tmap["salary_distribution"])
                tables["10_salary_distribution"].extend(r)
                print(f"    salary_distribution:  {len(r)} rows")

            if "region_of_work" in tmap:
                r = extract_region_of_work(pdf, fy, yr, tmap["region_of_work"])
                tables["11_region_of_work"].extend(r)
                print(f"    region_of_work:       {len(r)} rows")

            if "occupational_groups" in tmap:
                r = extract_occupational_groups(pdf, fy, yr, tmap["occupational_groups"])
                tables["12_occupational_groups"].extend(r)
                print(f"    occupational_groups:  {len(r)} rows")

            if "age_distribution" in tmap:
                r = extract_age_distribution(pdf, fy, yr, tmap["age_distribution"])
                tables["13_age_distribution"].extend(r)
                print(f"    age_distribution:     {len(r)} rows")

            if "wfa_benchmarks" in tmap:
                r = extract_wfa_benchmarks(pdf, fy, yr, tmap["wfa_benchmarks"])
                tables["14_wfa_benchmarks"].extend(r)
                print(f"    wfa_benchmarks:       {len(r)} rows")

    # Write CSVs — derive fieldnames from collected rows
    print("\n  Writing CSVs...")
    total_files = 0
    for tname, rows in tables.items():
        if not rows: continue
        # Collect all keys
        all_keys = []
        seen = set()
        for row in rows:
            for k in row:
                if k not in seen:
                    all_keys.append(k)
                    seen.add(k)
        n = write_csv(f"{tname}.csv", all_keys, rows)
        print(f"    {tname}.csv  →  {n} rows")
        total_files += 1

    print(f"\n  Done. {total_files} CSV files in knowledge/tables/")


if __name__ == "__main__":
    main()
