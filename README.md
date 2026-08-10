# QTimer

기출문제를 빠르게 회독하고, 오답·모름·애매·시간초과 문제를 자동 압축하여 반복 훈련하는 시험 준비용 CBT/학습 도구입니다.

## 현재 목표

- 1차 적용: 정보처리기사 필기
- 핵심 목표: 문제 풀이 속도 측정 → 자동 채점 → 취약문제 수집 → 반복 회독 → 숙달
- 현재 단계: **v0.1 MVP Slice 1 구현 및 Vercel Preview 검증**

## 핵심 Workspace

1. **Learn Workspace**
   - 왼쪽: 문제
   - 오른쪽: 결과 / 핵심 / 문제집 해설 / AI 해설 / 사용자 메모
2. **Exam Workspace**
   - 왼쪽: 문제
   - 오른쪽: 전체 답안표
   - 문제 선택지와 답안표는 하나의 답안 상태를 공유하여 양방향 동기화

## 주요 학습 모드

- 빠른 회독
- 학습
- 문제풀이
- CBT 모의고사
- 취약 집중

## 데이터 방향

- Google Drive: 원본 문제·정답 사진
- Google Sheets: 문제은행·정답·학습기록·상태
- Google Docs: 사람이 읽는 취약문제 해설집
- QTimer 브라우저: 타이머·현재 세션·즉시 학습 상태

## 문서

- `docs/planning/summary.md`: 현재까지 합의된 기획 요약
- `docs/spec/product-spec-v0.1.md`: v0.1 제품 명세
- `docs/spec/learning-flow.md`: 학습 흐름과 숙달 규칙
- `docs/spec/data-model.md`: 데이터 모델
- `docs/spec/ui-spec.md`: UI/UX 명세
- `docs/decisions/`: 주요 설계 결정 기록(ADR)
- `docs/backlog.md`: v0.1 이후 후보

> v0.1에서는 시험 준비에 직접 필요한 기능만 구현합니다. 새로운 아이디어는 우선 Backlog에 기록하고, 치명적 오류·데이터 손실·채점 오류·학습 흐름 장애가 아니라면 v0.1 범위를 확대하지 않습니다.
