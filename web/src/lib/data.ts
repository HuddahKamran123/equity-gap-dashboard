// Typed access to the generated dataset. The data is produced by the reproducible
// pipeline (pipeline/build_dataset.py) from the verified TBS CSV + raw PSES microdata —
// it is read here, never hand-edited.

import equityJson from "@/data/equity.json";
import metaJson from "@/data/meta.json";
import repHistoryJson from "@/data/rep_history.json";
import type { Group, HistoryEntry, Meta, Row, Year } from "./types";

export const ROWS = equityJson as Row[];
export const META = metaJson as Meta;
export const REP_HISTORY = repHistoryJson as Record<string, HistoryEntry[]>;

/** Multi-year representation trajectory for a department × group (2–4 years), or undefined. */
export function historyFor(department: string, group: Group): HistoryEntry[] | undefined {
  return REP_HISTORY[`${department}|${group}`];
}

export function rowsForYear(year: Year): Row[] {
  return ROWS.filter((r) => r.year === year);
}

export function rowsForGroupYear(group: Group, year: Year): Row[] {
  return ROWS.filter((r) => r.group === group && r.year === year);
}

export function departmentsForYear(year: Year): string[] {
  return [...new Set(rowsForYear(year).map((r) => r.department))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/** Rows for one department in a year, ordered by the canonical group order. */
export function rowsForDepartment(department: string, year: Year): Row[] {
  return ROWS.filter((r) => r.department === department && r.year === year);
}

/** Most-below-benchmark first (largest negative gap). Suppressed rows sort last. */
export function byGapAscending(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => {
    if (a.gap === null) return 1;
    if (b.gap === null) return -1;
    return a.gap - b.gap;
  });
}

export function priorityRows(year: Year): Row[] {
  return byGapAscending(rowsForYear(year).filter((r) => r.priority));
}

/** Departments below benchmark for two or more groups (for the Compare view). */
export function multiGroupGaps(year: Year): { department: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rowsForYear(year)) {
    if (r.gap !== null && r.gap < 0) {
      counts.set(r.department, (counts.get(r.department) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);
}

export function averageGapByGroup(year: Year): { group: Group; avg: number; n: number }[] {
  const out: { group: Group; avg: number; n: number }[] = [];
  for (const group of ["Women", "Indigenous Peoples", "Persons with Disabilities", "Members of Visible Minorities"] as Group[]) {
    const gaps = rowsForGroupYear(group, year)
      .map((r) => r.gap)
      .filter((g): g is number => g !== null);
    const sum = gaps.reduce((a, b) => a + b, 0);
    out.push({ group, avg: gaps.length ? sum / gaps.length : 0, n: gaps.length });
  }
  return out;
}

/** Representation met but experience below the peer group — ordered by shortfall. */
export function divergenceRows(year: Year): Row[] {
  return rowsForYear(year)
    .filter((r) => r.divergence)
    .sort((a, b) => (b.divergence_shortfall ?? 0) - (a.divergence_shortfall ?? 0));
}
