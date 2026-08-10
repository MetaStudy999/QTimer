// Subject 4 / Chapter 02 프로그래밍 언어 활용 69~76
const S04C02F=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-prog-lang-ch02-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT04_CH02_69_76=[
S04C02F(69,"4-33","Java의 정수 데이터 타입 중 long의 크기는?",["1byte","2byte","4byte","8byte"],4,"Java long은 8byte 정수형이다.","https://drive.google.com/file/d/1QcvqnytYvxshf-GK5b5b3LwrVSBA9cbp/view"),
S04C02F(70,"4-33","스크립트 언어가 아닌 것은?",["PHP","Cobol","Basic","Python"],2,"교재 기준 Cobol은 절차적·명령형 언어이며 일반적인 스크립트 언어가 아니다.","https://drive.google.com/file/d/1QcvqnytYvxshf-GK5b5b3LwrVSBA9cbp/view"),
S04C02F(71,"4-33","JavaScript에 관한 설명으로 틀린 것은?",["프로토타입 개념이 존재한다.","컴파일 언어로 타입 검사를 엄격하게 한다.","Prototype Link와 Prototype Object를 활용할 수 있다.","객체 기반 스크립트 프로그래밍 언어이다."],2,"JavaScript는 대표적인 인터프리터/스크립트 언어이며 정적 컴파일 언어처럼 엄격한 타입 검사를 전제로 하지 않는다.","https://drive.google.com/file/d/1QcvqnytYvxshf-GK5b5b3LwrVSBA9cbp/view"),
S04C02F(72,"4-33","귀도 반 로섬이 발표했으며 인터프리터 방식·객체지향·높은 가독성이 특징인 스크립트 언어는?",["C++","JAVA","C#","Python"],4,"Guido van Rossum이 만든 언어=Python.","https://drive.google.com/file/d/1QcvqnytYvxshf-GK5b5b3LwrVSBA9cbp/view"),
S04C02F(73,"4-33","Java의 기본 자료형 중 문자형은?",["byte","char","short","long"],2,"Java 문자형 기본 타입=char.","https://drive.google.com/file/d/1QcvqnytYvxshf-GK5b5b3LwrVSBA9cbp/view"),
S04C02F(74,"4-34","Java에서 Tomato 타입 참조변수가 Apple 하위 클래스 객체를 가리키고 Apple이 fn(a,b)를 a-b로 오버라이딩했다. `t.fn(5,3)` 결과는?",["0","8","2","28"],3,"동적 디스패치로 실제 객체 Apple의 오버라이딩 메서드가 호출되어 5-3=2.","https://drive.google.com/file/d/14aFmbmda6xyHbwzNnn4mz9c2u8rnkqLE/view"),
S04C02F(75,"4-34","라이브러리의 개념과 구성에 대한 설명 중 틀린 것은?",["필요할 때 찾아 쓸 수 있도록 모듈화해 제공되는 프로그램이다.","언어별로 도움말·설치파일·샘플코드 등을 제공할 수 있다.","외부 라이브러리는 언어가 기본적으로 가진 라이브러리이고 표준 라이브러리는 별도 설치가 필요한 라이브러리이다.","모듈이 개별 파일이라면 패키지는 파일들을 모은 폴더로 볼 수 있다."],3,"표준 라이브러리가 언어에 기본 포함되는 것이고 외부 라이브러리는 별도 설치하는 경우가 일반적이다.","https://drive.google.com/file/d/14aFmbmda6xyHbwzNnn4mz9c2u8rnkqLE/view"),
S04C02F(76,"4-34","C언어에서 문자열을 정수형으로 변환하는 라이브러리 함수는?",["atoi()","atof()","itoa()","ceil()"],1,"atoi = ASCII to integer, 문자열을 int로 변환한다.","https://drive.google.com/file/d/14aFmbmda6xyHbwzNnn4mz9c2u8rnkqLE/view")
];
const s04c02fKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT04_CH02_69_76.filter(q=>!s04c02fKnown.has(q.id)));
