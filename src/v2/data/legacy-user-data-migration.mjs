// QTimer V2 conservative migration for user-created Formats/Programs.
// Never invent exact Cloze ranges that the legacy schema did not store.

import { normalizeFormat } from "../domain/format-model.mjs";
import { migratePreferencesToV4 } from "../domain/preferences-model.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function clamp(value, min, max, fallback = min) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function formatZones(raw) {
  const showChoices = raw.showChoices !== false;
  const questionZones = showChoices ? ["stem", "choices"] : ["stem"];
  if (raw.type === "answer") return ["answer"];
  if (raw.type === "question") return questionZones;
  if (raw.type === "blank") return questionZones;
  if (raw.type === "question-answer") return [...questionZones, "answer"];
  if (raw.type === "question-answer-explanation") {
    const zones = [...questionZones, "answer"];
    if (raw.explanation === "key" || raw.explanation === "full") zones.push("finalKey");
    if (raw.explanation === "full") zones.push("explanation");
    return zones;
  }
  return questionZones;
}

function formatLayout(raw, visibleZones) {
  const layoutType = raw.layout === "split" && visibleZones.length > 1 ? "split" : "stack";
  if (layoutType === "stack") return { type: "stack" };
  const questionSide = visibleZones.filter(zone => ["stem", "passage", "choices"].includes(zone));
  const answerSide = visibleZones.filter(zone => !questionSide.includes(zone));
  if (!questionSide.length || !answerSide.length) return { type: "stack" };
  return {
    type: "split",
    ratio: clamp(raw.ratio, 35, 80, 65),
    primary: questionSide,
    secondary: answerSide
  };
}

export function migrateLegacyFormatsV1(storeInput) {
  const store = object(storeInput);
  const sourceFormats = Array.isArray(store.formats) ? store.formats : [];
  const warnings = [];
  const migrated = [];
  const idMap = {};

  for (let index = 0; index < sourceFormats.length; index += 1) {
    const raw = object(sourceFormats[index]);
    const legacyId = String(raw.id || `legacy-format-${index + 1}`);
    const id = `v2-${legacyId}`;
    const visibleZones = formatZones(raw);
    const metadata = {
      migratedFrom: "dapchigi-format-v1",
      legacyId,
      legacyType: String(raw.type || "question"),
      legacyAnswerMode: String(raw.answerMode || "both"),
      legacyExplanationMode: String(raw.explanation || "hidden")
    };

    if (raw.type === "blank") {
      metadata.requiresTransformAuthoring = true;
      metadata.legacyBlankCount = Math.max(1, Math.min(4, Number(raw.blankCount) || 1));
      warnings.push({
        code: "FORMAT_BLANK_REQUIRES_REAUTHORING",
        legacyId,
        message: `기존 빈칸 양식 '${raw.name || legacyId}'은 정확한 빈칸 위치를 저장하지 않아 V2 Cloze target을 다시 지정해야 합니다.`
      });
    }

    const format = normalizeFormat({
      id,
      name: String(raw.name || `양식 ${index + 1}`),
      visibleZones,
      layout: formatLayout(raw, visibleZones),
      metadata
    });
    migrated.push(clone(format));
    idMap[legacyId] = id;
  }

  const selectedFormatId = idMap[String(store.selectedFormatId || "")] || migrated[0]?.id || null;
  return Object.freeze({
    data: { schemaVersion: 2, formats: migrated, selectedFormatId },
    idMap,
    warnings
  });
}

