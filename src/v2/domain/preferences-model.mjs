// QTimer V2 Preferences V4.
// One canonical presentation/preferences model. Legacy Settings v1/v2/v3 become migrations only.

export const PREFERENCES_SCHEMA_VERSION = 4;
export const SCALE_STEPS = Object.freeze([80, 85, 90, 95, 100, 105, 110, 115, 120, 125]);

export const QUESTION_THEMES = Object.freeze([
  { id: "focus-blue", fontColor: "#16324f", highlightColor: "#dceeff" },
  { id: "calm-mint", fontColor: "#143d36", highlightColor: "#ddf5ec" },
  { id: "memory-yellow", fontColor: "#3a3218", highlightColor: "#fff1a8" },
  { id: "soft-lavender", fontColor: "#332a55", highlightColor: "#eae4ff" },
  { id: "contrast-gray", fontColor: "#111827", highlightColor: "#e5e7eb" }
]);

export const ANSWER_THEMES = Object.freeze([
  { id: "answer-coral", fontColor: "#7a241f", highlightColor: "#ffe0dc" },
  { id: "key-red", fontColor: "#991b1b", highlightColor: "#fee2e2" },
  { id: "confirm-amber", fontColor: "#78350f", highlightColor: "#fef3c7" },
  { id: "stable-green", fontColor: "#14532d", highlightColor: "#dcfce7" },
  { id: "contrast-navy", fontColor: "#172554", highlightColor: "#dbeafe" }
]);

