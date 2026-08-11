// Subject 4 answer-risk QA verification metadata and source-quality fixes.
(function applySubject04QualityOverrides(){
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

  markVerified('sujebi-2026-prog-lang-ch03-09', "원본 4-40 하단 정답 ④. 최소 평균 반환시간 13, 최대 19, 차 6으로 독립 계산 일치");
  markVerified('sujebi-2026-prog-lang-ch03-10', "원본 4-41 하단 정답 ④. FIFO 반환시간 13·45·42, 평균 100/3≈33으로 독립 계산 일치");

  markVerified('sujebi-2026-prog-lang-ch02-12', "원본 4-9 하단 정답 ③. 4(0100) | 7(0111) = 7로 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-15', "원본 4-10 하단 정답 ③. r1=1, r2=1, r3=0이므로 합 2로 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-19', "원본 4-12 하단 정답 ③. 1+3+5+7+9=25로 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-24', "원본 4-14 하단 정답 ③. range(n+1)로 0~11 합=66, 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-33', "원본 4-18 하단 정답 ④. i가 4가 되면 break되어 i=4, 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-37', "원본 4-20 하단 정답 ②. r1=1, r2=0, r3=0 → r3-r2+r1=1로 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-53', "원본 4-26 하단 정답 ④. 문자열 C compile을 역순 순회하면 elipmoc C, 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-62', "원본 4-30 하단 정답 ④. pa[1]=b, *(b+1)=b[1]=6으로 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-63', "원본 4-31 하단 정답 ②. 6790을 500·100·50·10 단위로 분해하면 13+2+1+4=20으로 독립 실행 일치");
  markVerified('sujebi-2026-prog-lang-ch02-66', "원본 4-32 하단 정답 ②. 0+1+...+9=45로 독립 실행 일치");

  const q29 = byId.get('sujebi-2026-prog-lang-ch02-29');
  if (q29) Object.assign(q29, {
    questionText: "다음 Java 프로그램의 실행 결과는? `int a=1,b=2,c=3,d=4; int mx,mn; mx = a < b ? b : a; if(mx==1){ mn = a > mx ? b : a; } else { mn = b < mx ? d : c; } System.out.println(mn);`",
    sourceExplanation: "a<b가 참이므로 mx=2. mx==1은 거짓이어서 else로 가고, b<mx는 2<2로 거짓이므로 mn=c=3. 따라서 ③.",
    finalKey: "mx=2 → else → 2<2 거짓 → mn=c=3",
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 4-16의 삼항 연산자 ? : 를 구조화 과정에서 누락한 오류를 복구. 원본 하단 정답 ③ 및 Java 독립 실행 일치"
  });

  const q17 = byId.get('sujebi-2026-prog-lang-ch02-17');
  if (q17) Object.assign(q17, {
    riskReviewed: true,
    reviewOutcome: "source_semantics_warning",
    verificationNote: "원본 4-11 하단 정답은 ③(8)이며 교재는 &n을 x로 두어 x+4-x+4=8로 계산한다. 다만 표준 C에서 단일 객체 &n에 +4를 하는 포인터 산술은 정의역을 벗어날 수 있어 엄밀성 주의가 필요하다.",
    sourceExplanation: "교재 출제 기준으로 &n=x, *pt=4, *&pt=x, n=4로 두면 x+4-x+4=8이어서 ③. 단, 표준 C의 엄밀한 포인터 산술 관점에서는 주의가 필요한 문항이다.",
    finalKey: "시험/교재 기준: x+4-x+4=8 → ③ (표준 C 포인터 산술 주의)"
  });
})();
