// Subject 4 / Chapter 02 프로그래밍 언어 활용 01~11
const S04C02=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch02-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH02_01_11=[
S04C02(1,"4-6","C언어에서 `static int b[9] = {1, 2, 3};`일 때 b[5]의 값은?",["0","1","2","3"],1,"명시적으로 초기화되지 않은 static 배열 원소는 0으로 초기화된다.","https://drive.google.com/file/d/1sShBHNGL0CjDH0jBzOudYsHK3ZHxGVjI/view"),
S04C02(2,"4-6","C언어에서 정수 자료형으로 옳은 것은?",["int","float","char","double"],1,"C의 대표 정수 자료형은 int이다.","https://drive.google.com/file/d/1sShBHNGL0CjDH0jBzOudYsHK3ZHxGVjI/view"),
S04C02(3,"4-6","JAVA에서 변수와 자료형에 대한 설명으로 틀린 것은?",["변수는 값을 기억하기 위해 사용하는 공간이다.","변수의 자료형에 따라 저장할 수 있는 값의 종류와 범위가 달라진다.","char 자료형은 나열된 여러 개의 문자를 저장하고자 할 때 사용한다.","boolean 자료형은 참/거짓 조건을 판단할 때 사용한다."],3,"char는 문자 하나를 저장하며 여러 문자 문자열은 String을 사용한다.","https://drive.google.com/file/d/1sShBHNGL0CjDH0jBzOudYsHK3ZHxGVjI/view"),
S04C02(4,"4-7","파이썬의 변수 작성 규칙 설명으로 옳지 않은 것은?",["첫 자리에 숫자를 사용할 수 없다.","영문 대소문자·숫자·밑줄(_)을 사용할 수 있다.","변수 이름의 중간에 공백을 사용할 수 있다.","예약어는 변수명으로 사용할 수 없다."],3,"변수 이름에는 공백을 사용할 수 없다.","https://drive.google.com/file/d/1lIQ3hrGH2VSf-7WR4blYAKzDH3QgEE4y/view"),
S04C02(5,"4-7","C언어에서 사용할 수 없는 변수명은?",["student2019","text-color","_korea","amount"],2,"C 식별자에는 하이픈(-)을 사용할 수 없다.","https://drive.google.com/file/d/1lIQ3hrGH2VSf-7WR4blYAKzDH3QgEE4y/view"),
S04C02(6,"4-7","C언어에서 변수로 사용할 수 없는 것은?",["data02","int01","_sub","short"],4,"short는 C 예약어이므로 변수명으로 사용할 수 없다.","https://drive.google.com/file/d/1lIQ3hrGH2VSf-7WR4blYAKzDH3QgEE4y/view"),
S04C02(7,"4-7","C언어에서 변수 선언으로 틀린 것은?",["int else;","int Test2;","int pc;","int True;"],1,"else는 C 예약어이므로 식별자로 사용할 수 없다.","https://drive.google.com/file/d/1lIQ3hrGH2VSf-7WR4blYAKzDH3QgEE4y/view"),
S04C02(8,"4-7","C언어에서 비트 논리 연산자에 해당하지 않는 것은?",["^","?","&","~"],2,"비트 연산자에는 &, |, ^, ~ 등이 있으며 ?는 조건 연산자의 일부이다.","https://drive.google.com/file/d/1lIQ3hrGH2VSf-7WR4blYAKzDH3QgEE4y/view"),
S04C02(9,"4-8","다음 C 프로그램의 실행 결과는?\n`int a[2][2]={{11,22},{44,55}}; int i,sum=0; int *p; p=a[0]; for(i=1;i<4;i++) sum += *(p+i); printf("%d",sum);`",["55","77","121","132"],3,"p가 a[0][0]을 가리키고 i=1~3에서 22+44+55=121을 더한다.","https://drive.google.com/file/d/12PjHUYTbVGpP3go0iVRxO3U0on3159oS/view"),
S04C02(10,"4-8","C언어에서 산술 연산자가 아닌 것은?",["%","*","/","="],4,"=는 대입 연산자이고 %, *, /는 산술 연산자이다.","https://drive.google.com/file/d/12PjHUYTbVGpP3go0iVRxO3U0on3159oS/view"),
S04C02(11,"4-8","다음 C 프로그램의 실행 결과는? `char a; a='A'+1; printf("%d",a);`",["1","11","66","98"],3,"문자 'A'의 ASCII 코드 65에 1을 더하면 66이다.","https://drive.google.com/file/d/12PjHUYTbVGpP3go0iVRxO3U0on3159oS/view")
];
const s04c02Known=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH02_01_11.filter(q=>!s04c02Known.has(q.id)));
