# QTimer 개발·검증·배포 정책

기준일: 2026-08-12
상태: 운영 기준

## 1. 목적

QTimer는 개발 중 기능 검증과 최종 Production 배포를 분리한다.

개발 단계에서는 GitHub 저장소와 Local WSL 환경을 기준으로 검증하고, Vercel은 최종 배포 시점에만 사용한다.

이 원칙은 개발 중 불필요한 배포 변수를 줄이고, 검증 완료된 973문항 SOURCE BANK와 학습 기능의 회귀를 방지하기 위한 것이다.

## 2. 기본 개발 흐름

```text
기능 기획
  ↓
GitHub feature/fix/docs branch
  ↓
구현
  ↓
PR
  ↓
GitHub Actions QA
  ↓
main 병합
  ↓
Local WSL에서 실제 화면·기능 확인
  ↓
다음 기능 개발
```

### 원칙

- `main`은 현재 사용 가능한 안정 기준선으로 유지한다.
- 기능 개발은 별도 branch에서 진행한다.
- 검증되지 않은 변경을 `main`에 직접 반영하지 않는다.
- SOURCE BANK 973문항의 문제/정답/provenance는 기능 개발과 분리한다.
- 문제 데이터 변경이 없는 UI/학습 기능 작업은 기존 973문항 전체 정답 재검증을 반복하지 않고 회귀 QA를 수행한다.

## 3. GitHub 검증 기준

PR 및 `main` 병합 후 다음 자동 검증을 유지한다.

1. Gate 1 — Question Bank Integrity
   - 전체 973문항 로드
   - Duplicate ID = 0
   - Invalid record = 0
   - Script/load error = 0

2. Gate 2 — Deep Structural QA
   - 과목/Chapter 문제 수 검증
   - 구조 오류 = 0
   - 미검증 반복문제 = 0
   - review queue = 0

3. Gate 3 — Answer Risk Baseline
   - Unresolved risk review candidates = 0
   - P0 = 0 / P1 = 0 / P2 = 0

4. Browser Smoke / E2E
   - 기존 학습 흐름
   - 저장/복원
   - Undo
   - 타이머
   - 취약 모드
   - 답치기 및 이후 추가되는 핵심 학습 흐름

GitHub Actions 성공만으로 실제 사용성을 확정하지 않는다. 자동 QA 통과 후 Local WSL에서 브라우저로 실제 화면과 키보드 흐름을 확인한다.

## 4. Local WSL 검증 기준

개발 중 실제 사용자 확인 환경은 Local WSL을 우선한다.

기본 경로:

```bash
cd ~/projects/QTimer

git fetch origin
git switch main
git pull --ff-only origin main

git rev-parse --short HEAD
bash scripts/check-wsl.sh
```

필요 시 정적 서버를 실행한다.

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

브라우저에서 다음을 확인한다.

- 최신 `main` commit 반영 여부
- 화면 렌더링
- 메뉴 이동
- 키보드 조작
- 답치기 Space 상태 전환
- O/A/X 기록
- 범위 선택
- 새로고침 후 persistence
- 기존 학습 기능과 충돌 여부

## 5. Vercel 사용 정책

### 개발 중

Vercel을 개발 검증 환경으로 사용하지 않는다.

다음 목적으로 Vercel에 반복 배포하지 않는다.

- 기능 중간 확인
- 일반 UI 확인
- branch별 임시 확인
- GitHub Actions 대신 검증
- Local WSL에서 확인 가능한 문제의 디버깅

### 최종 배포

Vercel은 QTimer의 핵심 기능 구현과 로컬 실사용 검증이 완료된 후 최종 Production 배포 단계에서 사용한다.

최종 배포 전 최소 조건:

```text
973문항 QA 통과
+
핵심 학습 기능 구현 완료
+
GitHub Actions 전체 성공
+
Local WSL 실사용 확인
+
UI/UX 최종 점검
+
사용자 최종 승인
  ↓
Vercel Production 배포
```

Vercel 배포 이후에도 Production smoke test를 별도로 수행한다.

## 6. 환경별 역할

| 환경 | 역할 | 개발 중 사용 |
|---|---|---|
| GitHub branch | 기능 개발 및 변경 추적 | 사용 |
| GitHub PR | 변경 검토 단위 | 사용 |
| GitHub Actions | 자동 회귀 QA | 사용 |
| `main` | 안정 기준선 | 사용 |
| Local WSL | 실제 UI/UX 및 기능 확인 | 사용 |
| Vercel | 최종 Production 배포 | 개발 중 사용하지 않음 |

## 7. 현재 적용 상태

2026-08-12 기준:

- 검증 SOURCE BANK: 973문항
- 답치기 v1: 구현 완료
- 답치기 상단 메뉴: 구현 완료
- GitHub Actions 회귀 QA: 운영 중
- 개발 검증 기준: GitHub + GitHub Actions + Local WSL
- Vercel: 최종 배포까지 보류

## 8. 예외

Vercel 특유의 Production 환경에서만 재현되는 문제를 확인해야 하는 경우에는 별도 배포가 필요할 수 있다.

단, 이러한 예외는 일반 개발 흐름으로 취급하지 않으며, 명시적인 배포 필요성이 확인된 경우에만 수행한다.

## 9. 변경 원칙

이 정책을 변경할 때는 다음을 문서에 명시한다.

- 변경 이유
- 적용 시점
- 개발 검증 환경에 미치는 영향
- 최종 배포 조건의 변화

기본 원칙은 유지한다.

> 개발은 GitHub와 Local WSL에서 검증하고, Vercel은 최종 Production 배포 단계에서 사용한다.
