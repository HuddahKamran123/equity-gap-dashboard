"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Frame", num: "01" },
  { href: "/explore", label: "Explore Gaps", num: "02" },
  { href: "/compare", label: "Compare", num: "03" },
  { href: "/track", label: "Track", num: "04" },
  { href: "/present", label: "Present", num: "05" },
  { href: "/ask", label: "Ask", num: "06" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="relative z-10 flex min-h-full flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="border-b border-rule-strong bg-paper/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
          {/* masthead */}
          <div className="flex flex-col gap-4 pt-6 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="tracking-cap text-[11px] text-muted">
                Employment Equity · Government of Canada
              </p>
              <h1 className="font-display mt-1 text-[2.1rem] leading-[0.95] tracking-[-0.01em] text-ink sm:text-[2.6rem]">
                The Equity&nbsp;Gap
              </h1>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-ink-soft sm:text-right">
              Where the federal public service falls short of its own
              workforce-availability benchmark — and what kind of review that
              signals.
            </p>
          </div>

          {/* nav */}
          <nav aria-label="Views" className="-mb-px overflow-x-auto">
            <ul className="flex min-w-max gap-1">
              {NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-baseline gap-2 border-b-2 px-3 py-3 text-sm transition-colors ${
                        active
                          ? "border-ink text-ink"
                          : "border-transparent text-muted hover:border-rule-strong hover:text-ink"
                      }`}
                    >
                      <span className="tnum text-[10px] text-faint group-hover:text-muted">
                        {item.num}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* always-visible responsible-use caveat */}
      <div className="border-b border-rule bg-paper-sunken/60">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
          <p className="flex items-center gap-2 py-2 text-[12px] text-ink-soft">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            />
            <span>
              <strong className="font-semibold text-ink">
                A signal surface, not a decision engine.
              </strong>{" "}
              A gap flags where a human should look — it is never proof of
              discrimination, and groups are never combined into a single score.
            </span>
          </p>
        </div>
      </div>

      <main id="main" className="mx-auto w-full max-w-[1240px] flex-1 px-5 py-8 sm:px-8 sm:py-12">
        {children}
      </main>

      <footer className="mt-auto border-t border-rule-strong bg-paper-raised">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-8 text-[12px] leading-relaxed text-muted sm:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="tracking-cap mb-2 text-[10px] text-faint">Sources</p>
              <p>
                Representation &amp; workforce-availability: Treasury Board of
                Canada Secretariat, Employment Equity (2023-24, 2024-25).
              </p>
              <p className="mt-1.5">
                Employee experience:{" "}
                <a
                  className="text-accent underline underline-offset-2 hover:text-accent-bright"
                  href="https://open.canada.ca/data/en/dataset/7f625e97-9d02-4c12-a756-1ddebb50e69f"
                  target="_blank"
                  rel="noreferrer"
                >
                  2024 Public Service Employee Survey
                </a>{" "}
                (PSES), computed from the raw microdata.
              </p>
            </div>
            <div>
              <p className="tracking-cap mb-2 text-[10px] text-faint">Method</p>
              <p>
                Every percentage shows its raw count and its benchmark. Priority is
                the bottom quartile of gap within each group × year (data-driven);
                severity is a documented percentage-point scale; suppressed cells
                follow Employment-Equity policy and are never shown as zero.
                Benchmarks are service-wide WFA — read rankings as triage, not
                precise placement. No causal claims; trends only across both years.
              </p>
            </div>
            <div>
              <p className="tracking-cap mb-2 text-[10px] text-faint">
                Governance
              </p>
              <p>
                Priority flags surface candidates for human review. An EDI policy
                lead decides; overrides are logged. MMA 616 · Managing
                Intelligence.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
