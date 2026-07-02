import { severityMeta } from "@/lib/format";
import type { Row } from "@/lib/types";

// The benchmark sits at a fixed fraction of every track, so a reader scanning a
// column of bars sees each one measured against the SAME vertical benchmark line —
// the shortfall (or overshoot) reads instantly regardless of the group's benchmark.
const BENCH = 68;

/**
 * Signature visual: representation drawn as an inked bar that stops short of the
 * workforce-availability benchmark line, the gap left as a measured void.
 * Decorative — the numbers always appear as text beside it.
 */
export function DeficitBar({ row, className = "" }: { row: Row; className?: string }) {
  if (row.suppressed || row.rep_pct === null || row.wfa === null) {
    return (
      <div
        aria-hidden
        className={`relative h-3 w-full rounded-[2px] bg-[repeating-linear-gradient(45deg,var(--color-paper-sunken),var(--color-paper-sunken)_4px,transparent_4px,transparent_8px)] ${className}`}
      />
    );
  }
  const m = severityMeta(row.severity);
  const repX = Math.max(2, Math.min(100, (row.rep_pct / row.wfa) * BENCH));
  const above = row.severity === "above";

  return (
    <div aria-hidden className={`relative h-3 w-full ${className}`}>
      {/* track */}
      <div className="absolute inset-0 rounded-[2px] bg-paper-sunken" />
      {/* representation fill */}
      <div
        className={`absolute inset-y-0 left-0 rounded-l-[2px] ${m.bg} ${above ? "rounded-r-[2px]" : ""}`}
        style={{ width: `${repX}%` }}
      />
      {/* the void between the fill and the benchmark, when below */}
      {!above && (
        <div
          className="absolute inset-y-0 border-y border-dotted border-rule-strong"
          style={{ left: `${repX}%`, width: `${Math.max(0, BENCH - repX)}%` }}
        />
      )}
      {/* benchmark line */}
      <div
        className="absolute top-[-3px] bottom-[-3px] w-[2px] bg-ink"
        style={{ left: `${BENCH}%` }}
      />
    </div>
  );
}
