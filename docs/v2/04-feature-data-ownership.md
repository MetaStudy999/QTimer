# QTimer V2 Feature / UI / Data Ownership

## 1. 목적

기능이 늘어나도 “누가 데이터를 소유하고 누가 화면만 그리는지”가 흐려지지 않도록 책임을 명시한다.

V2의 기본 규칙:

> **UI는 데이터를 소유하지 않는다. Feature는 storage key를 직접 알지 않는다. Domain은 DOM을 알지 않는다. Storage는 학습 규칙을 알지 않는다.**

---

## 2. Top-level Information Architecture

```text
QTimer
├─ Dashboard
├─ Learn
│  ├─ 빠른 회독
│  ├─ 답치기
│  └─ 개념/집중 학습
├─ Review
│  ├─ 오답
│  ├─ 애매
│  ├─ 확실오답
│  └─ 취약 집중
├─ Exam
│  ├─ 단원시험
│  └─ CBT 모의고사
├─ Analytics
│  └─ Roadmap
└─ System
   ├─ Settings
   ├─ Study Designer
   └─ Data / Backup
```

---

## 3. Ownership Matrix

| Feature | UI 책임 | Domain 책임 | 지속 데이터 | 직접 SOURCE BANK 수정 |
|---|---|---|---|---|
| Dashboard | 상태/추천 표시 | Progress/Recommendation | 없음(파생) | 금지 |
| Learn | 문제/선택지/타이머 | Session/Attempt | state/attempt | 금지 |
| Dapchigi | Focus 화면/OAX | Dapchigi state machine | state/program refs | 금지 |
| Review | 취약 항목 탐색 | Weakness evidence | attempt 기반 파생 | 금지 |
| Exam | CBT 답안표 | ExamSession/Attempt | state/attempt | 금지 |
| Study Designer | Live Preview/편집 | Format/Transform model | formats/transforms | 금지 |
| Settings | 표시/동작 설정 | Preferences | preferences | 금지 |
| Data | 백업/복원 UI | Import transaction | registry 전체 | 금지 |
| Answer Verification | 검증/증거 UI | AnswerVerification | overrides/revisions | 원본은 금지 |

---

## 4. 핵심 데이터 소유자

### 4.1 QuestionRepository

소유:
- 검증된 Source Question 조회
- ID lookup
- subject/chapter/content-node query

하지 않음:
- 사용자 Attempt 저장
- 화면 스타일
- 빈칸 생성

### 4.2 StudySessionService

소유:
- 현재 범위
- 현재 position
- timer policy
- session mode

### 4.3 AttemptRepository

소유:
- 일반 풀이 Attempt append
- Dapchigi assisted Attempt append
- schema validation

원칙:
- 과거 Attempt를 UI가 직접 수정하지 않는다.
- 무효화가 필요하면 validity/revision event를 사용한다.

### 4.4 FormatRepository

소유:
- 사용자 Format preset
- layout
- visible zones
- ratio/responsive metadata

소유하지 않음:
- cloze target
- O/A/X
- question progression

### 4.5 TransformRepository

소유:
- Cloze preset
- Highlight preset
- Hide/Reveal preset

Cloze target은 Content Zone과 selector를 참조한다.

### 4.6 ProgramRepository

소유:
- 사용자 프로그램 정의
- block ordering
- repeat/condition
- Format ID / Transform ID reference

소유하지 않음:
- Format 내부 레이아웃
- Transform 내부 target

### 4.7 PreferencesRepository

소유:
- typography
- learning colors
- scale
- accessibility
- keyboard preferences

학습 Attempt와 분리한다.

---

## 5. UI Shell 책임

### Dashboard Shell

표시:
- Next Best Action
- 과목 안정도
- 오늘 학습
- 취약 count

학습 state를 직접 변경하지 않는다. CTA는 Router/Application Command만 발생시킨다.

### Focus Study Shell

표시:
- Study Context Bar
- Content Renderer
- O/A/X Action Dock
- Quick Settings

다음은 숨긴다:
- 불필요한 전역 navigation
- 학습 중 복잡한 analytics

### Review Shell

답치기와 분리한다.

이유:
- 답치기 = 빠른 입력/재인/회상
- Review = 오류 원인 수정/재인출/근거 확인

### Exam Shell

학습용 reveal/해설 API를 제출 전 호출하지 못하도록 Application state에서 차단한다. CSS로 숨기기만 하는 것은 시험 보안 경계가 아니다.

---

## 6. Study Designer V2

사용자에게 다음 3개 개념을 명확히 분리해 보여준다.

