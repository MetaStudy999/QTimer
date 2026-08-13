import assert from "node:assert/strict";
import {
  defaultPreferencesV4,
  migratePreferencesToV4,
  normalizePreferencesV4,
  preferencesV4ToLegacyV3,
  preferencesV4ToLegacyFocusV1,
  scalePercent
} from "../src/v2/domain/preferences-model.mjs";

const defaults = defaultPreferencesV4();
assert.equal(defaults.schemaVersion, 4);
assert.equal(defaults.display.scaleLevel, 5);
assert.equal(scalePercent(defaults), 100);
assert.equal(defaults.presentation.answer.keywordRed, true);
assert.equal(defaults.presentation.answer.answerMark, false);
assert.equal(defaults.presentation.keyword.inheritQuestionFont, true);
assert.equal(defaults.presentation.keyword.highlightMode, "auto");
assert.equal(defaults.accessibility.reduceMotion, false);

const v3 = migratePreferencesToV4({
  version: 3,
  dapchigi: {
    question: {
      fontFamily: "serif",
      fontSize: "24",
      fontColor: "#16324f",
      bold: true,
      highlight: true,
      highlightColor: "#dceeff",
      emphasisScope: "keyword",
      theme: "focus-blue"
    },
    answer: {
      fontFamily: "gothic",
      fontSize: "22",
      fontColor: "#991b1b",
      bold: true,
      highlight: true,
      highlightColor: "#fee2e2",
      emphasisScope: "all",
      theme: "key-red",
      answerMark: true,
      keywordRed: false
    }
  },
  display: { scaleLevel: 10 },
  updatedAt: "2026-08-13T00:00:00.000Z"
}, {
  focusPreferences: {
    version: 1,
    keyword: {
      inheritQuestionFont: false,
      fontFamily: "mono",
      fontSize: "20",
      fontColor: "#ffffff",
      bold: false,
      highlightMode: "custom",
      highlightColor: "#123456"
    }
  }
});
assert.equal(v3.schemaVersion, 4);
assert.equal(v3.presentation.question.theme, "focus-blue");
assert.equal(v3.presentation.answer.theme, "key-red");
assert.equal(v3.presentation.answer.answerMark, true);
assert.equal(v3.presentation.answer.keywordRed, false);
assert.equal(v3.presentation.keyword.inheritQuestionFont, false);
assert.equal(v3.presentation.keyword.fontFamily, "mono");
assert.equal(v3.presentation.keyword.highlightMode, "custom");
assert.equal(v3.presentation.keyword.highlightColor, "#123456");
assert.equal(v3.display.scaleLevel, 10);
assert.equal(scalePercent(v3), 125);
assert.equal(Object.hasOwn(v3, "dapchigi"), false, "V4 presentation must not be owned by Dapchigi");

const v2Large = migratePreferencesToV4({
  version: 2,
  dapchigi: {
    question: { fontFamily: "mono", fontSize: "18", fontColor: "#101828", bold: false, highlight: false, highlightColor: "#bfdbfe", emphasisScope: "all" },
    answer: { fontFamily: "default", fontSize: "default", fontColor: "#101828", bold: false, highlight: false, highlightColor: "#fecaca", emphasisScope: "all", answerMark: false, keywordRed: true }
  },
  display: { scale: "large" }
});
assert.equal(v2Large.display.scaleLevel, 7);
assert.equal(scalePercent(v2Large), 110);
assert.equal(v2Large.presentation.question.fontFamily, "mono");

const v1LegacyStyles = migratePreferencesToV4({
  version: 1,
  dapchigi: {
    questionStyle: "keyword-highlight",
    answerStyle: "mark",
    answerKeywordRed: false
  },
  display: { scale: "small" }
});
assert.equal(v1LegacyStyles.presentation.question.bold, true);
assert.equal(v1LegacyStyles.presentation.question.highlight, true);
assert.equal(v1LegacyStyles.presentation.question.emphasisScope, "keyword");
assert.equal(v1LegacyStyles.presentation.answer.bold, true);
assert.equal(v1LegacyStyles.presentation.answer.highlight, true);
assert.equal(v1LegacyStyles.presentation.answer.answerMark, true);
assert.equal(v1LegacyStyles.presentation.answer.keywordRed, false);
assert.equal(v1LegacyStyles.display.scaleLevel, 3);
assert.equal(scalePercent(v1LegacyStyles), 90);

const sanitized = normalizePreferencesV4({
  schemaVersion: 4,
  presentation: {
    question: { fontFamily: "unknown", fontSize: "999", fontColor: "not-a-color", highlightColor: "#ABCDEF", emphasisScope: "bogus" },
    answer: { keywordRed: true },
    keyword: { fontFamily: "bogus", fontSize: "999", fontColor: "bad", highlightMode: "bogus", highlightColor: "#ABCDEF" }
  },
  display: { scaleLevel: 99 },
  accessibility: { reduceMotion: true, highContrast: true },
  interaction: { keyboardHints: false }
});
assert.equal(sanitized.presentation.question.fontFamily, "default");
assert.equal(sanitized.presentation.question.fontSize, "default");
assert.equal(sanitized.presentation.question.fontColor, "#101828");
assert.equal(sanitized.presentation.question.highlightColor, "#abcdef");
assert.equal(sanitized.presentation.question.emphasisScope, "all");
assert.equal(sanitized.presentation.keyword.fontFamily, "default");
assert.equal(sanitized.presentation.keyword.fontSize, "default");
assert.equal(sanitized.presentation.keyword.fontColor, "#ffffff");
assert.equal(sanitized.presentation.keyword.highlightMode, "auto");
assert.equal(sanitized.presentation.keyword.highlightColor, "#abcdef");
assert.equal(sanitized.display.scaleLevel, 10);
assert.equal(sanitized.accessibility.reduceMotion, true);
assert.equal(sanitized.accessibility.highContrast, true);
assert.equal(sanitized.interaction.keyboardHints, false);

const backToV3 = preferencesV4ToLegacyV3(v3);
assert.equal(backToV3.version, 3);
assert.equal(backToV3.dapchigi.question.theme, "focus-blue");
assert.equal(backToV3.display.scaleLevel, 10);

const backToFocus = preferencesV4ToLegacyFocusV1(v3);
assert.equal(backToFocus.version, 1);
assert.equal(backToFocus.keyword.fontFamily, "mono");
assert.equal(backToFocus.keyword.highlightColor, "#123456");

assert.deepEqual(migratePreferencesToV4(v3), v3);

console.log("# QTimer V2 Preferences V4 smoke");
console.log("PASS: Settings v1 legacy styles migrate to canonical presentation");
console.log("PASS: Settings v2 screen scale migrates to 10-step scale levels");
console.log("PASS: Settings v3 themes/colors/options are preserved");
console.log("PASS: Focus Quick Settings keyword presentation is preserved");
console.log("PASS: V4 presentation is no longer owned by Dapchigi");
console.log("PASS: accessibility and interaction defaults live in one canonical model");
console.log("PASS: V4 can temporarily adapt back to v3 and Focus v1 during strangler migration");
