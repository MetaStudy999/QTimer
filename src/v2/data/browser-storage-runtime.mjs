// QTimer Storage V2 browser runtime bridge.
// During strangler migration, V1 remains live while canonical V2 modules are shadowed transactionally.

import { createV2StorageRegistry } from "./v2-storage-manifest.mjs";
import { LEGACY_STORAGE_KEYS, V2_STORAGE_KEYS } from "./legacy-storage-manifest.mjs";
import {
  parseBackupText,
  commitImportPlan,
  recoverInterruptedImport as recoverInterruptedTransaction,
  restorePreImportSnapshot
} from "./backup-transaction.mjs";
import {
  migrateLegacyRuntimeSources,
  migrateLegacyStateV1,
  projectStateV2ToLegacy
} from "./legacy-runtime-migration.mjs";
import {
  migratePreferencesToV4,
  preferencesV4ToLegacyV3,
  preferencesV4ToLegacyFocusV1
} from "../domain/preferences-model.mjs";
import { migrateLegacyFormatsV1, migrateLegacyProgramsV1 } from "./legacy-user-data-migration.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function requireStorage(storage) {
  for (const method of ["getItem", "setItem", "removeItem"]) {
    if (!storage || typeof storage[method] !== "function") throw new TypeError(`Storage V2 requires ${method}()`);
  }
  return storage;
}

function readJson(storage, key) {
  const raw = storage.getItem(key);
  if (raw == null || raw === "") return null;
  try { return JSON.parse(raw); }
  catch (error) { throw new Error(`Stored JSON at ${key} is corrupted: ${error.message}`); }
}

function validatedModule(registry, id, data) {
  const descriptor = registry.get(id);
  if (!descriptor) throw new Error(`Unknown V2 storage module: ${id}`);
  return registry.normalizeModule(id, {
    schemaVersion: descriptor.schemaVersion,
    data
  }).data;
}

function moduleEnvelope(registry, id, data) {
  const descriptor = registry.get(id);
  if (!descriptor) throw new Error(`Unknown V2 storage module: ${id}`);
  return {
    schemaVersion: descriptor.schemaVersion,
    data: validatedModule(registry, id, data)
  };
}

function canonicalBackupFromLegacyV1(payload, registry) {
  if (!payload || typeof payload !== "object" || payload.format !== "qtimer-backup" || Number(payload.version) !== 1) {
    throw new TypeError("Unsupported legacy QTimer backup envelope");
  }
  if (!payload.state || typeof payload.state !== "object" || !Array.isArray(payload.state.attempts)) {
    throw new TypeError("Legacy backup state is invalid");
  }

  const migration = migrateLegacyRuntimeSources({
    state: payload.state,
    settings: payload.settings || null,
    focusSettings: payload.focusReadingSettings || null,
    formats: payload.dapchigiFormats || null,
    programs: payload.dapchigiPrograms || null
  });

  const modules = {};
  for (const [id, data] of Object.entries(migration.modules)) modules[id] = moduleEnvelope(registry, id, data);

  return {
    payload: {
      format: "qtimer-backup",
      version: 2,
      exportedAt: payload.exportedAt || null,
      appVersion: "legacy-v1-import",
      questionBankVersion: payload.questionBankVersion || null,
      modules
    },
    migration,
    legacyCompatibility: {
      state: clone(payload.state),
      settings: payload.settings ? clone(payload.settings) : null,
      focusSettings: payload.focusReadingSettings ? clone(payload.focusReadingSettings) : null,
      formats: payload.dapchigiFormats ? clone(payload.dapchigiFormats) : null,
      programs: payload.dapchigiPrograms ? clone(payload.dapchigiPrograms) : null
    }
  };
}

