// Subject 5 answer-risk QA verification metadata.
(function applySubject05QualityOverrides(){
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));

  const q07 = byId.get('sujebi-2026-system-mgmt-ch03-07');
  if (q07) Object.assign(q07, {
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 5-36 하단 정답 ③. JAVA 코드가 암호화 키를 String 상수에 직접 저장하므로 '하드 코딩된 암호화 키 사용'으로 독립 검토 일치"
  });

  const q29 = byId.get('sujebi-2026-system-mgmt-ch03-29');
  if (q29) Object.assign(q29, {
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 5-43 하단 정답 ①. 대칭키 n명 완전 연결 시 n(n-1)/2이므로 5명은 10개 키가 필요해 ①이 틀린 설명"
  });
})();
