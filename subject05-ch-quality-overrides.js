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
  const markReviewed = (id, outcome, note) => {
    const q = byId.get(id);
    if (!q) return;
    Object.assign(q, {
      riskReviewed: true,
      reviewOutcome: outcome,
      verificationNote: note
    });
  };

  markVerified('sujebi-2026-system-mgmt-ch01-20', "원본 5-9 하단 정답 ①. 50,000 LoC / 월 200 LoC = 250 Man-Month, 250 / 10명 = 25개월로 독립 계산 일치");
  markVerified('sujebi-2026-system-mgmt-ch01-30', "원본 5-12 하단 정답 ③. CPM 경로 A-B-C-D-H=10일, A-B-E-G-H=14일, A-F-G-H=12일이므로 임계경로 소요기간 14일로 독립 계산 일치");
  markVerified('sujebi-2026-system-mgmt-ch01-37', "원본 5-13 하단 정답 ②. 프로그래머 1인당 월간 생산성 = 10,000/(5개월×2명)으로 독립 계산 및 선택지 일치");

  markVerified('sujebi-2026-system-mgmt-ch03-07', "원본 5-36 하단 정답 ③. JAVA 코드가 암호화 키를 String 상수에 직접 저장하므로 '하드 코딩된 암호화 키 사용'으로 독립 검토 일치");
  markVerified('sujebi-2026-system-mgmt-ch03-13', "원본 5-39 하단 정답 ④. 공개키 방식은 공개키를 배포할 수 있어 비밀키 방식보다 키 분배가 상대적으로 용이하므로 ④가 틀린 설명");
  markVerified('sujebi-2026-system-mgmt-ch03-15', "원본 5-39 하단 정답 ①. 큰 정수 소인수분해 문제의 어려움에 기반한 대표 공개키 암호 알고리즘은 RSA");
  markVerified('sujebi-2026-system-mgmt-ch03-17', "원본 5-40 하단 정답 ④. 큰 정수 소인수분해 어려움에 기반한 1978년 MIT 공개키 암호는 RSA");
  markVerified('sujebi-2026-system-mgmt-ch03-18', "원본 5-40 하단 정답 ①. 공개키로 암호화한 메시지는 대응되는 개인키로 복호화하므로 '공개키로 복호화' 설명이 틀림");
  markVerified('sujebi-2026-system-mgmt-ch03-23', "원본 5-41 하단 정답 ①. 공개키 방식은 사용자마다 공개키·개인키 한 쌍이 필요해 10명이면 총 20개 키이므로 '5개'가 틀림");
  markVerified('sujebi-2026-system-mgmt-ch03-25', "원본 5-42 하단 정답 ②. AES는 동일 비밀키를 암호화와 복호화에 사용하는 대칭키 블록 암호");
  markVerified('sujebi-2026-system-mgmt-ch03-28', "원본 5-42 하단 정답 ③. DES의 블록 크기는 64비트이며 유효 키 길이는 56비트");
  markVerified('sujebi-2026-system-mgmt-ch03-29', "원본 5-43 하단 정답 ①. 대칭키 n명 완전 연결 시 n(n-1)/2이므로 5명은 10개 키가 필요해 ①이 틀린 설명");
  markVerified('sujebi-2026-system-mgmt-ch03-34', "원본 5-44 하단 정답 ②. 타원곡선 군의 이산대수 문제에 기반한 공개키 암호는 ECC");
  markVerified('sujebi-2026-system-mgmt-ch04-43', "원본 5-59 하단 정답 ②. IEEE 802.11i를 수용하고 AES-CCMP를 사용하는 무선 보안 프로토콜은 WPA2");

  markReviewed('sujebi-2026-system-mgmt-ch01-31', 'classification_false_positive', "원본 5-12 하단 정답 ②. Organic 유형 정의를 묻는 COCOMO 개념형 문항으로 수치 계산 위험군이 아니므로 계산/알고리즘 자동 분류에서 제외 대상으로 검토 완료");
  markReviewed('sujebi-2026-system-mgmt-ch05-05', 'classification_false_positive', "원본 5-61 하단 정답 ③. 공격자 유인용 미끼 시스템 Honeypot 정의 문항으로 계산/알고리즘 위험군이 아니므로 자동 분류 과잉 탐지로 검토 완료");
})();
