# Domain Research Note

> **Day-3 correction.** Where this note refers to five PSES subindicators (including
> a worked example using harassment/discrimination), the rebuilt project uses **four**
> reproducible indicators — *mobility & retention* is suppressed at the department ×
> equity-group breakdown and is omitted, not shown empty. The framework and
> responsible-use guidance below are unchanged. See `CLAUDE.md` and
> `web/src/data/meta.json`.

## Employment Equity Framework

Employment equity in the Canadian federal public service is a policy framework focused on improving fair representation and inclusion for four designated employment equity groups: Women, Indigenous Peoples, Persons with Disabilities, and Members of Visible Minorities.

This project uses employment equity representation data as a strategy and accountability tool. The key comparison is between actual representation in a department or agency and workforce availability, known as WFA. Workforce availability is the benchmark for the expected representation of each equity group in the relevant labour market.

A representation gap shows the difference between the actual number of employees from a designated group and the expected number based on WFA. A negative gap means that the actual number is below the benchmark. In this dashboard, negative gaps are treated as signals for further review, not as proof of discrimination or evidence of failure.

## Two Data Sources

This project now uses two complementary datasets:

**1. TBS Employment Equity Demographic Snapshots** — annual representation data published by Treasury Board. Shows *how many* employees from each designated group work in each department relative to the WFA benchmark. Covers 71 departments for 2024-25, 35 departments for 2023-24.

**2. PSES 2024 (Public Service Employee Survey)** — annual survey covering *how* employees from each designated group experience the workplace. Includes scores on engagement, diversity/inclusion, harassment, discrimination, and mobility/retention. Covers approximately 70 departments for 2024.

These two datasets address different questions:
- TBS data answers: "Is this group represented at benchmark?" (the *what*)
- PSES data answers: "How do members of this group experience the workplace?" (the *context*)

Together they help a policy lead understand not only where a gap exists, but whether the experience data suggests a retention, recruitment, or inclusion focus for the follow-up review.

## Important Limitations

**TBS data:**
- Some employment equity data depends on voluntary self-identification
- Persons with Disabilities are likely undercounted if employees do not self-identify
- Aggregate data cannot explain individual experiences
- Representation gaps do not identify causes on their own
- Service-wide WFA benchmarks are used; departmental WFA benchmarks would be more precise but require department-specific data not yet integrated

**PSES data:**
- PSES 2024 maps to the 2024-25 fiscal year only; no PSES 2023 data is available in this project
- Not all departments are surveyed (smaller agencies may be excluded or suppressed)
- PSES measures employee perception, not objective workplace conditions
- Suppressed cells (small N) are stored as blank — do not treat as zero

## Responsible Use

The dashboard separates data evidence from interpretation. It shows where gaps exist and where further review may be useful, but human decision-makers must interpret the results with policy context, qualitative evidence, and ethical caution.

PSES scores can inform which type of review to recommend — for example, a department with a large representation gap *and* a low harassment score for the same group may warrant a retention and inclusion review rather than purely a recruitment review. But PSES scores do not prove causation and must not be used to rank departments morally or assign blame.

Recommended review types (approved vocabulary): recruitment pipeline review, retention review, promotion pipeline review, accessibility review, workplace inclusion review.
