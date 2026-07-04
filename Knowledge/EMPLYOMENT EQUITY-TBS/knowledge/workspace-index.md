# Knowledge Workspace — Employment Equity Dashboard

## Folder structure

```
knowledge/
├── workspace-index.md        ← this file; read first
├── data-profile.md           ← what each source is, what one row means, what it can support
├── data-cautions.md          ← what the agent cannot guess: encodings, suppressions, scope limits, label changes
│
data/ (connected sources — read live, do not paste fragments)
├── EEINFODV.csv              ← PSES microdata, 1.6M rows, latin-1 encoded
├── BT1-28-2020-eng.pdf       ← Annual EE report FY 2019–20
├── BT1-28-2021-eng.pdf       ← Annual EE report FY 2020–21
├── BT1-28-2022-eng.pdf       ← Annual EE report FY 2021–22
├── BT1-28-2023-eng.pdf       ← Annual EE report FY 2022–23
├── BT1-28-2024-eng (1).pdf   ← Annual EE report FY 2023–24
├── BT1-28-2025-eng.pdf       ← Annual EE report FY 2024–25
└── 2024 PSES Supporting Documentation.xlsx  ← question metadata, scale anchors, methodology
```

## How to use this workspace

1. Start with `data-cautions.md` before writing any data logic — especially items 1, 2, and 3.
2. Use `data-profile.md` to understand what each source covers and how the two sources connect.
3. The BT1-28 PDFs are the authoritative source for representation rates and WFA benchmarks; extract figures directly from them rather than guessing.
4. The PSES xlsx documents what each question measures and how responses are grouped — consult it before labelling any score as "favourable" or "unfavourable."
