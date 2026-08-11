// QTimer v0.1 dynamic subject label for the learning workspace.
const QTIMER_SUBJECT_CONTEXT = [
  {prefix:"sujebi-2026-sw-design-", label:"소프트웨어 설계"},
  {prefix:"sujebi-2026-sw-dev-", label:"소프트웨어 개발"},
  {prefix:"sujebi-2026-db-build-", label:"데이터베이스 구축"},
  {prefix:"sujebi-2026-prog-lang-", label:"프로그래밍 언어 활용"},
  {prefix:"sujebi-2026-system-mgmt-", label:"정보시스템 구축관리"},
  {prefix:"sujebi-2026-system-build-", label:"정보시스템 구축관리"}
];

function qtimerSubjectLabel(q){
  const found = QTIMER_SUBJECT_CONTEXT.find(item => q?.id?.startsWith(item.prefix));
  return found?.label || "정보처리기사 필기";
}

function qtimerApplySubjectContext(){
  const q = currentQuestion();
  if (!q || !els?.sourceMeta) return;
  els.sourceMeta.textContent = `수제비 2026 · ${qtimerSubjectLabel(q)} · p.${q.sourcePage}`;
}

const qtimerRenderQuestionWithSubjectBase = renderQuestion;
renderQuestion = function(){
  qtimerRenderQuestionWithSubjectBase();
  qtimerApplySubjectContext();
};

qtimerApplySubjectContext();
