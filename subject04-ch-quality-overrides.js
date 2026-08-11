// Subject 4 answer-risk QA verification metadata.
(function applySubject04QualityOverrides(){
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));

  const q9 = byId.get('sujebi-2026-prog-lang-ch03-09');
  if (q9) Object.assign(q9, {
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 4-40 하단 정답 ④. 최소 평균 반환시간 13, 최대 19, 차 6으로 독립 계산 일치"
  });

  const q10 = byId.get('sujebi-2026-prog-lang-ch03-10');
  if (q10) Object.assign(q10, {
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 4-41 하단 정답 ④. FIFO 반환시간 13·45·42, 평균 100/3≈33으로 독립 계산 일치"
  });
})();
