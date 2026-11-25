import "server-only";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const MAX_BUCKETS = 1_000;
const MAX_BODY_CHARS = 8_192;
const MAX_REPORTS = 5;

export type CspReportLimiter = {
  allow(ip: string): boolean;
};

type Bucket = { count: number; windowStart: number };

type Violation = {
  directive: string;
  blocked: string;
  disposition: string;
};

export type CspReportSummary = {
  unreadable?: true;
  reports: Violation[];
};

/**
 * In-memory limit for one instance. It only stops a noisy log line.
 * It is not a security control: the map is dropped on restart and is not shared.
 */
export function createCspReportLimiter(options: {
  windowMs: number;
  max: number;
  maxBuckets?: number;
  now: () => number;
}): CspReportLimiter {
  const buckets = new Map<string, Bucket>();
  const maxBuckets = options.maxBuckets ?? MAX_BUCKETS;

  return {
    allow(ip: string): boolean {
      const now = options.now();
      const current = buckets.get(ip);
      if (current === undefined || now - current.windowStart >= options.windowMs) {
        if (current === undefined && buckets.size >= maxBuckets) return false;
        buckets.set(ip, { count: 1, windowStart: now });
        return true;
      }
      current.count += 1;
      return current.count <= options.max;
    },
  };
}

const sharedLimiter = createCspReportLimiter({
  windowMs: WINDOW_MS,
  max: MAX_PER_WINDOW,
  maxBuckets: MAX_BUCKETS,
  now: () => Date.now(),
});

type ReportSink = {
  limiter: CspReportLimiter;
  log: (line: string) => void;
};

const defaultSink: ReportSink = {
  limiter: sharedLimiter,
  log: (line) => {
    console.info(line);
  },
};

/** Accept one report, log a redacted summary, and never throw the body. */
export async function handleCspReport(request: Request, sink: ReportSink = defaultSink): Promise<void> {
  if (!sink.limiter.allow(clientAddress(request))) return;

  const summary = await readSummary(request);
  if (summary === null) return;
  sink.log(JSON.stringify({ event: "csp-report", ...summary }));
}

async function readSummary(request: Request): Promise<CspReportSummary | null> {
  let text: string;
  try {
    text = await request.text();
  } catch {
    return { unreadable: true, reports: [] };
  }
  if (text.trim() === "") return null;
  if (text.length > MAX_BODY_CHARS) return { unreadable: true, reports: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { unreadable: true, reports: [] };
  }

  const reports = violationsFrom(parsed);
  if (reports.length === 0) return { unreadable: true, reports: [] };
  return { reports };
}

function violationsFrom(value: unknown): Violation[] {
  const reports: Violation[] = [];
  const legacy = asRecord(value);
  if (legacy) {
    const inner = asRecord(legacy["csp-report"]);
    const item = inner ? violationFrom(inner) : null;
    if (item) reports.push(item);
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const record = asRecord(entry);
      const body = record ? asRecord(record.body) : null;
      const item = body ? violationFrom(body) : null;
      if (item) reports.push(item);
      if (reports.length >= MAX_REPORTS) break;
    }
  }
  return reports.slice(0, MAX_REPORTS);
}

function violationFrom(record: Record<string, unknown>): Violation | null {
  const directive = directiveFrom(record);
  if (directive === null) return null;
  return {
    directive,
    blocked: blockedFrom(record),
    disposition: dispositionFrom(record),
  };
}

function directiveFrom(record: Record<string, unknown>): string | null {
  const value =
    record["effective-directive"] ??
    record.effectiveDirective ??
    record["violated-directive"] ??
    record.violatedDirective;
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.replace(/'nonce-[^']*'/g, "'nonce'").slice(0, 120);
}

function blockedFrom(record: Record<string, unknown>): string {
  const value = record["blocked-uri"] ?? record.blockedURL ?? record.blockedUri;
  if (typeof value !== "string" || value.trim() === "") return "unknown";
  const trimmed = value.trim();
  if (
    trimmed === "inline" ||
    trimmed === "eval" ||
    trimmed === "data" ||
    trimmed === "blob" ||
    trimmed === "self"
  ) {
    return trimmed;
  }
  try {
    return new URL(trimmed).origin;
  } catch {
    return "redacted";
  }
}

function dispositionFrom(record: Record<string, unknown>): string {
  if (record.disposition === "report" || record.disposition === "enforce") return record.disposition;
  return "unknown";
}

function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded !== null) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
