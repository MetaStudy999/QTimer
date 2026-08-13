// QTimer V2 Program Engine.
// Programs orchestrate Format/Transform/Reveal/Rate commands and do not know legacy Dapchigi DOM stages.

export const PROGRAM_BLOCK_TYPES = Object.freeze([
  "show-format",
  "apply-transform",
  "clear-transforms",
  "reveal",
  "rate",
  "repeat-start",
  "repeat-end"
]);

const BLOCK_SET = new Set(PROGRAM_BLOCK_TYPES);
const DEFAULT_LIMITS = Object.freeze({ maxBlocks: 60, maxCompiledSteps: 200, maxRepeat: 20 });

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function clampInteger(value, min, max, fallback = min) {
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function normalizeBlock(raw, index, limits) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new TypeError(`Program block ${index + 1} must be an object`);
  const type = String(raw.type || "");
  if (!BLOCK_SET.has(type)) throw new TypeError(`Unsupported program block type at ${index + 1}: ${type || "<missing>"}`);
  const block = { id: String(raw.id || `block-${index + 1}`), type };

  if (type === "show-format") block.formatId = String(raw.formatId || "").trim();
  if (type === "apply-transform") block.transformId = String(raw.transformId || "").trim();
  if (type === "repeat-start") block.count = clampInteger(raw.count, 2, limits.maxRepeat, 2);
  if (type === "reveal") {
    block.scope = ["all", "policy", "transform"].includes(raw.scope) ? raw.scope : "all";
    if (block.scope === "policy") block.policy = String(raw.policy || "with-answer");
    if (block.scope === "transform") block.transformId = String(raw.transformId || "").trim();
  }
  if (type === "rate") block.scale = String(raw.scale || "oax");
  return block;
}

function catalogHas(catalog, id) {
  if (!catalog) return false;
  if (catalog instanceof Set || catalog instanceof Map) return catalog.has(id);
  if (Array.isArray(catalog)) return catalog.some(item => (typeof item === "string" ? item : item?.id) === id);
  return Object.prototype.hasOwnProperty.call(catalog, id);
}

function validateReferences(block, index, catalogs, errors) {
  if (block.type === "show-format") {
    if (!block.formatId) errors.push(`${index + 1}번 show-format에 formatId가 없습니다.`);
    else if (catalogs.formats && !catalogHas(catalogs.formats, block.formatId)) errors.push(`${index + 1}번: 존재하지 않는 formatId ${block.formatId}`);
  }
  if (block.type === "apply-transform") {
    if (!block.transformId) errors.push(`${index + 1}번 apply-transform에 transformId가 없습니다.`);
    else if (catalogs.transforms && !catalogHas(catalogs.transforms, block.transformId)) errors.push(`${index + 1}번: 존재하지 않는 transformId ${block.transformId}`);
  }
  if (block.type === "reveal" && block.scope === "transform") {
    if (!block.transformId) errors.push(`${index + 1}번 reveal(transform)에 transformId가 없습니다.`);
    else if (catalogs.transforms && !catalogHas(catalogs.transforms, block.transformId)) errors.push(`${index + 1}번 reveal: 존재하지 않는 transformId ${block.transformId}`);
  }
}

function executable(block) {
  return !["repeat-start", "repeat-end"].includes(block.type);
}

function compileUnchecked(blocks) {
  const out = [];
  let loop = null;
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.type === "repeat-start") {
      loop = { count: block.count, items: [], sourceBlockId: block.id };
      continue;
    }
    if (block.type === "repeat-end") {
      if (!loop) continue;
      for (let iteration = 1; iteration <= loop.count; iteration += 1) {
        loop.items.forEach(item => out.push({ ...clone(item), repeatIteration: iteration, repeatCount: loop.count }));
      }
      loop = null;
      continue;
    }
    if (!executable(block)) continue;
    const command = { ...clone(block), sourceIndex: index };
    if (loop) loop.items.push(command);
    else out.push(command);
  }
  return out;
}

