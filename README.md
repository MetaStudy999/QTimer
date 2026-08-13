# QTimer

QTimer는 **검증된 기출문제 → 빠른 회독/답치기 → 취약 압축 → 복습 → 시험 시뮬레이션**을 하나의 학습 루프로 연결하는 브라우저 기반 시험 학습 도구입니다.

현재 1차 적용 분야는 **정보처리기사 필기**입니다.

## Stable Baseline

현재 안정판은 다음 문제은행 기준선을 유지합니다.

| 과목 | 문항 |
|---|---:|
| 1과목 소프트웨어 설계 | 221 |
| 2과목 소프트웨어 개발 | 158 |
| 3과목 데이터베이스 구축 | 191 |
| 4과목 프로그래밍 언어 활용 | 211 |
| 5과목 정보시스템 구축관리 | 192 |
| **전체** | **973** |

Release baseline:

```text
전체 문제       973 / 973
Duplicate IDs   0
Invalid records 0
Script errors   0
Structural      0
Unresolved risk 0
P0 / P1 / P2    0 / 0 / 0
```

SOURCE BANK는 UI/학습기능 리팩터링과 분리하여 관리합니다.

---

# 현재 주요 기능

## 학습

- 빠른 회독
- 일반 학습/문제풀이
- 취약 집중
- 답치기(Dapchigi)
- O / A / X 자기평가
- 답치기 Focus Reading
- 문제/정답/핵심어 표시 설정
- 사용자 정의 답치기 Program Builder
- 실제 현재 문제 기반 Live Format Preview

## 시험

- CBT 형태 문제풀이
- 답안 상태 동기화
- 타이머/제출/결과 처리

## 데이터

- 브라우저 로컬 학습 상태
- 환경설정
- 답치기 프로그램
- 답치기 양식
- 전체 백업/복원

현재 저장 구조는 V2 리팩터링에서 중앙 Registry 방식으로 전환 중입니다.

---

# QTimer V2 대규모 리팩터링

현재 기능을 더 붙이는 방식 대신 **기획 · UX/UI · Domain · Data · Security · QA를 하나의 제품 구조로 다시 정리**하고 있습니다.

V2 진입 문서:

- [`docs/v2/00-master-index.md`](docs/v2/00-master-index.md) — 전체 목차/제품 구조
- [`docs/v2/01-repository-audit.md`](docs/v2/01-repository-audit.md) — 현재 구조 감사
- [`docs/v2/02-architecture-and-migration.md`](docs/v2/02-architecture-and-migration.md) — 목표 아키텍처/마이그레이션
- [`docs/v2/03-security-and-quality.md`](docs/v2/03-security-and-quality.md) — 보안/품질 기준
- [`docs/v2/04-feature-data-ownership.md`](docs/v2/04-feature-data-ownership.md) — 기능/UI/데이터 소유권
- [`docs/v2/05-deprecation-ledger.md`](docs/v2/05-deprecation-ledger.md) — 제거 대상/구조 부채 추적
- [`docs/v2/06-study-designer-v2.md`](docs/v2/06-study-designer-v2.md) — Live Preview/빈칸/양식/프로그램 UX

## V2 핵심 원칙

```text
Verified SOURCE BANK (immutable)
          │
          ▼
   Question Domain Model
          │
     ┌────┴────┐
     ▼         ▼
 Format      Transform
     │         │
     └────┬────┘
          ▼
     Study View
          │
          ▼
 Shared Renderer
          │
   ┌──────┼──────┐
   ▼      ▼      ▼
 Learn  Review  Exam
```

### 빈칸(Cloze)

V2에서 빈칸은 더 이상 `빈칸문제`라는 별도 Format/Question Type이 아닙니다.

하나의 Cloze Transform을 다음 영역에 적용할 수 있습니다.

```text
stem         문제 본문
passage      지문 / 보기 / 자료
choice[n]    선택지
answer       정답 표현
finalKey     핵심
explanation  해설
note         사용자 메모
```

기본 UX는 **Live Preview에서 실제 텍스트를 선택 → 빈칸 만들기**입니다.
자동 핵심어 추출은 보조 기능으로만 사용합니다.

### 책임 분리

```text
Format Engine    무엇을 어디에 배치할 것인가
Transform Engine 내용을 어떻게 변환할 것인가
Program Engine   어떤 순서/반복으로 실행할 것인가
```

---

# V2 Source Layout

```text
src/v2/
├─ app/        Command / Event / Application orchestration
├─ domain/     Question / Cloze / Format / StudyView / Dapchigi / Program / Preferences
├─ data/       Storage Registry / Backup / Migration
├─ features/   화면별 Application feature (순차 전환)
├─ ui/         Shared Renderer / Shell / Components (순차 전환)
└─ security/   Content / URL / Import policy
```

