# QTimer Dapchigi Live Format Editor v1

## 목적

답치기 양식을 숫자/옵션만 보고 편집하지 않고, **실제 현재 문제를 보면서 즉시 디자인하는 WYSIWYG(What You See Is What You Get) 편집기**를 제공한다.

미리보기 조작은 SOURCE BANK, 현재 문제 위치, 회독, 일반 Attempt, Dapchigi O/A/X 기록을 변경하지 않는다.

## 기본 양식

초기 5개 양식을 제공한다.

1. 문제
2. 답
3. 문제/답
4. 문제/답/해설
5. 빈칸문제

기본 양식은 사용자가 직접 수정할 수 있고, 복제해 개인 양식을 만들 수 있다.

## 편집 화면

양식 편집기를 열면 전체 화면을 `Live Preview + 설정 패널`로 나눈다.

```text
┌──────────────────────── Live Preview ───────────────────────┬──── 양식 설정 ────┐
│ 실제 현재 문제                                              │ 양식 선택          │
│                                                            │ 이름               │
│ ┌──────────────── 문제 ────────────────┐                   │ 기본 구성          │
│ │ 문제 문장 / 선택지                   │                   │ 배치               │
│ └──────────────────────────────────────┘                   │ 영역 비율          │
│ ┌──────────────── 답 ──────────────────┐                   │ 선택지             │
│ │ 실제 정답                            │                   │ 답 표시            │
│ └──────────────────────────────────────┘                   │ 해설 표시          │
│                                                            │ 빈칸 수            │
│ [Desktop] [Tablet] [Mobile]                                │                    │
└────────────────────────────────────────────────────────────┴────────────────────┘
```

설정 변경은 `적용` 버튼 없이 즉시 저장·미리보기 반영한다.

## 실제 문제 기반 Preview

가능하면 `currentQuestion()`의 현재 답치기 문제를 그대로 사용한다.

- 문제 문장
- 선택지
- effective answer
- finalKey
- sourceExplanation

양식 편집기가 학습 상태를 바꾸지 않도록 별도 Preview DOM에 읽기 전용으로 렌더링한다.

## 표시 디자인과 구조 디자인 분리

기존 `표시 Aa`와 설정을 중복하지 않는다.

- **표시 Aa**: 문제/답/핵심어 폰트, 크기, 글자색, 형광펜
- **양식 편집**: 문제/답/해설/선택지의 구성, 배치, 비율, 표시 수준

Live Preview는 Settings v3 및 Focus Quick Settings의 CSS 변수를 그대로 상속하므로 현재 폰트/색상 설정을 실제와 같은 형태로 보여준다.

## 구조 편집 항목

### 기본 구성

- 문제
- 답
- 문제/답
- 문제/답/해설
- 빈칸문제

### 배치

- 위아래(stack)
- 좌우(split)

문제/답 계열에서 좌우 배치 시 첫 영역 비율을 35~80% 범위에서 조절한다.

### 선택지

문제/빈칸 양식에서 선택지 표시 여부를 즉시 전환할 수 있다.

### 답 표시 수준

- 번호만
- 정답 내용만
- 번호 + 정답

### 해설 표시 수준

- 숨김
- 핵심만
- 핵심 + 문제집 해설

### 빈칸

v1 Preview에서는 문제 stem 자체에서 도출한 핵심 후보를 1~4개 빈칸으로 바꿔 디자인을 확인한다. SOURCE BANK 원문은 수정하지 않는다.

## 반응형 Preview

브라우저 창 크기를 직접 바꾸지 않고 Preview Canvas 폭만 바꾼다.

- Desktop: 최대 1180px
- Tablet: 최대 820px
- Mobile: 최대 390px

따라서 사용자는 같은 편집 화면에서 반응형 레이아웃을 즉시 비교할 수 있다.

## 저장

저장키:

```text
qtimer-dapchigi-formats-v1
```

개념 구조:

```json
{
  "version": 1,
  "selectedFormatId": "fmt-question-answer",
  "previewDevice": "desktop",
  "formats": [
    {
      "id": "fmt-question-answer",
      "name": "문제/답",
      "type": "question-answer",
      "layout": "split",
      "ratio": 68,
      "showChoices": true,
      "explanation": "hidden",
      "answerMode": "both",
      "blankCount": 1
    }
  ]
}
```

## Program Builder와의 관계

v1의 책임은 **양식을 만들고 실제 문제로 미리보는 것**까지다.

다음 연결 단계에서는 Program Builder에 `양식 표시` 실행 블록을 추가하고 이 저장소의 format id를 참조한다.

```text
Format Engine = 무엇을/어떻게 보여줄 것인가
Program Engine = 어떤 순서/반복으로 보여줄 것인가
```

두 엔진을 분리해 SOURCE BANK와 Dapchigi Attempt schema를 건드리지 않는다.

## QA

Browser E2E에서 다음을 검증한다.

- 기본 5개 양식 로드
- 실제 현재 문제 Live Preview 렌더
- 답 전용 양식
- 문제/답 좌우 배치 및 영역 비율 즉시 반영
- 선택지 ON/OFF 즉시 반영
- 문제/답/해설 실제 해설 표시
- 빈칸 수 변경
- Desktop/Tablet/Mobile Preview
- 양식 복제/이름 변경/persistence
- 편집 전후 현재 문제 index, question id, Dapchigi Attempt 수 불변

## 후속 확장

v1 검증 후 순차적으로 검토한다.

1. Program Builder `양식 표시` 블록 연결
2. Drag & Drop Zone 배치
3. 미리보기에서 영역 경계 직접 드래그 리사이즈
4. 사용자 지정 빈칸 텍스트 선택
5. 양식 단독 Import/Export
6. A/X 조건별 양식 자동 전환
