const CH03_QUESTIONS_91_107 = [
  {
    id:"sujebi-2026-sw-design-ch03-91", sourceQuestionNo:91, sourcePage:"1-64", questionType:"single_choice",
    questionText:"GoF(Gang of Four) 디자인 패턴에 대한 설명으로 틀린 것은?",
    choices:["Factory Method pattern은 상위 클래스에서 객체를 생성하는 인터페이스를 정의하고 하위 클래스에서 인스턴스를 생성하도록 하는 방식이다.","Prototype pattern은 prototype을 먼저 생성하고 인스턴스를 복제하여 사용하는 구조이다.","Bridge pattern은 기존에 구현되어 있는 클래스에 기능 발생 시 기존 클래스를 재사용할 수 있도록 중간에서 맞춰주는 역할을 한다.","Mediator pattern은 객체 간의 통제와 지시 역할을 하는 중재자를 두어 객체 지향의 목표를 달성하게 해준다."],
    sourceAnswer:3, aiDetectedAnswer:3, aiReasonedAnswer:3,
    sourceExplanation:"Bridge 패턴은 추상화와 구현을 분리하여 각각 독립적으로 확장할 수 있게 하는 구조 패턴이다. 기존 클래스 사이를 맞춰 재사용하게 하는 설명은 Adapter에 가깝다.",
    finalKey:"Bridge = 추상화와 구현 분리",
    sourceImageUrl:"https://drive.google.com/file/d/1Ia0_hs6UGX3wYGHsxvLbYNfSWhSKYi4H/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-92", sourceQuestionNo:92, sourcePage:"1-64", questionType:"single_choice",
    questionText:"GoF(Gang of Four) 디자인 패턴 중 생성 패턴으로 옳은 것은?",
    choices:["Singleton Pattern","Adapter Pattern","Decorator Pattern","State Pattern"],
    sourceAnswer:1, aiDetectedAnswer:1, aiReasonedAnswer:1,
    sourceExplanation:"Singleton은 객체 생성 방식을 다루는 생성 패턴이다. Adapter와 Decorator는 구조 패턴, State는 행위 패턴이다.",
    finalKey:"Singleton = 생성 패턴",
    sourceImageUrl:"https://drive.google.com/file/d/1Ia0_hs6UGX3wYGHsxvLbYNfSWhSKYi4H/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-93", sourceQuestionNo:93, sourcePage:"1-64", questionType:"single_choice",
    questionText:"GoF(Gang of Four) 디자인 패턴과 관련한 설명으로 틀린 것은?",
    choices:["디자인 패턴을 목적(Purpose)으로 분류할 때 생성, 구조, 행위로 분류할 수 있다.","Strategy 패턴은 대표적인 구조 패턴으로 인스턴스를 복제하여 사용하는 구조를 말한다.","행위 패턴은 클래스나 객체들이 상호 작용하는 방법과 책임을 분산하는 방법을 정의한다.","Singleton 패턴은 특정 클래스의 인스턴스가 오직 하나임을 보장하고 이 인스턴스에 대한 접근 방법을 제공한다."],
    sourceAnswer:2, aiDetectedAnswer:2, aiReasonedAnswer:2,
    sourceExplanation:"Strategy는 여러 알고리즘을 캡슐화해 상호 교환 가능하게 만드는 행위 패턴이다.",
    finalKey:"Strategy = 행위 패턴, 알고리즘 캡슐화",
    sourceImageUrl:"https://drive.google.com/file/d/1Ia0_hs6UGX3wYGHsxvLbYNfSWhSKYi4H/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-94", sourceQuestionNo:94, sourcePage:"1-64", questionType:"single_choice",
    questionText:"객체에 대한 설명으로 틀린 것은?",
    choices:["객체는 상태, 동작, 고유 식별자를 가진 모든 것이라 할 수 있다.","객체는 공통 속성을 공유하는 클래스들의 집합이다.","객체는 필요한 자료 구조와 이에 수행되는 함수들을 가진 하나의 독립된 존재이다.","객체의 상태는 속성값에 의해 정의된다."],
    sourceAnswer:2, aiDetectedAnswer:2, aiReasonedAnswer:2,
    sourceExplanation:"클래스는 공통 속성과 행위를 공유하는 객체들의 집합이다. 2번은 객체와 클래스의 관계를 반대로 설명한다.",
    finalKey:"클래스 = 공통 속성을 공유하는 객체들의 집합",
    sourceImageUrl:"https://drive.google.com/file/d/1Ia0_hs6UGX3wYGHsxvLbYNfSWhSKYi4H/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-95", sourceQuestionNo:95, sourcePage:"1-65", questionType:"single_choice",
    questionText:"속성과 관련된 연산(Operation)을 클래스 안에 묶어서 하나로 취급하는 것을 의미하는 객체지향 개념은?",
    choices:["Inheritance","Class","Encapsulation","Association"],
    sourceAnswer:3, aiDetectedAnswer:3, aiReasonedAnswer:3,
    sourceExplanation:"캡슐화(Encapsulation)는 데이터와 관련 연산을 하나의 단위로 묶어 외부에는 필요한 인터페이스만 제공하는 개념이다.",
    finalKey:"속성 + 관련 연산을 하나로 묶기 = Encapsulation",
    sourceImageUrl:"https://drive.google.com/file/d/1eEA-dB0gKrVohlPzTcEBTktWcCuMoVaI/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-96", sourceQuestionNo:96, sourcePage:"1-65", questionType:"single_choice",
    questionText:"객체 지향 개념에서 다형성(Polymorphism)과 관련한 설명으로 틀린 것은?",
    choices:["다형성은 현재 코드를 변경하지 않고 새로운 클래스를 쉽게 추가할 수 있게 한다.","다형성이란 여러 가지 형태를 가지고 있다는 의미로 여러 형태를 받아들일 수 있는 특징을 말한다.","메서드 오버라이딩(Overriding)은 상위 클래스에서 정의한 일반 메서드의 구현을 하위 클래스에서 재정의할 수 있다.","오버로딩(Overloading)은 매개 변수 타입은 동일하지만 메서드명을 다르게 함으로써 구현하고 구분할 수 있다."],
    sourceAnswer:4, aiDetectedAnswer:4, aiReasonedAnswer:4,
    sourceExplanation:"오버로딩은 같은 이름의 메서드에서 매개변수의 개수나 타입을 다르게 정의하는 기법이다. 메서드명을 다르게 하는 것이 아니다.",
    finalKey:"Overloading = 같은 메서드명 + 매개변수 개수/타입 다름",
    sourceImageUrl:"https://drive.google.com/file/d/1eEA-dB0gKrVohlPzTcEBTktWcCuMoVaI/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-97", sourceQuestionNo:97, sourcePage:"1-65", questionType:"single_choice",
    questionText:"GoF 디자인 패턴을 생성, 구조, 행위 패턴의 세 그룹으로 분류할 때 구조 패턴이 아닌 것은?",
    choices:["Adapter 패턴","Bridge 패턴","Builder 패턴","Proxy 패턴"],
    sourceAnswer:3, aiDetectedAnswer:3, aiReasonedAnswer:3,
    sourceExplanation:"Adapter, Bridge, Proxy는 구조 패턴이고 Builder는 생성 패턴이다.",
    finalKey:"Builder = 생성 패턴",
    sourceImageUrl:"https://drive.google.com/file/d/1eEA-dB0gKrVohlPzTcEBTktWcCuMoVaI/view"
  },
  {
    id:"sujebi-2026-sw-design-ch03-98", sourceQuestionNo:98, sourcePage:"1-65", questionType:"single_choice",
    questionText:"소프트웨어 설계에서 자주 발생하는 문제에 대한 일반적이고 반복적인 해결 방법을 무엇이라고 하는가?",
    choices:["모듈 분해","디자인 패턴","연관 관계","클래스 도출"],
    sourceAnswer:2, aiDetectedAnswer:2, aiReasonedAnswer:2,
    sourceExplanation:"디자인 패턴은 소프트웨어 설계에서 반복적으로 나타나는 문제에 대해 자주 사용되는 일반적인 해결 방식을 정리한 패턴이다.",
    finalKey:"반복되는 설계 문제의 일반적 해결법 = 디자인 패턴",
    sourceImageUrl:"https://drive.google.com/file/d/1eEA-dB0gKrVohlPzTcEBTktWcCuMoVaI/view"
  },
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
const ch03New = CH03_QUESTIONS_91_107.filter(q => !ch03Existing.has(q.id));
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
