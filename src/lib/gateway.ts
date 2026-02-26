const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4444";

export async function checkGatewayHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${GATEWAY_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export function getGatewayUrl(): string {
  return GATEWAY_URL;
}

export function isLocalDev(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}
