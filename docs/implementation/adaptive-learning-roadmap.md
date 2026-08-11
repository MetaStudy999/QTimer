# QTimer Adaptive Learning 구현 로드맵

기준일: 2026-08-12
상태: 구현 순서 제안
기준 branch: `main`의 검증 완료 973문항 baseline 이후

## 1. 목표

기존 문제은행과 정답 QA를 건드리지 않고, 학습 엔진을 단계적으로 추가한다.

핵심 원칙:

- SOURCE BANK 973문항은 데이터 baseline으로 보존
- 런타임 변경은 회귀 QA를 통과해야 함
- 기능은 작은 vertical slice로 구현
- 학습 효과를 확인할 수 없는 복잡한 AI/ML은 뒤로 미룸
- 각 단계는 독립적으로 사용 가능해야 함

## 2. Phase 0 — 기반 정리

### 목표

적응형 기능을 넣어도 기존 973문항과 학습기록이 손상되지 않는 구조를 만든다.

### 작업

- Feature flag 구조 추가
- SOURCE BANK / TRAINING VARIANT 구분 필드 설계
- Attempt schema versioning
- 기존 localStorage migration 전략
- adaptive score 설정값 버전 관리
- 기존 Gate 1~3 + Browser smoke 유지

### 완료 기준

- 기존 main과 동일하게 973문항 로드
- 과거 학습기록 유지
- adaptive 기능을 꺼도 기존 동작 동일

## 3. Phase 1 — 답치기 v1

### 목표

사용자가 제시한 Space 중심 답치기 흐름을 최소 기능으로 제공한다.

### 기능

- 답치기 모드
- 문제 스타일
  - 일반
  - 전체 볼드
  - 핵심어 볼드
  - 전체 형광펜
  - 핵심어 형광펜
- 답 스타일
  - 일반
  - 전체 볼드
  - 핵심어 볼드
  - 전체 형광펜
  - 핵심어 형광펜
  - 정답 마킹/빈칸
- Space 단계 상태 머신
- 맞음/애매/틀림 입력
- 과목/Chapter 범위 선택
- 현재 문제 위치/회독 표시

### 우선 UX

키보드 조작을 최우선으로 한다.

`Space → O/A/X → Space`

### 테스트

- Space 단계 순서
- 상태 전환 후 정답 노출 누수 없음
- 저장/복원
- 과목/Chapter 범위 정확성

## 4. Phase 2 — 학습/평가 분리

### 목표

답치기 점수를 실전 숙달로 잘못 계산하지 않는다.

### 작업

- attempt_mode
- exposure_state
- assistance_level
- Learning Score
- Mastery Score
- 미측정 상태
- 측정문항수/Coverage
- 확실오답 분류

### UI

단원 카드 예:

`숙달도 62 / 측정 18 of 52 / 신뢰도 보통`

미측정 단원:

`숙달도 미측정 / 진단 필요`

## 5. Phase 3 — 취약 압축/회독 엔진

### 목표

전체 반복이 아니라 취약집합이 자동으로 줄어들게 한다.

### 대상

- 확실오답
- 반복오답
- 모름
- 최근 오답
- 맞았지만 애매
- 맞았지만 느림

### 기능

- 2회독 대상 자동 생성
- 취약 문제 세트
- 다시 풀기
- 현재 취약집합 크기 추적
- 회독별 변화 저장

### 성공 지표

`전체 문제 수`가 아니라 `취약문제 수 감소율`을 주요 지표로 본다.

## 6. Phase 4 — 단원시험/범위시험

### 기능

- 단원 무힌트 시험
- 단원 오답 재시험
- 복수 Chapter 범위 지정
- 과목 조합
- 문제 수 직접 지정
- 순서/랜덤
- 시험 종료 후 피드백

### 중요 규칙

학습모드의 힌트가 시험모드에 노출되지 않아야 한다.

## 7. Phase 5 — 100문항 CBT

### 목표

실전 시험환경 전이를 측정한다.

### 기능

- 과목별 균형 출제
- 전체 시험시간
- 답안표
- 이전/다음 문제
- 미응답 표시
- 종료 후 채점
- 과목별 분석
- 과락 위험 표시

### 기록

- CBT 점수
- 과목별 점수
- 응답시간 분포
- 확신도(선택적)
- 학습모드 대비 성능 차이

## 8. Phase 6 — 문제 분류 메타레이어

### 목표

원문 데이터에 직접 손대지 않고 학습용 메타데이터를 붙인다.

### 1차 태그

- concept_tags
- item_type
- negative_stem
- difficulty_base D1~D5
- repeat_level R0~R5
- exam_importance
- recency_score
- source_confidence

### 자동화 순서

1. 규칙 기반
2. 수동 검토
3. AI 보조
4. 향후 사용자 데이터 보정

### 검증

AI가 만든 태그를 공식 출제사실처럼 표시하지 않는다.

## 9. Phase 7 — 분석 대시보드 v1

### 최상단

- 현재 시험준비도
- 가장 위험한 과목
- 가장 우선할 단원
- 오늘 추천학습

### 그래프

1. 과목별 안정도
2. 단원별 Mastery
3. 회독/날짜별 성장곡선
4. 출제 중요도 × 사용자 취약도
5. 취약 원인 구성

