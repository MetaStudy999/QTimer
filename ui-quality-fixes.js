// QTimer v0.1 browser-flow quality fixes.
// Keep this small and data-neutral: it only reconciles UI state after undo.
(function applyQTimerUiQualityFixes(){
  const originalUndoLastAttempt = undoLastAttempt;

  function undoLastAttemptAndRestoreQuestion(){
    if (!state.attempts.length) return;

    const removed = state.attempts.pop();
    if (removed?.id === lastAttemptId) lastAttemptId = null;

    const removedIndex = state.currentRoundIds.indexOf(removed?.questionId);
    if (removedIndex >= 0) state.currentIndex = removedIndex;

    saveState();
    renderQuestion();
  }

  // app.js attached the original function directly to the button, so replace that listener too.
  els.undoBtn.removeEventListener("click", originalUndoLastAttempt);
  undoLastAttempt = undoLastAttemptAndRestoreQuestion;
  els.undoBtn.addEventListener("click", undoLastAttemptAndRestoreQuestion);
})();
