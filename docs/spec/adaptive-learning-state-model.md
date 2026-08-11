# QTimer Adaptive Learning State Model

기준일: 2026-08-12
상태: 구현 전 기술 명세 초안

이 문서는 `docs/planning/adaptive-learning-system-v1.md`를 구현 가능한 상태 모델로 구체화한다.

## 1. 목적

QTimer는 하나의 정답률 대신 문제·단원·과목 상태를 여러 축으로 관리한다.

핵심 구분:

- 학습 중 수행과 무힌트 평가를 분리
- 즉시 수행과 지연 유지력을 분리
- 점수와 측정 신뢰도를 분리
- 시험 중요도와 사용자 취약도를 분리
- 공식 합격 기준과 QTimer 내부 숙달 기준을 분리

## 2. Attempt 확장 필드

기존 Attempt에 다음 개념을 추가한다.

- `attempt_mode`
  - `learning`
  - `assessment`
  - `mock_exam`
- `exposure_state`
  - `answer_preexposed`
  - `keyword_hint`
  - `cloze_hint`
  - `step_hint`
  - `unassisted`
- `confidence`
  - `confident`
  - `ambiguous`
  - `unknown`
- `feedback_timing`
  - `immediate`
  - `end_of_item_set`
  - `end_of_exam`
- `error_reason` optional
  - `concept_unknown`
  - `choice_confusion`
  - `misread`
  - `calculation_error`
  - `forgotten`
  - `time_pressure`
  - `misconception`
- `variant_kind`
  - `source`
  - `training_variant`
- `assistance_level` 0~6

기존 필드의 `hint_used`, `elapsed_ms`, `within_limit`, `timed_out`, `is_correct`는 유지한다.

## 3. Question 메타데이터 확장

원본 문제를 변경하지 않고 별도 메타 레이어에서 관리하는 것을 권장한다.

### QuestionLearningMetadata

- `question_id`
- `concept_tags[]`
- `prerequisite_concepts[]`
- `item_type`
- `repeat_level` R0~R5
- `difficulty_base` D1~D5
- `recency_score` 0~100
- `exam_importance` 0~100
- `source_confidence`
  - S / A / B / C / I
- `negative_stem` boolean
- `key_phrases[]`
- `distractor_concepts[]`

초기에는 수동/규칙 기반 태그를 허용하고 이후 자동화한다.

## 4. 문제 상태

### QuestionLearningState

- `unmeasured`
- `encoding`
- `cued_recall`
- `retrieval_unstable`
- `retrieval_stable`
- `transfer_candidate`
- `retention_candidate`
- `mastered`
- `needs_repair`

`mastered`는 단일 100점이나 단일 정답으로 만들지 않는다.

## 5. 핵심 지표

### 5.1 Learning Score

도움을 포함한 학습 중 수행을 나타낸다.

사용 목적:

- 초기 입력 진행도
- 답치기/빈칸/힌트 단계의 성과

Mastery로 직접 사용하지 않는다.

### 5.2 Mastery Score

무힌트 또는 낮은 도움 상태의 최근 정답률, 확신, 시간, 반복 안정성을 사용한다.

초기 예시 휴리스틱:

- 무힌트 정확도: 50%
- 확신 calibration: 15%
- 목표시간 달성: 10%
- 최근 반복 안정성: 15%
- 오개념/확실오답 penalty: 10%

정확한 가중치는 사용자 데이터로 조정한다.

### 5.3 Retention Score

학습 직후가 아닌 지연 재시험 성과를 중심으로 한다.

고려 항목:

- 마지막 학습 이후 경과시간
- 지연 재시험 정답
- 지연 재시험 확신
- 지연 재시험 반응시간
- 반복 간격에 따른 성능 유지

### 5.4 Transfer Score

원본 문제의 정답 위치/문장 암기가 아닌 개념 전이를 측정한다.

고려 항목:

- 선택지 순서 변경 문제
- 동일개념 다른 표현
- 상황형 변형
- 코드/SQL 입력값 변형

Training Variant 문제는 SOURCE BANK와 구분한다.

### 5.5 Exam Readiness

과목/시험 수준에서 다음을 결합한다.

- Mastery
- Retention
- Transfer
- 시간 안정성
- 범위 Coverage
- 과락 위험
- 최근 CBT 성과

Exam Readiness는 공식 합격확률이 아니라 QTimer 내부 준비도 지표로 표시한다.

## 6. 측정 신뢰도

모든 단원/과목 점수에는 `confidence_of_measurement` 또는 `coverage`를 함께 둔다.

기본 신호:

- 전체 문항 중 측정 문항 비율
- 최근 데이터 개수
- 문제유형 다양성
- 무힌트 평가 비율
- 지연 평가 포함 여부

예:

`숙달도 82 / 측정신뢰도 낮음 / 8 of 52 measured`

미측정은 `0`이 아니라 `unmeasured`로 표시한다.

## 7. 확신-정확도 해석

| 정오 | 확신 | 내부 분류 |
|---|---|---|
| 정답 | 확실 | stable candidate |
| 정답 | 애매 | unstable knowledge |
| 정답 | 모름/추측 | low-confidence correct |
| 오답 | 확실 | confident error / misconception risk |
| 오답 | 애매 | weak |
| 오답 | 모름 | unlearned |

`오답 + 확실`을 높은 우선순위로 처리한다.

## 8. 취약 우선순위

초기 규칙 예:

1. 반복 확실오답
2. 확실오답
3. 반복오답
4. 모름
5. 최근 오답
6. 맞았지만 애매
7. 맞았지만 목표시간 초과
8. 장기 유지 하락

