import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import { homedir } from "os";
import type { QuickActionRequest, QuickActionResponse } from "@/lib/types";
import { sendGatewayCommand } from "@/lib/gateway/ws-client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuickActionRequest;
    const { action, agentId, sessionId, payload } = body;

    switch (action) {
      case "abort": {
        const result = await sendGatewayCommand("chat.abort", {
          agentId,
          ...(sessionId ? { sessionId } : {}),
        });
        if (result.error) {
          const response: QuickActionResponse = {
            success: false,
            message: "Abort failed",
            error: result.error.message,
          };
          return NextResponse.json({ data: response, source: "mock" });
        }
        return NextResponse.json({
          data: { success: true, message: "Session aborted" } satisfies QuickActionResponse,
          source: "live",
        });
      }

      case "restart": {
        await sendGatewayCommand("chat.abort", {
          agentId,
          ...(sessionId ? { sessionId } : {}),
        });
        const result = await sendGatewayCommand("chat.send", {
          agentId,
          message: "Session restarted by operator.",
        });
        if (result.error) {
          const response: QuickActionResponse = {
            success: false,
            message: "Restart failed",
            error: result.error.message,
          };
          return NextResponse.json({ data: response, source: "mock" });
        }
        return NextResponse.json({
          data: { success: true, message: "Agent restarted" } satisfies QuickActionResponse,
          source: "live",
        });
      }

      case "change-model": {
        const model = payload?.model;
        if (!model) {
          return NextResponse.json({
            data: { success: false, message: "No model specified", error: "Missing model" } satisfies QuickActionResponse,
            source: "mock",
          });
        }
        try {
          const configPath = path.join(homedir(), ".openclaw", "openclaw.json");
          const raw = await readFile(configPath, "utf-8");
          const config = JSON.parse(raw);
          if (!config.agents) config.agents = {};
          if (!config.agents[agentId]) config.agents[agentId] = {};
          config.agents[agentId].model = model;
          await writeFile(configPath, JSON.stringify(config, null, 2));
          return NextResponse.json({
            data: { success: true, message: `Model changed to ${model}` } satisfies QuickActionResponse,
            source: "live",
          });
        } catch (err) {
          return NextResponse.json({
            data: {
              success: false,
              message: "Failed to change model",
              error: err instanceof Error ? err.message : "Config write failed",
            } satisfies QuickActionResponse,
            source: "mock",
          });
        }
      }

      default:
        return NextResponse.json({
          data: { success: false, message: "Unknown action", error: `Unknown action: ${action}` } satisfies QuickActionResponse,
          source: "mock",
        });
    }
  } catch (error) {
    return NextResponse.json({
      data: {
        success: false,
        message: "Action failed",
        error: error instanceof Error ? error.message : "Unknown error",
      } satisfies QuickActionResponse,
      source: "mock",
    });
  }
}
