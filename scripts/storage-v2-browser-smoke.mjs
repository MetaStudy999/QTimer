#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { createBrowserStorageRuntime } from "../src/v2/data/browser-storage-runtime.mjs";

const url = process.env.QTIMER_URL || "http://127.0.0.1:8080";
const executablePath = process.env.CHROME_BIN;
function assert(condition, message){ if (!condition) throw new Error(message); }
if (!executablePath) throw new Error("CHROME_BIN is required.");

class MemoryStorage {
  constructor(entries = []) { this.map = new Map(entries); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "qtimer-storage-v2-"));
const importPath = path.join(tmpDir, "legacy-backup-v1.json");
const transitionV2Path = path.join(tmpDir, "transition-backup-v2.json");
const incoming = {
  format: "qtimer-backup",
  version: 1,
  exportedAt: "2026-08-13T00:00:00.000Z",
  questionBankVersion: "browser-smoke",
  state: {
    currentIndex: 0,
    mode: "rapid",
    timerPolicy: "hard",
    timeLimitSec: 20,
    autoDelayMs: 500,
    attempts: [{ id: "incoming-attempt", questionId: "sujebi-2026-sw-design-13", isCorrect: true }],
    overrides: {},
    flags: {},
    currentRoundIds: ["sujebi-2026-sw-design-13"],
    dapchigiV1: { version: 1, round: 1, attempts: [{ id: "incoming-dap", questionId: "sujebi-2026-sw-design-13", rating: "o", round: 1, scopeKey: "all:all" }] }
  },
  settings: {
    version: 3,
    dapchigi: {
      question: { fontFamily: "default", fontSize: "default", fontColor: "#16324f", bold: false, highlight: true, highlightColor: "#dceeff", emphasisScope: "all", theme: "focus-blue" },
      answer: { fontFamily: "default", fontSize: "default", fontColor: "#991b1b", bold: true, highlight: true, highlightColor: "#fee2e2", emphasisScope: "all", theme: "key-red", answerMark: false, keywordRed: true }
    },
    display: { scaleLevel: 6 }
  },
  focusReadingSettings: {
    version: 1,
    keyword: { inheritQuestionFont: false, fontFamily: "mono", fontSize: "18", fontColor: "#ffffff", bold: true, highlightMode: "custom", highlightColor: "#123456" }
  }
};
fs.writeFileSync(importPath, JSON.stringify(incoming), "utf8");

const transitionFormats = {
  version: 1,
  selectedFormatId: "transition-format",
  previewDevice: "mobile",
  formats: [{ id: "transition-format", name: "전환 백업 양식", type: "blank", layout: "stack", ratio: 65, showChoices: true, explanation: "hidden", answerMode: "both", blankCount: 2 }]
};
const transitionPrograms = {
  version: 1,
  enabled: true,
  selectedProgramId: "transition-program",
  programs: [{ id: "transition-program", name: "전환 백업 프로그램", blocks: [{ id: "q", type: "question" }, { id: "m", type: "mark" }, { id: "r", type: "rate" }] }]
};
const transitionRuntime = createBrowserStorageRuntime({ storage: new MemoryStorage(), now: () => "2026-08-13T00:10:00.000Z" });
const transitionBackup = transitionRuntime.buildBackup({
  legacySources: {
    state: incoming.state,
    settings: incoming.settings,
    focusSettings: incoming.focusReadingSettings,
    formats: transitionFormats,
    programs: transitionPrograms
  },
  questionBankVersion: "browser-smoke"
}).payload;
assert(transitionBackup.compatibility?.legacyV1?.formats?.selectedFormatId === "transition-format", "Transition V2 fixture lacks Format compatibility snapshot");
assert(transitionBackup.compatibility?.legacyV1?.programs?.selectedProgramId === "transition-program", "Transition V2 fixture lacks Program compatibility snapshot");
fs.writeFileSync(transitionV2Path, JSON.stringify(transitionBackup), "utf8");

