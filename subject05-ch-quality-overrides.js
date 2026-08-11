// Subject 5 answer-risk QA verification metadata.
(function applySubject05QualityOverrides(){
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));

  const q29 = byId.get('sujebi-2026-system-mgmt-ch03-29');
  if (q29) Object.assign(q29, {
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 5-43 하단 정답 ①. 대칭키 n명 완전 연결 시 n(n-1)/2이므로 5명은 10개 키가 필요해 ①이 틀린 설명"
  });
})();
