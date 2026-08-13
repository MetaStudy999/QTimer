# QTimer V2 Security & Quality Baseline

## 1. 보안 범위

현재 QTimer는 로컬 우선 정적 웹앱이다. 따라서 V2 초기 보안 우선순위는 서버 계정 보안보다 **콘텐츠 무결성, 사용자 학습데이터 보존, 악성 Import 방어, DOM 안전성, GitHub 변경 통제**다.

## 2. Trust Boundaries

### 신뢰도가 높은 입력
- QA를 통과한 repository SOURCE BANK
- 코드에 포함된 고정 설정값

### 신뢰하지 않는 입력
- 사용자가 선택한 Backup JSON
- 사용자 지정 프로그램 이름/양식 이름/메모
- 향후 외부 Sheets/API/OCR에서 유입되는 문자열
- 외부 URL

원칙: **저장되어 있다는 이유로 신뢰하지 않는다.**

## 3. 주요 위협과 통제

### T1. Backup schema corruption / data loss

통제:
- 최대 파일 크기 제한
- envelope version 검증
- module count 제한
- module별 schema 검증
- migration은 memory에서 완료
- 모든 module 통과 후에만 write plan 생성
- pre-import snapshot
- staging marker
- 실패 시 rollback

### T2. Stored DOM XSS

통제:
- 사용자/외부 문자열은 기본 `textContent`
- HTML 문자열이 필요한 renderer는 중앙 escape utility 사용
- 사용자 입력을 template HTML에 직접 삽입 금지
- Domain layer는 HTML을 생성하지 않음

### T3. Dangerous URL

통제:
- `https:` 기본 allowlist
- Source image URL은 허용 host 정책 도입 검토
- `javascript:`, `data:text/html`, 임의 protocol 차단
- 새 창 링크에는 `noopener noreferrer`

### T4. Browser resource exhaustion

통제:
- Import 파일 크기 제한
- programs/formats/transforms 개수 제한
- program compile 최대 step 제한
- cloze target 최대 개수 제한
- 반복 nesting/무한 loop 금지

### T5. SOURCE BANK mutation

통제:
- V2 QuestionModel deep freeze
- Transform은 derived StudyView만 생성
- QA에서 transform 전/후 source equality 검증

### T6. CI bypass

현재 main branch protection이 비활성화되어 있다.

권장 GitHub 정책:
- Require pull request before merging
- Require status checks
  - `QTimer QA / question-bank-qa`
  - V2 기간에는 `QTimer V2 Foundation QA / v2-foundation-contracts`
- Block force pushes
- Block branch deletion

## 4. Dependency Policy

V2 Foundation은 새 runtime dependency를 도입하지 않는다.

향후 dependency 추가 시:
- 필요한 이유 문서화
- lockfile 필수
- 최소 권한/최소 패키지
- 동일 기능을 Web Platform API로 간단히 구현 가능하면 dependency 추가 금지

## 5. CSP Roadmap

현재 동적 script injection과 동적 style이 있어 강한 CSP를 즉시 적용하기 어렵다.

순서:
1. 동적 feature script injection 제거
2. ES module static import
3. inline style 생성 축소
4. 외부 resource inventory
5. Report-Only CSP
6. 위반 0 확인
7. Enforced CSP

## 6. Quality Gates

### 기존 Gate — 유지
- Question Bank Integrity
- Deep Structural QA
- Answer Risk Baseline
- Study browser smoke
- Settings smoke
- Focus Study smoke
- Semantic marking smoke
- Program Builder smoke
- Live Format Editor smoke

### V2 Gate — 신규

#### Domain Contract Gate
- Content Zone adapter
- passage optional support
- choice/answer zone resolution
- multi-zone Cloze
- overlapping range rejection
- SOURCE BANK immutability

#### Data Contract Gate
- storage ownership unique
- formats 포함 확인
- backup module enumeration
- all-before-write import validation
- unknown module rejection

### 후속 Gate
- Backup V2 migration
- Import limits/security
- Dapchigi V2 state-machine
- Program V2 compiler
- renderer parity
- accessibility keyboard/focus

## 7. Logging / Error Policy

- 사용자 데이터 내용을 console에 전체 dump하지 않는다.
- 오류는 module id / schema version / question id 정도의 진단 식별자 중심으로 남긴다.
- Import 실패 시 어떤 module이 실패했는지 표시하되 해당 데이터 원문은 출력하지 않는다.
- 정상화 과정에서 데이터를 조용히 버리지 않는다. 실패 또는 명시적 migration으로 처리한다.

## 8. Security Definition of Done

- Backup file은 untrusted input으로 처리된다.
- 부분 import가 발생하지 않는다.
- Transform으로 SOURCE BANK가 변경되지 않는다.
- URL protocol validation이 중앙화된다.
- 사용자 문자열 렌더링 정책이 중앙화된다.
- main merge에 CI 우회 경로가 없다.
- CSP 도입을 막는 dynamic script injection이 제거된다.
