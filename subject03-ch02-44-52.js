// Subject 3 / Chapter 02 SQL 활용 44~52
const S03C02 = (n,p,t,c,a,k,img)=>({
  id:`sujebi-2026-db-build-ch02-${String(n).padStart(2,'0')}`,
  sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,
  sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,
  sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"
});
const SUBJECT03_CH02_44_52=[
S03C02(44,"3-26","학생/성적 테이블에 EXISTS 서브쿼리를 적용한 SQL의 실행 결과로 옳은 것은?",["DB","DB, 운영체제","DB, DB, 운영체제","운영체제"],3,"EXISTS는 서브쿼리 조건을 만족하는 행의 존재 여부로 외부 행을 선택한다.","https://drive.google.com/file/d/1EXWm9v-4frjUQmhz93UuhplrUHX7HZ9X/view"),
S03C02(45,"3-26","두 릴레이션 R1, R2에 대한 집합 연산 결과로 옳은 것은?",["①의 결과","②의 결과","③의 결과","④의 결과"],2,"집합 연산은 두 SELECT의 대응 컬럼과 중복 처리 규칙을 확인한다.","https://drive.google.com/file/d/1EXWm9v-4frjUQmhz93UuhplrUHX7HZ9X/view"),
S03C02(46,"3-27","데이터베이스 인덱스에 대한 설명으로 옳지 않은 것은?",["문헌의 색인처럼 탐색을 돕는다.","테이블 검색 속도를 높일 수 있다.","인덱스 추가·삭제 명령은 ADD와 DELETE이다.","테이블 삭제 시 관련 인덱스도 일반적으로 함께 제거된다."],3,"인덱스 생성·삭제는 CREATE INDEX / DROP INDEX를 사용한다.","https://drive.google.com/file/d/1fuGKhTV7r4clZV0JqbR74-qR4HehWIsC/view"),
S03C02(47,"3-27","뷰(View)에 대한 설명으로 옳지 않은 것은?",["다른 뷰를 기반으로 뷰를 만들 수 있다.","가상 테이블이며 갱신에 제약이 있을 수 있다.","CREATE VIEW로 생성한다.","논리적으로 존재하며 기본 테이블처럼 물리적으로 저장된다."],4,"뷰는 논리적·가상 테이블이며 기본 테이블처럼 데이터를 물리 저장하지 않는다.","https://drive.google.com/file/d/1fuGKhTV7r4clZV0JqbR74-qR4HehWIsC/view"),
S03C02(48,"3-28","V_2가 V_1을 참조할 때 `DROP VIEW V_1 CASCADE;`의 결과는?",["V_1만 삭제","V_2만 삭제","V_1과 V_2 모두 삭제","아무 뷰도 삭제되지 않음"],3,"CASCADE는 해당 뷰를 참조하는 종속 뷰까지 연쇄 제거한다.","https://drive.google.com/file/d/1cVsCsp00t14Cze6vcoCxRZVzvbcCrjy_/view"),
S03C02(49,"3-28","R(A)={1,3}, S(A)={1,2}일 때 `R UNION ALL S` 결과로 옳은 것은?",["1,2,3","1,2,3,3","1,2","1,3,1,2"],4,"UNION ALL은 중복을 제거하지 않고 두 결과를 모두 합친다.","https://drive.google.com/file/d/1cVsCsp00t14Cze6vcoCxRZVzvbcCrjy_/view"),
S03C02(50,"3-28","두 SELECT 결과의 공통 행만 구하려 할 때 빈칸에 들어갈 집합 연산자는?",["INTERSECT","ADD","MODIFY","OUT"],1,"공통 행(교집합)을 구하는 SQL 집합 연산자는 INTERSECT이다.","https://drive.google.com/file/d/1cVsCsp00t14Cze6vcoCxRZVzvbcCrjy_/view"),
S03C02(51,"3-29","R1(학번,학과명)과 R2(학번,이름)에서 이름이 '김철수'인 학생의 학과명과 학번을 서브쿼리로 조회한 결과는?",["컴퓨터학과 1000","건축과 2000","전기과 4000","전자공학 3000"],3,"김철수의 학번 4000을 서브쿼리로 얻고 R1에서 전기과를 조회한다.","https://drive.google.com/file/d/1z2DVVUj2F_MmzXlmya9ByJ662G6EVexs/view"),
S03C02(52,"3-29","SQL 집합 연산자 설명으로 옳지 않은 것은?",["UNION ALL은 중복을 포함할 수 있다.","UNION은 교집합을 구한다.","INTERSECT는 공통 행을 구한다.","MINUS는 차집합을 구한다."],2,"UNION은 합집합이며 교집합은 INTERSECT이다.","https://drive.google.com/file/d/1z2DVVUj2F_MmzXlmya9ByJ662G6EVexs/view")
];
const s03c02Known=new Set(QUESTIONS.map(q=>q.id));
QUESTIONS.push(...SUBJECT03_CH02_44_52.filter(q=>!s03c02Known.has(q.id)));
