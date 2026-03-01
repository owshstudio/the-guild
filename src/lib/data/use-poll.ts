"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `fn` immediately on mount (or when intervalMs changes),
 * then repeats on a fixed interval.
 */
export function usePoll(fn: () => void, intervalMs: number) {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    fnRef.current();
    const id = setInterval(() => fnRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
