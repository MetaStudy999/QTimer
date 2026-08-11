// Subject 5 answer-risk QA verification metadata.
(function applySubject05QualityOverrides(){
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));
  const markVerified = (id, note) => {
    const q = byId.get(id);
    if (!q) return;
    Object.assign(q, {
      independentVerified: true,
      independentVerifiedAt: "2026-08-11",
      verificationNote: note
    });
  };

  markVerified('sujebi-2026-system-mgmt-ch01-20', "원본 5-9 하단 정답 ①. 50,000 LoC / 월 200 LoC = 250 Man-Month, 250 / 10명 = 25개월로 독립 계산 일치");
  markVerified('sujebi-2026-system-mgmt-ch01-30', "원본 5-12 하단 정답 ③. CPM 경로 A-B-C-D-H=10일, A-B-E-G-H=14일, A-F-G-H=12일이므로 임계경로 소요기간 14일로 독립 계산 일치");
  markVerified('sujebi-2026-system-mgmt-ch01-37', "원본 5-13 하단 정답 ②. 프로그래머 1인당 월간 생산성 = 10,000/(5개월×2명)으로 독립 계산 및 선택지 일치");

  markVerified('sujebi-2026-system-mgmt-ch03-07', "원본 5-36 하단 정답 ③. JAVA 코드가 암호화 키를 String 상수에 직접 저장하므로 '하드 코딩된 암호화 키 사용'으로 독립 검토 일치");
  markVerified('sujebi-2026-system-mgmt-ch03-29', "원본 5-43 하단 정답 ①. 대칭키 n명 완전 연결 시 n(n-1)/2이므로 5명은 10개 키가 필요해 ①이 틀린 설명");
})();
