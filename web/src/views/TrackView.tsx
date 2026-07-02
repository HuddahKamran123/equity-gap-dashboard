"use client";

import { useMemo, useState } from "react";
import { historyFor, rowsForYear } from "@/lib/data";
import { GROUP_SHORT, MINUS, fmtPct, severityMeta } from "@/lib/format";
import { classifyTrend, type TrendLabel } from "@/lib/signal";
import { CURRENT_YEAR, GROUPS, type Group, type HistoryEntry, type Row } from "@/lib/types";

type Filter = "all" | Group;

const TREND_RANK: Record<TrendLabel, number> = {
  Worsening: 0,
  "Benchmark-driven narrowing": 1,
  Stable: 2,
  "Genuine improvement": 3,
};
const TREND_STYLE: Record<TrendLabel, string> = {
  Worsening: "text-sev-severe border-sev-severe bg-sev-severe/10",
  "Benchmark-driven narrowing": "text-sev-moderate border-sev-moderate bg-sev-moderate/10",
  Stable: "text-muted border-rule-strong bg-paper-sunken",
  "Genuine improvement": "text-sev-above border-sev-above bg-sev-above/10",
};

// fallback 2-point trajectory from the current row when no multi-year history exists
function fallbackHistory(row: Row): HistoryEntry[] {
  const priorWfaByGroup: Record<Group, number> = {
    Women: 55.3,
    "Indigenous Peoples": 4.1,
    "Persons with Disabilities": 12.0,
    "Members of Visible Minorities": 22.7,
  };
  return [
    { year: "2023-2024", rep: row.prior_rep_pct, wfa: priorWfaByGroup[row.group], gap: row.prior_gap, sev: null, n: null, all: null, era: "B", supp: row.prior_rep_pct === null },
    { year: "2024-2025", rep: row.rep_pct, wfa: row.wfa ?? 0, gap: row.gap, sev: row.severity, n: row.members, all: row.all_employees, era: "B", supp: row.suppressed },
  ];
}

