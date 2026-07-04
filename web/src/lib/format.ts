import type { Group, Severity, SubgroupPsesCell } from "./types";

export const MINUS = "−"; // proper minus sign

/** 2020/2022/2024 subgroup PSES cell, distinguishing suppressed (surveyed,
 * below threshold) from null (not surveyed that cycle) — never the same. */
export function fmtSubgroupCell(cell: SubgroupPsesCell): string {
  if (cell === "suppressed") return "suppressed";
  if (cell === null) return "n/s";
  return cell.toFixed(0);
}

export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-CA");
}

export function fmtPct(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return "—";
  return `${n.toFixed(digits)}%`;
}

/** "N=590 of 10,822" — the raw count behind every percentage. */
export function fmtN(members: number | null, all: number | null): string {
  if (members === null || all === null) return "N suppressed";
  return `N=${fmtInt(members)} of ${fmtInt(all)}`;
}

/** Signed headcount gap with a proper minus sign, e.g. "−709" or "+4,726". */
export function fmtGap(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n < 0) return `${MINUS}${fmtInt(Math.abs(n))}`;
  return `+${fmtInt(n)}`;
}

/** Percentage-point distance from benchmark, e.g. "6.5 pp below" / "12.3 pp above". */
export function fmtPP(pp: number | null | undefined): string {
  if (pp === null || pp === undefined) return "—";
  if (pp <= 0) return `${Math.abs(pp).toFixed(1)} pp above`;
  return `${pp.toFixed(1)} pp below`;
}

export const GROUP_SHORT: Record<Group, string> = {
  Women: "Women",
  "Indigenous Peoples": "Indigenous",
  "Persons with Disabilities": "Disabilities",
  "Members of Visible Minorities": "Visible minorities",
};

// Severity metadata. Class strings are written out in full so the Tailwind v4
// scanner includes them. Colour always travels with a text label (never colour alone).
export interface SeverityMeta {
  label: string;
  order: number;
  blurb: string;
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  fill: string; // hex for SVG fills
}

export const SEVERITY: Record<Severity, SeverityMeta> = {
  above: {
    label: "At or above",
    order: 0,
    blurb: "At or above the workforce-availability benchmark.",
    text: "text-sev-above",
    bg: "bg-sev-above",
    bgSoft: "bg-sev-above/10",
    border: "border-sev-above",
    fill: "#2f6a55",
  },
  slight: {
    label: "Slight",
    order: 1,
    blurb: "Slightly below benchmark (under 2 percentage points).",
    text: "text-sev-slight",
    bg: "bg-sev-slight",
    bgSoft: "bg-sev-slight/10",
    border: "border-sev-slight",
    fill: "#b08a1f",
  },
  moderate: {
    label: "Moderate",
    order: 2,
    blurb: "Moderately below benchmark (2–4.9 percentage points).",
    text: "text-sev-moderate",
    bg: "bg-sev-moderate",
    bgSoft: "bg-sev-moderate/10",
    border: "border-sev-moderate",
    fill: "#d2741f",
  },
  substantial: {
    label: "Substantial",
    order: 3,
    blurb: "Substantially below benchmark (5–9.9 percentage points).",
    text: "text-sev-substantial",
    bg: "bg-sev-substantial",
    bgSoft: "bg-sev-substantial/10",
    border: "border-sev-substantial",
    fill: "#bc451a",
  },
  severe: {
    label: "Severe",
    order: 4,
    blurb: "Severely below benchmark (10 or more percentage points).",
    text: "text-sev-severe",
    bg: "bg-sev-severe",
    bgSoft: "bg-sev-severe/10",
    border: "border-sev-severe",
    fill: "#9c1a1a",
  },
};

export function severityMeta(s: Severity | null): SeverityMeta {
  return s ? SEVERITY[s] : {
    label: "Suppressed",
    order: 5,
    blurb: "Count suppressed to protect privacy (small population).",
    text: "text-faint",
    bg: "bg-paper-sunken",
    bgSoft: "bg-paper-sunken",
    border: "border-rule",
    fill: "#978f79",
  };
}
