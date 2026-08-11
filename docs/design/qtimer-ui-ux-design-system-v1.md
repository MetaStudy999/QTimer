# QTimer UI/UX Design System v1

기준일: 2026-08-12

## 1. 목적

QTimer의 UI는 일반 관리 대시보드가 아니라 **시험 학습 실행 도구**를 위해 설계한다.

최우선 목표는 다음 네 가지다.

1. 사용자가 지금 무엇을 해야 하는지 즉시 알 수 있게 한다.
2. 문제풀이 중 시각적 방해와 마우스 이동을 최소화한다.
3. 분석·설정 화면과 실제 학습·시험 화면을 분리한다.
4. 기존 검증된 973문항 SOURCE BANK와 학습 엔진을 변경하지 않고 점진적으로 UI를 개선한다.

핵심 문장:

> 분석할 때는 충분한 정보, 풀 때는 최소한의 정보.

---

## 2. 디자인 방향

QTimer의 기준 UI 패턴은 다음 조합을 따른다.

- Application Shell: 좌측 Sidebar + Content
- Focus Shell: 학습/시험 중 Sidebar 자동 축소 또는 숨김
- Card 기반 Dashboard
- Keyboard-first Study UX
- Sticky Study Context Bar
- Bottom Action Dock
- Design Token 기반 테마/환경설정
- Progressive Disclosure: 기본 설정과 고급 설정 분리

특정 UI 프레임워크로 즉시 전환하지 않는다. 현재 HTML/CSS/JavaScript 구조 위에 디자인 시스템을 먼저 적용하고, 필요 시 후속 단계에서 컴포넌트 프레임워크 전환을 검토한다.

---

## 3. 화면 모드 4종

### 3.1 Dashboard Mode

목적:

- 현재 학습 상태 확인
- 가장 중요한 다음 행동 결정
- 과락 위험과 취약 영역 확인

핵심 UI:

- Next Best Action 카드
- 시험 준비도
- 과목별 안정도
- 취약 단원
- 최근 학습량
- 측정 범위/신뢰도

Dashboard는 그래프 자체가 목적이 아니다.

우선순위:

```text
지금 할 일
→ 왜 해야 하는가
→ 예상 학습량/시간
→ 시작 버튼
→ 세부 분석
```

### 3.2 Learn Mode

포함:

- 답치기
- 개념 입력
- 취약 집중
- 힌트 기반 회상

특징:

- Focus Shell 사용
- 최대 읽기 폭 제한
- Keyboard-first
- Sidebar 자동 축소
- Study Context Bar 유지
- Bottom Action Dock 제공

### 3.3 Review Mode

포함:

- 오답
- 애매
- 확실오답
- 반복오답
- 지연 복습

Review Mode는 단순 문제 재출제가 아니라 **오답 원인 교정**을 목표로 한다.

카드 구조:

```text
상태
→ 원인
→ 중요도
→ 추천 복습
→ 다시 풀기
```

### 3.4 Exam Mode

포함:

- 단원시험
- 범위시험
- 과목시험
- 100문항 CBT

특징:

- Sidebar 완전 숨김
- 애니메이션 최소화
- 시험 중 정답 피드백 없음
- 우측 문항 Navigator 허용
- 남은 시간, 미응답, 검토표시만 제공

---

## 4. Application Shell / Focus Shell

### 4.1 Application Shell

Dashboard, Analytics, Roadmap, Settings에서 사용한다.

장기 목표 구조:

