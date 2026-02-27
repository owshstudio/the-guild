/**
 * Input validation helpers for gateway API routes.
 */

/**
 * Returns an error message for the first missing/empty field, or null if all present.
 */
export function validateRequired(
  obj: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

/**
 * Validates a URL: only http/https, blocks internal IPs and localhost.
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost
    if (hostname === "localhost" || hostname === "localhost.localdomain") {
      return false;
    }

    // Block IPv6 loopback
    if (hostname === "[::1]" || hostname === "::1") {
      return false;
    }

    // Block internal/private IPs
    // Match IPv4 addresses
    const ipv4Match = hostname.match(
      /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    );
    if (ipv4Match) {
      const [, a, b, c] = ipv4Match.map(Number);
      // 127.x.x.x (loopback)
      if (a === 127) return false;
      // 10.x.x.x (private)
      if (a === 10) return false;
      // 172.16.0.0 - 172.31.255.255 (private)
      if (a === 172 && b >= 16 && b <= 31) return false;
      // 192.168.x.x (private)
      if (a === 192 && b === 168) return false;
      // 169.254.x.x (link-local)
      if (a === 169 && b === 254) return false;
      // 0.0.0.0
      if (a === 0 && b === 0 && c === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks that val is a string and within the given max length.
 */
export function validateStringLength(val: unknown, max: number): boolean {
  return typeof val === "string" && val.length <= max;
}

/**
 * Strips filesystem paths from error messages to avoid leaking server info.
 * Replaces /Users/*, /home/*, /root/*, ~/.openclaw/* patterns with [redacted].
 */
export function sanitizeErrorMessage(error: unknown): string {
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    return "An unexpected error occurred";
  }

  // Replace filesystem paths
  message = message.replace(/\/Users\/[^\s:,)}\]"']*/g, "[redacted]");
  message = message.replace(/\/home\/[^\s:,)}\]"']*/g, "[redacted]");
  message = message.replace(/\/root\/[^\s:,)}\]"']*/g, "[redacted]");
  message = message.replace(/~\/\.openclaw[^\s:,)}\]"']*/g, "[redacted]");
  message = message.replace(
    /[A-Z]:\\Users\\[^\s:,)}\]"']*/gi,
    "[redacted]"
  );

  return message;
}
