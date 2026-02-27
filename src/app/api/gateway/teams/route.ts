import { NextRequest, NextResponse } from "next/server";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/lib/gateway/teams-manager";
import {
  validateRequired,
  validateStringLength,
  sanitizeErrorMessage,
} from "@/lib/gateway/validate";

export async function GET() {
  try {
    const data = await getTeams();
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: [],
      source: "mock",
      error: sanitizeErrorMessage(error),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const missing = validateRequired(body, ["name", "description", "leadAgentId"]);
    if (missing) {
      return NextResponse.json({ error: missing }, { status: 400 });
    }

    if (!validateStringLength(body.name, 100)) {
      return NextResponse.json(
        { error: "name must be a string of at most 100 characters" },
        { status: 400 }
      );
    }
    if (!validateStringLength(body.description, 500)) {
      return NextResponse.json(
        { error: "description must be a string of at most 500 characters" },
        { status: 400 }
      );
    }
    if (typeof body.leadAgentId !== "string") {
      return NextResponse.json(
        { error: "leadAgentId must be a string" },
        { status: 400 }
      );
    }

    const data = await createTeam(body);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const missing = validateRequired(body, ["id", "name", "description", "leadAgentId"]);
    if (missing) {
      return NextResponse.json({ error: missing }, { status: 400 });
    }

    if (!validateStringLength(body.name, 100)) {
      return NextResponse.json(
        { error: "name must be a string of at most 100 characters" },
        { status: 400 }
      );
    }
    if (!validateStringLength(body.description, 500)) {
      return NextResponse.json(
        { error: "description must be a string of at most 500 characters" },
        { status: 400 }
      );
    }
    if (typeof body.leadAgentId !== "string") {
      return NextResponse.json(
        { error: "leadAgentId must be a string" },
        { status: 400 }
      );
    }

    const data = await updateTeam(body);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
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
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}
