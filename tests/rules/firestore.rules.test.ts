import { readFileSync } from "node:fs";
import { join } from "node:path";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { assertFails, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, expect, it } from "vitest";
import { firestoreDocuments } from "@/shared/collections";
import { emulatorEndpoint, errorCode } from "./support";

const rules = readFileSync(join(process.cwd(), "firestore.rules"), "utf8");
const endpoint = emulatorEndpoint("FIRESTORE_EMULATOR_HOST", 8080);

let testEnv: RulesTestEnvironment | undefined;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-casagad-rules",
    firestore: { rules, host: endpoint.host, port: endpoint.port },
  });
}, 30_000);

afterAll(async () => {
  await testEnv?.cleanup();
});

it("denies anonymous, family, and owner reads and writes on every document", async () => {
  if (!testEnv) throw new Error("Rules test environment did not start.");
  const actors = [
    { name: "anonymous", db: testEnv.unauthenticatedContext().firestore() },
    { name: "family-claim", db: testEnv.authenticatedContext("family-user", { role: "family" }).firestore() },
    { name: "owner-claim", db: testEnv.authenticatedContext("owner-user", { role: "owner" }).firestore() },
  ];

  for (const actor of actors) {
    for (const stored of firestoreDocuments) {
      const ref = doc(actor.db, stored.path);
      await expectDenied(getDoc(ref), `${actor.name} read ${stored.path}`);
      await expectDenied(setDoc(ref, { probe: true }), `${actor.name} write ${stored.path}`);
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
  expect(errorCode(error), label).toMatch(/permission-denied/);
}
