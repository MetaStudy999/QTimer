import assert from "node:assert/strict";
import { adaptLegacyQuestion } from "../src/v2/domain/content-model.mjs";
import { applyClozeTransform } from "../src/v2/domain/cloze-transform.mjs";
import { defaultFormatsV2, normalizeFormat } from "../src/v2/domain/format-model.mjs";
import { buildStudyView } from "../src/v2/domain/study-view-model.mjs";

const model = adaptLegacyQuestion({
  id: "study-view-fixture",
  questionText: "트랜잭션의 원자성은 모두 수행되거나 모두 수행되지 않아야 함을 의미한다.",
  passageText: "ACID 특성을 기준으로 판단한다.",
  choices: ["Atomicity", "Consistency", "Isolation", "Durability"],
  sourceAnswer: 1,
  finalKey: "Atomicity = all or nothing",
  sourceExplanation: "원자성은 트랜잭션 연산 전체가 하나의 단위로 처리되어야 한다는 성질이다."
});

const formats = defaultFormatsV2();
assert.equal(formats.length, 4);
assert.ok(formats.every(format => !Object.hasOwn(format, "type")), "Format must not encode blank/question content behavior as type");

const reviewFormat = formats.find(format => format.id === "format-review");
const cloze = applyClozeTransform(model, {
  id: "explanation-cloze",
  type: "cloze",
  targets: [
    { id: "stem-atomic", zone: "stem", selector: { type: "term", value: "원자성" } },
    { id: "passage-acid", zone: "passage", selector: { type: "term", value: "ACID" } },
    { id: "explain-unit", zone: "explanation", selector: { type: "term", value: "하나의 단위" } }
  ]
});

const view = buildStudyView(model, reviewFormat, { overlays: [cloze] });
assert.equal(view.questionId, model.id);
assert.equal(view.layout.type, "split");
assert.deepEqual(view.layout.primary, ["stem", "passage", "choices"]);
assert.deepEqual(view.layout.secondary, ["answer", "finalKey", "explanation"]);
assert.equal(view.zones.stem.transformed, true);
assert.equal(view.zones.passage.transformed, true);
assert.equal(view.zones.explanation.transformed, true);
assert.equal(view.zones.choices.items.length, 4);

// A Format can show only an explanation; the same Cloze overlay remains valid.
const explanationOnly = normalizeFormat({
  id: "format-explanation-only",
  name: "해설만",
  visibleZones: ["explanation"],
  layout: { type: "stack" }
});
const explanationView = buildStudyView(model, explanationOnly, { overlays: [cloze] });
assert.deepEqual(explanationView.visibleZones, ["explanation"]);
assert.equal(explanationView.zones.explanation.transformed, true);

// Legacy data without passage should simply omit the empty passage from the visible view.
const noPassageModel = adaptLegacyQuestion({
  id: "no-passage",
  questionText: "문제",
  choices: ["A", "B"],
  sourceAnswer: 1
});
const questionFormat = formats.find(format => format.id === "format-question");
const noPassageView = buildStudyView(noPassageModel, questionFormat);
assert.deepEqual(noPassageView.visibleZones, ["stem", "choices"]);

console.log("# QTimer V2 study view smoke");
console.log("PASS: Format owns layout/visibility only");
console.log("PASS: Cloze overlays compose on stem/passage/explanation");
console.log("PASS: renderer-neutral StudyView hides empty legacy passage zones");
console.log("PASS: no blank Format type is required");
