// QTimer v0.1 dashboard + incremental Sujebi data expansion.
// Loaded after app.js so it can extend the existing in-browser MVP without changing the core timer engine.

const EXTRA_QUESTIONS = [
  {
    id:"sujebi-2026-sw-design-ch05-01", sourceQuestionNo:1, sourcePage:"1-77", questionType:"single_choice",
    questionText:"입력되는 데이터를 컴퓨터의 프로세서가 처리하기 전에 미리 처리하여 프로세서가 처리하는 시간을 줄여주는 프로그램이나 하드웨어를 말하는 것은?",
    choices:["EAI","FEP","GPL","Duplexing"], sourceAnswer:2, aiDetectedAnswer:2, aiReasonedAnswer:2,
    sourceExplanation:"FEP(Front-End Processor)는 입력 데이터를 프로세서가 처리하기 전에 미리 처리하여 프로세서의 처리 부담과 시간을 줄여주는 프로그램 또는 하드웨어다.",
    finalKey:"입력 데이터 선처리로 CPU 부담 감소 = FEP",
    sourceImageUrl:"https://drive.google.com/file/d/1Jo4i2q6zuJKuYqMofLa5BMw3-GVcIddD/view"
  },
  {
    id:"sujebi-2026-sw-design-ch05-02", sourceQuestionNo:2, sourcePage:"1-77", questionType:"single_choice",
    questionText:"아키텍처 설계과정이 올바른 순서로 나열된 것은?",
    choices:["설계 목표 설정 → 시스템 타입 결정 → 스타일 적용 및 커스터마이즈 → 서브 시스템의 기능·인터페이스 동작 작성 → 아키텍처 설계 검토","아키텍처 설계 검토 → 설계 목표 설정 → 시스템 타입 결정 → 서브 시스템의 기능·인터페이스 동작 작성 → 스타일 적용 및 커스터마이즈","설계 목표 설정 → 아키텍처 설계 검토 → 시스템 타입 결정 → 서브 시스템의 기능·인터페이스 동작 작성 → 스타일 적용 및 커스터마이즈","설계 목표 설정 → 시스템 타입 결정 → 스타일 적용 및 커스터마이즈 → 아키텍처 설계 검토 → 서브 시스템의 기능·인터페이스 동작 작성"],
    sourceAnswer:1, aiDetectedAnswer:1, aiReasonedAnswer:1,
    sourceExplanation:"아키텍처 설계는 설계 목표 설정 → 시스템 타입 결정 → 스타일 적용 및 커스터마이즈 → 서브 시스템 기능·인터페이스 동작 작성 → 검토 순으로 진행한다.",
    finalKey:"목표 → 타입 → 스타일 → 서브시스템 → 검토",
    sourceImageUrl:"https://drive.google.com/file/d/1Jo4i2q6zuJKuYqMofLa5BMw3-GVcIddD/view"
  },
  {
    id:"sujebi-2026-sw-design-ch05-03", sourceQuestionNo:3, sourcePage:"1-78", questionType:"single_choice",
    questionText:"소프트웨어 개발 영역을 결정하는 요소 중 다음 사항과 관계있는 것은? (소프트웨어가 간접 제어하는 장치·실행 하드웨어, 기존/새 소프트웨어 연결, 순서적 연산에 의한 실행 절차)",
    choices:["기능(Function)","성능(Performance)","제약 조건(Constraint)","인터페이스(Interface)"], sourceAnswer:4, aiDetectedAnswer:4, aiReasonedAnswer:4,
    sourceExplanation:"장치와 소프트웨어의 연결, 기존·신규 소프트웨어 연결, 실행 절차 등은 시스템 간 접점과 상호작용을 다루므로 인터페이스 요소에 해당한다.",
    finalKey:"장치·SW 연결과 실행 접점 = Interface",
    sourceImageUrl:"https://drive.google.com/file/d/1AG9w7SBGxf9eruJODs2pIdAkUHpSO2P1/view"
  },
  {
    id:"sujebi-2026-sw-design-ch05-04", sourceQuestionNo:4, sourcePage:"1-78", questionType:"single_choice",
    questionText:"위험 모니터링의 의미로 옳은 것은?",
    choices:["위험을 이해하는 것","첫 번째 조치로 위험을 피할 수 있는 것","위험 발생 후 즉시 조치하는 것","위험 요소 징후들에 대하여 계속적으로 인지하는 것"], sourceAnswer:4, aiDetectedAnswer:4, aiReasonedAnswer:4,
    sourceExplanation:"위험 모니터링은 위험 요소의 징후를 지속적으로 관찰하고 인지하는 활동이다.",
    finalKey:"위험 모니터링 = 위험 징후 지속 관찰",
    sourceImageUrl:"https://drive.google.com/file/d/1AG9w7SBGxf9eruJODs2pIdAkUHpSO2P1/view"
  },
  {
    id:"sujebi-2026-sw-design-ch05-05", sourceQuestionNo:5, sourcePage:"1-78", questionType:"single_choice",
    questionText:"다음 중 기능 모델링 순서로 옳은 것은? (ㄱ 입출력 자료 정의, ㄴ 제약조건 파악, ㄷ 기능 명세서 작성, ㄹ 자료 흐름도 작성)",
    choices:["ㄱ → ㄴ → ㄷ → ㄹ","ㄱ → ㄴ → ㄹ → ㄷ","ㄱ → ㄹ → ㄷ → ㄴ","ㄱ → ㄹ → ㄴ → ㄷ"], sourceAnswer:3, aiDetectedAnswer:3, aiReasonedAnswer:3,
    sourceExplanation:"기능 모델링은 입출력 자료 정의 → 자료 흐름도 작성 → 기능 명세서 작성 → 제약조건 파악 순으로 진행한다.",
    finalKey:"입출력 → DFD → 기능명세 → 제약조건",
    sourceImageUrl:"https://drive.google.com/file/d/1AG9w7SBGxf9eruJODs2pIdAkUHpSO2P1/view"
  },
  {
    id:"sujebi-2026-sw-design-ch05-06", sourceQuestionNo:6, sourcePage:"1-79", questionType:"single_choice",
    questionText:"요구사항 수집 방법에서 프로토타이핑 방법에 대한 설명으로 올바르지 않은 것은?",
    choices:["정확한 요구사항 수집이 가능하다.","개발 과정에서 사용자의 요구를 충분히 반영한다.","의뢰자나 개발자 모두에게 공통의 참조 모델을 제공한다.","중간에 요구사항을 변경하지 말아야 한다."], sourceAnswer:4, aiDetectedAnswer:4, aiReasonedAnswer:4,
    sourceExplanation:"프로토타이핑은 시제품을 확인하면서 요구사항을 구체화·변경할 수 있다는 점이 핵심 장점이다.",
    finalKey:"프로토타이핑 = 중간 요구사항 변경 가능",
    sourceImageUrl:"https://drive.google.com/file/d/1T-1qogrVuER5o_bnVz02SKFthm-tQkQ0/view"
  },
  {
    id:"sujebi-2026-sw-design-ch05-07", sourceQuestionNo:7, sourcePage:"1-79", questionType:"single_choice",
    questionText:"시스템에서 구현되어야 할 것에 대한 공식적인 문장으로 사용자와 시스템을 명세화한 산출물로 알맞은 것은?",
    choices:["Tailoring","SRS(Software Requirement Specification)","CMMi","SPICE"], sourceAnswer:2, aiDetectedAnswer:2, aiReasonedAnswer:2,
    sourceExplanation:"SRS(Software Requirement Specification)는 시스템에 구현되어야 할 요구사항을 공식적으로 명세한 요구사항 명세서다.",
    finalKey:"구현할 요구사항 공식 명세 = SRS",
    sourceImageUrl:"https://drive.google.com/file/d/1T-1qogrVuER5o_bnVz02SKFthm-tQkQ0/view"
  }
];