Domain은 DOM과 `localStorage`를 직접 사용하지 않습니다.

---

# 개발 원칙

QTimer는 **Strangler Refactoring** 방식으로 전환합니다.

- 안정판 `main`을 항상 실행 가능하게 유지
- 검증된 973 SOURCE BANK는 UI 리팩터링과 함께 수정하지 않음
- 새 V2 계약을 기존 런타임 옆에 먼저 구축
- 기능 단위로 V2로 교체
- 사용자 데이터 migration 후에만 legacy 제거
- 전역 함수 monkey patch/dynamic feature script injection을 단계적으로 제거

기본 흐름:

```text
feature/refactor branch
        ↓
implementation
        ↓
Pull Request
        ↓
GitHub Actions
  ├─ QTimer QA
  └─ QTimer V2 QA
        ↓
main merge
        ↓
Local WSL 실제 UI/기능 확인
        ↓
다음 slice
```

중간 개발·검증에 Vercel을 사용하지 않습니다. **Vercel은 최종 Production 배포 시점에만 사용**합니다.

자세한 정책:

- [`docs/implementation/development-and-deployment-policy.md`](docs/implementation/development-and-deployment-policy.md)

---

# 로컬 실행 — Windows 11 Pro + WSL2 Ubuntu 24.04

안정판 확인:

```bash
cd ~/projects/QTimer
git fetch origin
git switch main
git pull --ff-only origin main
git rev-parse --short HEAD
bash scripts/check-wsl.sh
```

정적 서버:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Windows 브라우저:

```text
http://localhost:8080
```

브라우저 수정 확인 시 `Ctrl + F5`로 강력 새로고침합니다.

---

# QA

## Existing QTimer Gates

```bash
node scripts/audit-question-bank.mjs
node scripts/qa-question-bank.mjs
node scripts/audit-answer-risk.mjs --summary
```

GitHub Actions에서는 추가로 다음 Browser smoke를 실행합니다.

- Study flow
- Settings flow
- Focus Study
- Semantic choice marking
- Dapchigi Program Builder
- Dapchigi Live Format Editor

## V2 Foundation Gates

V2 브랜치에서는 다음 계약을 독립적으로 검증합니다.

- Architecture boundary
- Content Zone / immutable QuestionModel
- Selection-first Cloze authoring
- Format + Transform → StudyView
- Dapchigi round / A+X compression
- Program compiler
- Preferences v1/v2/v3 → V4 migration
- Command/Event bus
- Legacy storage inventory
- Canonical persistent module registry
- Conservative user-data migration
- Backup validation / rollback / crash recovery
- Content escaping / HTTPS URL policy

---

# 데이터 소유권

V2 canonical persistent modules:

```text
state
preferences
formats
transforms
programs
notes
```

새로운 지속 데이터 기능은 Storage Registry에 등록되지 않으면 제품 기능으로 완료된 것으로 간주하지 않습니다.

Backup V2는 Registry를 열거하므로 신규 모듈이 백업에서 조용히 빠지는 문제를 방지합니다.

---

# 보안 기준

QTimer는 로컬 우선 정적 앱이므로 현재 우선 보호 대상은 다음입니다.

- 검증된 문제 원문/정답 무결성
- 학습 Attempt/OAX 기록
- 사용자 양식/프로그램/Transform
- 환경설정
- Backup/Restore

V2 원칙:

- untrusted text는 escape 또는 `textContent`
- `javascript:` / 위험 protocol 차단
- 외부 링크 HTTPS 정책
- Backup 크기/깊이/모듈 수 제한
- Import 전체 검증 후 commit
- 실패 시 rollback
- SOURCE BANK runtime mutation 금지
- `eval` / `new Function` 금지
- dynamic script injection 제거 후 CSP 도입

---

# 리팩터링 진행 순서

```text
0. Audit / Baseline Freeze
1. V2 Foundation
2. Storage + Backup V2 Runtime Bridge
3. Shared Study Renderer
4. Study Designer / Multi-zone Cloze
5. Dapchigi V2
6. Program V2
7. Preferences V4 Runtime
8. Dashboard / Learn / Review / Exam Shell
9. Legacy Removal
10. CSP / Security Hardening
```

각 단계는 독립 PR과 QA를 통과한 후 다음 단계로 이동합니다.

---

# Legacy 문서

`docs/spec/product-spec-v0.1.md`, 과거 UI/Data 문서 등은 구현 역사를 보존하기 위해 당장 삭제하지 않습니다.

현재 V2 설계와 충돌할 경우 **`docs/v2/` 문서를 우선 기준**으로 사용합니다.
