// QTimer v0.1 local learning-data backup / restore.
(function(){
  const SNAPSHOT_KEY = `${STORAGE_KEY}-preimport`;
  const SETTINGS_KEY = "qtimer-settings-v1";
  const SETTINGS_SNAPSHOT_KEY = `${SETTINGS_KEY}-preimport`;

  function currentAttemptCount(){
    return Array.isArray(state?.attempts) ? state.attempts.length : 0;
  }

  function validObject(value){
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function currentSettings(){
    if (globalThis.QTIMER_SETTINGS?.get) return globalThis.QTIMER_SETTINGS.get();
    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      return validObject(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function exportPayload(){
    return {
      format: "qtimer-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      storageKey: STORAGE_KEY,
      questionBankVersion: state.questionBankVersion || (typeof buildQuestionBankVersion === "function" ? buildQuestionBankVersion() : null),
      questionCount: QUESTIONS.length,
      state: JSON.parse(JSON.stringify(state)),
      settings: currentSettings()
    };
  }

  function downloadJson(payload, prefix="qtimer-backup"){
    const stamp = new Date().toISOString().replace(/[:.]/g,"-");
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportLearningData(){
    downloadJson(exportPayload());
  }

  function validateBackup(payload){
    if (!validObject(payload) || payload.format !== "qtimer-backup" || payload.version !== 1) {
      throw new Error("QTimer 백업 파일 형식이 아닙니다.");
    }
    if (!validObject(payload.state) || !Array.isArray(payload.state.attempts)) {
      throw new Error("학습 기록 데이터가 올바르지 않습니다.");
    }
    if (!validObject(payload.state.overrides || {}) || !validObject(payload.state.flags || {})) {
      throw new Error("정답 검증/플래그 데이터가 올바르지 않습니다.");
    }
    if (payload.settings != null && !validObject(payload.settings)) {
      throw new Error("환경설정 데이터가 올바르지 않습니다.");
    }
    return payload;
  }

  async function importLearningData(file){
    const text = await file.text();
    const payload = validateBackup(JSON.parse(text));
    const incomingAttempts = payload.state.attempts.length;
    const currentAttempts = currentAttemptCount();
    const hasSettings = validObject(payload.settings);
    const ok = window.confirm(
      `QTimer 학습 데이터를 복원합니다.\n\n현재 기록: ${currentAttempts}회\n가져올 기록: ${incomingAttempts}회\n환경설정 포함: ${hasSettings ? "예" : "아니오"}\n\n현재 상태는 브라우저 내부 임시 백업으로 1회 보관한 뒤 교체됩니다. 계속하시겠습니까?`
    );
    if (!ok) return;

    const currentSnapshot = localStorage.getItem(STORAGE_KEY);
    if (currentSnapshot) localStorage.setItem(SNAPSHOT_KEY, currentSnapshot);
    const currentSettingsSnapshot = localStorage.getItem(SETTINGS_KEY);
    if (currentSettingsSnapshot) localStorage.setItem(SETTINGS_SNAPSHOT_KEY, currentSettingsSnapshot);

    const imported = {...defaultState, ...payload.state};
    imported.attempts = Array.isArray(payload.state.attempts) ? payload.state.attempts : [];
    imported.overrides = validObject(payload.state.overrides) ? payload.state.overrides : {};
    imported.flags = validObject(payload.state.flags) ? payload.state.flags : {};
    imported.currentRoundIds = QUESTIONS.map(q=>q.id);
    imported.currentIndex = Math.max(0, Math.min(Number(imported.currentIndex)||0, Math.max(0, QUESTIONS.length-1)));
    if (typeof buildQuestionBankVersion === "function") imported.questionBankVersion = buildQuestionBankVersion();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    if (hasSettings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload.settings));
    window.alert(`복원 완료: ${incomingAttempts}회 학습 기록${hasSettings ? "과 환경설정" : ""}을 가져왔습니다. 화면을 다시 불러옵니다.`);
    location.reload();
  }

  function restorePreImportSnapshot(){
    const snapshot = localStorage.getItem(SNAPSHOT_KEY);
    if (!snapshot) {
      window.alert("가져오기 직전 임시 백업이 없습니다.");
      return;
    }
    if (!window.confirm("가장 최근 데이터 가져오기 직전 상태로 되돌리시겠습니까? 학습기록과 함께 저장된 환경설정도 복원합니다.")) return;
    localStorage.setItem(STORAGE_KEY, snapshot);
    const settingsSnapshot = localStorage.getItem(SETTINGS_SNAPSHOT_KEY);
    if (settingsSnapshot) localStorage.setItem(SETTINGS_KEY, settingsSnapshot);
    location.reload();
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
    exportBtn.title = "현재 풀이·취약·정답검증 기록과 환경설정을 JSON 파일로 저장";
    exportBtn.addEventListener("click", exportLearningData);

    const importBtn = document.createElement("button");
    importBtn.id = "qtimerImportBtn";
    importBtn.type = "button";
    importBtn.textContent = "복원";
    importBtn.title = "다른 PC 또는 브라우저에서 내보낸 QTimer JSON 백업 복원";

    const undoImportBtn = document.createElement("button");
    undoImportBtn.id = "qtimerUndoImportBtn";
    undoImportBtn.type = "button";
    undoImportBtn.textContent = "복원취소";
    undoImportBtn.title = "가장 최근 가져오기 직전 학습기록·환경설정 상태로 되돌리기";
    undoImportBtn.addEventListener("click", restorePreImportSnapshot);

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
})();
