# Employment Equity Gap Dashboard — Walkthrough Script

**Audience:** EDI policy leads, HR executives, senior management  
**Duration:** ~7–10 minutes  
**Format:** Guided demo or self-directed walkthrough  
**Goal:** Leave knowing exactly which departments to prioritize, why, and what kind of review to trigger

---

## Before You Start

"This dashboard exists because the Treasury Board publishes employment equity data every year — but it arrives as four separate flat tables, one per group, with no ranked view of where the gaps are largest. An EDI policy lead looking at 71 departments across four groups cannot prioritize in under two minutes from a flat table.

This dashboard fixes that. You start with a rough question — 'where are the biggest gaps?' — and by the time you reach Step 5, you have a specific department, a specific group, a severity rating, a trend direction, and a plain-language signal you can take straight into a briefing.

One ground rule before we begin: every signal this system surfaces is for human review only. Gaps are not proof of discrimination. They do not name a cause. The dashboard tells you where to look — an EDI policy lead decides what to do."

---

## Step 1 — Frame: Get your bearings before you drill in

**What you do:** Open the dashboard. It lands on Step 1 — Frame — by default.

**What you see:** Four KPI cards, a severity donut, and an average-gap bar chart across all 71 departments and four equity groups.

**What you get from this step:**

Before filtering anything, Step 1 answers: *how bad is the overall picture right now?*

- The first card tells you how many department-group combinations are currently below their workforce availability benchmark. This is your universe of concern.
- The second card shows how many are priority-flagged — the bottom quartile, where gaps are most severe.
- The third card breaks down severe and substantial gaps specifically — the combinations where the distance from benchmark is large enough that a policy lead should be aware.
- The fourth card shows how many gaps are actually improving year-over-year — a useful check that the picture is not static.

**Actionable output from Step 1:** A number you can put in a briefing. "As of 2024–25, X department-group combinations are below benchmark. Y are priority-flagged. Z have severe or substantial gaps." You now know the scale of the problem before you've looked at a single department.

*[Use the group filter to select one equity group. Watch every card update.]*

"Filtering to a single group narrows the universe. If you're responsible for Indigenous Peoples representation specifically, filter now — every number, chart, and flag will recalibrate to that group and its WFA benchmark of 4.0%."

---

## Step 2 — Explore Gaps: Find the specific departments that need attention

**What you do:** Click Step 2 in the sidebar — Explore Gaps.

**What you see:** A ranked list of every department sorted from largest negative gap to smallest, with a bullet bar showing rep% vs. the WFA benchmark line, raw employee counts, and a plain-language signal on each row. Priority flags (⚑) mark the bottom quartile.

**What you get from this step:**

Step 2 answers: *which specific departments, for which group, are furthest below benchmark — and what does the data say to do about it?*

Every row gives you:
- The department name
- Its representation % — with the raw N it was computed from, so you can see whether a 2% gap is 40 employees or 400
- The WFA benchmark beside it — so you can immediately see the distance
- The gap as a signed employee count — how many more employees would bring this department to benchmark
- A plain-language signal written by the `interpretation-guardrails` capability: "Substantially below workforce availability benchmark. Recommended focus: recruitment pipeline and retention review."

The ⚑ flag tells you this department is in the bottom quartile. It is a candidate for review — not a verdict.

**Actionable output from Step 2:** A ranked shortlist of departments to review. You now know names, numbers, and a recommended focus area for each. "RCMP · Indigenous Peoples · 2.3% (N=481 of 20,921) vs WFA 3.8% · gap −324 · ⚑ Recommended focus: recruitment pipeline and retention review."

*[Expand the priority flags panel on the right.]*

"The priority flags panel shows the flagged departments with their signal text already written. This is the list you'd bring into a triage meeting."

---

## Step 3 — Compare: See which departments have compounding gaps across groups

**What you do:** Click Step 3 — Compare.

**What you see:** A cross-group severity heatmap. Rows are departments, columns are the four equity groups. Cell colour indicates severity — darker means further below benchmark.

**What you get from this step:**

Step 2 showed you the worst gaps within a single group. Step 3 answers: *which departments appear in the bottom quartile for two or more groups at the same time?*