```text
[콘텐츠]   무엇을 대상으로 하는가?
  문제 / 지문 / 선택지 / 답 / 핵심 / 해설

[양식]     어디에 어떻게 배치하는가?
  위아래 / 좌우 / 비율 / 보임-숨김

[변환]     콘텐츠를 어떻게 학습용으로 바꾸는가?
  빈칸 / 형광펜 / 숨김 / 공개
```

### 권장 Live Preview UI

```text
┌──────────────── Live Preview ────────────────┬── Inspector ────────┐
│ [문제]                                       │ 콘텐츠              │
│   문제 문장                                  │ ● 문제              │
│                                              │ ○ 지문              │
│ [지문]                                       │ ○ 선택지            │
│   자료/보기                                  │ ○ 핵심              │
│                                              │ ○ 해설              │
│ [선택지]                                     │                     │
│   ① ...                                     │ 변환                │
│   ② ...                                     │ [빈칸 만들기]       │
│                                              │ [형광펜]            │
│ [해설]                                       │ [숨기기]            │
│   ...                                        │                     │
│                                              │ 선택된 빈칸         │
│ Desktop | Tablet | Mobile                    │ target list         │
└──────────────────────────────────────────────┴─────────────────────┘
```

빈칸은 먼저 Zone을 고르고 버튼으로 개수를 정하는 방식보다 **실제 Preview 텍스트를 선택한 뒤 `빈칸 만들기`**가 기본 UX가 되어야 한다.

자동 핵심어 빈칸은 빠른 생성 보조 기능으로 제공하되, 최종 target은 사용자가 확인할 수 있어야 한다.

---

## 7. Application Command Catalog

UI는 다음과 같은 command를 호출한다.

```text
study.start
study.next
study.submit
study.rate
study.undo

format.create
format.update
format.clone

transform.cloze.create
transform.cloze.addTarget
transform.cloze.removeTarget
transform.update

program.create
program.update
program.start
program.stop

preferences.update
backup.export
backup.import.prepare
backup.import.commit
```

Command handler만 Domain/Repository를 조합한다.

---

## 8. Domain Event Catalog

```text
study/session-started
study/question-changed
study/attempt-recorded
study/rating-recorded
study/round-completed

format/changed
transform/changed
program/started
program/step-changed
program/completed

preferences/changed
storage/imported
storage/import-rolled-back
```

기존처럼 `renderQuestion`을 여러 파일이 wrapper로 감싸는 대신, Renderer는 필요한 Event를 구독한다.

---

## 9. Legacy → V2 Responsibility Map

| Legacy | V2 destination |
|---|---|
| `app.js` state/timer/render 혼합 | app + study domain + renderer 분리 |
| `enhancements.js` UI injection | feature/dashboard |
| `state-sync.js` runtime bank mutation | immutable repository validation/build step |
| `ui-quality-fixes.js` monkey patch | explicit commands/events |
| `dapchigi-v1.js` | domain/dapchigi engine + feature UI |
| `mark` stage | ClozeTransform compatibility adapter |
| Focus Quick Settings | Preferences + Quick Settings UI |
| Settings v1/v2/v3 | Preferences V4 + migrations |
| Program Builder v1 | Program Engine V2 |
| Live Format Editor `blank` type | Format V2 + ClozeTransform V2 |
| `data-portability.js` | StorageRegistry + BackupTransaction |

---

## 10. 데이터 변경 규칙

### SOURCE BANK
- immutable
- repository-controlled
- 사용자 기능에서 write 금지

### Attempt
- append-only 기본
- 정답 수정 시 재채점 결과는 revision/reference로 추적

### Preferences / Format / Transform / Program
- mutable user configuration
- 각각 독립 schemaVersion
- Backup Registry 포함

### Derived Data
- weakness/mastery/dashboard metrics
- 가능하면 원시 Attempt에서 재계산 가능해야 함
- 파생값을 유일한 진실로 저장하지 않음

---

## 11. 기능 추가 체크리스트

새 기능은 구현 전에 반드시 다음을 정한다.

1. 이 기능의 Domain owner는 무엇인가?
2. Persistent data가 있는가?
3. 있다면 Storage Registry module id는 무엇인가?
4. schemaVersion과 migration은 무엇인가?
5. Backup에 자동 포함되는가?
6. SOURCE BANK를 변경하지 않는가?
7. 다른 Feature DOM을 직접 조작하지 않는가?
8. 어떤 Command/Event 계약을 사용하는가?
9. Domain test는 무엇인가?
10. Browser E2E는 무엇인가?
11. 접근성/키보드 동작은 무엇인가?
12. 제거할 Legacy 책임은 무엇인가?

이 체크리스트를 통과하지 않은 신규 기능은 V2 main에 추가하지 않는다.
