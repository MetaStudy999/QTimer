// Subject 3 / Chapter 05 기타 01~03
const S03C05=(n,p,t,c,a,k,img)=>({id:`sujebi-2026-db-build-ch05-${String(n).padStart(2,'0')}`,sourceQuestionNo:n,sourcePage:p,questionType:"single_choice",questionText:t,choices:c,sourceAnswer:a,aiDetectedAnswer:a,aiReasonedAnswer:a,sourceExplanation:k,finalKey:k,sourceImageUrl:img,verificationStatus:"auto_matched"});
const SUBJECT03_CH05_01_03=[
S03C05(1,"3-58","데이터베이스에 영향을 주는 생성·읽기·갱신·삭제 연산으로 프로세스와 테이블 간 매트릭스를 만들어 트랜잭션을 분석하는 것은?",["CASE 분석","일치 분석","CRUD 분석","연관성 분석"],3,"Create·Read·Update·Delete 매트릭스 기반 분석=CRUD 분석.","https://drive.google.com/file/d/1HcNmnmTXsEIN8Gg81noQHBch18_yyUPN/view"),
S03C05(2,"3-58","DAS(Direct Attached Storage)에서 사용하는 프로토콜이 아닌 것은?",["SATA","SCSI","NFS","ATA"],3,"DAS는 ATA·SATA·SCSI·SAS 등을 사용하며 NFS는 NAS 계열 네트워크 파일 프로토콜이다.","https://drive.google.com/file/d/1HcNmnmTXsEIN8Gg81noQHBch18_yyUPN/view"),
S03C05(3,"3-58","여러 소스 시스템에서 원본 데이터를 추출하고 변환하여 DW나 DM으로 적재하는 작업 및 기술은?",["ETL","FTP","OLAP","UDP"],1,"ETL=Extract·Transform·Load.","https://drive.google.com/file/d/1HcNmnmTXsEIN8Gg81noQHBch18_yyUPN/view")
];
const s03c05Known=new Set(QUESTIONS.map(q=>q.id));QUESTIONS.push(...SUBJECT03_CH05_01_03.filter(q=>!s03c05Known.has(q.id)));
