# QTimer V2 — Transition Backup Compatibility Snapshot

기준일: 2026-08-13
상태: Storage V2 안전성 보강

## 1. 문제

Storage V2의 canonical Format/Program schema는 현재 실행 중인 V1 Format Editor / Program Builder schema와 다르다.

따라서 순수 V2 Backup을 현재 V1 화면에 그대로 투영하면 schema 충돌이 생길 수 있어 V2 Runtime Bridge는 기본적으로 Format/Program 활성화를 `deferred` 처리한다.

하지만 **현재 QTimer V1 화면에서 사용자가 직접 만든 V2 백업**까지 이 규칙만 적용하면 다음 UX 문제가 생긴다.

```text
현재 V1에서 내 양식/프로그램 사용
→ 백업
→ 값 변경 또는 다른 장치 이동
→ 방금 만든 백업 복원
→ canonical V2에는 데이터가 있으나 현재 V1 UI에는 즉시 안 보임
```

데이터 손실은 아니지만 사용자가 기대하는 `백업 = 지금 상태의 완전 복원`을 충족하지 못한다.

---

## 2. 해결 원칙

Canonical V2를 장기 source of truth로 유지하면서 전환 기간에만 **V1 Compatibility Snapshot**을 Backup V2 envelope에 병기한다.

```text
qtimer-backup v2
├─ modules
│  ├─ state
│  ├─ preferences
│  ├─ formats
│  ├─ transforms
│  ├─ programs
│  └─ notes
│
└─ compatibility
   └─ legacyV1
      ├─ format: qtimer-v1-runtime-compatibility
      ├─ version: 1
      ├─ formats
      └─ programs
```

Compatibility Snapshot은 canonical module이 아니다.

- 장기 데이터 모델이 아니다.
- Storage Registry의 exportable module 개수를 늘리지 않는다.
- V1 Format/Program runtime이 제거되면 함께 제거한다.

---

## 3. 왜 State / Preferences는 Snapshot에 중복 저장하지 않는가

State와 Preferences는 canonical V2에서 현재 V1 schema로 **안전하게 역투영할 수 있다**.

```text
V2 state
→ projectStateV2ToLegacy()
→ qtimer-v0.1-local

Preferences V4
→ preferencesV4ToLegacyV3()
→ qtimer-settings-v2

Preferences V4 keyword
→ preferencesV4ToLegacyFocusV1()
→ qtimer-focus-quick-settings-v1
```

따라서 중복 snapshot이 필요 없다.

반면 Format/Program은 legacy-only 정보가 일부 존재한다.

예:
- Format `previewDevice`
- 기존 `type=blank`, `blankCount`
- Program `enabled`
- legacy block sequence

Canonical migration은 의미를 보존하기 위해 구조를 변환하거나 migration-required 상태를 만들기 때문에 현재 V1 schema로 완전한 역변환을 보장할 수 없다.

---

## 4. Export 규칙

현재 V1 런타임에서 V2 Backup을 생성할 때:

1. V1 Format/Program을 canonical V2로 conservative migration한다.
2. canonical V2 modules를 정상 저장한다.
3. 동시에 현재 V1 Format/Program을 **bounded normalization**한다.
4. 정규화된 결과만 `compatibility.legacyV1`에 기록한다.

따라서 하나의 백업에 두 가지 목적이 함께 존재한다.

- canonical modules: 장기 V2 데이터
- compatibility snapshot: 현재 V1에서 즉시 복구하기 위한 임시 표현

---

## 5. Import 규칙

### A. 현재 QTimer가 만든 transition V2 Backup

`compatibility.legacyV1`이 유효하면:

- canonical Format/Program → V2 key
- compatibility Format/Program → 현재 V1 key
- 둘을 **같은 transaction**에서 commit

따라서 현재 화면에서도 즉시 복원된다.

### B. 미래의 pure V2 Backup

Compatibility Snapshot이 없으면:

- canonical Format/Program은 V2 key에 정상 복원
- 현재 V1 Format/Program key는 변경하지 않음
- `deferredModules`에 formats/programs 기록

V1에 incompatible schema를 억지로 넣지 않는다.

### C. 기존 `qtimer-backup v1`

Legacy Format/Program이 파일에 존재하면 bounded normalization 후 current V1 key와 canonical V2 key를 동시에 복원한다.

---

## 6. Untrusted Backup 보안

Compatibility Snapshot은 백업 파일에서 왔다는 이유로 신뢰하지 않는다.

Import 시 다시 제한한다.

### Format
- 최대 30개
- type allowlist
- layout allowlist
- preview device allowlist
- explanation/answer mode allowlist
- 이름 최대 40자
- ID 최대 120자
- ratio 35–80
- blankCount 1–4

### Program
- 최대 20개
- program당 block 최대 40개
- step type allowlist
- repeat 2–20
- 이름 최대 40자
- ID 최대 120자

악의적/손상 값은 허용 범위로 normalize하거나 구조적으로 사용할 수 없으면 import를 거부한다.

---

## 7. Transaction / Undo

Compatibility write도 canonical write와 동일한 `combinedPlan`에 들어간다.

```text
snapshot
→ staging
→ canonical writes
→ compatibility writes
→ success
```

어느 한 write라도 실패하면 전체 snapshot으로 rollback한다.

`복원취소`도 canonical + V1 Format/Program을 함께 pre-import 상태로 되돌린다.

---

## 8. Cloze 의미 보존

Compatibility Snapshot은 현재 V1 화면의 **즉시 복구**를 위한 것이지, legacy `blankCount` 또는 `mark`를 정확한 V2 Cloze target으로 인정하는 장치가 아니다.

Canonical V2에서는 기존 원칙을 그대로 유지한다.

- legacy blank → `requiresTransformAuthoring`
- legacy mark → unresolved/migration-required Cloze Transform
- exact range를 임의 생성하지 않음

즉 같은 Backup 안에서:

```text
V1 compatibility
→ 기존 UI를 그대로 재현

V2 canonical
→ 모호한 Cloze 의미는 검토 필요 상태로 보존
```

두 책임을 분리한다.

---

## 9. 제거 조건

다음 조건을 모두 만족하면 Compatibility Snapshot을 폐기할 수 있다.

1. Shared Study Renderer V2가 실제 학습 화면을 소유
2. Format Editor V2가 canonical Format을 직접 사용
3. Program Builder V2가 canonical Program을 직접 사용
4. Transform/Cloze Editor V2가 활성화
5. 기존 Format/Program v1 저장키 migration이 완료
6. Local WSL + Backup restore regression 확인

그 시점부터 Backup은 canonical V2 modules만으로 완전 복원이 가능하다.
