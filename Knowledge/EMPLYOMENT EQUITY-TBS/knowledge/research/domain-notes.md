# Domain Notes — Employment Equity in the Canadian Federal Public Service

*Distilled claims to verify against primary sources — not a dump. Treat as orientation, not authority.*

---

## The Legal and Policy Framework

The **Employment Equity Act (1995)** requires federally regulated employers (including the CPA) to achieve representation of four designated groups proportional to their availability in the Canadian workforce. TBS publishes an annual report to Parliament on progress.

The Act does not set numeric quotas — it requires employers to identify and remove systemic barriers and implement positive policies and practices.

**Key implication for the dashboard:** Representation rates below WFA are a legal accountability signal, not just a diversity metric. Decision-makers care about closing specific gaps, not improving averages.

---

## The Four EE Act Designated Groups and Their Subgroups

### 1. Women
- Reported as one group in BT1-28 reports; no subgroups.
- In EEINFODV: `D111A = 1`. Comparators: Man (`D111B = 1`), Another gender (`D111C = 1`).
- Key watch area: women in executive roles (EX-04/EX-05) and STEM occupational groups where representation still lags.

### 2. Indigenous Peoples
**Subgroups (BT1-28 reports):** First Nations, Métis, Inuit (Inuk)  
**Subgroups (EEINFODV):** Combined Indigenous (`D113 = 1`); Inuk/Inuit (`EEDV_17 = 1`); First Nations and Métis suppressed at most department levels due to small cell sizes.

- Indigenous employees consistently report the lowest scores on psychological safety, belonging, and career development in PSES data — the gap persists even in departments where representation has reached or exceeded WFA.
- The 2024–25 BT1-28 report reflects reconciliation commitments; representation at the executive level remains a key gap.
- **Caution:** Self-identification rates for Indigenous employees are lower than actual prevalence — reported representation figures likely understate the true count.

### 3. Persons with Disabilities
**Subgroups (BT1-28 reports):** Physical, sensory, cognitive, mental health (categories vary by year)  
**Subgroups (EEINFODV):**
| Code | Disability Type |
|------|----------------|
| EEDV_01 | Seeing |
| EEDV_02 | Hearing |
| EEDV_03 | Speech or communication |
| EEDV_08 | Sensory or environmental |
| EEDV_11 | Cognitive |
| EEDV_12 | Learning |
| EEDV_15 | Not identified elsewhere (n.i.e.) |
| D112 | All disabilities combined (use for totals) |

- Persons with disabilities are the one designated group where representation has consistently fallen *below* WFA across all years in the BT1-28 series. This makes them the highest-priority group for gap analysis.
- Disability self-identification has the highest non-disclosure rate of any designated group — actual prevalence is substantially higher than reported.
- Different disability types carry very different workplace experience profiles: cognitive and mental health disabilities tend to produce worse harassment and belonging scores than physical disabilities.
- **Do not sum EEDV_01–EEDV_15 for totals** — one person can hold multiple disability codes. Use D112 for headcounts.

### 4. Racialized Persons (formerly Visible Minorities)
**Label change:** "Visible Minorities" → "Racialized persons" starting in the 2022–23 BT1-28 report. Same population, new term.

**Subgroups (BT1-28 reports):** Black, South Asian, Chinese, Filipino, Arab, Latin American, Southeast Asian, Korean, Japanese, West Asian, Multiple visible minorities, Other  
**Subgroups (EEINFODV):**
| Code | Group |
|------|-------|
| EEDV_19 | Black |
| EEDV_20 | East Asian |
| EEDV_21 | Southeast Asian |
| EEDV_23 | Arab |
| EEDV_24 | South Asian |
| EEDV_25 | West Asian |
| EEDV_26 | White (comparator) |
| EEDV_27 | Another racial group |
| D114 | All racialized persons combined (use for EE Act totals) |

- Black employees consistently report significantly worse experiences on harassment, discrimination, and career advancement than other racialized subgroups — do not aggregate away this signal.
- The Black Executives Initiative and Anti-Racism Strategy are active TBS programs targeting this group specifically.
- **Do not combine D114 and EEDV_19–27 in a single filter** — they come from different survey questions.

---

## Groups Beyond the EE Act (in EEINFODV Only)

