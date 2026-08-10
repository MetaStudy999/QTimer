# QTimer Learning Flow

## 1. 기본 학습 루프

`문제 → 답 → 시간 → 채점 → 확신 → 취약분류 → 해설/인출 → 재출제 → 숙달`

QTimer는 단순 정답률보다 **정오 + 확신 + 시간**을 함께 본다.

## 2. 상태 3축

### 정오
- correct
- wrong
- unknown / unanswered

### 확신
- confident
- ambiguous

### 시간
- in_limit
- over_limit / timeout

예:

- `correct + confident + in_limit` → 숙달 후보
- `correct + ambiguous + in_limit` → 취약
- `correct + confident + over_limit` → 속도 취약
- `wrong + confident` → 개념오류 고위험

## 3. 빠른 회독

목표: 전체 범위를 빠르게 한 번 통과하면서 취약문제를 수집한다.

기본:
- Hard Limit 20~30초 또는 사용자 설정값
- 제한시간 초과 시 TIME OUT 기록
- 선택한 답이 있으면 답은 보존
- 0.5~0.7초 정도 상태 표시 후 다음 문제 자동 이동 가능

TIME OUT은 자동 오답이 아니다.

## 4. 취약 회독

기본 Soft Limit.

우선순위:
1. 반복오답
2. 확실오답
3. 모름
4. 최근 오답
5. 애매
6. 정답이지만 느린 문제

한 문제에 너무 오래 머무르지 않으며, 필요할 때만 해설 깊이를 올린다.

## 5. 해설 깊이

### Level 1 — FINAL KEY
5초 내 확인 가능한 핵심 한 줄.

### Level 2 — 핵심/구별
- 핵심 개념
- 정답 이유
- 헷갈린 선택지 차이

### Level 3 — 상세
- 문제집 전체 해설
- AI 상세 해설
- 관련 개념
- 비교표
- 빈칸/변형문제

기본은 Level 1 또는 2로 시작한다.

## 6. 빈칸 인출

취약개념에만 제한적으로 사용한다.

추천 생성량:
- 확실·빠른 정답: 생성 안 함
- 애매: 빈칸 1
- 오답: 빈칸 1
- 모름: 짧은 설명 + 빈칸 1
- 반복오답: 빈칸 1~2 + 변형 객관식 1

힌트를 사용해서 맞힌 경우 숙달 검증에서는 약하게 평가하거나 제외한다.

## 7. AI Learning Packet

취약문제에 대해 필요 시 다음을 생성한다.

- keyword
- summary
- correct_reason
- distractor_analysis
- discrimination_point
- final_key
- cloze_questions
- generated_questions

반복오답/지속 애매 문제에 우선 적용한다.

## 8. 숙달 규칙

기본:

`2회 연속 correct + 두 번 모두 confident + 두 번 모두 in_limit → MASTERED`

다음은 숙달 처리하지 않는다.
- ambiguous
- timeout/over
- 힌트 사용으로 맞힌 빈칸

필요한 경우 반복오답 문제는 AI 변형문제로 개념 전이를 추가 검증할 수 있다.

## 9. 시험 직전 압축

핵심 목표는 취약집합의 크기를 줄이는 것이다.

예:

`500 → 170 → 63 → 21`

시험 직전 우선순위:
- 반복오답
- 확실오답
- 모름
- 지속 애매
- 느린 문제
- FINAL KEY

새로운 범위를 과도하게 늘리지 않는다.
