import assert from "node:assert/strict";
import { migrateLegacyFormatsV1, migrateLegacyProgramsV1, buildLegacyMigrationReport } from "../src/v2/data/legacy-user-data-migration.mjs";
import { compileProgram } from "../src/v2/domain/program-engine.mjs";

const formats = migrateLegacyFormatsV1({
  version: 1,
  selectedFormatId: "fmt-blank",
  formats: [
    { id: "fmt-question", name: "문제", type: "question", layout: "stack", showChoices: true },
    { id: "fmt-qae", name: "전체", type: "question-answer-explanation", layout: "split", ratio: 62, showChoices: true, explanation: "full", answerMode: "both" },
    { id: "fmt-blank", name: "내 빈칸", type: "blank", layout: "stack", showChoices: true, blankCount: 3 }
  ]
});
assert.equal(formats.data.formats.length, 3);
assert.equal(formats.data.selectedFormatId, "v2-fmt-blank");
const blank = formats.data.formats.find(format => format.id === "v2-fmt-blank");
assert.deepEqual(blank.visibleZones, ["stem", "choices"]);
assert.equal(blank.metadata.requiresTransformAuthoring, true);
assert.equal(blank.metadata.legacyBlankCount, 3);
assert.equal(formats.warnings.length, 1);
assert.equal(formats.warnings[0].code, "FORMAT_BLANK_REQUIRES_REAUTHORING");
const qae = formats.data.formats.find(format => format.id === "v2-fmt-qae");
assert.deepEqual(qae.visibleZones, ["stem", "choices", "answer", "finalKey", "explanation"]);
assert.equal(qae.layout.type, "split");
assert.equal(qae.layout.ratio, 62);

const programsWithMark = migrateLegacyProgramsV1({
  version: 1,
  enabled: true,
  selectedProgramId: "p1",
  programs: [{
    id: "p1",
    name: "기본 답치기",
    blocks: [
      { id: "b1", type: "preview" },
      { id: "b2", type: "question" },
      { id: "b3", type: "mark" },
      { id: "b4", type: "reveal" },
      { id: "b5", type: "rate" }
    ]
  }]
});
assert.equal(programsWithMark.data.enabled, false, "migration must not auto-enable a program with unresolved semantics");
assert.equal(programsWithMark.issues.length, 1);
assert.equal(programsWithMark.issues[0].code, "PROGRAM_MARK_REQUIRES_CLOZE");
const migratedProgram = programsWithMark.data.programs[0];
assert.equal(migratedProgram.metadata.executableAfterMigration, false);
assert.deepEqual(migratedProgram.blocks.map(block => block.type), ["show-format", "show-format", "apply-transform", "show-format", "reveal", "rate"]);
assert.match(migratedProgram.blocks[2].transformId, /^migration-required-choice-cloze-/);

// A legacy program without mark can become a valid V2 program immediately.
const cleanPrograms = migrateLegacyProgramsV1({
  version: 1,
  selectedProgramId: "p2",
  programs: [{
    id: "p2",
    name: "회상 반복",
    blocks: [
      { id: "q", type: "question" },
      { id: "rs", type: "repeat-start", count: 2 },
      { id: "r", type: "reveal" },
      { id: "re", type: "repeat-end" },
      { id: "rate", type: "rate" }
    ]
  }]
});
assert.equal(cleanPrograms.issues.length, 0);
assert.equal(cleanPrograms.data.programs[0].metadata.executableAfterMigration, true);
const compiled = compileProgram(cleanPrograms.data.programs[0], {
  formats: new Set(["format-question", "format-review", "format-answer"]),
  transforms: new Set()
});
assert.deepEqual(compiled.map(step => step.type), ["show-format", "show-format", "reveal", "show-format", "reveal", "rate"]);

const report = buildLegacyMigrationReport({
  settings: { version: 2, dapchigi: { questionStyle: "keyword-highlight", answerStyle: "mark" }, display: { scale: "large" } },
  formats: { formats: [{ id: "blank1", name: "빈칸", type: "blank", blankCount: 2 }] },
  programs: { programs: [{ id: "p", name: "P", blocks: [{ id: "m", type: "mark" }, { id: "r", type: "rate" }] }] }
});
assert.equal(report.modules.preferences.schemaVersion, 4);
assert.equal(report.requiresUserReview, true);
assert.deepEqual(report.warnings.map(item => item.code).sort(), ["FORMAT_BLANK_REQUIRES_REAUTHORING", "PROGRAM_MARK_REQUIRES_CLOZE"]);

console.log("# QTimer V2 legacy migration smoke");
console.log("PASS: legacy non-blank Formats migrate to V2 layout/visibility");
console.log("PASS: legacy blank Format is preserved but explicitly requires Cloze re-authoring");
console.log("PASS: legacy mark Program block becomes an unresolved Transform reference, never a fabricated range");
console.log("PASS: legacy programs without ambiguous mark semantics can compile immediately");
console.log("PASS: migration report tells the UI exactly what requires user review");
