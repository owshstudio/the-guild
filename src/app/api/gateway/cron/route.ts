import { NextRequest, NextResponse } from "next/server";
import { readCronJobs } from "@/lib/gateway/filesystem";
import { writeCronJobs } from "@/lib/gateway/cron-writer";
import { sanitizeErrorMessage } from "@/lib/gateway/validate";
import type { CronJob } from "@/lib/types";

export async function GET() {
  try {
    const cron = await readCronJobs();
    return NextResponse.json({ data: cron, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: { version: 1, jobs: [] },
      source: "mock",
      error: sanitizeErrorMessage(error),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const job = (await req.json()) as CronJob;

    // Prevent client from overriding the server-generated id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip server-managed fields
    const { id: _clientId, createdAt: _ca, updatedAt: _ua, ...safeFields } = job;

    const data = (await readCronJobs()) as { version: number; jobs: CronJob[] };
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newJob: CronJob = { ...safeFields, id, createdAt: now, updatedAt: now } as CronJob;
    data.jobs.push(newJob);
    await writeCronJobs(data);
    return NextResponse.json({ data: newJob, success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const job = (await req.json()) as CronJob;
    const data = (await readCronJobs()) as { version: number; jobs: CronJob[] };
    const idx = data.jobs.findIndex((j) => j.id === job.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }
    data.jobs[idx] = { ...job, updatedAt: new Date().toISOString() };
    await writeCronJobs(data);
    return NextResponse.json({ data: data.jobs[idx], success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }
    const data = (await readCronJobs()) as { version: number; jobs: CronJob[] };
    const before = data.jobs.length;
    data.jobs = data.jobs.filter((j) => j.id !== id);
    if (data.jobs.length === before) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }
    await writeCronJobs(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}
