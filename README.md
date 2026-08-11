# QTimer

기출문제를 빠르게 회독하고, 오답·모름·애매·시간초과 문제를 자동 압축하여 반복 훈련하는 시험 준비용 CBT/학습 도구입니다.

## 현재 목표

- 1차 적용: 정보처리기사 필기
- 핵심 목표: 문제 풀이 속도 측정 → 자동 채점 → 취약문제 수집 → 반복 회독 → 숙달
- 현재 단계: **v0.1 문제은행 완성·무결성 QA 및 로컬 학습 검증**
- 현재 검증 문제은행: **973문항**
  - 1과목 221
  - 2과목 158
  - 3과목 191
  - 4과목 211
  - 5과목 192

## 핵심 Workspace

1. **Learn Workspace**
   - 왼쪽: 문제
   - 오른쪽: 결과 / 핵심 / 문제집 해설 / AI 해설 / 사용자 메모
2. **Exam Workspace**
   - 왼쪽: 문제
   - 오른쪽: 전체 답안표
   - 문제 선택지와 답안표는 하나의 답안 상태를 공유하여 양방향 동기화

## 주요 학습 모드

- 빠른 회독
- 학습
- 문제풀이
- CBT 모의고사
- 취약 집중

## 로컬 실행 — Windows 11 Pro + WSL2 Ubuntu 24.04

개발 중에는 배포 플랫폼과 분리하여 WSL2에서 QTimer를 실행·검증합니다.

```bash
cd ~/projects/QTimer
git fetch origin
git switch work/data-ingest
git pull --ff-only origin work/data-ingest
bash scripts/check-wsl.sh
bash scripts/start-wsl.sh
```

Windows 브라우저:

```text
http://localhost:8080
```

종료:

```bash
bash scripts/stop-wsl.sh
```

문제은행 QA를 개별 실행하려면 Node.js가 있는 환경에서 다음을 실행합니다.

```bash
# Gate 1: 수량 / 기본 레코드 / 중복 / 스크립트 로드
node scripts/audit-question-bank.mjs

# Gate 2: Chapter 연속성 / ID-문제번호 / 원본 링크 / 정답 출처 / 반복 문제문
node scripts/qa-question-bank.mjs

# Gate 3: 코드·SQL·계산·네트워크·암호 문제의 정답 위험도 우선순위
node scripts/audit-answer-risk.mjs --summary
node scripts/audit-answer-risk.mjs --limit=80
```

`bash scripts/check-wsl.sh`는 세 Gate를 모두 연속 실행합니다.

- **Gate 1 (blocking)**: 전체 973문항 / 중복 0 / 잘못된 레코드 0 / 스크립트 로드 오류 0
- **Gate 2 (blocking)**: 구조적 오류 0 / 미확인 반복 문제문 0 / 새 Manual review queue 0
- **Gate 3 (non-blocking)**: P0/P1/P2 정답 위험군을 추출한다. 후보가 존재하는 것은 실패가 아니며 P0부터 원본과 독립 풀이로 재검증한다.

자세한 내용은 `docs/dev-wsl.md`, `docs/implementation/question-bank-baseline.md`, `docs/implementation/answer-risk-qa.md`를 참고합니다.

## 개발 브랜치 운영

- `work/data-ingest`: 대량 문제 등록·정답/원본 검증·문제은행 QA
- `feat/v0.1-mvp`: 기능 통합·안정화
- `main`: 최종 안정판
- 최종 배포는 로컬/GitHub 작업을 마친 뒤 GitHub Pages, Vercel 또는 다른 정적 호스팅 중 선택

## 데이터 방향

- Google Drive: 원본 문제·정답 사진
- Google Sheets: 문제은행·정답·학습기록·상태(후속 단계)
- Google Docs: 사람이 읽는 취약문제 해설집(후속 단계)
- QTimer 브라우저: 타이머·현재 세션·즉시 학습 상태

## 문서

- `docs/planning/summary.md`: 현재까지 합의된 기획 요약
- `docs/spec/product-spec-v0.1.md`: v0.1 제품 명세
- `docs/spec/learning-flow.md`: 학습 흐름과 숙달 규칙
- `docs/spec/data-model.md`: 데이터 모델
- `docs/spec/ui-spec.md`: UI/UX 명세
- `docs/dev-wsl.md`: Windows 11 Pro + WSL2 Ubuntu 24.04 로컬 실행 가이드
- `docs/implementation/question-bank-baseline.md`: 과목별 문제 수·Chapter 범위·구조 QA 기준
- `docs/implementation/answer-risk-qa.md`: P0/P1/P2 정답 위험군 선별 및 검증 절차
- `docs/decisions/`: 주요 설계 결정 기록(ADR)
- `docs/backlog.md`: v0.1 이후 후보

> v0.1에서는 시험 준비에 직접 필요한 기능만 구현합니다. 새로운 아이디어는 우선 Backlog에 기록하고, 치명적 오류·데이터 손실·채점 오류·학습 흐름 장애가 아니라면 v0.1 범위를 확대하지 않습니다.
