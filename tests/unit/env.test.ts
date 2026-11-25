import { afterEach, describe, expect, it } from "vitest";
import { getServerEnv, requireServerEnv, serverEnvKeys, type ServerEnvKey } from "@/server/config/env";

const leaked = "sk_test_DO_NOT_LEAK_991";
const previous = new Map<ServerEnvKey, string | undefined>();

for (const key of serverEnvKeys) {
  previous.set(key, process.env[key]);
}

afterEach(() => {
  for (const key of serverEnvKeys) {
    const value = previous.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("server env", () => {
  it("accepts missing values", () => {
    clearServerEnv();
    const env = getServerEnv();
    for (const key of serverEnvKeys) {
      expect(env[key]).toBeUndefined();
    }
  });

  it("names a missing variable and does not print a value", () => {
    clearServerEnv();
    process.env.EMAIL_API_KEY = leaked;
    expect(() => requireServerEnv("STRIPE_SECRET_KEY")).toThrow(
      "Missing server environment variable STRIPE_SECRET_KEY.",
    );
    try {
      requireServerEnv("STRIPE_SECRET_KEY");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).not.toContain(leaked);
      expect(message).not.toContain("EMAIL_API_KEY");
    }
  });

  it("names an invalid variable and does not print the value", () => {
    clearServerEnv();
    process.env.APP_BASE_URL = `not-a-url ${leaked}`;
    expect(() => getServerEnv()).toThrow("Invalid server environment variable APP_BASE_URL.");
    try {
      getServerEnv();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).not.toContain(leaked);
    }
  });

  it("returns a trimmed present value to the caller", () => {
    clearServerEnv();
    process.env.APP_BASE_URL = " https://casagad.com ";
    process.env.SCHEDULER_SA_EMAIL = "scheduler@casagad.com";
    process.env.STRIPE_SECRET_KEY = "   ";
    const env = getServerEnv();
    expect(env.APP_BASE_URL).toBe("https://casagad.com");
    expect(env.SCHEDULER_SA_EMAIL).toBe("scheduler@casagad.com");
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
    expect(requireServerEnv("APP_BASE_URL")).toBe("https://casagad.com");
  });
});

function clearServerEnv(): void {
  for (const key of serverEnvKeys) delete process.env[key];
}
