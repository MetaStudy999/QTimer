// Subject 3 / Chapter 04 물리 데이터베이스 설계 01~03
const S03C04=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-db-build-ch04-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT03_CH04_01_03=[
S03C04(1,"3-49","분산 데이터베이스 시스템에 대한 설명으로 옳지 않은 것은?",["사용자나 응용 프로그램이 접근할 데이터나 사이트의 물리적 위치를 알아야 한다.","중앙 컴퓨터에 장애가 발생해도 전체 시스템에 영향을 주지 않도록 구성할 수 있다.","중앙 집중 시스템보다 구현이 복잡하고 처리 비용이 증가할 수 있다.","중앙 집중 시스템보다 시스템 확장이 용이하다."],1,"분산 DB는 위치 투명성을 제공하므로 사용자가 데이터의 물리적 위치를 알 필요가 없다.","https://drive.google.com/file/d/186Rv5U48nP6K4qPvDr_rzGzpNv_BIhsR/view"),
S03C04(2,"3-49","분산 데이터베이스의 특징으로 거리가 먼 것은?",["지역 자치성이 높다.","효용성과 융통성이 높다.","분산 제어가 가능하다.","점진적인 시스템 확장이 어렵다."],4,"분산 데이터베이스는 지역 자치성·분산 제어·효용성·융통성이 높고 점진적 확장이 쉽다.","https://drive.google.com/file/d/186Rv5U48nP6K4qPvDr_rzGzpNv_BIhsR/view"),
S03C04(3,"3-49","분산 DB 목표 중 특정 지역의 시스템이나 네트워크 장애에도 데이터 무결성이 보장되는 성질과 관련된 것은?",["장애 투명성","병행 투명성","위치 투명성","중복 투명성"],1,"장애 투명성=부분 장애가 전체 데이터 무결성에 영향을 주지 않도록 하는 성질.","https://drive.google.com/file/d/186Rv5U48nP6K4qPvDr_rzGzpNv_BIhsR/view")
];
const s03c04Known=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT03_CH04_01_03.filter(q=>!s03c04Known.has(q.id)));
