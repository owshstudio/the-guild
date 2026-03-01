"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDataSource } from "@/lib/data/data-provider";
import { AnimatePresence, motion } from "framer-motion";
import { APP_VERSION } from "@/lib/version";

function useHITLCount() {
  const [count, setCount] = useState(0);
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/hitl");
      const json = await res.json();
      const items = json.data || [];
      setCount(items.filter((i: { status: string }) => i.status === "pending").length);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    fetchCount(); // eslint-disable-line react-hooks/set-state-in-effect -- initial fetch on mount
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);
  return count;
}

const navItems = [
  { href: "/guild", label: "Guild", icon: GuildIcon },
  { href: "/chat", label: "Chat", icon: ChatIcon },
  { href: "/agents", label: "Agents", icon: AgentsIcon },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
  { href: "/sessions", label: "Sessions", icon: SessionsIcon },
  { href: "/tasks", label: "Tasks", icon: TasksIcon },
  { href: "/comms", label: "Comms", icon: CommsIcon },
  { href: "/hitl", label: "HITL", icon: HITLIcon, badge: true },
  { href: "/skills", label: "Skills", icon: SkillsIcon },
  { href: "/usage", label: "Usage", icon: UsageIcon },
  { href: "/cron", label: "Cron", icon: CronIcon },
  { href: "/webhooks", label: "Webhooks", icon: WebhookIcon },
  { href: "/chains", label: "Chains", icon: ChainIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { dataSource } = useDataSource();
  const hitlCount = useHITLCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-3 border-b border-[#1f1f1f] bg-[#0c0c0c] px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#a3a3a3] transition hover:bg-white/[0.05]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#DF4F15] via-[#F9425F] to-[#A326B5]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L2 5V11L8 15L14 11V5L8 1Z" fill="white" fillOpacity="0.9" />
            <path d="M8 1V8L14 5L8 1Z" fill="white" fillOpacity="0.7" />
            <path d="M8 8V15L14 11V5L8 8Z" fill="white" fillOpacity="0.5" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">The Guild</span>
      </div>

      {/* Backdrop overlay (mobile) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-[#1f1f1f] bg-[#0c0c0c] transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#DF4F15] via-[#F9425F] to-[#A326B5]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 5V11L8 15L14 11V5L8 1Z" fill="white" fillOpacity="0.9" />
              <path d="M8 1V8L14 5L8 1Z" fill="white" fillOpacity="0.7" />
              <path d="M8 8V15L14 11V5L8 8Z" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            The Guild
          </span>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-[#737373] hover:bg-white/[0.04] hover:text-[#a3a3a3]"
                }`}
              >
                <item.icon active={isActive} />
                {item.label}
                {item.badge && hitlCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[10px] font-bold text-white">
                    {hitlCount}
                  </span>
                )}
                {isActive && !item.badge && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#1f1f1f] px-3 py-4">
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#737373] transition-all hover:bg-white/[0.04] hover:text-[#a3a3a3]"
          >
            <SettingsIcon />
            Settings
          </Link>
          <div className="mt-3 flex items-center gap-3 px-3">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#DF4F15] via-[#F9425F] to-[#A326B5]" />
            <div>
              <p className="text-xs font-medium text-[#d4d4d4]">Guild Admin</p>
              <p className="text-[10px] text-[#525252]">{APP_VERSION}</p>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: dataSource === "live" ? "#22c55e" : "#eab308" }}
              >
                {dataSource === "live" ? "LIVE" : "MOCK"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function ChatIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 3h12a1 1 0 011 1v8a1 1 0 01-1 1H6l-3 3V4a1 1 0 011-1z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 7h4M7 10h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GuildIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function AgentsIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="6" r="3" stroke={color} strokeWidth="1.5" />
      <path d="M2 15c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="13" cy="5" r="2" stroke={color} strokeWidth="1.5" />
      <path d="M14 10c1.7.4 3 1.8 3 3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ActivityIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 9h3l2-5 3 10 2-5h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SessionsIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="2" width="12" height="14" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M6 6h6M6 9h4M6 12h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TasksIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M7 3v12M12 3v12" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function CommsIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 4h8a1 1 0 011 1v4a1 1 0 01-1 1H6l-3 2V4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 10v1a1 1 0 001 1h5l3 2V7a1 1 0 00-1-1h-1" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function HITLIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke={color} strokeWidth="1.5" />
      <path d="M9 5v4l3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkillsIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2l1.5 3.5L14 7l-3.5 1.5L9 12l-1.5-3.5L4 7l3.5-1.5L9 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 12l.75 1.5L16.5 14.5l-1.75.75L14 17l-.75-1.75L11.5 14.5l1.75-.75L14 12z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function UsageIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="10" width="3" height="6" rx="0.5" stroke={color} strokeWidth="1.5" />
      <rect x="7.5" y="6" width="3" height="10" rx="0.5" stroke={color} strokeWidth="1.5" />
      <rect x="13" y="2" width="3" height="14" rx="0.5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function CronIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke={color} strokeWidth="1.5" />
      <path d="M9 5v4h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WebhookIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 9l4-4m0 0l4 4m-4-4v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 9l-4 4m0 0l-4-4m4 4V3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChainIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="5" cy="5" r="2.5" stroke={color} strokeWidth="1.5" />
      <circle cx="13" cy="5" r="2.5" stroke={color} strokeWidth="1.5" />
      <circle cx="9" cy="13" r="2.5" stroke={color} strokeWidth="1.5" />
      <path d="M7 6.5l2 4.5M11 6.5l-2 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.4 3.4l1.4 1.4M13.2 13.2l1.4 1.4M3.4 14.6l1.4-1.4M13.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
