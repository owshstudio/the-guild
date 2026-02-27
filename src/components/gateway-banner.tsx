"use client";

import { useDataSource } from "@/lib/data/data-provider";

export default function GatewayBanner() {
  const { isConnected, isChecking, dataSource } = useDataSource();

  if (isChecking) return null;

  return (
    <>
      {!isConnected && (
        <div className="gateway-pulse border-b border-[#DF4F15]/20 bg-gradient-to-r from-[#DF4F15]/10 via-[#F9425F]/10 to-[#A326B5]/10 px-6 py-2.5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#DF4F15] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#DF4F15]" />
            </span>
            <span className="text-sm text-[#F9425F]/80">
              Gateway Offline &mdash; Connect to your OpenClaw gateway to view
              live data
            </span>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: dataSource === "live" ? "#22c55e" : "#eab308",
                backgroundColor:
                  dataSource === "live"
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(234,179,8,0.1)",
              }}
            >
              {dataSource === "live" ? "LIVE" : "MOCK"}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
