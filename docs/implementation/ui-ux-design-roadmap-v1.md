# QTimer UI/UX 구현 로드맵 v1

기준일: 2026-08-12

## 목표

`QTimer UI/UX Design System v1`을 기존 안정된 QTimer 런타임에 점진적으로 적용한다.

핵심 제약:

- 검증된 973문항 SOURCE BANK 변경 금지
- 일반 Attempt / Dapchigi O-A-X 기록 구조 변경 금지
- 대규모 프레임워크 전환 금지
- 기능 브랜치 → PR → GitHub Actions → main → Local WSL 확인
- Vercel은 최종 Production 배포 때만 사용

---

## UI-0. Foundation

### 구현

- `qtimer-design-system-v1.css`
- 시스템 Design Token
- spacing/radius/motion/read-width token
- focus-visible
- reduced-motion
- study content max-width

### 완료 조건

- 기존 Dashboard/Study 레이아웃이 깨지지 않는다.
- 80~125% Settings 화면배율에서도 주요 UI가 겹치지 않는다.
- Browser smoke 통과.

---

## UI-1. Focus Study Foundation

### 구현

- `study-shell-v1.js`
- Study Context Bar
- Dapchigi 자동 Focus Mode
- Bottom Action Dock
- Dapchigi 단계에 따른 버튼 활성 상태
- 모바일 하단 Action Dock

### Study Context Bar 표시값

```text
Subject / Chapter | Mode | Round | Position | Timer
```

답치기 예:

```text
3과목 데이터베이스 구축 > Ch02 | 답치기 | 2회독 | 17 / 52
```

### Bottom Action Dock

```text
Space 진행 | O 맞음 | A 애매 | X 틀림
```

### 완료 조건

- Dapchigi 진입 시 `qt-focus-mode` 적용.
- Dashboard/일반 Study 진입 시 focus class 해제.
- preview/question/mark에서 Space 활성.
- reveal에서 O/A/X 활성.
- 기존 Space/O/A/X 키보드 동작 유지.
- 일반 Attempt 오염 없음.

---

## UI-2. Application Sidebar

### 구현 예정

- `app-shell-v1.js`
- 좌측 Navigation
- Desktop expanded/collapsed
- Tablet compact
- Mobile drawer

### 메뉴 IA

```text
대시보드

학습
  답치기
  학습
  취약집중

복습
  오답
  애매
  확실오답

시험
  단원시험
  모의고사

분석
  학습분석
  로드맵

시스템
  환경설정
  백업/복원
```

### 안전장치

- 기존 상단 탭은 한 단계 동안 fallback으로 유지 가능.
- Sidebar 라우팅이 안정화된 뒤 제거.

---

## UI-3. Dashboard Cockpit

### 목표

첫 화면에서 사용자가 다음 학습을 결정할 수 있게 한다.

### 우선 컴포넌트

1. Next Best Action
2. Exam Readiness
3. Subject Stability
4. Weak Chapter
5. Coverage / Measurement Confidence
6. Recent Learning

### 완료 조건

Dashboard는 다음 질문을 한 화면에서 답해야 한다.

- 현재 상태?
- 원인?
- 중요도?
- 다음 행동?

---

## UI-4. Review Mode

### 구현 예정

- 오답
- 애매
- 확실오답
- 반복오답
- 망각 복습

### 카드 표준

```text
상태
원인
시험 중요도
추천 복습
[지금 시작]
```

---

## UI-5. Exam/CBT Shell

### 구현 예정

- 시험 전용 Focus Shell
- 사이드바 완전 숨김
- 타이머
- 문항 Navigator
- 미응답 수
- 검토 표시
- 제출 확인
- 종료 후 일괄 피드백

### 금지

- 시험 도중 정답 강조
- 시험 도중 답치기 힌트
- 학습용 Assistance Score와 시험점수 혼합

---

## UI-6. Settings 개선

Settings v3 위에서 진행한다.

### Basic

- 문제 테마
- 답 테마
- 글자크기
- 화면배율
- 볼드
- 형광펜

### Advanced

- 폰트
- 글자색
- 형광펜색
- 강조범위
- 답마킹
- 답 핵심어 빨강
- 단축키
- 접근성

### Quick Settings

학습 화면에서 `Aa`로 최소 표시 설정 제공.

---

## UI-7. Accessibility

### 목표

- High Contrast
- Color-safe palette
- line-height
- choice spacing
- content width
- Reduce Motion
- Keyboard-only flow

### E2E

- focus visibility
- 125% scale
- mobile action dock
- keyboard action parity

---

## PR 크기 원칙

UI 변경은 작은 Vertical Slice로 분리한다.

권장:

```text
PR 1: Token + Focus Study
PR 2: Sidebar Shell
PR 3: Dashboard Cockpit
PR 4: Review Shell
PR 5: CBT Shell
PR 6: Settings Basic/Advanced + Quick Settings
```

각 PR은 독립 롤백 가능해야 한다.

---

## 현재 실행 중인 PR 범위

`feat/ui-ux-design-system-v1`

포함:

- Design System 문서
- UI/UX 구현 로드맵
- Design Token CSS
- Study Context Bar
- Dapchigi Focus Mode
- Bottom Action Dock
- Browser Smoke 확장

제외:

- Sidebar 전면 전환
- Dashboard Next Best Action 계산 엔진
- Review 데이터 엔진
- CBT 신규 기능

---

## QA Gate

기존:

1. Gate 1 — Question Bank Integrity
2. Gate 2 — Deep Structural QA
3. Gate 3 — Answer Risk Baseline
4. Study/Dapchigi Browser Smoke
5. Settings Browser Smoke

추가:

6. Focus Study Shell assertions
   - Context Bar
   - Focus class
   - max-width
   - Action Dock
   - stage/button state
   - Dashboard/Study 복귀

모든 Gate 성공 후에만 `main`에 병합한다.