export function validateProgram(program, catalogs = {}, limitsInput = {}) {
  const limits = { ...DEFAULT_LIMITS, ...limitsInput };
  const errors = [];
  const warnings = [];
  if (!program || typeof program !== "object" || Array.isArray(program)) return { valid: false, errors: ["Program must be an object"], warnings, blocks: [], compiled: [] };
  if (!Array.isArray(program.blocks)) return { valid: false, errors: ["Program blocks must be an array"], warnings, blocks: [], compiled: [] };
  if (program.blocks.length === 0) errors.push("실행 블록이 없습니다.");
  if (program.blocks.length > limits.maxBlocks) errors.push(`블록은 최대 ${limits.maxBlocks}개입니다.`);

  let blocks = [];
  try { blocks = program.blocks.map((block, index) => normalizeBlock(block, index, limits)); }
  catch (error) { errors.push(error.message); }

  const ids = new Set();
  let loopStart = null;
  let loopBodyCount = 0;
  let rateCount = 0;

  blocks.forEach((block, index) => {
    if (ids.has(block.id)) errors.push(`${index + 1}번: 중복 block id ${block.id}`);
    ids.add(block.id);
    validateReferences(block, index, catalogs, errors);

    if (block.type === "repeat-start") {
      if (loopStart) errors.push(`${index + 1}번: V2 Foundation에서는 반복 중첩을 허용하지 않습니다.`);
      else { loopStart = { index, id: block.id }; loopBodyCount = 0; }
      return;
    }
    if (block.type === "repeat-end") {
      if (!loopStart) errors.push(`${index + 1}번: 짝이 되는 repeat-start가 없습니다.`);
      else {
        if (loopBodyCount === 0) errors.push(`${loopStart.index + 1}번: 반복 구간이 비어 있습니다.`);
        loopStart = null;
        loopBodyCount = 0;
      }
      return;
    }

    if (loopStart) loopBodyCount += 1;
    if (block.type === "rate") {
      rateCount += 1;
      if (loopStart) errors.push(`${index + 1}번: rate는 반복 구간 안에 둘 수 없습니다.`);
    }
  });

  if (loopStart) errors.push(`${loopStart.index + 1}번: repeat-end가 없습니다.`);
  if (rateCount !== 1) errors.push(rateCount === 0 ? "마지막에 rate 블록이 1개 필요합니다." : "rate 블록은 1개만 허용합니다.");
  if (blocks.length && blocks.at(-1)?.type !== "rate") errors.push("rate 블록은 프로그램 마지막이어야 합니다.");
  if (!blocks.some(block => ["show-format", "apply-transform", "reveal"].includes(block.type))) warnings.push("평가 전 학습/표시 명령이 없습니다.");

  let compiled = errors.length ? [] : compileUnchecked(blocks);
  if (compiled.length > limits.maxCompiledSteps) {
    errors.push(`컴파일된 실행 단계가 ${limits.maxCompiledSteps}개를 초과합니다.`);
    compiled = [];
  }

  return { valid: errors.length === 0, errors, warnings, blocks: clone(blocks), compiled: clone(compiled) };
}

export function compileProgram(program, catalogs = {}, limits = {}) {
  const result = validateProgram(program, catalogs, limits);
  if (!result.valid) {
    const error = new Error(`Invalid QTimer V2 program: ${result.errors.join(" | ")}`);
    error.validation = result;
    throw error;
  }
  return result.compiled;
}

export function createDefaultProgram({ formatId = "format-question-answer", transformId = "transform-cloze-default" } = {}) {
  return {
    schemaVersion: 2,
    id: "program-default-v2",
    name: "기본 답치기 V2",
    blocks: [
      { id: "show", type: "show-format", formatId },
      { id: "cloze", type: "apply-transform", transformId },
      { id: "reveal", type: "reveal", scope: "all" },
      { id: "rate", type: "rate", scale: "oax" }
    ]
  };
}
