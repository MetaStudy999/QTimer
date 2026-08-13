import assert from "node:assert/strict";
import { createV2StorageRegistry, V2_PERSISTENT_MODULE_IDS } from "../src/v2/data/v2-storage-manifest.mjs";
import { V2_STORAGE_KEYS } from "../src/v2/data/legacy-storage-manifest.mjs";

const registry = createV2StorageRegistry();
assert.deepEqual(registry.list().map(module => module.id), V2_PERSISTENT_MODULE_IDS);
assert.equal(new Set(registry.list().map(module => module.storageKey)).size, V2_PERSISTENT_MODULE_IDS.length);
assert.equal(registry.get("transforms").storageKey, V2_STORAGE_KEYS.transforms);
assert.equal(registry.get("formats").storageKey, V2_STORAGE_KEYS.formats);
assert.equal(registry.get("preferences").schemaVersion, 4);

const backup = registry.buildBackup(() => null, {
  exportedAt: "2026-08-13T00:00:00.000Z",
  appVersion: "v2-foundation",
  questionBankVersion: "973-baseline"
});
assert.deepEqual(Object.keys(backup.modules), V2_PERSISTENT_MODULE_IDS);
assert.ok(backup.modules.formats.data.formats.length >= 4);
assert.deepEqual(backup.modules.transforms.data.transforms, []);
assert.deepEqual(backup.modules.notes.data.byQuestionId, {});
assert.equal(backup.modules.preferences.schemaVersion, 4);

// A legacy Settings v3-shaped module inside a V2 backup envelope migrates before a write plan is returned.
const legacyPreferenceBackup = JSON.parse(JSON.stringify(backup));
legacyPreferenceBackup.modules.preferences = {
  schemaVersion: 3,
  data: {
    version: 3,
    dapchigi: {
      question: { fontColor: "#16324f", highlightColor: "#dceeff", theme: "focus-blue" },
      answer: { fontColor: "#991b1b", highlightColor: "#fee2e2", theme: "key-red", keywordRed: true }
    },
    display: { scaleLevel: 6 }
  }
};
const plan = registry.prepareImport(legacyPreferenceBackup);
const preferenceWrite = plan.writes.find(write => write.id === "preferences");
assert.equal(preferenceWrite.schemaVersion, 4);
assert.equal(preferenceWrite.data.presentation.question.theme, "focus-blue");
assert.equal(preferenceWrite.data.display.scaleLevel, 6);
assert.equal(Object.hasOwn(preferenceWrite.data, "dapchigi"), false);

// Invalid persistent structures fail before persistence.
const badTransforms = JSON.parse(JSON.stringify(backup));
badTransforms.modules.transforms.data.transforms = [{ id: "broken", type: "cloze", targets: [] }];
assert.throws(() => registry.prepareImport(badTransforms), /requires targets/);

const duplicateFormats = JSON.parse(JSON.stringify(backup));
duplicateFormats.modules.formats.data.formats.push(JSON.parse(JSON.stringify(duplicateFormats.modules.formats.data.formats[0])));
assert.throws(() => registry.prepareImport(duplicateFormats), /Duplicate format id/);

console.log("# QTimer V2 canonical storage smoke");
console.log("PASS: state/preferences/formats/transforms/programs/notes have one registry owner");
console.log("PASS: every canonical persistent module is automatically included in Backup V2");
console.log("PASS: Preferences v3 envelopes migrate to canonical V4 before writes");
console.log("PASS: invalid transforms and duplicate formats fail before persistence");
