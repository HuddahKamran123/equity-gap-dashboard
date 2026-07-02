import TrackView from "@/views/TrackView";

export const metadata = {
  title: "Track · The Equity Gap",
  description:
    "Year-over-year movement in representation relative to benchmark, distinguishing genuine improvement from benchmark-driven narrowing.",
};

export default function Page() {
  return <TrackView />;
}
