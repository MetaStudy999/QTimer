const CH03_QUESTIONS_99_107 = [
  {
    id:"sujebi-2026-sw-design-ch03-99", sourceQuestionNo:99, sourcePage:"1-66", questionType:"single_choice",
    questionText:"럼바우(Rumbaugh) 객체 지향 분석 기법에서 동적 모델링에 활용되는 다이어그램은?",
    choices:["객체 다이어그램(Object Diagram)","패키지 다이어그램(Package Diagram)","상태 다이어그램(State Diagram)","자료 흐름도(Data Flow Diagram)"],
    sourceAnswer:3, aiDetectedAnswer:3, aiReasonedAnswer:3,
    sourceExplanation:"럼바우 객체 지향 분석의 동적 모델링은 객체의 상태 변화와 사건에 따른 동작을 상태 다이어그램 등으로 표현한다.",
    finalKey:"럼바우 동적 모델링 = 상태 다이어그램",
    sourceImageUrl:"https://drive.google.com/file/d/1PiqNaFj2iUCCmTBUkspIY6TVGAw2QGPD/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-100", sourceQuestionNo:100, sourcePage:"1-66", questionType:"single_choice",
    questionText:"싱글톤(Singleton)에 대한 설명으로 옳지 않은 것은?",
    choices:["전역 변수를 사용하지 않고 객체를 하나만 생성하도록 한다.","생성된 객체를 어디에서든지 참조할 수 있도록 한다.","한 클래스에 한 객체만 존재하도록 제한한다.","객체들의 관계를 트리 구조로 구성하여 부분-전체 계층을 표현하는 패턴이다."],
    sourceAnswer:4, aiDetectedAnswer:4, aiReasonedAnswer:4,
    sourceExplanation:"싱글톤은 클래스의 인스턴스를 하나만 생성하고 전역적으로 접근할 수 있게 한다. 부분-전체 계층을 트리 구조로 표현하는 것은 컴포지트(Composite) 패턴이다.",
    finalKey:"Singleton = 인스턴스 1개 / 트리형 부분-전체 = Composite",
    sourceImageUrl:"https://drive.google.com/file/d/1PiqNaFj2iUCCmTBUkspIY6TVGAw2QGPD/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-101", sourceQuestionNo:101, sourcePage:"1-66", questionType:"single_choice",
    questionText:"기존에 구현된 클래스에 필요한 기능을 추가해 나가며, 객체 간 결합을 통해 기능을 동적으로 유연하게 확장하여 상속의 대안으로 사용하는 구조 디자인 패턴은?",
    choices:["Bridge","Decorator","Facade","Flyweight"],
    sourceAnswer:2, aiDetectedAnswer:2, aiReasonedAnswer:2,
    sourceExplanation:"Decorator 패턴은 기존 객체를 감싸 필요한 기능을 동적으로 추가하며, 기능 확장을 위해 상속 대신 객체 결합을 활용할 수 있다.",
    finalKey:"동적 기능 추가 + 상속의 대안 = Decorator",
    sourceImageUrl:"https://drive.google.com/file/d/1PiqNaFj2iUCCmTBUkspIY6TVGAw2QGPD/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-102", sourceQuestionNo:102, sourcePage:"1-67", questionType:"single_choice",
    questionText:"럼바우(Rumbaugh)의 객체 지향 분석기법 중 프로세스들의 자료 흐름을 중심으로 처리 과정을 표현하는 모델링은?",
    choices:["객체 모델링","동적 모델링","기능 모델링","정적 모델링"],
    sourceAnswer:3, aiDetectedAnswer:3, aiReasonedAnswer:3,
    sourceExplanation:"기능 모델링(Functional Modeling)은 프로세스 간 자료 흐름을 중심으로 처리 과정을 표현하며 자료 흐름도(DFD)를 사용한다.",
    finalKey:"자료 흐름 중심 처리 과정 = 기능 모델링(DFD)",
    sourceImageUrl:"https://drive.google.com/file/d/1jC6DL5m_Kp_thhAmK0lC5sjSNmJYeiJj/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-103", sourceQuestionNo:103, sourcePage:"1-67", questionType:"single_choice",
    questionText:"상위 클래스에는 추상 메서드로 기능의 골격을 제공하고 하위 클래스의 메서드에서 세부 처리를 구체화하는 디자인 패턴은?",
    choices:["Template Method","Observer","State","Factory Method"],
    sourceAnswer:1, aiDetectedAnswer:1, aiReasonedAnswer:1,
    sourceExplanation:"Template Method 패턴은 상위 클래스에서 알고리즘의 골격을 정하고 세부 단계는 하위 클래스에서 구현하도록 한다.",
    finalKey:"상위=골격 / 하위=세부 구현 = Template Method",
    sourceImageUrl:"https://drive.google.com/file/d/1jC6DL5m_Kp_thhAmK0lC5sjSNmJYeiJj/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-104", sourceQuestionNo:104, sourcePage:"1-68", questionType:"single_choice",
    questionText:"다음 중 객체 지향 기법에 대한 설명으로 올바르지 않은 것은?",
    choices:["추상화(Abstraction): 하나의 메시지에 대해 각 객체가 가진 고유한 방법으로 응답할 수 있는 능력으로 오버라이딩이 대표적 기법이다.","정보 은닉(Information Hiding): 코드 내부 데이터와 메서드를 숨기고 공개 인터페이스를 통해서만 접근 가능하도록 하는 코드 보안 기술이다.","상속성(Inheritance): 상위 클래스의 속성과 메서드를 하위 클래스에서 재정의 없이 물려받아 사용하는 기법이다.","캡슐화(Encapsulation): 서로 연관된 데이터와 함수를 함께 묶어 외부와 경계를 만들고 필요한 인터페이스만 밖으로 드러내는 기법이다."],
    sourceAnswer:1, aiDetectedAnswer:1, aiReasonedAnswer:1,
    sourceExplanation:"1번 설명은 추상화가 아니라 다형성(Polymorphism)에 해당한다. 추상화는 공통 성질을 추출하여 추상 클래스를 설정하는 개념이다.",
    finalKey:"메시지에 객체별 방식으로 응답 = 다형성, 추상화 아님",
    sourceImageUrl:"https://drive.google.com/file/d/1nbri4rsTXO0Pp-VJg1AM3iA4mhcP2vbT/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-105", sourceQuestionNo:105, sourcePage:"1-68", questionType:"single_choice",
    questionText:"객체 지향 기법에서 클래스를 통해 만든 실제의 실행 객체이며 클래스에 속한 각각의 객체를 의미하는 구성요소는?",
    choices:["Class","Method","Property","Instance"],
    sourceAnswer:4, aiDetectedAnswer:4, aiReasonedAnswer:4,
    sourceExplanation:"클래스를 통해 생성된 실제 실행 객체를 인스턴스(Instance)라고 한다.",
    finalKey:"클래스로 만든 실제 객체 = Instance",
    sourceImageUrl:"https://drive.google.com/file/d/1nbri4rsTXO0Pp-VJg1AM3iA4mhcP2vbT/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-106", sourceQuestionNo:106, sourcePage:"1-68", questionType:"single_choice",
    questionText:"객체 지향 설계 원칙에 해당하지 않는 것은?",
    choices:["단일 책임의 원칙(Single Responsibility Principle)","리스코프 치환의 원칙(Liskov Substitution Principle)","인터페이스 통합의 원칙(Interface Integration Principle)","개방 폐쇄 원칙(Open Close Principle)"],
    sourceAnswer:3, aiDetectedAnswer:3, aiReasonedAnswer:3,
    sourceExplanation:"SOLID에는 인터페이스 분리의 원칙(Interface Segregation Principle)이 있으며 '인터페이스 통합의 원칙'은 해당하지 않는다.",
    finalKey:"SOLID의 I = Interface Segregation(분리)",
    sourceImageUrl:"https://drive.google.com/file/d/1nbri4rsTXO0Pp-VJg1AM3iA4mhcP2vbT/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-107", sourceQuestionNo:107, sourcePage:"1-69", questionType:"single_choice",
    questionText:"객체 지향 기법에서 is-instance-of 관계이며 공통된 속성에 의해 정의된 객체 구성원들의 인스턴스를 의미하는 관계성은?",
    choices:["분류화","집단화","일반화","연관화"],
    sourceAnswer:1, aiDetectedAnswer:1, aiReasonedAnswer:1,
    sourceExplanation:"분류화(Classification)는 is-instance-of 관계로, 공통된 속성에 의해 정의된 객체 구성원들의 인스턴스 관계를 나타낸다.",
    finalKey:"is-instance-of = 분류화",
    sourceImageUrl:"https://drive.google.com/file/d/14iRIgXIRturySlUMcqTkH_13FtxQMR4y/view"
  }
];

const ch03Existing = new Set(QUESTIONS.map(q => q.id));
const ch03New = CH03_QUESTIONS_99_107.filter(q => !ch03Existing.has(q.id));
const currentQuestionIdBeforeCh03 = state.currentRoundIds?.[state.currentIndex];
if (ch03New.length) QUESTIONS.push(...ch03New);

const ch03 = QUESTIONS.filter(q => q.id.startsWith("sujebi-2026-sw-design-ch03-")).sort((a,b) => a.sourceQuestionNo - b.sourceQuestionNo);
const nonCh03 = QUESTIONS.filter(q => !q.id.startsWith("sujebi-2026-sw-design-ch03-"));
QUESTIONS.splice(0, QUESTIONS.length, ...ch03, ...nonCh03);

if (state.mode !== "weak") {
  state.currentRoundIds = QUESTIONS.map(q => q.id);
  const preserved = state.currentRoundIds.indexOf(currentQuestionIdBeforeCh03);
  state.currentIndex = preserved >= 0 ? preserved : Math.min(state.currentIndex || 0, state.currentRoundIds.length - 1);
  saveState();
}

if (typeof renderDashboardV01 === "function") renderDashboardV01();
