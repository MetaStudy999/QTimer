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
  const script = document.createElement("script");
  script.src = "./dapchigi-v1.js";
  script.dataset.qtimerFeature = "dapchigi-v1";
  script.defer = false;
  document.body.appendChild(script);
})();
