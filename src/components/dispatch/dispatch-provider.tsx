"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { DispatchModal } from "./dispatch-modal";

interface DispatchContextType {
  isOpen: boolean;
  targetAgentId: string | null;
  openDispatch: (agentId?: string) => void;
  closeDispatch: () => void;
}

const DispatchContext = createContext<DispatchContextType>({
  isOpen: false,
  targetAgentId: null,
  openDispatch: () => {},
  closeDispatch: () => {},
});

export function useDispatchContext() {
  return useContext(DispatchContext);
}

export function DispatchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetAgentId, setTargetAgentId] = useState<string | null>(null);

  const openDispatch = useCallback((agentId?: string) => {
    setTargetAgentId(agentId || null);
    setIsOpen(true);
  }, []);

  const closeDispatch = useCallback(() => {
    setIsOpen(false);
    setTargetAgentId(null);
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <DispatchContext.Provider
      value={{ isOpen, targetAgentId, openDispatch, closeDispatch }}
    >
      {children}
      <DispatchModal
        isOpen={isOpen}
        onClose={closeDispatch}
        targetAgentId={targetAgentId}
      />
    </DispatchContext.Provider>
  );
}
