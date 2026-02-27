import type { HITLItem } from "@/lib/types";

export function requestNotificationPermission(): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function fireHITLNotification(item: HITLItem): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const priorityLabel =
    item.priority === "critical"
      ? "[CRITICAL] "
      : item.priority === "high"
      ? "[HIGH] "
      : "";

  new Notification(`${priorityLabel}${item.agentEmoji} ${item.agentName}`, {
    body: item.title,
    icon: "/favicon.ico",
    tag: item.id,
  });
}
