import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = process.env.GUILD_API_TOKEN;

  // If no token is configured, skip auth (backwards compatible for local usage)
  if (!token) {
    return NextResponse.next();
  }

  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const provided = authHeader.slice("Bearer ".length);
    if (provided === token) {
      return NextResponse.next();
    }
  }

  // Fall back to cookie (for EventSource/SSE which can't set headers)
  const cookie = request.cookies.get("guild_token");
  if (cookie?.value === token) {
    return NextResponse.next();
  }

  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

export const config = {
  matcher: "/api/gateway/:path*",
};
