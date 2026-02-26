"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/guild", label: "Guild", icon: GuildIcon },
  { href: "/agents", label: "Agents", icon: AgentsIcon },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
  { href: "/tasks", label: "Tasks", icon: TasksIcon },
  { href: "/skills", label: "Skills", icon: SkillsIcon },
  { href: "/usage", label: "Usage", icon: UsageIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-[#1f1f1f] bg-[#0c0c0c]">
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
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-[#737373] hover:bg-white/[0.04] hover:text-[#a3a3a3]"
              }`}
            >
              <item.icon active={isActive} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#DF4F15] to-[#F9425F]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#1f1f1f] px-3 py-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#737373] transition-all hover:bg-white/[0.04] hover:text-[#a3a3a3]"
        >
          <SettingsIcon />
          Settings
        </Link>
        <div className="mt-3 flex items-center gap-3 px-3">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#DF4F15] to-[#A326B5]" />
          <div>
            <p className="text-xs font-medium text-[#d4d4d4]">Guild Admin</p>
            <p className="text-[10px] text-[#525252]">v0.1.0</p>
          </div>
        </div>
      </div>
    </aside>
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

function TasksIcon({ active }: { active?: boolean }) {
  const color = active ? "#e5e5e5" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M7 3v12M12 3v12" stroke={color} strokeWidth="1.5" />
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

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.4 3.4l1.4 1.4M13.2 13.2l1.4 1.4M3.4 14.6l1.4-1.4M13.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
