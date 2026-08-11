// Subject 5 / Chapter 01 소프트웨어 개발방법론 활용 1~6
const S05C01A=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-system-mgmt-ch01-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT05_CH01_01_06=[
S05C01A(1,"5-4","정형화된 분석 절차에 따라 사용자 요구사항을 파악·문서화하며 자료흐름도, 자료사전, 소단위 명세서의 특징을 갖는 방법론은?",["구조적 개발방법론","객체지향 개발방법론","정보공학 방법론","CBD 방법론"],1,"구조적 개발방법론은 정형화된 분석 절차와 DFD·자료사전·소단위 명세서를 활용한다.","https://drive.google.com/file/d/1O_aetHOc673PdOWsoTWXF3VI5cTB-zBb/view"),
S05C01A(2,"5-4","소프트웨어 생명주기 모형에서 프로토타입 모형의 장점이 아닌 것은?",["단기간 제작을 위해 비효율적인 언어나 알고리즘을 사용할 수 있다.","개발 과정에서 사용자의 요구를 충분히 반영한다.","최종 결과물 전 의뢰자가 일부 또는 모형을 볼 수 있다.","의뢰자와 개발자 모두에게 공통 참조 모델을 제공한다."],1,"비효율적 언어·알고리즘 사용 가능성은 프로토타이핑의 단점이다.","https://drive.google.com/file/d/1O_aetHOc673PdOWsoTWXF3VI5cTB-zBb/view"),
S05C01A(3,"5-5","프로토타이핑 모형에 대한 설명으로 옳지 않은 것은?",["개발단계에서 오류 수정이 불가하므로 유지보수비용이 많이 발생한다.","최종 결과물 전에 의뢰자가 일부 또는 모형을 볼 수 있다.","발주자와 개발자 모두에게 공동 참조 모델을 제공한다.","프로토타입은 구현 단계의 구현 골격이 될 수 있다."],1,"프로토타이핑은 사용자 피드백으로 개발 중 개선·보완할 수 있으므로 개발단계 오류 수정이 불가능하다는 설명은 틀리다.","https://drive.google.com/file/d/1XPfUoUaYxDV7Hs61Sy9XAj8VNlkVws3e/view"),
S05C01A(4,"5-5","타당성 검토, 계획, 요구사항 분석, 설계, 구현, 테스트, 유지보수를 순차 수행하는 고전적 생명주기 모형은?",["폭포수 모형","프로토타입 모형","나선형 모형","RAD 모형"],1,"폭포수(Waterfall)는 각 개발 단계를 순차적으로 진행하는 고전적 생명주기 모델이다.","https://drive.google.com/file/d/1XPfUoUaYxDV7Hs61Sy9XAj8VNlkVws3e/view"),
S05C01A(5,"5-5","전통적인 선형 순차 소프트웨어 생명주기 모델의 올바른 단계 순서는?",["구현→분석→설계→테스트→유지보수","유지보수→테스트→분석→설계→구현","분석→설계→구현→테스트→유지보수","테스트→설계→유지보수→구현→분석"],3,"폭포수 모델 핵심 순서: 분석 → 설계 → 구현 → 테스트 → 유지보수.","https://drive.google.com/file/d/1XPfUoUaYxDV7Hs61Sy9XAj8VNlkVws3e/view"),
S05C01A(6,"5-5","나선형 모델의 네 가지 주요 활동을 올바르게 나열한 것은? (a 계획 수립, b 고객 평가, c 개발 및 검증, d 위험 분석)",["a→b→d→c","a→d→c→b","a→b→c→d","a→c→b→d"],2,"나선형 모델은 계획 및 정의 → 위험 분석 → 개발 → 고객 평가 순으로 반복한다.","https://drive.google.com/file/d/1XPfUoUaYxDV7Hs61Sy9XAj8VNlkVws3e/view")
];
const s05c01aKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT05_CH01_01_06.filter(q=>!s05c01aKnown.has(q.id)));
