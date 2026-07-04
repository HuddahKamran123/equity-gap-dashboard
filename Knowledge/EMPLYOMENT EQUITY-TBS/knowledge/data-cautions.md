# Data Cautions — What the Agent Cannot Guess

These are the load-bearing lines. Delete any one of them and the dashboard ships a wrong or misleading number.

---

## Encoding & Structure

### 1. EEINFODV.csv encoding is latin-1, not UTF-8
Reading this file as UTF-8 will fail or corrupt accented characters (French department names, Métis, etc.).  
**Always open with `encoding='latin-1'`.**

### 2. LEVEL1ID aggregate code differs by survey year: "00" (2020/2024) vs "0" (2022)
The top-level org code for the public-service-wide aggregate row is `"00"` in the 2020 and 2024 files but unpadded `"0"` in the 2022 files — and 2022 department IDs are also unpadded (`"1"` vs `"01"`), so cross-year joins on LEVEL1ID silently fail without normalization. Including the aggregate in department-level comparisons will inflate counts and distort averages.  
**Zero-pad LEVEL1ID to 2 digits on load (`.str.zfill(2)`), then filter `LEVEL1ID != "00"`. `suppression_guard.load_eeinfodv()` does both (fixed 2026-07-02).**

### 3. ANSCOUNT suppression: cells below 10 respondents are suppressed
TBS suppresses cells where ANSCOUNT < 10 to protect respondent anonymity. These cells show blank or zero values that are not true zeros — they are missing by design.  
**Never interpret a zero score as "no problem." Check ANSCOUNT ≥ 10 before using any cell value.**

---

## Score Interpretation

### 4. POSITIVE/NEUTRAL/NEGATIVE are question-specific — direction is not universal
For most questions, POSITIVE = favourable (e.g., "agree I have the tools I need"). But for questions about harassment, discrimination, or barriers, a high POSITIVE score means the respondent *reported experiencing that problem* — that is bad, not good.  
**Always read TITLE_E to confirm the direction of the scale before labelling any score as favourable or unfavourable.**

### 5. SCORE5 and SCORE100 are means, not medians — outliers can distort them
For small ANSCOUNT cells, a few extreme responses move the mean significantly.  
**Report SCORE100 alongside ANSCOUNT; flag cells where ANSCOUNT < 30 as low-reliability.**

---

## Representation Data (BT1-28 Reports)

### 6. WFA benchmarks change every census cycle — do not mix years
Workforce Availability (WFA) figures are updated with each census (2016 → 2021). The 2022–23 report was the first to use the 2021 Census WFA. Comparing a 2021–22 representation rate against the 2021 WFA benchmark will show a false gap or surplus.

| Report years | WFA benchmark in effect |
|--------------|------------------------|
| BT1-28-2020 to BT1-28-2022 | 2016 Census WFA |
| BT1-28-2023 to BT1-28-2025 | 2021 Census WFA |

**Match each year's representation rate to the WFA that was in force that year.**

### 7. BT1-28 scope is Core Public Administration only — not all of federal government
The annual reports cover the CPA (~60 departments under FAA Schedule I and IV). Crown corporations, the RCMP, and the Canadian Armed Forces are excluded.  
**Always say "core public administration," never "federal government" or "Government of Canada."**

### 8. "Visible Minorities" was renamed to "Racialized persons" in the 2022–23 report onward
The underlying population is the same; only the label changed. Longitudinal trend lines will span both label periods.  
**Harmonize to "Racialized persons" across all years and note the label change in any display or narrative.**

---

## Subgroup-Specific Cautions

### 9. Two different code series cover disability subgroups — D112 vs. EEDV_0x
`D112 = 1` is the overall "Person with a disability" flag. The EEDV_01/02/03/08/11/12/15 codes are disability-type subgroups (seeing, hearing, speech, sensory/environmental, cognitive, learning, n.i.e.). These are separate rows in the data — do not sum them to get a total disability count, as one person can have multiple disability types and will appear in multiple subgroup rows.  
**For total disability headcount, use D112. Use EEDV_0x codes only for subgroup breakdown, never for totals.**

