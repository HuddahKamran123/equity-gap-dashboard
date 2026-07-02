import { severityMeta } from "@/lib/format";
import type { Severity } from "@/lib/types";

/** Severity shown as colour + label together (never colour alone — a11y). */
export function SeverityTag({
  severity,
  className = "",
}: {
  severity: Severity | null;
  className?: string;
}) {
  const m = severityMeta(severity);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${m.text} ${m.border} ${m.bgSoft} ${className}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${m.bg}`} />
      {m.label}
    </span>
  );
}

export function PriorityFlag({ className = "" }: { className?: string }) {
  return (
    <span
      title="Priority for human review (bottom quartile of gap)"
      className={`inline-flex items-center gap-1 text-[11px] font-medium text-sev-severe ${className}`}
    >
      <span aria-hidden>⚑</span>
      <span className="sr-only">Priority for review.</span>
      Priority
    </span>
  );
}
