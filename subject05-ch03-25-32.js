// Subject 5 / Chapter 03 소프트웨어 개발 보안 구축 25~32
const S05C03D=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-system-mgmt-ch03-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT05_CH03_25_32=[
S05C03D(25,"5-42","암호화 키와 복호화 키가 동일한 암호화 알고리즘은?",["RSA","AES","DSA","ECC"],2,"AES는 동일한 비밀키를 암·복호화에 사용하는 대칭키 블록 암호 알고리즘이다.","https://drive.google.com/file/d/15LhUHRGiX1nHDrLCTie5da8njHOkduLm/view"),
S05C03D(26,"5-42","비대칭 암호화 방식으로 소수를 활용하는 암호화 알고리즘은?",["DES","AES","SMT","RSA"],4,"RSA는 큰 정수의 소인수분해 문제의 어려움에 기반한 공개키 암호 알고리즘이다.","https://drive.google.com/file/d/15LhUHRGiX1nHDrLCTie5da8njHOkduLm/view"),
S05C03D(27,"5-42","패스워드를 해시 또는 암호화해 저장할 때 동일한 패스워드도 서로 다른 암호값으로 저장되도록 추가하는 임의의 값은?",["Pass Flag","Bucket","Opcode","Salt"],4,"Salt는 패스워드에 임의 값을 추가해 동일 비밀번호의 해시값이 같아지는 것을 막는다.","https://drive.google.com/file/d/15LhUHRGiX1nHDrLCTie5da8njHOkduLm/view"),
S05C03D(28,"5-42","DES는 몇 비트의 블록 암호화 알고리즘인가?",["8","24","64","132"],3,"DES의 블록 크기는 64비트이고 유효 키 길이는 56비트이다.","https://drive.google.com/file/d/15LhUHRGiX1nHDrLCTie5da8njHOkduLm/view"),
S05C03D(29,"5-43","비밀키 암호에 대한 설명으로 틀린 것은?",["5명이 비밀키 암호를 사용할 경우 5개의 키가 필요하다.","암호화 키와 복호화 키가 같다.","암호 알고리즘은 공개되어 있다.","비밀키 암호로 널리 알려진 알고리즘으로 AES가 있다."],1,"비밀키 방식에서 n명이 서로 직접 통신하려면 일반적으로 n(n-1)/2개의 키가 필요하므로 5명이면 10개이다.","https://drive.google.com/file/d/13waXVlipZUn_9kMUw4ojSSCnRDI8R8aV/view"),
S05C03D(30,"5-43","대칭 키 암호 알고리즘의 유형이 아닌 것은?",["DES","SHA","AES","SEED"],2,"SHA는 해시 알고리즘이고 DES·AES·SEED는 대칭키 암호 알고리즘이다.","https://drive.google.com/file/d/13waXVlipZUn_9kMUw4ojSSCnRDI8R8aV/view"),
S05C03D(31,"5-43","원문의 해시값을 입력값으로 다시 그 해시값을 반복적으로 계산하여 해시값 추측을 어렵게 하는 취약점 대응 방법은?",["Salt 키","Key Stretching","Diffie-Hellman","RSA"],2,"Key Stretching은 해시 연산을 반복하여 패스워드 크래킹 비용을 크게 높인다.","https://drive.google.com/file/d/13waXVlipZUn_9kMUw4ojSSCnRDI8R8aV/view"),
S05C03D(32,"5-43","암호문에 대응하는 일부 평문이 가용한 상황에서의 암호공격 방법은?",["암호문 단독 공격","알려진 평문 공격","선택 평문 공격","선택 암호문 공격"],2,"Known Plaintext Attack은 공격자가 일부 암호문-평문 쌍을 알고 있는 상황에서 수행하는 공격이다.","https://drive.google.com/file/d/13waXVlipZUn_9kMUw4ojSSCnRDI8R8aV/view")
];
const s05c03dKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT05_CH03_25_32.filter(q=>!s05c03dKnown.has(q.id)));
