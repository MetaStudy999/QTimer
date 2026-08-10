// Subject 4 / Chapter 04 기타 1~7
const S04C04=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch04-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH04_01_07=[
S04C04(1,"4-69","프로세스 사이의 동기화 또는 상호배제를 위해 사용되는 정수형 변수로, P/V 연산을 통해 접근하는 것은?",["Monitor","Mutex","Critical Section","Semaphore"],4,"Semaphore(세마포어)는 P/Wait와 V/Signal 연산으로 프로세스 동기화와 상호배제를 제어한다.","https://drive.google.com/file/d/1i9AQVAMp0vNR_-1pWl2PjeilJa2NPlCz/view"),
S04C04(2,"4-69","Bash의 반복/제어 구조로 사용할 수 없는 것은?",["for ... do","while ... do","repeat_do","until ... do"],3,"Bash에는 for·while·until 등이 있으며 repeat_do는 Bash 제어문이 아니다.","https://drive.google.com/file/d/1i9AQVAMp0vNR_-1pWl2PjeilJa2NPlCz/view"),
S04C04(3,"4-70","세그먼트 테이블에서 세그먼트 2의 기준 주소가 222이고 논리 주소가 (2,176)일 때 물리 주소는?",["398","176","222","46"],1,"세그먼테이션 물리주소 = 기준주소 + 변위 = 222 + 176 = 398.","https://drive.google.com/file/d/1pVbkN_IaOaMYCdAvnl8BxAzu8FAedD1Q/view"),
S04C04(4,"4-70","PHP에서 사용할 수 없는 연산자는?",[".","#","==","!="],2,"PHP에서 문자열 연결은 . 을 사용하며 #은 일반 연산자로 사용하지 않는다.","https://drive.google.com/file/d/1pVbkN_IaOaMYCdAvnl8BxAzu8FAedD1Q/view"),
S04C04(5,"4-70","서비스와 기본 포트 번호 연결로 틀린 것은?",["FTP - TCP 21","TELNET - TCP 23","RPC - TCP 112","HTTP - TCP 80"],3,"RPC 포트매퍼의 대표 포트는 TCP/UDP 111이다. TCP 112 연결은 틀리다.","https://drive.google.com/file/d/1pVbkN_IaOaMYCdAvnl8BxAzu8FAedD1Q/view"),
S04C04(6,"4-70","리눅스에서 현재 로그인한 사용자 정보를 상세히 확인하는 명령어는?",["pwd","whoami","finger","uname"],3,"finger는 로그인 사용자에 대한 상세 정보를 조회하는 명령이다.","https://drive.google.com/file/d/1pVbkN_IaOaMYCdAvnl8BxAzu8FAedD1Q/view"),
S04C04(7,"4-71","C 언어에서 malloc()으로 동적 할당한 메모리가 위치하는 영역은?",["Stack","Code","Data","Heap"],4,"malloc()으로 동적 할당되는 메모리는 Heap 영역에 위치한다.","https://drive.google.com/file/d/1x1iuOmuRnqIDIsdp6iLQeG00Z05PRTYK/view")
];
const s04c04Known=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH04_01_07.filter(q=>!s04c04Known.has(q.id)));
