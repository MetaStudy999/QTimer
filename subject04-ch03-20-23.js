// Subject 4 / Chapter 03 응용 SW 기초 기술 활용 20~23
const S04C03C=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch03-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH03_20_23=[
S04C03C(20,"4-44","HRN 방식에서 작업 A(대기5,서비스20), B(40,20), C(15,45), D(20,2)의 처리 순서로 옳은 것은?",["A→B→C→D","A→C→B→D","D→B→C→A","D→A→B→C"],3,"HRN 우선순위=(대기+서비스)/서비스. A=1.25, B=3, C≈1.33, D=11이므로 D→B→C→A.","https://drive.google.com/file/d/1rPv6pQGGrD85IXLtCmEEjY8VT1kCLIvo/view"),
S04C03C(21,"4-44","HRN(Highest Response-ratio Next) 스케줄링 설명으로 옳지 않은 것은?",["대기시간이 긴 프로세스일수록 우선순위가 높아진다.","SJF 기법을 보완하기 위한 방식이다.","긴 작업과 짧은 작업 간 지나친 불평등을 해소할 수 있다.","우선순위 수치가 가장 낮은 것부터 높은 순으로 처리한다."],4,"HRN은 우선순위 값이 높은 프로세스를 먼저 처리한다.","https://drive.google.com/file/d/1rPv6pQGGrD85IXLtCmEEjY8VT1kCLIvo/view"),
S04C03C(22,"4-44","Microsoft Windows 운영체제의 특징이 아닌 것은?",["GUI 기반 운영체제이다.","트리 디렉터리 구조를 가진다.","선점형 멀티태스킹 방식을 사용한다.","소스가 공개된 개방형(Open) 시스템이다."],4,"Windows는 일반적으로 소스가 공개된 오픈소스 운영체제가 아니다.","https://drive.google.com/file/d/1rPv6pQGGrD85IXLtCmEEjY8VT1kCLIvo/view"),
S04C03C(23,"4-44","CPU 시간을 각 사용자에게 균등하게 분할하여 여러 사용자가 대화식으로 동일한 서비스를 받도록 하고 Round-Robin 스케줄링을 사용하는 운영 기법은?",["Real-Time Processing System","Time Sharing System","Batch Processing System","Distributed Processing System"],2,"CPU 시간을 시간 할당량으로 나눠 여러 사용자가 공유=Time Sharing System.","https://drive.google.com/file/d/1rPv6pQGGrD85IXLtCmEEjY8VT1kCLIvo/view")
];
const s04c03cKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH03_20_23.filter(q=>!s04c03cKnown.has(q.id)));
