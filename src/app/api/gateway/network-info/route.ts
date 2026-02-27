import { NextResponse } from "next/server";
import { networkInterfaces } from "os";

export async function GET() {
  const nets = networkInterfaces();
  const addresses: { name: string; address: string }[] = [];

  for (const [name, interfaces] of Object.entries(nets)) {
    if (!interfaces) continue;
    for (const iface of interfaces) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.internal || iface.family !== "IPv4") continue;
      addresses.push({ name, address: iface.address });
    }
  }

  // Prefer en0 (typical Wi-Fi on macOS), then any non-docker/veth interface
  const preferred =
    addresses.find((a) => a.name === "en0") ||
    addresses.find(
      (a) => !a.name.startsWith("docker") && !a.name.startsWith("veth")
    ) ||
    addresses[0];

  return NextResponse.json({
    lanIp: preferred?.address || null,
    allAddresses: addresses,
  });
}
