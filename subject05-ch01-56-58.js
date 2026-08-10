// Subject 5 / Chapter 01 소프트웨어 개발방법론 활용 56~58
const S05C01E=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-system-mgmt-ch01-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT05_CH01_56_58=[
S05C01E(56,"5-20","애플리케이션 일부가 이미 내장된 클래스 라이브러리로 구현되어 있고, 기존 부분을 확장·이용하며 Java의 Spring이 대표적인 소프트웨어는?",["전역 함수 라이브러리","소프트웨어 개발 프레임워크","컨테이너 아키텍처","어휘 분석기"],2,"Spring은 대표적인 Java 기반 소프트웨어 개발 프레임워크이다.","https://drive.google.com/file/d/17PYUUpNOeMRkXaKkZw_-CMKFaCZjcfP7/view"),
S05C01E(57,"5-20","전자 칩과 같은 소프트웨어 부품(블록)을 만들어 끼워 맞추는 방법으로 소프트웨어를 완성시키는 재사용 방법은?",["합성 중심","생성 중심","분리 중심","구조 중심"],1,"합성 중심(Composition-Based)은 재사용 가능한 소프트웨어 부품을 조립해 완성하는 블록 구성 방식이다.","https://drive.google.com/file/d/17PYUUpNOeMRkXaKkZw_-CMKFaCZjcfP7/view"),
S05C01E(58,"5-20","CMMI 성숙도 레벨에 대한 설명으로 올바르지 않은 것은?",["초기화 단계는 정의된 프로세스가 없고 작업자 능력에 따라 성과가 좌우된다.","관리 단계는 조직의 표준 프로세스를 활용하여 업무를 수행하는 상태이며 표준화·일관된 프로세스가 존재한다.","정량적 관리 단계는 정량적 기법으로 핵심 프로세스를 통제한다.","최적화 단계는 프로세스 역량 향상을 위해 혁신 활동을 수행한다."],2,"특정 프로젝트 수준에서 프로세스가 정의·수행되는 것이 관리 단계이고, 조직 표준 프로세스를 활용해 표준화되는 것은 정의 단계의 특징이다.","https://drive.google.com/file/d/17PYUUpNOeMRkXaKkZw_-CMKFaCZjcfP7/view")
];
const s05c01eKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT05_CH01_56_58.filter(q=>!s05c01eKnown.has(q.id)));
