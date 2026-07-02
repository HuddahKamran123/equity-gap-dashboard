"use client";

import { useMemo, useState } from "react";
import { SeverityTag } from "@/components/ui/SeverityTag";
import { divergenceRows, multiGroupGaps, rowsForYear } from "@/lib/data";
import { GROUP_SHORT, fmtGap, fmtPct, severityMeta } from "@/lib/format";
import { CURRENT_YEAR, GROUPS, PSES_LABELS, type Row } from "@/lib/types";

export default function CompareView() {
  const [multiOnly, setMultiOnly] = useState(false);

  const divergence = useMemo(() => divergenceRows(CURRENT_YEAR), []);

  const { departments, cell } = useMemo(() => {
    const rows = rowsForYear(CURRENT_YEAR);
    const cell = new Map<string, Row>();
    for (const r of rows) cell.set(`${r.department}|${r.group}`, r);
    const multi = new Set(multiGroupGaps(CURRENT_YEAR).map((m) => m.department));
    const depts = [...new Set(rows.map((r) => r.department))]
      .map((d) => {
        const ds = GROUPS.map((g) => cell.get(`${d}|${g}`));
        const belowCount = ds.filter((r) => r && r.gap !== null && r.gap < 0).length;
        const ppSum = ds.reduce((a, r) => a + (r?.pp_below && r.pp_below > 0 ? r.pp_below : 0), 0);
        return { d, belowCount, ppSum, multi: multi.has(d) };
      })
      .filter((x) => (multiOnly ? x.multi : true))
      .sort((a, b) => b.belowCount - a.belowCount || b.ppSum - a.ppSum);
    return { departments: depts, cell };
  }, [multiOnly]);

  const multiCount = multiGroupGaps(CURRENT_YEAR).length;

  return (
    <div className="animate-fade-up">
      <header className="border-b border-rule pb-5">
        <p className="tracking-cap text-[11px] text-muted">Compare · 2024–25</p>
        <h2 className="font-display mt-2 text-[1.8rem] leading-tight text-ink">
          Cross-cutting patterns
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Two things the ranked list can&apos;t show: where a department has{" "}
          <em>met</em> representation for a group but the lived experience lags
          (divergence), and where shortfalls compound across several groups at
          once. Each group keeps its own benchmark — never summed into one score.
        </p>
      </header>

      {/* Divergence — representation met, experience lagging */}
      <section className="mt-8">
        <h3 className="font-display text-xl text-ink">Representation met, experience lagging</h3>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
          <strong className="text-ink">{divergence.length}</strong> department–group
          combinations sit <span className="text-sev-above">at or above</span> their
          representation benchmark, yet score materially below the{" "}
          <em>same group&apos;s</em> public-service average on harassment or
          discrimination. That points to <strong className="text-ink">retention and
          workplace-inclusion</strong> review — not recruitment. The two signals are
          shown side by side; they are never combined into one score, and no cause is
          implied.
        </p>

        <ul className="mt-4 divide-y divide-rule">
          {divergence.slice(0, 14).map((r) => (
            <li
              key={`${r.department}-${r.group}`}
              className="grid grid-cols-1 gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[1.5fr_minmax(150px,1fr)_1.2fr] sm:items-center"
            >
              <div className="min-w-0">
                <span className="block truncate text-[14px] text-ink">{r.department}</span>
                <span className="text-[12px] text-muted">{GROUP_SHORT[r.group]}</span>
              </div>
              <div className="tnum text-[12px] text-muted">
                <span className="text-sev-above">{fmtPct(r.rep_pct)}</span> ({fmtGap(r.gap)}) · WFA{" "}
                {fmtPct(r.wfa)}
              </div>
              <div className="flex items-center gap-2">
                <div aria-hidden className="relative h-2 w-full max-w-[110px] rounded-[2px] bg-paper-sunken">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[2px] bg-sev-substantial"
                    style={{ width: `${Math.min(100, ((r.divergence_shortfall ?? 0) / 20) * 100)}%` }}
                  />
                </div>
                <span className="tnum whitespace-nowrap text-[12px] text-sev-substantial">
                  {r.divergence_indicator ? PSES_LABELS[r.divergence_indicator].split(" ")[0] : ""}{" "}
                  {r.divergence_shortfall} pp below
                </span>
              </div>
            </li>
          ))}
        </ul>
        {divergence.length > 14 && (
          <p className="mt-2 text-[12px] text-faint">…and {divergence.length - 14} more.</p>
        )}
      </section>

      {/* Compounding shortfalls heatmap */}
      <section className="mt-12 border-t border-rule pt-8">
        <h3 className="font-display text-xl text-ink">Where shortfalls compound across groups</h3>
        <p className="mt-1 max-w-2xl text-[13px] text-muted">
          A department below benchmark for two or more groups may warrant a broader
          look. <strong className="text-ink">{multiCount}</strong> are below for ≥2.
          Colour shows distance below benchmark; the number is percentage points.
        </p>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[13px] text-muted">
          <input
            type="checkbox"
            checked={multiOnly}
            onChange={(e) => setMultiOnly(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          Show only departments below for ≥2 groups
        </label>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <caption className="sr-only">
              Severity of representation shortfall by department and designated group,
              2024–25. Higher percentage points means further below benchmark.
            </caption>
            <thead>
              <tr className="border-b border-rule-strong text-left">
                <th scope="col" className="py-2 pr-4 font-medium text-muted">Department</th>
                {GROUPS.map((g) => (
                  <th key={g} scope="col" className="px-2 py-2 text-center font-medium text-muted">
                    {GROUP_SHORT[g]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map(({ d }) => (
                <tr key={d} className="border-b border-rule hover:bg-paper-raised">
                  <th scope="row" className="max-w-[16rem] truncate py-1.5 pr-4 text-left font-normal text-ink">
                    {d}
                  </th>
                  {GROUPS.map((g) => (
                    <HeatCell key={g} row={cell.get(`${d}|${g}`)} dept={d} group={GROUP_SHORT[g]} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
          <span className="tracking-cap text-[10px] text-faint">Legend</span>
          {(["above", "slight", "moderate", "substantial", "severe"] as const).map((s) => (
            <SeverityTag key={s} severity={s} />
          ))}
          <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
            <span
              aria-hidden
              className="h-3 w-3 rounded-[2px] bg-[repeating-linear-gradient(45deg,var(--color-paper-sunken),var(--color-paper-sunken)_3px,transparent_3px,transparent_6px)]"
            />
            suppressed
          </span>
        </div>
      </section>
    </div>
  );
}

function HeatCell({ row, dept, group }: { row?: Row; dept: string; group: string }) {
  if (!row || row.suppressed || row.severity === null) {
    return (
      <td className="px-1 py-1.5 text-center">
        <span
          aria-label={`${dept}, ${group}: suppressed`}
          className="mx-auto block h-7 w-full max-w-[5rem] rounded-[2px] bg-[repeating-linear-gradient(45deg,var(--color-paper-sunken),var(--color-paper-sunken)_3px,transparent_3px,transparent_6px)]"
        />
      </td>
    );
  }
  const m = severityMeta(row.severity);
  const label =
    row.severity === "above"
      ? `${dept}, ${group}: at or above benchmark, representation ${fmtPct(row.rep_pct)}`
      : `${dept}, ${group}: ${m.label.toLowerCase()} below benchmark, ${row.pp_below?.toFixed(1)} percentage points, representation ${fmtPct(row.rep_pct)}`;
  return (
    <td className="px-1 py-1.5 text-center">
      <span
        title={label}
        aria-label={label}
        className={`mx-auto flex h-7 w-full max-w-[5rem] items-center justify-center rounded-[2px] border ${m.border} ${m.bgSoft} ${m.text} tnum text-[12px] font-medium`}
      >
        {row.severity === "above" ? "✓" : row.pp_below?.toFixed(1)}
      </span>
    </td>
  );
}
