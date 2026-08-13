#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const url = process.env.QTIMER_URL || "http://127.0.0.1:8080";
const executablePath = process.env.CHROME_BIN;
function assert(condition, message){ if (!condition) throw new Error(message); }
if (!executablePath) throw new Error("CHROME_BIN is required.");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "qtimer-storage-v2-"));
const importPath = path.join(tmpDir, "legacy-backup-v1.json");
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

const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage();
const pageErrors = [];
const failedScripts = [];
page.on("pageerror", error => pageErrors.push(error.message));
page.on("requestfailed", request => { if (/\.(?:js|mjs)(?:\?|$)/.test(request.url())) failedScripts.push(`${request.url()} :: ${request.failure()?.errorText || "request failed"}`); });
page.on("response", response => { if (response.status() >= 400 && /\.(?:js|mjs)(?:\?|$)/.test(response.url())) failedScripts.push(`${response.url()} :: HTTP ${response.status()}`); });
page.on("dialog", async dialog => { await dialog.accept(); });

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

  const input = await page.$(".qtimer-data-tools input[type=file]");
  assert(input, "Hidden import file input not found");
  const importNavigation = page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30_000 });
  await input.uploadFile(importPath);
  await importNavigation;

  const afterImport = await page.evaluate(() => ({
    legacy: JSON.parse(localStorage.getItem("qtimer-v0.1-local")),
    v2State: JSON.parse(localStorage.getItem("qtimer.v2.state")),
    v2Preferences: JSON.parse(localStorage.getItem("qtimer.v2.preferences")),
    snapshot: localStorage.getItem("qtimer.v2.preimport-snapshot"),
    staging: localStorage.getItem("qtimer.v2.import-staging")
  }));
  assert(afterImport.legacy.attempts[0].id === "incoming-attempt", "Imported state was not projected back to the live V1 runtime key");
  assert(afterImport.legacy.dapchigiV1.attempts[0].id === "incoming-dap", "Dapchigi ratings were not projected back to V1 state");
  assert(afterImport.v2State.attempts[0].id === "incoming-attempt" && afterImport.v2State.dapchigiRatings[0].id === "incoming-dap", "Canonical V2 state missing imported attempts/ratings");
  assert(afterImport.v2Preferences.presentation.keyword.fontFamily === "mono", "Focus keyword preference was lost during browser import");
  assert(afterImport.v2Preferences.presentation.keyword.highlightColor === "#123456", "Focus keyword highlight was lost during browser import");
  assert(Boolean(afterImport.snapshot), "Transactional pre-import snapshot was not retained");
  assert(afterImport.staging === null, "Import staging marker should be cleared after success");

  const undoNavigation = page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30_000 });
  await page.click("#qtimerUndoImportBtn");
  await undoNavigation;

  const afterUndo = await page.evaluate(() => ({
    legacy: JSON.parse(localStorage.getItem("qtimer-v0.1-local")),
    v2State: localStorage.getItem("qtimer.v2.state"),
    staging: localStorage.getItem("qtimer.v2.import-staging")
  }));
  assert(afterUndo.legacy.attempts[0].id === "original-attempt", "Undo import did not restore the original V1 state");
  assert(afterUndo.v2State === null, "Undo import did not remove newly introduced canonical state key");
  assert(afterUndo.staging === null, "Undo left a staging marker behind");

  assert(pageErrors.length === 0, `Browser page errors: ${pageErrors.join(" | ")}`);
  assert(failedScripts.length === 0, `JavaScript/module load failures: ${failedScripts.join(" | ")}`);
  console.log("# QTimer Storage V2 browser smoke");
  console.log("PASS: backup/restore controls expose the Storage V2 contract");
  console.log("PASS: legacy v1 JSON imports into canonical V2 and current V1 state together");
  console.log("PASS: Dapchigi ratings and Focus keyword preferences survive migration");
  console.log("PASS: transactional import snapshot supports browser-level undo");
} finally {
  await browser.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
