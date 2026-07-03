"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DeficitBar } from "@/components/ui/DeficitBar";
import { PriorityFlag, SeverityTag } from "@/components/ui/SeverityTag";
import { byGapAscending, rowsForYear, subgroupPsesFor } from "@/lib/data";
import { GROUP_SHORT, fmtGap, fmtN, fmtPct, fmtPP } from "@/lib/format";
import { recommendReview, signalSentence } from "@/lib/signal";
import {
  CURRENT_YEAR,
  GROUPS,
  PSES_LABELS,
  type Group,
  type Row,
  type SubgroupPsesCell,
} from "@/lib/types";

type Filter = "all" | Group;
type Sort = "gap" | "pp" | "rep";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All groups" },
  ...GROUPS.map((g) => ({ key: g as Filter, label: GROUP_SHORT[g] })),
];

export default function ExploreView() {
  const sp = useSearchParams();
  const [filter, setFilter] = useState<Filter>(
    () => (FILTERS.some((f) => f.key === sp.get("group")) ? (sp.get("group") as Filter) : "all"),
  );
  const [sort, setSort] = useState<Sort>("gap");

  function chooseFilter(f: Filter) {
    setFilter(f);
    const p = new URLSearchParams(sp.toString());
    if (f === "all") p.delete("group");
    else p.set("group", f);
    window.history.pushState(null, "", p.toString() ? `?${p.toString()}` : "/explore");
  }

  const rows = useMemo(() => {
    let r = rowsForYear(CURRENT_YEAR);
    if (filter !== "all") r = r.filter((x) => x.group === filter);
    if (sort === "gap") return byGapAscending(r);
    if (sort === "rep") {
      return [...r].sort((a, b) => {
        if (a.rep_pct === null) return 1;
        if (b.rep_pct === null) return -1;
        return b.rep_pct - a.rep_pct; // highest representation rate first
      });
    }
    return [...r].sort((a, b) => {
      if (a.pp_below === null) return 1;
      if (b.pp_below === null) return -1;
      return b.pp_below - a.pp_below; // most pp below first
    });
  }, [filter, sort]);

  const belowN = rows.filter((r) => r.gap !== null && r.gap < 0).length;

  return (
    <div className="animate-fade-up">
      <header className="border-b border-rule pb-5">
        <p className="tracking-cap text-[11px] text-muted">Explore Gaps · 2024–25</p>
        <h2 className="font-display mt-2 text-[1.8rem] leading-tight text-ink">
          Ranked by distance below benchmark
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          {belowN} of {rows.length} shown sit below the workforce-availability
          benchmark. Each bar is measured against the same benchmark line; the
          dotted stretch is the shortfall. Expand a row for the signal and the
          kind of review it points to.
        </p>
      </header>

      {/* controls */}
      <div className="sticky top-0 z-20 -mx-5 mb-1 flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-paper/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by equity group">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => chooseFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-sm border px-2.5 py-1 text-[12px] transition-colors ${
                filter === f.key
                  ? "border-ink bg-ink text-paper"
                  : "border-rule-strong text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[12px] text-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-sm border border-rule-strong bg-paper-raised px-2 py-1 text-ink"
          >
            <option value="gap">by shortfall (headcount)</option>
            <option value="pp">by distance below (pp)</option>
            <option value="rep">by representation rate</option>
          </select>
        </label>
      </div>

      {/* list header (desktop) */}
      <div className="hidden grid-cols-[2rem_minmax(0,1fr)_minmax(150px,1fr)_5rem_13rem] gap-4 border-b border-rule px-2 py-2 text-[10px] tracking-cap text-faint lg:grid">
        <span>#</span>
        <span>Department · Group</span>
        <span>Representation vs. benchmark</span>
        <span className="text-right">Gap</span>
        <span>Severity</span>
      </div>

      <ol>
        {rows.map((row, i) => (
          <ExploreRow key={`${row.department}-${row.group}`} row={row} rank={i + 1} showGroup={filter === "all"} />
        ))}
      </ol>
    </div>
  );
}

/** 2020/2022/2024 harassment triplet, distinguishing suppressed (surveyed, below
 * threshold) from null (not surveyed that cycle) — never rendered the same way. */
function fmtSubgroupCell(cell: SubgroupPsesCell): string {
  if (cell === "suppressed") return "suppressed";
  if (cell === null) return "n/s";
  return cell.toFixed(0);
}

function ExploreRow({ row, rank, showGroup }: { row: Row; rank: number; showGroup: boolean }) {
  const rec = recommendReview(row);
  const subgroupEntries = subgroupPsesFor(row.department, row.group);
  return (
    <li className="border-b border-rule" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 64px" }}>
      <details className="group">
        <summary className="grid cursor-pointer list-none grid-cols-[2rem_1fr] items-center gap-x-4 gap-y-2 px-2 py-3 hover:bg-paper-raised lg:grid-cols-[2rem_minmax(0,1fr)_minmax(150px,1fr)_5rem_13rem]">
          <span className="tnum text-[12px] text-faint">{rank}</span>

          <span className="min-w-0">
            <span className="block truncate text-[14px] text-ink">{row.department}</span>
            <span className="text-[12px] text-muted">
              {showGroup ? `${GROUP_SHORT[row.group]} · ` : ""}
              {row.suppressed ? (
                "count suppressed"
              ) : (
                <>
                  {fmtPct(row.rep_pct)}{" "}
                  <span className="text-faint">({fmtN(row.members, row.all_employees)})</span> ·
                  WFA {fmtPct(row.wfa)}
                </>
              )}
            </span>
          </span>

          <span className="col-span-2 lg:col-span-1">
            <DeficitBar row={row} />
          </span>

          <span className="tnum justify-self-start text-[15px] lg:justify-self-end lg:text-right">
            <span
              className={
                row.gap !== null && row.gap < 0 ? "text-sev-substantial" : "text-sev-above"
              }
            >
              {fmtGap(row.gap)}
            </span>
          </span>

          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <SeverityTag severity={row.severity} />
            {row.priority && <PriorityFlag />}
            <span aria-hidden className="ml-auto text-faint transition-transform group-open:rotate-90 lg:ml-0">
              ›
            </span>
          </span>
        </summary>

        {/* expanded detail */}
        <div className="grid gap-4 px-2 pb-5 pl-10 text-[13px] sm:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="leading-relaxed text-ink-soft">{signalSentence(row)}</p>
            {rec && (
              <p className="mt-2 leading-relaxed text-muted">
                <span className="tracking-cap text-[10px] text-faint">Rationale · </span>
                {rec.rationale}
              </p>
            )}
            {!row.suppressed && row.pp_below !== null && (
              <p className="mt-2 text-muted">
                {fmtPP(row.pp_below)} · expected {row.expected?.toLocaleString("en-CA")} at
                benchmark.
              </p>
            )}
          </div>

          {(row.pses || subgroupEntries.length > 0) && (
            <div className="space-y-3">
              {row.pses && (
                <div className="rounded-sm border border-rule bg-paper-raised p-3">
                  <p className="tracking-cap mb-2 text-[10px] text-faint">
                    Employee experience (PSES 2024 · context only)
                  </p>
                  <ul className="space-y-1">
                    {(Object.keys(row.pses) as (keyof typeof row.pses)[]).map((k) => (
                      <li key={k} className="flex items-center justify-between gap-3">
                        <span className="text-muted">{PSES_LABELS[k]}</span>
                        <span className="tnum text-ink">{row.pses![k]?.toFixed(0)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {subgroupEntries.length > 0 && (
                <div className="rounded-sm border border-rule bg-paper-raised p-3">
                  <p className="tracking-cap mb-2 text-[10px] text-faint">
                    Harassment score by subgroup · 2020 · 2022 · 2024 · cross-validated
                    external source
                  </p>
                  <ul className="space-y-1">
                    {subgroupEntries.map((e) => (
                      <li key={e.subgroup ?? "__group__"} className="flex items-center justify-between gap-3">
                        <span className="text-muted">{e.subgroup ?? `All ${GROUP_SHORT[row.group]}`}</span>
                        <span className="tnum text-ink">
                          {e.themes.harassment.map(fmtSubgroupCell).join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] leading-relaxed text-faint">
                    Not independently re-derived by this dashboard&apos;s own pipeline —
                    cross-validated against verified representation data. &quot;n/s&quot; =
                    not surveyed that cycle; &quot;suppressed&quot; = surveyed, below
                    reporting threshold.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </details>
    </li>
  );
}
