"use client";

import { useMemo, useState } from "react";
import {
  SERVICE_WIDE_CONTEXT,
  SERVICE_WIDE_CONTEXT_META,
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
} from "@/lib/types";

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

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
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
      )}
    </section>
  );
}

function SubgroupTable({ title, rows }: { title: string; rows: SubgroupBreakdownRow[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-ink">{title}</h4>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-rule text-left text-[10px] tracking-cap text-faint">
              <th className="py-2 pr-4 font-normal">Subgroup</th>
              <th className="py-2 pr-4 font-normal">Overall</th>
              <th className="py-2 pr-4 font-normal">Executive</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.subgroup} className="border-b border-rule">
                <td className="py-2 pr-4 text-muted">{r.subgroup}</td>
                <td className="tnum py-2 pr-4 text-ink">
                  {r.overall_pct !== null ? `${r.overall_pct}%` : "—"}
                  {r.overall_n !== null && (
                    <span className="text-faint"> ({r.overall_n.toLocaleString("en-CA")})</span>
                  )}
                </td>
                <td className="tnum py-2 pr-4 text-ink">
                  {r.executive_pct !== null ? `${r.executive_pct}%` : "—"}
                  {r.executive_n !== null && (
                    <span className="text-faint"> ({r.executive_n.toLocaleString("en-CA")})</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
