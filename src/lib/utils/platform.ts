/**
 * Returns the platform-appropriate modifier key label.
 * "⌘" on macOS, "Ctrl" elsewhere.
 */
export function getModKey(): string {
  if (typeof navigator === "undefined") return "⌘";
  return /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";
}
