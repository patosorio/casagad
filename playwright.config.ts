import { defineConfig, devices } from "@playwright/test";

const mobileSafari = devices["iPhone 14"];
const androidChrome = devices["Pixel 7"];
const desktop = devices["Desktop Chrome"];

if (!mobileSafari || !androidChrome || !desktop) {
  throw new Error("Playwright device descriptor missing");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile-safari", use: { ...mobileSafari } },
    { name: "android-chrome", use: { ...androidChrome } },
    { name: "desktop", use: { ...desktop } },
  ],
});
