# ADR-003: 다중 출처 정답 검증

상태: Accepted
날짜: 2026-08-11

## Context

사진 기반 문제 등록에서는 AI/OCR이 정답을 잘못 읽을 수 있다. 또한 문제집 자체의 정답이나 해설에도 오류가 있을 수 있다.

따라서 하나의 정답 값을 덮어쓰는 구조는 신뢰성과 추적성을 떨어뜨린다.

## Decision

문제마다 다음 정답 값을 분리 보존한다.

- source_answer: 문제집/정답지 원본 표기
- ai_detected_answer: AI Vision/OCR이 읽은 정답
- ai_reasoned_answer: AI가 문제를 독립적으로 풀어 판단한 답
- user_verified_answer: 사용자가 원본과 비교해 확정한 답
- effective_answer: 실제 채점에 사용하는 최종 답

정답 상태:
- unverified
- auto_matched
- needs_review
- user_verified
- source_error_suspected
- source_error_confirmed

## 검증 Queue 조건

다음은 자동으로 검토 대상으로 보낸다.

- source_answer와 ai_reasoned_answer 불일치
- AI/OCR 인식 신뢰도가 낮음
- 정답 번호가 선택지 범위를 벗어남
- 복수정답 가능성
- 선택지 인식 이상
- 사용자의 문제/정답 이상 신고
- 교재 오류 의심

정상 일치 문제를 사용자가 매번 확인하도록 요구하지 않는다.

## 원본 보존

각 문제는 Drive 원본 문제/정답 이미지와 연결한다.

검증 UI에서 원본 이미지와 추출값/AI 판단을 함께 비교할 수 있어야 한다.

## 변경 이력

정답 수정 시 이전 값을 삭제하지 않고 AnswerRevision에 기록한다.

최종 정답이 변경된 경우 과거 Attempt를 새로운 정답 기준으로 재채점할 수 있어야 한다. 다만 원래 사용자 답과 풀이시간 등 Attempt 원본은 수정하지 않는다.

## Why

- OCR 오류와 AI 추론 오류를 분리할 수 있다.
- 교재 오류 가능성을 탐지할 수 있다.
- 최종 채점 근거와 출처를 추적할 수 있다.
- 정답 수정 시 과거 학습 통계를 복구할 수 있다.
