# Session Handoff — Day 2 Build Complete (2026-07-03)

Paste or attach this file to start a new conversation. Full detail lives in
`CLAUDE.md` (spec + critical data facts) and `knowledge/deployment-log.md` (build record).

## Current state — SHIPPED

- **Live dashboard (primary deliverable):** https://emplyoment-equity-tbs.vercel.app — `index.html`,
  the original mockup pixel-identical but wired to REAL data. 53 departments, 4 groups + 10 subgroups,
  6 PSES themes, 3 survey cycles. Auto-deploys from `main` (repo `ldzeble/EMPLYOMENT-EQUITY-TBS`,
  private; Vercel Hobby; `vercel.json` forces static build of index.html only).
- **Streamlit app (deep-dive companion):** `app.py` on Streamlit Community Cloud, same repo,
  loads `knowledge/pses_prepared/*.csv.gz` (~27 MB, suppression/sentinel/ID-padding baked in).
- **Chat tab:** grounded in selected department's real numbers + CPA aggregates + source registry;
  works only locally (Ollama at localhost:11434, `OLLAMA_ORIGINS="*"`, model llama3; llama3.2 optional).
  5-min timeout. Hosted site shows honest "unavailable" notice.
- **Executive Summary tab:** ⚡ Generate Summary button, scoped to dept/group/subgroup/year filters,
  computed live from data (divergence flags → recruitment gaps → experience gaps → on-track → no-data),
  rich narratives with census-change caveat, worst-subgroup callout, self-ID caveat. No LLM needed.

## Day 2 steps (all complete, per lecture "2026.06.27 - MMA 616 - Day 2 (BUILD) v4.pdf")

1–2 Capability map (16 verbs, in deployment-log). 3 Guards built. 4 Stack: Streamlit + static HTML on Vercel.
5 Guards: `skills/suppression_guard.py`, `skills/wfa_scope_guard.py` (hard gate D115/D116/D117),
`skills/trend_comparability_guard.py`, `knowledge/dept_name_mapping.csv` (53 mapped, no fuzzy fallbacks).
6 Pre-aggregated PSES (2.3 GB → 27 MB). 7 GitHub + deploys. 8 Live oracle passed; Use week started.

## Load-bearing discoveries this session (all verified against microdata, in CLAUDE.md)

- PSES **renumbered questions** in 2024 (harassment Q63/2024 = Q62/2022 = Q60/2020) →
  `knowledge/question_concordance.csv`; never join years on QUESTION.
- PSES **re-coded demographics** every cycle (2020 D115B=Woman, D117x=Indigenous subgroups;
  2022 EEDV_02/EEDV_21; 2024 D111A/D112/D113/D114) → `knowledge/demographic_concordance.csv`;
  never join years on BYCOND. Group-level 3-cycle trends honest ONLY for Women;
  Indigenous/disability have NO overall code before 2024; subgroup lineages span all cycles.
- Five silent bugs fixed: LEVEL1ID "0"/"00" year mismatch; harassment theme filter matched nothing
  (SUBINDICATORENG only); SCORE100=9999 sentinel inflating means (9585/100 caught by plausibility);
  Indigenous↔disability codes swapped in app.py; mock-data fallback reachable via stale dropdown.
- Live oracle: DND × Women × Harassment = 69 (2020) → 64 (2022) → 62 (2024), n≈12k/cycle.
- Real divergence findings: CBSA (racialized + Indigenous), GAC (racialized 30.2% rep vs 22.7% WFA,
  harassment 48/100 vs 64 avg).

## Environment quirks (cost hours — respect them)

- **OneDrive sync lag/truncation** corrupts files near EOF and delays GitHub Desktop seeing changes.
  Rule: verify after any edit; use bash-append near file ends; pause/resume OneDrive to force sync.
- Sandbox bash: 45s timeout kills mid-write (gzip files truncate); stale `skills/__pycache__` can
  shadow fixed modules; mount serves stale reads — verify via Windows-side tools when in doubt.
- Vercel/browser CDN cache shows old builds — always cache-bust or hard-refresh before diagnosing.

## Open items for the Use week / Day 3

- Keep `knowledge/deployment-log.md` updated: surprises, overrides (with timestamp+reason), outsider reactions.
- Cosmetic: two dept names carry stray '¥' (Health Canada¥, CIRNAC¥) — fix in mapping + regenerate.
- Unweighted dept mean in "All departments" views — defensible, but note in Day 3 methodology.
- Future work (logged, out of scope): RAG backend for ask-anything over PDFs/microdata;
  summary-writer LLM polish; PR-based review is by workflow (free private repo can't enforce).
- Regenerating dashboard data: `skills/build_dashboard_data.py` → splice via the patch process in
  deployment-log; verify with `node --check` + DND oracle before shipping.
