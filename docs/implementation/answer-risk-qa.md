# QTimer 정답 위험도 QA

업데이트: 2026-08-11

## 목적

문제은행 973문항의 구조 QA가 통과한 뒤, 모든 문항을 동일한 비용으로 다시 검토하지 않고 **정답 오류 가능성이 높은 문제를 우선순위로 추출**한다.

정답 위험도 QA는 문제를 삭제하거나 정답을 자동 변경하지 않는다. 검토 순서를 정하는 비차단(non-blocking) 큐다.

## 실행

```bash
node scripts/audit-answer-risk.mjs --summary
node scripts/audit-answer-risk.mjs --limit=80
```

`bash scripts/check-wsl.sh`는 `--summary` 모드로 Gate 3를 자동 실행한다.

## 위험도 분류

### P0

점수 8 이상. 원본 이미지와 독립 풀이를 가장 먼저 대조한다.

대표 대상:

- 코드 실행 + 도표/출력 의존
- SQL 실행 + 표/릴레이션 의존
- CIDR/서브넷 등 네트워크 계산
- 여러 위험 신호가 동시에 있는 문제
- 교재 정답과 AI 정답 출처가 불일치하는 문제

### P1

점수 6~7. P0 검토 후 확인한다.

### P2

점수 4~5. 계산·알고리즘·암호 등 일반 개념형보다 오답 위험이 높은 문제를 포함한다.

## 가중치

- 코드 실행: +5
- SQL 실행: +5
- 네트워크 계산: +5
- 계산/알고리즘: +4
- 암호/보안: +3
- 원본 도표/실행 결과 의존: +3
- 선택지가 이미지/결과 표시에 의존: +3
- `verificationStatus=auto_matched`: +1
- `extractionStatus=READY_PARAPHRASE`: +1
- 매우 짧은 해설: +1
- 정답 출처 불일치: +10

## 검증 절차

P0부터 다음 순서로 검증한다.

1. `sourceImageUrl` 원본 이미지의 문제번호와 하단 정답 확인
2. 문제문·선택지 구조화가 원본 의미를 유지하는지 확인
3. 교재 정답과 무관하게 문제를 독립적으로 다시 풀이
4. 독립 풀이 결과와 `sourceAnswer` 비교
5. 일치하면 검증 상태를 유지/상향하고, 불일치하면 `needs_review` 또는 `source_error_suspected`로 전환
6. 정답 변경 시 기존 `sourceAnswer`를 덮어쓰지 않고 검증 이력을 보존

## 운영 원칙

- Gate 1: 973문항 수량·기본 무결성 — blocking
- Gate 2: Chapter/ID/원본/중복 구조 QA — blocking
- Gate 3: 정답 위험군 우선순위 — non-blocking
- P0 검증 완료 후 P1, 그 다음 P2 순서
- 시험 직전에는 일반 개념형 전수 재검토보다 P0/P1 정확도 검증을 우선한다.
