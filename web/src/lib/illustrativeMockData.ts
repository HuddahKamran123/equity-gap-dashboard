// ⚠️ ILLUSTRATIVE MOCK DATA — NOT REAL, NOT VERIFIED, NOT PART OF THE PIPELINE.
//
// These numbers are copied verbatim from a teammate's prototype build, which
// self-discloses them as fabricated placeholder data (its own generated text
// says "Prototype — data is mock," and it cites source CSV files — e.g.
// "03_executive_pipeline.csv" — that do not exist anywhere in that project).
//
// They exist here ONLY so the /preview page can show what these views would
// look like once real, per-department or service-wide data exists for them.
// They must never be imported by any real view (Frame, Explore, Compare,
// Track, Present, Ask) or treated as a dashboard finding. See CLAUDE.md §3 and
// Deployment_Log.md for the full reasoning.

export interface MockPipelineRow {
  group: string;
  wfa: number;
  ex1: number;
  ex2: number;
  ex3: number;
  ex4: number;
  ex5: number;
  total: number;
}

export interface MockFlowRow {
  year: string;
  group: string;
  hires: number;
  promo: number;
  sep: number;
}

export interface MockRegionRow {
  region: string;
  all: number;
  women: number;
  indigenous: number;
  disability: number;
  racialized: number;
}

export interface MockOccRow {
  occ: string;
  all: number;
  women: number;
  indigenous: number;
  disability: number;
  racialized: number;
}

export const MOCK_PIPELINE: MockPipelineRow[] = [
  { group: "Women", wfa: 52.7, ex1: 55.2, ex2: 51.8, ex3: 47.5, ex4: 39.2, ex5: 28.1, total: 46.0 },
  { group: "Racialized persons", wfa: 17.1, ex1: 20.1, ex2: 18.5, ex3: 16.2, ex4: 13.8, ex5: 11.5, total: 17.8 },
  { group: "Indigenous peoples", wfa: 4.0, ex1: 4.1, ex2: 3.8, ex3: 3.4, ex4: 2.9, ex5: 2.2, total: 3.6 },
  { group: "Persons w/ disabilities", wfa: 9.0, ex1: 5.8, ex2: 5.4, ex3: 5.0, ex4: 4.2, ex5: 3.1, total: 5.1 },
];

export const MOCK_FLOWS: MockFlowRow[] = [
  { year: "FY2024-25", group: "Women", hires: 54.1, promo: 53.2, sep: 50.8 },
  { year: "FY2024-25", group: "Racialized persons", hires: 24.3, promo: 19.8, sep: 15.2 },
  { year: "FY2024-25", group: "Indigenous peoples", hires: 3.8, promo: 3.2, sep: 3.1 },
  { year: "FY2024-25", group: "Persons w/ disabilities", hires: 5.5, promo: 4.8, sep: 5.2 },
  { year: "FY2023-24", group: "Women", hires: 53.5, promo: 52.8, sep: 50.2 },
  { year: "FY2023-24", group: "Racialized persons", hires: 23.5, promo: 19.1, sep: 14.8 },
  { year: "FY2023-24", group: "Indigenous peoples", hires: 3.6, promo: 3.0, sep: 3.0 },
  { year: "FY2023-24", group: "Persons w/ disabilities", hires: 5.2, promo: 4.5, sep: 5.0 },
  { year: "FY2022-23", group: "Women", hires: 52.8, promo: 52.1, sep: 49.5 },
  { year: "FY2022-23", group: "Racialized persons", hires: 22.8, promo: 18.5, sep: 14.1 },
  { year: "FY2022-23", group: "Indigenous peoples", hires: 3.4, promo: 2.9, sep: 2.8 },
  { year: "FY2022-23", group: "Persons w/ disabilities", hires: 5.0, promo: 4.3, sep: 4.8 },
];

export const MOCK_REGIONS: MockRegionRow[] = [
  { region: "National Capital Region", all: 30.2, women: 31.5, indigenous: 22.1, disability: 31.8, racialized: 27.5 },
  { region: "Atlantic", all: 8.5, women: 9.1, indigenous: 10.2, disability: 8.8, racialized: 4.2 },
  { region: "Quebec", all: 21.3, women: 22.0, indigenous: 12.5, disability: 20.5, racialized: 14.8 },
  { region: "Ontario (excl. NCR)", all: 17.8, women: 17.5, indigenous: 15.8, disability: 18.2, racialized: 24.5 },
  { region: "Prairie", all: 10.5, women: 10.2, indigenous: 18.5, disability: 10.8, racialized: 12.8 },
  { region: "British Columbia", all: 11.7, women: 9.7, indigenous: 16.4, disability: 9.9, racialized: 16.8 },
];

export const MOCK_OCC_GROUPS: MockOccRow[] = [
  { occ: "EX — Executive", all: 3.8, women: 46.0, indigenous: 3.6, disability: 5.1, racialized: 17.8 },
  { occ: "EC — Economics", all: 5.2, women: 52.8, indigenous: 2.8, disability: 5.0, racialized: 22.5 },
  { occ: "CS — Computer Sci.", all: 7.8, women: 28.5, indigenous: 2.5, disability: 6.2, racialized: 31.8 },
  { occ: "PM — Programme", all: 15.5, women: 62.5, indigenous: 4.8, disability: 6.8, racialized: 21.5 },
  { occ: "AS — Administrative", all: 12.2, women: 68.5, indigenous: 3.9, disability: 6.5, racialized: 19.8 },
  { occ: "CR — Clerical", all: 6.8, women: 72.5, indigenous: 4.5, disability: 7.2, racialized: 22.8 },
  { occ: "SP — Science", all: 8.5, women: 48.5, indigenous: 2.2, disability: 5.5, racialized: 18.5 },
  { occ: "Other groups", all: 40.2, women: 51.2, indigenous: 4.1, disability: 5.8, racialized: 17.2 },
];
