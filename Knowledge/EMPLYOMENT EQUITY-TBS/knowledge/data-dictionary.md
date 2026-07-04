# Data Dictionary — Employment Equity Dashboard

## EEINFODV.csv — PSES Microdata Column Reference

| Column | Type | Description |
|--------|------|-------------|
| `LEVEL1ID` | string | Top-level org code. `"00"` = entire Public Service aggregate — **exclude from department-level analysis** |
| `LEVEL2ID–LEVEL5ID` | int | Hierarchical sub-org codes; deeper levels = branch/division |
| `SURVEYR` | int | Survey year (e.g., 2024) |
| `BYCOND` | string | Demographic filter expression (e.g., `D111A = 1` = Woman) — see full table below |
| `DESCRIP_E` | string | Demographic group label in English — see full table below |
| `DESCRIP_F` | string | Same label in French |
| `DEMCODE` | int | Numeric code for the demographic group |
| `QUESTION` | string | Survey question ID (e.g., `Q01`, `Q55`) |
| `TITLE_E` | string | Full question text in English — **always read this before interpreting POSITIVE/NEGATIVE** |
| `TITLE_F` | string | Full question text in French |
| `ANSWER1–ANSWER7` | int (%) | % of respondents selecting each response option (1 = strongly disagree → 5 = strongly agree for most questions; some scales differ) |
| `POSITIVE` | int (%) | Pre-computed favourable response grouping — **direction is question-specific, not always "agree = good"** |
| `NEUTRAL` | int (%) | Pre-computed neutral response grouping |
| `NEGATIVE` | int (%) | Pre-computed unfavourable response grouping |
| `AGREE` | int (%) | Agreement rate (subset of questions only) |
| `SCORE5` | float | Mean score on a 5-point scale |
| `SCORE100` | float | Mean score converted to 100-point scale |
| `ANSCOUNT` | int | Number of respondents. **Cells below 10 are suppressed — a zero or blank is NOT a true zero** |
| `DEPT_E` | string | Department / organization name in English |
| `DEPT_F` | string | Department / organization name in French |
| `INDICATORID` | int | Numeric ID for the thematic indicator |
| `INDICATORENG` | string | Thematic indicator in English (e.g., Workplace, Leadership, Wellbeing, Compensation) |
| `INDICATORFRA` | string | Thematic indicator in French |
| `SUBINDICATORID` | int | Numeric ID for the sub-theme |
| `SUBINDICATORENG` | string | Sub-theme label in English (e.g., "Physical environment and equipment", "Harassment and discrimination") |
| `SUBINDICATORFRA` | string | Sub-theme label in French |

---

## Demographic Groups & Subgroups — Full BYCOND Reference

The PSES data covers far more than the four EE Act designated groups. Every row is filtered by one BYCOND condition. The full set, organized by category:

### Gender (D111)
| BYCOND | DESCRIP_E | DEMCODE |
|--------|-----------|---------|
| D111A = 1 | Woman | 1937 |
| D111A = 2 | Not woman | 1938 |
| D111B = 1 | Man | 1939 |
| D111B = 2 | Not man | 1940 |
| D111C = 1 | Another gender | 1941 |
| D111C = 2 | Not another gender | 1942 |

### Persons with Disabilities (D112 + EEDV subgroups)
| BYCOND | DESCRIP_E | DEMCODE |
|--------|-----------|---------|
| D112 = 1 | Person with a disability | 1943 |
| D112 = 2 | Person without a disability | 1944 |
| EEDV_01 = 1 | Person with a **seeing** disability | 8479 |
| EEDV_02 = 1 | Person with a **hearing** disability | 8481 |
| EEDV_03 = 1 | Person with a **speech or communication** disability | 8483 |
| EEDV_08 = 1 | Person with a **sensory or environmental** disability | — |
| EEDV_11 = 1 | Person with a **cognitive** disability | — |
| EEDV_12 = 1 | Person with a **learning** disability | — |
| EEDV_15 = 1 | Person with a disability **n.i.e.** (not identified elsewhere) | — |

### Indigenous Peoples (D113 + EEDV subgroups)
| BYCOND | DESCRIP_E | DEMCODE |
|--------|-----------|---------|
| D113 = 1 | Indigenous | 1990 |
| D113 = 2 | Non-Indigenous | 1991 |
| EEDV_17 = 1 | Inuk (Inuit) | — |
| EEDV_90 = 1 | Indigenous (EE variant) | — |

> **Note:** First Nations and Métis subgroups appear in the BT1-28 annual reports but have limited standalone rows in EEINFODV due to suppression — ANSCOUNT thresholds make subgroup cells scarce at department level.

### Racialized Persons / Visible Minorities (D114 + EEDV subgroups)
| BYCOND | DESCRIP_E | DEMCODE |
|--------|-----------|---------|
| D114 = 1 | Racialized | 2001 |
| D114 = 2 | Non-racialized | 2002 |
| EEDV_19 = 1 | **Black** | — |
| EEDV_20 = 1 | **East Asian** | — |
| EEDV_21 = 1 | **Southeast Asian** | — |
| EEDV_23 = 1 | **Arab** | — |
| EEDV_24 = 1 | **South Asian** | — |
| EEDV_25 = 1 | **West Asian** | — |
| EEDV_26 = 1 | White | — |
| EEDV_27 = 1 | Another racial group | — |

