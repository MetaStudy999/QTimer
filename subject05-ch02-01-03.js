// Subject 5 / Chapter 02 IT 프로젝트 정보시스템 구축관리 1~3
const S05C02A=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-system-mgmt-ch02-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT05_CH02_01_03=[
S05C02A(1,"5-21","여러 개의 독립된 통신 장치가 UWB 또는 블루투스를 사용하여 통신망을 형성하는 무선 네트워크 기술은?",["PICONET","SCRUM","NFC","WI-SUN"],1,"Piconet은 Bluetooth 등으로 하나의 Master와 여러 Slave 장치를 연결하는 소규모 무선 네트워크이다.","https://drive.google.com/file/d/1R6ERN_6sOGC_ZMOwuqjcRCbKG6aCgHfy/view"),
S05C02A(2,"5-21","기존 무선 LAN의 한계를 극복하기 위해 대규모 디바이스 네트워크에 최적화되어 차세대 이동통신·홈네트워킹·공공안전 등에 사용하는 네트워크 기술은?",["Software Defined Perimeter","Virtual Private Network","Local Area Network","Mesh Network"],4,"Mesh Network는 다수 노드가 그물망처럼 연결되어 대규모 네트워크와 특수 목적 네트워크 구성에 적합하다.","https://drive.google.com/file/d/1R6ERN_6sOGC_ZMOwuqjcRCbKG6aCgHfy/view"),
S05C02A(3,"5-21","망(Network) 구조의 기본 유형이 아닌 것은?",["버스형","링형","트리형","십자형"],4,"대표 네트워크 토폴로지는 버스형·링형·트리형·성형·망형 등이 있으며 십자형은 기본 유형이 아니다.","https://drive.google.com/file/d/1R6ERN_6sOGC_ZMOwuqjcRCbKG6aCgHfy/view")
];
const s05c02aKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT05_CH02_01_03.filter(q=>!s05c02aKnown.has(q.id)));
