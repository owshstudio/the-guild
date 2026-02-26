export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#1f1f1f] bg-[#141414]">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="5" stroke="url(#settGrad)" strokeWidth="2" />
            <path
              d="M16 3v4M16 25v4M3 16h4M25 16h4M6.3 6.3l2.8 2.8M22.9 22.9l2.8 2.8M6.3 25.7l2.8-2.8M22.9 9.1l2.8-2.8"
              stroke="url(#settGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="settGrad" x1="3" y1="3" x2="29" y2="29">
                <stop stopColor="#DF4F15" />
                <stop offset="0.5" stopColor="#F9425F" />
                <stop offset="1" stopColor="#A326B5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-sm text-[#737373]">
          Guild configuration and preferences
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#141414] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#DF4F15] to-[#A326B5]" />
          <span className="text-sm text-[#737373]">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
