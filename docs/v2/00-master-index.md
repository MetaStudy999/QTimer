# QTimer V2 — Product Architecture Master Index

기준일: 2026-08-13
상태: 대규모 리팩터링 기준 문서
기준 브랜치: `refactor/qtimer-v2-foundation`
기준 main: `5563c3f`

## 0. 목적

QTimer V2는 현재의 검증된 973문항 문제은행과 학습기록을 보존하면서, MVP 확장 과정에서 누적된 전역 상태·동적 스크립트·호환 패치·분산 저장키를 제품 수준의 구조로 점진 교체한다.

핵심 원칙은 **Big Bang Rewrite가 아니라 Strangler Refactoring**이다.

- SOURCE BANK 973문항은 리팩터링 중 수정하지 않는다.
- 현재 main은 항상 실행 가능한 안정판으로 유지한다.
- V2 코어를 기존 런타임 옆에 만들고 계약 테스트를 통과시킨다.
- 기능을 하나씩 V2 경계로 옮긴 뒤 기존 호환 레이어를 제거한다.
- 사용자 데이터는 삭제하거나 암묵적으로 재해석하지 않는다.

---

# 전체 목차

## Part A — 제품 기획

### 1. Product Vision
1.1 QTimer가 해결하는 문제
1.2 시험 직전 속도훈련과 장기 숙달의 분리
1.3 학습과 평가의 분리
1.4 사용자에게 보여줄 상태와 내부 진단 상태의 분리
1.5 성공 지표와 비목표

### 2. User & Jobs To Be Done
2.1 빠른 회독 사용자
2.2 답치기 사용자
2.3 취약 복습 사용자
2.4 CBT 시험 사용자
2.5 콘텐츠/정답 검증 사용자
2.6 백업·복원·장치 이동 사용자

### 3. Information Architecture
3.1 Dashboard
3.2 Learn
3.3 Review
3.4 Exam
3.5 Analytics / Roadmap
3.6 Settings
3.7 Data & System

---

## Part B — UX / UI Design

### 4. Application Shell
4.1 Dashboard Shell
4.2 Focus Study Shell
4.3 Review Shell
4.4 Exam CBT Shell
4.5 Settings / Data Shell

### 5. Design System
5.1 Design Tokens
5.2 Typography
5.3 System Color vs Learning Color
5.4 Spacing / Radius / Density
5.5 Keyboard-first Interaction
5.6 Responsive Layout
5.7 Accessibility
5.8 Reduced Motion / High Contrast

### 6. Live Study Designer
6.1 실제 문제 기반 Preview
6.2 Content Zone 선택
6.3 Format 편집
6.4 Transform 편집
6.5 Desktop / Tablet / Mobile Preview
6.6 Preview와 실제 학습 렌더러 동일화

---

## Part C — Domain / Data Model

### 7. Question Domain
7.1 Question Identity
7.2 Source Metadata
7.3 Answer Verification
7.4 Immutable SOURCE BANK
7.5 Legacy Question Adapter

### 8. Content Zone Model
8.1 `stem` — 문제 본문
8.2 `passage` — 지문/보기/자료
8.3 `choice[n]` — 선택지
8.4 `answer` — 정답 표현
8.5 `finalKey` — 핵심
8.6 `explanation` — 문제집 해설
8.7 `note` — 사용자 메모

### 9. Transform Pipeline
9.1 Cloze Transform
9.2 Highlight Transform
9.3 Hide / Reveal Transform
9.4 Emphasis Transform
9.5 Transform 순서와 충돌 규칙
9.6 Source immutability

### 10. Cloze System
10.1 빈칸은 Question Type이 아니라 Transform
10.2 문제 본문 빈칸
10.3 지문 빈칸
10.4 선택지 빈칸
10.5 핵심/해설 빈칸
10.6 다중 Zone 동시 빈칸
10.7 수동 텍스트 선택
10.8 자동 핵심어 후보
10.9 정답/허용답안
10.10 힌트 및 Reveal 정책
10.11 학습용 Cloze와 평가용 Cloze 분리

### 11. Study Domain
11.1 StudySession
11.2 Attempt
11.3 Assisted Attempt
11.4 O/A/X Rating
11.5 Weakness Evidence
11.6 Mastery / Retention
11.7 Delayed Retest

---

## Part D — Learning Engines

### 12. Dapchigi Engine
12.1 Stage state machine
12.2 Answer-first flow
12.3 Question-first flow
12.4 Rating
12.5 Round completion
12.6 Weak compression

### 13. Format Engine
13.1 보이는 Zone
13.2 레이아웃
13.3 영역 비율
13.4 Display Profile 참조
13.5 Format은 학습 상태를 변경하지 않음

### 14. Transform Engine
14.1 Cloze
14.2 Highlight
14.3 Reveal
14.4 Transform preset
14.5 Format과 Transform 독립성

### 15. Program Engine
15.1 실행 Block
15.2 Format 참조
15.3 Transform 참조
15.4 Repeat
15.5 Condition
15.6 Rating Gate
15.7 안전한 최대 실행 단계

---

## Part E — Application Architecture

### 16. Runtime Architecture
16.1 Bootstrap
16.2 Router / Workspace
16.3 Application Store
16.4 Event Bus
16.5 Domain Services
16.6 Repositories
16.7 Renderers
16.8 Feature boundaries

