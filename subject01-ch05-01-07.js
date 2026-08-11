// Subject 1 / Chapter 05 기타 1~7
const S01C05=(n,p,t,c,a,k,img)=>({
  id:`sujebi-2026-sw-design-ch05-${String(n).padStart(2,'0')}`,
  sourceQuestionNo:n,
  sourcePage:p,
  questionType:"single_choice",
  questionText:t,
  choices:c,
  sourceAnswer:a,
  aiDetectedAnswer:a,
  aiReasonedAnswer:a,
  sourceExplanation:k,
  finalKey:k,
  sourceImageUrl:img,
  verificationStatus:"auto_matched"
});

const SUBJECT01_CH05_01_07=[
  S01C05(1,"1-77","입력되는 데이터를 컴퓨터의 프로세서가 처리하기 전에 미리 처리하여 프로세서가 처리하는 시간을 줄여주는 프로그램이나 하드웨어를 말하는 것은?",["EAI","FEP","GPL","Duplexing"],2,"FEP(Front-End Processor)는 입력 데이터를 주 프로세서가 처리하기 전에 미리 처리하여 주 프로세서의 부담과 처리 시간을 줄인다.","https://drive.google.com/file/d/1Jo4i2q6zuJKuYqMofLa5BMw3-GVcIddD/view"),
  S01C05(2,"1-77","아키텍처 설계과정이 올바른 순서로 나열된 것은? (ㄱ 설계 목표 설정, ㄴ 시스템 타입 결정, ㄷ 스타일 적용 및 커스터마이즈, ㄹ 서브 시스템의 기능·인터페이스 동작 작성, ㅁ 아키텍처 설계 검토)",["ㄱ → ㄴ → ㄷ → ㄹ → ㅁ","ㅁ → ㄱ → ㄴ → ㄹ → ㄷ","ㄱ → ㅁ → ㄴ → ㄹ → ㄷ","ㄱ → ㄴ → ㄷ → ㅁ → ㄹ"],1,"아키텍처 설계는 설계 목표 설정 → 시스템 타입 결정 → 스타일 적용 및 커스터마이즈 → 서브시스템 기능·인터페이스 동작 작성 → 설계 검토 순으로 진행한다.","https://drive.google.com/file/d/1Jo4i2q6zuJKuYqMofLa5BMw3-GVcIddD/view"),
  S01C05(3,"1-78","소프트웨어 개발 영역을 결정하는 요소 중 다음 사항과 관계있는 것은? 소프트웨어에 의해 간접적으로 제어되는 장치와 소프트웨어를 실행하는 하드웨어, 기존 소프트웨어와 새로운 소프트웨어를 연결하는 소프트웨어, 순서적 연산에 의해 소프트웨어를 실행하는 절차",["기능(Function)","성능(Performance)","제약 조건(Constraint)","인터페이스(Interface)"],4,"장치·하드웨어, 기존/신규 소프트웨어의 연결, 실행 절차처럼 시스템과 외부 요소의 연결 관계를 정의하는 것은 인터페이스(Interface)이다.","https://drive.google.com/file/d/1AG9w7SBGxf9eruJODs2pIdAkUHpSO2P1/view"),
  S01C05(4,"1-78","위험 모니터링의 의미로 옳은 것은?",["위험을 이해하는 것","첫 번째 조치로 위험을 피할 수 있는 것","위험 발생 후 즉시 조치하는 것","위험 요소 징후들에 대하여 계속적으로 인지하는 것"],4,"위험 모니터링은 위험 요소의 징후를 지속적으로 관찰하고 인지하는 활동이다.","https://drive.google.com/file/d/1AG9w7SBGxf9eruJODs2pIdAkUHpSO2P1/view"),
  S01C05(5,"1-78","다음 중 기능 모델링 순서로 옳은 것은? (ㄱ 입출력 자료 정의, ㄴ 제약조건 파악, ㄷ 기능 명세서 작성, ㄹ 자료 흐름도 작성)",["ㄱ → ㄴ → ㄷ → ㄹ","ㄱ → ㄴ → ㄹ → ㄷ","ㄱ → ㄹ → ㄷ → ㄴ","ㄱ → ㄹ → ㄴ → ㄷ"],3,"기능 모델링은 입출력 자료 정의 → 자료 흐름도 작성 → 기능 명세서 작성 → 제약조건 파악 순으로 수행한다.","https://drive.google.com/file/d/1AG9w7SBGxf9eruJODs2pIdAkUHpSO2P1/view"),
  S01C05(6,"1-79","요구사항 수집 방법에서 프로토타입 방법에 대한 설명으로 올바르지 않은 것은?",["정확한 요구사항 수집이 가능하다.","개발 과정에서 사용자의 요구를 충분히 반영한다.","의뢰자나 개발자 모두에게 공동의 참조 모델을 제공한다.","중간에 요구사항을 변경하지 말아야 한다."],4,"프로토타이핑은 시제품을 통해 요구사항을 확인하고 보완하는 방식이므로 개발 중 요구사항 변경이 가능하다. '중간에 변경하지 말아야 한다'는 설명이 틀리다.","https://drive.google.com/file/d/1T-1qogrVuER5o_bnVz02SKFthm-tQkQ0/view"),
  S01C05(7,"1-79","시스템에서 구현되어야 할 것에 대한 공식적인 문장으로 사용자, 시스템을 명세화한 산출물로 알맞은 것은?",["Tailoring","SRS(Software Requirement Specification)","CMMi","SPICE"],2,"SRS(Software Requirements Specification)는 시스템에 구현되어야 할 요구사항을 공식적으로 기술하여 사용자와 시스템 요구를 명세한 산출물이다.","https://drive.google.com/file/d/1T-1qogrVuER5o_bnVz02SKFthm-tQkQ0/view")
];

const s01c05Known=new Set(QUESTIONS.map(q=>q.id));
QUESTIONS.push(...SUBJECT01_CH05_01_07.filter(q=>!s01c05Known.has(q.id)));
