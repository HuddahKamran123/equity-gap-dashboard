"use client";

import { useMemo, useState } from "react";
import { SeverityTag, PriorityFlag } from "@/components/ui/SeverityTag";
import { DeficitBar } from "@/components/ui/DeficitBar";
import { departmentsForYear, rowsForDepartment } from "@/lib/data";
import { fmtGap, fmtN, fmtPct, fmtPP, severityMeta } from "@/lib/format";
import { classifyTrend, recommendReview, signalSentence } from "@/lib/signal";
import { CURRENT_YEAR, GROUPS, PSES_LABELS, type Group, type Row } from "@/lib/types";

const ATTRIBUTION =
  "Source: Treasury Board of Canada Secretariat employment-equity data (2024–25) and the 2024 Public Service Employee Survey. A signal for human review, not a determination.";

export default function PresentView() {
  const departments = useMemo(() => departmentsForYear(CURRENT_YEAR), []);
  const [dept, setDept] = useState("Royal Canadian Mounted Police");
  const [group, setGroup] = useState<Group>("Persons with Disabilities");

  const row = useMemo(
    () => rowsForDepartment(dept, CURRENT_YEAR).find((r) => r.group === group) ?? null,
    [dept, group],
  );

  return (
    <div className="animate-fade-up">
      <header className="border-b border-rule pb-5">
        <p className="tracking-cap text-[11px] text-muted">Present · briefing</p>
        <h2 className="font-display mt-2 text-[1.8rem] leading-tight text-ink">
          A five-block summary, ready to brief
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Pick a department and group. The summary always runs in the same order —
          Key Finding, Evidence, Caveat, Human Review, Next Action — in cautious,
          bounded language, ending with the data attribution.
        </p>
      </header>

      <div className="my-5 grid gap-3 sm:grid-cols-2">
        <label className="text-[13px] text-muted">
          Department
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="mt-1 block w-full rounded-sm border border-rule-strong bg-paper-raised px-3 py-2 text-[14px] text-ink"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] text-muted">
          Designated group
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as Group)}
            className="mt-1 block w-full rounded-sm border border-rule-strong bg-paper-raised px-3 py-2 text-[14px] text-ink"
          >
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      {row ? <Summary row={row} /> : <p className="text-muted">No data for this combination.</p>}
    </div>
  );
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-rule py-4 first:border-t-0">
      <h3 className="flex items-baseline gap-2">
        <span className="tnum text-[11px] text-faint">{n}</span>
        <span className="tracking-cap text-[11px] text-muted">{title}</span>
      </h3>
      <div className="mt-2 text-[14px] leading-relaxed text-ink">{children}</div>
    </section>
  );
}

function Summary({ row }: { row: Row }) {
  const sev = severityMeta(row.severity);
  const rec = recommendReview(row);
  const trend = classifyTrend(row);

  if (row.suppressed) {
    return (
      <div className="rounded-sm border border-rule bg-paper-raised p-5">
        <Block n="01" title="Key finding">
          The count for {row.group} at {row.department} is <strong>suppressed</strong> to
          protect privacy (small population). No representation figure can be shown.
        </Block>
        <Block n="02" title="Caveat">
          A suppressed cell means the value was withheld, not that it is zero. No gap, signal,
          or review can be drawn from it.
        </Block>
        <p className="mt-3 border-t border-rule pt-3 text-[12px] italic text-muted">{ATTRIBUTION}</p>
      </div>
    );
  }

  return (
    <article className="rounded-sm border border-rule bg-paper-raised p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h3 className="font-display text-xl text-ink">
          {row.department} · {row.group}
        </h3>
        <SeverityTag severity={row.severity} />
        {row.priority && <PriorityFlag />}
      </div>
      <DeficitBar row={row} className="mb-5 max-w-md" />

      <Block n="01" title="Key finding">
        Representation is <strong>{fmtPct(row.rep_pct)}</strong> ({fmtN(row.members, row.all_employees)}),
        against a workforce-availability benchmark of <strong>{fmtPct(row.wfa)}</strong> — a gap of{" "}
        <strong className={row.gap! < 0 ? "text-sev-substantial" : "text-sev-above"}>
          {fmtGap(row.gap)} employees
        </strong>{" "}
        ({fmtPP(row.pp_below)}). {signalSentence(row)}
      </Block>

      <Block n="02" title="Evidence">
        At benchmark the department would have about{" "}
        {row.expected?.toLocaleString("en-CA")} employees from this group; it has{" "}
        {row.members?.toLocaleString("en-CA")}.
        {trend ? ` Year over year: ${trend.label.toLowerCase()} — ${trend.detail}` : " No prior-year comparison is available for this department."}
        {row.pses && (
          <span>
            {" "}
            Employee-experience context (PSES 2024):{" "}
            {(Object.keys(row.pses) as (keyof typeof row.pses)[])
              .map((k) => `${PSES_LABELS[k].replace(/ \(.*\)/, "")} ${row.pses![k]?.toFixed(0)}`)
              .join(", ")}
            .
          </span>
        )}
      </Block>

      <Block n="03" title="Caveat">
        This gap is a signal for review, not proof of discrimination or policy failure.
        Self-identification is voluntary, so some groups — especially Persons with
        Disabilities — may be undercounted. PSES scores describe experience and are context
        only; they are never combined with representation into a single score, and groups are
        never compared on one scale.
      </Block>

      <Block n="04" title="Human review required">
        {row.priority
          ? "This department–group is flagged as a priority — a candidate for review, not a decision. "
          : ""}
        An EDI policy lead or HR executive must review before any action is taken. If a flag is
        dismissed, the reason should be logged for the next cycle.
      </Block>

      <Block n="05" title="Next action">
        {rec ? (
          <>
            Recommended focus: <strong>{rec.reviews.join(", ")}</strong>. {rec.rationale}
          </>
        ) : (
          "At or above benchmark for this group — no gap-driven review is prioritized; continue monitoring."
        )}
      </Block>

      <p className="mt-3 border-t border-rule pt-3 text-[12px] italic text-muted">{ATTRIBUTION}</p>
    </article>
  );
}
