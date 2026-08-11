# QTimer 문제은행 기준점

업데이트: 2026-08-12

## 현재 검증·로드 기준

| 과목 | 검증된 문제 수 |
|---|---:|
| 1과목 소프트웨어 설계 | 221 |
| 2과목 소프트웨어 개발 | 158 |
| 3과목 데이터베이스 구축 | 191 |
| 4과목 프로그래밍 언어 활용 | 211 |
| 5과목 정보시스템 구축관리 | 192 |
| **현재 검증 합계** | **973** |

`973`은 현재 수제비 2026 필기 문제 사진에서 문제 본문과 하단 정답 영역을 확인하고 QTimer가 로드하도록 등록한 문제 수다.

## v1 문제은행 동결 상태

2026-08-12 기준으로 973문항 문제은행은 다음 세 QA Gate를 모두 통과했다.

- Gate 1: 전체 973 / Duplicate IDs 0 / Invalid question records 0 / Script-load errors 0
- Gate 2: critical structural issues 0 / review queue 0 / warnings 0 / unverified repeated stems 0
- Gate 3: Unresolved answer-risk review candidates 0 / P0 0 / P1 0 / P2 0
- 독립 검증 위험문항: 88개 (P0 7 / P1 43 / P2 38)
- 명시적 검토 완료 경고: 3개 (P1 1 / P2 2)

최종 QA 실행에서 과목별 미해결 위험문항과 코드 실행·SQL 실행·네트워크 계산·계산/알고리즘·암호/보안 카테고리별 미해결 위험문항은 모두 0이었다.

따라서 이 기준점 이후에는 신규 원본 문제 추가, 정답 출처 변경, 문제 구조 변경이 없는 한 973문항을 다시 전수 검증하는 대신 세 QA Gate를 회귀 테스트로 실행한다. 문제은행 변경이 발생하면 해당 변경 문항을 우선 독립 검증한 뒤 Gate 1~3을 다시 통과해야 한다.

### 검토 완료 경고 3건

- `sujebi-2026-prog-lang-ch02-17`: `source_semantics_warning` — 교재 하단 정답을 유지하되 표준 C 포인터 산술의 엄밀한 의미론상 주의가 필요한 문항
- `sujebi-2026-system-mgmt-ch01-31`: `classification_false_positive` — COCOMO Organic 정의 문항으로 자동 계산 위험군 과잉 탐지
- `sujebi-2026-system-mgmt-ch05-05`: `classification_false_positive` — Honeypot 정의 문항으로 자동 계산 위험군 과잉 탐지

위 3건은 미검증 문항이 아니라 원본/의미론 또는 자동 분류 특성을 명시적으로 검토 완료한 항목이다.

## 복구한 원본 페이지

### 1과목 Chapter 05 Q1~7

감사 과정에서 1과목이 214문항으로 확인되어 원인을 재검증했다. 기존 합계 221에는 Chapter 05 Q1~7이 포함되어 있었지만 저장소 데이터 파일이 실제로 생성되지 않은 상태였다. 원본 3장을 다시 확인하여 다음 7문항을 복구했다.

- 1-77: Q1~2 / 정답 ②, ①
- 1-78: Q3~5 / 정답 ④, ④, ③
- 1-79: Q6~7 / 정답 ④, ②

### 4과목 Chapter 02 Q77~79

이전에 누락으로 판단했던 4과목 Chapter 02 Q77~79의 원본 페이지를 재탐색하여 확인했다.

- 원본 파일: `20260811_003552208.jpg`
- 페이지: `4-35`
- Q77 정답: ②
- Q78 정답: ①
- Q79 정답: ③

따라서 4과목은 208이 아니라 **211문항**으로 확정한다.

## 과목별 Chapter 범위

### 1과목 소프트웨어 설계
- Ch01 1~70
- Ch02 1~15
- Ch03 1~107
- Ch04 1~22
- Ch05 1~7
- 합계 221

### 2과목 소프트웨어 개발
- Ch01 1~24
- Ch02 1~19
- Ch03 1~36
- Ch04 1~64
- Ch05 1~12
- Ch06 1~3
- 합계 158

