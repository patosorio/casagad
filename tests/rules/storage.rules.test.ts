import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getMetadata, ref, uploadBytes } from "firebase/storage";
import { assertFails, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, expect, it } from "vitest";
import { emulatorEndpoint, errorCode } from "./support";

const rules = readFileSync(join(process.cwd(), "storage.rules"), "utf8");
const endpoint = emulatorEndpoint("FIREBASE_STORAGE_EMULATOR_HOST", 9199);
const paths = ["receipts/2027/2027-0001.pdf", "exports/uid/income.csv", "probe.txt"];

let testEnv: RulesTestEnvironment | undefined;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-casagad-storage",
    storage: { rules, host: endpoint.host, port: endpoint.port },
  });
}, 30_000);

afterAll(async () => {
  await testEnv?.cleanup();
});

it("denies anonymous, family, and owner reads and writes on every object", async () => {
  if (!testEnv) throw new Error("Rules test environment did not start.");
  const actors = [
    { name: "anonymous", storage: testEnv.unauthenticatedContext().storage() },
    { name: "family-claim", storage: testEnv.authenticatedContext("family-user", { role: "family" }).storage() },
    { name: "owner-claim", storage: testEnv.authenticatedContext("owner-user", { role: "owner" }).storage() },
  ];

  for (const actor of actors) {
    for (const path of paths) {
      const file = ref(actor.storage, path);
      await expectDenied(getMetadata(file), `${actor.name} read ${path}`);
      await expectDenied(uploadBytes(file, new Uint8Array([1])), `${actor.name} write ${path}`);
    }
  }
}, 120_000);

async function expectDenied(promise: Promise<unknown>, label: string): Promise<void> {
  let error: unknown;
  try {
    error = await assertFails(promise);
  } catch {
    throw new Error(`${label} was allowed.`);
  }
  expect(errorCode(error), label).toMatch(/unauthorized|permission-denied/);
}