function compatibilityWritesForPlan(plan, sourceVersion, legacyCompatibility = {}) {
  const writes = [];
  const canonicalIds = new Set(plan.writes.map(write => write.id));

  const stateWrite = plan.writes.find(write => write.id === "state");
  if (stateWrite) {
    writes.push({
      id: "legacyStateProjection",
      storageKey: LEGACY_STORAGE_KEYS.state,
      schemaVersion: 1,
      data: sourceVersion === 1 && legacyCompatibility.state
        ? clone(legacyCompatibility.state)
        : projectStateV2ToLegacy(stateWrite.data)
    });
  }

  const preferencesWrite = plan.writes.find(write => write.id === "preferences");
  if (preferencesWrite) {
    writes.push({
      id: "legacyPreferencesProjection",
      storageKey: LEGACY_STORAGE_KEYS.preferences,
      schemaVersion: 3,
      data: sourceVersion === 1 && legacyCompatibility.settings
        ? clone(legacyCompatibility.settings)
        : preferencesV4ToLegacyV3(preferencesWrite.data)
    });
    writes.push({
      id: "legacyFocusPreferencesProjection",
      storageKey: LEGACY_STORAGE_KEYS.focusPreferences,
      schemaVersion: 1,
      data: sourceVersion === 1 && legacyCompatibility.focusSettings
        ? clone(legacyCompatibility.focusSettings)
        : preferencesV4ToLegacyFocusV1(preferencesWrite.data)
    });
  }

  if (sourceVersion === 1 && canonicalIds.has("formats") && legacyCompatibility.formats) {
    writes.push({
      id: "legacyFormatsProjection",
      storageKey: LEGACY_STORAGE_KEYS.formats,
      schemaVersion: 1,
      data: clone(legacyCompatibility.formats)
    });
  }

  if (sourceVersion === 1 && canonicalIds.has("programs") && legacyCompatibility.programs) {
    writes.push({
      id: "legacyProgramsProjection",
      storageKey: LEGACY_STORAGE_KEYS.programs,
      schemaVersion: 1,
      data: clone(legacyCompatibility.programs)
    });
  }

  return writes;
}

function deferredLegacyRuntimeModules(plan, sourceVersion, legacyCompatibility = {}) {
  const deferred = [];
  const ids = new Set(plan.writes.map(write => write.id));
  if (ids.has("transforms")) deferred.push("transforms");
  if (ids.has("notes")) deferred.push("notes");
  if (ids.has("formats") && !(sourceVersion === 1 && legacyCompatibility.formats)) deferred.push("formats");
  if (ids.has("programs") && !(sourceVersion === 1 && legacyCompatibility.programs)) deferred.push("programs");
  return deferred;
}

