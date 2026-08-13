# QTimer V2 Architecture & Migration

## 1. 목표 구조

```text
src/v2/
├─ app/
│  ├─ bootstrap
│  ├─ router
│  ├─ store
│  └─ events
├─ domain/
│  ├─ question
│  ├─ study
│  ├─ dapchigi
│  ├─ program
│  └─ transforms
├─ data/
│  ├─ question-bank
│  ├─ storage
│  ├─ migration
│  └─ backup
├─ features/
│  ├─ dashboard
│  ├─ learn
│  ├─ review
│  ├─ exam
│  ├─ dapchigi
│  └─ settings
├─ ui/
│  ├─ components
│  ├─ renderers
│  └─ shells
└─ security/
   ├─ import-policy
   ├─ url-policy
   └─ content-policy
```

현재 단계에서는 빌드 도구나 프레임워크를 추가하지 않는다. Pure ES Modules(`.mjs`)과 현재 정적 브라우저 구조를 사용해 경계를 먼저 검증한다.

## 2. 의존성 규칙

```text
UI
 ↓
Application
 ↓
Domain
 ↓
Data Contract
```

- Domain → DOM 금지
- Domain → localStorage 금지
- Domain → global `state` 금지
- Data layer → 화면 DOM 금지
- Feature A → Feature B 내부 DOM 직접 조작 금지
- Renderer → SOURCE BANK mutation 금지

## 3. 핵심 모델

### 3.1 Source Question

기존 973문항 형식은 변경하지 않는다.

### 3.2 Canonical Question Model

Legacy adapter가 Source Question을 다음 논리 Zone으로 변환한다.

```text
QuestionModel
├─ id
├─ source
├─ type
├─ content
│  ├─ stem
│  ├─ passage
│  ├─ choices[]
│  ├─ finalKey
│  └─ explanation
└─ answer
```

기존 데이터에 passage가 없으면 빈 Zone으로 생성한다. 향후 지문형 문제는 `passageText` 또는 정식 content schema에서 공급한다.

## 4. Cloze Transform Contract

빈칸은 원본 문자열을 파괴하지 않는다.

```js
{
  id: "cloze-1",
  type: "cloze",
  targets: [
    {
      id: "target-1",
      zone: "stem",
      selector: { type: "term", value: "응집도", occurrence: 0 },
      placeholder: "______",
      revealPolicy: "with-answer"
    },
    {
      id: "target-2",
      zone: "explanation",
      selector: { type: "range", start: 10, end: 18 }
    }
  ]
}
```

같은 Transform에 여러 Zone target을 넣을 수 있다.

### 지원 Zone

- stem
- passage
- choice + choiceIndex
- answer
- finalKey
- explanation

### Selector

V2 Foundation:
- `range`
- `term + occurrence`

후속 UI:
- 마우스/터치로 실제 Preview 텍스트 선택
- 자동 핵심어 후보
- 사용자 지정 허용답안

## 5. Format / Transform / Program 분리

### Format

화면 구조만 소유한다.

```text
visible zones
layout
ratio
responsive behavior
presentation profile reference
```

### Transform

콘텐츠 변환만 소유한다.

```text
cloze
highlight
hide
reveal
emphasis
```

### Program

순서와 반복만 소유한다.

```text
show format
apply transform
repeat
reveal
rate
conditional next
```

이 세 기능을 분리해야 사용자가 “문제는 좌측, 해설은 우측으로 배치하고, 해설 일부만 빈칸으로 만든 뒤 두 번 반복” 같은 프로그램을 자연스럽게 만들 수 있다.

## 6. Storage Architecture

### 6.1 Logical Module IDs

```text
state
preferences
focusPreferencesLegacy
programs
formats
transforms
notes
```

각 모듈은 다음 계약을 가진다.

```text
id
storageKey
schemaVersion
defaultValue
validate(data)
migrate(data, fromVersion)
exportable
```

### 6.2 Backup V2

```json
{
  "format": "qtimer-backup",
  "version": 2,
  "appVersion": "v2",
  "questionBankVersion": "...",
  "modules": {
    "state": {"schemaVersion": 1, "data": {}},
    "preferences": {"schemaVersion": 3, "data": {}},
    "programs": {"schemaVersion": 1, "data": {}},
    "formats": {"schemaVersion": 1, "data": {}}
  }
}
```

신규 기능은 Registry에 등록하는 순간 Backup 대상이 된다.

## 7. Import Transaction

브라우저 localStorage는 DB transaction을 제공하지 않으므로 애플리케이션 레벨에서 다음 순서를 사용한다.

```text
Read file
 → size limit
 → JSON parse
 → envelope validate
 → every module validate
 → migrate in memory
 → create pre-import snapshot
 → staging marker
 → commit all keys
 → remove staging marker
```