### 17. Dependency Rules
17.1 UI → Application → Domain → Data 방향
17.2 Domain에서 DOM 접근 금지
17.3 Domain에서 localStorage 접근 금지
17.4 Feature 간 직접 DOM 조작 금지
17.5 전역 함수 monkey patch 제거
17.6 동적 script injection 제거

### 18. Compatibility Layer
18.1 Legacy global adapter
18.2 Legacy storage migration
18.3 Legacy Dapchigi stage adapter
18.4 Settings v1/v2/v3 migration
18.5 제거 일정과 Deprecation Ledger

---

## Part F — Data Management

### 19. Storage Registry
19.1 State
19.2 Preferences
19.3 Dapchigi Programs
19.4 Formats
19.5 Transforms
19.6 Notes
19.7 Module schemaVersion

### 20. Backup / Restore V2
20.1 Registry 기반 자동 포함
20.2 전체 사전 검증
20.3 Staging
20.4 Snapshot
20.5 Commit / Rollback
20.6 Question-bank version compatibility
20.7 Import size/depth limits

### 21. Migration
21.1 `qtimer-v0.1-local`
21.2 `qtimer-settings-v1/v2`
21.3 Focus Quick Settings
21.4 Dapchigi Programs
21.5 Dapchigi Formats
21.6 V2 canonical keys

---

## Part G — Security / Reliability

### 22. Threat Model
22.1 악성/손상 Backup JSON
22.2 DOM XSS
22.3 URL injection
22.4 Data loss
22.5 Storage corruption
22.6 Supply-chain risk
22.7 GitHub governance

### 23. Security Controls
23.1 HTML escaping / textContent 우선
23.2 URL protocol allowlist
23.3 Import schema validation
23.4 Size / count / depth limit
23.5 No eval / no Function constructor
23.6 CSP 도입 준비
23.7 최소 dependency
23.8 Branch protection

### 24. Reliability
24.1 Append-only attempt
24.2 Idempotent migration
24.3 Atomic-ish local restore
24.4 Crash recovery
24.5 Schema compatibility

---

## Part H — Quality Engineering

### 25. Test Pyramid
25.1 Domain contract tests
25.2 Storage/migration tests
25.3 Renderer component tests
25.4 Browser feature smoke
25.5 Full learning flow E2E
25.6 Regression fixtures

### 26. Quality Gates
26.1 Existing Question Bank Gate 1–3
26.2 V2 Domain Contract Gate
26.3 V2 Storage Contract Gate
26.4 Import Security Gate
26.5 Browser E2E
26.6 Accessibility smoke

---

## Part I — Delivery

### 27. Refactor Roadmap
27.1 Phase 0 Audit & Freeze
27.2 Phase 1 V2 Foundation
27.3 Phase 2 Storage & Backup V2
27.4 Phase 3 Content Zone + Cloze Transform
27.5 Phase 4 Dapchigi Engine V2
27.6 Phase 5 Program/Format/Transform integration
27.7 Phase 6 Settings consolidation
27.8 Phase 7 UI Shell migration
27.9 Phase 8 Review/Adaptive
27.10 Phase 9 Exam CBT
27.11 Phase 10 Legacy removal
27.12 Phase 11 Security hardening

### 28. Release Policy
28.1 Feature branch
28.2 PR
28.3 Existing QA + V2 QA
28.4 main merge only after green
28.5 Local WSL browser verification
28.6 Vercel은 최종 Production 시점만

---

# V2 핵심 아키텍처 한 장 요약

```text
Verified SOURCE BANK (immutable)
          │
          ▼
 LegacyQuestionAdapter
          │
          ▼
   Question Domain Model
          │
          ├───────────────┐
          ▼               ▼
      Format Engine   Transform Engine
  무엇을/어디에 배치    무엇을 어떻게 변환
          │               │
          └───────┬───────┘
                  ▼
          Study View Model
                  │
                  ▼
              Renderer
                  │
                  ▼
       Dapchigi / Review / Exam
                  │
                  ▼
             Attempt Events
                  │
                  ▼
       Progress / Weakness / Mastery
```

Program Engine은 Format과 Transform을 **참조하여 순서만 조율**한다.

```text
Program Engine
 ├─ Show Format A
 ├─ Apply Cloze Transform B
 ├─ Repeat × 2
 ├─ Reveal
 └─ Rate O/A/X
```

이 구조에서는 빈칸이 문제 본문·지문·선택지·핵심·해설 어디에 있든 같은 Transform Engine이 처리한다.

# 현재 최우선 결정

1. `빈칸문제(type=blank)` 중심 설계를 폐기한다.
2. `mark`라는 레거시 Dapchigi 단계는 V2에서 `ClozeTransform` 호환 어댑터로 전환한다.
3. Format은 구조/배치, Transform은 내용 변환, Program은 실행 순서만 담당한다.
4. 사용자 데이터 모듈은 중앙 Storage Registry에 등록한다.
5. Backup은 Registry를 열거하여 새 기능 데이터가 누락되지 않게 한다.
6. main의 973 SOURCE BANK와 현재 QA는 리팩터링 동안 기준선으로 유지한다.