export default function TrackView() {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(() => {
    let r = rowsForYear(CURRENT_YEAR).filter((x) => x.has_trend && x.rep_pct !== null);
    if (filter !== "all") r = r.filter((x) => x.group === filter);
    return r
      .map((row) => ({
        row,
        trend: classifyTrend(row)!,
        hist: historyFor(row.department, row.group) ?? fallbackHistory(row),
      }))
      .filter((x) => x.trend)
      .sort(
        (a, b) =>
          TREND_RANK[a.trend.label] - TREND_RANK[b.trend.label] ||
          (b.row.pp_below ?? -99) - (a.row.pp_below ?? -99),
      );
  }, [filter]);

  const anyFourYear = items.some((x) => x.hist.length >= 3);

  return (
    <div className="animate-fade-up">
      <header className="border-b border-rule pb-5">
        <p className="tracking-cap text-[11px] text-muted">Track · 2021–22 → 2024–25</p>
        <h2 className="font-display mt-2 text-[1.8rem] leading-tight text-ink">
          Year-over-year movement
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Representation over up to four years (the dotted line is the benchmark).
          A narrowing gap is not always progress — the availability benchmark was{" "}
          <strong className="text-ink">rebased in 2023-24</strong> (marked ⟩ on the
          line), so a gap change across that point reflects the benchmark, not
          hiring. Representation % itself is benchmark-independent — that trend is
          clean. The label classifies only the latest same-benchmark year.
        </p>
      </header>

      <div className="my-4 flex flex-wrap gap-1.5">
        {([{ key: "all", label: "All groups" }, ...GROUPS.map((g) => ({ key: g, label: GROUP_SHORT[g] }))] as { key: Filter; label: string }[]).map(
          (f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-sm border px-2.5 py-1 text-[12px] transition-colors ${
                filter === f.key
                  ? "border-ink bg-ink text-paper"
                  : "border-rule-strong text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ),
        )}
      </div>

      <ul className="divide-y divide-rule">
        {items.map(({ row, trend, hist }) => (
          <li
            key={`${row.department}-${row.group}`}
            className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[1.2fr_minmax(170px,1fr)_1.4fr] sm:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-[14px] text-ink">{row.department}</p>
              <p className="text-[12px] text-muted">
                {GROUP_SHORT[row.group]}
                {hist.length >= 3 && <span className="text-faint"> · {hist.length}-year</span>}
              </p>
            </div>

            <Trajectory hist={hist} severity={severityMeta(row.severity).fill} />

            <div>
              <span
                className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${TREND_STYLE[trend.label]}`}
              >
                {trend.label}
              </span>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{trend.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      {!anyFourYear && (
        <p className="mt-4 text-[12px] text-faint">
          Showing two-year movement for this selection; four-year trajectories appear
          where a department is unambiguously the same entity across years.
        </p>
      )}
    </div>
  );
}

const W = 168;
const H = 46;

function Trajectory({ hist, severity }: { hist: HistoryEntry[]; severity: string }) {
  const withRep = hist.filter((e) => e.rep !== null);
  const delta =
    withRep.length >= 2 ? (withRep[withRep.length - 1].rep as number) - (withRep[0].rep as number) : 0;

  if (withRep.length < 2) {
    return <div className="text-[12px] text-faint">insufficient history</div>;
  }

  const vals = [...hist.map((e) => e.wfa), ...withRep.map((e) => e.rep as number)];
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const pad = (hi - lo) * 0.18 || 1;
  const y0 = lo - pad;
  const y1 = hi + pad;
  const n = hist.length;
  const x = (i: number) => (n === 1 ? W / 2 : 6 + (i / (n - 1)) * (W - 12));
  const y = (v: number) => H - 6 - ((v - y0) / (y1 - y0)) * (H - 12);

  const repPts = hist.map((e, i) => (e.rep === null ? null : `${x(i)},${y(e.rep)}`)).filter(Boolean) as string[];
  const wfaPts = hist.map((e, i) => `${x(i)},${y(e.wfa)}`);
  const boundary = hist.findIndex((e, i) => i > 0 && e.era === "B" && hist[i - 1].era === "A");

  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="shrink-0"
        role="img"
        aria-label={`Representation trajectory: ${withRep.map((e) => `${e.year} ${e.rep}%`).join(", ")}`}
      >
        {/* benchmark (WFA) — dashed */}
        <polyline points={wfaPts.join(" ")} fill="none" stroke="var(--color-faint)" strokeWidth="1" strokeDasharray="3 2" />
        {/* representation — solid */}
        <polyline points={repPts.join(" ")} fill="none" stroke="var(--color-ink-soft)" strokeWidth="1.5" />
        {/* benchmark-rebase boundary */}
        {boundary > 0 && (
          <line
            x1={(x(boundary - 1) + x(boundary)) / 2}
            x2={(x(boundary - 1) + x(boundary)) / 2}
            y1="2"
            y2={H - 2}
            stroke="var(--color-rule-strong)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
        {/* points */}
        {hist.map((e, i) =>
          e.rep === null ? null : (
            <circle
              key={i}
              cx={x(i)}
              cy={y(e.rep)}
              r={i === hist.length - 1 ? 3 : 2}
              fill={i === hist.length - 1 ? severity : "var(--color-ink-soft)"}
            />
          ),
        )}
      </svg>
      <span className="tnum w-20 shrink-0 text-[12px] text-muted">
        {fmtPct(withRep[0].rep, 1)} →{" "}
        <span className="text-ink">{fmtPct(withRep[withRep.length - 1].rep, 1)}</span>
        <span className={delta >= 0 ? "text-sev-above" : "text-sev-severe"}>
          {" "}
          ({delta >= 0 ? "+" : MINUS}
          {Math.abs(delta).toFixed(1)})
        </span>
      </span>
    </div>
  );
}