function mapLegacyProgramBlock(blockInput, programId, blockIndex, issues) {
  const block = object(blockInput);
  const sourceId = String(block.id || `legacy-block-${blockIndex + 1}`);
  const id = `v2-${sourceId}`;

  if (block.type === "preview") {
    return [{ id, type: "show-format", formatId: "format-answer", metadata: { migratedFrom: "preview" } }];
  }
  if (block.type === "question") {
    return [{ id, type: "show-format", formatId: "format-question", metadata: { migratedFrom: "question" } }];
  }
  if (block.type === "mark") {
    const unresolvedTransformId = `migration-required-choice-cloze-${programId}-${sourceId}`;
    issues.push({
      code: "PROGRAM_MARK_REQUIRES_CLOZE",
      programId,
      blockId: sourceId,
      unresolvedTransformId,
      message: "기존 mark 단계는 선택지 빈칸 위치가 저장되지 않아 Cloze Transform을 다시 지정해야 합니다."
    });
    return [{
      id,
      type: "apply-transform",
      transformId: unresolvedTransformId,
      metadata: { migratedFrom: "mark", migrationRequired: true }
    }];
  }
  if (block.type === "reveal") {
    return [
      { id: `${id}-format`, type: "show-format", formatId: "format-review", metadata: { migratedFrom: "reveal" } },
      { id: `${id}-reveal`, type: "reveal", scope: "all", metadata: { migratedFrom: "reveal" } }
    ];
  }
  if (block.type === "rate") {
    return [{ id, type: "rate", scale: "oax", metadata: { migratedFrom: "rate" } }];
  }
  if (block.type === "repeat-start") {
    return [{ id, type: "repeat-start", count: Math.max(2, Math.min(20, Number(block.count) || 2)) }];
  }
  if (block.type === "repeat-end") {
    return [{ id, type: "repeat-end" }];
  }

  issues.push({ code: "PROGRAM_UNKNOWN_BLOCK", programId, blockId: sourceId, message: `지원하지 않는 legacy block type: ${block.type}` });
  return [];
}

export function migrateLegacyProgramsV1(storeInput) {
  const store = object(storeInput);
  const sourcePrograms = Array.isArray(store.programs) ? store.programs : [];
  const issues = [];
  const programs = [];
  const idMap = {};

  for (let index = 0; index < sourcePrograms.length; index += 1) {
    const raw = object(sourcePrograms[index]);
    const legacyId = String(raw.id || `legacy-program-${index + 1}`);
    const id = `v2-${legacyId}`;
    const blocks = [];
    for (let blockIndex = 0; blockIndex < (Array.isArray(raw.blocks) ? raw.blocks.length : 0); blockIndex += 1) {
      blocks.push(...mapLegacyProgramBlock(raw.blocks[blockIndex], id, blockIndex, issues));
    }
    programs.push({
      schemaVersion: 2,
      id,
      name: String(raw.name || `프로그램 ${index + 1}`).slice(0, 60),
      blocks,
      metadata: {
        migratedFrom: "dapchigi-program-v1",
        legacyId,
        legacyCreatedAt: raw.createdAt || null,
        legacyUpdatedAt: raw.updatedAt || null,
        executableAfterMigration: !issues.some(issue => issue.programId === id && issue.code === "PROGRAM_MARK_REQUIRES_CLOZE")
      }
    });
    idMap[legacyId] = id;
  }

  return Object.freeze({
    data: {
      schemaVersion: 2,
      enabled: false,
      programs,
      selectedProgramId: idMap[String(store.selectedProgramId || "")] || programs[0]?.id || null
    },
    idMap,
    issues
  });
}

export function migrateLegacyPreferences(raw) {
  return Object.freeze({ data: clone(migratePreferencesToV4(raw)), warnings: [] });
}

export function buildLegacyMigrationReport({ settings = null, formats = null, programs = null } = {}) {
  const preferenceResult = migrateLegacyPreferences(settings || {});
  const formatResult = migrateLegacyFormatsV1(formats || {});
  const programResult = migrateLegacyProgramsV1(programs || {});
  return Object.freeze({
    schemaVersion: 1,
    modules: {
      preferences: preferenceResult.data,
      formats: formatResult.data,
      programs: programResult.data
    },
    warnings: [...formatResult.warnings, ...programResult.issues],
    requiresUserReview: formatResult.warnings.length > 0 || programResult.issues.length > 0
  });
}
