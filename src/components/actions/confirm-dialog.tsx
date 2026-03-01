"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60"
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 shadow-2xl"
          >
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-[#a3a3a3]">{message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="rounded-lg px-3 py-1.5 text-sm text-[#737373] transition hover:text-[#a3a3a3]"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-lg bg-[#ef4444] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#dc2626]"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
