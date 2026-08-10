// Subject 4 / Chapter 02 프로그래밍 언어 활용 54~68
const S04C02E=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch02-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH02_54_68=[
S04C02E(54,"4-27","C에서 `int a=1,b=2; int r=(++a, a++, b++); printf(\"%d\",r);` 결과는?",["1","2","3","4"],2,"콤마 연산자는 왼쪽부터 평가하고 마지막 식의 평가값을 결과로 사용한다. b++의 평가값은 증가 전 2.","https://drive.google.com/file/d/12V831Besg8hlN1jYsNiZXrpBjFXcz7lU/view"),
S04C02E(55,"4-27","C에서 `if(a<b){ if(a!=1); printf(\"A\"); printf(\"B\"); } else printf(\"C\");`이고 a=1,b=2일 때 출력은?",["A","B","AB","C"],3,"바깥 if는 참이고 내부 if 뒤 세미콜론 때문에 조건과 무관하게 A와 B가 모두 출력된다.","https://drive.google.com/file/d/12V831Besg8hlN1jYsNiZXrpBjFXcz7lU/view"),
S04C02E(56,"4-28","C 이중 반복문에서 밑줄 친 `!a && !b`와 동일한 의미를 갖는 식은?",["!a || !b","!(a || b)","!(a && b)","a || b"],2,"드모르간 법칙에 의해 !a && !b = !(a || b).","https://drive.google.com/file/d/1LvjFKGZ2maANuXRcHMDZNE9noGR2TLW-/view"),
S04C02E(57,"4-28","Python에서 `x=[[0 for a in range(2)] for b in range(4)]`의 출력은?",["[0,0]","[[0,0],[0,0],[0,0],[0,0]]","[[0,1],[0,1],[0,1],[0,1]]","[[0,0],[1,1],[2,2],[3,3]]"],2,"길이 2의 [0,0] 리스트를 바깥 반복으로 4개 생성한다.","https://drive.google.com/file/d/1LvjFKGZ2maANuXRcHMDZNE9noGR2TLW-/view"),
S04C02E(58,"4-28","JAVA Rectangle 클래스에서 width=10,height=20을 저장하고 area()가 width*height를 반환한다. 출력은?",["area=0","area=10","area=20","area=200"],4,"10×20=200.","https://drive.google.com/file/d/1LvjFKGZ2maANuXRcHMDZNE9noGR2TLW-/view"),
S04C02E(59,"4-29","C에서 a=231,b=8,x=22; `x=a/b + (a%b > 0 ? 1 : 0);` 결과는?",["22","25","28","29"],4,"231/8=28, 나머지 7>0이므로 1을 더해 29.","https://drive.google.com/file/d/1_z9FuIvP6dkFivrSZgWPZjsanXU3TNRL/view"),
S04C02E(60,"4-29","논릿값 하나가 참이면 거짓, 거짓이면 참을 반환하는 연산자는?",["&","#","^","!"],4,"논리 NOT 연산자 = !.","https://drive.google.com/file/d/1_z9FuIvP6dkFivrSZgWPZjsanXU3TNRL/view"),
S04C02E(61,"4-30","C 구조체 KEY y에 a=100,b=200을 저장하고 구조체 포인터 p=&y일 때 `p->a`의 출력은?",["100","200","10000","20000"],1,"p->a는 p가 가리키는 구조체 y의 멤버 a=100에 접근한다.","https://drive.google.com/file/d/1csRDhwhLRnZtkbmJbdk-jhCSks1QXk46/view"),
S04C02E(62,"4-30","C에서 `int a[]={1,2,3,4}; int b[]={5,6,7,8}; int *pa[]={a,b}; printf(\"%d\",*(pa[1]+1));` 결과는?",["2","3","5","6"],4,"pa[1]은 b를 가리키고 +1은 b[1]=6.","https://drive.google.com/file/d/1csRDhwhLRnZtkbmJbdk-jhCSks1QXk46/view"),
S04C02E(63,"4-31","JAVA에서 m=6790을 500,100,50,10 단위로 차례로 나누어 사용한 동전/지폐 개수의 총합을 구하면?",["4","20","420","894"],2,"13+2+1+4=20.","https://drive.google.com/file/d/1lyf7JXTaRRu-SuU2EioYrpJpLeECFkHZ/view"),
S04C02E(64,"4-31","C에서 `int a[3]={1}; int *p=a; printf(\"%x\", ___);`에서 다른 세 보기와 출력되는 주소값이 다른 것은?",["&p","&a[0]","p","a"],1,"p, a, &a[0]은 첫 원소 주소를 나타내고 &p는 포인터 변수 p 자체의 주소이다.","https://drive.google.com/file/d/1lyf7JXTaRRu-SuU2EioYrpJpLeECFkHZ/view"),
S04C02E(65,"4-31","Python에서 여러 자료를 한 번에 저장하는 자료형으로만 묶인 것은?",["int,float,str","float,bool,list","bool,tuple,set","list,set,tuple"],4,"list·set·tuple은 여러 값을 담는 컬렉션 자료형이다.","https://drive.google.com/file/d/1lyf7JXTaRRu-SuU2EioYrpJpLeECFkHZ/view"),
S04C02E(66,"4-32","C에서 `sum=0; for(i=0;i<10;i++) sum+=i;`의 출력은?",["36","45","55","66"],2,"0+1+...+9=45.","https://drive.google.com/file/d/1q-GmYPSWWRxOMnsVzhLP9wKAfbmAXh97/view"),
S04C02E(67,"4-32","JAVA 언어에서 접근제어자가 아닌 것은?",["public","protected","package","private"],3,"접근제어자는 public, protected, default, private이며 package는 접근제어자 키워드가 아니다.","https://drive.google.com/file/d/1q-GmYPSWWRxOMnsVzhLP9wKAfbmAXh97/view"),
S04C02E(68,"4-32","JAVA에서 힙에 남아 있지만 참조를 잃어 더 이상 사용되지 않는 객체를 제거하는 모듈은?",["Heap Collector","Garbage Collector","Memory Collector","Variable Collector"],2,"사용되지 않는 객체를 자동 회수하는 기능=Garbage Collector.","https://drive.google.com/file/d/1q-GmYPSWWRxOMnsVzhLP9wKAfbmAXh97/view")
];
const s04c02eKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH02_54_68.filter(q=>!s04c02eKnown.has(q.id)));
