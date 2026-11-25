export function emulatorEndpoint(name: string, fallbackPort: number): { host: string; port: number } {
  const raw = process.env[name]?.trim();
  if (raw === undefined || raw.length === 0) return { host: "127.0.0.1", port: fallbackPort };
  const separator = raw.lastIndexOf(":");
  const host = separator === -1 ? raw : raw.slice(0, separator);
  const port = Number(separator === -1 ? "" : raw.slice(separator + 1));
  return {
    host: host.length > 0 ? host : "127.0.0.1",
    port: Number.isInteger(port) ? port : fallbackPort,
  };
}

export function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return "";
}
