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
