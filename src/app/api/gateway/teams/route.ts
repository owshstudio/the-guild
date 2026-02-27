import { NextRequest, NextResponse } from "next/server";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/lib/gateway/teams-manager";

export async function GET() {
  try {
    const data = await getTeams();
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: [],
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to read teams",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await createTeam(body);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create team" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Missing team id" }, { status: 400 });
    }
    const data = await updateTeam(body);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing team id" }, { status: 400 });
    }

    const data = await deleteTeam(id);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete team" },
      { status: 500 }
    );
  }
}
