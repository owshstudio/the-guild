import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = process.env.GUILD_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "No API token configured on server" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const provided = body?.token;

  if (!provided || provided !== token) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("guild_token", token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    // No maxAge = session cookie (cleared when browser closes)
    // For persistent auth, user re-enters token after restart
  });

  return response;
}
