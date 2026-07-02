# Deploy runbook — Employment Equity Gap Dashboard (Next.js on Vercel)

You run these steps (git + Vercel auth are yours). The app lives in `web/`; the
agentic workspace (`.claude/`, `CLAUDE.md`, `pipeline/`, `eval/`, `Deployment_Log.md`)
lives at the repo root so it's in GitHub for the demo and grading.

## 0. One-time: make the project one git repo

`create-next-app` initialized a git repo *inside* `web/`. Collapse it so the whole
project is one repo:

```bash
cd "/Users/ishaq/Documents/personal/projects/huddah_assign"
rm -rf web/.git          # remove the nested repo
git init
git add .
git status               # confirm .env.local and Knowledge/data/raw/ are NOT listed
git commit -m "Rebuild: Next.js equity-gap dashboard + agentic workspace"
```

The root `.gitignore` already excludes `web/.env.local`, `web/node_modules`,
`web/.next`, and the 1.25 GB `Knowledge/data/raw/` — verify with `git status` before
committing. (If you want a clean public repo, you can also `git rm -r --cached`
the old `equity-dashboard-/` and `Knowledge/equity-dashboard/` HTML folders.)

## 1. Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/<you>/equity-gap.git   # new or existing repo
git push -u origin main
```

## 2. Deploy on Vercel

1. vercel.com → **Add New… → Project** → import the GitHub repo.
2. **Root Directory → `web`** (important — the Next app is in the subfolder). Framework
   auto-detects as **Next.js**; leave build/output settings default.
3. **Environment Variables** → add:
   - `ANTHROPIC_API_KEY` = your key (required for the Ask tab)
   - `ANTHROPIC_MODEL` = `claude-sonnet-4-6` (optional; this is the default)
4. **Deploy.** You get a live URL in ~1–2 minutes.

## 3. Governance membrane (branch protection)

GitHub → repo **Settings → Branches → Add rule** on `main`: require a pull request +
1 approval before merge. From then on: branch → PR → review → merge (merge to `main`
auto-redeploys). This is the human-review boundary every change crosses.

## 4. Confirm it works (post-deploy smoke test)

- **Oracle:** Explore Gaps → filter *Persons with Disabilities* → find **RCMP** →
  confirm **5.5% (N=590 of 10,822) · WFA 12.0% · gap −709 · Substantial · ⚑**.
- **Ask tab:** ask "where are the largest gaps for Persons with Disabilities?" — it
  should answer with grounded numbers; ask "why?" — it should refuse/reframe.
- **Mobile + a11y:** open on a phone; tab through with the keyboard.

## 5. Rebuilding the data (if TBS/PSES publish new numbers)

```bash
# 1. download the raw PSES file (documented source)
curl -L -o Knowledge/data/raw/EEINFODV.csv \
  "https://www.canada.ca/content/dam/tbs-sct/documents/datasets/ses-2025/EEINFODV.csv"
# 2. re-extract + rebuild (gated by edi-data-guard)
python3 pipeline/extract_pses.py
python3 pipeline/build_dataset.py     # -> web/src/data/equity.json + meta.json
python3 pipeline/build_history.py     # -> web/src/data/rep_history.json (multi-year trends)
# 3. verify, then commit web/src/data/*.json
python3 eval/run_eval.py
```

## Notes
- The dashboard is static + a single serverless route (`/api/ask`); no database.
- The Ask route holds the API key server-side — it never reaches the browser.
- Local dev: `cd web && npm run dev` (key read from `web/.env.local`).
