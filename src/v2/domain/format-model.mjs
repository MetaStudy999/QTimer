// QTimer V2 Format Model.
// Format owns layout/visibility only. It never owns cloze/highlight/reveal behavior.

export const FORMAT_ZONES = Object.freeze([
  "stem",
  "passage",
  "choices",
  "answer",
  "finalKey",
  "explanation",
  "note"
]);

const ZONE_SET = new Set(FORMAT_ZONES);
const LAYOUT_SET = new Set(["stack", "split"]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function uniqueZones(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(String).filter(zone => ZONE_SET.has(zone)))];
}

function clampRatio(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 65;
  return Math.max(35, Math.min(80, Math.round(number)));
}

export function normalizeFormat(raw, { fallbackId = "format-default" } = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new TypeError("Format must be an object");
  const id = String(raw.id || fallbackId).trim();
  if (!id) throw new TypeError("Format id is required");
  const name = String(raw.name || id).trim().slice(0, 60) || id;
  const visibleZones = uniqueZones(raw.visibleZones);
  if (!visibleZones.length) throw new TypeError(`Format ${id} requires at least one visible zone`);

  const type = LAYOUT_SET.has(raw.layout?.type) ? raw.layout.type : "stack";
  let primary = uniqueZones(raw.layout?.primary).filter(zone => visibleZones.includes(zone));
  let secondary = uniqueZones(raw.layout?.secondary).filter(zone => visibleZones.includes(zone) && !primary.includes(zone));

  if (type === "stack") {
    primary = [...visibleZones];
    secondary = [];
  } else {
    if (!primary.length) primary = [visibleZones[0]];
    const assigned = new Set([...primary, ...secondary]);
    for (const zone of visibleZones) {
      if (!assigned.has(zone)) secondary.push(zone);
    }
    if (!secondary.length && visibleZones.length > 1) {
      secondary = primary.splice(Math.ceil(primary.length / 2));
    }
  }

  const placed = [...primary, ...secondary];
  if (placed.length !== visibleZones.length || new Set(placed).size !== visibleZones.length) {
    throw new TypeError(`Format ${id} layout must place every visible zone exactly once`);
  }

  return Object.freeze({
    schemaVersion: 2,
    id,
    name,
    visibleZones,
    layout: {
      type,
      ratio: type === "split" ? clampRatio(raw.layout?.ratio) : 100,
      primary,
      secondary
    },
    displayProfileId: raw.displayProfileId ? String(raw.displayProfileId) : null,
    metadata: clone(raw.metadata || {})
  });
}

export function defaultFormatsV2() {
  return [
    normalizeFormat({
      id: "format-question",
      name: "문제",
      visibleZones: ["stem", "passage", "choices"],
      layout: { type: "stack" }
    }),
    normalizeFormat({
      id: "format-answer",
      name: "답",
      visibleZones: ["answer"],
      layout: { type: "stack" }
    }),
    normalizeFormat({
      id: "format-question-answer",
      name: "문제 / 답",
      visibleZones: ["stem", "passage", "choices", "answer"],
      layout: {
        type: "split",
        ratio: 68,
        primary: ["stem", "passage", "choices"],
        secondary: ["answer"]
      }
    }),
    normalizeFormat({
      id: "format-review",
      name: "문제 / 답 / 해설",
      visibleZones: ["stem", "passage", "choices", "answer", "finalKey", "explanation"],
      layout: {
        type: "split",
        ratio: 62,
        primary: ["stem", "passage", "choices"],
        secondary: ["answer", "finalKey", "explanation"]
      }
    })
  ];
}

export function validateFormatCatalog(formats) {
  if (!Array.isArray(formats)) throw new TypeError("Format catalog must be an array");
  const normalized = formats.map(format => normalizeFormat(format));
  const ids = new Set();
  for (const format of normalized) {
    if (ids.has(format.id)) throw new TypeError(`Duplicate format id: ${format.id}`);
    ids.add(format.id);
  }
  return normalized;
}
