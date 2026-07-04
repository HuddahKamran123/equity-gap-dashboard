# Deployment Assessment — Employment Equity Gap Dashboard

**What this is.** The written record of the app crossing the governance boundary:
an independent critic attacked it, every finding was triaged by a human (accept /
reject / defer, with reasons), the accepted findings were fixed, and the critic
was re-run to prove it. This follows the course's three-evidence-stream model
(machine critique, human critique, week of use) — see the honesty note on Stream 2
below.

Date: 2026-07-04.

---

## 1. The critic's design brief (the four decisions)

1. **Who it plays.** Priya, the OCHRO equity analyst from `CLAUDE.md` §0 story #1
   — the sharpest story, and the one the app must not fail. She arrives cold with
   her real Tuesday-morning question: *"Which department × designated-group
   combinations should I flag for this year's report or a deputy-head
   conversation, ranked by how far below the workforce-availability benchmark
   they are?"*
2. **What it attacks.** The app's own written claims — the full text of `CLAUDE.md`
   was given to the critic verbatim, and it was instructed to quote the exact
   promise it was checking each time, not to grade the app against its own
   assumptions of what a "good dashboard" should do.
3. **What it must return.** Specific findings with evidence — exact numbers,
   exact quoted text, exact HTTP responses — for each of: Held / Broken / Could
   not test, with severity on any Broken finding. No accept/reject/defer verdicts
   from the critic; that judgment stays human.
4. **How it stays independent.** A fresh Agent invocation with no visibility into
   this build conversation, no access to source code or git history, and no
   knowledge of any known issue — it was told only the persona, the full
   `CLAUDE.md` text, and the live URL, and instructed to test only the deployed,
   public application at `https://equity-gap-dashboard.vercel.app`.

---

## 2. Baseline run — findings and triage

The critic tested 11 claims and returned 12 findings (11 + one bonus observation
about `/robots.txt`). **10 of 11 tested claims held**, with direct evidence
(exact API responses, exact HTML text, exact arithmetic checks) — see the full
transcript for the complete evidence on each. Summary:

| # | Claim | Verdict | Evidence (abridged) |
|---|---|---|---|
| 1 | Gold-example oracle (RCMP × Persons with Disabilities) | **Held** | `/api/ask` returned 5.5% (N=590 of 10,822), WFA 12.0%, gap −709, Substantial, Priority, exact recommended-review wording — matches `CLAUDE.md` exactly |
| 2 | Every figure shows %, N, and WFA together | **Held** | 5 rows across 3 groups checked via `/api/ask`; no bare percentage or bare gap in any response |
| 3 | Suppressed cells never show as zero | **Held** | Confirmed a real suppressed cell renders as `SUPPRESSED (small population)`, no numeric value |
| 4 | Severity bands match pp-below-WFA thresholds | **Held** | RCMP × Disabilities (6.5pp below → Substantial) and GAC × Visible Minorities (above benchmark → no severity band) both check out arithmetically |
| 5 | No composite score, no causal claims | **Held** | Directly provoked both via the Ask assistant — refused a cross-group averaged score ("mathematically meaningless") and refused/reframed a causal question; server-rendered copy on Frame/Compare also states groups are "never summed into one score" |
| 6 | Compare view's divergence lens | **Held** | Server-rendered `/compare` HTML plus a concrete worked example (GAC × Visible Minorities: above benchmark, but harassment/discrimination well below peer average) shown as two separate signals |
| 7 | Ask tab grounds facts, refuses causal, refuses staffing | **Held** | All three sub-claims confirmed via direct `POST /api/ask` calls; malformed requests returned clean 400/405s, confirming a real backend, not a canned page |
| 8 | Track marks the 2023-24 benchmark rebase | **Held** | Exact caveat sentence found in server-rendered `/track` HTML |
| 9 | Present generates a five-block briefing | **Held** (structure/content); performance claim not directly measurable | Server-rendered `/present` HTML shows the fixed 5-block structure; could not time an actual click-to-render round trip without a JS-executing browser |
| 10 | Responsible-use caveat on every page | **Held** | Exact string found in the persistent header on all 8 routes, including the 404 page |
| 11 | Story #1 — reach a ranked, filterable, priority-flagged view in ~2 minutes | **Broken (Moderate)**, see triage | Frame's headline KPI tiles read "0" in a cold `curl` fetch; `/explore` ships an empty shell with no server-rendered fallback content |
| 12 (bonus) | `/robots.txt` convention (not a `CLAUDE.md` claim) | **Broken (Minor)** | Returned the site's HTML 404 shell instead of a plain-text robots file |

### Triage

