# survey-data/ — Dataset + Codebook

## PSES EEINFODV Files — All Years (located in parent folder — connect as live source, do not paste)

| File | Year | Rows | Notes |
|------|------|------|-------|
| `../EEINFODV.csv` | 2024 | ~1.6M | Primary file, latin-1 encoded |
| `../EEINFODV_2022_dept0-35.csv.csv` | 2022 | ~890K | Departments 0–35; must be combined with file below |
| `../EEINFODV_2022_dept36-95.csv.csv` | 2022 | ~830K | Departments 36–95; combine with file above for full 2022 |
| `../EEINFODV_2020.csv.csv` | 2020 | ~894K | Contains SURVEYR = 2020 only |
| `../2024 PSES Supporting Documentation-Documents de référence du SAFF 2024.xlsx` | — | — | Codebook — question metadata, scale anchors, indicator groupings |

**Note on filenames:** The 2020 and 2022 files have a `.csv.csv` double extension — this is how they were saved. Reference them with that exact filename.

---

## Critical: Column Name Differences Between Years

The 2024 file uses shorter column names than 2020/2022. **Always harmonize before joining years.**

| Concept | 2024 column name | 2020 & 2022 column name |
|---------|-----------------|------------------------|
| Favourable responses | `POSITIVE` | `MOST_POSITIVE_OR_LEAST_NEGATIVE` |
| Neutral responses | `NEUTRAL` | `NEUTRAL_OR_MIDDLE_CATEGORY` |
| Unfavourable responses | `NEGATIVE` | `MOST_NEGATIVE_OR_LEAST_POSITIVE` |
| Group label | `DESCRIP_E` | `descrip_E` (lowercase in 2022) |

All other columns (`LEVEL1ID`, `SURVEYR`, `BYCOND`, `DEMCODE`, `QUESTION`, `SCORE5`, `SCORE100`, `ANSCOUNT`, `DEPT_E`, `INDICATORENG`, `SUBINDICATORENG`, etc.) are consistent across years.

**Recommended harmonization:** When loading, rename `MOST_POSITIVE_OR_LEAST_NEGATIVE` → `POSITIVE`, `NEUTRAL_OR_MIDDLE_CATEGORY` → `NEUTRAL`, `MOST_NEGATIVE_OR_LEAST_POSITIVE` → `NEGATIVE`, and normalize `descrip_E` → `DESCRIP_E` before any cross-year joins.

---

## How to read the files

- Encoding: **latin-1** for all years (not UTF-8)
- Delimiter: comma; 2022 files have quoted fields
- Header row: yes (row 1)
- Always filter `LEVEL1ID != "00"` before department-level comparisons
- Check `ANSCOUNT >= 10` before using any cell value — suppressed cells are not true zeros
- To get a complete 2022 dataset: load both 2022 files and concatenate (same columns, different department ranges)

---

## Question comparability across years

Not all questions were asked in all years — the PSES questionnaire changes between cycles. Before computing a multi-year trend on any question, verify the question appears in all target years using the `QUESTION` ID and confirm `TITLE_E` wording is consistent. The 2024 PSES Supporting Documentation xlsx has a question concordance table showing which questions map across cycles.

**Safe for multi-year trending:** SCORE100, POSITIVE, ANSCOUNT on questions that appear in all three years with identical or near-identical wording. **Verify each question before plotting a trend.**
