import { NextRequest, NextResponse } from "next/server";
import {
  getChains,
  createChain,
  updateChain,
  deleteChain,
} from "@/lib/gateway/chain-engine";

export async function GET() {
  try {
    const data = await getChains();
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: [],
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to read chains",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await createChain(body);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create chain" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Missing chain id" }, { status: 400 });
    }
    const data = await updateChain(body);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update chain" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing chain id" }, { status: 400 });
    }

    const data = await deleteChain(id);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete chain" },
      { status: 500 }
    );
  }
}
