// QTimer v0.1 question-bank/state synchronization.
// Keeps attempts intact while reconciling navigation with the current question bank.

// Data-integrity guard. It runs after all question scripts and before dashboard/state
// calculations, so invalid ranges or logical duplicates cannot inflate counts.
(function normalizeQuestionBankIntegrity(){
  const structured = [
    {
      key:"s2", prefixes:["sujebi-2026-sw-dev-"],
      ranges:{1:[[1,24]],2:[[1,19]],3:[[1,36]],4:[[1,64]],5:[[1,12]],6:[[1,3]]}
    },
    {
      key:"s3", prefixes:["sujebi-2026-db-build-"],
      ranges:{1:[[1,33]],2:[[1,52]],3:[[1,73]],4:[[1,30]],5:[[1,3]]}
    },
    {
      key:"s4", prefixes:["sujebi-2026-prog-lang-"],
      ranges:{1:[[1,6]],2:[[1,83]],3:[[1,115]],4:[[1,7]]}
    },
    {
      key:"s5", prefixes:["sujebi-2026-system-mgmt-","sujebi-2026-system-build-"],
      ranges:{1:[[1,58]],2:[[1,41]],3:[[1,35]],4:[[1,44]],5:[[1,14]]}
    }
  ];

  // Source image + lower answer area verified and loadable question-bank baseline.
  const expectedCurrent = {s1:221,s2:158,s3:191,s4:211,s5:192,total:973};
  const globalIds = new Set();
  const logicalSeen = Object.fromEntries(structured.map(s => [s.key,new Set()]));
  const normalized = [];
  const removed = [];

  function findStructured(id){
    for (const subject of structured) {
      for (const prefix of subject.prefixes) {
        if (!id.startsWith(prefix)) continue;
        const suffix = id.slice(prefix.length);
        const m = suffix.match(/^ch(\d{2})-(\d{2,3})$/);
        return {subject,prefix,match:m};
      }
    }
    return null;
  }

  function allowed(subject,chapter,number){
    const ranges = subject.ranges[chapter] || [];
    return ranges.some(([start,end]) => number >= start && number <= end);
  }

  for (const q of QUESTIONS) {
    if (!q || !q.id) {
      removed.push({reason:"missing_id",id:q?.id || null});
      continue;
    }
    if (globalIds.has(q.id)) {
      removed.push({reason:"duplicate_id",id:q.id});
      continue;
    }

    const parsed = findStructured(q.id);
    if (parsed) {
      if (!parsed.match) {
        removed.push({reason:`${parsed.subject.key}_noncanonical_id`,id:q.id});
        continue;
      }
      const chapter = Number(parsed.match[1]);
      const number = Number(parsed.match[2]);
      if (!allowed(parsed.subject,chapter,number)) {
        removed.push({reason:`${parsed.subject.key}_out_of_range`,id:q.id,chapter,number});
        continue;
      }
      const logicalKey = `${chapter}-${number}`;
      if (logicalSeen[parsed.subject.key].has(logicalKey)) {
        removed.push({reason:`${parsed.subject.key}_duplicate_logical`,id:q.id,logicalKey});
        continue;
      }
      logicalSeen[parsed.subject.key].add(logicalKey);
    }

    globalIds.add(q.id);
    normalized.push(q);
  }

  if (normalized.length !== QUESTIONS.length) QUESTIONS.splice(0,QUESTIONS.length,...normalized);

  const missing = {};
  for (const subject of structured) {
    const subjectMissing = [];
    for (const [chapterText,ranges] of Object.entries(subject.ranges)) {
      const chapter = Number(chapterText);
      for (const [start,end] of ranges) {
        for (let number=start; number<=end; number+=1) {
          const key = `${chapter}-${number}`;
          if (!logicalSeen[subject.key].has(key)) {
            subjectMissing.push(`ch${String(chapter).padStart(2,"0")}-${String(number).padStart(2,"0")}`);
          }
        }
      }
    }
    missing[subject.key] = subjectMissing;
  }

  const prefixCounts = {
    s1:QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-sw-design-")).length,
    s2:QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-sw-dev-")).length,
    s3:QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-db-build-")).length,
    s4:QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-prog-lang-")).length,
    s5:QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-system-mgmt-") || q.id.startsWith("sujebi-2026-system-build-")).length
  };

  const mismatches = Object.entries(expectedCurrent)
    .filter(([key]) => key !== "total")
    .filter(([key,expected]) => prefixCounts[key] !== expected)
    .map(([key,expected]) => ({key,expected,actual:prefixCounts[key]}));

  window.QTIMER_BANK_AUDIT = {
    total:QUESTIONS.length,
    prefixCounts,
    expectedCurrent,
    mismatches,
    missing,
    removed
  };

  if (removed.length) console.warn("[QTimer] removed invalid/duplicate question entries",removed);
  if (Object.values(missing).some(list => list.length)) console.error("[QTimer] missing verified question entries",missing);
  if (mismatches.length || QUESTIONS.length !== expectedCurrent.total) console.error("[QTimer] question-bank count mismatch",window.QTIMER_BANK_AUDIT);
  else console.info("[QTimer] question-bank counts verified",window.QTIMER_BANK_AUDIT);
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
  else state.currentIndex = Math.max(0,Math.min(previousIndex,state.currentRoundIds.length - 1));

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
    const position = total ? Math.min(state.currentIndex + 1,total) : 0;
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
