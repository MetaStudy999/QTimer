// Subject 4 answer-risk QA verification metadata — execution batch 2.
(function applySubject04QualityOverridesBatch2(){
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

  markVerified('sujebi-2026-prog-lang-ch02-31', "원본 4-17 하단 정답 ③. 첫 printf는 2+6=8, 둘째는 4+5=9이므로 8,9 출력");
  markVerified('sujebi-2026-prog-lang-ch02-32', "원본 4-17 하단 정답 ③. a[0] 주소 10, int 4Byte이면 &a[2]=18이고 배열명 a는 10");
  markVerified('sujebi-2026-prog-lang-ch02-34', "원본 4-18 하단 정답 ②. 배열을 순차 제자리 갱신하면 B,C,D,A,B,C,C → BCDABCC");
  markVerified('sujebi-2026-prog-lang-ch02-35', "원본 4-19 하단 정답 ②. Python print 기본 줄바꿈으로 대·한·민·국이 각각 새 줄에 출력");
  markVerified('sujebi-2026-prog-lang-ch02-36', "원본 4-20 하단 정답 ②. 5&&3=1, 5||3=1, !12=0이므로 합 2");
  markVerified('sujebi-2026-prog-lang-ch02-41', "원본 4-23 하단 정답 ④. 문자열 결합으로 첫 줄은 '5 + 2 = 34', 괄호 산술 후 둘째 줄은 '5 + 2 = 7'");
  markVerified('sujebi-2026-prog-lang-ch02-45', "원본 4-24 하단 정답 ③. a[:7:2]는 인덱스 0,2,4,6 → [0,20,40,60]");
  markVerified('sujebi-2026-prog-lang-ch02-46', "원본 4-24 하단 정답 ①. a[2][2][0]은 중첩 리스트 ['life','is']의 첫 원소 life");
  markVerified('sujebi-2026-prog-lang-ch02-48', "원본 4-24 하단 정답 ②. 피보나치 출력에서 21과 89 사이 두 값은 34,55이며 연속 출력 문자열은 3455");
  markVerified('sujebi-2026-prog-lang-ch02-49', "원본 4-25 하단 정답 ①. 97을 %c로 출력하면 a, int b=3.14는 3, char 'a'를 %d로 출력하면 97");
  markVerified('sujebi-2026-prog-lang-ch02-50', "원본 4-25 하단 정답 ①. 97→%c는 a, int b=3.14는 3, A의 코드값은 65 → a 3 65");
  markVerified('sujebi-2026-prog-lang-ch02-52', "원본 4-26 하단 정답 ③. i=1~14 중 5,10에서만 X, 나머지는 O이며 반복 종료 후 i=14");
  markVerified('sujebi-2026-prog-lang-ch02-54', "원본 4-27 하단 정답 ②. 콤마 연산자는 마지막 식의 평가값을 반환하고 b++의 평가값은 증가 전 2");
  markVerified('sujebi-2026-prog-lang-ch02-55', "원본 4-27 하단 정답 ③. 내부 if 뒤 세미콜론으로 조건문 본체가 비고 A와 B가 모두 출력되어 AB");
  markVerified('sujebi-2026-prog-lang-ch02-57', "원본 4-28 하단 정답 ②. 길이 2의 [0,0]을 바깥 range(4)만큼 생성해 [[0,0],[0,0],[0,0],[0,0]]");
  markVerified('sujebi-2026-prog-lang-ch02-58', "원본 4-29 하단 정답 ④. Rectangle width=10, height=20이므로 area()=200");
  markVerified('sujebi-2026-prog-lang-ch02-59', "원본 4-29 하단 정답 ④. 231/8=28, 나머지 7>0이므로 1을 더해 29");
  markVerified('sujebi-2026-prog-lang-ch02-61', "원본 4-30 하단 정답 ①. p=&y이고 y.a=100이므로 p->a는 100");
  markVerified('sujebi-2026-prog-lang-ch02-64', "원본 4-31 하단 정답 ①. p, a, &a[0]은 첫 원소 주소이고 &p만 포인터 변수 자체의 주소");
  markVerified('sujebi-2026-prog-lang-ch02-74', "원본 4-34 하단 정답 ③. 실제 객체 Apple의 오버라이딩 fn(a,b)=a-b가 동적 디스패치되어 5-3=2");
  markVerified('sujebi-2026-prog-lang-ch02-77', "원본 4-35 하단 정답 ②. strcat(str,p2)로 nation 뒤에 alter를 붙여 nationalter 출력");
  markVerified('sujebi-2026-prog-lang-ch02-79', "원본 4-35 하단 정답 ③. 여러 문자열 변경 후에도 *(p1+2)=str1[2]는 R");
  markVerified('sujebi-2026-prog-lang-ch02-82', "원본 4-37 하단 정답 ③. 정수 11/0은 ArithmeticException이므로 해당 catch에서 C 출력");
})();
