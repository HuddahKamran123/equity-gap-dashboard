import AskView from "@/views/AskView";

export const metadata = {
  title: "Ask · The Equity Gap",
  description:
    "Ask a grounded, guardrailed assistant about the employment-equity gaps — it cites counts and benchmarks and refuses staffing or causal claims.",
};

export default function Page() {
  return <AskView />;
}
