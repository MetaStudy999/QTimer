// QTimer V2 Cloze authoring helpers.
// Primary UX: select exact text in Live Preview -> persist zone + range + expected answer.

import { resolveZoneText, zoneKey } from "./content-model.mjs";
import { applyClozeTransform } from "./cloze-transform.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalizeRange(startInput, endInput, textLength) {
  const start = Number(startInput);
  const end = Number(endInput);
  if (!Number.isInteger(start) || !Number.isInteger(end)) throw new TypeError("Cloze selection start/end must be integers");
  if (start < 0 || end <= start || end > textLength) throw new RangeError(`Invalid cloze selection ${start}..${end} of ${textLength}`);
  return { start, end };
}

export function createClozeTargetFromSelection(model, selection, options = {}) {
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) throw new TypeError("Cloze selection is required");
  const targetRef = {
    zone: selection.zone,
    ...(selection.zone === "choice" ? { choiceIndex: Number(selection.choiceIndex) } : {})
  };
  const sourceText = resolveZoneText(model, targetRef);
  const { start, end } = normalizeRange(selection.start, selection.end, sourceText.length);
  const expected = sourceText.slice(start, end);
  if (!expected.trim()) throw new TypeError("Whitespace-only selection cannot become a cloze target");
  const maxSelectedChars = Number(options.maxSelectedChars ?? 300);
  if (expected.length > maxSelectedChars) throw new RangeError(`Cloze selection is too long: ${expected.length} > ${maxSelectedChars}`);

  const id = String(options.id || `cloze-${zoneKey(targetRef)}-${start}-${end}`).replaceAll(":", "-");
  return Object.freeze({
    id,
    zone: targetRef.zone,
    ...(targetRef.zone === "choice" ? { choiceIndex: targetRef.choiceIndex } : {}),
    selector: { type: "range", start, end },
    placeholder: String(options.placeholder || "______"),
    revealPolicy: String(options.revealPolicy || "with-answer"),
    acceptedAnswers: [...new Set([expected, ...(options.acceptedAnswers || []).map(String)].filter(Boolean))]
  });
}

export function addClozeTarget(model, transformInput, target) {
  const transform = transformInput && typeof transformInput === "object"
    ? clone(transformInput)
    : { id: "cloze-user", type: "cloze", targets: [] };
  transform.type = "cloze";
  transform.targets = Array.isArray(transform.targets) ? transform.targets : [];
  if (transform.targets.some(item => String(item.id) === String(target.id))) throw new Error(`Duplicate cloze target id: ${target.id}`);
  transform.targets.push(clone(target));

  // Compile once now so overlap/missing-zone errors are rejected at authoring time,
  // not later when a learner starts the program.
  applyClozeTransform(model, transform);
  return Object.freeze(transform);
}

export function removeClozeTarget(transformInput, targetId) {
  if (!transformInput || typeof transformInput !== "object") throw new TypeError("Cloze transform is required");
  const next = clone(transformInput);
  const before = Array.isArray(next.targets) ? next.targets.length : 0;
  next.targets = (next.targets || []).filter(item => String(item.id) !== String(targetId));
  if (next.targets.length === before) throw new Error(`Cloze target not found: ${targetId}`);
  return Object.freeze(next);
}

export function describeClozeTarget(model, target) {
  const sourceText = resolveZoneText(model, target);
  const selector = target.selector;
  if (!selector || selector.type !== "range") return { id: target.id, zoneKey: zoneKey(target), selectedText: null };
  const { start, end } = normalizeRange(selector.start, selector.end, sourceText.length);
  return Object.freeze({
    id: String(target.id),
    zoneKey: zoneKey(target),
    start,
    end,
    selectedText: sourceText.slice(start, end),
    contextBefore: sourceText.slice(Math.max(0, start - 24), start),
    contextAfter: sourceText.slice(end, Math.min(sourceText.length, end + 24))
  });
}
