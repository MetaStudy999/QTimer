# QTimer V2 — Storage / Backup Runtime Bridge

기준일: 2026-08-13
상태: Phase 2 구현
브랜치: `refactor/storage-v2`
기준 Foundation main: `72e9beeb`

## 1. 목적

Storage V2의 목적은 브라우저에 흩어진 V1 저장키를 한 번에 삭제하는 것이 아니다.

현재 학습 화면을 안정적으로 유지하면서 사용자 데이터를 canonical V2 구조로 병행 저장하고, 백업·복원을 먼저 V2 계약으로 전환한다.

전환 전략은 **Strangler + Shadow Canonical Storage**다.

```text
현재 V1 Runtime
    │
    ├─ qtimer-v0.1-local
    ├─ qtimer-settings-v2
    ├─ focus quick settings
    ├─ dapchigi programs
    └─ dapchigi formats
            │
            ▼ migration / validation
      Canonical V2 Registry
            │
    ┌───────┼────────────────────────┐
    ▼       ▼        ▼       ▼       ▼
  state preferences formats transforms programs notes
            │
            ▼
       Backup V2 JSON
```

SOURCE BANK는 이 저장소 전환의 대상이 아니다.

---

## 2. Canonical persistent modules

Storage Registry가 소유하는 지속 데이터는 다음 6개다.

| Module | Canonical key | Schema | 의미 |
|---|---|---:|---|
| state | `qtimer.v2.state` | 2 | 일반 Attempt, Dapchigi O/A/X, 학습상태 |
| preferences | `qtimer.v2.preferences` | 4 | 문제/답/핵심어 표시, 화면배율, 접근성 |
| formats | `qtimer.v2.formats` | 2 | 학습 View 구조/배치 |
| transforms | `qtimer.v2.transforms` | 2 | Cloze 등 콘텐츠 변환 |
| programs | `qtimer.v2.programs` | 2 | Format/Transform 실행 순서 |
| notes | `qtimer.v2.notes` | 1 | 문제별 사용자 메모 |

Transaction metadata는 별도다.

- `qtimer.v2.import-staging`
- `qtimer.v2.preimport-snapshot`
- `qtimer.v2.migration-report`

`migration-report`는 진단용 메타데이터이며 사용자 학습 데이터 module은 아니다.

---

## 3. 현재 V1과 V2의 책임

### 현재 단계에서 V1이 계속 소유하는 것

실제 브라우저 학습 UI는 아직 기존 런타임을 사용한다.

- 현재 일반 학습 state
- 기존 Settings UI
- Focus Quick Settings UI
- Dapchigi Program Builder v1
- Live Format Editor v1

### V2가 소유하기 시작한 것

- canonical 데이터 검증
- canonical shadow copy
- Backup V2 export
- v1/v2 Backup import
- 전체 사전 검증
- snapshot/staging/commit/rollback
- interrupted-import recovery
- 복원취소
- migration warning / deferred module report

즉, **UI 런타임 교체보다 데이터 계약을 먼저 안정화**한다.

---

## 4. Backup V2 export

사용자가 `백업`을 누르면 현재 V1의 최신 값을 수집한다.

```text
state
Settings v3
Focus Quick Settings
Program v1
Format v1
        │
        ▼
conservative migration
        │
        ▼
canonical V2 shadow refresh
        │
        ▼
Registry 6 modules export
```

백업 파일은 다음 envelope를 사용한다.

```text
format: qtimer-backup
version: 2
exportedAt
appVersion
questionBankVersion
modules
```

새 persistent feature는 Registry에 등록되어야 Backup에 포함될 수 있다.

---

## 5. Import compatibility

| 입력 | 지원 | 현재 V1 UI 투영 |
|---|---|---|
| `qtimer-backup` v1 | 지원 | 가능한 legacy 데이터는 그대로 복원 |
| `qtimer-backup` v2 | 지원 | state/preferences는 호환 투영 |
| V2 formats/programs | 보존 | V2 런타임 전까지 활성화 보류 |
| V2 transforms | 보존 | Study Designer/Renderer V2에서 사용 |
| V2 notes | 보존 | Notes V2 UI에서 사용 |

### 왜 V2 Format/Program을 V1에 강제로 쓰지 않는가

V1과 V2 schema 의미가 다르기 때문이다.

V2 데이터를 V1 저장키에 억지로 기록하면 현재 실행 중인 UI가 잘못 읽을 수 있다. 따라서 canonical V2에는 정상 복원하되 현재 V1 UI에는 `deferred` 상태로 둔다.

