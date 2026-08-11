// Subject 3 / Chapter 03 논리 데이터베이스 설계 41~59
const S03C03C=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-db-build-ch03-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched",extractionStatus:"READY_PARAPHRASE"});
const SUBJECT03_CH03_41_59=[
S03C03C(41,"3-40","응답시간, 저장공간 효율, 트랜잭션 처리량 등을 중점적으로 고려하는 설계 단계는?",["물리적 설계","개념적 설계","요구조건 분석","논리적 설계"],1,"성능·저장 효율·처리량 최적화=물리적 설계.","https://drive.google.com/file/d/1CoJBI3VeWQ5Dcf-Nrfs2X6IZvl7sLNNV/view"),
S03C03C(42,"3-40","물리적 데이터베이스 설계에 대한 설명으로 옳지 않은 것은?",["저장 구조를 결정한다.","접근 경로를 설계한다.","성능과 저장 효율을 고려한다.","트랜잭션 인터페이스와 데이터 타입 관계를 논리적으로 정의하는 것이 주된 작업이다."],4,"논리적 관계·인터페이스 정의는 논리 설계, 저장·접근·성능은 물리 설계.","https://drive.google.com/file/d/1CoJBI3VeWQ5Dcf-Nrfs2X6IZvl7sLNNV/view"),
S03C03C(43,"3-40","CODASYL DBTG가 제안한 데이터 모델은?",["계층형 모델","네트워크 모델","관계형 모델","객체지향 모델"],2,"CODASYL DBTG=네트워크 데이터 모델.","https://drive.google.com/file/d/1CoJBI3VeWQ5Dcf-Nrfs2X6IZvl7sLNNV/view"),
S03C03C(44,"3-41","E-R 다이어그램의 기호 연결로 옳지 않은 것은?",["사각형-개체","삼각형-속성","마름모-관계","타원-속성"],2,"E-R: 개체=사각형, 관계=마름모, 속성=타원.","https://drive.google.com/file/d/1WxNSQ6l-_tWDMpr4mrkd95npHr-8LZPU/view"),
S03C03C(45,"3-41","E-R 모델의 표현으로 옳지 않은 것은?",["개체-사각형","관계-마름모","속성-다각형(Polygon)","속성-타원"],3,"속성은 타원으로 표현한다.","https://drive.google.com/file/d/1WxNSQ6l-_tWDMpr4mrkd95npHr-8LZPU/view"),
S03C03C(46,"3-41","E-R 다이어그램에서 다중값 속성을 나타내는 기호는?",["사각형","마름모","이중 타원","이중 사각형"],3,"다중값 속성=이중 타원.","https://drive.google.com/file/d/1WxNSQ6l-_tWDMpr4mrkd95npHr-8LZPU/view"),
S03C03C(47,"3-41","E-R 다이어그램의 그래픽 표현으로 옳지 않은 것은?",["개체-사각형","관계-마름모","속성-타원","연결-삼각형"],4,"연결은 선으로 표현하며 삼각형은 표준 E-R 연결 기호가 아니다.","https://drive.google.com/file/d/1WxNSQ6l-_tWDMpr4mrkd95npHr-8LZPU/view"),
S03C03C(48,"3-42","데이터 중복으로 삽입·삭제·갱신 시 발생하는 부자연스러운 현상을 무엇이라 하는가?",["정규화","함수 종속","무결성","이상(Anomaly)"],4,"중복으로 인한 삽입·삭제·갱신 문제=이상 현상.","https://drive.google.com/file/d/1ShSwuMfwHwq_tPYv4m9pWECInxDthmwm/view"),
S03C03C(49,"3-42","X가 Y를 함수적으로 결정할 때 함수 종속을 올바르게 나타낸 것은?",["Y → X","X ↔ Y","X → Y","X ÷ Y"],3,"X가 결정자, Y가 종속자이면 X→Y.","https://drive.google.com/file/d/1ShSwuMfwHwq_tPYv4m9pWECInxDthmwm/view"),
S03C03C(50,"3-42","데이터베이스의 이상(Anomaly) 유형이 아닌 것은?",["검색 이상","삽입 이상","삭제 이상","갱신 이상"],1,"이상 유형=삽입·삭제·갱신.","https://drive.google.com/file/d/1ShSwuMfwHwq_tPYv4m9pWECInxDthmwm/view"),
S03C03C(51,"3-42","이상 현상에 대한 설명으로 옳지 않은 것은?",["삽입 이상이 있다.","삭제 이상이 있다.","갱신 이상이 있다.","종속 이상이 정규화의 대표 3대 이상 중 하나이다."],4,"대표 이상=삽입·삭제·갱신.","https://drive.google.com/file/d/1ShSwuMfwHwq_tPYv4m9pWECInxDthmwm/view"),
S03C03C(52,"3-43","릴레이션의 모든 속성값이 원자값만 갖도록 하는 정규형은?",["제1정규형(1NF)","제2정규형(2NF)","제3정규형(3NF)","BCNF"],1,"1NF=원자값.","https://drive.google.com/file/d/1j-xhc1OCn64OY5UMRuBY8tYEVY3Hrpc3/view"),
S03C03C(53,"3-43","중복 데이터 때문에 삽입·삭제·갱신 과정에서 발생하는 문제를 무엇이라 하는가?",["이상(Anomaly)","도메인","카디널리티","조인 종속"],1,"데이터 중복으로 생기는 부작용=이상 현상.","https://drive.google.com/file/d/1j-xhc1OCn64OY5UMRuBY8tYEVY3Hrpc3/view"),
S03C03C(54,"3-43","정규화에 대한 설명으로 적절하지 않은 것은?",["개념적 설계 단계 이전에 수행하는 작업이다.","데이터 중복을 줄이는 데 목적이 있다.","이상 현상을 방지한다.","함수 종속성을 고려한다."],1,"정규화는 논리적 데이터베이스 설계에서 수행한다.","https://drive.google.com/file/d/1j-xhc1OCn64OY5UMRuBY8tYEVY3Hrpc3/view"),
S03C03C(55,"3-43","BCNF에서 제4정규형(4NF)으로 정규화하기 위해 제거해야 하는 것은?",["부분 함수 종속","다치 종속","이행 함수 종속","조인 종속"],2,"4NF=다치 종속 제거.","https://drive.google.com/file/d/1j-xhc1OCn64OY5UMRuBY8tYEVY3Hrpc3/view"),
S03C03C(56,"3-44","제2정규형(2NF)에서 제3정규형(3NF)으로 가기 위해 제거해야 하는 것은?",["이행 함수 종속","부분 함수 종속","다치 종속","조인 종속"],1,"3NF=이행 함수 종속 제거.","https://drive.google.com/file/d/1XAIz-6G_gjiKY7r742GoJvEnZOL9nJkU/view"),
S03C03C(57,"3-44","데이터베이스 정규화가 필요한 이유로 거리가 먼 것은?",["중복 최소화","중복 데이터 활성화","이상 현상 방지","데이터 일관성 향상"],2,"정규화는 중복을 활성화하는 것이 아니라 최소화한다.","https://drive.google.com/file/d/1XAIz-6G_gjiKY7r742GoJvEnZOL9nJkU/view"),
S03C03C(58,"3-44","정규화의 목적으로 옳지 않은 것은?",["중복 감소","무결성 향상","효율적인 접근 경로 알고리즘을 생성하는 것 자체가 주목적이다.","이상 현상 방지"],3,"접근 경로 설계는 물리 설계 성격이며 정규화의 직접 목적이 아니다.","https://drive.google.com/file/d/1XAIz-6G_gjiKY7r742GoJvEnZOL9nJkU/view"),
S03C03C(59,"3-44","모든 조인 종속성이 후보키를 통해서만 성립하도록 한 정규형은?",["제5정규형(5NF)","제4정규형(4NF)","BCNF","제3정규형(3NF)"],1,"5NF=조인 종속 제거.","https://drive.google.com/file/d/1XAIz-6G_gjiKY7r742GoJvEnZOL9nJkU/view")
];
const s03c03cKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT03_CH03_41_59.filter(q=>!s03c03cKnown.has(q.id)));