const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage();
const pageErrors = [];
const failedScripts = [];
page.on("pageerror", error => pageErrors.push(error.message));
page.on("requestfailed", request => { if (/\.(?:js|mjs)(?:\?|$)/.test(request.url())) failedScripts.push(`${request.url()} :: ${request.failure()?.errorText || "request failed"}`); });
page.on("response", response => { if (response.status() >= 400 && /\.(?:js|mjs)(?:\?|$)/.test(response.url())) failedScripts.push(`${response.url()} :: HTTP ${response.status()}`); });
page.on("dialog", async dialog => { await dialog.accept(); });

async function uploadAndWait(filePath) {
  const input = await page.$(".qtimer-data-tools input[type=file]");
  assert(input, "Hidden import file input not found");
  const navigation = page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30_000 });
  await input.uploadFile(filePath);
  await navigation;
}

async function clickUndoAndWait() {
  const navigation = page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30_000 });
  await page.click("#qtimerUndoImportBtn");
  await navigation;
}

try {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => localStorage.setItem("qtimer-v0.1-local", JSON.stringify({
    currentIndex: 0,
    mode: "rapid",
    timerPolicy: "hard",
    timeLimitSec: 20,
    autoDelayMs: 500,
    attempts: [{ id: "original-attempt", questionId: "sujebi-2026-sw-design-13", isCorrect: false }],
    overrides: {},
    flags: {},
    currentRoundIds: ["sujebi-2026-sw-design-13"],
    dapchigiV1: { version: 1, round: 1, attempts: [] }
  })));
  await page.reload({ waitUntil: "networkidle0", timeout: 30_000 });

  await page.waitForSelector("#qtimerExportBtn", { timeout: 10_000 });
  const controls = await page.evaluate(() => ({
    exportTitle: document.querySelector("#qtimerExportBtn")?.title || "",
    importTitle: document.querySelector("#qtimerImportBtn")?.title || "",
    undoTitle: document.querySelector("#qtimerUndoImportBtn")?.title || "",
    input: Boolean(document.querySelector(".qtimer-data-tools input[type=file]"))
  }));
  assert(controls.exportTitle.includes("Storage V2") && controls.exportTitle.includes("변환") && controls.exportTitle.includes("메모"), "Backup UI does not describe Storage V2 coverage");
  assert(controls.importTitle.includes("v1/v2") && controls.input, "Import UI is not wired for v1/v2 JSON backups");
  assert(controls.undoTitle.includes("가져오기 직전"), "Undo import UI is missing");

  // Legacy v1 backup path remains supported.
  await uploadAndWait(importPath);
  const afterV1Import = await page.evaluate(() => ({
    legacy: JSON.parse(localStorage.getItem("qtimer-v0.1-local")),
    v2State: JSON.parse(localStorage.getItem("qtimer.v2.state")),
    v2Preferences: JSON.parse(localStorage.getItem("qtimer.v2.preferences")),
    snapshot: localStorage.getItem("qtimer.v2.preimport-snapshot"),
    staging: localStorage.getItem("qtimer.v2.import-staging")
  }));
  assert(afterV1Import.legacy.attempts[0].id === "incoming-attempt", "Imported state was not projected back to the live V1 runtime key");
  assert(afterV1Import.legacy.dapchigiV1.attempts[0].id === "incoming-dap", "Dapchigi ratings were not projected back to V1 state");
  assert(afterV1Import.v2State.attempts[0].id === "incoming-attempt" && afterV1Import.v2State.dapchigiRatings[0].id === "incoming-dap", "Canonical V2 state missing imported attempts/ratings");
  assert(afterV1Import.v2Preferences.presentation.keyword.fontFamily === "mono", "Focus keyword preference was lost during browser import");
  assert(afterV1Import.v2Preferences.presentation.keyword.highlightColor === "#123456", "Focus keyword highlight was lost during browser import");
  assert(Boolean(afterV1Import.snapshot), "Transactional pre-import snapshot was not retained");
  assert(afterV1Import.staging === null, "Import staging marker should be cleared after success");

  await clickUndoAndWait();
  const afterFirstUndo = await page.evaluate(() => ({
    legacy: JSON.parse(localStorage.getItem("qtimer-v0.1-local")),
    v2State: localStorage.getItem("qtimer.v2.state"),
    staging: localStorage.getItem("qtimer.v2.import-staging")
  }));
  assert(afterFirstUndo.legacy.attempts[0].id === "original-attempt", "Undo import did not restore the original V1 state");
  assert(afterFirstUndo.v2State === null, "Undo import did not remove newly introduced canonical state key");
  assert(afterFirstUndo.staging === null, "Undo left a staging marker behind");

  // Seed existing V1 Format/Program values, then restore a self-generated transition V2 backup.
  await page.evaluate(() => {
    localStorage.setItem("qtimer-dapchigi-formats-v1", JSON.stringify({
      version: 1,
      selectedFormatId: "before-format",
      previewDevice: "desktop",
      formats: [{ id: "before-format", name: "복원 전 양식", type: "question", layout: "stack", ratio: 65, showChoices: true, explanation: "hidden", answerMode: "both", blankCount: 1 }]
    }));
    localStorage.setItem("qtimer-dapchigi-programs-v1", JSON.stringify({
      version: 1,
      enabled: false,
      selectedProgramId: "before-program",
      programs: [{ id: "before-program", name: "복원 전 프로그램", blocks: [{ id: "rate", type: "rate" }] }]
    }));
  });
  await page.reload({ waitUntil: "networkidle0", timeout: 30_000 });
  await uploadAndWait(transitionV2Path);

  const afterV2Import = await page.evaluate(() => ({
    formats: JSON.parse(localStorage.getItem("qtimer-dapchigi-formats-v1")),
    programs: JSON.parse(localStorage.getItem("qtimer-dapchigi-programs-v1")),
    v2Formats: JSON.parse(localStorage.getItem("qtimer.v2.formats")),
    v2Programs: JSON.parse(localStorage.getItem("qtimer.v2.programs")),
    report: JSON.parse(localStorage.getItem("qtimer.v2.migration-report"))
  }));
  assert(afterV2Import.formats.selectedFormatId === "transition-format", "Self-generated V2 backup did not immediately restore the V1 Format store");
  assert(afterV2Import.formats.previewDevice === "mobile", "V1 Format preview device was not preserved by transition compatibility snapshot");
  assert(afterV2Import.programs.selectedProgramId === "transition-program", "Self-generated V2 backup did not immediately restore the V1 Program store");
  assert(afterV2Import.programs.enabled === true, "V1 Program enabled state was not preserved by transition compatibility snapshot");
  assert(afterV2Import.v2Formats.formats[0].metadata.requiresTransformAuthoring === true, "Canonical V2 Format migration was not preserved alongside V1 compatibility data");
  assert(afterV2Import.v2Programs.programs[0].metadata.executableAfterMigration === false, "Canonical V2 Program migration was not preserved alongside V1 compatibility data");
  assert(!afterV2Import.report.deferredModules.includes("formats") && !afterV2Import.report.deferredModules.includes("programs"), "Transition backup incorrectly deferred restorable V1 Format/Program data");

  await clickUndoAndWait();
  const afterSecondUndo = await page.evaluate(() => ({
    formats: JSON.parse(localStorage.getItem("qtimer-dapchigi-formats-v1")),
    programs: JSON.parse(localStorage.getItem("qtimer-dapchigi-programs-v1"))
  }));
  assert(afterSecondUndo.formats.selectedFormatId === "before-format", "Undo did not restore pre-import V1 Format state");
  assert(afterSecondUndo.programs.selectedProgramId === "before-program", "Undo did not restore pre-import V1 Program state");

  assert(pageErrors.length === 0, `Browser page errors: ${pageErrors.join(" | ")}`);
  assert(failedScripts.length === 0, `JavaScript/module load failures: ${failedScripts.join(" | ")}`);
  console.log("# QTimer Storage V2 browser smoke");
  console.log("PASS: backup/restore controls expose the Storage V2 contract");
  console.log("PASS: legacy v1 JSON imports into canonical V2 and current V1 state together");
  console.log("PASS: Dapchigi ratings and Focus keyword preferences survive migration");
  console.log("PASS: self-generated transition V2 backups immediately restore current V1 Formats/Programs");
  console.log("PASS: canonical migrated Format/Program data is preserved beside the compatibility snapshot");
  console.log("PASS: transactional import snapshot supports browser-level undo for state and Format/Program data");
} finally {
  await browser.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
