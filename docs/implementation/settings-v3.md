# QTimer 환경설정 v3 — 학습 색상 테마와 10단계 화면 크기

기준일: 2026-08-12
상태: 구현 기준

## 목적

Settings v2의 문제/답 독립 표시 설정을 유지하면서 다음을 추가한다.

- 문제용 권장 색상 테마 5개
- 답용 권장 색상 테마 5개
- 테마 선택 후 세부 색상 사용자 지정
- 화면 크기 10단계 조절
- Settings v1/v2 파일과 전체 백업 호환

973문항 SOURCE BANK와 학습 Attempt schema는 변경하지 않는다.

## 테마 설계 원칙

테마는 특정 색상이 학습 성과를 보장한다는 의미가 아니다.

QTimer의 권장 프리셋으로서 다음을 우선한다.

- 글자와 형광펜 배경의 충분한 시각적 구분
- 문제와 답을 서로 다른 색상 계열로 구별
- 장시간 학습에서 지나치게 강한 채도를 피함
- 핵심어/전체 강조 설정과 함께 사용 가능
- 테마 선택 후 사용자가 색상을 직접 수정 가능

테마는 `fontColor + highlightColor` 한 쌍을 기본으로 하며 선택 시 형광펜을 활성화한다.

## 문제 테마 5개

| 테마 | 글자색 | 형광펜 | 목적 |
|---|---|---|---|
| 집중 블루 | `#16324f` | `#dceeff` | 차분한 청색 대비 |
| 안정 민트 | `#143d36` | `#ddf5ec` | 장시간 읽기용 저자극 |
| 기억 옐로우 | `#3a3218` | `#fff1a8` | 핵심 문장 재인 강화 |
| 저자극 라벤더 | `#332a55` | `#eae4ff` | 시각적 구역 구분 |
| 고대비 그레이 | `#111827` | `#e5e7eb` | 명확한 문자 대비 |

## 답 테마 5개

| 테마 | 글자색 | 형광펜 | 목적 |
|---|---|---|---|
| 정답 코랄 | `#7a241f` | `#ffe0dc` | 정답 영역을 부드럽게 분리 |
| 핵심 레드 | `#991b1b` | `#fee2e2` | 정답 핵심의 빠른 인지 |
| 확인 앰버 | `#78350f` | `#fef3c7` | 검토·확인 단계 강조 |
| 안정 그린 | `#14532d` | `#dcfce7` | 정답 확인의 안정적 대비 |
| 고대비 네이비 | `#172554` | `#dbeafe` | 강한 대비와 가독성 |

답의 `답 핵심어 빨간색 + 볼드`는 테마와 별도 옵션으로 유지한다.

## 사용자 지정 전환

테마 선택 후 다음 색상을 직접 바꾸면 현재 테마 일치 여부를 다시 계산한다.

- 폰트 색상
- 형광펜 색상

5개 프리셋과 일치하지 않으면 UI에 `사용자 지정`으로 표시한다.

폰트, 폰트 크기, 강조 범위, 볼드 ON/OFF는 테마의 색상 정체성을 깨지 않으므로 테마 선택 상태를 유지한다.

## 화면 크기 10단계

화면 배율은 다음 10단계다.

```text
1  = 80%
2  = 85%
3  = 90%
4  = 95%
5  = 100%  ← 기본
6  = 105%
7  = 110%
8  = 115%
9  = 120%
10 = 125%
```

UI는 다음을 제공한다.

- `<` 한 단계 축소
- 1~10 range slider
- `>` 한 단계 확대
- 현재 단계/퍼센트 표시
- `기본 100%` 즉시 복귀

단계값은 `display.scaleLevel`에 저장한다.

## 저장 스키마

안정적인 LocalStorage key는 Settings v2와 동일하게 유지한다.

```text
qtimer-settings-v2
```

스키마 version만 3으로 증가한다.

```json
{
  "version": 3,
  "dapchigi": {
    "question": {
      "theme": "focus-blue",
      "fontFamily": "default",
      "fontSize": "default",
      "fontColor": "#16324f",
      "bold": false,
      "highlight": true,
      "highlightColor": "#dceeff",
      "emphasisScope": "all"
    },
    "answer": {
      "theme": "stable-green",
      "fontFamily": "default",
      "fontSize": "default",
      "fontColor": "#14532d",
      "bold": false,
      "highlight": true,
      "highlightColor": "#dcfce7",
      "emphasisScope": "all",
      "answerMark": false,
      "keywordRed": true
    }
  },
  "display": {
    "scaleLevel": 5
  }
}
```

## 호환성

- Settings v1 JSON 읽기 지원
- Settings v2 JSON 읽기 지원
- v2 `small` → v3 3단계(90%)
- v2 `normal` → v3 5단계(100%)
- v2 `large` → v3 7단계(110%)
- 전체 QTimer 백업은 `QTIMER_SETTINGS.get()`을 통해 v3 설정을 포함
- 전체 복원 시 기존 `qtimer-settings-v2` 키를 그대로 사용

Settings v2는 실제 폰트/색상 렌더링 엔진으로 유지하고 Settings v3가 테마와 10단계 배율을 관리한다.

## QA 기준

Browser Settings Smoke에서 최소 다음을 검증한다.

- 문제 테마 5개
- 답 테마 5개
- 테마 색상 저장
- 사용자 직접 색상 변경 시 `사용자 지정` 전환
- Dapchigi 실제 문제/답 렌더링 색상
- 화면 단계 1~10
- 10단계 = 125%
- 기본 복귀 = 5단계 100%
- 임의 단계 새로고침 유지
- Settings v3 export
- Settings v2 → v3 migration
- JavaScript page error 0
