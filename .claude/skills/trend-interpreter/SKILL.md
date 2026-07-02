---
name: trend-interpreter
description: >
  Interprets year-over-year changes in a department's employment equity representation
  gap. Use this skill when a user asks whether a gap is improving or worsening, or
  when a trend chart needs a plain-language caption. The subagent applies judgment to
  distinguish genuine representation improvement from benchmark shifts; the skill
  enforces the approved classification vocabulary and output structure.
  Never attributes a change to a specific policy or program.
  Always notes that two data points require cautious interpretation.
---

# Capability: trend-interpreter (Subagent + Skill)

## Purpose
Interpret year-over-year changes in a department's employment equity representation gap. This capability combines a subagent (for reasoning about whether a gap change is genuine or benchmark-driven) with a skill (to enforce the approved classification vocabulary and output template).

## Form: Subagent + Skill

**Why subagent?** A fixed formula cannot distinguish a meaningful representation improvement from a benchmark shift, a data revision, or statistical noise. Judgment is required to read both the rep change and the WFA change together before classifying direction.

**Why skill?** Once the judgment is made, the output must follow the approved classification vocabulary (genuine improvement / net improvement with caveat / benchmark-driven worsening / worsening / stable) and the approved template format — every time, regardless of who runs it. The skill component locks in this structure.

## Trigger
Invoke when:
- A user asks "is [DEPT] improving?" or "why did the gap change?"
- A dashboard trend view needs a plain-language caption
- A presentation summary includes a year-over-year delta and needs an explanation

## Inputs required
```
department_agency:          [string]
equity_group:               [string]
fiscal_year_current:        [e.g., "2024-2025"]
rep_pct_current:            [float, e.g., 8.5]
wfa_pct_current:            [float, e.g., 12.0]
gap_current:                [int, e.g., -1359]
fiscal_year_prior:          [e.g., "2023-2024"]
rep_pct_prior:              [float, e.g., 8.8]
wfa_pct_prior:              [float, e.g., 12.0]
gap_prior:                  [int, e.g., -1228]
all_employees_current:      [int]
```

If any field is missing: "Insufficient data for trend interpretation — [field name] is required."

## Subagent reasoning — Step 1: Compute deltas
- `rep_change = rep_pct_current − rep_pct_prior`
- `wfa_change = wfa_pct_current − wfa_pct_prior`
- `gap_change = gap_current − gap_prior`

## Subagent reasoning — Step 2: Classify (decision table)

| rep_change | wfa_change | Classification |
|---|---|---|
| positive | zero or negative | Genuine improvement |
| positive | positive but smaller | Net improvement with caveat |
| positive | positive and larger | Apparent improvement masking benchmark rise |
| zero | positive | Benchmark-driven worsening |
| negative | any | Worsening |
| < 0.3pp either direction | < 0.3pp | Stable |

## Subagent reasoning — Step 3: Size the change
- < 0.5pp: "no meaningful change"
- 0.5–1.9pp: "modest change"
- 2.0–4.9pp: "notable change"
- ≥ 5pp: "substantial change"

## Skill output template (enforced — do not vary)

> Between [PRIOR_YEAR] and [CURRENT_YEAR], [DEPT]'s representation of [GROUP] [rose/fell/remained stable] from [REP_PRIOR]% to [REP_CURRENT]% — a [SIZE] change of [ABS_REP_CHANGE]pp. The workforce availability benchmark [held at / rose from X% to / fell from X% to] [WFA_CURRENT]%. [INTERPRETATION_SENTENCE]. The employee-count gap [narrowed by / widened by / remained at approximately] [ABS_GAP_CHANGE] employees.

Approved interpretation sentences:
- Genuine improvement: "This represents a genuine improvement in representation relative to benchmark."
- Net improvement with caveat: "Representation improved, though part of the apparent narrowing reflects a shift in the benchmark — caution is warranted in attributing this solely to recruitment or retention changes."
- Benchmark-driven worsening: "The gap widened primarily because the workforce availability benchmark increased, not because representation declined."
- Worsening: "This represents a worsening in representation relative to benchmark."
- Stable: "No meaningful change was observed in this period."

## What this capability never produces
- Attribution of a change to any specific HR program, policy, or decision
- A comparison between departments on trend direction
- A prediction of future representation levels
- An interpretation where the WFA benchmark change is ignored

## Mandatory closing line
> *Trend data covers two fiscal years only (2023-24 and 2024-25). Patterns across two points should be interpreted with caution. A human EDI policy lead should review before any action is taken.*