문제별 `risk_score`는 위 요소를 가중 결합한다.

## 9. 시험 중요도와 사용자 취약도 분리

### ExamImportance

- repeat_level
- recency_score
- 출제기준 중요도
- concept centrality
- 문제유형 중요도

### UserWeakness

- mastery gap
- confident error
- repeated wrong
- ambiguous rate
- response-time penalty
- retention loss
- transfer failure

### LearningPriority

개념적 형태:

`LearningPriority = ExamImportance × UserWeakness × CoverageNeed × PassRiskAdjustment`

정확한 식은 v1 구현에서 단순 가중합으로 시작한다.

## 10. 학습 ROI

`LearningROI = expected_improvement / estimated_learning_time`

초기에는 실제 예측모델이 아니라 규칙 기반 휴리스틱으로 사용한다.

예:

- 고빈출 + 현재 취약 + 짧은 학습시간 → 높은 ROI
- 저빈출 + 매우 어려움 + 장시간 필요 → 시험 직전 낮은 ROI

## 11. 점수별 기본 정책

아래는 공식 시험 합격선이 아니라 내부 제어 구간이다.

| Mastery | 기본 정책 |
|---:|---|
| unmeasured | 5~10문항 진단 |
| 0~39 | 입력/답치기/Worked Example |
| 40~59 | 예측+정답+빈칸 |
| 60~74 | 변별/취약 집중 |
| 75~84 | 무힌트 단원시험 |
| 85~94 | 간격복습/혼합 |
| 95~100 | 지연 평가 전까지 과잉반복 억제 |

## 12. 상황별 override 정책

### 12.1 확실오답 많음

- 즉시 피드백
- 정답 이유 한 줄
- 혼동 선택지 비교
- 짧은 지연 재출제
- 후속 세션 재출제

### 12.2 맞지만 애매 많음

- 유사개념 변별
- 정답 근거 회상
- 확신 calibration

### 12.3 정확하지만 느림

- 답치기보다 무힌트 속도훈련
- Soft Limit → Hard Limit 점진 전환

### 12.4 직후 점수 높고 지연 점수 낮음

- Spacing 강화
- 지연 재시험 비중 증가
- 즉시 반복 감소

### 12.5 학습모드 높고 CBT 낮음

- 시험 모드 노출 증가
- 시험 종료 후 일괄 피드백
- 과목 혼합 증가

### 12.6 반복 정체

- 동일 문제 반복 대신 원인 유형/선행개념 분리
- 학습 방식 변경

## 13. Assistance Fading 상태

- `L0`: 답 + 핵심어 + 해설
- `L1`: 답 + 핵심어
- `L2`: 정답 빈칸
- `L3`: 핵심어만
- `L4`: 무힌트 문제
- `L5`: 변형문제
- `L6`: 제한시간 실전

상승 조건:

- 최근 성과 안정
- 확신 개선
- 시간 개선

하강 조건:

- 확실오답
- 반복오답
- 지연 유지 실패

## 14. Interleaving 정책

초기 규칙:

- Mastery < 60: blocked
- 60~74: 유사 개념 interleaving
- 75~89: 과목 내 interleaving
- 90+: 과목 간 실전 혼합

무작위 혼합이 학습 목적을 해치지 않도록 concept similarity를 고려한다.

## 15. Plateau 감지

초기 휴리스틱 예:

- 최소 3회 이상 측정
- 최근 점수 개선폭이 작음
- 동일 유형/개념의 오류가 지속

Plateau 발생 시:

- 문제 수 단순 증가 금지
- error_reason 확인
- concept tag drill-down
- prerequisite 확인
- 학습 방식 교체

## 16. 세션 품질/피로 신호

다음은 진단이 아니라 세션 품질 신호로만 사용한다.

- 최근 반응시간 급증
- 쉬운 문제 오답 증가
- ambiguous 증가
- 연속오답 증가

대응:

- 신규 고난도 감소
- 짧은 복습
- 시간압박 완화
- 세션 종료 권장

## 17. Roadmap 상태

### RoadmapInput

- exam_date
- available_minutes_per_day
- target_level
- current subject/node states
- recent growth
- retention states
- exam importance
- coverage

### RoadmapTask

- content_node_id / question_set
- mode
- item_count
- estimated_minutes
- reason
- priority_score
- recheck_at

Roadmap은 매 세션/일 단위로 재계산 가능하다.

## 18. 완료 판정

단원 완료는 최소 다음을 확인한다.

- 충분한 Coverage
- 무힌트 정확도
- 낮은 ambiguous
- confident error 0 또는 허용치 이하
- 목표 시간 안정
- 지연 재시험 통과

필요 시 Transfer까지 요구한다.

## 19. UI에 노출할 최소 상태

사용자에게 내부 점수 전체를 강제하지 않는다.

기본 노출:

- 현재 상태
- 측정 신뢰도
- 왜 위험한지
- 다음 추천 행동

고급 분석 화면에서만 Mastery/Retention/Transfer/Exam Readiness를 상세 표시한다.

## 20. 초기 구현 원칙

- 처음부터 복잡한 ML Knowledge Tracing을 도입하지 않는다.
- explainable rule-based score로 시작한다.
- 원본 Attempt를 보존한다.
- 계산 결과는 재생성 가능하게 한다.
- threshold와 가중치는 설정/버전 관리한다.
- 사용자 데이터가 쌓인 뒤 모델을 교체할 수 있는 구조로 둔다.
