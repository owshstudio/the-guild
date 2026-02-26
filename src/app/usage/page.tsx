export default function UsagePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#1f1f1f] bg-[#141414]">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="18" width="6" height="10" rx="1" stroke="url(#usageGrad)" strokeWidth="2" />
            <rect x="13" y="10" width="6" height="18" rx="1" stroke="url(#usageGrad)" strokeWidth="2" />
            <rect x="22" y="4" width="6" height="24" rx="1" stroke="url(#usageGrad)" strokeWidth="2" />
            <defs>
              <linearGradient id="usageGrad" x1="4" y1="4" x2="28" y2="28">
                <stop stopColor="#DF4F15" />
                <stop offset="0.5" stopColor="#F9425F" />
                <stop offset="1" stopColor="#A326B5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-white">Usage</h1>
        <p className="mt-2 text-sm text-[#737373]">
          Token costs, API calls, and uptime metrics
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#141414] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#DF4F15] to-[#A326B5]" />
          <span className="text-sm text-[#737373]">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
