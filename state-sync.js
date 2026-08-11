// QTimer v0.1 question-bank/state synchronization.
// Keeps attempts intact while reconciling navigation with the current question bank.

// Data-integrity guard: normalize exact duplicate IDs globally and enforce the
// verified Subject 3 chapter ranges before any dashboard/state calculation.
(function normalizeQuestionBankIntegrity(){
  const s3Max = {1:33, 2:52, 3:73, 4:30, 5:3}; // 191 verified questions
  const ids = new Set();
  const s3Logical = new Set();
  const normalized = [];
  const removed = [];

  for (const q of QUESTIONS) {
    if (!q || !q.id) {
      removed.push({reason:"missing_id", id:q?.id || null});
      continue;
    }
    if (ids.has(q.id)) {
      removed.push({reason:"duplicate_id", id:q.id});
      continue;
    }

    if (q.id.startsWith("sujebi-2026-db-build-")) {
      const match = q.id.match(/^sujebi-2026-db-build-ch(\d{2})-(\d{2})$/);
      if (!match) {
        removed.push({reason:"s3_noncanonical_id", id:q.id});
        continue;
      }
      const chapter = Number(match[1]);
      const number = Number(match[2]);
      const max = s3Max[chapter];
      const key = `${chapter}-${number}`;
      if (!max || number < 1 || number > max) {
        removed.push({reason:"s3_out_of_range", id:q.id, chapter, number});
        continue;
      }
      if (s3Logical.has(key)) {
        removed.push({reason:"s3_duplicate_logical", id:q.id, key});
        continue;
      }
      s3Logical.add(key);
    }

    ids.add(q.id);
    normalized.push(q);
  }

  if (normalized.length !== QUESTIONS.length) QUESTIONS.splice(0, QUESTIONS.length, ...normalized);

  const expectedS3 = [];
  for (const [chapterText,max] of Object.entries(s3Max)) {
    const chapter = Number(chapterText);
    for (let number=1; number<=max; number+=1) expectedS3.push(`${chapter}-${number}`);
  }
  const s3Missing = expectedS3.filter(key => !s3Logical.has(key));

  const prefixCounts = {
    s1: QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-sw-design-")).length,
    s2: QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-sw-dev-")).length,
    s3: QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-db-build-")).length,
    s4: QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-prog-lang-")).length,
    s5: QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-system-mgmt-") || q.id.startsWith("sujebi-2026-system-build-")).length
  };

  window.QTIMER_BANK_AUDIT = {
    total: QUESTIONS.length,
    prefixCounts,
    expectedCurrent: {s1:221, s2:158, s3:191, s4:208, s5:145, total:923},
    removed,
    s3Missing
  };

  if (removed.length) console.warn("[QTimer] removed invalid/duplicate question entries", removed);
  if (s3Missing.length) console.error("[QTimer] Subject 3 missing canonical questions", s3Missing);
  console.info("[QTimer] bank audit", window.QTIMER_BANK_AUDIT);
})();

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
