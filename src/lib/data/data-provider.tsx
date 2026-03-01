"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useToasts } from "@/components/toast-provider";
import { usePoll } from "./use-poll";

interface DataContextType {
  isConnected: boolean;
  isChecking: boolean;
  dataSource: "live" | "mock";
  lastChecked: Date | null;
}

const DataContext = createContext<DataContextType>({
  isConnected: false,
  isChecking: true,
  dataSource: "mock",
  lastChecked: null,
});

export function useDataSource() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [dataSource, setDataSource] = useState<"live" | "mock">("mock");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const prevConnected = useRef<boolean | null>(null);
  const { addToast } = useToasts();

  const check = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/gateway/health");
      const json = await res.json();
      const connected = json.data?.connected === true;
      setIsConnected(connected);
      setDataSource(json.source === "live" ? "live" : "mock");

      // Toast on connection state change (skip initial check)
      if (prevConnected.current !== null && prevConnected.current !== connected) {
        if (connected) {
          addToast("success", "Gateway connected", "Live data is now available");
        } else {
          addToast("warning", "Gateway disconnected", "Falling back to mock data");
        }
      }
      prevConnected.current = connected;
    } catch {
      if (prevConnected.current === true) {
        addToast("warning", "Gateway disconnected", "Falling back to mock data");
      }
      setIsConnected(false);
      setDataSource("mock");
      prevConnected.current = false;
    }
    setIsChecking(false);
    setLastChecked(new Date());
  }, [addToast]);

  usePoll(check, 30000);

  return (
    <DataContext.Provider
      value={{ isConnected, isChecking, dataSource, lastChecked }}
    >
      {children}
    </DataContext.Provider>
  );
}
