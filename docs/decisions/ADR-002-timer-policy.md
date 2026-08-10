# ADR-002: 모드별 타이머 정책

상태: Accepted
날짜: 2026-08-11

## Context

QTimer는 빠른 회독, 개념 학습, 실전 모의고사를 모두 지원한다. 하나의 시간 제한 정책을 모든 모드에 적용하면 학습 목적과 충돌한다.

## Decision

세 가지 타이머 정책을 지원한다.

- No Limit
- Soft Limit
- Hard Limit

기본값:

- 빠른 회독: Hard Limit
- 취약/학습: Soft Limit
- 모의고사: 문제별 제한 없이 전체 시험시간만 사용

Hard Limit에서는 제한시간 도달 시 TIME OUT을 기록하고 짧은 피드백 후 다음 문제로 자동 이동한다.

## Important Rule

TIME OUT은 오답이 아니다.

예:

- 정답 선택 + 시간초과 → `correct + over`
- 오답 선택 + 시간초과 → `wrong + over`
- 미응답 + 시간초과 → `unanswered + timeout`

정오·확신·시간을 독립적으로 저장한다.

## Why

- 빠른 회독에서 한 문제에 과도하게 머무는 것을 방지한다.
- 학습모드에서는 생각과 해설 확인 시간을 보장한다.
- 모의고사는 실제 시험과 유사하게 전체 시간 배분 능력을 훈련한다.

## Consequences

- 문제 유형/세션별 목표시간 설정이 필요하다.
- Hard Limit 자동 이동 전 선택된 답과 애매 상태를 반드시 저장한다.
- 사용자는 자동 이동 지연시간을 설정할 수 있다.
