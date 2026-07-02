---
name: interpretation-guardrails
description: >
  Enforces cautious, policy-safe language when explaining employment equity gap data.
  Use this skill whenever a representation gap, severity rating, or department signal
  needs to be put into words — in a dashboard tooltip, a report paragraph, or a
  stakeholder answer. The skill checks for five violations: causal claims, blame
  language, missing WFA benchmark, out-of-scope action recommendations, and missing
  Persons with Disabilities self-identification caveat. It produces approved signal
  text using fixed templates keyed to severity level and equity group.
---

# Skill: interpretation-guardrails

## Purpose
Enforce cautious, policy-safe language when explaining employment equity gap data. This skill is invoked whenever a representation gap, severity rating, or department signal needs to be put into words — in a dashboard tooltip, a report paragraph, or an answer to a stakeholder question.

## When to use this skill
- Generating the plain-language signal for a department–group gap
- Writing a recommendation sentence for a priority-flagged department
- Explaining what a severity level (Slight / Moderate / Substantial / Severe) means for a specific department
- Drafting any narrative that references a gap number, a benchmark, or a trend

## Output contract

Every output produced under this skill must pass all five checks before being returned:

### Check 1 — No causal claim
The output must NOT contain language that assigns a cause to the gap. Banned phrases include:
- "caused by", "due to", "because of", "as a result of", "explains why", "proves that", "indicates discrimination", "shows bias"

If a draft contains any of these, rephrase to describe the gap as an *observed pattern* rather than an explained outcome.

### Check 2 — No blame or moral judgment
The output must NOT rank, shame, or morally evaluate a department or its leadership. Banned patterns include:
- "failing", "worst", "disgraceful", "alarming", "shocking", "unacceptable", "guilty", "negligent"
- Comparative rankings that imply moral inferiority ("bottom of the list")

Use severity labels only as descriptors of distance from benchmark, not as verdicts.

### Check 3 — Benchmark always named
Every gap statement must name the benchmark it is measured against. The WFA (Workforce Availability) percentage must appear alongside the representation percentage. A gap number alone is not sufficient.

❌ "ESDC is below target for Persons with Disabilities."
✅ "ESDC's representation of Persons with Disabilities is 8.5%, below the 12.0% workforce availability benchmark — a gap of −1,359 employees."

### Check 4 — Action language is bounded
Recommendations must use only the approved vocabulary:
- recruitment pipeline review
- retention review
- promotion pipeline review
- accessibility review
- workplace inclusion review

The skill must NOT recommend specific hiring decisions, specific individuals for review, or automated staffing actions. The phrase "a human EDI policy lead should review" or equivalent must appear in any paragraph that includes a recommendation.

### Check 5 — Self-identification caveat for Persons with Disabilities
Any output that discusses Persons with Disabilities representation must include a note that self-identification is voluntary and this group is likely undercounted in official figures.

## Approved signal templates

Use these templates as the starting point for gap signals. Fill in `[DEPT]`, `[GROUP]`, `[REP_PCT]`, `[WFA_PCT]`, `[GAP_N]`, `[SEVERITY]`, `[REVIEW_TYPE]`.

**Slight gap (< 2pp below WFA):**
> [DEPT]'s representation of [GROUP] is [REP_PCT]%, slightly below the [WFA_PCT]% workforce availability benchmark (gap: [GAP_N] employees). No immediate action required; monitor [REVIEW_TYPE] at next review cycle.

**Moderate gap (2–4.9pp below WFA):**
> [DEPT]'s representation of [GROUP] is [REP_PCT]%, [GAP_PP]pp below the [WFA_PCT]% workforce availability benchmark (gap: [GAP_N] employees). Recommended focus for human review: [REVIEW_TYPE].

**Substantial gap (5–9.9pp below WFA):**
> [DEPT]'s representation of [GROUP] is [REP_PCT]%, substantially below the [WFA_PCT]% workforce availability benchmark (gap: [GAP_N] employees). An EDI policy lead should review [REVIEW_TYPE] as a priority action.

**Severe gap (≥ 10pp below WFA):**
> [DEPT]'s representation of [GROUP] is [REP_PCT]%, severely below the [WFA_PCT]% workforce availability benchmark (gap: [GAP_N] employees). This pattern warrants urgent attention from an EDI policy lead; recommended focus: [REVIEW_TYPE]. This signal does not constitute a finding of discrimination or policy failure — it is a prompt for human review.

**At or above WFA:**
> [DEPT]'s representation of [GROUP] is [REP_PCT]%, at or above the [WFA_PCT]% workforce availability benchmark. No gap signal. For Persons with Disabilities: note that self-identification is voluntary and actual representation may differ from reported figures.

## What this skill never produces
- A statement that a department "discriminates against" any group
- A recommendation to hire, promote, or dismiss a specific individual
- A composite score that averages across equity groups
- A ranking that implies one department is morally worse than another
- Any claim that a narrowing gap proves a policy succeeded (the benchmark may also have shifted)

## Responsible-use footer
Every output longer than one sentence must end with:
> *This signal is for EDI policy review only. A human decision-maker must review before any action is taken.*
