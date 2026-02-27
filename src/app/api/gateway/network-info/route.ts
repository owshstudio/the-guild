import { NextResponse } from "next/server";
import { networkInterfaces } from "os";

export async function GET() {
  const nets = networkInterfaces();
  const addresses: { name: string; address: string }[] = [];

  for (const [name, interfaces] of Object.entries(nets)) {
    if (!interfaces) continue;
    // Filter out docker/veth interfaces entirely
    if (name.startsWith("docker") || name.startsWith("veth")) continue;
    for (const iface of interfaces) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.internal || iface.family !== "IPv4") continue;
      addresses.push({ name, address: iface.address });
    }
  }

  // Prefer en0 (typical Wi-Fi on macOS), then first available
  const preferred =
    addresses.find((a) => a.name === "en0") || addresses[0];

  return NextResponse.json({
    lanIp: preferred?.address || null,
    allAddresses: addresses,
  });
}
