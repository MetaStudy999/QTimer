// QTimer transitional V1 compatibility snapshot.
// Used only while the V1 Format/Program runtime remains active next to canonical V2 storage.
// The snapshot is normalized before export AND before import; untrusted backup JSON is never written raw.

const FORMAT_TYPES = new Set(["question", "answer", "question-answer", "question-answer-explanation", "blank"]);
const FORMAT_LAYOUTS = new Set(["stack", "split"]);
const PREVIEW_DEVICES = new Set(["desktop", "tablet", "mobile"]);
const EXPLANATION_MODES = new Set(["hidden", "key", "full"]);
const ANSWER_MODES = new Set(["number", "choice", "both"]);
const PROGRAM_STEP_TYPES = new Set(["preview", "question", "mark", "reveal", "rate", "repeat-start", "repeat-end"]);

const MAX_FORMATS = 30;
const MAX_PROGRAMS = 20;
const MAX_BLOCKS = 40;
const MAX_REPEAT = 20;

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function text(value, fallback, maxLength = 120) {
  const normalized = String(value ?? fallback ?? "").trim().slice(0, maxLength);
  return normalized || String(fallback ?? "").slice(0, maxLength);
}

function timestamp(value) {
  return typeof value === "string" && value.length <= 80 ? value : null;
}

function normalizeLegacyFormat(rawInput, index) {
  const raw = object(rawInput);
  const type = FORMAT_TYPES.has(raw.type) ? raw.type : "question";
  return {
    id: text(raw.id, `format-${index + 1}`, 120),
    name: text(raw.name, `양식 ${index + 1}`, 40),
    type,
    layout: FORMAT_LAYOUTS.has(raw.layout) ? raw.layout : "stack",
    ratio: clamp(raw.ratio, 35, 80, 65),
    showChoices: raw.showChoices !== false,
    explanation: EXPLANATION_MODES.has(raw.explanation)
      ? raw.explanation
      : (type === "question-answer-explanation" ? "full" : "hidden"),
    answerMode: ANSWER_MODES.has(raw.answerMode) ? raw.answerMode : "both",
    blankCount: Math.round(clamp(raw.blankCount, 1, 4, 1)),
    createdAt: timestamp(raw.createdAt),
    updatedAt: timestamp(raw.updatedAt)
  };
}

export function normalizeLegacyFormatsV1Snapshot(storeInput) {
  const store = object(storeInput);
  const formats = (Array.isArray(store.formats) ? store.formats : [])
    .slice(0, MAX_FORMATS)
    .map(normalizeLegacyFormat);
  if (!formats.length) return null;
  const selected = formats.some(item => item.id === String(store.selectedFormatId || ""))
    ? String(store.selectedFormatId)
    : formats[0].id;
  return {
    version: 1,
    selectedFormatId: selected,
    previewDevice: PREVIEW_DEVICES.has(store.previewDevice) ? store.previewDevice : "desktop",
    formats,
    updatedAt: timestamp(store.updatedAt)
  };
}

function normalizeLegacyBlock(rawInput, programIndex, blockIndex) {
  const raw = object(rawInput);
  const type = PROGRAM_STEP_TYPES.has(raw.type) ? raw.type : "question";
  return {
    id: text(raw.id, `program-${programIndex + 1}-block-${blockIndex + 1}`, 120),
    type,
    ...(type === "repeat-start" ? { count: Math.round(clamp(raw.count, 2, MAX_REPEAT, 2)) } : {})
  };
}

function normalizeLegacyProgram(rawInput, index) {
  const raw = object(rawInput);
  const blocks = (Array.isArray(raw.blocks) ? raw.blocks : [])
    .slice(0, MAX_BLOCKS)
    .map((block, blockIndex) => normalizeLegacyBlock(block, index, blockIndex));
  return {
    id: text(raw.id, `program-${index + 1}`, 120),
    name: text(raw.name, `프로그램 ${index + 1}`, 40),
    blocks,
    createdAt: timestamp(raw.createdAt),
    updatedAt: timestamp(raw.updatedAt)
  };
}

export function normalizeLegacyProgramsV1Snapshot(storeInput) {
  const store = object(storeInput);
  const programs = (Array.isArray(store.programs) ? store.programs : [])
    .slice(0, MAX_PROGRAMS)
    .map(normalizeLegacyProgram);
  if (!programs.length) return null;
  const selected = programs.some(item => item.id === String(store.selectedProgramId || ""))
    ? String(store.selectedProgramId)
    : programs[0].id;
  return {
    version: 1,
    enabled: Boolean(store.enabled),
    selectedProgramId: selected,
    programs,
    updatedAt: timestamp(store.updatedAt)
  };
}

/**
 * Snapshot only the legacy schemas that cannot be losslessly projected back from canonical V2 yet.
 * State and preferences deliberately remain canonical-source-of-truth and are projected from V2 on import.
 */
export function buildLegacyV1CompatibilitySnapshot({ formats = null, programs = null } = {}) {
  const normalizedFormats = formats ? normalizeLegacyFormatsV1Snapshot(formats) : null;
  const normalizedPrograms = programs ? normalizeLegacyProgramsV1Snapshot(programs) : null;
  if (!normalizedFormats && !normalizedPrograms) return null;
  return Object.freeze({
    format: "qtimer-v1-runtime-compatibility",
    version: 1,
    formats: clone(normalizedFormats),
    programs: clone(normalizedPrograms)
  });
}

/** Strictly normalize an untrusted compatibility section from a backup file. */
export function parseLegacyV1CompatibilitySnapshot(rawInput) {
  if (rawInput == null) return null;
  const raw = object(rawInput);
  if (raw.format !== "qtimer-v1-runtime-compatibility" || Number(raw.version) !== 1) {
    throw new TypeError("Invalid QTimer V1 compatibility snapshot");
  }
  const formats = raw.formats == null ? null : normalizeLegacyFormatsV1Snapshot(raw.formats);
  const programs = raw.programs == null ? null : normalizeLegacyProgramsV1Snapshot(raw.programs);
  if (raw.formats != null && !formats) throw new TypeError("Compatibility formats are invalid");
  if (raw.programs != null && !programs) throw new TypeError("Compatibility programs are invalid");
  if (!formats && !programs) throw new TypeError("Compatibility snapshot is empty");
  return Object.freeze({
    format: "qtimer-v1-runtime-compatibility",
    version: 1,
    formats: clone(formats),
    programs: clone(programs)
  });
}
