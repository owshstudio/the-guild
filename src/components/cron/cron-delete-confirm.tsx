"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CronDeleteConfirmProps {
  isOpen: boolean;
  jobName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CronDeleteConfirm({ isOpen, jobName, onConfirm, onCancel }: CronDeleteConfirmProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/3 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white">Delete Cron Job</h3>
            <p className="mt-2 text-sm text-[#737373]">
              Are you sure you want to delete <span className="text-[#e5e5e5] font-medium">{jobName}</span>? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="rounded-lg px-4 py-2 text-sm text-[#737373] transition hover:text-[#a3a3a3]"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
