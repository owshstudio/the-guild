"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Toast } from "@/lib/types";

const BORDER_COLORS: Record<string, string> = {
  success: "#22c55e",
  error: "#ef4444",
  info: "#3b82f6",
  warning: "#eab308",
};

const ICONS: Record<string, string> = {
  success: "M9 12l2 2 4-4",
  error: "M18 6L6 18M6 6l12 12",
  info: "M12 16v-4m0-4h.01",
  warning: "M12 9v4m0 4h.01",
};

function ToastIcon({ type }: { type: string }) {
  const color = BORDER_COLORS[type] || BORDER_COLORS.info;
  const path = ICONS[type] || ICONS.info;
  const isCircle = type === "info" || type === "warning";

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isCircle && <circle cx="12" cy="12" r="10" />}
      <path d={path} />
    </svg>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const visible = toasts.slice(-3);
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visible.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-start gap-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3 shadow-lg min-w-[300px] max-w-[420px]"
            style={{ borderLeftColor: BORDER_COLORS[toast.type], borderLeftWidth: 3 }}
          >
            <ToastIcon type={toast.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e5e5e5]">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#737373] mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-[#525252] hover:text-[#e5e5e5] transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
