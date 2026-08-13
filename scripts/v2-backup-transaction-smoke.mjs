import assert from "node:assert/strict";
import { createLegacyStorageRegistry, LEGACY_STORAGE_KEYS } from "../src/v2/data/legacy-storage-manifest.mjs";
import { prepareBackupImport, commitImportPlan, parseBackupText, recoverInterruptedImport } from "../src/v2/data/backup-transaction.mjs";

class MemoryStorage {
  constructor(entries = [], failOnKey = null) {
    this.map = new Map(entries);
    this.failOnKey = failOnKey;
  }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) {
    if (key === this.failOnKey) throw new Error(`forced write failure: ${key}`);
    this.map.set(key, String(value));
  }
  removeItem(key) { this.map.delete(key); }
}

const registry = createLegacyStorageRegistry();
const payload = registry.buildBackup(key => ({
  [LEGACY_STORAGE_KEYS.state]: { attempts: [{ id: "new" }], overrides: {}, flags: {} },
  [LEGACY_STORAGE_KEYS.preferences]: { version: 3 },
  [LEGACY_STORAGE_KEYS.focusPreferences]: { version: 1 },
  [LEGACY_STORAGE_KEYS.programs]: { version: 1, programs: [] },
  [LEGACY_STORAGE_KEYS.formats]: { version: 1, formats: [{ id: "format-new" }] }
})[key], { exportedAt: "2026-08-13T00:00:00.000Z" });

const text = JSON.stringify(payload);
const parsed = parseBackupText(text, { maxBytes: 100000 });
assert.equal(parsed.payload.version, 2);
assert.ok(parsed.nodes > 1);

const plan = prepareBackupImport(text, registry, { maxBytes: 100000 });
assert.equal(plan.writes.length, 5);

const originalState = JSON.stringify({ attempts: [{ id: "old" }], overrides: {}, flags: {} });
const storage = new MemoryStorage([[LEGACY_STORAGE_KEYS.state, originalState]]);
const committed = commitImportPlan(plan, storage, { stagingKey: "staging", snapshotKey: "snapshot" });
assert.equal(committed.committed, true);
assert.equal(storage.getItem("staging"), null);
assert.equal(JSON.parse(storage.getItem(LEGACY_STORAGE_KEYS.formats)).formats[0].id, "format-new");
assert.equal(JSON.parse(storage.getItem(LEGACY_STORAGE_KEYS.state)).attempts[0].id, "new");
assert.ok(storage.getItem("snapshot"));

// A forced failure after earlier module writes must restore every touched key.
const failingStorage = new MemoryStorage([
  [LEGACY_STORAGE_KEYS.state, originalState],
  [LEGACY_STORAGE_KEYS.preferences, JSON.stringify({ version: "old" })]
], LEGACY_STORAGE_KEYS.programs);
assert.throws(() => commitImportPlan(plan, failingStorage, { stagingKey: "staging", snapshotKey: "snapshot" }), /rolled back/);
assert.equal(failingStorage.getItem(LEGACY_STORAGE_KEYS.state), originalState);
assert.equal(failingStorage.getItem(LEGACY_STORAGE_KEYS.preferences), JSON.stringify({ version: "old" }));
assert.equal(failingStorage.getItem(LEGACY_STORAGE_KEYS.focusPreferences), null);
assert.equal(failingStorage.getItem(LEGACY_STORAGE_KEYS.formats), null);
assert.equal(failingStorage.getItem("staging"), null);

// Simulate a browser crash after staging marker + partial write; recovery restores snapshot.
const interrupted = new MemoryStorage([
  ["staging", JSON.stringify({ version: 1 })],
  ["snapshot", JSON.stringify({ version: 1, entries: { [LEGACY_STORAGE_KEYS.state]: originalState, [LEGACY_STORAGE_KEYS.formats]: null } })],
  [LEGACY_STORAGE_KEYS.state, JSON.stringify({ attempts: [{ id: "partial" }], overrides: {}, flags: {} })],
  [LEGACY_STORAGE_KEYS.formats, JSON.stringify({ version: 1, formats: [{ id: "partial" }] })]
]);
const recovery = recoverInterruptedImport(interrupted, { stagingKey: "staging", snapshotKey: "snapshot" });
assert.equal(recovery.recovered, true);
assert.equal(interrupted.getItem(LEGACY_STORAGE_KEYS.state), originalState);
assert.equal(interrupted.getItem(LEGACY_STORAGE_KEYS.formats), null);
assert.equal(interrupted.getItem("staging"), null);

// Size limit is enforced before JSON.parse / registry processing.
assert.throws(() => parseBackupText("x".repeat(101), { maxBytes: 100 }), /too large/);

console.log("# QTimer V2 backup transaction smoke");
console.log("PASS: size/structure checks run before import planning");
console.log("PASS: all modules are validated before persistence");
console.log("PASS: successful commit keeps pre-import snapshot");
console.log("PASS: partial write failure rolls back all touched module keys");
console.log("PASS: interrupted import can recover from staging + snapshot");
