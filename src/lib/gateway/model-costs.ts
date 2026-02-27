import type { ModelCost } from "@/lib/types";

export const MODEL_COSTS: Record<string, ModelCost> = {
  "claude-opus-4-6": {
    model: "claude-opus-4-6",
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
  },
  "claude-sonnet-4-5": {
    model: "claude-sonnet-4-5",
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
  },
  "gpt-4o": {
    model: "gpt-4o",
    inputCostPer1k: 0.0025,
    outputCostPer1k: 0.01,
  },
  "gpt-4o-mini": {
    model: "gpt-4o-mini",
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
  },
};
