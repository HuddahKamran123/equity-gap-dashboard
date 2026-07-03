// Typed access to the generated dataset. The data is produced by the reproducible
// pipeline (pipeline/build_dataset.py) from the verified TBS CSV + raw PSES microdata —
// it is read here, never hand-edited.

import equityJson from "@/data/equity.json";
import metaJson from "@/data/meta.json";
import repHistoryJson from "@/data/rep_history.json";
import subgroupPsesJson from "@/data/subgroup_pses.json";
import subgroupPsesMetaJson from "@/data/subgroup_pses_meta.json";
import serviceWideContextJson from "@/data/service_wide_context.json";
import serviceWideContextMetaJson from "@/data/service_wide_context_meta.json";
import { GROUPS, type Group, type HistoryEntry, type Meta, type Row, type ServiceWideContext, type SubgroupPsesEntry, type SubgroupPsesTheme, SUBGROUP_PSES_THEMES, type Year } from "./types";

export const ROWS = equityJson as Row[];
export const META = metaJson as Meta;
export const REP_HISTORY = repHistoryJson as Record<string, HistoryEntry[]>;
export const SUBGROUP_PSES = subgroupPsesJson as SubgroupPsesEntry[];
export const SUBGROUP_PSES_META = subgroupPsesMetaJson as {
  coverage: { departments_with_data: number; departments_total: number };
  ps_wide_average: Record<SubgroupPsesTheme, number>;
};
export const SERVICE_WIDE_CONTEXT = serviceWideContextJson as ServiceWideContext;
export const SERVICE_WIDE_CONTEXT_META = serviceWideContextMetaJson as {
  source: string;
  scope_note: string;
  data_quality_note: string;
};

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

/** Group-level entry first, then subgroups — for a department × group, from the
 * cross-validated external source (see subgroup_pses_meta.json). Empty for
 * departments/groups outside that source's 53-department coverage. */
export function subgroupPsesFor(department: string, group: Group): SubgroupPsesEntry[] {
  return SUBGROUP_PSES.filter((e) => e.department === department && e.group === group).sort(
    (a, b) => (a.subgroup === null ? -1 : b.subgroup === null ? 1 : a.subgroup.localeCompare(b.subgroup)),
  );
}

/** CPA-wide average (2024 cycle) per group × theme, from the cross-validated
 * external source's group-level entries (never subgroup rows — this is an
 * aggregate, unweighted mean across the 53 covered departments, context only,
 * never used to rank). Alongside each is the source's own public-service-wide
 * average for comparison. Departments with a suppressed/not-surveyed 2024 cell
 * for a theme are excluded from that theme's average, not counted as zero. */
export function cpaWideExperienceByGroup(): {
  group: Group;
  averages: Partial<Record<SubgroupPsesTheme, { avg: number; n: number }>>;
}[] {
  return GROUPS.map((group) => {
    const groupLevelEntries = SUBGROUP_PSES.filter((e) => e.group === group && e.subgroup === null);
    const averages: Partial<Record<SubgroupPsesTheme, { avg: number; n: number }>> = {};
    for (const theme of SUBGROUP_PSES_THEMES) {
      const values = groupLevelEntries
        .map((e) => e.themes[theme][2]) // index 2 = 2024
        .filter((v): v is number => typeof v === "number");
      if (values.length) {
        averages[theme] = { avg: values.reduce((a, b) => a + b, 0) / values.length, n: values.length };
      }
    }
    return { group, averages };
  });
}
