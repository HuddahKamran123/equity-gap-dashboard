"use client";

import { useMemo, useState } from "react";
import {
  SERVICE_WIDE_CONTEXT,
  SERVICE_WIDE_CONTEXT_META,
  SUBGROUP_PSES_META,
  departmentsForYear,
  subgroupPsesFor,
} from "@/lib/data";
import { GROUP_SHORT, fmtSubgroupCell } from "@/lib/format";
import {
  CURRENT_YEAR,
  GROUPS,
  SUBGROUP_PSES_THEME_LABELS,
  SUBGROUP_PSES_THEMES,
  type DistributionRow,
  type Group,
  type SubgroupBreakdownRow,
  type SubgroupPsesEntry,
} from "@/lib/types";

// A subgroup's harassment score at least this many points below the group's
// own overall score is worth flagging — same floor as the divergence lens
// elsewhere in the app (pipeline/build_dataset.py's DIVERGENCE_MARGIN).
const DIVERGENCE_MARGIN = 5.0;

export default function SubgroupsView() {
  return (
    <div className="animate-fade-up">
      <header className="border-b border-rule pb-5">
        <p className="tracking-cap text-[11px] text-muted">Subgroups · 2024–25</p>
        <h2 className="font-display mt-2 text-[1.8rem] leading-tight text-ink">
          Below the four designated groups
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Two different, non-comparable sources, kept separate on purpose: real
          per-department workplace-experience scores for specific subgroups
          (below), and real but service-wide-only representation breakdowns
          (further down). Neither has per-department subgroup{" "}
          <em>representation</em> — that data doesn&apos;t exist anywhere.
        </p>
      </header>

      <DepartmentSubgroupSection />

      <section className="mt-14 border-t border-rule pt-8">
        <h3 className="font-display text-xl text-ink">
          Service-wide reference (not per-department)
        </h3>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
          {SERVICE_WIDE_CONTEXT_META.scope_note}
        </p>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-faint">
          {SERVICE_WIDE_CONTEXT_META.data_quality_note}
        </p>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <SubgroupTable
            title={`Racialized subgroups · ${SERVICE_WIDE_CONTEXT.racialized_subgroups.fiscal_year}`}
            rows={SERVICE_WIDE_CONTEXT.racialized_subgroups.rows}
          />
          <SubgroupTable
            title={`Indigenous subgroups · ${SERVICE_WIDE_CONTEXT.indigenous_subgroups.fiscal_year}`}
            rows={SERVICE_WIDE_CONTEXT.indigenous_subgroups.rows}
          />
          <SubgroupTable
            title={`Disability subgroups · ${SERVICE_WIDE_CONTEXT.disability_subgroups.fiscal_year}`}
            rows={SERVICE_WIDE_CONTEXT.disability_subgroups.rows}
          />
          <DistributionTable
            title={`Salary distribution · ${SERVICE_WIDE_CONTEXT.salary_distribution.fiscal_year}`}
            rows={SERVICE_WIDE_CONTEXT.salary_distribution.rows}
          />
          <DistributionTable
            title={`Age distribution · ${SERVICE_WIDE_CONTEXT.age_distribution.fiscal_year}`}
            rows={SERVICE_WIDE_CONTEXT.age_distribution.rows}
          />
        </div>

        <div className="mt-8">
          <h4 className="text-sm font-medium text-ink">
            Workforce-availability benchmark history
          </h4>
          <p className="mt-1 text-[12px] text-muted">
            How the census-based benchmark has shifted across survey editions.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-rule text-left text-[10px] tracking-cap text-faint">
                  <th className="py-2 pr-4 font-normal">Benchmark</th>
                  <th className="py-2 pr-4 font-normal">Women</th>
                  <th className="py-2 pr-4 font-normal">Indigenous</th>
                  <th className="py-2 pr-4 font-normal">Disability</th>
                  <th className="py-2 pr-4 font-normal">Vis. minorities</th>
                </tr>
              </thead>
              <tbody>
                {SERVICE_WIDE_CONTEXT.wfa_benchmark_history.map((b) => (
                  <tr key={b.benchmark} className="border-b border-rule">
                    <td className="max-w-xs py-2 pr-4 text-muted">{b.benchmark}</td>
                    <td className="tnum py-2 pr-4 text-ink">{b.women}</td>
                    <td className="tnum py-2 pr-4 text-ink">{b.indigenous ?? "—"}</td>
                    <td className="tnum py-2 pr-4 text-ink">{b.disability ?? "—"}</td>
                    <td className="tnum py-2 pr-4 text-ink">{b.visible_minorities ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function DepartmentSubgroupSection() {
  const departments = useMemo(() => departmentsForYear(CURRENT_YEAR), []);
  const [dept, setDept] = useState("Royal Canadian Mounted Police");
  const [group, setGroup] = useState<Group>("Persons with Disabilities");

  const entries = useMemo(() => subgroupPsesFor(dept, group), [dept, group]);
  const groupLevel = entries.find((e) => e.subgroup === null) ?? null;
  const insight = useMemo(() => subgroupInsight(entries, group), [entries, group]);

  return (
    <section className="mt-8">
      <h3 className="font-display text-xl text-ink">By department</h3>
      <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
        Workplace-experience scores across 6 themes and 3 survey cycles
        (2020/2022/2024), from a cross-validated external source — not
        independently re-derived by this dashboard&apos;s own pipeline. Only
        departments and groups covered by that source will show results.
      </p>

      <div className="my-5 grid gap-3 sm:grid-cols-2">
        <label className="text-[13px] text-muted">
          Department
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="mt-1 block w-full rounded-sm border border-rule-strong bg-paper-raised px-3 py-2 text-[14px] text-ink"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] text-muted">
          Designated group
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as Group)}
            className="mt-1 block w-full rounded-sm border border-rule-strong bg-paper-raised px-3 py-2 text-[14px] text-ink"
          >
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-sm border border-rule bg-paper-raised p-4 text-[13px] text-muted">
          No subgroup experience data for this department × group combination
          in the external source.
        </p>
      ) : (
        <>
          {groupLevel && (
            <div className="mb-8 rounded-sm border border-rule bg-paper-raised p-4">
              <p className="tracking-cap mb-3 text-[10px] text-faint">
                {GROUP_SHORT[group]} overall · 2024 · vs. public-service-wide average
              </p>
              <ThemeBarChart entry={groupLevel} />
            </div>
          )}

          {insight && (
            <p className="mb-5 rounded-sm border border-sev-substantial/40 bg-paper-raised p-3 text-[13px] leading-relaxed text-ink-soft">
              <strong className="text-ink">Signal: </strong>
              {insight}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-rule-strong text-left text-[10px] tracking-cap text-faint">
                  <th className="py-2 pr-4 font-normal">Subgroup</th>
                  {SUBGROUP_PSES_THEMES.map((t) => (
                    <th key={t} className="py-2 pr-4 font-normal">
                      {SUBGROUP_PSES_THEME_LABELS[t]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.subgroup ?? "__group__"} className="border-b border-rule">
                    <td className="py-2 pr-4 text-ink">
                      {e.subgroup ?? `All ${GROUP_SHORT[group]}`}
                      {e.n !== null && (
                        <span className="ml-1 text-faint">(n={e.n})</span>
                      )}
                    </td>
                    {SUBGROUP_PSES_THEMES.map((t) => (
                      <td key={t} className="tnum py-2 pr-4 text-muted">
                        {e.themes[t].map(fmtSubgroupCell).join(" · ")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] leading-relaxed text-faint">
              Each cell reads 2020 · 2022 · 2024. &quot;n/s&quot; = not surveyed
              that cycle; &quot;suppressed&quot; = surveyed, below reporting
              threshold — the two are not the same.
            </p>
          </div>
        </>
      )}
    </section>
  );
}

/** Horizontal bar per theme: this entry's 2024 score, with a tick mark for
 * the public-service-wide average of that theme (context, not a benchmark). */
function ThemeBarChart({ entry }: { entry: SubgroupPsesEntry }) {
  const psAvg = SUBGROUP_PSES_META.ps_wide_average;
  return (
    <div className="space-y-2">
      {SUBGROUP_PSES_THEMES.map((t) => {
        const cell = entry.themes[t][2]; // 2024
        const value = typeof cell === "number" ? cell : null;
        const avg = psAvg[t];
        return (
          <div key={t} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-[11px] text-muted">
              {SUBGROUP_PSES_THEME_LABELS[t]}
            </span>
            <div className="relative h-3 flex-1 rounded-[2px] bg-paper-sunken">
              {value !== null && (
                <div
                  className="absolute inset-y-0 left-0 rounded-[2px] bg-accent"
                  style={{ width: `${Math.min(100, value)}%` }}
                />
              )}
              <div
                className="absolute inset-y-0 w-px bg-ink"
                style={{ left: `${Math.min(100, avg)}%` }}
                title={`PS-wide average: ${avg}`}
              />
            </div>
            <span className="tnum w-16 shrink-0 text-right text-[12px] text-ink">
              {value !== null ? value.toFixed(0) : fmtSubgroupCell(cell)}
            </span>
          </div>
        );
      })}
      <p className="text-[11px] text-faint">
        Bar = 2024 score (0–100). Vertical line = public-service-wide average
        for that theme.
      </p>
    </div>
  );
}

/** Flags the subgroup whose harassment score diverges most from the group's
 * own overall score — a within-group comparison, not a claim about cause. */
function subgroupInsight(entries: SubgroupPsesEntry[], group: Group): string | null {
  const groupLevel = entries.find((e) => e.subgroup === null);
  const groupScore = groupLevel?.themes.harassment[2];
  if (typeof groupScore !== "number") return null;

  let worst: { subgroup: string; score: number; gap: number } | null = null;
  for (const e of entries) {
    if (e.subgroup === null) continue;
    const score = e.themes.harassment[2];
    if (typeof score !== "number") continue;
    const gap = groupScore - score;
    if (gap >= DIVERGENCE_MARGIN && (!worst || gap > worst.gap)) {
      worst = { subgroup: e.subgroup, score, gap: Math.round(gap * 10) / 10 };
    }
  }
  if (!worst) return null;
  return `Within ${GROUP_SHORT[group]}, ${worst.subgroup} reports a harassment score ${worst.gap} points below the group's own overall score (${worst.score} vs. ${groupScore}) — worth a closer look at whether this subgroup's experience differs from the group as a whole.`;
}

function SubgroupTable({ title, rows }: { title: string; rows: SubgroupBreakdownRow[] }) {
  const maxPct = Math.max(0, ...rows.map((r) => r.overall_pct ?? 0));
  const insight = execGapInsight(rows);
  return (
    <div>
      <h4 className="text-sm font-medium text-ink">{title}</h4>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.subgroup} className="text-[12px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted">{r.subgroup}</span>
              <span className="tnum text-ink">
                {r.overall_pct !== null ? `${r.overall_pct}%` : "—"}
                {r.overall_n !== null && (
                  <span className="text-faint"> ({r.overall_n.toLocaleString("en-CA")})</span>
                )}
                {r.executive_pct !== null && (
                  <span className="ml-2 text-faint">exec {r.executive_pct}%</span>
                )}
              </span>
            </div>
            <div className="relative mt-1 h-2 rounded-[2px] bg-paper-sunken">
              {r.overall_pct !== null && (
                <div
                  className="absolute inset-y-0 left-0 rounded-[2px] bg-accent"
                  style={{ width: maxPct ? `${(r.overall_pct / maxPct) * 100}%` : "0%" }}
                />
              )}
              {r.executive_pct !== null && (
                <div
                  className="absolute inset-y-0 w-px bg-sev-severe"
                  style={{ left: maxPct ? `${(r.executive_pct / maxPct) * 100}%` : "0%" }}
                  title={`Executive: ${r.executive_pct}%`}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-faint">
        Bar = overall representation %. Red line = executive representation %.
      </p>
      {insight && (
        <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
          <strong className="text-ink">Signal: </strong>
          {insight}
        </p>
      )}
    </div>
  );
}

/** Flags the subgroup with the largest gap between overall and executive
 * representation — a descriptive comparison of two published figures, not a
 * causal or staffing claim. */
function execGapInsight(rows: SubgroupBreakdownRow[]): string | null {
  let worst: { subgroup: string; overall: number; exec: number; gap: number } | null = null;
  for (const r of rows) {
    if (r.overall_pct === null || r.executive_pct === null) continue;
    const gap = r.overall_pct - r.executive_pct;
    if (gap > 0 && (!worst || gap > worst.gap)) {
      worst = { subgroup: r.subgroup, overall: r.overall_pct, exec: r.executive_pct, gap };
    }
  }
  if (!worst || worst.gap < 1) return null;
  return `${worst.subgroup} shows the widest overall-to-executive gap here: ${worst.overall}% overall representation vs. ${worst.exec}% at the executive level.`;
}

function DistributionTable({ title, rows }: { title: string; rows: DistributionRow[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-ink">{title}</h4>
      <div className="mt-3 max-h-64 overflow-y-auto overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[12px]">
          <thead className="sticky top-0 bg-paper">
            <tr className="border-b border-rule text-left text-[10px] tracking-cap text-faint">
              <th className="py-2 pr-4 font-normal">Band</th>
              <th className="py-2 pr-4 font-normal">All</th>
              <th className="py-2 pr-4 font-normal">Women</th>
              <th className="py-2 pr-4 font-normal">Indig.</th>
              <th className="py-2 pr-4 font-normal">Disab.</th>
              <th className="py-2 pr-4 font-normal">Vis. min.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.band} className="border-b border-rule">
                <td className="py-2 pr-4 text-muted">{r.band}</td>
                <td className="tnum py-2 pr-4 text-ink">{r.all_employees ?? "—"}</td>
                <td className="tnum py-2 pr-4 text-ink">{r.women ?? "—"}</td>
                <td className="tnum py-2 pr-4 text-ink">{r.indigenous ?? "—"}</td>
                <td className="tnum py-2 pr-4 text-ink">{r.disability ?? "—"}</td>
                <td className="tnum py-2 pr-4 text-ink">{r.visible_minorities ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
