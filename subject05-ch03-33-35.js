// Subject 5 / Chapter 03 소프트웨어 개발 보안 구축 33~35
const S05C03E=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-system-mgmt-ch03-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT05_CH03_33_35=[
S05C03E(33,"5-44","이전 암호문을 현재 블록의 암호 알고리즘 입력으로 넣고, 나온 출력값을 현재 블록의 평문과 XOR하여 암호화하는 블록 암호 운영 모드는?",["ECB","CBC","CFB","OFB"],3,"CFB(Cipher Feedback)는 이전 암호문을 암호화 함수에 입력하고 그 결과를 현재 평문과 XOR하여 암호문을 만든다.","https://drive.google.com/file/d/1onqm8dks925uXfsPamJMBRpXggkpas-h/view"),
S05C03E(34,"5-44","유한체 위에서 정의된 타원곡선 군의 이산대수 문제에 기반한 공개키 암호화 알고리즘은?",["RSA","ECC","PKI","PEM"],2,"ECC(Elliptic Curve Cryptography)는 타원곡선 이산대수 문제의 어려움에 기반한다.","https://drive.google.com/file/d/1onqm8dks925uXfsPamJMBRpXggkpas-h/view"),
S05C03E(35,"5-44","블록 암호 알고리즘의 특징을 옳게 설명한 것은?",["IDEA는 DES를 대체하기 위해 스위스에서 개발된 8라운드 알고리즘이다.","AES는 DES를 대체하는 64비트 블록 암호이다.","SEED는 NIST가 개발한 128비트 암호 표준이다.","3DES는 AES보다 보안성이 뛰어나므로 사용을 권장한다."],1,"IDEA는 스위스에서 개발된 64비트 블록·128비트 키·8라운드 구조이다. AES는 128비트 블록, SEED는 국내 KISA 개발이며 3DES는 AES보다 비효율적이다.","https://drive.google.com/file/d/1onqm8dks925uXfsPamJMBRpXggkpas-h/view")
];
const s05c03eKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT05_CH03_33_35.filter(q=>!s05c03eKnown.has(q.id)));