These groups have PSES experience data but **no WFA benchmark** — representation-vs.-availability comparisons are not valid for them. The dashboard shows experience scores for these groups alongside the full representation + experience picture for the four EE Act designated groups and their subgroups.

### 2SLGBTQIA+ (D117)
**Subgroups:** Lesbian, Gay, Bisexual, Asexual, Pansexual, Heterosexual (comparator), Another sexual orientation (D117A); Two-Spirit, Transgender, Queer, Questioning, Intersex, Another identity (D117B).

- 2SLGBTQIA+ employees, particularly Transgender and Two-Spirit employees, show among the widest gaps on psychological safety and harassment in PSES research.
- Two-Spirit is coded separately from other gender identity subgroups and intersects with Indigenous identity — treat with care.
- **Only experience scores are valid outputs for this group — no WFA comparison.**

### Religion / Belief System (D116)
**Groups:** Buddhism, Christianity, Hinduism, Indigenous spiritual tradition, Islam, Judaism, Sikhism, Secular, Another.

- Muslim and Jewish employees have shown elevated harassment scores in recent PSES cycles — verify against 2024 data.
- **Only experience scores are valid — no WFA comparison.**

### Ethnocultural / Geographic Origin (D115)
25 regional groups across Africa, Asia, Americas, Europe, and Oceania, plus multi-origin.

- This dimension intersects with but is not identical to racialized identity (EEDV_19–27). A person from Eastern Africa may identify as Black; these are different variables and produce different row sets.
- **Only experience scores are valid — no WFA comparison.**

---

## Why the Two Data Sources Together Matter

Representation data (BT1-28) shows *who is in the workforce*.  
PSES data (EEINFODV) shows *how those people experience it*.

A department can meet its WFA target on paper while employees from that group report the worst harassment and belonging scores in the public service. The dashboard's value is making that disconnect visible — and surfacing which specific subgroups and which departments are driving it.

---

## TBS's Five Priority Areas (as of 2023–24 report)

The dashboard should surface metrics tied to these TBS-declared priorities:
1. Data collection and self-identification rates
2. Representation at the executive level (EX group) — all four designated groups
3. Racialized persons and anti-racism, with a specific focus on Black employees
4. Indigenous peoples and reconciliation commitments, with subgroup visibility for First Nations, Métis, and Inuit
5. Persons with disabilities and the Accessibility Act implementation

---

## Who Uses This Dashboard and What They Decide

**Primary user: TBS Chief Human Resources Officer (and EE policy team)**
- Zoom level: all departments simultaneously
- Decision: which departments need system-wide intervention, and for which designated group or subgroup?
- Authority: directs EE resources across the CPA, sets targets, signs the annual report to Parliament
- Key questions:
  1. *Which departments are below WFA, and for which subgroup specifically?*
  2. *Is that gap closing year over year (2020–2025), or widening?*
  3. *Where is representation acceptable on paper but experience scores signal a systemic problem?*
  4. *Which combination of department + subgroup should be the next intervention priority?*

**Secondary user: Deputy Minister (and departmental EE coordinator)**
- Zoom level: their own department only
- Decision: where should this year's EE action plan focus — headcount, inclusion, or both?
- Authority: directs HR programs and investments within the department
- Key questions:
  1. *Which of our designated groups or subgroups is farthest below WFA?*
  2. *Are we making year-over-year progress, or losing ground?*
  3. *Are our represented employees actually included — or are experience scores masking a problem?*

The dashboard earns its place only if it changes which subgroups and departments get attention, and what action is taken. Aggregating everything into a single "diversity score" would destroy the signal the CHRO and DMs need to act.

---

## Known Data Limitations (verify before asserting)

- Self-identification is voluntary; under-reporting is highest for Indigenous peoples, persons with disabilities, and 2SLGBTQIA+ employees.
- PSES is a point-in-time survey (2024 only in EEINFODV); multi-year experience trends require prior-cycle files not in this folder.
- WFA benchmarks reflect labour market availability, not the talent pool actually applying to federal jobs.
- First Nations and Métis subgroup experience data is largely suppressed in EEINFODV at the department level — rely on BT1-28 for their representation figures.
- The BT1-28 WFA benchmark changed between the 2022 and 2023 reports (2016 → 2021 Census); cross-year representation comparisons must account for this shift.
