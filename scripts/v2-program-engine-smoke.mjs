import assert from "node:assert/strict";
import { compileProgram, validateProgram, createDefaultProgram } from "../src/v2/domain/program-engine.mjs";

const catalogs = {
  formats: new Set(["format-question-answer", "format-review"]),
  transforms: new Set(["transform-cloze-default", "transform-explanation-cloze"])
};

const basic = createDefaultProgram();
const basicCompiled = compileProgram(basic, catalogs);
assert.deepEqual(basicCompiled.map(step => step.type), ["show-format", "apply-transform", "reveal", "rate"]);
assert.equal(basicCompiled[0].formatId, "format-question-answer");
assert.equal(basicCompiled[1].transformId, "transform-cloze-default");

const repeated = {
  id: "repeat-program",
  blocks: [
    { id: "show", type: "show-format", formatId: "format-review" },
    { id: "r1", type: "repeat-start", count: 3 },
    { id: "t1", type: "apply-transform", transformId: "transform-explanation-cloze" },
    { id: "rv1", type: "reveal", scope: "transform", transformId: "transform-explanation-cloze" },
    { id: "r2", type: "repeat-end" },
    { id: "clear", type: "clear-transforms" },
    { id: "rate", type: "rate", scale: "oax" }
  ]
};
const repeatedCompiled = compileProgram(repeated, catalogs);
assert.deepEqual(repeatedCompiled.map(step => step.type), [
  "show-format",
  "apply-transform", "reveal",
  "apply-transform", "reveal",
  "apply-transform", "reveal",
  "clear-transforms",
  "rate"
]);
assert.equal(repeatedCompiled[1].repeatIteration, 1);
assert.equal(repeatedCompiled[5].repeatIteration, 3);

const missingFormat = validateProgram({ blocks: [
  { id: "bad", type: "show-format", formatId: "does-not-exist" },
  { id: "rate", type: "rate" }
]}, catalogs);
assert.equal(missingFormat.valid, false);
assert.match(missingFormat.errors.join(" "), /존재하지 않는 formatId/);

const nested = validateProgram({ blocks: [
  { id: "r1", type: "repeat-start", count: 2 },
  { id: "r2", type: "repeat-start", count: 2 },
  { id: "show", type: "show-format", formatId: "format-review" },
  { id: "e2", type: "repeat-end" },
  { id: "e1", type: "repeat-end" },
  { id: "rate", type: "rate" }
]}, catalogs);
assert.equal(nested.valid, false);
assert.match(nested.errors.join(" "), /반복 중첩/);

const rateInsideRepeat = validateProgram({ blocks: [
  { id: "r1", type: "repeat-start", count: 2 },
  { id: "show", type: "show-format", formatId: "format-review" },
  { id: "rate", type: "rate" },
  { id: "e1", type: "repeat-end" }
]}, catalogs);
assert.equal(rateInsideRepeat.valid, false);
assert.match(rateInsideRepeat.errors.join(" "), /rate는 반복 구간 안/);

console.log("# QTimer V2 program engine smoke");
console.log("PASS: program commands reference Format/Transform IDs");
console.log("PASS: bounded repeat compiles without legacy Dapchigi stages");
console.log("PASS: missing refs / nested loops / rate misuse are rejected");
