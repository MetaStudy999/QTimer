# QTimer Adaptive Learning v1 문서 인덱스

기준일: 2026-08-12

## 현재 단계

검증 완료된 973문항 SOURCE BANK 위에 Adaptive Learning 기능과 UI/UX Design System을 단계적으로 구현하는 단계다.

현재까지:

- 973문항 SOURCE BANK 검증 완료 및 baseline 동결
- Adaptive Learning 통합 기획서 작성 완료
- 답치기 v1 구현 완료
- 과목/Chapter 범위 선택 구현 완료
- Space 기반 답치기 상태 머신 구현 완료
- O/A/X 자기평가 저장 구현 완료
- 답치기 기록과 일반 평가 Attempt 분리
- 상단 `답치기` 메뉴 구현 완료
- 답치기 형광펜 + 볼드 결합 스타일 구현 완료
- 답 핵심어 빨간색 + 볼드 구현 완료
- 상단 `환경설정` 메뉴 구현 완료
- Settings v2 문제/답 독립 폰트·크기·색상 설정 구현 완료
- Settings v2 볼드·형광펜·강조 범위·형광펜 색상 구현 완료
- 문제/답 실시간 미리보기 구현 완료
- Settings v3 문제용 학습 색상 테마 5개 구현 완료
- Settings v3 답용 학습 색상 테마 5개 구현 완료
- 테마 선택 후 색상 직접 조정 및 `사용자 지정` 전환 구현 완료
- 화면 크기 10단계(80~125%, 5% 간격) 구현 완료
- 환경설정 자동 저장 및 설정 전용 JSON 저장/불러오기 구현 완료
- Settings v1/v2 설정 파일 자동 마이그레이션 지원
- 전체 QTimer 백업에 환경설정 포함
- `QTimer UI/UX Design System v1` 문서 작성 완료
- UI/UX 단계별 구현 로드맵 작성 완료
- Design Token foundation 구현 완료
- 답치기 Study Context Bar 구현 완료
- 답치기 자동 Focus Mode 구현 완료
- 문제 읽기 최대폭 foundation 구현 완료
- Space/O/A/X Bottom Action Dock 구현 완료
- Focus Study Shell Browser E2E 추가
- GitHub Actions 회귀 QA 운영 중
- 개발 검증 환경을 GitHub + Local WSL로 확정
- Vercel은 최종 Production 배포 전까지 사용 보류

## 기준 문서

1. `docs/planning/adaptive-learning-system-v1.md`
   - 제품 목적
   - 교육학/인지심리 원칙
   - 답치기
   - 최신성/반복도/난이도
   - 단원별 분석
   - Adaptive Roadmap
   - 12개 핵심 엔진

2. `docs/spec/adaptive-learning-state-model.md`
   - Attempt 확장
   - Learning/Mastery/Retention/Transfer/Exam Readiness
   - 측정신뢰도
   - 확신오답/취약도
   - Assistance Fading
   - Interleaving
   - Plateau/세션 품질
   - Roadmap 상태 모델

3. `docs/implementation/adaptive-learning-roadmap.md`
   - Phase 0~14 구현 순서
   - 답치기 v1
   - 학습/평가 분리
   - 단원/범위/100문항 CBT
   - 분석 그래프
   - Spacing/Retention
   - Knowledge Graph
   - Adaptive Roadmap
   - Training Variant Bank
   - Personal Learning Experiment

4. `docs/implementation/development-and-deployment-policy.md`
   - GitHub branch/PR 기반 개발
   - GitHub Actions 자동 회귀 QA
   - Local WSL 실제 UI/UX 검증
   - 개발 중 Vercel 사용 금지
   - Vercel 최종 Production 배포 조건

5. `docs/implementation/settings-v1.md`
   - 최초 환경설정 저장 구조
   - 체크박스형 답치기 표시 설정
   - 답 핵심어 빨간색 + 볼드
   - 설정 전용 JSON 저장/불러오기

6. `docs/implementation/settings-v2.md`
   - 문제/답 독립 폰트 선택
   - 문제/답 독립 폰트 크기
   - 문제/답 독립 글자색
   - 볼드·형광펜 독립 조합
   - 전체/핵심어 강조 범위
   - 사용자 지정 형광펜 색상
   - 답 마킹 및 답 핵심어 빨간색 유지
   - 실시간 미리보기
   - Settings v1 → v2 호환

7. `docs/implementation/settings-v3.md`
   - 문제 학습 색상 테마 5개
   - 답 학습 색상 테마 5개
   - 테마 + 세부 사용자 지정 공존
   - 화면 배율 1~10단계
   - 80~125%, 5% 간격
   - 기본 5단계 100%
   - Settings v1/v2 → v3 호환
   - Settings v3 Browser E2E 기준

