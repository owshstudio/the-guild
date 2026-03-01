import { readFile } from "fs/promises";
import path from "path";
import { homedir } from "os";
import { getConfig } from "./config";

// OpenClaw gateway frame types
interface EventFrame {
  type: "event";
  event: string;
  payload: Record<string, unknown>;
  seq?: number;
}

interface ResponseFrame {
  type: "res";
  id: string;
  ok: boolean;
  payload?: Record<string, unknown>;
  error?: { code: string; message: string; retryable?: boolean };
}

type GatewayFrame = EventFrame | ResponseFrame;

async function getAuthToken(): Promise<string | null> {
  try {
    const raw = await readFile(
      path.join(homedir(), ".openclaw", "openclaw.json"),
      "utf-8"
    );
    const config = JSON.parse(raw);
    return config?.gateway?.auth?.token || null;
  } catch {
    return null;
  }
}

export async function sendGatewayCommand(
  method: string,
  params: Record<string, unknown>
): Promise<{ ok: boolean; payload?: Record<string, unknown>; error?: { code: string; message: string } }> {
  const config = await getConfig();
  const token = await getAuthToken();
  const host = process.env.OPENCLAW_GATEWAY_HOST || "localhost";
  const url = `ws://${host}:${config.gatewayPort}`;

  try {
    if (typeof WebSocket === "undefined") {
      return { ok: false, error: { code: "NO_WS", message: "WebSocket not available in this environment" } };
    }

    return await new Promise((resolve) => {
      const ws = new WebSocket(url);
      let authenticated = false;

      const timeout = setTimeout(() => {
        ws.close();
        resolve({ ok: false, error: { code: "TIMEOUT", message: "Gateway connection timed out after 15s" } });
      }, 15000);

      ws.onopen = () => {
        // Wait for connect.challenge event — don't send anything yet
      };

      ws.onmessage = (event) => {
        let frame: GatewayFrame;
        try {
          frame = JSON.parse(String(event.data)) as GatewayFrame;
        } catch {
          return;
        }

        // Step 1: Receive connect.challenge, send connect request
        if (frame.type === "event" && frame.event === "connect.challenge") {
          const connectReq = JSON.stringify({
            type: "req",
            id: crypto.randomUUID(),
            method: "connect",
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: "gateway-client",
                version: "0.5.0",
                platform: process.platform,
                mode: "backend",
                displayName: "The Guild",
                instanceId: `guild-${Date.now()}`,
              },
              role: "operator",
              scopes: ["operator.admin"],
              caps: [],
              commands: [],
              auth: token ? { token } : {},
            },
          });

          ws.send(connectReq);
          return;
        }

        // Step 2: Receive hello-ok, then send the actual command
        if (frame.type === "res" && !authenticated) {
          if (frame.ok) {
            authenticated = true;

            // Now send the actual command
            const reqId = crypto.randomUUID();
            const reqFrame = JSON.stringify({
              type: "req",
              id: reqId,
              method,
              params,
            });

            ws.send(reqFrame);
          } else {
            clearTimeout(timeout);
            ws.close();
            resolve({
              ok: false,
              error: {
                code: frame.error?.code || "AUTH_FAILED",
                message: frame.error?.message || "Gateway authentication failed",
              },
            });
          }
          return;
        }

        // Step 3: Receive the command response
        if (frame.type === "res" && authenticated) {
          clearTimeout(timeout);
          ws.close();

          if (frame.ok) {
            resolve({ ok: true, payload: frame.payload });
          } else {
            resolve({
              ok: false,
              error: {
                code: frame.error?.code || "COMMAND_FAILED",
                message: frame.error?.message || "Command failed",
              },
            });
          }
          return;
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve({ ok: false, error: { code: "CONNECTION_FAILED", message: `Could not connect to gateway at ${url}` } });
        ws.close();
      };
    });
  } catch {
    return { ok: false, error: { code: "WS_ERROR", message: "WebSocket not available" } };
  }
}
