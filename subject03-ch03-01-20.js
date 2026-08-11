// Subject 3 / Chapter 03 논리 데이터베이스 설계 01~20
// 문제 문장은 학습 속도를 위해 원문 의미를 보존한 구조화 요약이며 정답은 각 원본 이미지 하단 정답란과 대조했다.
const S03C03=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-db-build-ch03-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched",extractionStatus:"READY_PARAPHRASE"});
const SUBJECT03_CH03_01_20=[
S03C03(1,"3-30","관계형 데이터베이스의 애트리뷰트 설명으로 옳지 않은 것은?",["릴레이션의 열을 의미한다.","각 애트리뷰트는 도메인을 갖는다.","애트리뷰트 수는 차수(Degree)와 관련된다.","애트리뷰트 수를 Cardinality라고 한다."],4,"애트리뷰트 수=Degree, 튜플 수=Cardinality.","https://drive.google.com/file/d/1XinhjoSXR8301lUZMInY46nawn6edqUd/view"),
S03C03(2,"3-30","열 4개, 행 3개인 릴레이션의 Degree와 Cardinality는?",["Degree 4, Cardinality 3","Degree 3, Cardinality 4","Degree 4, Cardinality 4","Degree 3, Cardinality 3"],1,"Degree=속성 수, Cardinality=튜플 수.","https://drive.google.com/file/d/1XinhjoSXR8301lUZMInY46nawn6edqUd/view"),
S03C03(3,"3-30","릴레이션에 존재하는 튜플의 수를 의미하는 것은?",["Cardinality","Degree","Domain","Attribute"],1,"튜플 수=Cardinality.","https://drive.google.com/file/d/1XinhjoSXR8301lUZMInY46nawn6edqUd/view"),
S03C03(4,"3-30","릴레이션의 Degree가 의미하는 것은?",["도메인 수","키 수","튜플 수","애트리뷰트 수"],4,"Degree=애트리뷰트(열) 수.","https://drive.google.com/file/d/1XinhjoSXR8301lUZMInY46nawn6edqUd/view"),
S03C03(5,"3-30","속성이 4개인 릴레이션의 Degree는?",["2","3","4","7"],3,"속성 4개이면 Degree=4.","https://drive.google.com/file/d/1XinhjoSXR8301lUZMInY46nawn6edqUd/view"),
S03C03(6,"3-31","하나의 릴레이션이 3개 속성과 5개 튜플로 구성될 때 옳은 설명은?",["릴레이션 3, Degree 5","릴레이션 5, Degree 3","Cardinality 3, Degree 5","릴레이션 1, Degree 3, Cardinality 5"],4,"릴레이션 1개, Degree 3, Cardinality 5.","https://drive.google.com/file/d/1SuIxFzuSqkiL3-CixAhkTRXApK9aHSWQ/view"),
S03C03(7,"3-31","릴레이션의 특성에 대한 설명으로 옳지 않은 것은?",["튜플은 유일하다.","속성값은 원자값이다.","속성의 순서는 의미가 없다.","튜플에는 반드시 고정된 순서가 존재한다."],4,"관계형 모델에서 튜플의 순서는 의미가 없다.","https://drive.google.com/file/d/1SuIxFzuSqkiL3-CixAhkTRXApK9aHSWQ/view"),
S03C03(8,"3-31","관계형 데이터 모델의 릴레이션 설명으로 옳은 것은?",["튜플의 물리적 순서가 논리적 의미를 갖는다.","한 속성에 복합값을 임의로 저장한다.","도메인은 같은 타입의 원자값 집합이며 속성값은 원자값이다.","한 릴레이션에 동일 튜플이 필수적으로 존재한다."],3,"도메인=같은 타입의 원자값 집합, 속성값=원자값.","https://drive.google.com/file/d/1SuIxFzuSqkiL3-CixAhkTRXApK9aHSWQ/view"),
S03C03(9,"3-32","관계형 모델의 릴레이션 설명으로 옳지 않은 것은?",["튜플은 중복되지 않는다.","각 속성은 도메인을 가진다.","튜플의 순서는 의미가 없다.","애트리뷰트에는 반드시 의미 있는 물리적 순서가 존재한다."],4,"릴레이션에서 속성의 순서는 논리적으로 중요하지 않다.","https://drive.google.com/file/d/1EBxAcNyp1qKxNk9drykRjQKuVT0fRwZS/view"),
S03C03(10,"3-32","관계 해석(Relational Calculus)에서 '모든 값에 대하여'를 나타내는 기호는?",["∃","∈","∀","∪"],3,"∀ = For All(전칭 정량자).","https://drive.google.com/file/d/1EBxAcNyp1qKxNk9drykRjQKuVT0fRwZS/view"),
S03C03(11,"3-32","관계대수 연산자가 아닌 것은?",["Select","Project","Join","Fork"],4,"Fork는 관계대수 연산자가 아니다.","https://drive.google.com/file/d/1EBxAcNyp1qKxNk9drykRjQKuVT0fRwZS/view"),
S03C03(12,"3-32","순수 관계 연산자에 해당하지 않는 것은?",["Select","Cartesian Product","Project","Join"],2,"순수 관계 연산: Select, Project, Join, Division.","https://drive.google.com/file/d/1EBxAcNyp1qKxNk9drykRjQKuVT0fRwZS/view"),
S03C03(13,"3-32","순수 관계 연산자가 아닌 것은?",["Difference","Select","Project","Division"],1,"Difference는 일반 집합 연산이며 순수 관계 연산은 셀·프·조·디.","https://drive.google.com/file/d/1EBxAcNyp1qKxNk9drykRjQKuVT0fRwZS/view"),
S03C03(14,"3-33","두 릴레이션을 공통 속성값을 기준으로 결합하는 관계대수 연산은?",["Join(⋈)","Project(π)","Select(σ)","Division(÷)"],1,"공통 속성으로 릴레이션 결합=Join.","https://drive.google.com/file/d/1F3c9U-L8H_gLKPlsvMu51pksiFaYgIun/view"),
S03C03(15,"3-33","릴레이션에서 원하는 속성(열)만 추출하는 관계대수 연산은?",["Select","Project","Join","Division"],2,"열 선택=Project(π), 행 선택=Select(σ).","https://drive.google.com/file/d/1F3c9U-L8H_gLKPlsvMu51pksiFaYgIun/view"),
S03C03(16,"3-33","제시된 R과 S에 Division 연산을 수행한 결과 D1로 옳은 것은?",["{a}","{b}","{c}","{a,b}"],4,"Division은 S의 모든 조건을 만족하는 R의 대응 값을 구한다.","https://drive.google.com/file/d/1F3c9U-L8H_gLKPlsvMu51pksiFaYgIun/view"),
S03C03(17,"3-34","관계대수식 `π_A(σ_P(R1 × R2))`와 대응하는 SQL은?",["SELECT P FROM R1,R2 WHERE A;","SELECT A FROM R1,R2 WHERE P;","SELECT A FROM R1 WHERE R2;","SELECT R1,R2 FROM A WHERE P;"],2,"Project A → SELECT A, Select P → WHERE P.","https://drive.google.com/file/d/1gT8Zps9sWmBDwAM65MS6-Uu0XNg3h2Jj/view"),
S03C03(18,"3-34","`R × S={r·s | r∈R, s∈S}`로 표현되는 관계대수 연산은?",["Join","Select","Division","Cartesian Product"],4,"R×S=카티션 프로덕트(곱집합).","https://drive.google.com/file/d/1gT8Zps9sWmBDwAM65MS6-Uu0XNg3h2Jj/view"),
S03C03(19,"3-34","R의 Degree=4, Cardinality=5이고 S의 Degree=6, Cardinality=7일 때 R×S의 Degree와 Cardinality는?",["Degree 24, Cardinality 12","Degree 10, Cardinality 12","Degree 10, Cardinality 35","Degree 24, Cardinality 35"],3,"곱집합: Degree는 합(4+6=10), Cardinality는 곱(5×7=35).","https://drive.google.com/file/d/1gT8Zps9sWmBDwAM65MS6-Uu0XNg3h2Jj/view"),
S03C03(20,"3-35","3개 학년 값과 3개 학과 값으로 Cartesian Product를 수행하면 생성되는 튜플 수는?",["3","6","8","9"],4,"Cartesian Product의 튜플 수=각 릴레이션 Cardinality의 곱=9.","https://drive.google.com/file/d/15rfD1GIEvOmtKAw71AgmGdtotJNxXXma/view")
];
const s03c03aKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT03_CH03_01_20.filter(q=>!s03c03aKnown.has(q.id)));
