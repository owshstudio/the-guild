/**
 * Strip raw metadata from message content so the UI displays clean text.
 *
 * Removes:
 *  - Timestamps like `[Sat 2026-02-28 22:07 EST]`
 *  - System tags like `[[reply_to_current]]` or `[[thinking]]`
 *  - Leading/trailing whitespace
 */

// Matches `[Day YYYY-MM-DD HH:MM TZ]` (optional seconds, optional day-of-week)
const TIMESTAMP_RE =
  /\[(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}(?::\d{2})?\s+[A-Z]{1,5}\]/g;

// Matches `[[anything]]`
const SYSTEM_TAG_RE = /\[\[[^\]]*\]\]/g;

export function sanitizeContent(text: string): string {
  return text
    .replace(TIMESTAMP_RE, "")
    .replace(SYSTEM_TAG_RE, "")
    .replace(/^\s+|\s+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
