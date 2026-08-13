// QTimer V2 canonical question/content model.
// Pure domain module: no DOM, localStorage, timers, or mutable SOURCE BANK access.

export const CONTENT_ZONES = Object.freeze([
  "stem",
  "passage",
  "choice",
  "answer",
  "finalKey",
  "explanation",
  "note"
]);

const ZONE_SET = new Set(CONTENT_ZONES);

function clone(value) {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function text(value) {
  return value == null ? "" : String(value);
}

function optionalNumber(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isContentZone(value) {
  return ZONE_SET.has(value);
}

export function zoneKey(target) {
  if (!target || !isContentZone(target.zone)) {
    throw new TypeError(`Unsupported content zone: ${target?.zone ?? "<missing>"}`);
  }
  if (target.zone === "choice") {
    const index = Number(target.choiceIndex);
    if (!Number.isInteger(index) || index < 0) {
      throw new TypeError("choice zone requires a non-negative choiceIndex");
    }
    return `choice:${index}`;
  }
  return target.zone;
}

/**
 * Converts one legacy QTimer SOURCE BANK question into the V2 canonical read model.
 * The returned object is deeply frozen so presentation/learning transforms cannot mutate source data.
 */
export function adaptLegacyQuestion(question) {
  if (!question || typeof question !== "object" || Array.isArray(question)) {
    throw new TypeError("Legacy question must be an object");
  }
  if (!text(question.id).trim()) throw new TypeError("Legacy question requires id");

  const choices = Array.isArray(question.choices)
    ? question.choices.map((value, index) => ({ index, text: text(value) }))
    : [];

  const sourceAnswer = clone(question.sourceAnswer ?? question.answer ?? null);
  const sourceAnswerNumber = optionalNumber(sourceAnswer);
  const answerChoiceText = Number.isInteger(sourceAnswerNumber) && sourceAnswerNumber >= 1
    ? choices[sourceAnswerNumber - 1]?.text ?? ""
    : "";

  const model = {
    schemaVersion: 2,
    id: text(question.id),
    type: text(question.questionType || "single_choice"),
    source: {
      questionNo: question.sourceQuestionNo ?? null,
      page: text(question.sourcePage),
      imageUrl: text(question.sourceImageUrl),
      answerImageUrl: text(question.answerImageUrl),
      provenance: clone(question.sourceProvenance ?? null)
    },
    content: {
      stem: { kind: "text", text: text(question.questionText) },
      // Legacy data currently has no canonical passage field. The adapter accepts either name
      // so migration can start without changing the frozen 973-question SOURCE BANK.
      passage: { kind: "text", text: text(question.passageText ?? question.passage) },
      choices,
      finalKey: { kind: "text", text: text(question.finalKey) },
      explanation: { kind: "text", text: text(question.sourceExplanation) },
      note: { kind: "text", text: "" }
    },
    answer: {
      source: sourceAnswer,
      choiceText: answerChoiceText,
      detected: clone(question.aiDetectedAnswer ?? null),
      reasoned: clone(question.aiReasonedAnswer ?? null),
      userVerified: clone(question.userVerifiedAnswer ?? null)
    }
  };

  return deepFreeze(model);
}

export function resolveZoneText(model, target) {
  if (!model || typeof model !== "object") throw new TypeError("Question model is required");
  const key = zoneKey(target);

  if (target.zone === "choice") {
    const choice = model.content?.choices?.[target.choiceIndex];
    if (!choice) throw new RangeError(`Choice ${target.choiceIndex} does not exist`);
    return text(choice.text);
  }

  if (target.zone === "answer") return text(model.answer?.choiceText);

  const zone = model.content?.[target.zone];
  if (!zone || typeof zone !== "object") {
    throw new RangeError(`Zone ${key} does not exist`);
  }
  return text(zone.text);
}

export function snapshotQuestionModel(model) {
  return clone(model);
}
