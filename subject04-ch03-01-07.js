// Subject 4 / Chapter 03 응용 SW 기초 기술 활용 01~07
const S04C03=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch03-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH03_01_07=[
S04C03(1,"4-38","UNIX의 쉘(Shell)에 관한 설명으로 옳지 않은 것은?",["명령어 해석기이다.","시스템과 사용자 간 인터페이스를 담당한다.","여러 종류의 쉘이 있다.","프로세스, 기억 장치, 입출력 관리를 수행한다."],4,"프로세스·메모리·입출력 관리는 커널의 역할이고 쉘은 명령어 해석기이자 사용자 인터페이스다.","https://drive.google.com/file/d/1A1e8aiA4mJGO5OwHpCpKolvYXWB5A9Js/view"),
S04C03(2,"4-38","운영체제에 대한 설명으로 거리가 먼 것은?",["다중 사용자·다중 응용 프로그램 환경에서 자원 상태와 분배를 관리한다.","CPU·메모리·기억장치·입출력장치 등의 자원을 관리한다.","운영체제의 종류로 매크로 프로세서, 어셈블러, 컴파일러 등이 있다.","입출력 장치와 사용자 프로그램을 제어한다."],3,"매크로 프로세서·어셈블러·컴파일러는 언어 번역/처리 프로그램이지 운영체제 종류가 아니다.","https://drive.google.com/file/d/1A1e8aiA4mJGO5OwHpCpKolvYXWB5A9Js/view"),
S04C03(3,"4-38","운영체제를 기능에 따라 분류할 때 제어 프로그램이 아닌 것은?",["데이터 관리 프로그램","서비스 프로그램","작업 제어 프로그램","감시 프로그램"],2,"서비스 프로그램은 처리 프로그램에 해당한다.","https://drive.google.com/file/d/1A1e8aiA4mJGO5OwHpCpKolvYXWB5A9Js/view"),
S04C03(4,"4-39","UNIX에서 새로운 프로세스를 생성하는 명령은?",["ls","cat","fork","chmod"],3,"새 프로세스 생성=fork.","https://drive.google.com/file/d/1NnLXFi0InFljas5ovkIEH7afQGgJL32M/view"),
S04C03(5,"4-39","운영체제 분석을 위해 리눅스에서 시스템 버전을 확인할 때 사용하는 명령은?",["ls","cat","pwd","uname"],4,"시스템/커널 정보 확인=uname.","https://drive.google.com/file/d/1NnLXFi0InFljas5ovkIEH7afQGgJL32M/view"),
S04C03(6,"4-39","지역성(Locality)에 대한 설명으로 옳지 않은 것은?",["프로세스는 어느 한 순간 특정 부분을 집중 참조하는 경향이 있다.","시간 지역성의 예로 순환·부프로그램·스택 등이 있다.","시간 지역성은 최근 사용된 기억장소를 집중적으로 다시 접근하는 현상이다.","공간 지역성의 예는 순차적 코드의 실행이다."],4,"교재 분류에서는 순차적 코드 실행을 순차 지역성의 예로 구분한다.","https://drive.google.com/file/d/1NnLXFi0InFljas5ovkIEH7afQGgJL32M/view"),
S04C03(7,"4-39","페이지 프레임 4개가 비어 있고 참조 순서가 `1,2,3,1,2,4,5,1,4`일 때 FIFO 페이지 교체의 페이지 결함 횟수는?",["4회","5회","6회","7회"],3,"FIFO 시 페이지 부재는 총 6회 발생한다.","https://drive.google.com/file/d/1NnLXFi0InFljas5ovkIEH7afQGgJL32M/view")
];
const s04c03Known=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH03_01_07.filter(q=>!s04c03Known.has(q.id)));
