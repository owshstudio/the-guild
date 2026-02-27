"use client";

import { MODEL_COSTS } from "@/lib/gateway/model-costs";

export function ModelComparison() {
  const models = Object.values(MODEL_COSTS);

  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
      <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
        Model Pricing
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#1f1f1f]">
              <th className="pb-3 text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                Model
              </th>
              <th className="pb-3 text-right text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                Input (per 1K)
              </th>
              <th className="pb-3 text-right text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                Output (per 1K)
              </th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.model} className="border-b border-[#1f1f1f]/50">
                <td className="py-3">
                  <span className="rounded bg-[#1f1f1f] px-2 py-0.5 font-mono text-xs text-[#d4d4d4]">
                    {m.model}
                  </span>
                </td>
                <td className="py-3 text-right font-mono text-xs text-[#e5e5e5]">
                  ${m.inputCostPer1k.toFixed(4)}
                </td>
                <td className="py-3 text-right font-mono text-xs text-[#e5e5e5]">
                  ${m.outputCostPer1k.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
