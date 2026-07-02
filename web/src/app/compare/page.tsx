import CompareView from "@/views/CompareView";

export const metadata = {
  title: "Compare · The Equity Gap",
  description:
    "Cross-group heatmap: federal departments below their workforce-availability benchmark for two or more designated groups, 2024–25.",
};

export default function Page() {
  return <CompareView />;
}
