"use client";

import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { SeverityTag } from "@/components/ui/SeverityTag";
import { ROWS, META, SUBGROUP_PSES_META, cpaWideExperienceByGroup, rowsForYear } from "@/lib/data";
import { GROUP_SHORT, fmtInt } from "@/lib/format";
import { CURRENT_YEAR, GROUPS, SUBGROUP_PSES_THEME_LABELS, SUBGROUP_PSES_THEMES, type Severity } from "@/lib/types";

const SEV_ORDER: Severity[] = ["severe", "substantial", "moderate", "slight", "above"];

export default function FrameView() {
  const rows = rowsForYear(CURRENT_YEAR);
  const below = rows.filter((r) => r.gap !== null && r.gap < 0);
  const priority = rows.filter((r) => r.priority);
  const severe = rows.filter((r) => r.severity === "severe");

  const sevCounts = SEV_ORDER.map((s) => ({
    s,
    n: rows.filter((r) => r.severity === s).length,
  }));
  const suppressed = rows.filter((r) => r.suppressed).length;
  const totalForBar = rows.length;
  const cpaExperience = cpaWideExperienceByGroup();

  const stats = [
    { label: "Departments & agencies", value: META.counts.depts_2024_25 },
    { label: "Designated groups", value: 4 },
    { label: "Below benchmark", value: below.length, of: rows.length },
    { label: "Flagged for review", value: priority.length },
  ];

  return (
    <div className="animate-fade-up">
      {/* hero */}
      <section className="border-b border-rule pb-10">
        <p className="tracking-cap text-[11px] text-muted">
          Fiscal year 2024–25 · {fmtInt(ROWS.length)} records
        </p>
        <h2 className="font-display mt-3 max-w-4xl text-[2rem] leading-[1.08] tracking-[-0.01em] text-ink sm:text-[3rem] sm:leading-[1.04]">
          <CountUp value={below.length} className="text-sev-substantial" /> of{" "}
          {rows.length} department–group combinations sit below their
          workforce-availability benchmark.
        </h2>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          {severe.length} are <span className="text-sev-severe">severely</span>{" "}
          below — ten or more percentage points short of where the available
          workforce would put them. This view helps an EDI policy lead decide
          where to direct limited review capacity next.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/explore"
            className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Explore the gaps →
          </Link>
          <Link
            href="/ask"
            className="rounded-sm border border-rule-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            Ask a question
          </Link>
        </div>
      </section>

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-px border-b border-rule bg-rule sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-paper px-1 py-6 sm:px-2">
            <div className="font-display text-[2.4rem] leading-none text-ink">
              <CountUp value={s.value} />
              {s.of ? (
                <span className="text-[1.1rem] text-faint"> / {s.of}</span>
              ) : null}
            </div>
            <p className="mt-2 text-[12px] leading-tight text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      {/* severity distribution */}
      <section className="grid gap-10 py-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h3 className="font-display text-xl text-ink">How far below?</h3>
          <p className="mt-1 text-[13px] text-muted">
            Distance below benchmark across all {totalForBar} department–group
            combinations, 2024–25.
          </p>
          <div className="mt-5 flex h-4 w-full overflow-hidden rounded-[2px]">
            {sevCounts.map(({ s, n }) => (
              <div
                key={s}
                className={severityFill(s)}
                style={{ width: `${(n / totalForBar) * 100}%` }}
                title={`${s}: ${n}`}
              />
            ))}
            {suppressed > 0 && (
              <div
                className="bg-paper-sunken"
                style={{ width: `${(suppressed / totalForBar) * 100}%` }}
                title={`suppressed: ${suppressed}`}
              />
            )}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {sevCounts.map(({ s, n }) => (
              <li key={s} className="flex items-center justify-between gap-2 text-[13px]">
                <SeverityTag severity={s} />
                <span className="tnum text-muted">{n}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-2 text-[13px]">
              <span className="text-faint">Suppressed</span>
              <span className="tnum text-muted">{suppressed}</span>
            </li>
          </ul>
        </div>

        {/* by group */}
        <div>
          <h3 className="font-display text-xl text-ink">By designated group</h3>
          <p className="mt-1 text-[13px] text-muted">
            Counted separately — each group is benchmarked against a different
            labour market and is never combined.
          </p>
          <ul className="mt-5 space-y-3">
            {GROUPS.map((g) => {
              const gr = rows.filter((r) => r.group === g);
              const belowN = gr.filter((r) => r.gap !== null && r.gap < 0).length;
              const pr = gr.filter((r) => r.priority).length;
              return (
                <li
                  key={g}
                  className="flex items-center justify-between border-b border-rule pb-3 text-sm"
                >
                  <span className="text-ink">{GROUP_SHORT[g]}</span>
                  <span className="text-muted">
                    <span className="tnum text-ink">{belowN}</span> below ·{" "}
                    <span className="tnum text-sev-severe">{pr}</span> flagged
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CPA-wide employee experience — aggregate context, not a ranking signal */}
      <section className="border-t border-rule py-10">
        <h3 className="font-display text-xl text-ink">
          Employee experience, CPA-wide (context only)
        </h3>
        <p className="mt-1 max-w-2xl text-[13px] text-muted">
          Unweighted average across the {SUBGROUP_PSES_META.coverage.departments_with_data}{" "}
          of {SUBGROUP_PSES_META.coverage.departments_total} departments in a
          cross-validated external source (2024 PSES cycle) — never used to rank
          departments; see a department&apos;s own row in Explore for the
          decision-relevant, per-department signal.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-rule text-left text-[10px] tracking-cap text-faint">
                <th className="py-2 pr-4 font-normal">Theme</th>
                {GROUPS.map((g) => (
                  <th key={g} className="py-2 pr-4 font-normal">
                    {GROUP_SHORT[g]}
                  </th>
                ))}
                <th className="py-2 pr-4 font-normal">PS-wide avg.</th>
              </tr>
            </thead>
            <tbody>
              {SUBGROUP_PSES_THEMES.map((theme) => (
                <tr key={theme} className="border-b border-rule">
                  <td className="py-2 pr-4 text-muted">{SUBGROUP_PSES_THEME_LABELS[theme]}</td>
                  {cpaExperience.map(({ group, averages }) => (
                    <td key={group} className="tnum py-2 pr-4 text-ink">
                      {averages[theme] ? averages[theme]!.avg.toFixed(0) : "—"}
                    </td>
                  ))}
                  <td className="tnum py-2 pr-4 text-faint">
                    {SUBGROUP_PSES_META.ps_wide_average[theme]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* how it's built — the capability flow + the output, in one line */}
      <section className="border-t border-rule py-10">
        <h3 className="font-display text-xl text-ink">How this is built</h3>
        <p className="mt-1 max-w-2xl text-[13px] text-muted">
          An agentic workspace, not a hand-built page. Data moves through four
          stages, each governed by a named capability.
        </p>
        <ol className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-4">
          {[
            { n: "01", t: "Validate", cap: "edi-data-guard", d: "a runnable check blocks a bad dataset before it enters" },
            { n: "02", t: "Build", cap: "pipeline", d: "severity, priority, divergence & trends computed in code" },
            { n: "03", t: "Interpret", cap: "guardrail skills + subagents", d: "cautious, bounded language on every signal" },
            { n: "04", t: "Present", cap: "dashboard + Ask", d: "where it reaches a human — guardrails enforced live" },
          ].map((s, i) => (
            <li key={s.n} className="bg-paper p-4">
              <div className="flex items-baseline gap-2">
                <span className="tnum text-[10px] text-faint">{s.n}</span>
                <span className="font-medium text-ink">{s.t}</span>
                {i < 3 && <span aria-hidden className="ml-auto hidden text-faint sm:inline">→</span>}
              </div>
              <p className="mt-1.5 text-[11px] text-accent">{s.cap}</p>
              <p className="mt-1 text-[12px] leading-snug text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 max-w-3xl text-[13px] leading-relaxed text-ink-soft">
          <span className="tracking-cap text-[10px] text-faint">The output · </span>
          a decision-support surface whose unit is a department–group row —
          representation with its count, the benchmark, the gap, severity, priority,
          trend, and experience context — surfaced as ranked triage, cross-cutting
          patterns, year-over-year, and a five-block briefing, plus a grounded Q&amp;A.
          Every output is a signal for human review, never a decision or a score.
        </p>
      </section>
    </div>
  );
}

function severityFill(s: Severity): string {
  return {
    above: "bg-sev-above",
    slight: "bg-sev-slight",
    moderate: "bg-sev-moderate",
    substantial: "bg-sev-substantial",
    severe: "bg-sev-severe",
  }[s];
}