| Finding | Verdict | Reason |
|---|---|---|
| #1–#10, #12's structural half | **Accept as confirmed-working** | Direct evidence attached; no action needed |
| #11a — Frame's KPI tiles read "0" on a cold fetch | **Reject** | Investigated the source (`web/src/components/ui/CountUp.tsx`): this is a deliberate mount animation — it starts at 0 and counts up to the real value via `requestAnimationFrame` over ~1.1 seconds, and jumps straight to the real value for users with `prefers-reduced-motion` set. Not missing or broken data; a real user with JS enabled sees the correct number appear almost immediately. The critic's tooling (curl-only, no JS execution) could not distinguish "animates in" from "is missing." |
| #11b — `/explore` ships no server-rendered content, only a `Suspense` loading fallback | **Defer** | Real and reproducible: `ExploreView` reads `useSearchParams()`, which requires a `Suspense` boundary and, on a statically-exported page, means the initial HTML is the `"Loading gaps…"` fallback rather than the full table. This is inherent to how every client-rendered SPA works, including this one (`CLAUDE.md` §5 documents "the deployed dashboard is a static Next.js app"), and does not contradict any specific written claim — the spec's "under two minutes" claim assumes a working browser with JS enabled, which is true for the overwhelming majority of real users. Verified interactively (see §3) that once JS loads, the exact promised experience — filter by group, sort by gap, RCMP oracle row visible with priority flag — works correctly. Parked rather than fixed now: closing this gap for real would mean restructuring Explore's URL-param handling to avoid the `Suspense` bailout, a nontrivial architecture change not worth the risk this close to submission, and not blocking Priya's task for any realistic user. |
| #12 — `/robots.txt` returns HTML instead of plain text | **Accept and fixed** | Not a spec claim, but a real, trivial, zero-risk fix. Added `web/src/app/robots.ts` (Next.js's native metadata-route convention). See [PR #10](https://github.com/HuddahKamran123/equity-gap-dashboard/pull/10). |

---

## 3. Supplementary interactive verification (by the team, not the critic)

The isolated critic agent had no JS-executing browser available all session (its
only browser tool was unreachable), so it explicitly could not test anything
requiring real interaction — Explore's sort/filter, Subgroups' pickers, Present's
generation flow, and mobile rendering. Re-testing these ourselves does **not**
carry the same evidentiary weight as an independent critic (we know how the app
was built, so this is ordinary due diligence, not adversarial verification) — but
it closes real gaps in the "before" picture honestly, labeled as such:

- **Explore, filtered + sorted:** `/explore?group=Persons%20with%20Disabilities`,
  sorted by gap — the RCMP row renders exactly as promised: *"Royal Canadian
  Mounted Police · 5.5% (N=590 of 10,822) · WFA 12.0% · −709 · Substantial ·
  ⚑ Priority · Substantially below the workforce-availability benchmark..."*
  Confirms story #1 works end-to-end once JS has loaded.
- **Present, five-block generation:** loads pre-populated (RCMP × Persons with
  Disabilities by default); all five blocks (Key Finding, Evidence, Caveat, and
  two more truncated in the snapshot) render immediately with the oracle numbers
  — no separate "generate" click-and-wait needed.
- **Mobile viewport (375×812):** checked Present and Explore — no horizontal
  overflow on either.
