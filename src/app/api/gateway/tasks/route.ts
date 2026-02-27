import { NextRequest, NextResponse } from "next/server";
import {
  loadTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/gateway/task-store";

export async function GET() {
  try {
    const tasks = await loadTasks();
    return NextResponse.json({ data: tasks, source: "live" });
  } catch (error) {
    return NextResponse.json(
      {
        data: [],
        source: "error",
        error: error instanceof Error ? error.message : "Failed to load tasks",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.agentId || !body.status || !body.priority) {
      return NextResponse.json(
        { error: "Missing required fields: title, agentId, status, priority" },
        { status: 400 }
      );
    }

    const task = await createTask({
      title: body.title,
      description: body.description || "",
      agentId: body.agentId,
      status: body.status,
      priority: body.priority,
      dueDate: body.dueDate || null,
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create task",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const updated = await updateTask(body.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update task",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required query param: id" },
        { status: 400 }
      );
    }

    const deleted = await deleteTask(id);
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete task",
      },
      { status: 500 }
    );
  }
}
