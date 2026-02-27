import { getConfig } from "./config";

export interface HealthStatus {
  connected: boolean;
  assistantName?: string;
  gatewayPort: number;
}

export async function checkHealth(): Promise<HealthStatus> {
  const config = await getConfig();
  const port = config.gatewayPort;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `http://localhost:${port}/__openclaw/control-ui-config.json`,
      { method: "GET", signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      try {
        const data = await res.json();
        return {
          connected: true,
          assistantName: data?.assistantName || data?.name,
          gatewayPort: port,
        };
      } catch {
        return { connected: true, gatewayPort: port };
      }
    }

    return { connected: false, gatewayPort: port };
  } catch {
    return { connected: false, gatewayPort: port };
  }
}
