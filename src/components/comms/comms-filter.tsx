"use client";

import type { CommChannel } from "@/lib/types";

const AGENTS = [
  { value: "", label: "All" },
  { value: "nyx", label: "NYX" },
  { value: "hemera", label: "HEMERA" },
];

const TO_AGENTS = [
  { value: "", label: "All" },
  { value: "nyx", label: "NYX" },
  { value: "hemera", label: "HEMERA" },
  { value: "noah", label: "NOAH" },
];

const CHANNELS: { value: string; label: string }[] = [
  { value: "", label: "All Channels" },
  { value: "whatsapp-group", label: "WhatsApp" },
  { value: "git-sync", label: "Git Sync" },
  { value: "session", label: "Session" },
  { value: "alert-file", label: "Alert" },
  { value: "delivery-queue", label: "Queue" },
];

interface CommsFilterProps {
  from: string;
  to: string;
  channel: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onChannelChange: (val: string) => void;
}

export default function CommsFilter({
  from,
  to,
  channel,
  onFromChange,
  onToChange,
  onChannelChange,
}: CommsFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterSelect
        label="From"
        value={from}
        options={AGENTS}
        onChange={onFromChange}
      />
      <FilterSelect
        label="To"
        value={to}
        options={TO_AGENTS}
        onChange={onToChange}
      />
      <FilterSelect
        label="Channel"
        value={channel}
        options={CHANNELS}
        onChange={onChannelChange}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-[#525252]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-1.5 text-xs text-[#e5e5e5] outline-none transition-colors hover:border-[#2a2a2a] focus:border-[#3f3f3f]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
