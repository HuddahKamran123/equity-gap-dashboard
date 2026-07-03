import {
  MOCK_FLOWS,
  MOCK_OCC_GROUPS,
  MOCK_PIPELINE,
  MOCK_REGIONS,
} from "@/lib/illustrativeMockData";

export default function PreviewView() {
  return (
    <div className="animate-fade-up">
      <header className="border-b border-rule pb-5">
        <p className="tracking-cap text-[11px] text-muted">Preview · concept mockups</p>
        <h2 className="font-display mt-2 text-[1.8rem] leading-tight text-ink">
          What these views could look like
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          The numbers below are placeholder values, not derived from the
          verified dataset, shown to demonstrate what these views would look
          like once real per-department data exists for them. See the
          Executive-pipeline gap discussion in the project spec for why that
          data isn&apos;t available at this grain yet.
        </p>
      </header>

      <section className="border-b border-rule py-8">
        <SectionTag />
        <h3 className="font-display text-xl text-ink">
          Executive pipeline (overall vs. leadership representation)
        </h3>
        <p className="mt-1 text-[13px] text-muted">
          EX-01→EX-05 representation % by group vs. WFA. Real data only exists
          service-wide, not per level, in the published source.
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
                <tr key={r.group} className="border-b border-rule">
                  <td className="py-2 pr-4 text-muted">{r.group}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.wfa}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.ex1}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.ex2}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.ex3}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.ex4}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.ex5}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-b border-rule py-8">
        <SectionTag />
        <h3 className="font-display text-xl text-ink">
          Workforce flows (hires, promotions, separations)
        </h3>
        <p className="mt-1 text-[13px] text-muted">% by group and fiscal year.</p>
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
                <tr key={i} className="border-b border-rule">
                  <td className="py-2 pr-4 text-muted">{r.year}</td>
                  <td className="py-2 pr-4 text-muted">{r.group}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.hires}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.promo}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.sep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-b border-rule py-8">
        <SectionTag />
        <h3 className="font-display text-xl text-ink">Region of work</h3>
        <p className="mt-1 text-[13px] text-muted">% of each group by region.</p>
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
                <tr key={r.region} className="border-b border-rule">
                  <td className="py-2 pr-4 text-muted">{r.region}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.all}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.women}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.indigenous}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.disability}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.racialized}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="py-8">
        <SectionTag />
        <h3 className="font-display text-xl text-ink">Occupational groups</h3>
        <p className="mt-1 text-[13px] text-muted">% of each group by occupation code.</p>
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
                <tr key={r.occ} className="border-b border-rule">
                  <td className="py-2 pr-4 text-muted">{r.occ}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.all}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.women}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.indigenous}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.disability}</td>
                  <td className="tnum py-2 pr-4 text-ink">{r.racialized}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SectionTag() {
  return (
    <p className="tracking-cap mb-2 text-[10px] text-faint">Placeholder data · concept only</p>
  );
}