### UX 원칙

그래프 아래에 반드시 `무엇을 해야 하는가`를 표시한다.

예:

`4과목 Ch02 → 확실오답 5 + 반복오답 7 → 추천 12문제`

## 10. Phase 8 — Retention/Spacing

### 목표

직후 기억과 장기 기억을 구분한다.

### 기능

- recheck_at
- 지연 재시험 Queue
- 마지막 학습 이후 경과시간
- Retention Score
- 복습 간격 조정

### 초기 전략

복잡한 알고리즘 대신 보수적 규칙 기반으로 시작한다.

예:

- 확실오답: 짧은 간격
- 일반 오답: 짧은 간격
- 애매 정답: 중간 간격
- 안정 정답: 긴 간격

실제 데이터로 조정한다.

## 11. Phase 9 — Assistance Fading

### 기능

L0~L6 도움 단계

- L0 답+핵심어+해설
- L1 답+핵심어
- L2 정답 빈칸
- L3 핵심어
- L4 무힌트
- L5 변형
- L6 시간 제한

학습 상태에 따라 자동/수동 변경한다.

## 12. Phase 10 — Knowledge Graph

### 초기 범위

- 과목
- Chapter
- 핵심 concept
- prerequisite 관계

### 활용

반복오답이 발생하면 단순히 동일 문제를 반복하지 않고 선행개념 drill을 제안한다.

예:

`정규형 판별 실패 → 함수 종속 선행개념 확인`

## 13. Phase 11 — Adaptive Roadmap

### 입력

- 시험일
- 학습 가능시간
- Mastery
- Retention
- Coverage
- CBT 결과
- 출제 중요도
- 과락 위험

### 출력

`오늘 할 일`

각 task:

- 범위
- 모드
- 문제 수
- 예상시간
- 추천 이유
- 재평가 시점

### 우선순위

1. 과락 방지
2. 최소 범위 Coverage
3. 고빈출 취약
4. 고ROI 학습
5. 고득점 확장

## 14. Phase 12 — Training Variant Bank

### 목표

정답 위치 암기를 개념 전이와 분리한다.

### variant 예

- 선택지 순서 변경
- 표현 변경
- 상황형
- 코드 입력값 변경
- SQL 데이터값 변경

### 안전장치

- source question과 별도 ID namespace
- AI generated 명시
- 원본 문제 개수 973에 합산하지 않음
- 별도 QA

## 15. Phase 13 — Personal Learning Experiment

### 목표

어떤 학습법이 사용자에게 장기적으로 효과적인지 측정한다.

### 비교 후보

- 답 선노출
- 예측 후 답
- 빈칸 회상
- 무힌트 retrieval

### 평가

직후 점수보다 지연 Retention/Transfer를 우선한다.

최소 데이터가 충분하지 않으면 자동 정책 변경을 하지 않는다.

## 16. Phase 14 — 고급 적응형 모델

충분한 사용자 데이터가 쌓인 이후만 검토한다.

후보:

- Bayesian/Knowledge Tracing
- 개인별 difficulty calibration
- 복습 간격 최적화
- 학습 ROI 예측
- 추천 정책 비교 실험

v1에서 필수가 아니다.

## 17. 비기능 요구사항

### 성능

- 973문항 초기 로드가 현재 수준에서 악화되지 않아야 함
- 키 입력 반응은 즉각적이어야 함

### 접근성

- 색상만으로 상태 구분하지 않음
- 키보드 사용 가능
- 고대비/글자 크기 설정 유지

### 신뢰성

- Attempt append-only
- localStorage migration 실패 시 백업/복구 가능
- scoring version 기록

### 설명 가능성

추천 task에는 `reason`이 있어야 한다.

## 18. QA Matrix

| 영역 | 필수 회귀 테스트 |
|---|---|
| 문제은행 | Gate 1~3 |
| Script loading | 모든 index 참조 존재 |
| 답치기 | Space/O/A/X 상태 머신 |
| 저장 | reload 후 상태 복원 |
| 범위 | 과목/Chapter 정확한 filter |
| 시험 | 힌트 누수 없음 |
| Mastery | 도움 정답 과대평가 금지 |
| Dashboard | 미측정 0점 표시 금지 |
| Variant | source와 분리 |
| Roadmap | 추천 이유 존재 |

## 19. 구현 순서 요약

`기반 → 답치기 → 학습/평가 분리 → 취약압축 → 단원시험 → 100문항 CBT → 문제분류 → 분석그래프 → Retention → Fading → Knowledge Graph → Roadmap → Variant → 개인최적화`

## 20. 현재 권장 다음 작업

기획 문서가 승인되면 첫 구현 branch는 다음 범위만 진행한다.

**`feat/dapchigi-v1`**

포함:

- 답치기 모드
- 문제/답 스타일
- Space 상태 머신
- O/A/X 기록
- 과목/Chapter 범위 선택
- 기존 Attempt와 충돌하지 않는 최소 상태 저장

포함하지 않음:

- ML
- 자동 최신출제 분석
- AI 변형문제
- Knowledge Graph
- 복잡한 Roadmap

첫 단계에서 학습 흐름과 UX를 실제 사용해 검증한 뒤 다음 단계로 확장한다.
