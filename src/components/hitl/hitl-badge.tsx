"use client";

interface HITLBadgeProps {
  count: number;
}

export function HITLBadge({ count }: HITLBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
