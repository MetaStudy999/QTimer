# QTimer Adaptive Learning v1 문서 인덱스

기준일: 2026-08-12

## 현재 단계

검증 완료된 973문항 SOURCE BANK 위에 적응형 학습 계층을 설계하는 단계다.

런타임 구현 전 다음 세 문서를 기준으로 사용한다.

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

## 다음 구현 권장 branch

기획 승인 후 첫 구현은 `feat/dapchigi-v1` 범위로 제한한다.

- 답치기 모드
- 문제/답 스타일
- Space 상태 머신
- O/A/X 기록
- 과목/Chapter 범위 선택
- 기존 Attempt와 충돌하지 않는 최소 저장

초기 단계에서는 ML, 자동 최신출제 분석, AI 변형문제, Knowledge Graph, 복잡한 Roadmap을 넣지 않는다.