### 3과목 데이터베이스 구축
- Ch01 1~33
- Ch02 1~52
- Ch03 1~73
- Ch04 1~30
- Ch05 1~3
- 합계 191

### 4과목 프로그래밍 언어 활용
- Ch01 1~6
- Ch02 1~83
- Ch03 1~115
- Ch04 1~7
- 합계 211

### 5과목 정보시스템 구축관리
- Ch01 1~58
- Ch02 1~41
- Ch03 1~35
- Ch04 1~44
- Ch05 1~14
- 합계 192

## 3단계 QA 게이트

### Gate 1 — 수량/기본 무결성

```bash
node scripts/audit-question-bank.mjs
```

반드시 다음을 만족해야 한다.

- 과목별 문제 수가 221 / 158 / 191 / 211 / 192
- 전체 973
- Duplicate IDs = 0
- Invalid question records = 0
- Script/load errors = 0

### Gate 2 — 심층 구조/정답/원본 QA

```bash
node scripts/qa-question-bank.mjs
```

검사 항목:

- 과목별 Chapter 문제번호 1~N 연속성
- canonical ID의 Chapter/문제번호와 `sourceQuestionNo` 일치 여부
- 문제 페이지의 과목 번호 일치 여부
- Google Drive 원본 링크 형식
- `sourceAnswer` ↔ `aiDetectedAnswer` 불일치
- `sourceAnswer` ↔ `aiReasonedAnswer` 불일치
- `verificationStatus=auto_matched` 상태에서 정답 출처 불일치 여부
- 동일 문제문이 서로 다른 ID로 중복 등록되었는지 여부
- 해설/FINAL KEY 누락 여부

정답 출처 불일치나 동일 문제문 중복은 `Manual review queue`로 분리하여 원본 이미지 확인 대상으로 남긴다. 구조적 누락, 범위 오류, 페이지/과목 불일치, auto-matched 모순은 QA 실패로 처리한다.

### Gate 3 — 정답 위험군 독립 검증

```bash
node scripts/audit-answer-risk.mjs --summary
node scripts/audit-answer-risk.mjs --limit=80
```

코드 실행, SQL 실행, 네트워크 계산, 계산/알고리즘, 암호/보안 등 오답 영향이 큰 문항을 위험도 P0/P1/P2로 추출한다.

개발 중에는 후보 추출 자체가 실패를 의미하지 않지만, **동결/배포 baseline은 `Unresolved risk review candidates = 0`, `P0 = 0`, `P1 = 0`, `P2 = 0`을 필수 조건으로 한다.**

### 통합 점검

```bash
bash scripts/check-wsl.sh
```

위 명령은 Gate 1~3을 연속 실행한다.

## 무결성 규칙

1. 중복 ID는 문제은행에서 한 번만 인정한다.
2. 과목/Chapter/문제번호가 논리적으로 중복되면 제거한다.
3. 확인된 Chapter 범위를 벗어난 문제는 로드하지 않는다.
4. 원본이 확인되지 않은 문제는 임의 생성하지 않는다.
5. `window.QTIMER_BANK_AUDIT`에서 과목별 수, 누락, 제거 항목을 확인한다.
6. 신규 문제 추가 시 `expectedCurrent`와 Chapter 범위를 함께 갱신한다.
7. 풀이 기록(localStorage)은 문제은행 정규화 과정에서 삭제하지 않는다.
8. 숫자 불일치는 기준값을 낮추지 않고 누락 파일·로드 오류·ID 오류를 먼저 추적한다.
9. Gate 1과 Gate 2가 모두 통과되기 전에는 해당 문제은행 버전을 최종 안정판으로 간주하지 않는다.
10. 동결/배포 baseline은 Gate 3의 unresolved P0/P1/P2가 모두 0이어야 한다.
11. QA용 override 파일은 실제 `index.html` 로드 경로와 일치해야 하며, 로드되지 않는 중복 override 파일은 유지하지 않는다.

## 확정 기준

현재 문제은행 기준점은 다음과 같다.

`221 + 158 + 191 + 211 + 192 = 973`

그리고 정답 위험군 기준은 다음과 같다.

`Unresolved = 0 / P0 = 0 / P1 = 0 / P2 = 0`
