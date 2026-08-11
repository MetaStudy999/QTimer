// Subject 3 quality overrides discovered during answer-risk QA.
// Keep original source records intact; this layer adds missing table/query context so
// questions can be solved in QTimer without opening the photographed source page.
(function applySubject03QualityOverrides(){
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

  // Ch01 SQL / DML / query-result verification.
  markVerified('sujebi-2026-db-build-ch01-05', "원본 3-5 하단 정답 ④. BETWEEN의 범위 연결은 OR가 아니라 AND이므로 ④가 문법 오류");
  markVerified('sujebi-2026-db-build-ch01-06', "원본 3-5 하단 정답 ③. NULL이 아닌 값을 검사하는 표준 SQL 조건은 IS NOT NULL");
  markVerified('sujebi-2026-db-build-ch01-07', "원본 3-5 하단 정답 ③. 전화번호가 NULL이 아닌 행 검색은 IS NOT NULL");
  markVerified('sujebi-2026-db-build-ch01-08', "원본 3-6 하단 정답 ①. 문자열 어디에든 '신'이 포함되도록 검색하려면 LIKE '%신%' 사용");
  markVerified('sujebi-2026-db-build-ch01-10', "원본 3-6 하단 정답 ③. 전체 학생 130행이므로 SELECT DEPT는 130행, DISTINCT DEPT는 학과 3종만 반환");
  markVerified('sujebi-2026-db-build-ch01-12', "원본 3-7 하단 정답 ①. R1/R2 학번 조인과 전자공학·강남길 조건을 모두 AND로 연결한 ①이 옳음");
  markVerified('sujebi-2026-db-build-ch01-13', "원본 3-8 하단 정답 ②. DISTINCT는 WHERE 절이 아니라 SELECT 절에서 사용");
  markVerified('sujebi-2026-db-build-ch01-29', "원본 3-11 하단 정답 ④. 학생별 평균은 AVG(점수)와 GROUP BY 성명을 함께 사용");
  markVerified('sujebi-2026-db-build-ch01-33', "원본 3-12 하단 정답 ④. 강남지점 필터 후 판매량 내림차순은 WHERE 지점명='강남지점' + ORDER BY 판매량 DESC");

  const q11 = byId.get('sujebi-2026-db-build-ch01-11');
  if (q11) Object.assign(q11, {
    questionText: "R1 테이블의 (학번, 이름, 학년)은 (1000,홍길동,1), (2000,김철수,1), (3000,강남길,2), (4000,오말자,2), (5000,장미화,3)이다. `SELECT DISTINCT 학년 FROM R1;`의 실행 결과로 옳은 것은?",
    sourceExplanation: "R1의 학년 값은 1,1,2,2,3이다. DISTINCT는 중복을 제거하므로 결과는 1,2,3 세 행이다.",
    finalKey: "R1 학년 1·1·2·2·3 → DISTINCT = 1·2·3",
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 3-7 하단 정답 ② 및 DISTINCT 독립 풀이 일치"
  });

  markVerified('sujebi-2026-db-build-ch01-32', "원본 3-12 하단 정답 ④. 사원 5행에 WHERE 없는 SELECT 급여 → 5튜플로 독립 풀이 일치");

  // Ch02 SQL / DDL / grouping / set-operation verification.
  markVerified('sujebi-2026-db-build-ch02-05', "원본 3-16 하단 정답 ③. 스키마·도메인·인덱스 등 데이터베이스 객체 정의/생성은 CREATE");
  markVerified('sujebi-2026-db-build-ch02-33', "원본 3-23 하단 정답 ①. HAVING은 그룹 결과에 조건을 적용하므로 GROUP BY와 함께 사용");
  markVerified('sujebi-2026-db-build-ch02-34', "원본 3-23 하단 정답 ③. HAVING을 사용할 수 있는 그룹화 절은 GROUP BY");
  markVerified('sujebi-2026-db-build-ch02-43', "원본 3-25 하단 정답 ②. INTERSECT는 두 SELECT 결과의 교집합이므로 공통 학번 20202222만 반환");
  markVerified('sujebi-2026-db-build-ch02-42', "원본 3-25 하단 정답 ④. 자료구조→책번호 222→도서가격 25,000으로 독립 SQL 풀이 일치");

  const q44 = byId.get('sujebi-2026-db-build-ch02-44');
  if (q44) Object.assign(q44, {
    questionText: "학생 테이블은 (학번,학과,주소) = (1000,전산,서울), (2000,전기,경기), (3000,전자,경기), (4000,전산,경기), (5000,전자,서울)이다. 성적 테이블의 (학번,과목이름)은 (1000,자료구조), (2000,DB), (3000,자료구조), (3000,DB), (4000,DB), (4000,운영체제), (5000,운영체제)이다. 다음 SQL의 결과는? `SELECT 과목이름 FROM 성적 WHERE EXISTS (SELECT 학번 FROM 학생 WHERE 학생.학번=성적.학번 AND 학생.학과 IN ('전산','전기') AND 학생.주소='경기');`",
    sourceExplanation: "조건을 만족하는 학생은 2000(전기·경기), 4000(전산·경기)이다. 성적 테이블에서 이 학번의 행은 2000=DB, 4000=DB·운영체제이므로 결과는 DB, DB, 운영체제이다.",
    finalKey: "EXISTS 대상 학번 2000·4000 → DB, DB, 운영체제",
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 3-26 하단 정답 ③ 및 EXISTS 독립 풀이 일치"
  });

  const q45 = byId.get('sujebi-2026-db-build-ch02-45');
  if (q45) Object.assign(q45, {
    questionText: "R1의 (학번,이름)은 (1000,홍길동), (2000,김철수), (3000,강남길), (4000,오말자), (5000,장미화)이다. R2에서 과목번호 C100인 학번은 1000, 3000, 4000이다. 다음 SQL의 실행 결과는? `SELECT 이름 FROM R1 WHERE 학번 IN (SELECT 학번 FROM R2 WHERE 과목번호='C100');`",
    choices: ["홍길동, 강남길, 장미화", "홍길동, 강남길, 오말자", "홍길동, 김철수, 강남길, 오말자, 장미화", "홍길동, 김철수"],
    sourceExplanation: "서브쿼리 결과는 학번 1000,3000,4000이다. R1에서 해당 이름을 찾으면 홍길동, 강남길, 오말자이므로 ②가 정답이다.",
    finalKey: "C100 학번 1000·3000·4000 → 홍길동·강남길·오말자",
    sourceContinuationUrl: "https://drive.google.com/file/d/1fuGKhTV7r4clZV0JqbR74-qR4HehWIsC/view",
    sourceImageUrls: [
      "https://drive.google.com/file/d/1EXWm9v-4frjUQmhz93UuhplrUHX7HZ9X/view",
      "https://drive.google.com/file/d/1fuGKhTV7r4clZV0JqbR74-qR4HehWIsC/view"
    ],
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "문항이 3-26~3-27에 걸침. 원본 하단 정답 ② 및 서브쿼리 독립 풀이 일치"
  });

  markVerified('sujebi-2026-db-build-ch02-48', "원본 3-28 하단 정답 ③. DROP VIEW V_1 CASCADE는 V_1을 참조하는 V_2까지 연쇄 삭제하므로 독립 SQL 해석 일치");
  markVerified('sujebi-2026-db-build-ch02-49', "원본 3-28 하단 정답 ④. R={1,3}, S={1,2}의 UNION ALL은 중복 제거 없이 1,3,1,2를 반환하므로 독립 SQL 해석 일치");
  markVerified('sujebi-2026-db-build-ch02-51', "원본 3-29 하단 정답 ③. 김철수→R2 학번 4000→R1 전기과·4000으로 독립 서브쿼리 풀이 일치");

  // Ch03 visual Division item: restore the omitted source relations so it is self-contained.
  const q16 = byId.get('sujebi-2026-db-build-ch03-16');
  if (q16) Object.assign(q16, {
    questionText: "릴레이션 R(D1,D2,D3) = {(a,1,A), (b,1,A), (a,2,A), (c,2,B)}이고 S(D2,D3) = {(1,A)}일 때 R ÷ S(Division)의 결과는?",
    choices: ["D1={A,B}", "D2={2,2}", "D3={A}", "D1={a,b}"],
    sourceExplanation: "Division은 S의 모든 튜플과 결합되어 R에 존재하는, S에 없는 속성 D1의 값을 반환한다. S=(1,A)와 결합되는 R의 D1은 a와 b이므로 결과는 D1={a,b}이다.",
    finalKey: "R ÷ S: (D2,D3)=(1,A)를 가진 D1 → a,b → ④",
    independentVerified: true,
    independentVerifiedAt: "2026-08-11",
    verificationNote: "원본 3-33의 R/S 표가 구조화 데이터에서 누락된 문항 완전성 오류를 복구. 원본 하단 정답 ④ 및 Division 독립 풀이 일치"
  });
})();
