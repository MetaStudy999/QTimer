import assert from "node:assert/strict";
import { adaptLegacyQuestion, resolveZoneText, snapshotQuestionModel } from "../src/v2/domain/content-model.mjs";
import { applyClozeTransform, segmentsToPlainText } from "../src/v2/domain/cloze-transform.mjs";

const legacy = {
  id: "fixture-001",
  questionType: "single_choice",
  questionText: "응집도는 높이고 결합도는 낮추는 설계가 바람직하다.",
  passageText: "모듈 내부 요소의 관련성을 응집도라고 한다.",
  choices: ["응집도는 낮을수록 좋다.", "결합도는 낮을수록 좋다.", "둘 다 높을수록 좋다.", "관계가 없다."],
  sourceAnswer: 2,
  finalKey: "높은 응집도와 낮은 결합도",
  sourceExplanation: "좋은 모듈 설계는 응집도를 높이고 결합도를 낮춘다."
};

const model = adaptLegacyQuestion(legacy);
const before = snapshotQuestionModel(model);

assert.equal(resolveZoneText(model, { zone: "stem" }), legacy.questionText);
assert.equal(resolveZoneText(model, { zone: "passage" }), legacy.passageText);
assert.equal(resolveZoneText(model, { zone: "choice", choiceIndex: 1 }), legacy.choices[1]);
assert.equal(resolveZoneText(model, { zone: "answer" }), legacy.choices[1]);
assert.equal(resolveZoneText(model, { zone: "explanation" }), legacy.sourceExplanation);

const transform = {
  id: "multi-zone-cloze",
  type: "cloze",
  targets: [
    { id: "stem-1", zone: "stem", selector: { type: "term", value: "응집도", occurrence: 0 }, placeholder: "[문제 빈칸]" },
    { id: "passage-1", zone: "passage", selector: { type: "term", value: "관련성", occurrence: 0 }, placeholder: "[지문 빈칸]" },
    { id: "choice-1", zone: "choice", choiceIndex: 1, selector: { type: "term", value: "낮을수록", occurrence: 0 }, placeholder: "[선택지 빈칸]" },
    { id: "key-1", zone: "finalKey", selector: { type: "term", value: "낮은 결합도", occurrence: 0 }, placeholder: "[핵심 빈칸]" },
    { id: "explain-1", zone: "explanation", selector: { type: "term", value: "결합도", occurrence: 0 }, placeholder: "[해설 빈칸]", revealPolicy: "with-answer" }
  ]
};

const view = applyClozeTransform(model, transform);
assert.equal(view.type, "cloze-view");
assert.equal(view.clozes.length, 5);
assert.match(segmentsToPlainText(view.zones.stem), /\[문제 빈칸\]/);
assert.match(segmentsToPlainText(view.zones.passage), /\[지문 빈칸\]/);
assert.match(segmentsToPlainText(view.zones["choice:1"]), /\[선택지 빈칸\]/);
assert.match(segmentsToPlainText(view.zones.finalKey), /\[핵심 빈칸\]/);
assert.match(segmentsToPlainText(view.zones.explanation), /\[해설 빈칸\]/);

// Revealing one target must not reveal the other blanks.
const revealView = applyClozeTransform(model, transform, { revealedIds: ["explain-1"] });
assert.match(segmentsToPlainText(revealView.zones.explanation), /결합도/);
assert.match(segmentsToPlainText(revealView.zones.stem), /\[문제 빈칸\]/);

// Range selector is supported independently of keyword extraction.
const rangeView = applyClozeTransform(model, {
  id: "range-cloze",
  type: "cloze",
  targets: [{ id: "range-1", zone: "stem", selector: { type: "range", start: 0, end: 3 }, placeholder: "___" }]
});
assert.equal(rangeView.clozes[0].expected, legacy.questionText.slice(0, 3));

// Multiple targets in one zone are allowed when they do not overlap.
const sameZone = applyClozeTransform(model, {
  id: "same-zone",
  type: "cloze",
  targets: [
    { id: "same-a", zone: "stem", selector: { type: "term", value: "응집도", occurrence: 0 } },
    { id: "same-b", zone: "stem", selector: { type: "term", value: "결합도", occurrence: 0 } }
  ]
});
assert.equal(sameZone.clozes.length, 2);

// Overlap is rejected instead of silently corrupting the derived view.
assert.throws(() => applyClozeTransform(model, {
  id: "overlap",
  type: "cloze",
  targets: [
    { id: "a", zone: "stem", selector: { type: "range", start: 0, end: 5 } },
    { id: "b", zone: "stem", selector: { type: "range", start: 3, end: 7 } }
  ]
}), /Overlapping cloze targets/);

// Missing term/invalid choice are hard failures, not best-effort mutations.
assert.throws(() => applyClozeTransform(model, {
  id: "missing",
  type: "cloze",
  targets: [{ id: "missing-1", zone: "explanation", selector: { type: "term", value: "존재하지않음" } }]
}), /not found/);
assert.throws(() => applyClozeTransform(model, {
  id: "bad-choice",
  type: "cloze",
  targets: [{ id: "choice-x", zone: "choice", choiceIndex: 99, selector: { type: "range", start: 0, end: 1 } }]
}), /does not exist/);

// The SOURCE BANK adapter model remains unchanged after every transformation.
assert.deepEqual(snapshotQuestionModel(model), before);
assert.deepEqual(legacy, {
  id: "fixture-001",
  questionType: "single_choice",
  questionText: "응집도는 높이고 결합도는 낮추는 설계가 바람직하다.",
  passageText: "모듈 내부 요소의 관련성을 응집도라고 한다.",
  choices: ["응집도는 낮을수록 좋다.", "결합도는 낮을수록 좋다.", "둘 다 높을수록 좋다.", "관계가 없다."],
  sourceAnswer: 2,
  finalKey: "높은 응집도와 낮은 결합도",
  sourceExplanation: "좋은 모듈 설계는 응집도를 높이고 결합도를 낮춘다."
});

console.log("# QTimer V2 domain smoke");
console.log("PASS: canonical immutable content zones");
console.log("PASS: cloze on stem / passage / choice / finalKey / explanation");
console.log("PASS: multi-zone + multi-target + reveal + range selector");
console.log("PASS: overlap/missing target hard failures");
console.log("PASS: SOURCE BANK remains immutable");
