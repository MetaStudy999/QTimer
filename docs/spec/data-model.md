# QTimer Data Model

## 1. 원칙

- Question은 상대적으로 정적이다.
- Attempt는 풀이할 때마다 새로 추가한다(append-only).
- 과거 Attempt를 덮어쓰지 않는다.
- QuestionProgress는 현재 상태 요약이며 초기에는 계산값으로 둘 수 있다.
- 원문제번호는 전역 ID로 사용하지 않는다.
- 정답 원본/AI 인식/AI 판단/사용자 검증/최종 채점값을 분리한다.

## 2. 주요 엔터티

### Exam
- id
- name
- exam_date
- metadata

### Book
- id
- exam_id
- title
- publisher
- edition

### ContentNode
목차를 고정 대/중/소 컬럼 대신 트리로 관리한다.

- id
- book_id
- parent_id
- name
- depth
- sort_order

### Question
- id (UUID)
- book_id
- content_node_id
- source_question_no
- source_page
- question_type
- question_text (optional)
- choices (optional)
- choice_count
- source_image_url
- answer_image_url
- source_explanation
- ai_explanation
- discrimination_point
- final_key
- keyword
- extraction_status
- created_at

문제유형:
- single_choice
- multiple_choice
- true_false
- cloze
- short_answer
- subjective

### AnswerVerification
- question_id
- source_answer
- ai_detected_answer
- ai_reasoned_answer
- user_verified_answer
- effective_answer
- answer_status
- answer_source
- confidence
- verified_by
- verified_at
- verification_note

answer_status 예:
- unverified
- auto_matched
- needs_review
- user_verified
- source_error_suspected
- source_error_confirmed

### AnswerRevision
- id
- question_id
- previous_answer
- new_answer
- reason
- evidence
- changed_at

### StudySession
- id
- user_id
- mode
- book_id / content_node_id
- timer_policy
- default_time_limit_ms
- started_at
- ended_at
- current_position
- status

mode 예:
- rapid_round
- learn
- practice
- mock_exam
- weak_focus

### Attempt
- id
- user_id
- session_id
- question_id
- started_at
- ended_at
- elapsed_ms
- time_limit_ms
- within_limit
- timed_out
- user_answers
- graded_answer_version/reference
- is_correct
- confidence
- ambiguous
- hint_used
- validity
- error_reason
- created_at

validity:
- valid
- invalid

### QuestionProgress
- user_id
- question_id
- attempt_count
- correct_streak
- wrong_count
- ambiguous_count
- timeout_count
- last_result
- last_confidence
- last_elapsed_ms
- mastery_status
- risk_score
- last_attempt_at

### UserDisplayProfile
- user_id
- preset
- font_family_question
- font_family_choice
- font_family_explanation
- font_size_question
- font_size_choice
- font_size_explanation
- font_weight_question
- line_height
- letter_spacing
- highlight_selected
- highlight_correct
- highlight_wrong
- highlight_ambiguous
- highlight_keyword
- highlight_final_key
- highlight_style

## 3. 정답 표현

정답은 배열 기반으로 일반화한다.

- 단일선택: `[3]`
- 복수선택: `[2,4,5]`
- 빈칸: 대표정답 + 허용답안 목록

복수선택 채점 정책:
- exact_match (기본)
- partial
- manual

## 4. 이미지/OCR 추출 상태

extraction_status 예:
- pending
- ready
- needs_review
- failed

검토필요 조건 예:
- 문제번호 인식 실패
- 본문 잘림
- 선택지 수 이상
- 정답 범위 이상
- 중복 번호
- 표/그림 연결 불확실

각 문제는 원본 Drive 이미지와 연결하여 언제든 비교할 수 있어야 한다.

## 5. Google Workspace 매핑

초기 운영에서는 다음 역할을 사용한다.

### Google Drive
- 원본 문제 사진
- 정답지 사진
- 필요한 첨부 이미지

### Google Sheets
개념적 탭:
- EXAMS
- BOOKS
- CONTENTS
- QUESTIONS
- ANSWERS
- ATTEMPTS
- PROGRESS
- AI_QUEUE
- SETTINGS

### Google Docs
- 취약문제 해설집
- 과목별 또는 시험별 문서

Google Docs를 운영 DB로 사용하지 않는다.

## 6. 로컬 우선 원칙

타이머는 네트워크 지연에 의존하지 않는다.

`측정 → 브라우저 로컬 즉시 저장 → 다음 문제 → 백그라운드/배치 동기화`

네트워크 장애 중에도 풀이가 지속되어야 하며, 이후 동기화할 수 있도록 설계한다.