const existingIds = new Set(QUESTIONS.map(q => q.id));
const additions = EXTRA_QUESTIONS.filter(q => !existingIds.has(q.id));
if (additions.length) {
  const currentId = state.currentRoundIds[state.currentIndex];
  QUESTIONS.unshift(...additions);
  if (state.mode !== "weak") {
    state.currentRoundIds = QUESTIONS.map(q => q.id);
    const preservedIndex = state.currentRoundIds.indexOf(currentId);
    state.currentIndex = preservedIndex >= 0 ? preservedIndex : 0;
  }
  saveState();
}

function injectDashboardShell(){
  const style = document.createElement("style");
  style.textContent = `
    .view-tabs{display:flex;gap:8px;margin-right:12px}.view-tabs button{min-height:36px;padding:7px 12px;border:1px solid var(--border);border-radius:9px;background:#fff}.view-tabs button.active{background:var(--text);color:#fff;border-color:var(--text)}
    .header-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}.dashboard-view{padding:20px 24px 28px}.dashboard-hero{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px;background:var(--panel);border:1px solid var(--border);border-radius:14px}.dashboard-hero h2{margin:3px 0 8px;font-size:24px}.eyebrow{margin:0;color:var(--accent);font-size:13px;font-weight:800}.dashboard-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.dashboard-actions button{min-height:40px;padding:8px 13px;border:1px solid var(--border);border-radius:10px;background:#fff}.dashboard-actions .primary{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:800}.metric-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:14px 0}.metric-grid article{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:16px;display:grid;gap:7px}.metric-grid span{color:var(--muted);font-size:13px}.metric-grid strong{font-size:27px;font-variant-numeric:tabular-nums}.dashboard-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dashboard-card{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:18px}.card-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:13px}.card-heading h3{margin:0;font-size:17px}.card-heading span{color:var(--muted);font-size:12px}.risk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.risk-grid div{padding:12px;background:#f7f9fc;border-radius:10px;display:flex;justify-content:space-between;gap:8px}.risk-grid span{color:var(--muted)}.subject-risk-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px;background:#f7f9fc;border-radius:10px}.subject-risk-row div{display:grid;gap:4px}.subject-risk-row div span{color:var(--muted);font-size:13px}.risk-badge{display:inline-flex;padding:7px 10px;border-radius:999px;font-weight:800;background:#eef1f5}.risk-badge.low{background:var(--success-soft);color:var(--success)}.risk-badge.mid{background:var(--warning-soft);color:var(--warning)}.risk-badge.high{background:var(--danger-soft);color:var(--danger)}.future-subjects{margin-top:10px;display:flex;flex-wrap:wrap;gap:7px}.future-subjects span{padding:6px 8px;border-radius:8px;background:#f7f9fc;color:var(--muted);font-size:12px}.dashboard-guide{color:var(--muted);margin:0}.timer.warning{background:var(--warning-soft);color:var(--warning);padding:4px 8px;border-radius:9px}.timer.over{background:var(--danger-soft);color:var(--danger);padding:4px 8px;border-radius:9px}
    @media(max-width:980px){.metric-grid{grid-template-columns:repeat(3,1fr)}.dashboard-grid{grid-template-columns:1fr}}
    @media(max-width:620px){.header-right{width:100%;justify-content:space-between}.dashboard-view{padding:12px}.dashboard-hero{align-items:stretch;flex-direction:column;padding:16px}.dashboard-actions{justify-content:stretch}.dashboard-actions button{flex:1 1 100%}.metric-grid{grid-template-columns:repeat(2,1fr)}.risk-grid{grid-template-columns:repeat(2,1fr)}}
  `;
  document.head.appendChild(style);

  const header = document.querySelector('.app-header');
  const metrics = header.querySelector('.header-metrics');
  const right = document.createElement('div');
  right.className = 'header-right';
  const tabs = document.createElement('nav');
  tabs.className = 'view-tabs';
  tabs.setAttribute('aria-label','화면 전환');
  tabs.innerHTML = '<button id="dashboardTab" class="active" type="button">대시보드</button><button id="studyTab" type="button">학습</button>';
  header.appendChild(right);
  right.appendChild(tabs);
  right.appendChild(metrics);

  const control = document.querySelector('.control-bar');
  const workspace = document.querySelector('.workspace');
  const summary = document.querySelector('.session-summary');
  const study = document.createElement('div');
  study.id = 'studyView';
  control.parentNode.insertBefore(study, control);
  study.appendChild(control); study.appendChild(workspace); study.appendChild(summary);

  const dashboard = document.createElement('main');
  dashboard.id = 'dashboardView';
  dashboard.className = 'dashboard-view';
  dashboard.innerHTML = `
    <section class="dashboard-hero">
      <div><p class="eyebrow">시험 대비 현황</p><h2>오늘은 미풀이를 줄이고, 취약문제를 압축합니다.</h2><p id="dashboardGuide" class="dashboard-guide"></p></div>
      <div class="dashboard-actions"><button id="continueStudyBtn" class="primary" type="button">이어 풀기</button><button id="startRapidBtn" type="button">빠른 회독 시작</button><button id="startWeakBtn" type="button">취약 집중 시작</button></div>
    </section>
    <section class="metric-grid" aria-label="전체 학습 현황">
      <article><span>전체 문제</span><strong id="dashTotal">0</strong></article><article><span>풀이한 문제</span><strong id="dashAttempted">0</strong></article><article><span>미풀이</span><strong id="dashUnattempted">0</strong></article><article><span>취약</span><strong id="dashWeak">0</strong></article><article><span>숙달</span><strong id="dashMastered">0</strong></article>
    </section>
    <section class="dashboard-grid">
      <article class="dashboard-card"><div class="card-heading"><h3>취약 사유</h3><span>중복 없이 우선순위 분류</span></div><div class="risk-grid"><div><span>🔥 반복오답</span><strong id="riskRepeatedWrong">0</strong></div><div><span>❗ 확실오답</span><strong id="riskConfidentWrong">0</strong></div><div><span>❌ 오답</span><strong id="riskWrong">0</strong></div><div><span>? 모름</span><strong id="riskUnknown">0</strong></div><div><span>△ 애매</span><strong id="riskAmbiguous">0</strong></div><div><span>⏱ OVER</span><strong id="riskOver">0</strong></div></div></article>
      <article class="dashboard-card"><div class="card-heading"><h3>과목 위험도</h3><span>현재 등록 데이터 기준</span></div><div class="subject-risk-row"><div><strong>1과목 소프트웨어 설계</strong><span id="subject1Detail">미풀이</span></div><span id="subject1Risk" class="risk-badge">미시작</span></div><div class="future-subjects"><span>2과목 미등록</span><span>3과목 미등록</span><span>4과목 미등록</span><span>5과목 미등록</span></div></article>
    </section>`;
  study.parentNode.insertBefore(dashboard, study);
}

