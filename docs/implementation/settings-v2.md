# QTimer 환경설정 v2

기준일: 2026-08-12
상태: 구현 기준

## 목적

답치기 학습 화면을 사용자의 시각 선호와 읽기 조건에 맞게 조절한다.

환경설정은 학습 점수나 SOURCE BANK를 변경하지 않는 Presentation Layer로 유지한다.

## 화면 구조

### 문제 표시

- 기본
- 폰트 선택
- 폰트 크기
- 폰트 색상
- 강조 범위: 전체 / 핵심어
- 볼드
- 형광펜
- 형광펜 색상
- 실시간 미리보기

### 답 표시

- 기본
- 폰트 선택
- 폰트 크기
- 폰트 색상
- 강조 범위: 전체 / 핵심어
- 볼드
- 형광펜
- 형광펜 색상
- 답 마킹
- 답 핵심어 빨간색 + 볼드
- 실시간 미리보기

### 화면 크기

```text
<  작게  기본  크게  >
```

내부 값:

- `small`: 90%
- `normal`: 100%
- `large`: 110%

좌/우 화살표는 한 단계씩 이동한다.

## 폰트 정책

외부 폰트 파일이나 웹폰트를 다운로드하지 않는다.

선택지는 OS 폰트 스택으로 구성한다.

- `default`: 기존 QTimer 기본값 상속
- `gothic`: Noto Sans KR → Malgun Gothic → Apple SD Gothic Neo → system-ui
- `serif`: Noto Serif KR → Nanum Myeongjo → Batang → serif
- `mono`: D2Coding → Cascadia Mono → Consolas → monospace

현재 장치에 첫 번째 폰트가 없으면 다음 폰트로 자동 대체한다.

## 폰트 크기

- 기본
- 16px
- 18px
- 20px
- 22px
- 24px
- 28px
- 32px

문제와 답을 독립적으로 저장한다.

## 색상

기본값:

```text
문제 글자     #101828
문제 형광펜   #bfdbfe
답 글자       #101828
답 형광펜     #fecaca
답 핵심어     #d92d20
```

색상 선택은 HTML color input을 사용하며 설정 JSON에는 6자리 hex로 저장한다.

## 강조 조합

볼드와 형광펜은 독립 체크박스다.

예:

```text
볼드 OFF + 형광펜 OFF
볼드 ON  + 형광펜 OFF
볼드 OFF + 형광펜 ON
볼드 ON  + 형광펜 ON
```

`강조 범위`를 통해 전체 또는 핵심어에 적용한다.

기존 답치기의 `전체 볼드 / 핵심어 볼드 / 전체 형광펜 / 핵심어 형광펜` 기능은 Settings v2 조합으로 표현한다.

## 답 추가 강조

### 답 마킹

정답 위치를 테두리로 표시한다.

Settings v2에서는 일반 형광펜과 독립적으로 사용할 수 있다.

### 답 핵심어 빨간색 + 볼드

기존 기능을 유지한다.

- 정답 전체를 빨갛게 만들지 않는다.
- `finalKey`와 정답 선택지에 공통으로 존재하는 핵심 토큰만 빨간색/볼드 처리한다.
- 답 폰트 색상이나 형광펜 색상과 함께 사용할 수 있다.

## 실시간 미리보기

문제/답 카드 하단에서 현재 설정 결과를 즉시 확인한다.

사용자가 설정 화면과 답치기 화면을 반복 이동하지 않고 폰트, 크기, 색상, 강조 범위를 조정할 수 있게 한다.

## 저장 스키마

환경설정 전용 LocalStorage:

```text
qtimer-settings-v2
```

예:

```json
{
  "version": 2,
  "dapchigi": {
    "question": {
      "fontFamily": "gothic",
      "fontSize": "24",
      "fontColor": "#101828",
      "bold": true,
      "highlight": true,
      "highlightColor": "#bfdbfe",
      "emphasisScope": "keyword"
    },
    "answer": {
      "fontFamily": "default",
      "fontSize": "20",
      "fontColor": "#101828",
      "bold": true,
      "highlight": true,
      "highlightColor": "#fecaca",
      "emphasisScope": "all",
      "answerMark": true,
      "keywordRed": true
    }
  },
  "display": {
    "scale": "normal"
  },
  "updatedAt": "ISO-8601"
}
```

## v1 호환

Settings v2 로더는 다음 v1 구조를 읽을 수 있다.

```text
questionStyle
answerStyle
answerKeywordRed
```

자동 변환:

- `all-bold` → 전체 + 볼드
- `keyword-bold` → 핵심어 + 볼드
- `all-highlight` → 전체 + 볼드 + 형광펜
- `keyword-highlight` → 핵심어 + 볼드 + 형광펜
- `mark` → 답 마킹 + 전체 볼드 + 형광펜

설정 파일 가져오기는 `qtimer-settings` format version 1과 2를 모두 허용한다.

## 백업/복원

- 설정 변경 즉시 LocalStorage 자동 저장
- 설정 전용 JSON 저장/불러오기 유지
- 전체 QTimer `백업`에도 Settings v2 포함
- 전체 `복원`은 v1/v2 settings 객체 모두 수용
- `복원취소`는 Settings v2 snapshot도 함께 되돌린다.

## 데이터 안전 원칙

- 973문항 SOURCE BANK를 수정하지 않는다.
- 정답 provenance를 수정하지 않는다.
- 일반 평가 Attempt를 수정하지 않는다.
- 답치기 O/A/X 기록을 수정하지 않는다.
- 표시 설정은 점수/숙달도 산식에 사용하지 않는다.

## QA

GitHub Actions Settings Browser Smoke에서 다음을 검사한다.

- Settings v2 메뉴/API 로드
- 문제/답 폰트 선택
- 문제/답 폰트 크기
- 문제/답 글자색
- 볼드와 형광펜 독립 조합
- 전체/핵심어 강조 범위
- 사용자 형광펜 색상 실제 렌더링
- 답 마킹
- 답 핵심어 빨간색 + 볼드
- 화면 작게/기본/크게
- 자동 저장 및 새로고침 복원
- Settings v2 JSON export
- Settings v1 import migration

검증은 GitHub + GitHub Actions + Local WSL을 기준으로 하며 Vercel은 최종 Production 배포 전까지 사용하지 않는다.
