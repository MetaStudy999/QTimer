// Subject 4 / Chapter 02 프로그래밍 언어 활용 80~83 (77~79 source page missing in Drive)
const S04C02G=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch02-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH02_80_83=[
S04C02G(80,"4-36","JAVA의 예외(Exception)에 관한 설명으로 틀린 것은?",["문법 오류로 인해 발생한 것이다.","오동작이나 결과에 악영향을 미칠 수 있는 실행시간 동안의 오류가 있다.","배열 인덱스가 범위를 넘으면 예외가 발생할 수 있다.","존재하지 않는 파일을 읽으려 할 때 예외가 발생할 수 있다."],1,"예외는 주로 실행 중 발생하는 비정상 상황이며 문법 오류 자체와는 구분한다.","https://drive.google.com/file/d/1tcMcPQE58n6cFQTUz7EXlLmAve5DHk03/view"),
S04C02G(81,"4-36","C언어 문자열 처리 함수의 서식과 기능 연결로 틀린 것은?",["strlen(s) - 문자열 길이를 구한다.","strcpy(s1,s2) - s2를 s1으로 복사한다.","strcmp(s1,s2) - s1과 연결한다.","strrev(s) - 문자열을 거꾸로 변환한다."],3,"strcmp는 두 문자열을 비교하는 함수이며 연결은 strcat이 담당한다.","https://drive.google.com/file/d/1tcMcPQE58n6cFQTUz7EXlLmAve5DHk03/view"),
S04C02G(82,"4-37","JAVA try 블록에서 `int sum=11/0;`을 수행하고 NumberFormatException, ArithmeticException, Exception 순으로 catch한다. 출력은?",["A","B","C","D"],3,"정수 0 나눗셈은 ArithmeticException이므로 해당 catch에서 C를 출력한다.","https://drive.google.com/file/d/177gyIVor3T-If-9FHUvdQrxonBwwH5jW/view"),
S04C02G(83,"4-37","삼각함수, 제곱근, 지수 등 수학 함수를 내장하는 C 헤더파일은?",["stdlib.h","string.h","stdio.h","math.h"],4,"C 수학 함수 헤더=math.h.","https://drive.google.com/file/d/177gyIVor3T-If-9FHUvdQrxonBwwH5jW/view")
];
const s04c02gKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH02_80_83.filter(q=>!s04c02gKnown.has(q.id)));
