"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
import type { ChainStep } from "@/lib/types";
import ChainStepNode from "./chain-step";
import ChainConnector from "./chain-connector";
import ChainStepEditor from "./chain-step-editor";

interface ChainBuilderProps {
  steps: ChainStep[];
  onStepsChange: (steps: ChainStep[]) => void;
}

export default function ChainBuilder({ steps, onStepsChange }: ChainBuilderProps) {
  const [editingStep, setEditingStep] = useState<ChainStep | null>(null);

  function handleReorder(newOrder: ChainStep[]) {
    const reordered = newOrder.map((s, i) => ({ ...s, order: i }));
    onStepsChange(reordered);
  }

  function handleStepSave(updated: ChainStep) {
    const newSteps = steps.map((s) => (s.id === updated.id ? updated : s));
    onStepsChange(newSteps);
    setEditingStep(null);
  }

  function handleAddStep() {
    const newStep: ChainStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      order: steps.length,
      name: `Step ${steps.length + 1}`,
      trigger: { type: "manual" },
      action: { type: "start-task" },
      status: "pending",
      onFailure: "stop",
      maxRetries: 0,
      retryCount: 0,
    };
    onStepsChange([...steps, newStep]);
  }

  const sorted = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div>
      <Reorder.Group axis="y" values={sorted} onReorder={handleReorder}>
        {sorted.map((step, idx) => (
          <div key={step.id}>
            <Reorder.Item value={step} id={step.id}>
              <ChainStepNode
                step={step}
                onClick={() => setEditingStep(step)}
              />
            </Reorder.Item>
            {idx < sorted.length - 1 && (
              <ChainConnector fromStatus={step.status} />
            )}
          </div>
        ))}
      </Reorder.Group>

      <button
        onClick={handleAddStep}
        className="mt-4 w-full rounded-xl border border-dashed border-[#2a2a2a] py-3 text-sm text-[#737373] transition hover:border-[#3a3a3a] hover:text-[#a3a3a3]"
      >
        + Add Step
      </button>

      {editingStep && (
        <ChainStepEditor
          step={editingStep}
          onSave={handleStepSave}
          onCancel={() => setEditingStep(null)}
        />
      )}
    </div>
  );
}