```text
QTimer
────────────────
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

Desktop:

- Sidebar 펼침

Tablet:

- Sidebar Compact

Mobile:

- Drawer Navigation

### 4.2 Focus Shell

답치기/학습/복습 중 사용한다.

자동 동작:

```text
Dashboard 진입 → Sidebar 펼침
답치기 진입 → Sidebar 축소
시험 진입     → Sidebar 숨김
```

초기 구현에서는 기존 상단 Navigation을 유지하고, Focus Mode에서 불필요한 Control Bar/Session Summary를 줄이는 방식으로 단계적 전환한다.

---

## 5. Study Context Bar

모든 학습 화면 상단에 동일 위치로 제공한다.

예:

```text
3과목 > Ch02 | 답치기 | 2회독 | 17 / 52 | 18:32
```

필수 정보:

- 과목
- 단원
- 학습 방식
- 회독
- 현재 문제 / 범위 문제 수
- 세션 시간 또는 타이머 상태

원칙:

- 위치를 화면마다 바꾸지 않는다.
- Focus Mode에서도 유지한다.
- 정보는 한 줄 우선, 모바일에서는 두 줄 허용.
- 시험 모드에서는 회독 대신 남은 시간/미응답을 표시한다.

---

## 6. Bottom Action Dock

학습 중 핵심 입력을 화면 하단에 고정한다.

답치기 기준:

```text
Space 진행 | O 맞음 | A 애매 | X 틀림
```

Desktop:

- 키보드 단축키 설명 + 클릭 가능 버튼

Mobile:

- 엄지 접근을 위해 하단 고정
- O/A/X 최소 터치 영역 44px 이상

상태 연동:

- preview/question/mark 단계: Space 활성
- reveal 단계: O/A/X 활성
- 사용할 수 없는 버튼은 disabled 처리

---

## 7. Keyboard-first 원칙

QTimer는 일반 사이트보다 키보드 효율을 우선한다.

기본 표준:

| Key | Action |
|---|---|
| Space | 다음 학습 단계 |
| O | 맞음 |
| A | 애매 |
| X | 틀림 |
| 1~4 | 선택지 |
| Enter | 제출/다음 |
| Left / Right | 이전/다음 |
| F | 검토 표시 |
| P | 일시정지 |
| Esc | Focus Mode 종료 또는 Overlay 닫기 |

단축키는 모드별 충돌이 없어야 한다.

입력창/select/textarea에 포커스가 있을 때 학습 단축키는 실행하지 않는다.

---

## 8. 읽기 폭과 Typography

큰 모니터에서 긴 문장이 너무 넓어지지 않도록 한다.

권장 Token:

```text
--qt-read-width: 920px
--qt-shell-width: 1440px
--qt-line-height-study: 1.6
```

문제 영역:

- 최대 읽기 폭 제한
- 중앙 정렬
- 선택지 간격 명확화
- 핵심어 강조는 Settings의 문제/답 테마와 연동

환경설정의 글꼴/글자크기는 학습 내용에 적용하고, Navigation/시스템 UI는 별도 시스템 Typography를 유지한다.

---

## 9. Design Tokens

### 9.1 Color Tokens

시스템 UI와 학습 콘텐츠 색상을 분리한다.

시스템:

```css
--qt-bg
--qt-surface
--qt-text
--qt-muted
--qt-border
--qt-primary
--qt-success
--qt-warning
--qt-danger
--qt-info
```

학습:

```css
--qt-q-font
--qt-q-color
--qt-q-size
--qt-q-highlight
--qt-a-font
--qt-a-color
--qt-a-size
--qt-a-highlight
```

Settings v3의 문제/답 테마는 학습 Token만 변경한다.

### 9.2 Spacing Tokens

8px 기반을 사용한다.

```css
--qt-space-1: 4px
--qt-space-2: 8px
--qt-space-3: 12px
--qt-space-4: 16px
--qt-space-5: 24px
--qt-space-6: 32px
```

### 9.3 Radius Tokens

```css
--qt-radius-sm: 8px
--qt-radius-md: 12px
--qt-radius-lg: 16px
--qt-radius-pill: 999px
```

### 9.4 Motion Tokens

```css
--qt-motion-fast: 140ms
--qt-motion-normal: 180ms
```

문제 전환과 CBT는 animation을 최소화한다.

`prefers-reduced-motion`을 존중한다.

---

## 10. Dashboard UX

첫 화면의 가장 큰 카드는 `Next Best Action`이다.

예:

```text
지금 가장 먼저 할 학습

4과목 Ch02
포인터 · 구조체

반복오답 7
확실오답 3
애매 5
시험 중요도 높음

약 14분

[지금 시작]
```

그 아래:

- 시험 준비도
- 과목별 안정도
- 취약 단원
- 최근 학습
- Coverage / Measurement Confidence

대시보드의 질문은 항상 네 가지로 통일한다.

1. 현재 상태는?
2. 왜 그런가?
3. 무엇이 중요한가?
4. 지금 무엇을 할까?

---

## 11. Analytics 카드 표준

분석 카드는 다음 구조를 기본으로 한다.

```text
상태
53 · 불안정

원인
확실오답 3
반복오답 4

중요도
높음

추천
답치기 7 → 변별 5 → 단원시험 10

