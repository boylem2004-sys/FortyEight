import type { Metadata } from "next";
import { ResultsView } from "@/components/results/results-view";

export const metadata: Metadata = { title: "Your weekend" };

type Props = { params: Promise<{ planId: string }> };

export default async function ResultsPage({ params }: Props) {
  const { planId } = await params;
  // key: a new plan id is a fresh view, never leftover state from the last one.
  return <ResultsView key={planId} planId={planId} />;
}