이것은 데이터 손실이 아니라 **호환 가능한 런타임이 도입될 때까지 활성화를 미루는 것**이다.

---

## 6. Cloze 관련 보수적 migration

기존 `blank` Format은 `blankCount`만 저장했고 실제 빈칸 위치를 저장하지 않았다.

기존 Program의 `mark`도 선택지 중 어떤 정확한 문자열 range가 Cloze target인지 저장하지 않았다.

따라서 V2 migration은 임의 위치를 만들지 않는다.

```text
legacy blank Format
→ Format 구조는 이관
→ requiresTransformAuthoring = true
→ Cloze target 재지정 필요

legacy mark Program
→ apply-transform placeholder 참조
→ migrationRequired = true
→ 사용자 검토 필요
```

정확하지 않은 데이터를 자동으로 그럴듯하게 만드는 것보다 검토 대상으로 남기는 것을 우선한다.

---

## 7. Preferences V4 통합

Preferences V4는 다음 표시 설정을 하나의 canonical model로 보존한다.

```text
presentation
 ├─ question
 ├─ answer
 └─ keyword

display
accessibility
interaction
```

`keyword`에는 기존 Focus Quick Settings의 다음 값이 포함된다.

- 문제 글꼴 상속 여부
- font family
- font size
- font color
- bold
- highlight mode
- highlight color

따라서 Focus 핵심어 설정도 V2 백업에서 누락되지 않는다.

---

## 8. Import transaction

복원은 다음 순서를 강제한다.

```text
1. 파일 크기 제한
2. JSON parse
3. depth / node / module 수 제한
4. 모든 module schema validation
5. 필요한 migration 전부 수행
6. write plan 완성
7. 현재 값 snapshot
8. staging marker 기록
9. canonical + compatibility key commit
10. 성공 시 staging 제거
```

중간 쓰기 실패 시:

```text
partial write
→ snapshot 전체 복원
→ staging 제거
→ import 실패
```

브라우저가 중간에 종료되어 staging marker가 남으면 다음 부팅에서 snapshot으로 자동 복구한다.

---

## 9. 복원취소

성공한 import 전 상태도 `preimport-snapshot`으로 남긴다.

사용자가 `복원취소`를 누르면 해당 snapshot에 포함된 **모든 touched key**를 되돌린다.

따라서 canonical V2만 되돌아가고 legacy UI 데이터는 남는 식의 반쪽 rollback을 허용하지 않는다.

Storage V2 도입 전의 `*-preimport` snapshot도 fallback으로 계속 읽는다.

---

## 10. Security / corruption policy

- Backup 최대 용량 제한
- JSON 구조 depth/node 제한
- module 수 제한
- unknown module 기본 거부
- 모든 module을 write 전에 검증
- 저장된 canonical JSON이 손상되면 조용히 덮어쓰지 않고 오류 처리
- source data를 migration 과정에서 직접 변경하지 않음
- Backup import 중 `eval`, 동적 code 실행 없음

---

## 11. QA

### Pure contract

- Preferences v1/v2/v3 + Focus v1 → V4
- legacy state → V2 state
- Dapchigi rating 보존
- Format/Program conservative migration
- Registry 6 module export
- Backup v1/v2 import
- transaction rollback
- interrupted import recovery
- explicit import undo
- V1 compatibility projection

### Browser E2E

실제 페이지에서 다음을 검증한다.

```text
기존 V1 state seed
→ 복원 버튼
→ backup v1 파일 선택
→ confirm
→ Storage V2 transaction
→ reload
→ canonical + current V1 state 확인
→ Focus keyword 설정 확인
→ 복원취소
→ original V1 state 복귀 확인
```

---

## 12. 완료 조건

Storage V2 Phase는 다음 조건을 모두 만족해야 완료다.

- V2 Foundation QA green
- Storage V2 pure runtime QA green
- Storage V2 browser portability QA green
- 기존 QTimer QA Gate 1–3 green
- 기존 Study/Settings/Focus/Semantic/Program/Format smoke green
- SOURCE BANK 변경 없음
- PR merge 후 Local WSL 실제 Backup/Restore/Undo 확인

---

## 13. 다음 단계

Storage V2 다음 Slice는 `refactor/study-renderer-v2`다.

목표:

```text
QuestionModel + Format + Transform
              │
              ▼
        StudyViewModel
              │
              ▼
        Shared Renderer
          ├─ Designer Preview
          └─ Actual Study UI
```

Shared Renderer가 안정된 뒤 `Study Designer V2`에서 문제·지문·선택지·핵심·해설의 실제 텍스트를 선택하여 Cloze target을 만들도록 연결한다.
