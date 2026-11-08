import type { Metadata } from "next";
import { PlanSetup } from "@/components/plan/plan-setup";

export const metadata: Metadata = { title: "Pick your dates" };

export default function PlanPage() {
  return <PlanSetup />;
}
