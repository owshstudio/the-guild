"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { checkGatewayHealth } from "@/lib/gateway";

interface GatewayContextType {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

const GatewayContext = createContext<GatewayContextType>({
  isConnected: false,
  isChecking: true,
  lastChecked: null,
});

export function useGateway() {
  return useContext(GatewayContext);
}

export function GatewayProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const check = useCallback(async () => {
    setIsChecking(true);
    const healthy = await checkGatewayHealth();
    setIsConnected(healthy);
    setIsChecking(false);
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [check]);

  return (
    <GatewayContext.Provider value={{ isConnected, isChecking, lastChecked }}>
      {children}
    </GatewayContext.Provider>
  );
}
