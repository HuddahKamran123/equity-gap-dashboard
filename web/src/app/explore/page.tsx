import { Suspense } from "react";
import ExploreView from "@/views/ExploreView";

export const metadata = {
  title: "Explore Gaps · The Equity Gap",
  description:
    "Federal departments ranked by how far each designated equity group falls below its workforce-availability benchmark, 2024–25.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading gaps…</div>}>
      <ExploreView />
    </Suspense>
  );
}
