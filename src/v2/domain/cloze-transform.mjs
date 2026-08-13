// QTimer V2 Cloze Transform.
// A cloze is a derived study-view transformation, not a Question type and never a SOURCE BANK mutation.

import { resolveZoneText, zoneKey } from "./content-model.mjs";

const REVEAL_POLICIES = new Set(["manual", "with-answer", "on-stage", "always"]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalizeOccurrence(value) {
  const n = Number(value ?? 0);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

function findOccurrence(text, term, occurrence) {
  let cursor = 0;
  for (let index = 0; index <= occurrence; index += 1) {
    const hit = text.indexOf(term, cursor);
    if (hit < 0) return null;
    if (index === occurrence) return { start: hit, end: hit + term.length };
    cursor = hit + Math.max(1, term.length);
  }
  return null;
}

function normalizeTarget(target, index) {
  if (!target || typeof target !== "object" || Array.isArray(target)) {
    throw new TypeError(`Cloze target ${index + 1} must be an object`);
  }
  const selector = target.selector;
  if (!selector || typeof selector !== "object" || Array.isArray(selector)) {
    throw new TypeError(`Cloze target ${index + 1} requires selector`);
  }
  if (!["range", "term"].includes(selector.type)) {
    throw new TypeError(`Unsupported cloze selector: ${selector.type ?? "<missing>"}`);
  }

  return {
    id: String(target.id || `cloze-target-${index + 1}`),
    zone: target.zone,
    ...(target.zone === "choice" ? { choiceIndex: Number(target.choiceIndex) } : {}),
    selector: selector.type === "range"
      ? { type: "range", start: Number(selector.start), end: Number(selector.end) }
      : { type: "term", value: String(selector.value ?? ""), occurrence: normalizeOccurrence(selector.occurrence) },
    placeholder: String(target.placeholder || "______"),
    revealPolicy: REVEAL_POLICIES.has(target.revealPolicy) ? target.revealPolicy : "manual",
    acceptedAnswers: Array.isArray(target.acceptedAnswers)
      ? [...new Set(target.acceptedAnswers.map(value => String(value)).filter(Boolean))]
      : []
  };
}

function compileSpan(text, target) {
  const selector = target.selector;
  if (selector.type === "range") {
    const { start, end } = selector;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > text.length) {
      throw new RangeError(`Invalid cloze range for ${target.id}: ${start}..${end} of ${text.length}`);
    }
    return { start, end };
  }

  if (!selector.value) throw new TypeError(`Cloze term for ${target.id} is empty`);
  const hit = findOccurrence(text, selector.value, selector.occurrence);
  if (!hit) {
    throw new RangeError(`Cloze term not found for ${target.id}: ${selector.value}`);
  }
  return hit;
}

function compileTargets(model, transform) {
  if (!transform || typeof transform !== "object" || Array.isArray(transform)) {
    throw new TypeError("Cloze transform must be an object");
  }
  if (transform.type != null && transform.type !== "cloze") {
    throw new TypeError(`Expected cloze transform, received ${transform.type}`);
  }
  if (!Array.isArray(transform.targets) || transform.targets.length === 0) {
    throw new TypeError("Cloze transform requires at least one target");
  }
  if (transform.targets.length > 100) throw new RangeError("Cloze transform supports at most 100 targets");

  const ids = new Set();
  const compiled = transform.targets.map((raw, index) => {
    const target = normalizeTarget(raw, index);
    if (ids.has(target.id)) throw new TypeError(`Duplicate cloze target id: ${target.id}`);
    ids.add(target.id);
    const key = zoneKey(target);
    const sourceText = resolveZoneText(model, target);
    const span = compileSpan(sourceText, target);
    const expected = sourceText.slice(span.start, span.end);
    return {
      ...target,
      key,
      sourceText,
      start: span.start,
      end: span.end,
      expected,
      acceptedAnswers: target.acceptedAnswers.length ? target.acceptedAnswers : [expected]
    };
  });

  const byZone = new Map();
  for (const item of compiled) {
    const list = byZone.get(item.key) || [];
    list.push(item);
    byZone.set(item.key, list);
  }

  for (const [key, list] of byZone.entries()) {
    list.sort((a, b) => a.start - b.start || a.end - b.end);
    for (let index = 1; index < list.length; index += 1) {
      if (list[index].start < list[index - 1].end) {
        throw new RangeError(`Overlapping cloze targets in ${key}: ${list[index - 1].id} / ${list[index].id}`);
      }
    }
  }

  return { compiled, byZone };
}

function segmentsFor(text, targets, revealedIds) {
  const segments = [];
  let cursor = 0;
  for (const target of targets) {
    if (target.start > cursor) segments.push({ kind: "text", text: text.slice(cursor, target.start) });
    if (revealedIds.has(target.id) || target.revealPolicy === "always") {
      segments.push({ kind: "reveal", id: target.id, text: target.expected });
    } else {
      segments.push({ kind: "blank", id: target.id, placeholder: target.placeholder });
    }
    cursor = target.end;
  }
  if (cursor < text.length) segments.push({ kind: "text", text: text.slice(cursor) });
  return segments;
}

/**
 * Returns a derived StudyView overlay.
 * `zones` only contains zones touched by the transform; untouched content remains in the immutable QuestionModel.
 */
export function applyClozeTransform(model, transform, options = {}) {
  const { compiled, byZone } = compileTargets(model, transform);
  const revealedIds = new Set(Array.isArray(options.revealedIds) ? options.revealedIds.map(String) : []);
  const zones = {};

  for (const [key, targets] of byZone.entries()) {
    zones[key] = {
      sourceLength: targets[0].sourceText.length,
      segments: segmentsFor(targets[0].sourceText, targets, revealedIds)
    };
  }

  return Object.freeze({
    schemaVersion: 1,
    type: "cloze-view",
    transformId: String(transform.id || "anonymous-cloze"),
    sourceQuestionId: model.id,
    zones: clone(zones),
    clozes: compiled.map(target => ({
      id: target.id,
      zone: target.zone,
      ...(target.zone === "choice" ? { choiceIndex: target.choiceIndex } : {}),
      expected: target.expected,
      acceptedAnswers: clone(target.acceptedAnswers),
      revealPolicy: target.revealPolicy
    }))
  });
}

export function revealForPolicy(view, policy) {
  if (!view || view.type !== "cloze-view") return [];
  return view.clozes.filter(item => item.revealPolicy === policy).map(item => item.id);
}

export function segmentsToPlainText(zoneView, { blankToken = "______" } = {}) {
  if (!zoneView || !Array.isArray(zoneView.segments)) return "";
  return zoneView.segments.map(segment => {
    if (segment.kind === "blank") return segment.placeholder || blankToken;
    return segment.text || "";
  }).join("");
}
