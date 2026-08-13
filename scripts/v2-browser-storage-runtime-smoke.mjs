import assert from "node:assert/strict";
import { createBrowserStorageRuntime } from "../src/v2/data/browser-storage-runtime.mjs";
import { LEGACY_STORAGE_KEYS, V2_STORAGE_KEYS } from "../src/v2/data/legacy-storage-manifest.mjs";

class MemoryStorage {
  constructor(entries = []) { this.map = new Map(entries); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const legacyState = {
  currentIndex: 2,
  mode: "dapchigi",
  attempts: [{ id: "attempt-1", questionId: "q1", isCorrect: false }],
  overrides: { q1: { answer: 2 } },
  flags: { q1: true },
  dapchigiV1: {
    round: 2,
    attempts: [{ id: "dap-1", questionId: "q1", rating: "a", round: 1, scopeKey: "s1:ch01" }]
  }
};
const legacySettings = {
  version: 3,
  dapchigi: {
    question: { fontFamily: "serif", fontSize: "24", fontColor: "#16324f", bold: true, highlight: true, highlightColor: "#dceeff", emphasisScope: "keyword", theme: "focus-blue" },
    answer: { fontFamily: "gothic", fontSize: "22", fontColor: "#991b1b", bold: true, highlight: true, highlightColor: "#fee2e2", emphasisScope: "all", theme: "key-red", answerMark: true, keywordRed: false }
  },
  display: { scaleLevel: 8 }
};
const legacyFocus = {
  version: 1,
  keyword: { inheritQuestionFont: false, fontFamily: "mono", fontSize: "20", fontColor: "#ffffff", bold: true, highlightMode: "custom", highlightColor: "#123456" }
};
const legacyFormats = {
  version: 1,
  selectedFormatId: "legacy-blank",
  formats: [{ id: "legacy-blank", name: "내 빈칸", type: "blank", layout: "stack", ratio: 65, showChoices: true, explanation: "hidden", answerMode: "both", blankCount: 2 }]
};
const legacyPrograms = {
  version: 1,
  enabled: true,
  selectedProgramId: "legacy-program",
  programs: [{
    id: "legacy-program",
    name: "내 답치기",
    blocks: [
      { id: "b1", type: "question" },
      { id: "b2", type: "mark" },
      { id: "b3", type: "reveal" },
      { id: "b4", type: "rate" }
    ]
  }]
};

const sourceStorage = new MemoryStorage();
const sourceRuntime = createBrowserStorageRuntime({ storage: sourceStorage, now: () => "2026-08-13T01:00:00.000Z" });
const exported = sourceRuntime.buildBackup({
  legacySources: {
    state: legacyState,
    settings: legacySettings,
    focusSettings: legacyFocus,
    formats: legacyFormats,
    programs: legacyPrograms
  },
  questionBankVersion: "qb-973"
});

assert.equal(exported.payload.format, "qtimer-backup");
assert.equal(exported.payload.version, 2);
assert.deepEqual(Object.keys(exported.payload.modules).sort(), ["formats", "notes", "preferences", "programs", "state", "transforms"]);
assert.equal(exported.payload.modules.state.data.attempts.length, 1);
assert.equal(exported.payload.modules.state.data.dapchigiRatings.length, 1);
assert.equal(exported.payload.modules.preferences.data.presentation.keyword.fontFamily, "mono");
assert.equal(exported.payload.modules.preferences.data.presentation.keyword.highlightColor, "#123456");
assert.equal(exported.payload.modules.formats.data.formats[0].metadata.requiresTransformAuthoring, true);
assert.equal(exported.payload.modules.programs.data.programs[0].metadata.executableAfterMigration, false);
assert.equal(exported.migrationReport.requiresUserReview, true);
assert.ok(sourceStorage.getItem(V2_STORAGE_KEYS.state));
assert.ok(sourceStorage.getItem(V2_STORAGE_KEYS.transforms));
assert.ok(sourceStorage.getItem(V2_STORAGE_KEYS.notes));

// Import a V2 backup into a browser that still runs the V1 UI.
const oldLegacyState = { attempts: [{ id: "old" }], overrides: {}, flags: {}, dapchigiV1: { attempts: [] } };
const oldLegacyFormats = { version: 1, selectedFormatId: "old-f", formats: [{ id: "old-f", name: "old", type: "question" }] };
const oldLegacyPrograms = { version: 1, enabled: false, selectedProgramId: "old-p", programs: [{ id: "old-p", name: "old", blocks: [{ id: "r", type: "rate" }] }] };
const targetStorage = new MemoryStorage([
  [LEGACY_STORAGE_KEYS.state, JSON.stringify(oldLegacyState)],
  [LEGACY_STORAGE_KEYS.formats, JSON.stringify(oldLegacyFormats)],
  [LEGACY_STORAGE_KEYS.programs, JSON.stringify(oldLegacyPrograms)]
]);
const targetRuntime = createBrowserStorageRuntime({ storage: targetStorage, now: () => "2026-08-13T02:00:00.000Z" });
const prepared = targetRuntime.prepareImportText(JSON.stringify(exported.payload));
assert.equal(prepared.sourceVersion, 2);
assert.equal(prepared.attemptCount, 1);
assert.deepEqual(prepared.deferredModules.sort(), ["formats", "notes", "programs", "transforms"]);
const committed = targetRuntime.commitPreparedImport(prepared);
assert.equal(committed.committed, true);
assert.equal(JSON.parse(targetStorage.getItem(V2_STORAGE_KEYS.state)).attempts[0].id, "attempt-1");
assert.equal(JSON.parse(targetStorage.getItem(LEGACY_STORAGE_KEYS.state)).attempts[0].id, "attempt-1");
assert.equal(JSON.parse(targetStorage.getItem(LEGACY_STORAGE_KEYS.state)).dapchigiV1.attempts[0].id, "dap-1");
assert.equal(JSON.parse(targetStorage.getItem(LEGACY_STORAGE_KEYS.preferences)).version, 3);
assert.equal(JSON.parse(targetStorage.getItem(LEGACY_STORAGE_KEYS.focusPreferences)).keyword.fontFamily, "mono");
assert.equal(JSON.parse(targetStorage.getItem(LEGACY_STORAGE_KEYS.formats)).selectedFormatId, "old-f", "V2-only format is deferred until the V2 renderer ships");
assert.equal(JSON.parse(targetStorage.getItem(LEGACY_STORAGE_KEYS.programs)).selectedProgramId, "old-p", "V2-only program is deferred until the V2 program runtime ships");

const undone = targetRuntime.undoLastImport();
assert.equal(undone.restored, true);
assert.equal(JSON.parse(targetStorage.getItem(LEGACY_STORAGE_KEYS.state)).attempts[0].id, "old");
assert.equal(targetStorage.getItem(V2_STORAGE_KEYS.state), null);

// Legacy v1 backup files remain importable. Exact V1 Program/Format payloads are projected back to the live V1 keys.
const legacyBackupV1 = {
  format: "qtimer-backup",
  version: 1,
  exportedAt: "2026-08-12T10:00:00.000Z",
  questionBankVersion: "qb-old",
  state: legacyState,
  settings: legacySettings,
  focusReadingSettings: legacyFocus,
  dapchigiFormats: legacyFormats,
  dapchigiPrograms: legacyPrograms
};
const legacyTargetStorage = new MemoryStorage();
const legacyTargetRuntime = createBrowserStorageRuntime({ storage: legacyTargetStorage });
const preparedV1 = legacyTargetRuntime.prepareImportText(JSON.stringify(legacyBackupV1));
assert.equal(preparedV1.sourceVersion, 1);
assert.equal(preparedV1.requiresUserReview, true);
assert.equal(preparedV1.deferredModules.length, 0);
legacyTargetRuntime.commitPreparedImport(preparedV1);
assert.equal(JSON.parse(legacyTargetStorage.getItem(LEGACY_STORAGE_KEYS.formats)).selectedFormatId, "legacy-blank");
assert.equal(JSON.parse(legacyTargetStorage.getItem(LEGACY_STORAGE_KEYS.programs)).selectedProgramId, "legacy-program");
assert.equal(JSON.parse(legacyTargetStorage.getItem(V2_STORAGE_KEYS.formats)).formats[0].metadata.requiresTransformAuthoring, true);
assert.equal(JSON.parse(legacyTargetStorage.getItem(V2_STORAGE_KEYS.preferences)).presentation.keyword.highlightColor, "#123456");

assert.deepEqual(targetRuntime.recoverInterruptedImport(), { recovered: false, reason: "no-staging-marker" });

console.log("# QTimer V2 browser storage runtime smoke");
console.log("PASS: live V1 state/settings/focus/formats/programs shadow into canonical V2 modules");
console.log("PASS: V2 export includes all canonical persistent modules");
console.log("PASS: V2 restore transactionally projects state/preferences back to the current V1 UI");
console.log("PASS: V2-only Format/Program/Transform/Notes remain canonical and are explicitly deferred");
console.log("PASS: import undo restores both canonical and live compatibility keys");
console.log("PASS: legacy backup v1 files remain importable without inventing Cloze targets");
