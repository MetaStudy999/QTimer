// Subject 5 / Chapter 03 소프트웨어 개발 보안 구축 1~3
const S05C03A=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-system-mgmt-ch03-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT05_CH03_01_03=[
S05C03A(1,"5-35","시스템 내 정보와 자원은 인가된 사용자만 접근할 수 있고, 전송 중 노출되더라도 데이터를 읽을 수 없도록 하는 보안 원칙은?",["부인 방지","무결성","기밀성","가용성"],3,"기밀성(Confidentiality)은 인가되지 않은 사용자나 시스템의 정보 접근·노출을 차단한다.","https://drive.google.com/file/d/1MoUQYY-w5m6b5p9x1SIS1ycQwF2b1S-N/view"),
S05C03A(2,"5-35","시스템 내 정보는 오직 인가된 사용자만 수정할 수 있도록 보장하는 정보보안 요소는?",["기밀성","부인 방지","가용성","무결성"],4,"무결성(Integrity)은 인가되지 않은 변경을 막아 데이터의 정확성과 완전성을 보장한다.","https://drive.google.com/file/d/1MoUQYY-w5m6b5p9x1SIS1ycQwF2b1S-N/view"),
S05C03A(3,"5-35","정보보안 3요소에 대한 설명으로 틀린 것은?",["기밀성: 인가된 사용자만 자원 접근이 가능하다.","무결성: 인가된 사용자만 자원 수정이 가능하며 데이터 변경을 방지한다.","가용성: 인가된 사용자는 권한 범위 안에서 언제든 자원 접근이 가능해야 한다.","휘발성: 인가된 사용자가 수행한 데이터는 처리 완료 즉시 폐기되어야 한다."],4,"정보보안의 3대 요소는 기밀성·무결성·가용성이며 휘발성은 포함되지 않는다.","https://drive.google.com/file/d/1MoUQYY-w5m6b5p9x1SIS1ycQwF2b1S-N/view")
];
const s05c03aKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT05_CH03_01_03.filter(q=>!s05c03aKnown.has(q.id)));
