# Focus Quick Settings tab visibility fix

기준일: 2026-08-12

## 증상

답치기 집중모드의 `표시 Aa` Quick Settings에서 `문제 / 답 / 핵심어` 탭을 눌러도 문제 pane이 계속 보이고 선택한 pane으로 내용이 전환되지 않는 것처럼 보였다.

## 원인

JavaScript의 `setActiveTab()`은 각 pane의 `hidden` 속성을 정상 변경하고 있었다.

하지만 component CSS의 다음 규칙이 브라우저 기본 `[hidden] { display:none; }`보다 우선했다.

```css
.qt-focus-quick-pane {
  display: grid;
}
```

따라서 DOM의 `hidden` 값은 맞아도 실제 computed style은 계속 `display:grid`가 될 수 있었다.

## 수정

QTimer Design System에 semantic hidden contract를 명시한다.

```css
.qt-focus-quick-pane[hidden] {
  display: none !important;
}
```

탭별 정상 상태:

```text
문제   -> question grid / answer none / keyword none
답     -> question none / answer grid / keyword none
핵심어 -> question none / answer none / keyword grid
```

## QA 강화

`ui-shell-smoke.mjs`에서 `hidden` attribute만 검사하지 않고 `getComputedStyle(...).display`를 직접 검사한다.

이렇게 하면 DOM 상태는 맞지만 CSS 때문에 실제 화면이 틀리는 회귀를 잡을 수 있다.

## 데이터 안전성

이 수정은 presentation CSS와 browser E2E만 변경한다.

변경하지 않는다.

- 973문항 SOURCE BANK
- 정답/provenance
- 일반 Attempt
- Dapchigi O/A/X Attempt
- Settings 저장 스키마
