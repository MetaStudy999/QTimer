# QTimer Adaptive Learning v1 문서 인덱스

기준일: 2026-08-12

## 현재 단계

검증 완료된 973문항 SOURCE BANK 위에 Adaptive Learning 기능을 단계적으로 구현하는 단계다.

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
- 상단 `환경설정` 메뉴와 체크박스형 표시 설정 구현 완료
- 환경설정 자동 저장 및 설정 전용 JSON 저장/불러오기 구현 완료
- 전체 QTimer 백업에 환경설정 포함
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
   - 환경설정 전용 저장 구조
   - 체크박스형 답치기 표시 설정
   - 답 핵심어 빨간색 + 볼드
   - 자동 저장
   - 설정 전용 JSON 저장/불러오기
   - 전체 백업과 환경설정 통합
   - Settings Browser E2E 기준

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
- 환경설정은 버전 관리하고 이전 답치기 style 값과 호환한다.

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

답치기 v1과 환경설정 v1 이후 다음 vertical slice를 우선한다.

### Phase 2 — 학습/평가 상태 분리 강화

- Learning Score / Mastery Score 분리
- 미측정 상태
- Coverage / 측정신뢰도
- 확실오답 분류

### Phase 3 — 회독/취약 자동 압축

- 1회독 전체
- 2회독 A(애매) + X(틀림) 중심 자동 추출
- 취약 문제집 자동 축소

### 이후

- 단원 무힌트 모의고사
- 모의고사 오답 재시험
- 100점/숙달 조건
- 단원별 숙달도·합격 안정도 분석 그래프
- Adaptive Roadmap

초기 단계에서는 ML, 자동 최신출제 분석, AI 변형문제, Knowledge Graph, 복잡한 Roadmap을 핵심 학습 루프보다 먼저 구현하지 않는다.
