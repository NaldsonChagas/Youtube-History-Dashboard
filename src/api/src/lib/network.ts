import { networkInterfaces } from "os";

export function getNetworkBaseUrl(port: number): string {
  const ifaces = networkInterfaces();
  for (const addrs of Object.values(ifaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === "IPv4" && !addr.internal) {
        return `http://${addr.address}:${port}`;
      }
    }
  }
  return `http://localhost:${port}`;
}
