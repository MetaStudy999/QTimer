// Subject 5 / Chapter 02 IT 프로젝트 정보시스템 구축관리 36~41
const S05C02E=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-system-mgmt-ch02-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT05_CH02_36_41=[
S05C02E(36,"5-33","NoSQL에 대한 설명으로 틀린 것은?",["Not Only SQL의 약자이다.","특정 시점에는 데이터의 일관성이 보장되지 않을 수 있다.","분산 시스템 특성상 가용성을 중시하며 언제든 데이터 접근이 가능해야 한다.","일정 시간이 지나면 데이터의 일관성이 유지되지 않는 속성이 있다."],4,"NoSQL의 BASE 특성 중 Eventually Consistency는 일정 시간이 지나면 최종적으로 데이터 일관성이 유지되는 성질이다.","https://drive.google.com/file/d/1cXR_6Na3oN_y-xRAhs04T4qhAI70mbnP/view"),
S05C02E(37,"5-33","빅데이터 분석 기술 중 대량의 데이터를 분석해 변수 사이의 상호관계를 규명하고 일정한 패턴을 찾아내는 기법은?",["Data Mining","Wm-Bus","Digital Twin","Zigbee"],1,"Data Mining은 대량 데이터에서 상관관계·규칙·패턴을 발견하는 분석 기술이다.","https://drive.google.com/file/d/1cXR_6Na3oN_y-xRAhs04T4qhAI70mbnP/view"),
S05C02E(38,"5-33","오픈소스 기반 분산 컴퓨팅 플랫폼으로 일반 PC급 컴퓨터로 가상화된 대형 스토리지를 구성하고 빅데이터를 분산 저장·처리하는 기술은?",["Hadoop","Beacon","Foursquare","Memristor"],1,"Hadoop은 오픈소스 기반 분산 저장·처리 플랫폼이다.","https://drive.google.com/file/d/1cXR_6Na3oN_y-xRAhs04T4qhAI70mbnP/view"),
S05C02E(39,"5-33","대용량 데이터를 분산 처리하기 위해 개발된 프로그래밍 모델로, 데이터를 나눠 처리한 뒤 결과를 다시 합치는 Google의 대표 병렬 처리 기법은?",["MapReduce","SQL","Jihacking","Logs"],1,"MapReduce는 Map 단계에서 분산 처리하고 Reduce 단계에서 결과를 집계하는 대용량 데이터 처리 모델이다.","https://drive.google.com/file/d/1cXR_6Na3oN_y-xRAhs04T4qhAI70mbnP/view"),
S05C02E(40,"5-34","Hadoop과 관계형 데이터베이스 간에 데이터를 전송할 수 있도록 설계된 도구는?",["Apnic","Topology","Sqoop","SDB"],3,"Sqoop은 Hadoop과 관계형 데이터베이스 사이의 정형 데이터 전송에 사용하는 도구이다.","https://drive.google.com/file/d/1x0Hbfo_dYxq8LOCbtIDnOO5fUX4hwlMY/view"),
S05C02E(41,"5-34","Python 기반의 웹 크롤링(Web Crawling) 프레임워크는?",["Li-fi","Scrapy","CrawlCat","SBAS"],2,"Scrapy는 웹 사이트를 크롤링하여 구조화된 데이터를 수집하는 Python 기반 프레임워크이다.","https://drive.google.com/file/d/1x0Hbfo_dYxq8LOCbtIDnOO5fUX4hwlMY/view")
];
const s05c02eKnown=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT05_CH02_36_41.filter(q=>!s05c02eKnown.has(q.id)));
