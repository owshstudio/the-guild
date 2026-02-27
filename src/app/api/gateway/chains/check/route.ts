import { NextResponse } from "next/server";
import { getChains, checkTriggers, advanceChain } from "@/lib/gateway/chain-engine";

export async function POST() {
  try {
    let chains = await getChains();
    chains = checkTriggers(chains);

    // Advance chains where the current step has been completed by trigger check
    for (const chain of chains) {
      if (chain.status !== "active") continue;
      const currentStep = chain.steps.find((s) => s.status === "active");
      if (!currentStep) {
        // No active step — try to advance
        const hasCompleted = chain.steps.some((s) => s.status === "completed");
        const hasPending = chain.steps.some((s) => s.status === "pending");
        if (hasCompleted && hasPending) {
          chains = await advanceChain(chain.id);
        }
      } else if (currentStep.status === "completed") {
        chains = await advanceChain(chain.id);
      }
    }

    return NextResponse.json({ data: chains, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: [],
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to check chains",
    });
  }
}
