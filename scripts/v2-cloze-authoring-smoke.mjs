import assert from "node:assert/strict";
import { adaptLegacyQuestion } from "../src/v2/domain/content-model.mjs";
import { createClozeTargetFromSelection, addClozeTarget, removeClozeTarget, describeClozeTarget } from "../src/v2/domain/cloze-authoring.mjs";
import { applyClozeTransform, segmentsToPlainText } from "../src/v2/domain/cloze-transform.mjs";

const legacy = {
  id: "authoring-fixture",
  questionText: "다음 설명에서 트랜잭션의 원자성에 해당하는 내용을 고르시오.",
  passageText: "모든 연산은 전부 수행되거나 전부 수행되지 않아야 한다.",
  choices: ["일관성", "원자성", "격리성", "지속성"],
  sourceAnswer: 2,
  finalKey: "원자성은 all or nothing이다.",
  sourceExplanation: "원자성은 하나의 트랜잭션에 포함된 연산 전체가 모두 성공하거나 모두 취소되는 성질이다."
};
const model = adaptLegacyQuestion(legacy);

function selectTerm(zone, source, term, extra = {}) {
  const start = source.indexOf(term);
  assert.ok(start >= 0, `fixture term not found: ${term}`);
  return createClozeTargetFromSelection(model, { zone, start, end: start + term.length, ...extra }, { id: `${zone}-${term}`, placeholder: "[빈칸]" });
}

const stem = selectTerm("stem", legacy.questionText, "원자성");
const passage = selectTerm("passage", legacy.passageText, "전부 수행되지 않아야");
const choiceStart = legacy.choices[1].indexOf("원자성");
const choice = createClozeTargetFromSelection(model, { zone: "choice", choiceIndex: 1, start: choiceStart, end: choiceStart + 3 }, { id: "choice-answer", placeholder: "[선택지 빈칸]" });
const explanation = selectTerm("explanation", legacy.sourceExplanation, "모두 성공하거나 모두 취소되는");

let transform = { id: "user-cloze", type: "cloze", targets: [] };
transform = addClozeTarget(model, transform, stem);
transform = addClozeTarget(model, transform, passage);
transform = addClozeTarget(model, transform, choice);
transform = addClozeTarget(model, transform, explanation);

const view = applyClozeTransform(model, transform);
assert.equal(view.clozes.length, 4);
assert.match(segmentsToPlainText(view.zones.stem), /\[빈칸\]/);
assert.match(segmentsToPlainText(view.zones.passage), /\[빈칸\]/);
assert.match(segmentsToPlainText(view.zones["choice:1"]), /\[선택지 빈칸\]/);
assert.match(segmentsToPlainText(view.zones.explanation), /\[빈칸\]/);

assert.deepEqual(stem.acceptedAnswers, ["원자성"]);
const description = describeClozeTarget(model, explanation);
assert.equal(description.zoneKey, "explanation");
assert.equal(description.selectedText, "모두 성공하거나 모두 취소되는");
assert.ok(typeof description.contextBefore === "string" && typeof description.contextAfter === "string");

transform = removeClozeTarget(transform, stem.id);
assert.equal(transform.targets.length, 3);
assert.throws(() => removeClozeTarget(transform, "missing"), /not found/);

// Authoring rejects whitespace-only and oversized selections.
const whitespaceModel = adaptLegacyQuestion({ id: "space", questionText: "A   B", choices: ["A"], sourceAnswer: 1 });
assert.throws(() => createClozeTargetFromSelection(whitespaceModel, { zone: "stem", start: 1, end: 4 }), /Whitespace-only/);
assert.throws(() => createClozeTargetFromSelection(model, { zone: "passage", start: 0, end: legacy.passageText.length }, { maxSelectedChars: 5 }), /too long/);

// Overlap is rejected at authoring time.
let overlap = addClozeTarget(model, { id: "overlap", type: "cloze", targets: [] }, createClozeTargetFromSelection(model, { zone: "stem", start: 0, end: 8 }, { id: "a" }));
assert.throws(() => addClozeTarget(model, overlap, createClozeTargetFromSelection(model, { zone: "stem", start: 4, end: 12 }, { id: "b" })), /Overlapping/);

console.log("# QTimer V2 Cloze authoring smoke");
console.log("PASS: exact Preview selection persists as zone + range + expected answer");
console.log("PASS: stem / passage / choice / explanation selection authoring");
console.log("PASS: overlap, whitespace-only, oversized selections rejected early");
console.log("PASS: target descriptions retain selected text and nearby context");
