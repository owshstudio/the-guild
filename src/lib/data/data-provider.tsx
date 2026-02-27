"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

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

  const check = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/gateway/health");
      const json = await res.json();
      const connected = json.data?.connected === true;
      setIsConnected(connected);
      setDataSource(json.source === "live" ? "live" : "mock");
    } catch {
      setIsConnected(false);
      setDataSource("mock");
    }
    setIsChecking(false);
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [check]);

  return (
    <DataContext.Provider
      value={{ isConnected, isChecking, dataSource, lastChecked }}
    >
      {children}
    </DataContext.Provider>
  );
}
