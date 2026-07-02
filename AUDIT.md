# MMA 616 Group Project — Audit & Change List

**Project:** Employment Equity Gap Dashboard · TBS 2024-25
**Audited:** 2026-06-29 (Mon) — you are currently *inside* the deployment/use week.
**Timeline runway:** Use week June 28–Jul 2 · **Day 3 (Evaluate) = Fri Jul 3** · **Day 4 (capstone + final submit) = Sat Jul 4.**
**Grade weight:** 40% of course. Graded on judgment, not code elegance — *"whether the dashboard is worth building, whether it shows what you said it would, and whether you can show that it does."*

---

## 1. Bottom line

The **opportunity and the spec are genuinely strong** — this is a real user, a real decision, and a defensible problem (it passes the course's "Value Test": a decision it changes + an owner who acts + a claim the data can support). The **dataset is arithmetically sound** (the RCMP oracle reconciles exactly; 424 rows / 71 depts / 29 suppressed / 187 enriched all verified).

The problem is everything *around* that core:

- The **"agentic workspace" — which the build component explicitly rewards (30%) — is currently cosmetic.** Five well-written skill documents exist, but none is installed as a runnable Claude skill, none carries an executable check, there are no real subagents/workflows/connectors, and the live dashboard re-implements every "capability" in hardcoded JavaScript. The CLAUDE.md/Day-2 writeup *claims* the app runs these capabilities at runtime; the source contradicts that. **This is the single biggest live-demo / Q&A risk.**
- The **"Ask" tab is keyword-regex matching marketed as conversational AI.** It will be exposed in seconds by any comparative or open-ended question.
- The **evaluation & governance trail is half-built** — but largely because the use-week (now) hadn't happened when the files were authored. This is fixable *this week*.
- The **dashboard is a competent vibe-code with real defects**: zero accessibility (a hard fail for a government audience), mobile layout overflow, two diverged ~270 KB copies (one malformed), and computed fields baked offline so correctness can't be verified from the repo.
- The **data has 2 of 5 PSES columns 100% empty** while every doc claims all five exist, plus a stale duplicate CSV and no reproducible pipeline.

Net: strong foundations, weak execution on exactly the things the rubric weights and the demo exposes. All are fixable in the runway.

---

## 2. Rubric scorecard (current standing → target)

| Component | Weight | Current | Why |
|---|---|---|---|
| Opportunity & creativity | 20% | **Strong** | Clear user + decision; passes the Value Test; responsible framing. Keep it; sharpen the "refusals." |
| Specification (CLAUDE.md) | 15% | **Strong but inaccurate** | All 6 parts present, gold example, must-never list, human-in-loop. But it describes a runtime that doesn't exist, overclaims PSES, gold example cites a WFA not in the data, and isn't revised (Day-3 needs a revised spec). |
| Data & context | 10% | **Mixed** | Core data verified-sound, but 2/5 PSES cols empty vs docs, stale duplicate CSV, **no pipeline** and data **pasted in** (the exact things this line rewards). |
| The build | 30% | **Weakest vs weight** | Deployed + decent-looking, but fake "Ask" AI, zero a11y, mobile overflow, dual copies, offline-baked logic — **and the agentic workspace is cosmetic.** |
| Evaluation & governance | 15% | **Incomplete** | Real harness for 1/5 capabilities; no before/after; empty deployment log; no revised CLAUDE.md; a grading-data contradiction in the eval viewer. Mostly "do the work the use-week is for." |
| Presentation & defense | 10% | **At risk** | The live demo will expose the fake AI and cosmetic agentic claims unless the story is made honest or real first. |

---

## 3. The three things that will sink the grade if not fixed

1. **The agentic story is not defensible under questioning.** The instructor's own model project ("Kinquiry") sets the bar: real skills are *folders* (`.claude/skills/<name>/SKILL.md` + a `scripts/validate.py` that **exits non-zero and blocks the run**), real subagents run in their own context, and the dashboard was built by a real multi-subagent workflow. Asked "show me a skill run / the validate.py / the subagent / is the data connected?" — every current answer is "it's a document / a label / pasted in."
2. **The "Ask" tab is fake AI.** `askRouteQuestion()` is a first-match-wins regex cascade over canned strings; it can't compare departments, has no memory, and silently returns a generic table for anything off-script. Marketed as "conversational Q&A." Either make it honestly "Guided Q&A," or make it *real* (a thin Claude API route) — the latter turns the biggest liability into the strongest demo.
3. **The evaluation/governance deliverables don't exist yet** (no before/after, empty deployment log, unrevised spec). The use-week is the window to produce them — and it is happening right now.

---

## 4. Findings & changes by rubric component

Severity tags: 🔴 critical (grade-sinking / demo-exposing) · 🟠 major · 🟡 polish.

### 4.1 Opportunity & creativity (20%) — *preserve, sharpen*
- ✅ Strong as-is. EDI policy lead / HR exec at TBS; decision = where to direct limited review capacity; dashboard is the right tool for "rank/filter 71 depts × 4 groups against WFA."
- 🟡 Lean into the course's "name what you'll refuse" framing in the pitch: state plainly that a gap is *not* evidence of discrimination, and that the four groups are never combined. This is the responsible-use judgment the course rewards (it explicitly grades "the gap between the values an app is configured with and the values it enacts").
- 🟡 In the deck, state the objective as the course's "no-dataset sentence": *"this lets an EDI lead prioritize review across 71 departments in under two minutes, which they couldn't before."*

### 4.2 Specification / CLAUDE.md (15%) — *fix accuracy + revise for Day 3*
- 🔴 **Spec claims a runtime that doesn't exist.** It maps tabs to capabilities ("Track → trend-interpreter (Subagent + Skill)", "Present → presentation-summary-render (Subagent)") and the Day-2 writeup says the dashboard "displays the output of the guardrails skill" and routes questions via a subagent. The static HTML does none of this. **Rewrite these sections** to describe capabilities as *build-time design contracts* — or wire them for real (see 4.4) and then the claim becomes true.
- 🟠 **Gold example uses a WFA that isn't in the data.** Gold row: `RCMP · Indigenous · WFA 3.8%`. The data uses service-wide Indigenous WFA 4.0%/4.1%; 3.8% appears nowhere. Replace the gold example with a **verified** row — the RCMP · Persons with Disabilities oracle (`5.5%, N=590 of 10,822 · WFA 12.0% · gap −709`) reconciles exactly and is already your oracle.
- 🟠 **PSES overclaim** (see 4.3): spec lists 5 PSES columns; 2 are entirely empty. Fix the spec to match reality (3 present) or backfill the data.
- 🔴 **Not revised** — Day 3 requires a *revised* CLAUDE.md. Add a dated "Revision log (Day 3)" section tying each change to a specific use-week episode (this is exactly what the course is listening for: "a spec a stranger could build from, with the judgment written in," kept living).
- 🟡 Note in the spec which parts are synthetic/processed vs live, and that the dataset is a one-time extraction (honesty about claims the data can carry).

### 4.3 Data & context (10%) — *fix overclaim, dedupe, add a pipeline*
- 🔴 **2 of 5 PSES columns are 100% empty.** Verified independently: `pses_engagement`=187, `pses_diversity_inclusion`=187, `pses_harassment`=177, **`pses_discrimination`=0, `pses_mobility_retention`=0** (of 424 rows). Yet `data_dictionary.md`, `data_profile.md`, `CLAUDE.md`, `what_claude_cannot_guess.md` all describe five, and `domain_research_note.md` gives a worked example using a "low discrimination score." → Either backfill from the raw PSES file or **strike discrimination + mobility/retention from every doc.**
- 🟠 **Stale duplicate CSV.** `Knowledge/employment_equity_department_gaps.csv` (344 rows, 9 cols, no PSES) vs the canonical `Knowledge/data/processed/employment_equity_department_gaps.csv` (424 rows, 14–15 cols). Delete the root copy — two divergent sources is a correctness hazard.
- 🟠 **No reproducible pipeline** — no `.py`/`.ipynb`/`.sql`/`.R` anywhere; the TBS data was hand-extracted from a PDF and the 1.6M-row PSES processed offline with no retained code, raw files not in repo. This is the specific thing this rubric line rewards ("connected directly… rather than pasted in"). → Add a checked-in extraction/build script (PDF + `EEINFODV.csv` → CSV → the dashboard's `D` array) so the data is auditable and reproducible.
- 🟡 Document the join key and representativeness caveat for PSES (different respondent population than headcount; context only, never a denominator) — the docs already say this; keep it.

### 4.4 The build (30%) — *the heavy lift; rewrite recommended*

**Dashboard (software-engineering defects):**
- 🔴 **Accessibility is absent**: 0 `aria-*`, 0 `role`, 0 `alt`, 0 `<h1>–<h3>`, 1 semantic landmark; tabs are bare buttons; charts have no text alternative; color is the sole status carrier in places. **A hard fail for a TBS/government audience** (and WCAG). 
- 🔴 **"Ask" tab is fake AI** (`askRouteQuestion`, ~line 2113): regex cascade, first-match-wins (so "best way to *address* the women's gap" returns the above-benchmark list, ignoring "women"), no cross-department reasoning, unknown questions silently dump a generic table. Decide: honest "Guided Q&A" relabel, or a real Claude API route.
- 🟠 **Mobile layout overflows**: only 2 media queries (both 900px); the right rail is *hidden* (content loss) rather than reflowed; KPI row stays `repeat(4,1fr)` and bullet rows keep fixed-px tracks → horizontal squeeze/overflow on phones. This is the exact failure mode the course called out (the "unscrollable on a phone / chart runs off the frame" lesson).
- 🟠 **Two diverged ~270 KB copies; the `Knowledge/equity-dashboard/` one is malformed** (two `<!DOCTYPE>` declarations) and its only doc-comment is *wrong* (claims 255 rows + a `getSeverity` function that doesn't exist; the array has 284 rows and severity is pre-baked). Pick the GitHub-linked `equity-dashboard-/index.html` as canonical, delete the others.
- 🟠 **Correctness is unverifiable from the repo.** `severity` and `priority` (bottom-quartile flag) are baked literals in `D`, computed by an offline step that isn't checked in. The dashboard renders pre-computed judgments rather than computing them → move that logic into the (new) pipeline so it's testable.
- 🟡 **Spec violation on the Frame tab**: `renderBulletsOv` (~line 1642) shows rep% without its N — the "always show N beside every rep%" rule is violated on the overview.
- 🟡 Unescaped `innerHTML` across ~29 render sites (safe only because data is static — latent injection surface if data ever becomes dynamic); ~4× duplicated row-formatting logic; cryptic naming; mixed inline-handler/addEventListener.
- ✅ **Genuinely good**: the visual design (coherent CSS-variable theme, professional look) and the hand-rolled SVG charts (correct axis scaling, `viewBox`+`width:100%` so charts themselves don't overflow). Port these.

**Recommendation: full rewrite, not refactor.** You can't fix the architectural ceiling (fake AI, no data/view separation, no build, no a11y, a 137 KB single-line hand-edited data array) by patching. Port the salvageable parts (data, chart math, guardrail copy, severity/priority logic moved into a checked-in script).
- **Recommended stack (matches course endorsements):** Next.js on Vercel (already the deploy target) + Tailwind, data loaded from a real `data/*.json` produced by the pipeline, 6 views as components, charts via a lib or the existing SVG wrapped in components. Gets routing/a11y/responsive largely for free.
- **For "Ask":** add a thin Vercel serverless/edge route that calls the **Claude API** with the equity data as grounded context and the responsible-use guardrails in the system prompt. This is the course's endorsed "client-side dashboard + thin reasoning layer" target and converts the demo's biggest liability into its strongest moment.

**Agentic workspace (explicitly rewarded by this component):**
- 🔴 **Skills not installed / not runnable.** The five `.skill` files are ZIP bundles each containing a correctly-formatted `SKILL.md` (good content, valid `name`/`description` frontmatter) — but none is under `.claude/skills/`, none bundles a `validate.py`-style check, and nothing invokes them. → Install each as `.claude/skills/<name>/SKILL.md`, and give **`edi-data-guard` a real `scripts/validate.py`** that implements its 7 checks and **exits non-zero on failure** (+ `references/columns.json`). In the demo, run it on the real CSV and on a deliberately broken copy ("Visible Minorities" label, `"22.7%"` string) to show it *blocking* — the Day-2 doc already specifies the expected pass/fail, so the oracle exists.
- 🔴 **"Subagents" are labels, not artifacts.** No subagent/agent definitions exist; "Subagent"/"Subagent + Skill" in CLAUDE.md are aspirational. → Define real subagents for `question-router`, `trend-interpreter`, `presentation-summary-render` (or honestly relabel them as build-time skills and remove the runtime claims).
- 🟠 **No build workflow / no connector.** The instructor's dashboard was built by a 9-subagent dynamic workflow; here the repo has a 2-commit history and no orchestration artifact. Not required, but rewarded — consider rebuilding the new dashboard via a documented multi-subagent workflow and keeping the artifact. A connector is legitimately optional (state *why* you didn't need one, the way the model project does).
- 🔴 **Data "pasted in," not connected.** The dashboard hardcodes `const D = [...]`; the CSV exists but nothing loads it; "rebuild" = re-pasting (the spec even admits "PSES not yet in D array; embed on next rebuild"). → Load data at runtime/build time from the file (or a connector) so the data is connected, not transcribed.

### 4.5 Evaluation & governance (15%) — *do this during the use-week (now)*
- 🔴 **Deployment log is an empty template** — only the seeded RCMP oracle entry is filled; all `[EPISODE]/[FAILURE]/[OVERRIDE]/[EXTERNAL]` slots blank. The use-week is *now* → capture ≥3–5 real episodes, including at least one `[FAILURE]`, one `[OVERRIDE]` (a policy lead dismissing a ⚑ flag, with logged reason), and one `[EXTERNAL]` reaction from someone outside the group. Right now there is literally nothing to "read."
- 🔴 **No before-and-after.** The eval viewer has `previous_feedback={}` / `previous_outputs={}`; the with/without-skill axis shows *no* delta (9/9, 5/5, 4/5 both ways). → Establish a Day-2 baseline number, make a change, re-run the *same* tests at Day 3, and show the delta. Extend coverage beyond the single capability.
- 🟠 **Eval only covers 1 of 5 capabilities** (`edi-data-guard`); the others are "verified" by hand-written narrative. → Add re-runnable cases for the other four.
- 🟠 **No dashboard-output check.** The oracle is a manual "open the app and look" procedure. → Add a tiny assertion (JS/console or a Python check against `D`) confirming the rendered RCMP·PwD row = 5.5% / N=590 / gap −709. This closes the rubric's "a way to check the dashboard's output against [the cases]."
- 🟠 **Eval-2 data is self-contradictory** — `passed:false` flags paired with evidence strings that describe a PASS ("No imputation found", "Responsible note present"). Reads as fabricated/buggy to a close reader. → Reconcile flags with evidence and re-derive the 4/5.
- 🟡 **Ship the eval fixtures** (`clean_data.csv`, `bad_group_label.csv`, `zero_imputed.csv`) so the harness is re-runnable from the handoff; reconcile the metadata's `runs_per_configuration: 3` with the 1 embedded run.
- ✅ **Governance *policy* is solid** (CLAUDE.md human-in-loop, 10 absolute rules, approved review vocabulary, always-visible caveat, branch-protection/PR flow in DEPLOY.md). 🟠 But it's *unexercised*: the `[OVERRIDE]` log is empty and the "log the reason" promise has no mechanism. → Exercise it this week and/or build a minimal override-logging stub.

### 4.6 Presentation & defense (10%) — *make the story honest or real first*
- 🔴 Do not present the agentic/AI claims as-is — they collapse under the obvious questions. Fix 4.4 first (even partially: one real `validate.py` that visibly blocks a bad file is the highest-leverage, lowest-effort win).
- 🟡 Speak in the course's vocabulary: the Plan→Build→Use→Evaluate loop, the living spec, the six principles (esp. "Verify, then trust" and "Delegate work, not accountability"), the governance membrane. Every member must be able to answer for any part (Q&A is individual).
- 🟡 Lead the demo with the verified oracle (RCMP·PwD = −709), then the `validate.py` block, then the (honest/real) Ask tab. Have a screen-recording backup but make the live demo the point.

---

## 5. Cross-cutting hygiene
- Delete: the stale root CSV, the malformed `Knowledge/equity-dashboard/` copy, and the old `Employment_Equity_Gap_Dashboard.html` prototype. One canonical dashboard, one canonical CSV.
- Reconcile the README discrepancy: `equity-dashboard-/README.md` still says "Live URL: (add after deploy)" while `Knowledge/equity-dashboard/README.md` has the real URL (`equity-dashboard-snowy.vercel.app`).
- Single source of truth for the data → dashboard step (the pipeline), so a refresh isn't a hand-edit of a 137 KB line.

---

## 6. Prioritized action plan (mapped to the runway)

**Now → Wed (use-week, in parallel):**
1. 🔴 Start filling the **deployment log** for real — get the dashboard in front of 1–2 people outside the group; record episodes, one override (with logged reason), one failure, one external reaction.
2. 🔴 Fix the **data overclaim** (strike or backfill the 2 empty PSES columns across all docs); delete the stale CSV and malformed dashboard copy.
3. 🟠 Add the **reproducible pipeline** script (raw → CSV → `D`), moving severity/priority computation into it.

**Wed → Thu (build):**
4. 🔴 Decide dashboard track (rewrite recommended: Next.js/Vercel) and the **Ask-tab** decision (honest vs real Claude API). Rebuild with a11y + responsive baked in; port charts + theme; load data from the pipeline output (data *connected*).
5. 🔴 Install skills under `.claude/skills/`; write **`edi-data-guard/validate.py`** that blocks a bad CSV; define real subagents (or relabel honestly). Optionally rebuild via a documented multi-subagent workflow.

**Fri = Day 3 (Evaluate):**
6. 🔴 Run the **same eval set** again → produce **before/after** with the delta; fix the Eval-2 contradiction; add the dashboard-output oracle check.
7. 🔴 Produce the **revised CLAUDE.md** with a dated revision log tied to use-week episodes; write the deployment assessment.

**Sat = Day 4 (capstone):** rehearse the demo in course vocabulary; ensure every member can defend any part; act on instructor feedback; submit final.

---

## 7. Strengths to preserve (don't break these in the rewrite)
- The problem framing, the responsible-use posture (no causal claims, no composite scores, suppression-as-missing, always-visible caveat, approved review vocabulary).
- The verified core dataset and the RCMP oracle.
- The CLAUDE.md structure (6 parts, gold example, must-never list, human-in-loop) — just make it accurate and living.
- The visual design language and the (correct) hand-rolled charts.
- The well-written skill *content* — it just needs to become installed, runnable, and actually invoked.
