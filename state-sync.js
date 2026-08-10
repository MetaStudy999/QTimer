// QTimer v0.1 question-bank/state synchronization.
// Keeps attempts intact while reconciling navigation with the current question bank.

function buildQuestionBankVersion(){
  let hash = 5381;
  for (const id of QUESTIONS.map(q => q.id)) {
    for (let i = 0; i < id.length; i += 1) hash = ((hash << 5) + hash) ^ id.charCodeAt(i);
  }
  return `v0.1-${QUESTIONS.length}-${(hash >>> 0).toString(16)}`;
}

function currentUniqueAttemptedCount(){
  const valid = new Set(QUESTIONS.map(q => q.id));
  return new Set(state.attempts.filter(a => valid.has(a.questionId)).map(a => a.questionId)).size;
}

function syncQuestionBankState(){
  const validIds = new Set(QUESTIONS.map(q => q.id));
  const previousRound = Array.isArray(state.currentRoundIds) ? state.currentRoundIds : [];
  const previousIndex = Number.isInteger(state.currentIndex) ? state.currentIndex : 0;
  const previousQuestionId = previousRound[previousIndex];
  const nextVersion = buildQuestionBankVersion();

  // Attempts, overrides and flags are intentionally preserved. Only navigation state is reconciled.
  if (state.mode === "weak") {
    const weakIds = typeof dashboardWeakIds === "function" ? dashboardWeakIds() : weakQuestionIds();
    state.currentRoundIds = weakIds.length ? weakIds.filter(id => validIds.has(id)) : QUESTIONS.map(q => q.id);
  } else {
    state.currentRoundIds = QUESTIONS.map(q => q.id);
  }

  const preservedIndex = previousQuestionId ? state.currentRoundIds.indexOf(previousQuestionId) : -1;
  if (preservedIndex >= 0) state.currentIndex = preservedIndex;
  else state.currentIndex = Math.max(0, Math.min(previousIndex, state.currentRoundIds.length - 1));

  state.questionBankVersion = nextVersion;
  saveState();
}

function renderHeaderContext(){
  const attempted = currentUniqueAttemptedCount();
  const weak = typeof dashboardWeakIds === "function" ? dashboardWeakIds().length : weakQuestionIds().length;
  const onDashboard = typeof dash !== "undefined" && dash.dashboardView && !dash.dashboardView.hidden;

  if (onDashboard) {
    els.progressText.textContent = `풀이 ${attempted} / ${QUESTIONS.length}`;
  } else {
    const total = state.currentRoundIds.length || QUESTIONS.length;
    const position = total ? Math.min(state.currentIndex + 1, total) : 0;
    els.progressText.textContent = `현재 ${position} / ${total}`;
  }
  els.weakCount.textContent = `취약 ${weak}`;
}

syncQuestionBankState();

if (typeof renderDashboardV01 === "function") {
  const previousRenderDashboardV01 = renderDashboardV01;
  renderDashboardV01 = function(){
    previousRenderDashboardV01();
    renderHeaderContext();
  };
}

const previousUpdateProgressStateSync = updateProgress;
updateProgress = function(){
  previousUpdateProgressStateSync();
  renderHeaderContext();
};

if (typeof renderDashboardV01 === "function") renderDashboardV01();
renderHeaderContext();
