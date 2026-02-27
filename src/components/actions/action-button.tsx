"use client";

import type { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "warning";
  loading?: boolean;
  disabled?: boolean;
}

const variantStyles = {
  default:
    "border-[#1f1f1f] text-[#a3a3a3] hover:border-[#2a2a2a] hover:text-white hover:bg-white/[0.04]",
  danger:
    "border-[#ef4444]/20 text-[#ef4444] hover:border-[#ef4444]/40 hover:bg-[#ef4444]/10",
  warning:
    "border-[#eab308]/20 text-[#eab308] hover:border-[#eab308]/40 hover:bg-[#eab308]/10",
};

export function ActionButton({
  icon,
  label,
  onClick,
  variant = "default",
  loading = false,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]}`}
    >
      {loading ? (
        <svg
          className="h-3.5 w-3.5 animate-spin"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="28"
            strokeDashoffset="8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        icon
      )}
      {label}
    </button>
  );
}