A department with a single large gap may need a targeted single-group intervention. A department with dark cells across multiple columns may need a broader systemic review — something is happening at the organizational level, not just in one pipeline.

**Actionable output from Step 3:** A short list of departments where the gap problem is not isolated to one group. These departments move to the top of the review queue because the scope of review is wider — and likely more resource-intensive. "National Defence shows Substantial gaps for both Women and Indigenous Peoples simultaneously. A combined review is warranted."

---

## Step 4 — Track: Understand whether a gap is getting better or worse

**What you do:** Click Step 4 — Track.

**What you see:** Year-over-year trend lines for 35 departments present in both 2023-24 and 2024-25, plus a movers list showing which gaps widened and which narrowed.

**What you get from this step:**

Step 2 and 3 showed you the *current* picture. Step 4 answers: *is this gap improving, worsening, or just shifting because the benchmark moved?*

This distinction matters. The Women WFA benchmark fell from 55.3% to 54.9% between years. A department's Women gap could narrow on paper without any real improvement in representation — purely because the target moved. The `trend-interpreter` capability classifies each change:

- **Genuine improvement** — representation rose while benchmark held or fell
- **Net improvement with caveat** — representation rose, but the benchmark also moved — interpret carefully
- **Benchmark-driven worsening** — the gap widened because WFA increased, not because representation fell
- **Worsening** — representation fell
- **Stable** — no meaningful change

**Actionable output from Step 4:** A direction label for each priority department. "CBSA · Women — genuine improvement. National Defence · Indigenous — worsening." This tells you whether an existing intervention is working (keep going) or whether a new review is overdue (act now). It also tells your team whether to celebrate a narrowing gap or question it.

*Two data points require cautious interpretation. Do not extrapolate a trend from 2023-24 and 2024-25 alone.*

---

## Step 5 — Present: Export a structured finding for your briefing

**What you do:** Click Step 5 — Present.

**What you see:** A gap distribution histogram and a department-size scatter plot for the current filter, plus a description of the presentation-summary-render capability.

**What you get from this step:**

Step 5 answers two questions: *how exceptional is this gap relative to the rest of the service — and how do I communicate this finding to a stakeholder?*

The histogram shows where a flagged department sits in the full distribution. A −6pp gap looks very different if it's at the extreme tail of the distribution versus near the median. The scatter plot shows whether large departments are carrying disproportionately large headcount gaps.

The `presentation-summary-render` capability produces a structured 5-block export for any flagged department:

1. **Key Finding** — one sentence: the department, the gap, the benchmark, the headcount
2. **Evidence** — data source, scope, rank among 71 departments, trend direction
3. **Caveat** — what the data cannot tell the reader; PwD self-ID note if applicable
4. **Human Review Required** — who must act and what type of review is recommended
5. **Next Action** — one specific, time-bound investigative step

**Actionable output from Step 5:** A slide-ready or briefing-ready paragraph you can paste directly. Under 300 words. Always ends with TBS data attribution. Never contains a causal claim.

---

## What Happens After the Dashboard

The dashboard ends at Step 5. What happens next is human:

1. An EDI policy lead reviews every ⚑-flagged department before any action is taken
2. The recommended focus area (recruitment, retention, promotion pipeline, accessibility, workplace inclusion) guides what kind of review is commissioned — not what the outcome is
3. If a flag is dismissed, the reason should be logged for the next review cycle
4. PSES experience scores in the underlying data can help refine the type of review — a department with a large gap *and* a low inclusion score for the same group may need a retention and inclusion focus, not just a recruitment push

The system surfaces the pattern. The policy lead acts on it.

---

## One-Minute Summary

| Step | Question it answers | What you walk away with |
|---|---|---|
| 1 · Frame | How bad is the overall picture? | A headline number: X flagged, Y severe |
| 2 · Explore Gaps | Which specific departments need attention? | A ranked shortlist with signals and counts |
| 3 · Compare | Which departments have compounding gaps? | A multi-group priority list |
| 4 · Track | Is each gap improving or worsening? | A direction label for each priority department |
| 5 · Present | How do I communicate this finding? | A slide-ready 5-block summary |
