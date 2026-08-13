import assert from "node:assert/strict";
import { StorageRegistry, objectValidator } from "../src/v2/data/storage-registry.mjs";
import { createLegacyStorageRegistry, LEGACY_STORAGE_KEYS, currentPersistentModuleIds } from "../src/v2/data/legacy-storage-manifest.mjs";

const registry = createLegacyStorageRegistry();
const ids = currentPersistentModuleIds();
assert.deepEqual(ids, ["state", "preferences", "focusPreferences", "programs", "formats"]);
assert.equal(registry.get("formats").storageKey, "qtimer-dapchigi-formats-v1");
assert.equal(registry.get("state").storageKey, LEGACY_STORAGE_KEYS.state);

const stored = new Map([
  [LEGACY_STORAGE_KEYS.state, { attempts: [{ id: "a1" }], overrides: {}, flags: {}, currentIndex: 2 }],
  [LEGACY_STORAGE_KEYS.preferences, { version: 3, display: { scaleLevel: 5 } }],
  [LEGACY_STORAGE_KEYS.focusPreferences, { version: 1, keyword: {} }],
  [LEGACY_STORAGE_KEYS.programs, { version: 1, programs: [{ id: "p1" }] }],
  [LEGACY_STORAGE_KEYS.formats, { version: 1, formats: [{ id: "f1" }] }]
]);

const backup = registry.buildBackup(key => stored.get(key), {
  exportedAt: "2026-08-13T00:00:00.000Z",
  appVersion: "v2-foundation",
  questionBankVersion: "fixture-973"
});

assert.equal(backup.format, "qtimer-backup");
assert.equal(backup.version, 2);
assert.deepEqual(Object.keys(backup.modules), ids);
assert.equal(backup.modules.formats.data.formats[0].id, "f1");
assert.equal(backup.questionBankVersion, "fixture-973");

const plan = registry.prepareImport(backup);
assert.equal(plan.writes.length, 5);
assert.equal(plan.writes.find(write => write.id === "formats").storageKey, LEGACY_STORAGE_KEYS.formats);
assert.equal(plan.writes.find(write => write.id === "state").data.attempts.length, 1);

// Invalid state fails during prepareImport; no persistence callback exists in this pure phase,
// proving the contract validates everything before a future adapter can commit writes.
const broken = JSON.parse(JSON.stringify(backup));
broken.modules.state.data.attempts = "not-an-array";
assert.throws(() => registry.prepareImport(broken), /attempts must be an array/);

const unknown = JSON.parse(JSON.stringify(backup));
unknown.modules.injected = { schemaVersion: 1, data: {} };
assert.throws(() => registry.prepareImport(unknown), /unknown modules/i);

// Registry rejects ambiguous ownership.
const duplicateIdRegistry = new StorageRegistry();
duplicateIdRegistry.register({ id: "state", storageKey: "one", schemaVersion: 1, defaultValue: {}, validate: objectValidator() });
assert.throws(() => duplicateIdRegistry.register({ id: "state", storageKey: "two", schemaVersion: 1, defaultValue: {}, validate: objectValidator() }), /Duplicate storage module id/);

const duplicateKeyRegistry = new StorageRegistry();
duplicateKeyRegistry.register({ id: "alpha", storageKey: "same", schemaVersion: 1, defaultValue: {}, validate: objectValidator() });
assert.throws(() => duplicateKeyRegistry.register({ id: "beta", storageKey: "same", schemaVersion: 1, defaultValue: {}, validate: objectValidator() }), /Duplicate storageKey/);

console.log("# QTimer V2 storage registry smoke");
console.log("PASS: current persisted module inventory is centralized");
console.log("PASS: Dapchigi formats are included in registry backup");
console.log("PASS: all modules validate before import plan is returned");
console.log("PASS: unknown modules / duplicate ownership are rejected");
