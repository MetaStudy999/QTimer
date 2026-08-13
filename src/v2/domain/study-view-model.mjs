// QTimer V2 Study View Model.
// Converts immutable QuestionModel + Format + derived Transform overlays into renderer-neutral data.

import { normalizeFormat } from "./format-model.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function baseZoneMap(model) {
  return {
    stem: { key: "stem", kind: "text", text: model.content?.stem?.text || "" },
    passage: { key: "passage", kind: "text", text: model.content?.passage?.text || "" },
    choices: {
      key: "choices",
      kind: "choices",
      items: (model.content?.choices || []).map(choice => ({
        key: `choice:${choice.index}`,
        index: choice.index,
        text: choice.text
      }))
    },
    answer: { key: "answer", kind: "text", text: model.answer?.choiceText || "" },
    finalKey: { key: "finalKey", kind: "text", text: model.content?.finalKey?.text || "" },
    explanation: { key: "explanation", kind: "text", text: model.content?.explanation?.text || "" },
    note: { key: "note", kind: "text", text: model.content?.note?.text || "" }
  };
}

function buildOverlayIndex(overlays) {
  const index = new Map();
  for (const overlay of overlays || []) {
    if (!overlay || overlay.type !== "cloze-view" || !overlay.zones) continue;
    for (const [key, zoneView] of Object.entries(overlay.zones)) {
      if (index.has(key)) {
        throw new Error(`Multiple active transforms currently target ${key}; combine targets into one transform before rendering`);
      }
      index.set(key, clone(zoneView));
    }
  }
  return index;
}

function applyOverlayToText(zone, overlay) {
  if (!overlay) return clone(zone);
  return {
    ...clone(zone),
    transformed: true,
    transformKind: "cloze",
    segments: clone(overlay.segments)
  };
}

function applyOverlays(zones, overlayIndex) {
  const result = clone(zones);
  for (const key of ["stem", "passage", "answer", "finalKey", "explanation", "note"]) {
    result[key] = applyOverlayToText(result[key], overlayIndex.get(key));
  }
  result.choices.items = result.choices.items.map(item => {
    const overlay = overlayIndex.get(item.key);
    return overlay ? { ...item, transformed: true, transformKind: "cloze", segments: clone(overlay.segments) } : item;
  });
  return result;
}

function omitEmpty(zoneName, zone) {
  if (zoneName === "choices") return Array.isArray(zone.items) && zone.items.length > 0;
  if (zone?.transformed) return true;
  return Boolean(String(zone?.text || "").trim());
}

export function buildStudyView(model, formatInput, { overlays = [], includeEmpty = false } = {}) {
  if (!model || typeof model !== "object") throw new TypeError("QuestionModel is required");
  const format = normalizeFormat(formatInput);
  const overlayIndex = buildOverlayIndex(overlays);
  const zones = applyOverlays(baseZoneMap(model), overlayIndex);

  const visibleZones = format.visibleZones.filter(zoneName => includeEmpty || omitEmpty(zoneName, zones[zoneName]));
  const visibleSet = new Set(visibleZones);

  const primary = format.layout.primary.filter(zone => visibleSet.has(zone));
  const secondary = format.layout.secondary.filter(zone => visibleSet.has(zone));

  return Object.freeze({
    schemaVersion: 2,
    questionId: model.id,
    format: clone(format),
    visibleZones,
    layout: {
      type: format.layout.type,
      ratio: format.layout.ratio,
      primary,
      secondary
    },
    zones: Object.fromEntries(visibleZones.map(zoneName => [zoneName, clone(zones[zoneName])]))
  });
}
