// QTimer v0.1 browser-flow quality fixes.
// Keep this small and data-neutral: it only reconciles UI state after undo.
(function applyQTimerUiQualityFixes(){
  function undoLastAttemptAndRestoreQuestion(){
    if (!state.attempts.length) return;

    const removed = state.attempts.pop();
    if (removed?.id === lastAttemptId) lastAttemptId = null;

    const removedIndex = state.currentRoundIds.indexOf(removed?.questionId);
    if (removedIndex >= 0) state.currentIndex = removedIndex;

    saveState();
    renderQuestion();
  }

  // Reassign the global lexical binding so Ctrl+Z uses the reconciled behavior.
  undoLastAttempt = undoLastAttemptAndRestoreQuestion;

  // The original app.js click listener was registered before this compatibility layer.
  // Intercept in capture phase so only one undo implementation executes.
  els.undoBtn.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    undoLastAttemptAndRestoreQuestion();
  }, { capture: true });
})();

// Make Dapchigi a first-class top navigation entry instead of hiding it only inside
// the Study mode selector. Clicking it opens the study workspace and activates
// the existing Dapchigi mode; no question-bank data is changed.
(function installDapchigiTopNavigation(){
  const tabs = document.querySelector(".view-tabs");
  const studyTab = document.querySelector("#studyTab");
  const dashboardTab = document.querySelector("#dashboardTab");
  if (!tabs || !studyTab || document.querySelector("#dapchigiTab")) return;

  const dapchigiTab = document.createElement("button");
  dapchigiTab.id = "dapchigiTab";
  dapchigiTab.type = "button";
  dapchigiTab.textContent = "답치기";
  studyTab.insertAdjacentElement("afterend", dapchigiTab);

  function setDapchigiActive(active){
    dapchigiTab.classList.toggle("active", active);
    if (active) {
      studyTab.classList.remove("active");
      dashboardTab?.classList.remove("active");
    }
  }

  function activateDapchigi(){
    if (typeof showStudyV01 === "function") showStudyV01(false);

    const hasDapchigiOption = [...els.modeSelect.options]
      .some(option => option.value === "dapchigi");

    if (hasDapchigiOption) {
      els.modeSelect.value = "dapchigi";
      els.modeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // The feature script is appended immediately after this layer. Persist the
      // requested mode so its initializer can enter Dapchigi as soon as it loads.
      state.mode = "dapchigi";
      saveState();
    }

    setDapchigiActive(true);
  }

  dapchigiTab.addEventListener("click", activateDapchigi);
  studyTab.addEventListener("click", () => setDapchigiActive(false));
  dashboardTab?.addEventListener("click", () => setDapchigiActive(false));
  els.modeSelect.addEventListener("change", () => {
    const inStudyView = !document.querySelector("#studyView")?.hidden;
    setDapchigiActive(inStudyView && els.modeSelect.value === "dapchigi");
  });
})();

// Feature layers that need the complete 973-question bank must initialize after every
// subject data script and compatibility wrapper has loaded. Keep SOURCE BANK immutable.
(function loadPostBankFeatures(){
  if (document.querySelector('script[data-qtimer-feature="dapchigi-v1"]')) return;

  function subjectOfId(id){
    if (id.startsWith("sujebi-2026-sw-design-")) return "s1";
    if (id.startsWith("sujebi-2026-sw-dev-")) return "s2";
    if (id.startsWith("sujebi-2026-db-build-")) return "s3";
    if (id.startsWith("sujebi-2026-prog-lang-")) return "s4";
    if (id.startsWith("sujebi-2026-system-mgmt-") || id.startsWith("sujebi-2026-system-build-")) return "s5";
    return "unknown";
  }

  function chapterOfId(id){
    const match = id.match(/-ch(\d{2})-/);
    if (match) return `ch${match[1]}`;
    if (/^sujebi-2026-sw-design-(?:13|14|15|16|17|18|19|20|21|22)$/.test(id)) return "ch04";
    return "unknown";
  }

  function restoreSavedDapchigiScope(){
    if (state.mode !== "dapchigi" || !state.dapchigiV1) return;
    const subject = state.dapchigiV1.subject || "all";
    const chapter = state.dapchigiV1.chapter || "all";
    const scopedIds = QUESTIONS
      .filter(q => (subject === "all" || subjectOfId(q.id) === subject)
        && (chapter === "all" || chapterOfId(q.id) === chapter))
      .map(q => q.id);

    if (!scopedIds.length) return;
    const exact = state.currentRoundIds.length === scopedIds.length
      && state.currentRoundIds.every((id, index) => id === scopedIds[index]);
    if (exact) return;

    state.currentRoundIds = scopedIds;
    state.currentIndex = Math.max(0, Math.min(Number(state.currentIndex) || 0, scopedIds.length - 1));
    saveState();
    renderQuestion();
  }

  function loadDapchigiStyleEnhancements(){
    if (document.querySelector('script[data-qtimer-feature="dapchigi-style-enhancements"]')) return;
    const enhancement = document.createElement("script");
    enhancement.src = "./dapchigi-style-enhancements.js";
    enhancement.dataset.qtimerFeature = "dapchigi-style-enhancements";
    enhancement.defer = false;
    document.body.appendChild(enhancement);
  }

  const script = document.createElement("script");
  script.src = "./dapchigi-v1.js";
  script.dataset.qtimerFeature = "dapchigi-v1";
  script.defer = false;
  script.addEventListener("load", () => {
    restoreSavedDapchigiScope();
    loadDapchigiStyleEnhancements();
  }, { once: true });
  document.body.appendChild(script);
})();

// Settings v3 keeps the stable Settings v2 renderer, but must preserve v3-only fields
// before v2 normalizes/persists the shared settings key during page boot.
(function prepareSettingsV3(){
  try {
    const raw = localStorage.getItem("qtimer-settings-v2");
    if (raw) globalThis.__QTIMER_SETTINGS_V3_BOOTSTRAP_RAW = raw;
  } catch {}

  function load(){
    if (globalThis.QTIMER_SETTINGS?.version !== 2) {
      setTimeout(load, 30);
      return;
    }
    if (document.querySelector('script[data-qtimer-feature="settings-v3"]')) return;
    const script = document.createElement("script");
    script.src = "./settings-v3.js";
    script.dataset.qtimerFeature = "settings-v3";
    script.defer = false;
    document.body.appendChild(script);
  }

  load();
})();