const FONTS = new Set(["default", "gothic", "serif", "mono"]);
const SIZES = new Set(["default", "16", "18", "20", "22", "24", "28", "32"]);
const SCOPES = new Set(["all", "keyword"]);
const LEGACY_STYLES = new Set(["normal", "all-bold", "keyword-bold", "all-highlight", "keyword-highlight", "mark"]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function bool(value, fallback = false) {
  return value == null ? fallback : Boolean(value);
}

function hex(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : fallback;
}

function scaleLevel(value, fallback = 5) {
  const level = Number.parseInt(value, 10);
  return Number.isInteger(level) ? Math.max(1, Math.min(10, level)) : fallback;
}

function inferTheme(kind, presentation) {
  const list = kind === "question" ? QUESTION_THEMES : ANSWER_THEMES;
  return list.find(theme => theme.fontColor === presentation.fontColor && theme.highlightColor === presentation.highlightColor)?.id || "custom";
}

function validTheme(kind, id) {
  if (id === "custom") return true;
  const list = kind === "question" ? QUESTION_THEMES : ANSWER_THEMES;
  return list.some(theme => theme.id === id);
}

function normalizePresentation(rawInput, kind, fallbackInput = {}) {
  const raw = object(rawInput);
  const fallback = object(fallbackInput);
  const fallbackHighlight = kind === "question" ? "#bfdbfe" : "#fecaca";
  const normalized = {
    fontFamily: FONTS.has(raw.fontFamily) ? raw.fontFamily : (FONTS.has(fallback.fontFamily) ? fallback.fontFamily : "default"),
    fontSize: SIZES.has(String(raw.fontSize)) ? String(raw.fontSize) : (SIZES.has(String(fallback.fontSize)) ? String(fallback.fontSize) : "default"),
    fontColor: hex(raw.fontColor, hex(fallback.fontColor, "#101828")),
    bold: bool(raw.bold, bool(fallback.bold, false)),
    highlight: bool(raw.highlight, bool(fallback.highlight, false)),
    highlightColor: hex(raw.highlightColor, hex(fallback.highlightColor, fallbackHighlight)),
    emphasisScope: SCOPES.has(raw.emphasisScope) ? raw.emphasisScope : (SCOPES.has(fallback.emphasisScope) ? fallback.emphasisScope : "all")
  };
  if (kind === "answer") {
    normalized.answerMark = bool(raw.answerMark, bool(fallback.answerMark, false));
    normalized.keywordRed = raw.keywordRed == null ? fallback.keywordRed !== false : raw.keywordRed !== false;
  }
  const requestedTheme = typeof raw.theme === "string" ? raw.theme : null;
  normalized.theme = requestedTheme && validTheme(kind, requestedTheme) ? requestedTheme : inferTheme(kind, normalized);
  return normalized;
}

function legacyStyle(styleInput, kind) {
  const style = LEGACY_STYLES.has(styleInput) ? styleInput : "normal";
  return {
    bold: ["all-bold", "keyword-bold", "all-highlight", "keyword-highlight", "mark"].includes(style),
    highlight: ["all-highlight", "keyword-highlight", "mark"].includes(style),
    emphasisScope: style.startsWith("keyword-") ? "keyword" : "all",
    ...(kind === "answer" ? { answerMark: style === "mark" } : {})
  };
}

function scaleFromLegacy(displayInput) {
  const display = object(displayInput);
  if (display.scaleLevel != null) return scaleLevel(display.scaleLevel);
  if (display.scale === "small") return 3;
  if (display.scale === "large") return 7;
  return 5;
}

export function defaultPreferencesV4() {
  return Object.freeze({
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    presentation: {
      question: normalizePresentation({ highlightColor: "#bfdbfe" }, "question"),
      answer: normalizePresentation({ highlightColor: "#fecaca", answerMark: false, keywordRed: true }, "answer")
    },
    display: {
      scaleLevel: 5
    },
    accessibility: {
      reduceMotion: false,
      highContrast: false
    },
    interaction: {
      keyboardHints: true
    },
    updatedAt: null
  });
}

function migrateLegacySettings(rawInput) {
  const raw = object(rawInput);
  const dap = object(raw.dapchigi);
  const base = defaultPreferencesV4();
  const questionFallback = legacyStyle(dap.questionStyle, "question");
  const answerFallback = { ...legacyStyle(dap.answerStyle, "answer"), keywordRed: dap.answerKeywordRed !== false };
  const questionRaw = Object.keys(object(dap.question)).length ? dap.question : questionFallback;
  const answerRaw = Object.keys(object(dap.answer)).length ? dap.answer : answerFallback;

  return {
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    presentation: {
      question: normalizePresentation(questionRaw, "question", base.presentation.question),
      answer: normalizePresentation(answerRaw, "answer", base.presentation.answer)
    },
    display: { scaleLevel: scaleFromLegacy(raw.display) },
    accessibility: clone(base.accessibility),
    interaction: clone(base.interaction),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null
  };
}

export function normalizePreferencesV4(rawInput) {
  const raw = object(rawInput);
  if (Number(raw.schemaVersion) !== PREFERENCES_SCHEMA_VERSION) return migratePreferencesToV4(raw);
  const defaults = defaultPreferencesV4();
  const presentation = object(raw.presentation);
  const display = object(raw.display);
  const accessibility = object(raw.accessibility);
  const interaction = object(raw.interaction);
  return Object.freeze({
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    presentation: {
      question: normalizePresentation(presentation.question, "question", defaults.presentation.question),
      answer: normalizePresentation(presentation.answer, "answer", defaults.presentation.answer)
    },
    display: {
      scaleLevel: scaleLevel(display.scaleLevel, defaults.display.scaleLevel)
    },
    accessibility: {
      reduceMotion: bool(accessibility.reduceMotion, defaults.accessibility.reduceMotion),
      highContrast: bool(accessibility.highContrast, defaults.accessibility.highContrast)
    },
    interaction: {
      keyboardHints: bool(interaction.keyboardHints, defaults.interaction.keyboardHints)
    },
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null
  });
}

/**
 * Accepts raw Settings v1/v2/v3 or already-canonical Preferences V4.
 * No storage or renderer side effects occur here.
 */
export function migratePreferencesToV4(rawInput) {
  const raw = object(rawInput);
  if (Number(raw.schemaVersion) === PREFERENCES_SCHEMA_VERSION) {
    return normalizePreferencesV4(raw);
  }

  // Current Settings v1/v2/v3 use `version`, not `schemaVersion`, and keep presentation under `dapchigi`.
  return Object.freeze(migrateLegacySettings(raw));
}

export function preferencesV4ToLegacyV3(preferencesInput) {
  const prefs = normalizePreferencesV4(preferencesInput);
  return {
    version: 3,
    dapchigi: {
      question: clone(prefs.presentation.question),
      answer: clone(prefs.presentation.answer)
    },
    display: { scaleLevel: prefs.display.scaleLevel },
    updatedAt: prefs.updatedAt
  };
}

export function scalePercent(preferencesInput) {
  const prefs = normalizePreferencesV4(preferencesInput);
  return SCALE_STEPS[prefs.display.scaleLevel - 1];
}
