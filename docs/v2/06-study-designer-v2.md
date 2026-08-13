# QTimer Study Designer V2

## 1. 설계 목표

Study Designer는 단순한 환경설정 창이 아니다.

사용자가 **실제 문제를 보면서** 다음 세 가지를 독립적으로 설계하는 도구다.

1. **Format** — 무엇을 어디에 보여줄 것인가
2. **Transform** — 콘텐츠를 학습용으로 어떻게 변환할 것인가
3. **Program** — 어떤 순서와 반복으로 실행할 것인가

핵심 원칙:

> `빈칸문제`라는 별도 문제 유형을 만들지 않는다. 원본 문제의 어느 Content Zone에도 Cloze Transform을 적용할 수 있다.

---

## 2. 화면 구조

Desktop:

```text
┌──────────────────────────── QTimer Study Designer ────────────────────────────┐
│ ← 답치기   [양식] [변환] [프로그램]                       Desktop Tablet Mobile │
├───────────────────────────────────────────────────┬──────────────────────────┤
│                                                   │ Inspector                │
│  LIVE PREVIEW                                     │                          │
│                                                   │ 현재 탭: 변환            │
│  ┌─ 문제 ─────────────────────────────────────┐  │                          │
│  │ 다음 중 데이터베이스의 정규화에 대한 ... │  │ 대상 콘텐츠             │
│  └────────────────────────────────────────────┘  │ ● 문제                  │
│                                                   │ ○ 지문                  │
│  ┌─ 지문 / 보기 ──────────────────────────────┐  │ ○ 선택지                │
│  │ 다음 자료를 참고하여 ...                  │  │ ○ 정답                  │
│  └────────────────────────────────────────────┘  │ ○ 핵심                  │
│                                                   │ ○ 해설                  │
│  ┌─ 선택지 ───────────────────────────────────┐  │                          │
│  │ ① ...                                      │  │ 변환                    │
│  │ ② ...                                      │  │ [빈칸] [형광펜] [숨김] │
│  │ ③ ...                                      │  │                          │
│  │ ④ ...                                      │  │ 선택된 텍스트           │
│  └────────────────────────────────────────────┘  │ “제2정규형”             │
│                                                   │ [빈칸 만들기]           │
│  ┌─ 핵심 ─────────────────────────────────────┐  │                          │
│  │ 부분 함수 종속 제거                       │  │ 빈칸 목록               │
│  └────────────────────────────────────────────┘  │ 1. 문제 · 제2정규형     │
│                                                   │ 2. 해설 · 부분 함수...  │
│  ┌─ 해설 ─────────────────────────────────────┐  │                          │
│  │ 제2정규형은 ...                           │  │ 공개: 정답 확인 시 ▼   │
│  └────────────────────────────────────────────┘  │                          │
├───────────────────────────────────────────────────┴──────────────────────────┤
│ Space 진행 | O 맞음 | A 애매 | X 틀림                            자동 저장됨 │
└──────────────────────────────────────────────────────────────────────────────┘
```

Tablet:

```text
┌──────────── Preview ────────────┐
│                                 │
│ 실제 문제                       │
│                                 │
├─────────────────────────────────┤
│ Inspector (bottom sheet)        │
└─────────────────────────────────┘
```

Mobile:

```text
Header
Preview
Preview
Preview
──────────────
[편집] 고정 버튼

편집 시 Bottom Sheet
```

---

## 3. 핵심 UX — Selection First Cloze

### 잘못된 기존 흐름

```text
빈칸문제 선택
→ 빈칸 수 1~4 선택
→ 시스템이 핵심어를 추측
```

문제점:
- 어느 영역을 빈칸으로 할지 표현할 수 없음
- 같은 단어가 여러 번 나오면 위치가 불명확
- 긴 해설/지문에서 원하는 구절을 지정하기 어려움
- 자동 핵심어가 틀리면 사용자가 수정하기 번거로움

### V2 기본 흐름

```text
실제 Preview에서 텍스트 드래그
       ↓
선택된 Content Zone + Range 계산
       ↓
[빈칸 만들기]
       ↓
예상 정답 자동 입력 = 선택했던 원문
       ↓
공개 정책 선택
       ↓
즉시 Live Preview 반영
```

예:

```text
Zone: explanation
Range: 14..22
Expected: "부분 함수 종속"
Placeholder: "________"
Reveal: with-answer
```

저장 시 원문을 잘라내지 않는다.

---

## 4. 지원 Content Zone

### 문제 `stem`
문제 본문 자체.

### 지문 `passage`
보기, 사례, 코드 전 설명, 표/자료에 대한 텍스트 설명 등 문제 stem과 분리된 공통 지문.

### 선택지 `choice[n]`
각 선택지를 독립 target으로 다룬다.

### 정답 `answer`
정답 표현 자체를 회상 대상으로 사용할 때.

### 핵심 `finalKey`
짧은 핵심 개념 회상.

### 해설 `explanation`
문제집 해설을 능동 회상 자료로 바꿀 때.

### 메모 `note`
향후 사용자 개인 메모.

---

## 5. 한 문제에 여러 빈칸

같은 문제에서 다음이 가능하다.

```text
문제 stem      → 빈칸 1개
지문 passage   → 빈칸 2개
선택지 ②       → 빈칸 1개
핵심 finalKey  → 빈칸 1개
해설           → 빈칸 3개
```

각 target은 독립 ID를 가진다.

겹치는 range는 저장하지 않고 즉시 오류를 표시한다.

---

