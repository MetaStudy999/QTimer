// Subject 5 final P2 answer-risk QA verification metadata.
(function applySubject05FinalP2RiskOverrides(){
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));
  const markVerified = (id, note) => {
    const q = byId.get(id);
    if (!q) return;
    Object.assign(q, { independentVerified: true, independentVerifiedAt: "2026-08-12", verificationNote: note });
  };

  markVerified('sujebi-2026-system-mgmt-ch01-31', "독립 개념 검증: COCOMO Organic은 기관 내부 중·소규모, 비교적 단순한 5만 라인 이하 유형이므로 ②");
  markVerified('sujebi-2026-system-mgmt-ch05-05', "독립 개념 검증: 공격자를 유인하도록 의도적으로 설치한 미끼 시스템은 Honeypot이므로 ③");
  markVerified('sujebi-2026-system-mgmt-ch03-13', "독립 암호 검증: 공개키 방식은 대칭키보다 키 분배가 용이하므로 '더 어렵다'는 ④가 틀림");
  markVerified('sujebi-2026-system-mgmt-ch03-15', "독립 암호 검증: 큰 정수 소인수분해 난이도 기반 대표 공개키 알고리즘은 RSA이므로 ①");
  markVerified('sujebi-2026-system-mgmt-ch03-17', "독립 암호 검증: 1978년 MIT 제안, 소인수분해 기반 공개키 알고리즘은 RSA이므로 ④");
  markVerified('sujebi-2026-system-mgmt-ch03-18', "독립 암호 검증: 공개키로 암호화한 메시지는 대응 개인키로 복호화하므로 ①이 틀림");
  markVerified('sujebi-2026-system-mgmt-ch03-23', "독립 암호 검증: 공개키 방식은 사용자당 공개키·개인키 한 쌍이므로 10명에 5개 키라는 ①이 틀림");
  markVerified('sujebi-2026-system-mgmt-ch03-25', "독립 암호 검증: 암·복호화에 동일 키를 사용하는 보기 중 AES가 대칭키 암호이므로 ②");
  markVerified('sujebi-2026-system-mgmt-ch03-28', "독립 암호 검증: DES 블록 크기는 64비트이므로 ③");
  markVerified('sujebi-2026-system-mgmt-ch03-34', "독립 암호 검증: 타원곡선 군의 이산대수 문제 기반 공개키 암호는 ECC이므로 ②");
  markVerified('sujebi-2026-system-mgmt-ch04-43', "독립 무선보안 검증: IEEE 802.11i를 완전히 수용하고 AES-CCMP를 사용하는 것은 WPA2이므로 ②");
})();
