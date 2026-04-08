import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

// Rate limiting: 5 attempts per minute per IP
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  return entry.count > 5;
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  const token = process.env.GUILD_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "No API token configured on server" },
      { status: 400 }
    );
  }

  const provided = request.nextUrl.searchParams.get("token");

  if (!provided || typeof provided !== "string") {
    return NextResponse.json(
      { error: "Missing token parameter" },
      { status: 400 }
    );
  }

  // Constant-time comparison to prevent timing attacks
  const tokenBuf = Buffer.from(token);
  const providedBuf = Buffer.from(provided);

  if (
    tokenBuf.length !== providedBuf.length ||
    !timingSafeEqual(tokenBuf, providedBuf)
  ) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Use the Host header for the redirect base URL — request.url uses the
  // server's local address, which breaks when behind a tunnel/reverse proxy
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || request.nextUrl.host;
  const response = NextResponse.redirect(new URL("/guild", `${proto}://${host}`));

  response.cookies.set("guild_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
