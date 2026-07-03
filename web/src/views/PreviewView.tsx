import {
  MOCK_FLOWS,
  MOCK_OCC_GROUPS,
  MOCK_PIPELINE,
  MOCK_REGIONS,
} from "@/lib/illustrativeMockData";

const WARNING = "ILLUSTRATIVE — NOT REAL DATA";

export default function PreviewView() {
  return (
    <div className="animate-fade-up">
      <header className="border-b border-rule pb-5">
        <p className="tracking-cap text-[11px] text-sev-severe">{WARNING}</p>
        <h2 className="font-display mt-2 text-[1.8rem] leading-tight text-ink">
          Preview — concepts for future views
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Every number on this page is a fabricated placeholder, copied from a
          teammate&apos;s prototype build that discloses its own data as mock.
          This page exists only to show what these views would look like if
          real, per-department data existed for them — it is not a finding, not
          part of the verified dashboard, and must never be cited. See{" "}
          <span className="text-ink">Executive-pipeline gap</span> in the
          project spec for why real data doesn&apos;t currently exist at this
          grain.
        </p>
      </header>

      <section className="border-b border-rule py-8">
        <SectionWarning />
        <h3 className="font-display text-xl text-ink">
          Executive pipeline (overall vs. leadership representation)
        </h3>
        <p className="mt-1 text-[13px] text-muted">
          Fabricated EX-01→EX-05 representation % by group vs. WFA. Real data
          only exists service-wide, not per level, in the published source.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-rule text-left text-[10px] tracking-cap text-faint">
                <th className="py-2 pr-4 font-normal">Group</th>
                <th className="py-2 pr-4 font-normal">WFA</th>
                <th className="py-2 pr-4 font-normal">EX-01</th>
                <th className="py-2 pr-4 font-normal">EX-02</th>
                <th className="py-2 pr-4 font-normal">EX-03</th>
                <th className="py-2 pr-4 font-normal">EX-04</th>
                <th className="py-2 pr-4 font-normal">EX-05</th>
                <th className="py-2 pr-4 font-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PIPELINE.map((r) => (
                <tr key={r.group} className="border-b border-dashed border-rule opacity-70">
                  <td className="py-2 pr-4 text-muted">{r.group}</td>
                  <td className="tnum py-2 pr-4">{r.wfa}</td>
                  <td className="tnum py-2 pr-4">{r.ex1}</td>
                  <td className="tnum py-2 pr-4">{r.ex2}</td>
                  <td className="tnum py-2 pr-4">{r.ex3}</td>
                  <td className="tnum py-2 pr-4">{r.ex4}</td>
                  <td className="tnum py-2 pr-4">{r.ex5}</td>
                  <td className="tnum py-2 pr-4">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-b border-rule py-8">
        <SectionWarning />
        <h3 className="font-display text-xl text-ink">
          Workforce flows (hires, promotions, separations)
        </h3>
        <p className="mt-1 text-[13px] text-muted">Fabricated % by group and fiscal year.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-rule text-left text-[10px] tracking-cap text-faint">
                <th className="py-2 pr-4 font-normal">Year</th>
                <th className="py-2 pr-4 font-normal">Group</th>
                <th className="py-2 pr-4 font-normal">Hires</th>
                <th className="py-2 pr-4 font-normal">Promotions</th>
                <th className="py-2 pr-4 font-normal">Separations</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FLOWS.map((r, i) => (
                <tr key={i} className="border-b border-dashed border-rule opacity-70">
                  <td className="py-2 pr-4 text-muted">{r.year}</td>
                  <td className="py-2 pr-4 text-muted">{r.group}</td>
                  <td className="tnum py-2 pr-4">{r.hires}</td>
                  <td className="tnum py-2 pr-4">{r.promo}</td>
                  <td className="tnum py-2 pr-4">{r.sep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-b border-rule py-8">
        <SectionWarning />
        <h3 className="font-display text-xl text-ink">Region of work</h3>
        <p className="mt-1 text-[13px] text-muted">Fabricated % of each group by region.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-rule text-left text-[10px] tracking-cap text-faint">
                <th className="py-2 pr-4 font-normal">Region</th>
                <th className="py-2 pr-4 font-normal">All</th>
                <th className="py-2 pr-4 font-normal">Women</th>
                <th className="py-2 pr-4 font-normal">Indigenous</th>
                <th className="py-2 pr-4 font-normal">Disability</th>
                <th className="py-2 pr-4 font-normal">Racialized</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REGIONS.map((r) => (
                <tr key={r.region} className="border-b border-dashed border-rule opacity-70">
                  <td className="py-2 pr-4 text-muted">{r.region}</td>
                  <td className="tnum py-2 pr-4">{r.all}</td>
                  <td className="tnum py-2 pr-4">{r.women}</td>
                  <td className="tnum py-2 pr-4">{r.indigenous}</td>
                  <td className="tnum py-2 pr-4">{r.disability}</td>
                  <td className="tnum py-2 pr-4">{r.racialized}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="py-8">
        <SectionWarning />
        <h3 className="font-display text-xl text-ink">Occupational groups</h3>
        <p className="mt-1 text-[13px] text-muted">Fabricated % of each group by occupation code.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-rule text-left text-[10px] tracking-cap text-faint">
                <th className="py-2 pr-4 font-normal">Occupation</th>
                <th className="py-2 pr-4 font-normal">All</th>
                <th className="py-2 pr-4 font-normal">Women</th>
                <th className="py-2 pr-4 font-normal">Indigenous</th>
                <th className="py-2 pr-4 font-normal">Disability</th>
                <th className="py-2 pr-4 font-normal">Racialized</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_OCC_GROUPS.map((r) => (
                <tr key={r.occ} className="border-b border-dashed border-rule opacity-70">
                  <td className="py-2 pr-4 text-muted">{r.occ}</td>
                  <td className="tnum py-2 pr-4">{r.all}</td>
                  <td className="tnum py-2 pr-4">{r.women}</td>
                  <td className="tnum py-2 pr-4">{r.indigenous}</td>
                  <td className="tnum py-2 pr-4">{r.disability}</td>
                  <td className="tnum py-2 pr-4">{r.racialized}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SectionWarning() {
  return (
    <p className="mb-3 inline-block rounded-sm border border-sev-severe px-2 py-0.5 text-[10px] font-medium tracking-cap text-sev-severe">
      {WARNING}
    </p>
  );
}
