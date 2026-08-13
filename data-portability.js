// QTimer Storage V2 data portability bridge.
// The current V1 study runtime remains live; export/import uses canonical V2 modules transactionally.
(function(){
  const LEGACY_SETTINGS_KEY = "qtimer-settings-v2";
  const LEGACY_SETTINGS_V1_KEY = "qtimer-settings-v1";
  const LEGACY_FOCUS_KEY = "qtimer-focus-quick-settings-v1";
  const LEGACY_PROGRAMS_KEY = "qtimer-dapchigi-programs-v1";
  const LEGACY_FORMATS_KEY = "qtimer-dapchigi-formats-v1";

  // Pre-Storage-V2 fallback snapshots remain readable so an old recovery path is never stranded.
  const OLD_SNAPSHOTS = Object.freeze({
    state: `${STORAGE_KEY}-preimport`,
    settings: `${LEGACY_SETTINGS_KEY}-preimport`,
    focus: `${LEGACY_FOCUS_KEY}-preimport`,
    programs: `${LEGACY_PROGRAMS_KEY}-preimport`
  });

  let runtimePromise = null;

  function clone(value){ return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function validObject(value){ return value && typeof value === "object" && !Array.isArray(value); }
  function readJson(key){
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return validObject(parsed) ? parsed : null;
    } catch { return null; }
  }

  function storageV2(){
    if (!runtimePromise) {
      runtimePromise = import("./src/v2/data/browser-storage-runtime.mjs")
        .then(module => module.createBrowserStorageRuntime({ storage: localStorage }));
    }
    return runtimePromise;
  }

  function currentSettings(){
    if (globalThis.QTIMER_SETTINGS?.get) return globalThis.QTIMER_SETTINGS.get();
    return readJson(LEGACY_SETTINGS_KEY) || readJson(LEGACY_SETTINGS_V1_KEY);
  }

  function currentFocusSettings(){
    if (globalThis.QTIMER_FOCUS_QUICK_SETTINGS?.get) return globalThis.QTIMER_FOCUS_QUICK_SETTINGS.get();
    return readJson(LEGACY_FOCUS_KEY);
  }

  function currentDapPrograms(){
    if (globalThis.QTIMER_DAP_PROGRAMS?.get) return globalThis.QTIMER_DAP_PROGRAMS.get();
    return readJson(LEGACY_PROGRAMS_KEY);
  }

  function currentDapFormats(){
    if (globalThis.QTIMER_DAP_FORMATS?.get) return globalThis.QTIMER_DAP_FORMATS.get();
    return readJson(LEGACY_FORMATS_KEY);
  }

  function liveLegacySources(){
    return {
      state: clone(state),
      settings: currentSettings(),
      focusSettings: currentFocusSettings(),
      programs: currentDapPrograms(),
      formats: currentDapFormats()
    };
  }

  function questionBankVersion(){
    return state.questionBankVersion || (typeof buildQuestionBankVersion === "function" ? buildQuestionBankVersion() : null);
  }

  function downloadJson(payload, prefix="qtimer-backup-v2"){
    const stamp = new Date().toISOString().replace(/[:.]/g,"-");
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${prefix}-${stamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function exportLearningData(){
    const runtime = await storageV2();
    const result = runtime.buildBackup({
      legacySources: liveLegacySources(),
      questionBankVersion: questionBankVersion(),
      appVersion: "qtimer-storage-v2-bridge"
    });
    downloadJson(result.payload);
  }

  function importSummary(prepared){
    const modules = prepared.canonicalModuleIds.join(", ") || "없음";
    const attempts = prepared.attemptCount == null ? "포함 안 됨" : `${prepared.attemptCount}회`;
    const deferred = prepared.deferredModules.length ? prepared.deferredModules.join(", ") : "없음";
    const warnings = prepared.warnings.length;
    return [
      `QTimer 백업 v${prepared.sourceVersion} → Storage V2로 복원합니다.`,
      "",
      `학습 기록: ${attempts}`,
      `복원 모듈: ${modules}`,
      `현재 V1 화면에서 활성화가 보류되는 V2 전용 모듈: ${deferred}`,
      `마이그레이션 검토 항목: ${warnings}건`,
      "",
      "모든 데이터는 먼저 검증한 뒤 한 번의 트랜잭션으로 교체됩니다.",
      "가져오기 직전 상태는 ‘복원취소’용 스냅샷으로 보관됩니다.",
      "계속하시겠습니까?"
    ].join("\n");
  }

  async function importLearningData(file){
    const runtime = await storageV2();
    const text = await file.text();
    const prepared = runtime.prepareImportText(text);
    if (!window.confirm(importSummary(prepared))) return;

    const result = runtime.commitPreparedImport(prepared);
    const deferredNote = result.deferredModules.length
      ? `\n\nV2 전용 데이터(${result.deferredModules.join(", ")})는 안전하게 복원됐지만 현재 V1 화면에는 아직 연결하지 않습니다. 해당 V2 화면이 적용되면 그대로 사용됩니다.`
      : "";
    const reviewNote = result.requiresUserReview
      ? `\n\n기존 빈칸/mark 데이터 중 정확한 위치 정보가 없던 항목 ${result.warnings.length}건은 자동으로 추측하지 않고 ‘재지정 필요’ 상태로 보존했습니다.`
      : "";
    window.alert(`Storage V2 복원 완료. 화면을 다시 불러옵니다.${deferredNote}${reviewNote}`);
    location.reload();
  }

  function restoreOldSnapshotFallback(){
    const stateSnapshot = localStorage.getItem(OLD_SNAPSHOTS.state);
    if (!stateSnapshot) return false;
    localStorage.setItem(STORAGE_KEY, stateSnapshot);
    const settings = localStorage.getItem(OLD_SNAPSHOTS.settings);
    if (settings) localStorage.setItem(LEGACY_SETTINGS_KEY, settings);
    const focus = localStorage.getItem(OLD_SNAPSHOTS.focus);
    if (focus) localStorage.setItem(LEGACY_FOCUS_KEY, focus);
    const programs = localStorage.getItem(OLD_SNAPSHOTS.programs);
    if (programs) localStorage.setItem(LEGACY_PROGRAMS_KEY, programs);
    return true;
  }

  async function restorePreImportSnapshot(){
    const runtime = await storageV2();
    if (!window.confirm("가장 최근 데이터 가져오기 직전 상태로 되돌리시겠습니까?")) return;
    const result = runtime.undoLastImport();
    if (result.restored) {
      window.alert(`복원취소 완료: ${result.restoredKeys}개 저장 항목을 가져오기 직전 상태로 되돌렸습니다.`);
      location.reload();
      return;
    }
    if (restoreOldSnapshotFallback()) {
      window.alert("이전 버전에서 저장한 가져오기 직전 상태를 복원했습니다.");
      location.reload();
      return;
    }
    window.alert("가져오기 직전 임시 백업이 없습니다.");
  }

  function installDataButtons(){
    if (document.querySelector("#qtimerExportBtn")) return;
    const host = document.querySelector(".header-right") || document.querySelector(".control-bar");
    if (!host) return;

    const group = document.createElement("div");
    group.className = "view-tabs qtimer-data-tools";
    group.setAttribute("aria-label","학습 데이터 백업 및 복원");

    const exportBtn = document.createElement("button");
    exportBtn.id = "qtimerExportBtn";
    exportBtn.type = "button";
    exportBtn.textContent = "백업";
    exportBtn.title = "학습기록·O/A/X·환경설정·양식·변환·프로그램·메모를 QTimer Storage V2 JSON으로 저장";
    exportBtn.addEventListener("click", async () => {
      try { await exportLearningData(); }
      catch (error) { window.alert(`백업 실패: ${error.message || error}`); }
    });

    const importBtn = document.createElement("button");
    importBtn.id = "qtimerImportBtn";
    importBtn.type = "button";
    importBtn.textContent = "복원";
    importBtn.title = "QTimer v1/v2 JSON 백업을 검증 후 트랜잭션으로 복원";

    const undoImportBtn = document.createElement("button");
    undoImportBtn.id = "qtimerUndoImportBtn";
    undoImportBtn.type = "button";
    undoImportBtn.textContent = "복원취소";
    undoImportBtn.title = "가장 최근 가져오기 직전 상태로 되돌리기";
    undoImportBtn.addEventListener("click", async () => {
      try { await restorePreImportSnapshot(); }
      catch (error) { window.alert(`복원취소 실패: ${error.message || error}`); }
    });

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.hidden = true;
    input.addEventListener("change", async ()=>{
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;
      try { await importLearningData(file); }
      catch (error) { window.alert(`복원 실패: ${error.message || error}`); }
    });
    importBtn.addEventListener("click", ()=>input.click());

    group.append(exportBtn, importBtn, undoImportBtn, input);
    const metrics = host.querySelector(".header-metrics");
    if (metrics) host.insertBefore(group, metrics);
    else host.appendChild(group);
  }

  installDataButtons();

  // If the browser was closed during a V2 import, roll back before the user resumes studying.
  storageV2().then(runtime => {
    const recovery = runtime.recoverInterruptedImport();
    if (!recovery.recovered) return;
    window.alert(`중단된 데이터 복원을 감지하여 ${recovery.restoredKeys}개 저장 항목을 안전하게 롤백했습니다. 화면을 다시 불러옵니다.`);
    location.reload();
  }).catch(error => console.error("[QTimer] Storage V2 recovery check failed", error));
})();