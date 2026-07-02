**The Workspace — Knowledge Folder**

Everything for this project lives in one folder on your Desktop called Knowledge. Here is what every piece is and why it exists.

---

**The Master Dataset**

The heart of the project is `data/processed/employment_equity_department_gaps.csv`. This is the processed dataset you built from scratch — 424 rows covering every combination of department, equity group, and fiscal year. It has 140 rows for 2023-24 (35 departments × 4 equity groups) and 284 rows for 2024-25 (71 departments × 4 equity groups). Every row tells you how many employees a department has, how many are from a designated equity group, what percentage that represents, what the workforce availability benchmark is, and what the gap is in raw employee count. The 2024-25 rows were also enriched with five scores from the Public Service Employee Survey — engagement, diversity and inclusion, harassment, discrimination, and mobility and retention. The raw PSES source file is `EEINFODV.csv`, which is 863MB and 1.6 million rows — you never need to open it directly, it was already processed.

---

**The Living Spec**

`CLAUDE.md` is the most important file in the project. It is the specification that everything was built from — written before any code was written. It defines what the app must do, what every output row must show, what the app must never produce, and 10 absolute rules that cannot be broken under any circumstances. Rules like: never average equity groups into a composite score, always show WFA alongside representation %, always show raw N, never make causal claims, treat blank cells as suppressed not zero. This file is what you bring to every future session to direct Claude — it is the single source of truth.

---

**The App Files**

`Employment Equity Gap Dashboard · TBS 2024-25.html` is your main deliverable — a fully self-contained 270KB HTML file with all 255 rows of 2024-25 data embedded directly inside it. No internet connection needed, no server, no login. Just open it in a browser. It has six tabs: Frame (overview), Explore Gaps (ranked gaps with priority flags), Compare (cross-group heatmap), Track (year-over-year trends), Present (presentation summary generator), and Ask (conversational Q&A with action plan generator). The Ask tab was built as a separate file first — `EDI_Policy_Advisor.html` — and then merged into the dashboard as Tab 6.

The `equity-dashboard/` subfolder is the deployment package — the version of the app that lives on GitHub and Vercel. It contains `index.html` (a copy of the dashboard), `vercel.json` (tells Vercel it's a static site), `README.md` (onboarding guide for anyone who wants to fork and tweak it), and `DEPLOY.md` (step-by-step instructions for GitHub and Vercel setup). This is the only folder that gets pushed to GitHub. Everything else stays local.

---

**The Five Capabilities**

Five `.skill` files were built and saved in the Knowledge folder. These are the guardrail capabilities that make the app trustworthy and consistent:

`edi-data-guard.skill` runs seven checks on any CSV before analysis — it catches wrong column names, bad equity group labels, percentages stored as strings, suppressed cells that were zero-imputed, and WFA benchmarks that don't match the known values. It blocks the run if anything fails.

`interpretation-guardrails.skill` enforces cautious language on any text output. It checks for five violations: causal claims, blame language, missing WFA benchmark, out-of-scope action recommendations, and missing Persons with Disabilities self-identification caveat. It produces approved signal text only.

`trend-interpreter.skill` classifies year-over-year gap changes as genuine improvement, benchmark-driven worsening, worsening, or stable — and never attributes a change to a specific policy or program.

`question-router.skill` routes any user question to one of three outcomes: Answer (if answerable from the data), Reframe (if it requires causal inference), or Refuse (if it asks for staffing decisions or things outside the dataset).

`presentation-summary-render.skill` generates a structured five-block summary for any department-group combination: Key Finding, Evidence, Caveat, Human Review Required, and Next Action — always in that order, always capped at 300 words, always ending with the TBS data attribution line.

---

**The Documentation**

Seven markdown files document every aspect of the project so it can be picked up by anyone at any time.

`data_dictionary.md` defines every field in the CSV and the dashboard D array — what each column means, how it was computed, and what blank values mean.

`data_profile.md` describes the shape and quality of the dataset — how many rows, which departments appear in both years, how many rows are suppressed, and notes on coverage.

`what_claude_cannot_guess.md` lists 23 business rules that are not obvious from the data alone — things Claude must be told explicitly, like the fact that WFA is the only valid benchmark, that PSES scores are context only and cannot be combined with representation % in a formula, and that trend lines must only be drawn for departments present in both fiscal years.

`source_links.md` contains the exact URLs for every TBS publication and PSES file used in the project.

`domain_research_note.md` explains the employment equity framework — what workforce availability means, why the four groups are benchmarked against different labour markets, what voluntary self-identification means for data quality, and what responsible use looks like.

`Dashboard_Walkthrough_Script.md` is a guided five-step walkthrough of the app — what you do on each tab, what you see, and what you get. Written for someone who has never seen the app before.

`PROJECT_HANDOFF.md` is a concise summary of the entire project — key files, data sources, dashboard structure, capabilities, and known gaps — written so a new person could pick it up in ten minutes.

---

**The Deployment Log**

`Deployment_Log.md` is the Use phase record. It was started today with the oracle pre-filled: Royal Canadian Mounted Police · Persons with Disabilities · 5.5% (N=590 of 10,822) · WFA 12.0% · Gap −709. Every time something surprising happens during the week — the app gives an unexpected answer, a user gets confused, a priority flag is overridden — you add an entry. This log comes back to Day 3 as your primary evidence for the Evaluate phase.

---

**The Course Submissions**

`MMA616_Day2_Submission.html` and `MMA616_Day2_Submission.pdf` are the Day 2 course submission files — a write-up of the capabilities, the workflow pipeline, and the defined outputs, formatted for Dr. Glaser.

---

In short: the Knowledge folder is your complete project archive. The `equity-dashboard/` subfolder is what the world sees. Everything else is your source of truth, your documentation, and your audit trail.