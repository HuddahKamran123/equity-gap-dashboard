---
name: presentation-summary-render
description: >
  Produces a concise, repeatable five-block summary from employment equity gap data
  for use in a slide, briefing, or class deliverable. Use this skill when the user
  asks to export a finding, create a summary slide, or draft a one-page briefing.
  The five blocks are always in the same order: Key Finding, Evidence, Caveat,
  Human Review Required, and Next Action. Output is capped at 300 words and always
  ends with the TBS data attribution line. Never produces causal claims, composite
  scores, or staffing recommendations.
---

# Capability: presentation-summary-render (Subagent)

## Purpose
Produce a concise, repeatable summary for an executive briefing, slide deck, or class deliverable. The output synthesizes the most important gap finding for a specific department–group combination into a fixed five-block structure a stakeholder can act on.

## Form: Subagent

**Why subagent?** The structure is fixed (5 blocks, ≤300 words, TBS attribution), but choosing what to say within each block requires contextual reasoning: which finding is most important, what the trend means for this specific department, and what a concrete next action looks like given the severity and group. A skill can enforce the format; only a subagent can make those judgment calls for each unique combination.

## When to invoke
- Exporting a dashboard finding for a slide or PDF
- Drafting a one-page briefing for an EDI policy lead or HR executive
- Creating a "top findings" section in a report
- Preparing a class deliverable showing system output in plain language

## Required inputs
```
department_agency:    [string]
equity_group:         [string — one of the four designated groups]
fiscal_year:          [string, e.g. "2024-2025"]
rep_pct:              [float]
wfa_pct:              [float]
gap:                  [int, negative = below benchmark]
all_employees:        [int]
designated_members:   [int]
severity:             [slight | moderate | substantial | severe]
rank:                 [int — rank by gap size among all departments]
n_depts:              [int — total departments assessed]
has_trend:            [bool]
prior_gap:            [int, optional — required if has_trend is true]
prior_year:           [string, optional]
```

## Output format — five required blocks (enforced; do not reorder or combine)

### Block 1 — KEY FINDING
One sentence. States the department, group, rep%, gap in pp, WFA benchmark, and gap in employee headcount. No causal claim.

> **Key finding:** [DEPT] — [GROUP] representation is [REP_PCT]%, [GAP_PP]pp below the [WFA_PCT]% workforce availability benchmark (gap: [GAP_N] employees as of [FISCAL_YEAR]).

### Block 2 — EVIDENCE
2–4 sentences. Source, scope, rank, trend (if available).

> **Evidence:** Data are from the Treasury Board of Canada Secretariat Employment Equity Demographic Snapshot, [FISCAL_YEAR]. [N_DEPTS] departments were assessed. [DEPT] ranks [RANK] of [N_DEPTS] for [GROUP] gap size (largest negative gap = rank 1). [TREND_SENTENCE]

Trend sentence:
- Gap widened: "The gap has widened by [DELTA] employees since [PRIOR_YEAR]."
- Gap narrowed: "The gap has narrowed by [DELTA] employees since [PRIOR_YEAR]."
- No data: "No prior-year data is available for trend comparison."

### Block 3 — CAVEAT
1–2 sentences. What the data cannot tell the reader. Add PwD sentence if group is Persons with Disabilities.

> **Caveat:** This gap reflects representation relative to the service-wide workforce availability benchmark. It does not establish a cause, indicate policy failure, or implicate any individual. [PwD: "Self-identification is voluntary; Persons with Disabilities counts are likely undercounted, meaning the actual gap may be larger than reported."]

### Block 4 — HUMAN REVIEW REQUIRED
One sentence. Approved review types: recruitment pipeline · retention · promotion pipeline · accessibility · workplace inclusion.

> **Human review required:** An EDI policy lead or HR executive must review this signal before any action is taken. Recommended focus: [REVIEW_TYPE].

### Block 5 — NEXT ACTION
One bounded, time-specific investigative action. Not a hiring decision.

> **Next action:** [Specific, time-bound investigative step.]

## Multi-finding summaries
Repeat Blocks 1–2 for each finding (max 4), then single combined Blocks 3–5.

## What this capability never produces
- Composite score across equity groups
- Moral ranking of departments
- Hiring, firing, or staffing recommendation
- Statement that a gap proves discrimination or policy failure
- Summary longer than 300 words

## Mandatory closing line
> *Dashboard data: TBS Employment Equity Demographic Snapshots. For EDI policy review purposes only. All signals require human review before action.*