8. `docs/design/qtimer-ui-ux-design-system-v1.md`
   - Dashboard / Learn / Review / Exam 4개 화면 모드
   - Application Shell / Focus Shell
   - Study Context Bar
   - Bottom Action Dock
   - Keyboard-first UX
   - Next Best Action Dashboard
   - Design Tokens
   - Responsive / Accessibility
   - Settings Basic/Advanced 및 Quick Settings 방향

9. `docs/implementation/ui-ux-design-roadmap-v1.md`
   - UI-0 Foundation
   - UI-1 Focus Study
   - UI-2 Sidebar
   - UI-3 Dashboard Cockpit
   - UI-4 Review Shell
   - UI-5 CBT Shell
   - UI-6 Settings Progressive Disclosure
   - UI-7 Accessibility
   - 각 PR 범위와 QA Gate

## 설계 기준

- 973문항 SOURCE BANK의 문제/정답 provenance를 변경하지 않는다.
- AI Training Variant는 원본 문제와 분리한다.
- 미측정은 0점으로 표시하지 않는다.
- 학습 중 도움을 받은 정답과 무힌트 평가를 분리한다.
- 공식 합격 기준과 QTimer 내부 숙달 기준을 분리한다.
- 점수만 보여주지 않고 원인과 다음 행동을 설명한다.
- 추천은 과락 방지, 범위 커버리지, 고빈출 취약, 학습 ROI 순으로 제약한다.
- 직후 점수보다 지연 Retention과 Transfer를 별도 측정한다.
- 사용자 심리 상태는 진단하지 않고 학습 조건 조정에만 사용한다.
- 학습기록과 UI 환경설정을 논리적으로 분리한다.
- 환경설정은 버전 관리하고 이전 답치기 style 값 및 설정 파일과 호환한다.
- 외부 폰트 파일을 번들하지 않고 OS 폰트 fallback stack을 사용한다.
- 화면 확대/축소는 학습 점수나 문항 상태에 영향을 주지 않는다.
- 색상 테마는 학습 성과를 보장하는 절대 기준이 아니라 QTimer 권장 프리셋으로 제공한다.
- 테마를 선택해도 사용자가 폰트색/형광펜색을 직접 수정할 수 있다.
- 시스템 UI 색상과 문제/답 학습 색상은 분리한다.
- 분석 화면은 정보를 충분히 제공하고 학습/시험 화면은 방해 요소를 최소화한다.
- UI 리팩터링 때문에 SOURCE BANK 또는 학습 데이터 스키마를 변경하지 않는다.
- 한 PR에서 전체 화면을 재작성하지 않고 rollback 가능한 Vertical Slice로 진행한다.

## 개발·검증 기준

기본 흐름:

```text
기능 branch
→ 구현
→ PR
→ GitHub Actions QA
→ main 병합
→ Local WSL 실제 확인
→ 다음 기능
```

Vercel은 일반 개발/디버깅/중간 확인에 사용하지 않는다.

다음 조건이 충족된 최종 배포 단계에서만 Production 배포에 사용한다.

```text
973문항 QA 통과
+ 핵심 학습 기능 구현 완료
+ GitHub Actions 성공
+ Local WSL 실사용 확인
+ UI/UX 최종 점검
+ 사용자 최종 승인
→ Vercel Production 배포
```

세부 정책은 `docs/implementation/development-and-deployment-policy.md`를 따른다.

## 현재 다음 구현 우선순위

### 학습 엔진 Lane

#### Phase 2 — 학습/평가 상태 분리 강화

- Learning Score / Mastery Score 분리
- 미측정 상태
- Coverage / 측정신뢰도
- 확실오답 분류

#### Phase 3 — 회독/취약 자동 압축

- 1회독 전체
- 2회독 A(애매) + X(틀림) 중심 자동 추출
- 취약 문제집 자동 축소

### UI/UX Lane

현재 UI-0 / UI-1 기반 구현까지 완료한다.

Local WSL에서 실제 사용성을 확인한 뒤 다음 순서는:

```text
UI-2 Application Sidebar
→ UI-3 Dashboard Cockpit / Next Best Action
→ UI-4 Review Shell
→ UI-5 CBT Shell
→ UI-6 Settings Basic/Advanced + Quick Settings
```

Sidebar 전환은 현재 Focus Study foundation이 실제 학습에서 안정적인 것을 확인한 후 별도 PR로 진행한다.

### 이후

- 단원 무힌트 모의고사
- 모의고사 오답 재시험
- 100점/숙달 조건
- 단원별 숙달도·합격 안정도 분석 그래프
- Adaptive Roadmap

초기 단계에서는 ML, 자동 최신출제 분석, AI 변형문제, Knowledge Graph, 복잡한 Roadmap을 핵심 학습 루프보다 먼저 구현하지 않는다.