injectDashboardShell();

const dash = Object.fromEntries([
  "dashboardTab","studyTab","dashboardView","studyView","dashboardGuide","continueStudyBtn","startRapidBtn","startWeakBtn",
  "dashTotal","dashAttempted","dashUnattempted","dashWeak","dashMastered","riskRepeatedWrong","riskConfidentWrong","riskWrong",
  "riskUnknown","riskAmbiguous","riskOver","subject1Detail","subject1Risk"
].map(id => [id, document.querySelector(`#${id}`)]));

function qAttempts(questionId){ return state.attempts.filter(a => a.questionId === questionId); }
function latestAttemptsByQuestion(){ const map = new Map(); for (const a of state.attempts) map.set(a.questionId, a); return map; }
function masteredQuestion(questionId){
  const last2 = qAttempts(questionId).slice(-2);
  return last2.length === 2 && last2.every(a => a.isCorrect && a.confidence === "sure" && a.withinLimit && !a.timedOut);
}
function repeatedWrong(questionId){
  const last2 = qAttempts(questionId).slice(-2);
  return last2.length === 2 && last2.every(a => !a.isCorrect);
}
function primaryWeakReason(questionId, latest){
  if (!latest) return null;
  if (repeatedWrong(questionId)) return "repeatedWrong";
  if (!latest.isCorrect && latest.confidence === "sure") return "confidentWrong";
  if (latest.confidence === "unknown") return "unknown";
  if (!latest.isCorrect) return "wrong";
  if (latest.ambiguous) return "ambiguous";
  if (latest.timedOut || !latest.withinLimit) return "over";
  return null;
}
function dashboardWeakIds(){
  const latest = latestAttemptsByQuestion();
  return QUESTIONS.filter(q => primaryWeakReason(q.id, latest.get(q.id))).map(q => q.id);
}
function dashboardRiskCounts(){
  const counts = {repeatedWrong:0, confidentWrong:0, wrong:0, unknown:0, ambiguous:0, over:0};
  const latest = latestAttemptsByQuestion();
  for (const q of QUESTIONS) {
    const reason = primaryWeakReason(q.id, latest.get(q.id));
    if (reason) counts[reason] += 1;
  }
  return counts;
}
function renderDashboardV01(){
  const latest = latestAttemptsByQuestion();
  const attempted = QUESTIONS.filter(q => latest.has(q.id)).length;
  const weak = dashboardWeakIds();
  const mastered = QUESTIONS.filter(q => masteredQuestion(q.id)).length;
  const unattempted = QUESTIONS.length - attempted;
  const risks = dashboardRiskCounts();

  dash.dashTotal.textContent = QUESTIONS.length;
  dash.dashAttempted.textContent = attempted;
  dash.dashUnattempted.textContent = unattempted;
  dash.dashWeak.textContent = weak.length;
  dash.dashMastered.textContent = mastered;
  dash.riskRepeatedWrong.textContent = risks.repeatedWrong;
  dash.riskConfidentWrong.textContent = risks.confidentWrong;
  dash.riskWrong.textContent = risks.wrong;
  dash.riskUnknown.textContent = risks.unknown;
  dash.riskAmbiguous.textContent = risks.ambiguous;
  dash.riskOver.textContent = risks.over;
  dash.dashboardGuide.textContent = unattempted > 0
    ? `미풀이 ${unattempted}문제를 먼저 줄이면서 취약 ${weak.length}문제를 자동 수집합니다.`
    : `등록된 문제를 모두 1회 이상 확인했습니다. 취약 ${weak.length}문제를 압축하세요.`;

  const coverage = QUESTIONS.length ? attempted / QUESTIONS.length : 0;
  const weakRatio = attempted ? weak.length / attempted : 0;
  let label = "미시작", klass = "risk-badge";
  if (attempted > 0) {
    if (weakRatio >= .30 || coverage < .50) { label = "🔴 위험"; klass += " high"; }
    else if (weakRatio >= .15 || coverage < .80) { label = "🟡 주의"; klass += " mid"; }
    else { label = "🟢 안정"; klass += " low"; }
  }
  dash.subject1Risk.textContent = label;
  dash.subject1Risk.className = klass;
  dash.subject1Detail.textContent = `풀이 ${attempted}/${QUESTIONS.length} · 취약 ${weak.length} · 숙달 ${mastered}`;
  els.progressText.textContent = `회독 ${state.currentIndex + 1} / ${state.currentRoundIds.length}`;
  els.weakCount.textContent = `취약 ${weak.length}`;
}

