import { NextRequest } from "next/server";
import { findSessionById } from "@/lib/gateway/filesystem";
import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { FileWatcher } from "@/lib/gateway/file-watcher";
import path from "path";

const KEEPALIVE_MS = 15_000;
const INACTIVE_TIMEOUT_MS = 5 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const filepath = await findSessionById(id);
  if (!filepath) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const sessionPath = filepath; // non-null guaranteed by early return above

  const stream = new ReadableStream({
    async start(controller) {
      let byteOffset = 0;
      let inactiveTimer: ReturnType<typeof setTimeout>;
      // eslint-disable-next-line prefer-const -- assigned once but must be declared before cleanup references it
      let keepaliveTimer: ReturnType<typeof setInterval>;
      let closed = false;
      const watcher = new FileWatcher();

      function cleanup() {
        if (closed) return;
        closed = true;
        watcher.close();
        clearTimeout(inactiveTimer);
        clearInterval(keepaliveTimer);
        try {
          controller.close();
        } catch {
          // already closed
        }
      }

      // Clean up immediately when client disconnects
      request.signal.addEventListener("abort", cleanup);

      function resetInactiveTimer() {
        clearTimeout(inactiveTimer);
        inactiveTimer = setTimeout(cleanup, INACTIVE_TIMEOUT_MS);
      }

      // Read new lines from the file starting at byteOffset
      async function readNewLines() {
        if (closed) return;
        try {
          const fileStat = await stat(sessionPath);
          if (fileStat.size <= byteOffset) return;

          const newData = await readRange(sessionPath, byteOffset, fileStat.size);
          byteOffset = fileStat.size;

          const lines = newData.split("\n").filter((l) => l.trim());
          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(entry)}\n\n`)
              );
            } catch {
              // skip malformed lines
            }
          }

          resetInactiveTimer();
        } catch {
          // file read error — stop streaming
          cleanup();
        }
      }

      // Get initial file size as starting offset (only stream new content)
      try {
        const initialStat = await stat(sessionPath);
        byteOffset = initialStat.size;
      } catch {
        cleanup();
        return;
      }

      // Watch the session file's parent directory for changes
      const dir = path.dirname(sessionPath);
      const filename = path.basename(sessionPath);
      watcher.watch(dir);
      watcher.on("change", (changedFile: string) => {
        if (changedFile === filename) {
          readNewLines();
        }
      });

      // Keepalive ping
      keepaliveTimer = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(":ping\n\n"));
        } catch {
          cleanup();
        }
      }, KEEPALIVE_MS);

      // Start inactive timer
      resetInactiveTimer();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

async function readRange(
  filepath: string,
  start: number,
  end: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const rs = createReadStream(filepath, { start, end: end - 1 });
    rs.on("data", (chunk) => chunks.push(chunk as Buffer));
    rs.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    rs.on("error", reject);
  });
}
