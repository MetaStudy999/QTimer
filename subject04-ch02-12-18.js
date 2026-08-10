// Subject 4 / Chapter 02 프로그래밍 언어 활용 12~18
const S04C02B=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch02-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH02_12_18=[
S04C02B(12,"4-9","다음 C 프로그램의 실행 결과는? `int a=4; int b=7; int c=a|b; printf(\"%d\",c);`",["3","4","7","10"],3,"4(0100) OR 7(0111) = 7(0111).","https://drive.google.com/file/d/1B1pV7RSoADUEJHf6p0uM3tXtvjOLV7yk/view"),
S04C02B(13,"4-9","C언어 연산자를 우선순위가 높은 것부터 낮은 것으로 바르게 나열한 것은?",["() → / → << → < → == → ||","() → << → / → < → == → ||","() → << → / → < → || → ==","() → / → << → || → == → <"],1,"우선순위 핵심: 괄호 > 산술 > 시프트 > 관계 > 동등 > 논리 OR.","https://drive.google.com/file/d/1B1pV7RSoADUEJHf6p0uM3tXtvjOLV7yk/view"),
S04C02B(14,"4-9","JAVA에서 우선순위가 가장 낮은 연산자는?",["--","%","&","="],4,"대입 연산자 = 는 증감·산술·비트 연산보다 우선순위가 낮다.","https://drive.google.com/file/d/1B1pV7RSoADUEJHf6p0uM3tXtvjOLV7yk/view"),
S04C02B(15,"4-10","다음 C 프로그램의 실행 결과는? `int a=3,b=4,c=2; int r1,r2,r3; r1=b<=4||c==2; r2=(a>0)&&(b<5); r3=!c; printf(\"%d\",r1+r2+r3);`",["0","1","2","3"],3,"r1=1, r2=1, r3=0이므로 합은 2.","https://drive.google.com/file/d/18hSZk9UqZNPcSxpOsRDeYBMtyUQhhytt/view"),
S04C02B(16,"4-10","다음 JAVA 프로그램의 출력은? `int x=5,y=0,z=0; y=x++; z=--x; System.out.println(x+\", \"+y+\", \"+z);`",["5, 5, 5","5, 6, 5","6, 5, 5","5, 6, 4"],1,"y=x++ 후 x=6,y=5; z=--x 후 x=5,z=5 → 5,5,5.","https://drive.google.com/file/d/18hSZk9UqZNPcSxpOsRDeYBMtyUQhhytt/view"),
S04C02B(17,"4-11","다음 C 프로그램의 실행 결과는? `int n=4; int* pt=NULL; pt=&n; printf(\"%d\", &n + *pt - *&pt + n);` (교재의 주소값 설명에 따름)",["0","4","8","12"],3,"교재 설명에서 &n과 *&pt의 주소 항이 상쇄되고 4+4가 남아 8.","https://drive.google.com/file/d/10QqBfDHaRA48Ca5Yn5ZpSv5ZYYa0SA4S/view"),
S04C02B(18,"4-11","JAVA의 `if(i>j) k=i-j; else k=i+j;`를 삼항 조건 연산자로 옳게 바꾼 것은?",["k=(i>j)?(i-j):(i+j);","k=(i<j)?(i-j):(i+j);","k=(i>j)?(i+j):(i-j);","k=(i<j)?(i+j):(i-j);"],1,"삼항 연산자 형식: 조건 ? 참일 때 값 : 거짓일 때 값.","https://drive.google.com/file/d/10QqBfDHaRA48Ca5Yn5ZpSv5ZYYa0SA4S/view")
];
const s04c02bKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH02_12_18.filter(q=>!s04c02bKnown.has(q.id)));