function showDashboardV01(){
  stopTimer();
  dash.dashboardView.hidden = false;
  dash.studyView.hidden = true;
  dash.dashboardTab.classList.add("active");
  dash.studyTab.classList.remove("active");
  renderDashboardV01();
}
function showStudyV01(render=true){
  dash.dashboardView.hidden = true;
  dash.studyView.hidden = false;
  dash.dashboardTab.classList.remove("active");
  dash.studyTab.classList.add("active");
  if (render) renderQuestion();
}
function startDashboardMode(mode){
  state.mode = mode;
  applyModeDefaults();
  renderSettings();
  restartRound();
  showStudyV01(false);
}

const coreUpdateProgress = updateProgress;
updateProgress = function(){ coreUpdateProgress(); renderDashboardV01(); };

const coreRenderResult = renderResult;
renderResult = function(attempt, q){ coreRenderResult(attempt, q); renderDashboardV01(); };

const coreUndoLastAttempt = undoLastAttempt;
undoLastAttempt = function(){ coreUndoLastAttempt(); renderDashboardV01(); };

// Visual warning at 75% of the configured per-question limit.
setInterval(() => {
  if (dash.studyView.hidden || submitted || state.timerPolicy === "none") return;
  const elapsed = getElapsedMs();
  const limit = state.timeLimitSec * 1000;
  const warning = limit * .75;
  els.timer.classList.toggle("warning", elapsed >= warning && elapsed < limit);
  els.timer.classList.toggle("over", elapsed >= limit);
  if (elapsed >= warning && elapsed < limit && timerRunning) els.timerState.textContent = "경고";
}, 150);

dash.dashboardTab.addEventListener("click", showDashboardV01);
dash.studyTab.addEventListener("click", () => showStudyV01());
dash.continueStudyBtn.addEventListener("click", () => showStudyV01());
dash.startRapidBtn.addEventListener("click", () => startDashboardMode("rapid"));
dash.startWeakBtn.addEventListener("click", () => startDashboardMode("weak"));

renderSettings();
renderDashboardV01();
showDashboardV01();
