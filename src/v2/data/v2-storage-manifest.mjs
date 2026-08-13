// QTimer V2 canonical persistent data manifest.
// A feature that owns persistent user data must register it here before it can ship.

import { StorageRegistry } from "./storage-registry.mjs";
import { V2_STORAGE_KEYS } from "./legacy-storage-manifest.mjs";
import { defaultPreferencesV4, migratePreferencesToV4, normalizePreferencesV4 } from "../domain/preferences-model.mjs";
import { defaultFormatsV2, validateFormatCatalog } from "../domain/format-model.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
  return value;
}

function validateStateV2(value) {
  const data = object(value, "V2 state");
  if (!Array.isArray(data.attempts)) throw new TypeError("V2 state attempts must be an array");
  if (!Array.isArray(data.dapchigiRatings)) throw new TypeError("V2 state dapchigiRatings must be an array");
  if (!data.flags || typeof data.flags !== "object" || Array.isArray(data.flags)) throw new TypeError("V2 state flags must be an object");
  return clone(data);
}

function validatePreferences(value) {
  return clone(normalizePreferencesV4(value));
}

function validateFormats(value) {
  const data = object(value, "V2 formats");
  if (!Array.isArray(data.formats)) throw new TypeError("V2 formats.formats must be an array");
  const formats = validateFormatCatalog(data.formats);
  return { schemaVersion: 2, formats: clone(formats), selectedFormatId: data.selectedFormatId ? String(data.selectedFormatId) : (formats[0]?.id || null) };
}

function validateTransforms(value) {
  const data = object(value, "V2 transforms");
  if (!Array.isArray(data.transforms)) throw new TypeError("V2 transforms.transforms must be an array");
  const ids = new Set();
  const transforms = data.transforms.map((raw, index) => {
    const transform = object(raw, `Transform ${index + 1}`);
    const id = String(transform.id || "").trim();
    if (!id) throw new TypeError(`Transform ${index + 1} requires id`);
    if (ids.has(id)) throw new TypeError(`Duplicate transform id: ${id}`);
    ids.add(id);
    if (transform.type !== "cloze") throw new TypeError(`Unsupported persisted transform type: ${transform.type}`);
    if (!Array.isArray(transform.targets) || !transform.targets.length) throw new TypeError(`Transform ${id} requires targets`);
    return clone(transform);
  });
  return { schemaVersion: 2, transforms, selectedTransformId: data.selectedTransformId ? String(data.selectedTransformId) : (transforms[0]?.id || null) };
}

function validatePrograms(value) {
  const data = object(value, "V2 programs");
  if (!Array.isArray(data.programs)) throw new TypeError("V2 programs.programs must be an array");
  const ids = new Set();
  const programs = data.programs.map((raw, index) => {
    const program = object(raw, `Program ${index + 1}`);
    const id = String(program.id || "").trim();
    if (!id) throw new TypeError(`Program ${index + 1} requires id`);
    if (ids.has(id)) throw new TypeError(`Duplicate program id: ${id}`);
    ids.add(id);
    if (!Array.isArray(program.blocks)) throw new TypeError(`Program ${id} blocks must be an array`);
    return clone(program);
  });
  return { schemaVersion: 2, programs, selectedProgramId: data.selectedProgramId ? String(data.selectedProgramId) : (programs[0]?.id || null) };
}

function validateNotes(value) {
  const data = object(value, "V2 notes");
  if (!data.byQuestionId || typeof data.byQuestionId !== "object" || Array.isArray(data.byQuestionId)) throw new TypeError("V2 notes.byQuestionId must be an object");
  const byQuestionId = {};
  for (const [questionId, note] of Object.entries(data.byQuestionId)) {
    if (typeof note !== "string") throw new TypeError(`Note for ${questionId} must be text`);
    byQuestionId[String(questionId)] = note.slice(0, 20000);
  }
  return { schemaVersion: 1, byQuestionId };
}

function migratePreferencesEnvelope(data, fromVersion) {
  if (![1, 2, 3, 4].includes(Number(fromVersion))) throw new Error(`Unsupported preferences schema ${fromVersion}`);
  return clone(migratePreferencesToV4(data));
}

export function createV2StorageRegistry() {
  const registry = new StorageRegistry();
  registry
    .register({
      id: "state",
      storageKey: V2_STORAGE_KEYS.state,
      schemaVersion: 2,
      defaultValue: { schemaVersion: 2, attempts: [], dapchigiRatings: [], flags: {} },
      validate: validateStateV2
    })
    .register({
      id: "preferences",
      storageKey: V2_STORAGE_KEYS.preferences,
      schemaVersion: 4,
      defaultValue: defaultPreferencesV4(),
      validate: validatePreferences,
      migrate: migratePreferencesEnvelope
    })
    .register({
      id: "formats",
      storageKey: V2_STORAGE_KEYS.formats,
      schemaVersion: 2,
      defaultValue: { schemaVersion: 2, formats: defaultFormatsV2(), selectedFormatId: "format-question-answer" },
      validate: validateFormats
    })
    .register({
      id: "transforms",
      storageKey: V2_STORAGE_KEYS.transforms,
      schemaVersion: 2,
      defaultValue: { schemaVersion: 2, transforms: [], selectedTransformId: null },
      validate: validateTransforms
    })
    .register({
      id: "programs",
      storageKey: V2_STORAGE_KEYS.programs,
      schemaVersion: 2,
      defaultValue: { schemaVersion: 2, programs: [], selectedProgramId: null },
      validate: validatePrograms
    })
    .register({
      id: "notes",
      storageKey: V2_STORAGE_KEYS.notes,
      schemaVersion: 1,
      defaultValue: { schemaVersion: 1, byQuestionId: {} },
      validate: validateNotes
    });
  return registry;
}

export const V2_PERSISTENT_MODULE_IDS = Object.freeze(["state", "preferences", "formats", "transforms", "programs", "notes"]);