### 10. Indigenous subgroups (First Nations, Métis, Inuit) are severely suppressed at department level
Inuk (Inuit) rows exist as EEDV_17. First Nations and Métis rows have very limited coverage in EEINFODV due to small ANSCOUNT — most department-level cells will be suppressed.  
**For Indigenous subgroup breakdowns, rely on BT1-28 PDF tables rather than EEINFODV. Do not attempt to compute First Nations or Métis scores from the CSV at department level.**

### 11. Racialized subgroups (EEDV_19–27) use a different coding series than the main group (D114)
D114 = 1 (Racialized) is the EE Act designation. EEDV_19 (Black), EEDV_20 (East Asian), etc. are racial identity subgroups drawn from a different self-identification question. Do not filter on both simultaneously — they are from different survey items and will not produce a clean nested hierarchy.  
**Use D114 for EE Act reporting. Use EEDV_19–27 for racial subgroup experience analysis. Do not combine them in a single filter.**

### 12. 2SLGBTQIA+ and religion groups are not EE Act designated groups
D117 (2SLGBTQIA+) and D116 (religion) are in the PSES data but have no corresponding WFA benchmark from the EE Act framework. Representation gaps cannot be computed for them.  
**For these groups, only experience scores (SCORE100, POSITIVE/NEGATIVE) are valid outputs — never represent-vs-WFA comparisons.**

### 13. Ethnocultural origin (D115) and racial identity (EEDV_19–27) are not the same dimension
D115 records geographic/cultural origin (e.g., "Eastern Africa," "Southern Asia"). EEDV_19–27 records racial identity (e.g., "Black," "South Asian"). A person born in Eastern Africa may identify as Black — but these are distinct variables and will produce different row sets.  
**Do not conflate geographic origin with racial identity in any label or chart.**

---

## Self-Identification & Representativeness

### 14. Self-identification is voluntary — under-reporting affects all designated groups
Employees who did not self-identify are excluded from demographic breakdowns. Under-reporting is especially significant for Indigenous peoples, persons with disabilities, and 2SLGBTQIA+ employees — groups with historically higher stigma around disclosure.  
**State self-identification limitations in any narrative. Gaps in experience data may reflect under-reporting, not absence of the group.**

### 15. Column names differ between PSES years — harmonize before joining
The 2024 file (`EEINFODV.csv`) uses `POSITIVE`, `NEUTRAL`, `NEGATIVE`. The 2020 and 2022 files use `MOST_POSITIVE_OR_LEAST_NEGATIVE`, `NEUTRAL_OR_MIDDLE_CATEGORY`, `MOST_NEGATIVE_OR_LEAST_POSITIVE`. The 2022 files also use lowercase `descrip_E` instead of `DESCRIP_E`. Joining without harmonizing will produce null columns or silent mismatches.  
**Rename columns on load before any cross-year join. See `knowledge/survey-data/README.md` for the full mapping.**

### 16. The 2022 PSES is split across two files — both required for full department coverage
`EEINFODV_2022_dept0-35.csv.csv` covers departments 0–35; `EEINFODV_2022_dept36-95.csv.csv` covers 36–95. Neither file alone is complete.  
**Concatenate both 2022 files before any department-level 2022 analysis.**

### 17. Not all PSES questions appear in all years — verify before trending
The survey questionnaire changes between cycles. A question ID in 2024 may not exist in 2020, or may have different wording. Trending a question across years without verifying comparability will produce a misleading line.  
**Check that the question ID and TITLE_E wording match across years before computing any trend. Use the question concordance table in the 2024 PSES Supporting Documentation xlsx.**

### 18. 2020 and 2022 files have a `.csv.csv` double extension — use exact filenames
The files were saved with a double extension. Reference them as `EEINFODV_2020.csv.csv` and `EEINFODV_2022_dept0-35.csv.csv` etc. — do not assume `.csv` alone will resolve.
