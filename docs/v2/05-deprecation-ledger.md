# QTimer V2 Deprecation Ledger

기준 측정: 2026-08-13, PR #18 Foundation branch

## 1. 자동 측정된 Legacy Architecture Debt Baseline

`scripts/v2-architecture-audit.mjs` 기준:

| Metric | Baseline |
|---|---:|
| Legacy runtime JS/MJS files measured | 106 |
| `innerHTML =` writes | 36 |
| direct `localStorage` access | 42 |
| dynamic `<script>` creation | 9 |
| `globalThis` access | 37 |
| `document` access | 478 |
| `window` access | 23 |

이 수치는 보안 취약점 개수를 뜻하지 않는다. **아키텍처 결합도와 중앙화되지 않은 브라우저 접근의 리팩터링 지표**다.

V2 Foundation의 목표는 무조건 DOM 접근을 0으로 만드는 것이 아니다. UI/Renderer는 DOM을 사용할 수 있다. 대신 다음 경계를 지킨다.

- Domain DOM access = 0
- Domain storage access = 0
- pure Data contract browser global access = 0
- V2 direct `innerHTML =` = 0
- V2 dynamic feature script injection = 0
- V2 eval / Function constructor = 0

## 2. 제거 대상 Ledger

### L-001 `app.js` monolith

현재 책임:
- 초기 question data
- state
- persistence
- timer
- scoring
- renderer
- DOM events

V2 목적지:
- question repository
- study session domain
- attempt repository
- application commands
- renderer

제거 조건:
- Study parity E2E
- timer parity
- undo parity
- local migration

### L-002 `enhancements.js`

현재 책임:
- question append
- dashboard injection
- 추가 UI

V2 목적지:
- immutable repository load
- dashboard feature

제거 조건:
- 973 bank loader parity
- dashboard V2 parity

### L-003 `state-sync.js`

현재 책임:
- runtime question normalization
- global bank mutation
- progress/dashboard wrappers

V2 목적지:
- build/QA-time bank validation
- immutable repository
- progress selectors/events

제거 조건:
- runtime mutation 0
- bank QA remains 973/973

### L-004 `ui-quality-fixes.js`

현재 책임:
- global function replacement
- capture listener compatibility
- dynamic feature loading
- settings bootstrap compatibility

V2 목적지:
- command/event bus
- static module bootstrap
- Preferences migration

제거 조건:
- dynamic script creation 0
- global wrapper parity tests

### L-005 Settings v1/v2/v3 runtime layering

V2 목적지:
- Preferences V4 canonical model
- v1/v2/v3 migration functions only

제거 조건:
- migration fixtures
- Settings browser parity
- full backup migration

### L-006 Dapchigi `mark`

현재 의미:
- 선택지 빈칸 단계

V2 목적지:
- ClozeTransform compatibility adapter

제거 조건:
- choice cloze parity
- stem/passage/explanation cloze support
- Program V2 migration

### L-007 Live Format `type=blank`

현재 의미:
- stem keyword blank Preview

V2 목적지:
- Format contains layout only
- ClozeTransform contains blank targets

제거 조건:
- Study Designer V2
- legacy format migration maps blank format to question format + generated transform

### L-008 Program Builder v1 stage coupling

현재 block:
- preview
- question
- mark
- reveal
- rate

V2 block:
- show-format
- apply-transform
- clear-transforms
- reveal
- repeat
- rate

제거 조건:
- v1 program migration
- runtime parity
- invalid loop safety parity

### L-009 `data-portability.js`

현재 문제:
- persistence module list hardcoded
- Live Format data omission
- partial-write risk

V2 목적지:
- StorageRegistry
- Backup V2
- BackupTransaction

제거 조건:
- v1 backup migration
- v2 backup export/import
- rollback browser E2E

## 3. 목표 추적

각 리팩터링 PR 종료 시 Architecture Audit 수치를 PR 본문에 기록한다.

예시:

```text
innerHTML writes        36 -> 31
localStorage access     42 -> 35
dynamic scripts          9 ->  6
globalThis              37 -> 28
```

단, 단순 숫자 감소를 위해 코드를 한 파일에 몰아넣지 않는다. 최종 판단 기준은 **책임 경계 + Contract QA + 사용자 동작 parity**다.

## 4. 삭제 정책

레거시 파일은 다음 네 조건을 모두 충족하기 전 삭제하지 않는다.

1. V2 replacement가 존재
2. migration이 존재
3. 기존+V2 QA green
4. Local WSL 실제 사용자 흐름 확인

## 5. Foundation 현재 상태

V2 Foundation은 다음 계약을 코드로 보유한다.

- immutable Content Zone model
- multi-zone Cloze Transform
- Format model without blank type
- renderer-neutral Study View
- Dapchigi round/A+X engine
- generic Program compiler
- Command/Event bus
- Storage Registry
- Backup transaction + rollback/recovery
- content escape + HTTPS URL policy
- Architecture Gate

이 단계에서는 레거시 runtime을 제거하지 않는다. 다음 단계부터 하나씩 교체한다.
