// QTimer v0.1 multi-subject dashboard.
const QTIMER_SUBJECTS = [
  {key:"s1", name:"1과목 소프트웨어 설계", prefixes:["sujebi-2026-sw-design-"]},
  {key:"s2", name:"2과목 소프트웨어 개발", prefixes:["sujebi-2026-sw-dev-"]},
  {key:"s3", name:"3과목 데이터베이스 구축", prefixes:["sujebi-2026-db-build-"]},
  {key:"s4", name:"4과목 프로그래밍 언어 활용", prefixes:["sujebi-2026-prog-lang-"]},
  // Subject 5 data was initially created with the system-mgmt prefix.
  // Keep system-build as a compatibility alias for future normalized imports.
  {key:"s5", name:"5과목 정보시스템 구축관리", prefixes:["sujebi-2026-system-mgmt-","sujebi-2026-system-build-"]}
];

function qtimerQuestionsForSubject(subject){
  return QUESTIONS.filter(q => subject.prefixes.some(prefix => q.id.startsWith(prefix)));
}

function qtimerSubjectStats(subject){
  const questions = qtimerQuestionsForSubject(subject);
  if (!questions.length) return {registered:0, attempted:0, weak:0, mastered:0, label:"미등록", klass:"risk-badge"};
  const latest = latestAttemptsByQuestion();
  const attempted = questions.filter(q => latest.has(q.id)).length;
  const weak = questions.filter(q => primaryWeakReason(q.id, latest.get(q.id))).length;
  const mastered = questions.filter(q => masteredQuestion(q.id)).length;
  const coverage = attempted / questions.length;
  const weakRatio = attempted ? weak / attempted : 0;
  let label = "미시작", klass = "risk-badge";
  if (attempted > 0) {
    if (weakRatio >= .30 || coverage < .50) { label = "🔴 위험"; klass += " high"; }
    else if (weakRatio >= .15 || coverage < .80) { label = "🟡 주의"; klass += " mid"; }
    else { label = "🟢 안정"; klass += " low"; }
  }
  return {registered:questions.length, attempted, weak, mastered, label, klass};
}

function ensureMultiSubjectDashboard(){
  if (document.querySelector('#subjectRiskList')) return;
  const card = dash.subject1Risk?.closest('.dashboard-card');
  if (!card) return;
  card.querySelector('.subject-risk-row')?.remove();
  card.querySelector('.future-subjects')?.remove();
  const style = document.createElement('style');
  style.textContent = `.subject-risk-list{display:grid;gap:9px}.subject-risk-list .subject-risk-row{margin:0}.subject-risk-row.unregistered{opacity:.62}`;
  document.head.appendChild(style);
  const list = document.createElement('div');
  list.id = 'subjectRiskList';
  list.className = 'subject-risk-list';
  card.appendChild(list);
}

function renderMultiSubjectRisk(){
  ensureMultiSubjectDashboard();
  const list = document.querySelector('#subjectRiskList');
  if (!list) return;
  list.innerHTML = QTIMER_SUBJECTS.map(subject => {
    const s = qtimerSubjectStats(subject);
    const detail = s.registered
      ? `등록 ${s.registered} · 풀이 ${s.attempted}/${s.registered} · 취약 ${s.weak} · 숙달 ${s.mastered}`
      : `문제 데이터 미등록`;
    return `<div class="subject-risk-row${s.registered ? '' : ' unregistered'}"><div><strong>${subject.name}</strong><span>${detail}</span></div><span class="${s.klass}">${s.label}</span></div>`;
  }).join('');
}

const qtimerPreviousDashboardRender = renderDashboardV01;
renderDashboardV01 = function(){
  qtimerPreviousDashboardRender();
  renderMultiSubjectRisk();
};

renderDashboardV01();
