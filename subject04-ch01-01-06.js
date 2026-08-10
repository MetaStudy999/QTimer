// Subject 4 / Chapter 01 서버프로그램 구현 01~06
const S04C01=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch01-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH01_01_06=[
S04C01(1,"4-4","WAS(Web Application Server)가 아닌 것은?",["JEUS","JVM","Tomcat","WebSphere"],2,"JEUS·Tomcat·WebSphere는 WAS 제품이며 JVM은 Java Virtual Machine이다.","https://drive.google.com/file/d/12e9B3TxXgoxdFBd--WtmpEdVQ7Z_5ttC/view"),
S04C01(2,"4-4","프레임워크(Framework)에 대한 설명으로 옳은 것은?",["소프트웨어 구성에 필요한 기본 구조를 제공하여 재사용을 가능하게 한다.","구조가 잡혀 있어 확장이 불가능하다.","소프트웨어 아키텍처와 완전히 동일한 개념이다.","모듈화가 불가능하다."],1,"프레임워크는 개발에 필요한 기본 구조와 재사용 가능한 틀을 제공한다.","https://drive.google.com/file/d/12e9B3TxXgoxdFBd--WtmpEdVQ7Z_5ttC/view"),
S04C01(3,"4-4","개발 환경 구성을 위한 빌드(Build) 도구에 해당하지 않는 것은?",["Ant","Kerberos","Maven","Gradle"],2,"Ant·Maven·Gradle은 빌드 도구이고 Kerberos는 인증 프로토콜이다.","https://drive.google.com/file/d/12e9B3TxXgoxdFBd--WtmpEdVQ7Z_5ttC/view"),
S04C01(4,"4-5","메모리의 정해진 범위를 넘겨 원래 프로그램의 정상 동작을 변경시키는 소프트웨어 취약점은?",["FTP Bounce 공격","SQL 삽입","버퍼 오버플로우","디렉터리 접근 공격"],3,"메모리의 할당 범위를 넘겨 데이터를 덮어쓰는 취약점=Buffer Overflow.","https://drive.google.com/file/d/1hmX1RQZOxsHbKlUwKE8VUOFeuM_AG5TQ/view"),
S04C01(5,"4-5","소프트웨어·하드웨어의 버그나 보안 취약점을 이용하여 공격자가 의도한 동작을 수행하도록 만든 절차·명령·프로그램을 뜻하는 용어는?",["Exploit","Buffer Overflow","Cross Site Scripting","SQL Injection"],1,"취약점을 이용해 의도된 공격 동작을 수행하는 코드·절차=Exploit.","https://drive.google.com/file/d/1hmX1RQZOxsHbKlUwKE8VUOFeuM_AG5TQ/view"),
S04C01(6,"4-5","배치 프로그램의 필수 요소에 대한 설명으로 틀린 것은?",["심각한 오류 상황 외에는 사용자 개입 없이 자동으로 동작해야 한다.","문제가 언제 발생했는지 추적할 수 있는 안정성을 갖춰야 한다.","대용량 데이터를 처리할 수 있어야 한다.","주어진 시간 내 처리와 동시에 동작 중인 다른 애플리케이션 실행을 방해해야 한다."],4,"배치 프로그램의 필수 요소는 자동화·안정성·대용량 데이터·견고성·성능이며 다른 프로그램을 방해하면 안 된다.","https://drive.google.com/file/d/1hmX1RQZOxsHbKlUwKE8VUOFeuM_AG5TQ/view")
];
const s04c01Known=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH01_01_06.filter(q=>!s04c01Known.has(q.id)));
