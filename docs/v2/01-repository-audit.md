# QTimer Repository Audit — 2026-08-13

기준 main: `5563c3f`

## 1. 결론

QTimer의 문제은행과 QA는 강해졌지만 애플리케이션 구조는 MVP 확장 방식이 누적되어 **기능 추가 비용과 회귀 위험이 빠르게 커지는 상태**다.

현재 문제의 본질은 개별 버그가 아니라 다음 네 가지다.

1. **하나의 개념을 여러 기능이 서로 다른 방식으로 구현**한다.
2. **상태·저장·렌더링의 소유권이 분명하지 않다.**
3. **전역 함수와 DOM을 후행 스크립트가 다시 감싸는 방식**으로 기능을 확장한다.
4. 문서의 장기 모델과 실제 런타임 구조 사이의 간격이 커졌다.

따라서 신규 기능을 계속 붙이는 것보다 V2 경계를 먼저 세우는 것이 비용이 낮다.

---

## 2. P0 — 데이터 관리 누락 위험

### 발견

현재 `data-portability.js`는 다음 사용자 데이터만 명시적으로 백업한다.

- main learning state
- settings
- focus quick settings
- Dapchigi programs

그러나 Live Format Editor가 추가한 `qtimer-dapchigi-formats-v1`은 전체 Backup payload에 포함되지 않는다.

### 원인

Backup이 사용자 데이터 모듈을 자동 탐색하지 않고 **저장키를 파일에 직접 하드코딩**한다.

새 기능이 생길 때마다 개발자가 Backup 코드를 수동 수정해야 하므로 누락은 구조적으로 반복될 수 있다.

### V2 해결

`StorageRegistry`에 모든 지속 데이터 모듈을 등록한다.

```text
Registry
 ├─ state
 ├─ preferences
 ├─ focusPreferences (legacy)
 ├─ programs
 ├─ formats
 ├─ transforms
 └─ notes
```

Backup/Restore는 Registry를 열거하여 자동 생성한다.

---

## 3. P0/P1 — Cloze 개념 모델 불일치

### 현재 구현 A — Dapchigi mark

Dapchigi `mark` 단계는 선택지에만 빈칸을 만든다.

- 긍정형 문제: 정답 선택지
- 부정형 문제: 정답을 제외한 선택지

### 현재 구현 B — Live Format Editor blank

Live Format Editor의 `blank` 양식은 문제 본문(`questionText`)에서 핵심 후보를 찾아 빈칸을 만든다.

### 문제

동일한 “빈칸” 개념이 서로 다른 위치와 규칙으로 두 번 구현되어 있다.

또한 현재 Question 런타임 모델에는 독립적인 `passage/지문` Zone이 없다. 따라서 사용자가 원하는 다음 경우를 하나의 체계로 표현할 수 없다.

- 문제 본문의 특정 문구 빈칸
- 지문의 특정 문구 빈칸
- 선택지의 특정 문구 빈칸
- FINAL KEY의 특정 문구 빈칸
- 문제집 해설의 특정 문구 빈칸
- 여러 영역 동시 빈칸

### V2 해결

`blank`를 Question Type 또는 Format Type에서 제거하고 **Cloze Transform**으로 정의한다.

```text
Question Content
 ├─ stem
 ├─ passage
 ├─ choices[]
 ├─ finalKey
 └─ explanation

        +

Cloze Transform
 ├─ target zone
 ├─ selected text/range
 ├─ placeholder
 ├─ reveal policy
 └─ accepted answers
```

SOURCE BANK는 수정하지 않고 학습 화면 View Model만 파생한다.

---

## 4. P1 — Script Order가 사실상의 Dependency Injection

`index.html`은 `app.js` 이후 다수 데이터 스크립트와 기능 스크립트를 순서대로 로드한다.

후행 스크립트가 앞선 전역 변수/함수의 존재를 가정한다.

예:

```text
app.js
 → enhancements.js
 → question data scripts...
 → state-sync.js
 → data-portability.js
 → ui-quality-fixes.js
 → settings-v2.js
```

이후 `ui-quality-fixes.js`와 style enhancement 계층에서 Dapchigi, Settings v3, Focus Reading, Program Builder, Format Editor를 다시 동적으로 로드한다.

### 위험

- 로딩 순서가 변경되면 기능이 조용히 실패할 수 있다.
- 각 모듈의 입력/출력 계약이 코드상 드러나지 않는다.
- 테스트가 브라우저 전체 부팅에 지나치게 의존한다.
- CSP(Content Security Policy) 적용이 어려워진다.

### V2 해결

명시적 ES Module 경계와 단방향 의존성을 사용한다.

```text
UI → Application → Domain → Data
```

Domain은 DOM/localStorage를 모른다.

---

## 5. P1 — Global Monkey Patching

현재 일부 파일은 기존 전역 함수를 재할당하거나 wrapper로 감싼다.

확인된 사례:

- `undoLastAttempt` 재할당
- `renderQuestion` wrapper
- `renderDashboardV01` wrapper
- `updateProgress` wrapper
- Settings v3 bootstrap용 전역 임시 값

### 문제

A 기능이 B의 내부 구현을 알아야 하므로 변경 영향 범위를 예측하기 어렵다.

### V2 해결

Event와 Application Service를 사용한다.

```text
study/question-rendered
study/attempt-recorded
dapchigi/stage-changed
preferences/changed
storage/imported
```

기능은 다른 기능의 함수를 덮어쓰지 않고 이벤트 또는 명시적 서비스 계약을 호출한다.

---

