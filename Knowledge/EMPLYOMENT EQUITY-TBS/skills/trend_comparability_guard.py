"""
Skill: trend-comparability-guard
Form: Skill (advisory — flags problems, lets the human decide, like
      Kinquiry's interpretation-guardrails)
Capability map #10 (guard half): verify question comparability before
any multi-year PSES experience trend.

WHY THIS EXISTS (verified against all three years' microdata, 2026-07-02):
    PSES RENUMBERED ITS QUESTIONS IN 2024. The same code points to
    different questions in different cycles (2020/2022 Q02 = "material
    and tools ..."; 2024 Q02 = "official language in meetings"). Any
    multi-year join on QUESTION alone silently compares different
    questions. Example: the harassment question is Q63 (2024) = Q62
    (2022) = Q60 (2020).

Data: knowledge/question_concordance.csv — built by matching question
WORDING (not codes) across the three microdata files. Columns:
    code_2024, code_2020, code_2022, verdict, min_wording_similarity, title
Verdicts: comparable_3yr | comparable_3yr_minor_wording | comparable_2yr
          | new_in_2024 | discontinued_after_2022

Usage
-----
    from skills.trend_comparability_guard import check_trend

    result = check_trend("Q63")           # code as used in 2024
    result.codes      -> {2020: "Q60", 2022: "Q62", 2024: "Q63"}
    result.comparable -> True
    result.warnings   -> [] or ["..."]

    Always select each year's rows with result.codes[year], never the
    same code across years.
"""

import csv
from dataclasses import dataclass, field
from pathlib import Path

_CSV = Path(__file__).resolve().parent.parent / "knowledge" / "question_concordance.csv"
_cache = None


@dataclass
class TrendCheck:
    question: str
    codes: dict            # {year: code or None}
    verdict: str
    comparable: bool
    warnings: list = field(default_factory=list)


def _load():
    global _cache
    if _cache is None:
        with open(_CSV, encoding="utf-8") as f:
            _cache = list(csv.DictReader(f))
    return _cache


def check_trend(code: str, year: int = 2024) -> TrendCheck:
    """
    Advisory check for one question. `code` is the question code as it
    appears in the `year` cycle (default 2024). Returns per-year codes
    and warnings; never raises. If the question is unknown, comparable
    is False and a warning explains why.
    """
    code = str(code).strip()
    col = {2024: "code_2024", 2022: "code_2022", 2020: "code_2020"}[year]
    row = next((r for r in _load() if r[col] == code), None)

    if row is None:
        return TrendCheck(code, {2020: None, 2022: None, 2024: None},
                          "unknown", False,
                          [f"'{code}' not found in the {year} concordance — "
                           f"cannot verify comparability; do not plot a trend."])

    codes = {2020: row["code_2020"] or None,
             2022: row["code_2022"] or None,
             2024: row["code_2024"] or None}
    verdict = row["verdict"]
    warnings = []

    if verdict == "comparable_3yr":
        comparable = True
    elif verdict == "comparable_3yr_minor_wording":
        comparable = True
        warnings.append(
            f"Wording changed slightly across cycles "
            f"(min similarity {row['min_wording_similarity']}) — show the "
            f"wording note beside any trend; human confirms comparability.")
    elif verdict == "comparable_2yr":
        comparable = True
        missing = [y for y, c in codes.items() if not c]
        warnings.append(
            f"Only two cycles comparable — no data for {missing}. "
            f"Plot two points only; do not interpolate.")
    else:  # new_in_2024, discontinued_after_2022
        comparable = False
        warnings.append(
            f"Verdict '{verdict}': this question does not span multiple "
            f"cycles under any code — no trend may be plotted.")

    # The load-bearing warning: codes differ across years
    present = {y: c for y, c in codes.items() if c}
    if len(set(present.values())) > 1:
        warnings.append(
            f"CODES DIFFER BY YEAR: {present}. Select each year's rows "
            f"with its own code — a same-code join compares different questions.")

    return TrendCheck(code, codes, verdict, comparable, warnings)


# ════════════════════════════════════════════════════════════════════════════
#  SELF-TEST  (run with: python -m skills.trend_comparability_guard)
# ════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("── Trend Comparability Guard Self-Test ──")

    # Oracle 1: harassment question, renumbered but comparable across 3 cycles
    r = check_trend("Q63")
    assert r.comparable and r.verdict == "comparable_3yr", r
    assert r.codes == {2020: "Q60", 2022: "Q62", 2024: "Q63"}, r.codes
    assert any("CODES DIFFER" in w for w in r.warnings)
    print("  ✓  Q63 (2024) -> Q62 (2022) / Q60 (2020), comparable, code warning raised")

    # Oracle 2: same code, different question across cycles — must NOT trend
    r2 = check_trend("Q02")   # 2024 Q02 = official languages; 2020/2022 Q02 = tools
    assert r2.codes[2022] != "Q02" or not r2.comparable or r2.warnings, r2
    print(f"  ✓  Q02 (2024) maps to 2022 code '{r2.codes[2022]}' — naive same-code join caught")

    # Oracle 3: unknown question fails safe
    r3 = check_trend("Q999")
    assert not r3.comparable and r3.warnings
    print("  ✓  Unknown question -> not comparable, warning issued (fail safe)")

    print("\n  All tests passed. Trend comparability guard is ready.")
