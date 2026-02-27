import { NextRequest } from "next/server";
import { getConfig } from "@/lib/gateway/config";
import { FileWatcher } from "@/lib/gateway/file-watcher";

const KEEPALIVE_MS = 15_000;

export async function GET(request: NextRequest) {
  const config = await getConfig();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const agentWatcher = new FileWatcher();
      const cronWatcher = new FileWatcher();

      function cleanup() {
        if (closed) return;
        closed = true;
        agentWatcher.close();
        cronWatcher.close();
        clearInterval(keepaliveTimer);
        try {
          controller.close();
        } catch {
          // already closed
        }
      }

      // Clean up immediately when client disconnects
      request.signal.addEventListener("abort", cleanup);

      function send(event: string, data: Record<string, string>) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          cleanup();
        }
      }

      // Watch ~/.openclaw/agents/ recursively for all changes
      agentWatcher.watch(config.agentsPath, { recursive: true });

      agentWatcher.on("change", (filePath: string) => {
        const normalized = filePath.replace(/\\/g, "/");

        if (normalized.includes("/sessions/") && normalized.endsWith(".jsonl")) {
          const parts = normalized.split("/");
          const sessionsIdx = parts.indexOf("sessions");
          const agentId = sessionsIdx > 0 ? parts[sessionsIdx - 1] : "unknown";
          const sessionFile = parts[parts.length - 1];
          const sessionId = sessionFile.replace(".jsonl", "");
          send("session-change", { agentId, sessionId });
        } else {
          const parts = normalized.split("/");
          const agentId = parts[0] || "unknown";
          send("agent-change", { agentId });
        }
      });

      // Watch cron directory
      cronWatcher.watch(config.cronPath);
      cronWatcher.on("change", () => {
        send("cron-change", {});
      });

      // Keepalive ping
      const keepaliveTimer = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(":ping\n\n"));
        } catch {
          cleanup();
        }
      }, KEEPALIVE_MS);
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
