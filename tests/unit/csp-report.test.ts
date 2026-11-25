import { describe, expect, it } from "vitest";
import { createCspReportLimiter, handleCspReport } from "@/server/security/csp-report";

const secretEmail = "guest@example.com";
const nonce = "abc+def/123=";

function post(body: string, ip = "203.0.113.8"): Request {
  return new Request("http://127.0.0.1/api/csp-report", {
    method: "POST",
    headers: { "content-type": "application/csp-report", "x-forwarded-for": `${ip}, 10.0.0.1` },
    body,
  });
}

describe("csp reports", () => {
  it("logs the directive and the blocked origin, and drops the body", async () => {
    const lines: string[] = [];
    const payload = {
      "csp-report": {
        "document-uri": `https://casagad.com/prenota/?email=${secretEmail}`,
        referrer: `https://casagad.com/?email=${secretEmail}`,
        "violated-directive": `script-src 'nonce-${nonce}'`,
        "effective-directive": `script-src 'nonce-${nonce}'`,
        "blocked-uri": "https://evil.example/script.js?token=secret",
        "original-policy": `script-src 'nonce-${nonce}'`,
        "script-sample": secretEmail,
        disposition: "report",
        "status-code": 200,
      },
    };

    await handleCspReport(post(JSON.stringify(payload)), {
      limiter: createCspReportLimiter({ windowMs: 60_000, max: 10, now: () => 0 }),
      log: (line) => lines.push(line),
    });

    expect(lines).toHaveLength(1);
    const line = lines[0] ?? "";
    expect(line).toContain("script-src");
    expect(line).toContain("https://evil.example");
    expect(line).toContain("report");
    expect(line).not.toContain(secretEmail);
    expect(line).not.toContain(nonce);
    expect(line).not.toContain("token");
    expect(line).not.toContain("secret");
    expect(line).not.toContain("original-policy");
    expect(line).not.toContain("document-uri");
  });

  it("reads a reporting-api list the same way", async () => {
    const lines: string[] = [];
    const payload = [
      {
        type: "csp-violation",
        url: `https://casagad.com/?email=${secretEmail}`,
        body: {
          effectiveDirective: "style-src",
          blockedURL: "inline",
          disposition: "report",
          sample: secretEmail,
          originalPolicy: `style-src 'nonce-${nonce}'`,
        },
      },
    ];

    await handleCspReport(post(JSON.stringify(payload)), {
      limiter: createCspReportLimiter({ windowMs: 60_000, max: 10, now: () => 0 }),
      log: (line) => lines.push(line),
    });

    const line = lines[0] ?? "";
    expect(line).toContain("style-src");
    expect(line).toContain("inline");
    expect(line).not.toContain(secretEmail);
    expect(line).not.toContain(nonce);
  });

  it("logs an unreadable report without the payload", async () => {
    const lines: string[] = [];
    await handleCspReport(post(`not-json ${secretEmail}`), {
      limiter: createCspReportLimiter({ windowMs: 60_000, max: 10, now: () => 0 }),
      log: (line) => lines.push(line),
    });
    expect(lines[0]).toContain("unreadable");
    expect(lines[0]).not.toContain(secretEmail);
  });

  it("stops logging for one address after the window fills", async () => {
    const lines: string[] = [];
    let now = 0;
    const limiter = createCspReportLimiter({ windowMs: 1_000, max: 1, now: () => now });
    const sink = { limiter, log: (line: string) => lines.push(line) };
    const body = JSON.stringify({
      "csp-report": { "effective-directive": "script-src", "blocked-uri": "inline", disposition: "report" },
    });

    await handleCspReport(post(body, "203.0.113.9"), sink);
    await handleCspReport(post(body, "203.0.113.9"), sink);
    await handleCspReport(post(body, "203.0.113.10"), sink);
    expect(lines).toHaveLength(2);

    now = 1_000;
    await handleCspReport(post(body, "203.0.113.9"), sink);
    expect(lines).toHaveLength(3);
  });
});
