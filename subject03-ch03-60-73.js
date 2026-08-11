// Subject 3 / Chapter 03 논리 데이터베이스 설계 60~73
const S03C03D=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-db-build-ch03-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT03_CH03_60_73=[
S03C03D(60,"3-45","정규화 과정 중 1NF에서 2NF가 되기 위한 조건은?",["1NF를 만족하고 모든 도메인이 원자값이어야 한다.","1NF를 만족하고 키가 아닌 모든 애트리뷰트들이 기본 키에 이행적으로 함수 종속되지 않아야 한다.","1NF를 만족하고 다치 종속이 제거되어야 한다.","1NF를 만족하고 키가 아닌 모든 속성이 기본 키에 완전 함수적 종속되어야 한다."],4,"2NF=1NF + 부분 함수 종속 제거, 즉 기본키에 완전 함수 종속.","https://drive.google.com/file/d/11aXgxNHOzuQiJPtPLhD5GOVj8Du_ATNs/view"),
S03C03D(61,"3-45","이전 단계의 정규형을 만족하면서 후보키를 통하지 않는 조인종속(JD)을 제거해야 만족하는 정규형은?",["제3정규형","제4정규형","제5정규형","제6정규형"],3,"5NF=조인 종속 제거.","https://drive.google.com/file/d/11aXgxNHOzuQiJPtPLhD5GOVj8Du_ATNs/view"),
S03C03D(62,"3-45","이행적 함수 종속 관계를 의미하는 것은?",["A→B이고 B→C일 때 A→C를 만족","A→B이고 B→C일 때 A→B만 만족","A→B이고 B→C일 때 B→A를 만족","A→B이고 B→C일 때 C→B를 만족"],1,"A→B, B→C이면 A→C: 이행 함수 종속.","https://drive.google.com/file/d/11aXgxNHOzuQiJPtPLhD5GOVj8Du_ATNs/view"),
S03C03D(63,"3-45","X→Y이고 Y→Z이면 X→Z라는 함수종속의 추론규칙은?",["분해 규칙","이행 규칙","반사 규칙","결합 규칙"],2,"X→Y, Y→Z ⇒ X→Z = 이행 규칙.","https://drive.google.com/file/d/11aXgxNHOzuQiJPtPLhD5GOVj8Du_ATNs/view"),
S03C03D(64,"3-46","릴레이션 R의 모든 결정자가 후보키이면 R은 어떤 정규형에 속하는가?",["제1정규형","제2정규형","BCNF","제4정규형"],3,"BCNF=모든 결정자가 후보키.","https://drive.google.com/file/d/1KQVufcDCuUrZUAQSSvn_waQV6ZiSaUnV/view"),
S03C03D(65,"3-46","제3정규형에서 BCNF로 정규화하기 위한 작업은?",["원자값이 아닌 도메인 분해","부분 함수 종속 제거","이행 함수 종속 제거","결정자가 후보키가 아닌 함수 종속 제거"],4,"BCNF=결정자가 후보키가 아닌 함수 종속 제거.","https://drive.google.com/file/d/1KQVufcDCuUrZUAQSSvn_waQV6ZiSaUnV/view"),
S03C03D(66,"3-46","한 행에 도시가 '서울, 부산'처럼 다중값으로 들어 있는 테이블을 도시 하나당 한 행이 되도록 분해했다. 어떤 정규화 작업인가?",["제1정규형","제2정규형","제3정규형","제4정규형"],1,"1NF=모든 도메인 값을 원자값으로 만든다.","https://drive.google.com/file/d/1KQVufcDCuUrZUAQSSvn_waQV6ZiSaUnV/view"),
S03C03D(67,"3-46","물리적 데이터베이스의 저장 레코드 양식을 설계할 때 고려사항이 아닌 것은?",["데이터 타입","데이터 값의 분포","트랜잭션 모델링","접근 빈도"],3,"트랜잭션 모델링은 개념적 데이터 모델 단계이며 저장 레코드 양식 고려사항은 데이터 타입·분포·접근빈도 등이다.","https://drive.google.com/file/d/1KQVufcDCuUrZUAQSSvn_waQV6ZiSaUnV/view"),
S03C03D(68,"3-47","데이터베이스의 개념적 설계 단계에 대한 설명으로 틀린 것은?",["산출물로 E-R Diagram을 만들 수 있다.","DBMS에 독립적인 개념 스키마를 설계한다.","트랜잭션 인터페이스를 설계 및 작성한다.","논리적 설계 단계의 앞 단계에서 수행된다."],3,"트랜잭션 인터페이스 설계·작성은 논리적 설계 단계로 분류된다.","https://drive.google.com/file/d/1WrIbmeOS6OoOCq4asTA5UdyJNItSJHsz/view"),
S03C03D(69,"3-47","데이터 모델의 구성요소 중 데이터 구조에 따라 실제 표현된 값을 처리하는 작업을 의미하는 것은?",["Relation","Data Structure","Constraint","Operation"],4,"Operation=데이터베이스에 저장된 실제 데이터를 처리하는 작업.","https://drive.google.com/file/d/1WrIbmeOS6OoOCq4asTA5UdyJNItSJHsz/view"),
S03C03D(70,"3-47","원자값, 완전 함수 종속, 모든 결정자가 후보키 조건을 모두 만족하는 정규형은?",["BCNF","제1정규형","제2정규형","제3정규형"],1,"모든 결정자가 후보키이면 BCNF.","https://drive.google.com/file/d/1WrIbmeOS6OoOCq4asTA5UdyJNItSJHsz/view"),
S03C03D(71,"3-47","A→B이고 B→C일 때 A→C 이행 함수 종속 관계를 제거하는 단계는?",["1NF→2NF","2NF→3NF","3NF→BCNF","BCNF→4NF"],2,"3NF=이행 함수 종속 제거.","https://drive.google.com/file/d/1WrIbmeOS6OoOCq4asTA5UdyJNItSJHsz/view"),
S03C03D(72,"3-48","A의 원소는 B의 여러 원소와 대응할 수 있지만 B의 원소는 A의 원소 하나에만 대응 가능한 관계는?",["일대다 관계","일대일 관계","다대다 관계","자기 참조 관계"],1,"한 A가 여러 B, 각 B는 하나의 A = 1:N(일대다).","https://drive.google.com/file/d/1JIYGUvq7An5FGXvONfWrhwInHURGNdEg/view"),
S03C03D(73,"3-48","데이터 모델의 구성요소 중 DB에 논리적으로 표현될 개체 타입과 개체 타입 간 관계를 의미하는 것은?",["Structure","Operation","Relation","Constraint"],1,"Structure=개체 타입, 관계, 데이터 구조 및 정적 성질 표현.","https://drive.google.com/file/d/1JIYGUvq7An5FGXvONfWrhwInHURGNdEg/view")
];
const s03c03dKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT03_CH03_60_73.filter(q=>!s03c03dKnown.has(q.id)));