## 6. 자동 빈칸은 보조 기능

버튼:

```text
[직접 선택]  [자동 후보]
```

`자동 후보`는 다음만 수행한다.

1. 후보 구절 제안
2. Preview에 점선 표시
3. 사용자가 선택/해제
4. 확인 후 실제 Cloze target 생성

자동 후보가 곧 저장 데이터가 되어서는 안 된다.

---

## 7. 빈칸 Inspector

한 target 선택 시:

```text
빈칸 #3
─────────────────
영역       해설
원문       부분 함수 종속
위치       24 ~ 31
표시       ________

허용 답안
[부분 함수 종속        ]
[+ 허용답안]

정답 공개
○ 수동
● 정답 확인 시
○ 특정 프로그램 단계
○ 항상 공개

[삭제]
```

향후 허용답안 정책:
- exact
- trim
- case-insensitive (영문)
- alias

Foundation에서는 선택 원문이 기본 accepted answer다.

---

## 8. Format Tab

Format은 Transform과 완전히 분리한다.

```text
보이는 영역
☑ 문제
☑ 지문
☑ 선택지
☑ 정답
☑ 핵심
☑ 해설

배치
○ 위아래
● 좌우

좌측 영역 62%
────────●──────

좌측
[문제] [지문] [선택지]

우측
[정답] [핵심] [해설]
```

`빈칸` 체크박스는 Format에 존재하지 않는다.

---

## 9. Transform Tab

초기 Transform:

```text
Cloze      빈칸
Highlight  강조
Hide       감추기
Reveal     공개
```

V2 첫 구현 우선순위:
1. Cloze
2. Reveal
3. Highlight
4. Hide

---

## 10. Program Tab

예:

```text
1  양식 표시     문제 중심
2  변환 적용     문제+지문 빈칸
3  반복 시작     × 2
4    양식 표시   문제 중심
5    변환 적용   해설 빈칸
6    공개        정답 확인 시 대상
7  반복 끝
8  변환 해제
9  양식 표시     전체 해설
10 평가          O / A / X
```

Program은 Format과 Transform 내부 데이터를 복사하지 않고 ID를 참조한다.

---

## 11. Preview와 실제 학습 화면의 동일성

### 금지

```text
Editor Preview Renderer A
실제 답치기 Renderer B
```

이 구조는 시간이 지나면 미리보기와 실제 화면이 달라진다.

### V2

```text
QuestionModel
   +
Format
   +
Transforms
   ↓
StudyViewModel
   ↓
Shared Study Renderer
   ├─ Designer Preview
   └─ Actual Study
```

동일 Renderer를 사용한다.

---

## 12. 미리보기 안전성

Designer Preview는 다음을 바꾸지 않는다.

- current question position
- Dapchigi round
- O/A/X history
- normal attempts
- timer
- SOURCE BANK

Preview에서 Program을 시험할 때는 별도 `SimulationSession`을 사용한다.

---

## 13. Undo / History

양식/변환 편집은 최소 다음을 지원한다.

```text
Ctrl/Cmd + Z     편집 Undo
Ctrl/Cmd + Shift + Z Redo
```

Study Attempt Undo와 Designer Undo는 서로 다른 history stack이다.

---

## 14. 저장 단위

```text
FormatRepository
TransformRepository
ProgramRepository
PreferencesRepository
```

Designer는 저장키를 직접 알지 않는다.

각 편집은 Application Command로 전달한다.

---

## 15. 오류 UX

### 겹치는 빈칸

```text
이 범위는 기존 빈칸과 겹칩니다.
[기존 빈칸 보기]
```

### 원문 변경으로 range 불일치

SOURCE BANK version 변경 시:

```text
이 빈칸의 원문 위치를 다시 확인해야 합니다.
저장 당시: “부분 함수 종속”
현재 후보: 2곳
[다시 연결]
```

silent remap 금지.

---

## 16. 접근성

- 모든 편집 기능 keyboard 접근 가능
- 색상만으로 선택 상태를 표현하지 않음
- focus ring 유지
- high contrast 대응
- reduce motion 대응
- text selection 이후 keyboard로 `빈칸 만들기` 실행 가능

권장 단축키:

```text
Alt+B       선택 범위 빈칸
Delete      선택된 Transform target 삭제
Esc         Inspector/선택 해제
Ctrl+Z      Designer Undo
```

기존 학습 단축키와 충돌 시 Designer가 열린 동안 Designer scope가 우선한다.

---

## 17. 구현 순서

### Slice 1
- Shared StudyView Renderer
- Read-only V2 Preview

### Slice 2
- Zone detection
- text Range selection
- `[빈칸 만들기]`
- Target list

### Slice 3
- Format layout editor
- split ratio
- visible zone editor

### Slice 4
- Program V2 visual builder

### Slice 5
- Designer Undo/Redo
- Import/Export
- simulation

---

## 18. 완료 기준

다음 시나리오가 한 문제에서 모두 성공해야 한다.

```text
문제의 “정규화”를 빈칸
지문의 “이상 현상”을 빈칸
2번 선택지의 “부분 함수 종속”을 빈칸
FINAL KEY의 핵심 문구를 빈칸
해설의 문장 일부를 빈칸
```

그리고:
- Preview = 실제 학습 표시
- SOURCE BANK 원문 불변
- 편집 중 Attempt/OAX 불변
- 저장/백업/복원 후 동일 range 복구
- 키보드로 전체 작업 가능

이 조건을 만족하기 전에는 `빈칸문제 기능 완료`로 간주하지 않는다.
