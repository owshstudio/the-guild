"use client";

import { useRef } from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  presets: string[];
  onChange: (color: string) => void;
}

export default function ColorPicker({
  label,
  value,
  presets,
  onChange,
}: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-1.5 flex-wrap">
        {presets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: value === color ? "#e5e5e5" : "#333",
              transform: value === color ? "scale(1.15)" : undefined,
            }}
            title={color}
          />
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          className="w-5 h-5 rounded-full border-2 border-dashed border-[#555] flex items-center justify-center text-[#737373] text-[10px] hover:border-[#888] transition-colors"
          title="Custom color"
        >
          +
        </button>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </div>
    </div>
  );
}
