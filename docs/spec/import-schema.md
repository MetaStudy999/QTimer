# QTimer Question Import Schema v0.1

기준일: 2026-08-11

Drive 사진 → AI Vision/OCR → QTimer 사이의 공통 교환 형식이다.

## 필수 필드

```json
{
  "id": "sujebi-2026-sw-design-13",
  "book": "수제비 2026 정보처리기사 필기",
  "subject": "01_소프트웨어설계",
  "source_question_no": 13,
  "source_page": "1-74",
  "question_type": "single_choice",
  "question_text": "...",
  "choices": ["...", "...", "...", "..."],
  "source_image_url": "https://drive.google.com/...",
  "source_answer": 3,
  "ai_detected_answer": 3,
  "ai_reasoned_answer": 3,
  "effective_answer": 3,
  "answer_status": "auto_matched",
  "extraction_status": "ready"
}
```

## 정답 검증 원칙

- `source_answer`: 문제집 정답지/페이지에서 읽은 값
- `ai_detected_answer`: AI Vision/OCR이 정답 표기를 인식한 값
- `ai_reasoned_answer`: AI가 문제 내용을 독립적으로 풀어 판단한 값
- `user_verified_answer`: 사용자가 원본과 비교해 확정한 값(선택)
- `effective_answer`: 현재 QTimer 채점에 사용하는 값

원본 값은 수정 시에도 덮어쓰지 않는다.

## 상태

### extraction_status
- `pending`
- `ready`
- `needs_review`
- `failed`

### answer_status
- `unverified`
- `auto_matched`
- `needs_review`
- `user_verified`
- `source_error_suspected`
- `source_error_confirmed`

## 자동 검토 Queue 조건

다음 중 하나라도 해당하면 `needs_review`로 보낸다.

- 문제번호 미검출/중복
- 문제 본문 잘림
- 선택지 수 이상
- 정답 번호 범위 이상
- source_answer와 ai_detected_answer 불일치
- source_answer와 ai_reasoned_answer 불일치
- 표/그림과 문제 연결 불확실
- 사용자가 문제/정답 이상 플래그 지정

## progressive import

전체 교재 변환 완료를 기다리지 않는다.

`이미지 묶음 → 문항 추출 → 검증 → ready 문항 즉시 학습 가능`

예를 들어 50문항이 ready가 되면 나머지 사진을 처리하는 동안에도 QTimer에서 해당 50문항의 회독을 시작한다.
