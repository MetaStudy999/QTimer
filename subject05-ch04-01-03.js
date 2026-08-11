// Subject 5 / Chapter 04 시스템 보안 구축 1~3
const S05C04A=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-system-mgmt-ch04-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT05_CH04_01_03=[
S05C04A(1,"5-45","IP 또는 ICMP 특성을 악용해 특정 사이트에 집중적으로 데이터를 보내 네트워크 또는 시스템의 상태를 불능으로 만드는 공격 방법은?",["TearDrop","Smishing","Qshing","Smurfing"],4,"Smurfing은 공격 대상 IP를 출발지로 위조한 ICMP Echo 요청을 브로드캐스트해 다수 응답을 피해자에게 집중시키는 DoS 공격이다.","https://drive.google.com/file/d/1h0Q4lMP5rKf7tRyHYdKT7x6kt8rhzCwE/view"),
S05C04A(2,"5-45","컴퓨터 사용자의 키보드 움직임을 탐지해 ID, 패스워드 등 중요한 정보를 몰래 빼가는 해킹 공격은?",["Key Logger Attack","Worm","Rollback","Zombie Worm"],1,"Key Logger Attack은 키 입력을 기록하여 계정·비밀번호 등 민감정보를 탈취한다.","https://drive.google.com/file/d/1h0Q4lMP5rKf7tRyHYdKT7x6kt8rhzCwE/view"),
S05C04A(3,"5-45","사용자의 컴퓨터에 침입해 내부 문서 파일 등을 암호화하여 열지 못하게 하고 복호화 프로그램 제공을 조건으로 금전을 요구하는 공격은?",["Smishing","C-brain","Trojan Horse","Ransomware"],4,"Ransomware는 파일·시스템을 암호화하거나 사용을 제한한 뒤 금전을 요구하는 악성코드이다.","https://drive.google.com/file/d/1h0Q4lMP5rKf7tRyHYdKT7x6kt8rhzCwE/view")
];
const s05c04aKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT05_CH04_01_03.filter(q=>!s05c04aKnown.has(q.id)));
