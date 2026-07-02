# What Claude Cannot Guess

## Representation Gap Rules

1. Workforce availability, or WFA, is the only valid benchmark for comparing actual representation against expected representation. Do not substitute public service averages or any other denominator.

2. Representation gaps must not be interpreted as proof of discrimination. They are policy accountability signals that require human review.

3. A negative gap means the actual number of employees in a designated group is below the expected number based on WFA.

4. The dashboard user is an EDI policy lead or HR executive deciding where to focus further review.

5. The dashboard must stay aggregate-level. It must not infer identity, evaluate individuals, or recommend individual hiring or firing decisions.

6. The core decision is prioritization: which departments and equity groups should be reviewed first?

7. The dashboard separates data evidence, dashboard signal, and possible policy response. These three things are not the same.

8. Recommended policy responses must use only the approved vocabulary: recruitment review, retention review, promotion pipeline review, accessibility review, or workplace inclusion review.

9. The dashboard must not use sensitive group data to rank departments morally, assign blame, or make causal claims.

10. Every % shown must include the raw N it was computed from — e.g. "4.1% (N=312 of 7,612)". Percentages without counts are unverifiable.

11. WFA must always appear beside rep% — the two must never be shown separately.

## PSES Score Rules

12. PSES scores (pses_engagement, pses_diversity_inclusion, pses_harassment, pses_discrimination) are employee experience signals — they measure how employees in a designated group *experience* the workplace, not how many of them there are. **(Day-3 correction: four indicators, not five — mobility/retention is suppressed at the department × equity-group breakdown and is omitted, not shown empty. See `CLAUDE.md` and `web/src/data/meta.json`.)**

13. PSES 2024 data maps to 2024-25 fiscal year rows only. Never apply PSES 2024 scores to 2023-24 rows.

14. A blank PSES score means the department was either not surveyed in PSES or the result was suppressed due to small N. Treat as missing, not zero.

15. PSES scores must not be combined with representation % in a formula or used as a single composite rank.

16. A low PSES harassment or discrimination score for a designated group alongside a large representation gap can *inform* which type of review to recommend (e.g. retention vs. recruitment), but it does not prove a causal relationship.

## Capability Form Rules

17. trend-interpreter is Subagent + Skill: the subagent reasons about whether a gap change is genuine or benchmark-driven; the skill enforces the approved classification vocabulary and output template. A fixed formula cannot distinguish these cases.

18. presentation-summary-render is a Subagent: the 5-block structure is fixed, but choosing what to say within each block for a specific department–group combination requires contextual judgment.

19. edi-data-guard and interpretation-guardrails are Skills: they must produce consistent, templated output on every run — no judgment, just enforcement.

20. question-router is a Subagent: it must reason about whether a question is answerable, causal, or out of scope — this cannot be reduced to a fixed rule.

## Year-over-Year Rules

21. A narrowing gap is not always genuine improvement. If the WFA benchmark fell, the gap may narrow even with no change in representation.

22. Trend lines must only be drawn for departments present in both fiscal years (35 departments have 2023-24 data).

23. Two data points (2023-24, 2024-25) require cautious interpretation. Do not extrapolate a trend from two years.
