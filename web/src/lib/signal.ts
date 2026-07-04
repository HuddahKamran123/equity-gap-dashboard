// Cautious, bounded interpretation of a gap row — the interpretation-guardrails
// and trend-interpreter logic expressed deterministically in code.
//
// Hard rules enforced here:
//  · Only the approved review vocabulary is ever produced.
//  · No causal or blame language; a gap is a signal for review, not proof.
//  · PSES is contextual only — it nuances the *type* of review, never a ranking.
//  · WFA benchmark shifts are named, so a narrowing gap is not mis-read as progress.

import { META } from "./data";
import { severityMeta } from "./format";
import type { HistoryEntry, Row, Year } from "./types";

// The complete approved vocabulary. Nothing outside this set is emitted.
export const REVIEW_VOCAB = [
  "recruitment pipeline review",
  "retention review",
  "promotion pipeline review",
  "accessibility review",
  "workplace inclusion review",
] as const;

export interface Recommendation {
  reviews: string[]; // subset of REVIEW_VOCAB
  rationale: string; // cautious, non-causal
}

/** Below-benchmark? */
export function isBelow(row: Row): boolean {
  return row.gap !== null && row.gap < 0;
}

/**
 * Suggested *type* of review for a below-benchmark row. Returns null when the
 * department is at/above benchmark or the count is suppressed — the agent never
 * invents a review where the data does not warrant one.
 */
export function recommendReview(row: Row): Recommendation | null {
  if (row.suppressed || !isBelow(row)) return null;

  const reviews: string[] = ["recruitment pipeline review"];
  const notes: string[] = [];

  // PSES context nuances the review type — contextual, never causal.
  const p = row.pses;
  const low = (v?: number) => typeof v === "number" && v < 60;
  if (p && (low(p.pses_harassment) || low(p.pses_discrimination))) {
    reviews.push("retention review", "workplace inclusion review");
    notes.push(
      "employee-experience scores for this group are comparatively low, which may point to retention as well as recruitment",
    );
  }
  if (row.group === "Persons with Disabilities") {
    reviews.push("accessibility review");
  }
  // Representation rising but still below → pipeline/promotion worth examining.
  if (row.has_trend && row.prior_rep_pct !== null && row.rep_pct !== null && row.rep_pct > row.prior_rep_pct) {
    reviews.push("promotion pipeline review");
    notes.push("representation has been rising year over year but remains below benchmark");
  }

  const rationale =
    notes.length > 0
      ? `Suggested because ${notes.join("; ")}. These are starting points for human review, not conclusions about cause.`
      : "A starting point for human review of how this group is recruited and retained — not a conclusion about cause.";

  // de-duplicate, preserve order
  return { reviews: [...new Set(reviews)], rationale };
}

/** One cautious sentence summarising the signal for a row. */
export function signalSentence(row: Row): string {
  if (row.suppressed) {
    return "Count suppressed to protect privacy — no signal can be drawn for this cell.";
  }
  if (!isBelow(row)) {
    return "At or above the workforce-availability benchmark for this group.";
  }
  const sev = severityMeta(row.severity).label.toLowerCase();
  const rec = recommendReview(row);
  const focus = rec ? ` Recommended focus: ${rec.reviews.join(", ")}.` : "";
  return `${sevPrefix(sev)} below the workforce-availability benchmark.${focus}`;
}

function sevPrefix(sev: string): string {
  switch (sev) {
    case "severe":
      return "Severely";
    case "substantial":
      return "Substantially";
    case "moderate":
      return "Moderately";
    case "slight":
      return "Slightly";
    default:
      return "Below";
  }
}

export type TrendLabel =
  | "Genuine improvement"
  | "Benchmark-driven narrowing"
  | "Worsening"
  | "Stable";

export interface TrendResult {
  label: TrendLabel;
  detail: string;
}

/**
 * Shared core: classify movement between any two (wfa, representation) points.
 * Reasons in percentage-point terms (representation vs. its benchmark) so a
 * benchmark shift is never mistaken for a representation change. Two data points
 * only — never extrapolated, never attributed to a specific policy or program.
 */
function classifyByPoints(
  fromWfa: number,
  fromRep: number,
  toWfa: number,
  toRep: number,
  benchNoteSuffix: string,
): TrendResult {
  const priorPP = fromWfa - fromRep; // pp below benchmark, earlier point
  const currPP = toWfa - toRep; // pp below benchmark, later point
  const ppChange = currPP - priorPP; // negative = moved toward benchmark
  const repChange = toRep - fromRep;
  const wfaChange = toWfa - fromWfa;

  const benchNote =
    Math.abs(wfaChange) >= 0.05
      ? ` The benchmark itself ${wfaChange < 0 ? "fell" : "rose"} ${Math.abs(wfaChange).toFixed(1)} pp${benchNoteSuffix}, which affects the gap independently of representation.`
      : "";

  if (Math.abs(ppChange) < 0.2) {
    return { label: "Stable", detail: `Representation held about steady relative to benchmark (${repChange >= 0 ? "+" : ""}${repChange.toFixed(1)} pp).${benchNote}` };
  }
  if (ppChange < 0) {
    // moved toward / past benchmark
    if (repChange > 0.2) {
      return {
        label: "Genuine improvement",
        detail: `Representation rose ${repChange.toFixed(1)} pp, narrowing the distance to benchmark.${benchNote}`,
      };
    }
    return {
      label: "Benchmark-driven narrowing",
      detail: `The distance to benchmark narrowed with little change in representation (${repChange >= 0 ? "+" : ""}${repChange.toFixed(1)} pp) — driven mainly by the benchmark, not by hiring or retention.${benchNote}`,
    };
  }
  return {
    label: "Worsening",
    detail: `The distance below benchmark widened (representation ${repChange >= 0 ? "+" : ""}${repChange.toFixed(1)} pp).${benchNote}`,
  };
}

/**
 * Classify year-over-year movement for a 2024-25 row that has a 2023-24 match.
 */
export function classifyTrend(row: Row): TrendResult | null {
  if (!row.has_trend || row.rep_pct === null || row.prior_rep_pct === null || row.wfa === null) {
    return null;
  }
  const priorWfa = META.wfa_by_year["2023-2024"][row.group];
  return classifyByPoints(priorWfa, row.prior_rep_pct, row.wfa, row.rep_pct, " this year");
}

/**
 * Same classification, generalized to any two points on a department's
 * multi-year trajectory — used by Track's year-range filter to compare an
 * arbitrary pair of years without inventing a second scoring system.
 */
export function classifyTrendBetween(from: HistoryEntry, to: HistoryEntry): TrendResult | null {
  if (from.rep === null || to.rep === null) return null;
  return classifyByPoints(from.wfa, from.rep, to.wfa, to.rep, " over this span");
}

export function currentYear(): Year {
  return "2024-2025";
}
