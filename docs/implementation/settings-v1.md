# QTimer 환경설정 v1

기준일: 2026-08-12
상태: 구현 기준

## 목적

학습기록과 표시 선호를 분리하여 관리한다.

- 학습 데이터: 풀이, 취약, 답치기 O/A/X, 정답 검증
- 환경설정: 답치기 표시 방식, 답 핵심어 강조 및 이후 UI 선호

환경설정 변경은 브라우저에 즉시 자동 저장한다.

## 저장 구조

환경설정 전용 LocalStorage key:

```text
qtimer-settings-v1
```

현재 schema:

```json
{
  "version": 1,
  "dapchigi": {
    "questionStyle": "normal",
    "answerStyle": "normal",
    "answerKeywordRed": true
  },
  "updatedAt": "ISO-8601"
}
```

기존 답치기의 `questionStyle` / `answerStyle` 값은 그대로 사용해 이전 상태와 호환한다.

## 체크박스 UX

환경설정 화면에서는 스타일을 체크박스로 제공한다.

### 문제 표시

- 전체 볼드
- 핵심어 볼드
- 전체 형광펜 + 볼드
- 핵심어 형광펜 + 볼드

동일 그룹은 한 가지만 활성화할 수 있다. 모두 해제하면 `normal`이다.

### 답 표시

- 전체 볼드
- 핵심어 볼드
- 전체 형광펜 + 볼드
- 핵심어 형광펜 + 볼드
- 답 마킹 + 볼드

동일 그룹은 한 가지만 활성화할 수 있다.

`답 핵심어 빨간색 + 볼드`는 독립 옵션이며 위 답 스타일과 동시에 사용할 수 있다.

예:

```text
답 마킹 + 볼드
+
답 핵심어 빨간색 + 볼드
```

## 답 핵심어 빨간색

정답 선택지 전체를 빨간 글씨로 만드는 것이 아니라 `finalKey`와 정답 선택지 사이에 겹치는 핵심 토큰만 빨간색과 볼드로 표시한다.

목적:

- 정답 문장 전체의 과도한 색상 강조 방지
- 답을 구성하는 핵심 개념만 빠르게 시각 인식
- 답 마킹/형광펜과 동시에 사용 가능

기본값은 활성화다.

## 저장 및 불러오기

### 자동 저장

체크박스 변경 즉시 `qtimer-settings-v1`에 저장한다.

따라서 일반 사용 중 별도 저장 버튼을 누를 필요가 없다.

### 설정 전용 파일

환경설정 화면에서 제공한다.

- 설정 파일 저장
- 설정 파일 불러오기
- 기본값 복원

설정 파일 format:

```text
qtimer-settings
version 1
```

학습기록을 포함하지 않는다.

### 전체 QTimer 백업

기존 `백업`은 학습 state와 함께 현재 환경설정도 포함한다.

전체 복원 시:

- 학습기록 복원
- 환경설정 복원(백업에 포함된 경우)

`복원취소`도 학습 state와 환경설정을 함께 직전 상태로 되돌린다.

이전 버전의 전체 백업처럼 `settings`가 없는 파일도 계속 복원할 수 있으며 이 경우 현재 환경설정은 유지한다.

## 데이터 안전 원칙

환경설정 기능은 다음을 변경하지 않는다.

- 973문항 SOURCE BANK
- 문제 원문
- 정답
- provenance
- 일반 Attempt schema
- 답치기 Attempt schema

## QA 기준

Browser E2E에서 다음을 검증한다.

1. 환경설정 상단 메뉴
2. 설정 화면 전환
3. 스타일 체크박스 상호배타 동작
4. Dapchigi 기존 style select와 동기화
5. 변경 즉시 LocalStorage 저장
6. 답 핵심어 빨간색 + 볼드 실제 렌더링
7. 답 마킹 + 볼드와 빨간 핵심어 동시 적용
8. 새로고침 후 설정 유지
9. 설정 export schema
10. replace/import 경로 persistence

개발·검증은 `docs/implementation/development-and-deployment-policy.md`에 따라 GitHub + GitHub Actions + Local WSL에서 수행하며 Vercel은 최종 Production 배포 시에만 사용한다.