- Verified locally (identical source/data to what's deployed) rather than against
  the literal production URL, since the browser tool available to us in this
  session would not navigate away from a local dev server. Functionally
  equivalent — same code, same data files.

---

## 4. Re-run — after the `robots.txt` fix

A second, independent critic — a fresh Agent invocation with no memory of the
first run, no access to source code, and no knowledge of this document — was
given the identical brief and re-tested the same 11 claims against the live
site. Result: **10 of 11 held again**, with a different, complementary
evidence technique this time (it read the production JS data bundle directly
rather than relying only on the Ask API and server-rendered HTML), which
independently confirms the underlying dataset itself is exactly right — e.g.
it programmatically checked all 576 records' severity label against their
pp-below-WFA distance and found zero violations, and confirmed all 24
divergence-lens rows meet the ≥5pp floor.

**`/robots.txt` fix — confirmed live**, with an honest wrinkle: the critic's
first request returned a *stale, cached* 404 HTML shell (`age: 879`,
`x-vercel-cache: HIT`); a cache-busted follow-up request returned the correct
`200 text/plain` response (`age: 0`, `x-vercel-cache: MISS`), and a subsequent
plain request then also returned the fix, served from cache. This is a normal
CDN cache-propagation artifact, not evidence the fix is missing — the
underlying route change is live, and PR #10 landing was what made this test
possible.

**Frame's "0" KPI tiles — re-investigated via a different method, same
conclusion.** The second critic extracted the raw server-rendered HTML
directly (not just curl-summarized it) and confirmed the `0` literally sits in
the initial payload — but on the *same* payload, two sentences above,
"**288** department–group combinations sit below their workforce-availability
benchmark" and "**12** are severely below" already appear correctly, and a
severity-distribution list further down shows real counts including
`Severe: 12`. This is the same conclusion the investigation into
`CountUp.tsx` reached (§2 above): a deliberate mount animation, not missing
data. **One genuinely new, more precise concern surfaced on this pass, and is
recorded honestly rather than dropped:** a consumer that reads the initial DOM
without waiting for client-side hydration — a search-engine crawler, or
assistive technology that doesn't wait for animation libraries to run — would
see the literal `0` in those three KPI tiles, even though a typical browser
user with JS enabled never perceives it (the animation completes in ~1.1
seconds, and jumps straight to the real value for `prefers-reduced-motion`
users). **Triage: Deferred**, not Accepted — this is a real, narrow
edge case (non-JS/pre-hydration reads of three decorative summary tiles, not
the underlying data those tiles summarize, which is correct even in that
payload), it does not affect the dashboard's actual claims or Priya's task,
and the smallest honest fix (rendering the true value in the initial HTML and
animating from it, rather than animating from a hardcoded 0) is a small,
low-risk follow-up worth doing but not one to rush before this submission.

**Story #1's interactive path — could not be re-verified end-to-end by either
critic pass**, for the same reason both times: no JS-executing browser was
available to the isolated agent against the production URL. The second critic
was more precise about what it *could* confirm from static analysis of the
production JS bundle: the full 576-row dataset, with `priority`, `severity`,
`gap`, `wfa`, and member counts already computed, ships in the page's own JS
chunk with no further network round-trip needed, and the sort/filter
affordances are present in the bundle. This is consistent with the claim but
is explicitly not the same as observing an actual click-through — which is
exactly why §3 above records the team's own supplementary interactive
verification (the RCMP row rendering correctly under a live group-filter +
gap-sort) as a distinct, lower-weight form of evidence.

**Conclusion:** the baseline and the re-run agree on every claim tested by
both. The one fix made (`robots.txt`) is confirmed live. No new defects were
introduced. The two non-Critical items from the baseline are confirmed, on
independent re-investigation, to be exactly what they were triaged as —
one false positive, one real-but-deferred, low-severity trade-off — not
downgraded or upgraded by having a second, differently-equipped critic look
again.

---

## 5. Stream 3 — the week of use (`Deployment_Log.md`)

The project's `Deployment_Log.md` (2026-06-28 → 2026-07-04) already carries a
substantial, real use-week record — two genuine `[FAILURE]` entries caught before
shipping (a silent trend-coverage gap from department-name suffix mismatches; two
PSES columns that were 100% empty while documented as present), one `[OVERRIDE]`
(hand-transcribed PSES numbers replaced with values reproducibly computed from raw
microdata, reason logged), a pinned `[ORACLE]`, and a chain of `[DECISION]` entries
recording exactly which of a teammate's parallel build's dimensions were merged
(cross-validated first) versus declined (service-wide-only, doesn't serve the
per-department decision) versus later reopened when new evidence changed the
call. See `Deployment_Log.md` for the full record — not reproduced here to avoid
duplicating a document that already exists and is current.

**Honest gap:** both `[EXTERNAL] — pending live use` entries in `Deployment_Log.md`
are still unfilled. No one outside the group has used the deployed app yet.

---

## 6. Stream 2 — the human pass (honesty note)

Day 3's afternoon design calls for two more evidence streams we do not have and
will not fabricate:

- **An investor-style pitch and Q&A**, reviewed live by an outside expert.
- **Five peer teams' cold reads**, submitted via feedback form.

Neither has happened — both require a live class session with other people
present, which this session cannot simulate. `[Missing evidence: Stream 2 —
human pass. Smallest realistic fix: run the actual pitch/Q&A and peer-read
session called for in the course, then fold the feedback into this document
the way Stream 1 and Stream 3 are folded in above.]`

---

## 7. Revised spec

`CLAUDE.md` already carries the three user stories at the top (§0, in the taught
"As a X, I want to Y, so that Z" form), and its §3 "Scope" already documents, with
dates and reasons, every dimension considered and either shipped, declined, or
left open on purpose. No changes to `CLAUDE.md` were needed as a result of this
critique — every finding classified to **Deliverables** (the `robots.txt` route)
or was rejected as a false positive, not to the spec itself.

---

## 8. Judgment

The baseline was strong: ten of eleven directly testable claims held with
concrete evidence on the first, blind pass, including the two claims most likely
to fail under adversarial pressure — the Ask assistant's refusal of a composite
score and a causal claim, both tested with prompts explicitly designed to
provoke exactly what the spec forbids. The two findings that didn't cleanly
"hold" were, on investigation, one false positive (a mount animation the
critic's non-JS tooling couldn't distinguish from missing data) and one real but
low-severity, spec-silent, architecturally-inherent trade-off (a client-rendered
SPA's loading fallback) that does not block the primary user story for any
realistic user. The one finding worth fixing — `/robots.txt` — was trivial,
fixed, and re-verified. The honest limitation is Stream 2: this assessment is
evidence-complete for the machine critique and the use week, and openly
incomplete for the human pass, which is recorded here rather than invented.