[시작]
```

단순 점수만 노출하지 않는다.

`미측정`은 0점으로 표시하지 않는다.

---

## 12. Settings UX

장기적으로 Settings를 두 단계로 분리한다.

### 기본 설정

- 문제 테마
- 답 테마
- 글자 크기
- 화면 크기
- 볼드
- 형광펜

### 고급 설정

- 폰트
- 글자색
- 형광펜색
- 강조 범위
- 답 마킹
- 답 핵심어 빨간색
- 단축키
- 타이머 정책
- 줄간격/선택지 간격

Settings v3의 5+5 테마와 10단계 화면 배율은 그대로 유지한다.

---

## 13. Quick Settings

학습 중 전체 환경설정 화면으로 이동하지 않고 최소한의 표시 설정을 바꿀 수 있게 한다.

향후 제공:

```text
Aa
────────────
문제 크기  - 22 +
문제 테마  집중 블루
답 테마    안정 그린
화면        110%

[환경설정 전체]
```

Quick Settings는 학습 기록을 변경하지 않는다.

---

## 14. Responsive UX

### Desktop >= 1200px

- Application Sidebar + Main
- Dashboard 2~3열
- Focus content 중앙 최대폭

### Tablet 768~1199px

- Compact Sidebar
- Dashboard 1~2열
- Focus content 1열

### Mobile < 768px

- Drawer Navigation
- 학습 본문 1열
- Bottom Action Dock 고정
- O/A/X 버튼 터치 영역 확대
- 불필요한 메타데이터 접기

---

## 15. Accessibility

필수:

- 키보드만으로 핵심 학습 가능
- visible focus ring
- 44px 이상 터치 타깃
- 색상만으로 상태 구분하지 않음
- 텍스트/아이콘/라벨을 함께 사용
- `prefers-reduced-motion` 지원
- 고대비/색약 안전 팔레트 확장 가능 구조
- 화면 확대 125%에서도 주요 컨트롤 겹침 없음

향후 고려:

- line-height
- content width
- choice spacing
- high contrast mode
- color-safe palettes

---

## 16. 상태 피드백 문구

비난/압박형 문구를 피하고 행동 중심으로 표시한다.

권장:

- `아직 측정하지 않았습니다.`
- `확실오답 3개를 먼저 교정하는 편이 효율적입니다.`
- `최근 10문항에서 응답시간이 증가했습니다.`
- `이 단원은 지연 재시험이 필요합니다.`

피해야 할 예:

- `실력이 부족합니다.`
- `이 정도면 불합격입니다.`
- 근거 없는 `N문제만 풀면 합격` 표현

---

## 17. 구현 원칙

1. SOURCE BANK는 UI 때문에 수정하지 않는다.
2. UI 리팩터링은 기존 학습 데이터 스키마와 분리한다.
3. 한 PR에서 전체 화면을 재작성하지 않는다.
4. CSS Token → Focus Shell → Sidebar → Dashboard → Review → CBT 순으로 진행한다.
5. 모든 단계에서 기존 Browser Smoke를 유지한다.
6. 새 UI는 최소 1개 이상의 E2E 검증을 추가한다.
7. Vercel은 최종 Production 배포에서만 사용한다.

---

## 18. 단계별 구현 순서

### Phase UI-0 — 문서/Token

- Design System v1 문서
- Token layer
- 읽기 폭
- Motion/Accessibility foundation

### Phase UI-1 — Focus Study Foundation

- Study Context Bar
- Dapchigi Focus Mode
- Bottom Action Dock
- Mobile Action Dock

### Phase UI-2 — Application Sidebar

- Desktop Sidebar
- Compact state
- Mobile Drawer
- Dashboard/Study/Review/Exam/Analytics/Settings IA

### Phase UI-3 — Dashboard Cockpit

- Next Best Action
- 시험 준비도
- 과목 안정도
- 취약도
- Coverage/Confidence

### Phase UI-4 — Review Shell

- 오답/애매/확실오답
- 원인 카드
- 재시험 CTA

### Phase UI-5 — CBT Shell

- 시험 전용 Layout
- Question Navigator
- 미응답/검토표시
- 제출 전 확인

### Phase UI-6 — Settings Progressive Disclosure

- 기본/고급 탭
- Quick Settings
- Accessibility controls

---

## 19. 현재 첫 구현 범위

이번 Design System v1 첫 PR에서는 다음만 구현한다.

- Design Token CSS
- Study Context Bar
- Dapchigi Focus Mode
- 문제 읽기 폭 제한
- Bottom Action Dock
- 모바일 대응
- Browser E2E

다음은 이번 PR에서 하지 않는다.

- 전체 Sidebar 교체
- Dashboard 전면 재설계
- Review/CBT 신규 기능
- React/Tailwind/shadcn 전환
- 문제 데이터 변경

이 범위를 지켜 현재 안정된 학습 기능을 보호한다.