실패 시 snapshot으로 rollback한다.

## 8. Security Architecture

QTimer 현재 구조는 로컬 우선 정적 앱이므로 서버 인증보다 다음 위험이 우선이다.

### 보호 대상

- 학습기록
- O/A/X 이력
- 정답 검증 override
- 사용자 설정
- 프로그램/양식/Transform
- 원본 문제 무결성

### 위협

- 손상되거나 악의적인 Backup JSON
- 사용자 입력/가져온 문자열을 통한 DOM XSS
- `javascript:` 등 위험 URL
- 대용량 import로 브라우저 freeze
- schema drift로 인한 데이터 유실
- dynamic script injection으로 인한 CSP 적용 어려움
- CI를 우회한 main 변경

### 통제

1. DOM 출력은 `textContent` 또는 검증된 escape 함수 사용
2. URL은 `https:` allowlist
3. Backup 크기·모듈 수·배열 길이 제한
4. 모든 모듈을 쓰기 전에 전체 검증
5. `eval`, `new Function` 금지
6. 동적 script injection 단계적 제거
7. CSP 적용 가능한 정적 import 구조로 이동
8. GitHub main 보호 + required CI

## 9. Migration Phases

### Phase 0 — Audit & Freeze

- 완료: 저장소 구조 감사
- 완료: V2 Master Index
- 기존 973/QA baseline 고정

### Phase 1 — Foundation

- Content Zone model
- Legacy Question Adapter
- Cloze Transform pure engine
- Storage Registry pure engine
- Node contract tests
- 별도 V2 Foundation workflow

**main runtime에는 아직 연결하지 않는다.**

### Phase 2 — Data Safety

- Backup V2 Registry 기반 구현
- 기존 Backup v1 import migration
- Live Format 데이터 누락 수정
- import transaction/staging
- backup/restore browser test

### Phase 3 — Study View Model

- 현재 문제를 Canonical QuestionModel로 adapter
- Format + Transform → StudyViewModel
- 동일 Renderer를 Live Preview와 실제 학습에 사용

### Phase 4 — Cloze Editor V2

사용자가 Preview에서 직접:

```text
[문제] [지문] [선택지] [핵심] [해설]
```

중 영역을 선택하고 텍스트를 드래그하여 빈칸을 지정한다.

`빈칸문제`라는 별도 양식은 폐기하고 `Cloze Transform preset`으로 migration한다.

### Phase 5 — Dapchigi V2

- DOM과 분리된 state machine
- round 종료 summary
- A+X weak round
- legacy mark → cloze transform adapter

### Phase 6 — Program V2

- 레거시 stage block 대신 generic commands
- Format ID 참조
- Transform ID 참조
- bounded repeat
- condition
- O/A/X gate

### Phase 7 — Preferences V4

- settings-v1/v2/v3 runtime layering 제거
- migration 함수만 유지
- DisplayProfile canonical store

### Phase 8 — UI/UX Migration

- Dashboard / Learn / Review / Exam shell
- Next Best Action
- Quick Settings
- responsive/accessibility

### Phase 9 — Legacy Removal

다음 조건을 모두 만족한 모듈만 제거한다.

- V2 parity test
- 기존 browser smoke 유지
- migration test
- Local WSL 실제 확인
- rollback 경로 존재

### Phase 10 — Security Hardening

- static module imports
- CSP
- URL policy
- import limits
- security regression tests

## 10. Release 전략

대규모 리팩터링 브랜치를 한 번에 main으로 merge하지 않는다.

권장 분할:

```text
refactor/qtimer-v2-foundation
  ↓
refactor/storage-v2
  ↓
refactor/content-transform-v2
  ↓
refactor/dapchigi-engine-v2
  ↓
refactor/program-engine-v2
  ↓
refactor/preferences-v4
  ↓
refactor/ui-shell-v2
```

각 단계는 독립 PR + 기존 전체 QA + 새 Contract QA + Local WSL 검증 후 main에 병합한다.

## 11. Definition of Done

V2 리팩터링 완료는 파일 이름이 바뀐 상태가 아니다. 다음이 충족되어야 한다.

- SOURCE BANK가 런타임에서 mutate되지 않는다.
- 핵심 Domain에 DOM/localStorage 접근이 없다.
- 빈칸이 모든 Content Zone에 동일한 엔진으로 적용된다.
- 사용자 데이터 모듈이 Storage Registry에 등록된다.
- Backup이 Registry 기반으로 자동 구성된다.
- Settings runtime이 하나다.
- Program이 Format/Transform을 ID로 참조한다.
- 전역 함수 wrapper/monkey patch가 제거된다.
- dynamic feature script injection이 제거된다.
- main은 required CI로 보호된다.
- 기존 973 QA + V2 QA + Local WSL 실제 UX가 모두 통과한다.