export function createBrowserStorageRuntime({ storage, now = () => new Date().toISOString() } = {}) {
  const store = requireStorage(storage);
  const registry = createV2StorageRegistry();

  function writeCanonical(id, data) {
    const descriptor = registry.get(id);
    const canonical = validatedModule(registry, id, data);
    store.setItem(descriptor.storageKey, JSON.stringify(canonical));
    return canonical;
  }

  function ensureCanonicalDefaults() {
    for (const descriptor of registry.list()) {
      if (store.getItem(descriptor.storageKey) != null) continue;
      writeCanonical(descriptor.id, descriptor.defaultValue);
    }
  }

  function refreshCanonicalShadow(legacySources = {}) {
    const migration = migrateLegacyRuntimeSources(legacySources);
    for (const [id, data] of Object.entries(migration.modules)) writeCanonical(id, data);
    ensureCanonicalDefaults();
    const report = {
      schemaVersion: 1,
      generatedAt: now(),
      source: "legacy-runtime-shadow",
      migratedModuleIds: Object.keys(migration.modules),
      warnings: clone(migration.warnings),
      requiresUserReview: migration.requiresUserReview
    };
    store.setItem(V2_STORAGE_KEYS.migrationReport, JSON.stringify(report));
    return Object.freeze(report);
  }

  function buildBackup({ legacySources = {}, questionBankVersion = null, appVersion = "v2-storage-bridge" } = {}) {
    const report = refreshCanonicalShadow(legacySources);
    const payload = registry.buildBackup(storageKey => readJson(store, storageKey), {
      exportedAt: now(),
      appVersion,
      questionBankVersion
    });
    return Object.freeze({ payload, migrationReport: report });
  }

  function prepareImportText(text) {
    const parsed = parseBackupText(text);
    let sourceVersion = Number(parsed.payload?.version);
    let canonicalPayload = parsed.payload;
    let migration = { warnings: [], requiresUserReview: false };
    let legacyCompatibility = {};

    if (sourceVersion === 1) {
      const converted = canonicalBackupFromLegacyV1(parsed.payload, registry);
      canonicalPayload = converted.payload;
      migration = converted.migration;
      legacyCompatibility = converted.legacyCompatibility;
      sourceVersion = 1;
    } else if (sourceVersion !== 2) {
      throw new TypeError(`Unsupported QTimer backup version: ${sourceVersion || "unknown"}`);
    }

    const canonicalPlan = registry.prepareImport(canonicalPayload, { rejectUnknown: true, maxModules: parsed.limits.maxModules });
    const compatibilityWrites = compatibilityWritesForPlan(canonicalPlan, sourceVersion, legacyCompatibility);
    const combinedPlan = Object.freeze({
      ...canonicalPlan,
      writes: Object.freeze([...canonicalPlan.writes.map(clone), ...compatibilityWrites.map(clone)])
    });
    const stateWrite = canonicalPlan.writes.find(write => write.id === "state");
    const attemptCount = Array.isArray(stateWrite?.data?.attempts) ? stateWrite.data.attempts.length : null;
    const deferredModules = deferredLegacyRuntimeModules(canonicalPlan, sourceVersion, legacyCompatibility);

    return Object.freeze({
      sourceVersion,
      sourceBytes: parsed.bytes,
      sourceNodes: parsed.nodes,
      canonicalPlan,
      combinedPlan,
      canonicalModuleIds: canonicalPlan.writes.map(write => write.id),
      attemptCount,
      deferredModules,
      warnings: clone(migration.warnings || []),
      requiresUserReview: Boolean(migration.requiresUserReview)
    });
  }

  function commitPreparedImport(prepared) {
    if (!prepared?.combinedPlan) throw new TypeError("Prepared Storage V2 import is required");
    const result = commitImportPlan(prepared.combinedPlan, store, {
      stagingKey: V2_STORAGE_KEYS.importStaging,
      snapshotKey: V2_STORAGE_KEYS.preImportSnapshot
    });
    store.setItem(V2_STORAGE_KEYS.migrationReport, JSON.stringify({
      schemaVersion: 1,
      generatedAt: now(),
      source: `backup-v${prepared.sourceVersion}`,
      importedModuleIds: clone(prepared.canonicalModuleIds),
      deferredModules: clone(prepared.deferredModules),
      warnings: clone(prepared.warnings),
      requiresUserReview: prepared.requiresUserReview
    }));
    return Object.freeze({
      ...result,
      sourceVersion: prepared.sourceVersion,
      canonicalModuleIds: clone(prepared.canonicalModuleIds),
      deferredModules: clone(prepared.deferredModules),
      warnings: clone(prepared.warnings),
      requiresUserReview: prepared.requiresUserReview
    });
  }

  function recoverInterruptedImport() {
    return recoverInterruptedTransaction(store, {
      stagingKey: V2_STORAGE_KEYS.importStaging,
      snapshotKey: V2_STORAGE_KEYS.preImportSnapshot
    });
  }

  function undoLastImport() {
    return restorePreImportSnapshot(store, {
      stagingKey: V2_STORAGE_KEYS.importStaging,
      snapshotKey: V2_STORAGE_KEYS.preImportSnapshot
    });
  }

  function inspectCanonical() {
    ensureCanonicalDefaults();
    const modules = {};
    for (const descriptor of registry.list()) modules[descriptor.id] = readJson(store, descriptor.storageKey);
    return Object.freeze({
      modules,
      migrationReport: readJson(store, V2_STORAGE_KEYS.migrationReport)
    });
  }

  return Object.freeze({
    version: 2,
    registry,
    keys: Object.freeze({ legacy: LEGACY_STORAGE_KEYS, v2: V2_STORAGE_KEYS }),
    refreshCanonicalShadow,
    buildBackup,
    prepareImportText,
    commitPreparedImport,
    recoverInterruptedImport,
    undoLastImport,
    inspectCanonical
  });
}

export const StorageV2MigrationHelpers = Object.freeze({
  migrateLegacyStateV1,
  migratePreferencesToV4,
  migrateLegacyFormatsV1,
  migrateLegacyProgramsV1
});
