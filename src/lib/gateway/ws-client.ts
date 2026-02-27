import { readFile } from "fs/promises";
import path from "path";
import { homedir } from "os";
import { getConfig } from "./config";

interface JsonRpcResponse {
  jsonrpc: string;
  id: string;
  result?: unknown;
  error?: { code: number; message: string };
}

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
): Promise<JsonRpcResponse> {
  const config = await getConfig();
  const token = await getAuthToken();
  const url = `ws://localhost:${config.gatewayPort}`;
  const id = crypto.randomUUID();

  const message = JSON.stringify({
    jsonrpc: "2.0",
    method,
    params: { ...params, ...(token ? { token } : {}) },
    id,
  });

  try {
    if (typeof WebSocket === "undefined") {
      return { jsonrpc: "2.0", id, error: { code: -1, message: "WebSocket not available" } };
    }

    return await new Promise<JsonRpcResponse>((resolve) => {
      const ws = new WebSocket(url);
      const timeout = setTimeout(() => {
        ws.close();
        resolve({ jsonrpc: "2.0", id, error: { code: -2, message: "Timeout after 5s" } });
      }, 5000);

      ws.onopen = () => {
        ws.send(message);
      };

      ws.onmessage = (event) => {
        clearTimeout(timeout);
        try {
          const data = JSON.parse(String(event.data)) as JsonRpcResponse;
          resolve(data);
        } catch {
          resolve({ jsonrpc: "2.0", id, error: { code: -3, message: "Invalid response" } });
        }
        ws.close();
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve({ jsonrpc: "2.0", id, error: { code: -4, message: "Connection failed" } });
        ws.close();
      };
    });
  } catch {
    return { jsonrpc: "2.0", id, error: { code: -1, message: "WebSocket not available" } };
  }
}
