import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { contentSecurityPolicy, createNonce } from "@/lib/security/csp";

const nonce = "dGVzdC1ub25jZQ==";

function directive(policy: string, name: string): string {
  const found = policy.split("; ").find((part) => part.startsWith(`${name} `) || part === name);
  if (found === undefined) throw new Error(`missing ${name}`);
  return found;
}

describe("content security policy", () => {
  it("builds a report-only script policy without unsafe-inline", () => {
    const policy = contentSecurityPolicy(nonce, false);
    const scriptSrc = directive(policy, "script-src");

    expect(policy).not.toContain("unsafe-inline");
    expect(policy).not.toContain("unsafe-eval");
    expect(scriptSrc).toContain(`'nonce-${nonce}'`);
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).toContain("https://www.google.com/recaptcha/");
    expect(scriptSrc).toContain("https://www.gstatic.com/recaptcha/");
    expect(scriptSrc).toContain("https://apis.google.com");
    expect(directive(policy, "style-src")).toBe(`style-src 'self' 'nonce-${nonce}'`);
    expect(directive(policy, "img-src")).toBe("img-src 'self' data: blob:");
    expect(policy).toContain("https://identitytoolkit.googleapis.com");
    expect(policy).toContain("https://securetoken.googleapis.com");
    expect(policy).toContain("https://content-firebaseappcheck.googleapis.com");
    expect(policy).not.toContain("firestore.googleapis.com");
    expect(policy).toContain("https://casagad-c1f81.firebaseapp.com");
    expect(policy).toContain("https://checkout.stripe.com");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).toContain("report-uri /api/csp-report");
  });

  it("adds unsafe-eval only for development, and only on script-src", () => {
    const policy = contentSecurityPolicy(nonce, true);
    expect(directive(policy, "script-src")).toContain("'unsafe-eval'");
    expect(directive(policy, "style-src")).not.toContain("unsafe-eval");
    expect(policy).not.toContain("unsafe-inline");
  });

  it("creates a fresh base64 nonce", () => {
    const first = createNonce();
    const second = createNonce();
    expect(first).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(first).not.toBe(second);
  });

  it("keeps the locale and nonce matcher off static files, feeds, and webhooks", () => {
    const source = readFileSync(new URL("../../proxy.ts", import.meta.url), "utf8");
    const matcher = source.match(/matcher:\s*\n\s*"([^"]+)"/)?.[1];
    expect(matcher).toBeTruthy();
    expect(matcher).toContain("_next/static");
    expect(matcher).toContain("_next/image");
    expect(matcher).toContain("fonts/");
    expect(matcher).toContain("images/");
    expect(matcher).toContain("favicon");
    expect(matcher).toContain("calendar/");
    expect(matcher).toContain("api/stripe/webhook");
    expect(matcher).toContain("api/internal/");
  });
});
