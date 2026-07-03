// Domain types for the Employment Equity Gap dataset.
// Shape mirrors web/src/data/equity.json, produced by pipeline/build_dataset.py.

export type Group =
  | "Women"
  | "Indigenous Peoples"
  | "Persons with Disabilities"
  | "Members of Visible Minorities";

export type Year = "2023-2024" | "2024-2025";

/** Distance of representation below the workforce-availability benchmark. */
export type Severity = "above" | "slight" | "moderate" | "substantial" | "severe";

export interface PsesScores {
  pses_engagement?: number;
  pses_diversity_inclusion?: number;
  pses_harassment?: number;
  pses_discrimination?: number;
}

export interface Row {
  department: string;
  group: Group;
  year: Year;
  all_employees: number | null;
  members: number | null; // designated_group_members; null = suppressed
  rep_pct: number | null;
  wfa: number | null;
  expected: number | null;
  gap: number | null; // negative = below benchmark
  pp_below: number | null; // wfa - rep_pct (percentage points)
  severity: Severity | null; // null when suppressed
  suppressed: boolean;
  priority: boolean; // bottom quartile of gap within group × year
  has_trend: boolean; // present in both fiscal years
  prior_gap: number | null;
  prior_rep_pct: number | null;
  pses: PsesScores | null; // 2024-25 only, where surveyed
  divergence: boolean; // representation at/above benchmark but experience below the group's PS-wide average
  divergence_shortfall: number | null; // points below the peer-group PS average (harassment/discrimination)
  divergence_indicator: keyof PsesScores | null;
}

export interface HistoryEntry {
  year: Year;
  rep: number | null;
  wfa: number;
  gap: number | null;
  sev: Severity | null;
  n: number | null;
  all: number | null;
  era: "A" | "B"; // benchmark era — "B" from 2023-24 (rebased availability estimates)
  supp: boolean;
}

export interface Meta {
  generated_by: string;
  sources: { tbs_representation: string; pses: string };
  pses_method: string;
  pses_indicators: string[];
  pses_unavailable: string[];
  pses_unavailable_reason: string;
  wfa_by_year: Record<Year, Record<Group, number>>;
  severity_thresholds_pp: Record<string, string>;
  priority_rule: string;
  divergence_rule: string;
  pses_ps_baseline: Record<Group, Partial<Record<keyof PsesScores, number>>>;
  counts: {
    rows: number;
    divergence_rows: number;
    depts_2024_25: number;
    depts_2023_24: number;
    suppressed_rows: number;
    pses_enriched_rows: number;
    trend_eligible_rows: number;
    priority_rows: number;
  };
}

export const GROUPS: Group[] = [
  "Women",
  "Indigenous Peoples",
  "Persons with Disabilities",
  "Members of Visible Minorities",
];

export const CURRENT_YEAR: Year = "2024-2025";

export const PSES_LABELS: Record<keyof PsesScores, string> = {
  pses_engagement: "Engagement",
  pses_diversity_inclusion: "Diversity & inclusion",
  pses_harassment: "Harassment (higher = less reported)",
  pses_discrimination: "Discrimination (higher = less reported)",
};

// Subgroup + multi-cycle (2020/2022/2024) PSES experience data. Structurally
// separate from PsesScores/Row: sourced from a teammate's project, cross-validated
// against our own verified representation data but not independently re-derived by
// our own pipeline. See web/src/data/subgroup_pses_meta.json for provenance.
// Shape mirrors web/src/data/subgroup_pses.json, produced by
// pipeline/build_subgroup_pses.py.

export type SubgroupPsesTheme =
  | "harassment"
  | "belonging"
  | "career"
  | "leadership"
  | "workplace"
  | "wellbeing";

/** One survey cycle's score, or "suppressed" (surveyed, below reporting threshold), or null (not surveyed that cycle). */
export type SubgroupPsesCell = number | "suppressed" | null;

export interface SubgroupPsesEntry {
  department: string;
  group: Group;
  subgroup: string | null; // null = group-level entry, else e.g. "Black", "First Nations"
  n: number | "<10" | null;
  themes: Record<SubgroupPsesTheme, [SubgroupPsesCell, SubgroupPsesCell, SubgroupPsesCell]>; // [2020, 2022, 2024]
}

export const SUBGROUP_PSES_YEARS = [2020, 2022, 2024] as const;

export const SUBGROUP_PSES_THEMES: SubgroupPsesTheme[] = [
  "harassment",
  "belonging",
  "career",
  "leadership",
  "workplace",
  "wellbeing",
];

// Real, service-wide-only BT1-28 tables (not per-department) — reference
// context only, never mixed into the per-department decision-support views.
// Shape mirrors web/src/data/service_wide_context.json, produced by
// pipeline/build_service_wide_context.py.

export interface SubgroupBreakdownRow {
  subgroup: string;
  overall_n: number | null;
  overall_pct: number | null;
  executive_n: number | null;
  executive_pct: number | null;
}

export interface DistributionRow {
  band: string;
  all_employees: number | null;
  women: number | null;
  indigenous: number | null;
  disability: number | null;
  visible_minorities: number | null;
}

export interface WfaBenchmarkHistoryRow {
  benchmark: string;
  women: number;
  indigenous: number | null;
  disability: number | null;
  visible_minorities: number | null;
}

export interface ServiceWideContext {
  indigenous_subgroups: { fiscal_year: string; rows: SubgroupBreakdownRow[] };
  disability_subgroups: { fiscal_year: string; rows: SubgroupBreakdownRow[] };
  salary_distribution: { fiscal_year: string; rows: DistributionRow[] };
  age_distribution: { fiscal_year: string; rows: DistributionRow[] };
  wfa_benchmark_history: WfaBenchmarkHistoryRow[];
}

export const SUBGROUP_PSES_THEME_LABELS: Record<SubgroupPsesTheme, string> = {
  harassment: "Harassment",
  belonging: "Belonging & inclusion",
  career: "Career development",
  leadership: "Leadership",
  workplace: "Workplace",
  wellbeing: "Wellbeing",
};
