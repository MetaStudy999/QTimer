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

  const script = document.createElement("script");
  script.src = "./dapchigi-v1.js";
  script.dataset.qtimerFeature = "dapchigi-v1";
  script.defer = false;
  script.addEventListener("load", restoreSavedDapchigiScope, { once: true });
  document.body.appendChild(script);
})();