## 6. P1 — Settings v1/v2/v3 Runtime Layering

현재 v3는 v2를 기반 엔진으로 사용하면서 같은 `qtimer-settings-v2` 키에 v3 데이터를 저장한다.

v2가 먼저 데이터를 normalize/persist할 수 있기 때문에 별도 bootstrap 보존 로직까지 존재한다.

### V2 해결

런타임 Settings 구현은 하나만 유지한다.

```text
Preferences schemaVersion: 4
```

구버전은 런타임 계층이 아니라 **migration 함수**로만 남긴다.

```text
v1 -> v2 -> v3 -> v4 canonical
```

---

## 7. P1 — Source / Domain / UI 결합

`app.js`에는 다음 책임이 함께 존재한다.

- 일부 문제 데이터
- localStorage
- 학습 상태
- 타이머
- 채점
- DOM 렌더링
- 이벤트 바인딩

또 다른 데이터 스크립트는 실행 시 `QUESTIONS`를 변경한다.
`state-sync.js`는 런타임에서 문제은행을 검사한 뒤 필요하면 `QUESTIONS.splice()`로 정규화한다.

### V2 해결

```text
Source Data → Repository → Domain Model → Application State → View Model → Renderer
```

SOURCE BANK 배열은 앱 실행 중 수정하지 않는다.

---

## 8. P1 — Program Builder가 레거시 Dapchigi 단계에 결합

Program Builder Step은 현재 다음을 직접 사용한다.

```text
preview / question / mark / reveal / rate
```

특히 `mark` 설명 자체가 “선택지의 회상용 빈칸”으로 고정되어 있다.

### V2 해결

Program은 화면 의미를 직접 소유하지 않는다.

```text
show(formatId)
transform(transformId)
reveal(target)
repeat(count)
rate(scale)
```

즉:

- Format Engine = 무엇을 어디에 보일지
- Transform Engine = 내용을 어떻게 변환할지
- Program Engine = 어떤 순서로 실행할지

로 책임을 나눈다.

---

## 9. P1 — Backup Import 검증 수준

현재 Backup import는 최상위 object/array 형태를 검사하지만 모든 내부 엔터티를 엄격한 schema로 검증하지 않는다.

또한 여러 localStorage key를 순차 변경하므로 중간 실패 시 원자성이 없다.

### V2 해결

1. 파일 크기 제한
2. JSON parse
3. Backup envelope 검증
4. 모든 Module schema 사전 검증
5. 모든 migration 사전 수행
6. staging snapshot 생성
7. commit
8. 실패 시 rollback

**한 모듈이라도 실패하면 아무 데이터도 교체하지 않는다.**

---

## 10. P2 — 문서/런타임 Drift

예:

- README는 여전히 `v0.1 MVP` 중심이다.
- README 로컬 실행 예는 `work/data-ingest` 브랜치를 기준으로 한다.
- 과거 문서는 Cloze를 Question Type으로 정의한다.
- 현재 실제 기능은 Dapchigi/Focus/Program/Format까지 확장됐다.

### V2 해결

`docs/v2/00-master-index.md`를 현재 제품 구조의 단일 진입점으로 삼는다.

기존 문서는 삭제하지 않고 `legacy/reference` 성격으로 유지하고, V2 문서에서 superseded 여부를 명시한다.

---

## 11. P2 — Repository Governance

현재 `main` branch protection이 활성화되어 있지 않다.

### 권장 정책

- PR required
- QTimer QA required
- QTimer V2 Foundation QA required(V2 작업 기간)
- force push 금지
- branch deletion 금지
- 가능하면 최소 1개 status check 성공 후 merge

1인 개발 저장소이므로 필수 인적 review까지 강제할 필요는 없지만, **CI를 우회한 main 변경은 차단**하는 편이 좋다.

---

## 12. 현재 강점 — 반드시 보존

리팩터링 과정에서 다음은 손대지 않는 기준선이다.

- 검증된 973문항
- Duplicate ID 0
- Invalid record 0
- Structural QA 0
- Unresolved answer risk 0
- 기존 Study smoke
- Settings smoke
- Focus Study smoke
- Semantic marking smoke
- Program Builder smoke
- Live Format Editor smoke
- Assisted Dapchigi attempt와 일반 Attempt 분리 원칙

---

## 13. 리팩터링 우선순위

| 우선순위 | 영역 | 조치 |
|---|---|---|
| P0 | 사용자 데이터 | Storage Registry + Backup V2 |
| P0 | Cloze | Content Zone + Transform으로 재설계 |
| P1 | Domain | SOURCE BANK Adapter + immutable model |
| P1 | Dapchigi | DOM과 분리된 state machine |
| P1 | Program | Format/Transform 참조 구조 |
| P1 | Settings | 단일 canonical Preferences |
| P1 | Runtime | 전역 함수 patch 제거 |
| P2 | UI | Shell/Renderer 컴포넌트화 |
| P2 | Security | import validation/CSP 준비/URL policy |
| P2 | Docs | README와 V2 문서 동기화 |

## 14. 리팩터링 금지사항

- 973 SOURCE BANK를 UI 리팩터링과 함께 이동/수정하지 않는다.
- 기존 localStorage key를 즉시 삭제하지 않는다.
- 기존 사용자 데이터를 migration 없이 재설정하지 않는다.
- React 등 프레임워크 전환을 아키텍처 정리와 동시에 수행하지 않는다.
- V2가 준비되기 전에 main에서 레거시 기능을 제거하지 않는다.
- Vercel Preview를 개발 검증 수단으로 사용하지 않는다.