### Ethnocultural / Geographic Origin (D115)
| BYCOND | DESCRIP_E |
|--------|-----------|
| D115 = 1 | Southern Africa |
| D115 = 2 | Western Africa |
| D115 = 3 | Northern Africa |
| D115 = 4 | Eastern Africa |
| D115 = 5 | Central Africa |
| D115 = 6 | Africa - Not otherwise specified |
| D115 = 7 | Southern Asia |
| D115 = 8 | Western Asia and the Middle East |
| D115 = 9 | Eastern Asia |
| D115 = 10 | South-eastern Asia |
| D115 = 11 | Central Asia |
| D115 = 12 | Asia - Not otherwise specified |
| D115 = 13 | Southern Europe |
| D115 = 14 | Western Europe |
| D115 = 15 | Northern Europe |
| D115 = 16 | Eastern Europe |
| D115 = 17 | Europe - Not otherwise specified |
| D115 = 18 | South America |
| D115 = 19 | North America |
| D115 = 20 | Central America |
| D115 = 21 | Caribbean |
| D115 = 23 | North America - Not otherwise specified |
| D115 = 24 | Oceania |
| D115 = 25 | Oceania - Not otherwise specified |
| D115 = 32 | Another Ethnic or Cultural Origin |
| D115 = 34–37 | Two or more Ethnic or Cultural Origins |

### Religion / Belief System (D116)
| BYCOND | DESCRIP_E |
|--------|-----------|
| D116A = 1 | Buddhism |
| D116B = 1 | Christianity |
| D116C = 1 | Hinduism |
| D116D = 1 | Indigenous spiritual tradition |
| D116E = 1 | Islam |
| D116F = 1 | Judaism |
| D116G = 1 | Sikhism |
| D116H = 1 | Secular belief system |
| D116I = 1 | Another religion or belief system |

### Sexual Orientation (D117A)
| BYCOND | DESCRIP_E |
|--------|-----------|
| D117 = 1 | 2SLGBTQIA+ (combined) |
| D117A_1 = 1 | Lesbian |
| D117A_2 = 1 | Gay |
| D117A_3 = 1 | Bisexual |
| D117A_4 = 1 | Asexual |
| D117A_5 = 1 | Pansexual |
| D117A_6 = 1 | Heterosexual |
| D117A_7 = 1 | Another sexual orientation |

### Gender Identity (D117B)
| BYCOND | DESCRIP_E |
|--------|-----------|
| D117B_1 = 1 | Two-Spirit |
| D117B_2 = 1 | Transgender |
| D117B_3 = 1 | Queer |
| D117B_4 = 1 | Questioning |
| D117B_5 = 1 | Intersex |
| D117B_6 = 1 | Another identity |

### Organizational Level (EEDV)
| BYCOND | DESCRIP_E |
|--------|-----------|
| EEDV_92 = 1 | Executives |
| EEDV_92 = 2 | Non-Executives |
| EEDV_99 = 1 | Executives Anglophone |
| EEDV_99 = 2 | Executives Francophone |

---

## Important: EE Act Groups vs. Extended PSES Groups

| Category | WFA Benchmarking? | Experience Data (EEINFODV)? | Subgroup WFA? |
|----------|--------------------|------------------------------|---------------|
| Women | ✅ Yes (BT1-28) | ✅ D111A | — (no subgroups) |
| Indigenous Peoples | ✅ Yes (BT1-28) | ✅ D113, EEDV_17, EEDV_90 | ✅ First Nations, Métis, Inuit |
| Persons with Disabilities | ✅ Yes (BT1-28) | ✅ D112, EEDV_01/02/03/08/11/12/15 | ✅ Physical, sensory, cognitive, mental health |
| Racialized persons | ✅ Yes (BT1-28) | ✅ D114, EEDV_19–27 | ✅ Black, South Asian, Chinese, Filipino, Arab, Latin American, Southeast Asian, Korean, Japanese, West Asian, Other |
| 2SLGBTQIA+ | ❌ No WFA benchmark | ✅ D117, D117A/B | ❌ |
| Religion | ❌ No WFA benchmark | ✅ D116 | ❌ |
| Ethnocultural origin | ❌ No WFA benchmark | ✅ D115 | ❌ |
| Gender (Man / Another gender) | ❌ No WFA benchmark | ✅ D111B/C | ❌ |

The dashboard surfaces **both representation (WFA) and experience data**:
- For the **four EE Act designated groups and their subgroups**: full picture — representation rate, WFA benchmark, gap trend (2020–2025), plus experience scores by department.
- For **all other groups** (2SLGBTQIA+, religion, ethnocultural origin, gender identity): experience scores only — no WFA comparison is possible or appropriate.

---

## BT1-28 Annual Reports — Key Metrics Reference

| Metric | Description |
|--------|-------------|
| Representation rate (%) | Share of designated group in total CPA workforce |
| Workforce Availability (WFA) | Benchmark from the most recent census — the share of that group in the available labour market |
| Gap to WFA | Representation rate minus WFA; positive = over-represented, negative = under-represented |
| Executive representation | EX group (EX-01 to EX-05) breakdown by designated group |
| New hires | Share of designated group among employees hired that fiscal year |
| Promotions | Share of designated group among employees promoted that fiscal year |
| Separations | Share of designated group among employees who left that fiscal year |

**Designated group subgroups in BT1-28 reports:**

| Designated Group | Subgroups reported |
|------------------|--------------------|
| Women | No subgroups (reported as one group) |
| Indigenous Peoples | First Nations, Métis, Inuit (Inuk) |
| Persons with Disabilities | Physical, sensory, cognitive, mental health (varies by report year) |
| Racialized persons | Black, South Asian, Chinese, Filipino, Arab, Latin American, Southeast Asian, Korean, Japanese, West Asian, Multiple visible minorities, Other |

**Scope:** Core Public Administration only (~60 departments under FAA Schedule I and IV). Excludes Crown corporations, RCMP, Canadian Armed Forces.
