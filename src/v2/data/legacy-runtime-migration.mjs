// QTimer V2 migration helpers for the still-live V1 browser runtime.
// These functions are pure. They never access browser storage or DOM APIs.

import { migratePreferencesToV4 } from "../domain/preferences-model.mjs";
import { migrateLegacyFormatsV1, migrateLegacyProgramsV1 } from "./legacy-user-data-migration.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function migrateLegacyStateV1(rawInput) {
  const raw = object(rawInput);
  const dapchigi = object(raw.dapchigiV1);
  const ratings = Array.isArray(dapchigi.attempts) ? clone(dapchigi.attempts) : [];
  return {
    ...clone(raw),
    schemaVersion: 2,
    attempts: Array.isArray(raw.attempts) ? clone(raw.attempts) : [],
    dapchigiRatings: ratings,
    overrides: clone(object(raw.overrides)),
    flags: clone(object(raw.flags))
  };
}

export function projectStateV2ToLegacy(rawInput) {
  const raw = object(rawInput);
  const legacy = clone(raw);
  delete legacy.schemaVersion;
  const ratings = Array.isArray(raw.dapchigiRatings) ? clone(raw.dapchigiRatings) : [];
  legacy.attempts = Array.isArray(raw.attempts) ? clone(raw.attempts) : [];
  legacy.overrides = clone(object(raw.overrides));
  legacy.flags = clone(object(raw.flags));
  legacy.dapchigiV1 = {
    ...clone(object(raw.dapchigiV1)),
    attempts: ratings
  };
  delete legacy.dapchigiRatings;
  return legacy;
}

export function migrateLegacyRuntimeSources({
  state = null,
  settings = null,
  focusSettings = null,
  formats = null,
  programs = null
} = {}) {
  const modules = {};
  const warnings = [];

  if (state && typeof state === "object") {
    modules.state = migrateLegacyStateV1(state);
  }

  if ((settings && typeof settings === "object") || (focusSettings && typeof focusSettings === "object")) {
    modules.preferences = clone(migratePreferencesToV4(settings || {}, { focusPreferences: focusSettings || {} }));
  }

  if (formats && typeof formats === "object") {
    const result = migrateLegacyFormatsV1(formats);
    modules.formats = clone(result.data);
    warnings.push(...clone(result.warnings));
  }

  if (programs && typeof programs === "object") {
    const result = migrateLegacyProgramsV1(programs);
    modules.programs = clone(result.data);
    warnings.push(...clone(result.issues));
  }

  return Object.freeze({
    modules,
    warnings,
    requiresUserReview: warnings.length > 0
  });
}
