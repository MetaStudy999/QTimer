// Subject 3 final P2 answer-risk QA verification metadata.
(function applySubject03FinalP2RiskOverrides(){
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));
  const markVerified = (id, note) => {
    const q = byId.get(id);
    if (!q) return;
    Object.assign(q, { independentVerified: true, independentVerifiedAt: "2026-08-12", verificationNote: note });
  };

  markVerified('sujebi-2026-db-build-ch01-05', "독립 SQL 검증: BETWEEN의 범위 연결은 OR가 아니라 AND이므로 오류 부분 ④");
  markVerified('sujebi-2026-db-build-ch01-06', "독립 SQL 검증: NULL이 아닌 값은 IS NOT NULL로 검사하므로 ③");
  markVerified('sujebi-2026-db-build-ch01-07', "독립 SQL 검증: 전화번호 NULL 제외 조건은 IS NOT NULL이므로 ③");
  markVerified('sujebi-2026-db-build-ch01-08', "독립 SQL 검증: 문자열 어디에든 '신' 포함 검색은 LIKE '%신%'이므로 ①");
  markVerified('sujebi-2026-db-build-ch01-10', "독립 SQL 검증: 일반 SELECT는 130행, DISTINCT DEPT는 3행이므로 ③");
  markVerified('sujebi-2026-db-build-ch01-12', "독립 SQL 검증: 학번 조인·전자공학·강남길 조건을 모두 AND로 결합한 ①");
  markVerified('sujebi-2026-db-build-ch01-13', "독립 SQL 검증: DISTINCT는 WHERE가 아니라 SELECT 절에서 사용하므로 ②");
  markVerified('sujebi-2026-db-build-ch01-29', "독립 SQL 검증: 학생별 평균은 AVG(점수)와 GROUP BY 성명 조합이므로 ④");
  markVerified('sujebi-2026-db-build-ch01-33', "독립 SQL 검증: 강남지점 WHERE 필터와 판매량 DESC가 모두 필요한 ④");
  markVerified('sujebi-2026-db-build-ch02-05', "독립 SQL 검증: 스키마·도메인·인덱스 정의/생성 명령은 CREATE이므로 ③");
  markVerified('sujebi-2026-db-build-ch02-33', "독립 SQL 검증: HAVING은 GROUP BY와 함께 그룹 조건에 사용하므로 ①");
  markVerified('sujebi-2026-db-build-ch02-34', "독립 SQL 검증: HAVING은 GROUP BY 절의 그룹 결과 조건에 사용하므로 ③");
  markVerified('sujebi-2026-db-build-ch02-43', "독립 SQL 검증: INTERSECT는 공통 행만 반환하므로 공통 학번 20202222 → ②");
  markVerified('sujebi-2026-db-build-ch03-16', "원본 3-33 표 재확인 및 Division 독립 검증: S={(1,A)}, R에서 (D2,D3)=(1,A)를 만족하는 D1은 a,b이므로 D1={a,b} → ④");
})();
