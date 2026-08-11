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

  markVerified('sujebi-2026-prog-lang-ch03-08', "원본 4-40 하단 정답 ②. 페이지 참조열 7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0에 FIFO 3프레임을 독립 시뮬레이션하면 Page Fault 14회");
  markVerified('sujebi-2026-prog-lang-ch03-09', "원본 4-40 하단 정답 ④. 최소 평균 반환시간 13, 최대 19, 차 6으로 독립 계산 일치");
  markVerified('sujebi-2026-prog-lang-ch03-10', "원본 4-41 하단 정답 ④. FIFO 반환시간 13·45·42, 평균 100/3≈33으로 독립 계산 일치");
  markVerified('sujebi-2026-prog-lang-ch03-11', "원본 4-41 하단 정답 ④. FREE 8K·12K·16K 중 Worst Fit은 가장 큰 16K No.5 선택");
  markVerified('sujebi-2026-prog-lang-ch03-12', "원본 4-41 하단 정답 ②. First Fit에서 17K를 처음 수용하는 23K 공간에 배치하므로 내부 단편화 6K");

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

  markVerified('sujebi-2026-prog-lang-ch03-45', "원본 4-50 하단 정답 ①. SSTF를 53에서 독립 수행하면 53→65→67→37→14→98→122→124→183");
  markVerified('sujebi-2026-prog-lang-ch03-49', "원본 4-51 하단 정답 ①. 17KB를 수용 가능한 20·40KB 중 Best Fit은 20KB, 내부 단편화 3KB");
  markVerified('sujebi-2026-prog-lang-ch03-50', "원본 4-52 하단 정답 ①. 4프레임 LRU를 독립 시뮬레이션하면 페이지 결함 5회");
  markVerified('sujebi-2026-prog-lang-ch03-55', "원본 4-53 하단 정답 ①. 3프레임 LRU 독립 시뮬레이션 후 마지막 페이지 집합은 2·5·3이며 보기의 집합 표현 5·3·2가 ①");

  markVerified('sujebi-2026-prog-lang-ch03-68', "원본 4-57 하단 정답 ②. /27은 마지막 옥텟 11100000₂=224이므로 서브넷 마스크 255.255.255.224, 독립 계산 일치");
  markVerified('sujebi-2026-prog-lang-ch03-69', "원본 4-57 하단 정답 ①. /24를 10개 FLSM으로 나누면 /28, 10번째 블록 144~159의 Broadcast는 200.1.1.159, 독립 계산 일치");
  markVerified('sujebi-2026-prog-lang-ch03-70', "원본 4-58 하단 정답 ③. /24를 4개로 나누면 /26, 4번째 서브넷 .192/26의 사용 가능 IP는 .193부터이므로 4번째는 .196, 독립 계산 일치");

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
