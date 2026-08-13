// QTimer V2 legacy persistence inventory.
// This file is the canonical catalog of current user-owned local data during migration.

import { StorageRegistry, objectValidator } from "./storage-registry.mjs";

export const LEGACY_STORAGE_KEYS = Object.freeze({
  state: "qtimer-v0.1-local",
  preferences: "qtimer-settings-v2",
  legacyPreferencesV1: "qtimer-settings-v1",
  focusPreferences: "qtimer-focus-quick-settings-v1",
  programs: "qtimer-dapchigi-programs-v1",
  formats: "qtimer-dapchigi-formats-v1"
});

export const V2_STORAGE_KEYS = Object.freeze({
  state: "qtimer.v2.state",
  preferences: "qtimer.v2.preferences",
  programs: "qtimer.v2.programs",
  formats: "qtimer.v2.formats",
  transforms: "qtimer.v2.transforms",
  notes: "qtimer.v2.notes",
  importStaging: "qtimer.v2.import-staging",
  preImportSnapshot: "qtimer.v2.preimport-snapshot"
});

const stateValidator = objectValidator({ requiredArrays: ["attempts"], requiredObjects: ["overrides", "flags"] });
const genericObjectValidator = objectValidator();

/**
 * Registry for the data that exists in the current V1 runtime.
 * These descriptors intentionally keep schemaVersion=1 as a raw legacy envelope.
 * Canonical V2 migrations are added in the storage-v2 phase instead of pretending old data is already V2.
 */
export function createLegacyStorageRegistry() {
  const registry = new StorageRegistry();
  registry
    .register({
      id: "state",
      storageKey: LEGACY_STORAGE_KEYS.state,
      schemaVersion: 1,
      defaultValue: { attempts: [], overrides: {}, flags: {} },
      validate: stateValidator
    })
    .register({
      id: "preferences",
      storageKey: LEGACY_STORAGE_KEYS.preferences,
      schemaVersion: 1,
      defaultValue: {},
      validate: genericObjectValidator
    })
    .register({
      id: "focusPreferences",
      storageKey: LEGACY_STORAGE_KEYS.focusPreferences,
      schemaVersion: 1,
      defaultValue: {},
      validate: genericObjectValidator
    })
    .register({
      id: "programs",
      storageKey: LEGACY_STORAGE_KEYS.programs,
      schemaVersion: 1,
      defaultValue: {},
      validate: genericObjectValidator
    })
    .register({
      // This module is intentionally explicit: current data-portability.js did not include it.
      id: "formats",
      storageKey: LEGACY_STORAGE_KEYS.formats,
      schemaVersion: 1,
      defaultValue: {},
      validate: genericObjectValidator
    });
  return registry;
}

export function currentPersistentModuleIds() {
  return createLegacyStorageRegistry().list().map(module => module.id);
}
