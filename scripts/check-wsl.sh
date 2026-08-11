#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${QTIMER_PORT:-8080}"
PID_FILE="$ROOT_DIR/.qtimer-server.pid"
URL="http://localhost:${PORT}"
FAIL=0

ok() { printf '✅ %s\n' "$1"; }
warn() { printf '⚠️  %s\n' "$1"; }
fail() { printf '❌ %s\n' "$1"; FAIL=1; }

if grep -qi microsoft /proc/version 2>/dev/null; then ok "WSL 환경 감지"; else warn "WSL 여부를 확인하지 못했습니다."; fi
if command -v python3 >/dev/null 2>&1; then ok "python3: $(python3 --version 2>&1)"; else fail "python3 없음"; fi
if command -v git >/dev/null 2>&1; then ok "git: $(git --version)"; else fail "git 없음"; fi

cd "$ROOT_DIR"
[[ -f index.html ]] && ok "index.html 존재" || fail "index.html 없음"
[[ -f app.js ]] && ok "app.js 존재" || fail "app.js 없음"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  BRANCH="$(git branch --show-current 2>/dev/null || true)"
  ok "Git 저장소 / branch=${BRANCH:-detached}"
  if [[ "$BRANCH" != "work/data-ingest" ]]; then
    warn "현재 대량 문제 등록/검증 권장 브랜치는 work/data-ingest 입니다."
  fi
else
  fail "Git 저장소가 아닙니다."
fi

if command -v node >/dev/null 2>&1; then
  ok "node: $(node --version)"
  if node scripts/audit-question-bank.mjs; then
    ok "문제은행 수량/기본 무결성 감사 통과"
  else
    fail "문제은행 수량/기본 무결성 감사 실패"
  fi

  if node scripts/qa-question-bank.mjs; then
    ok "문제은행 심층 QA 통과"
  else
    fail "문제은행 심층 QA 실패"
  fi

  if node scripts/audit-answer-risk.mjs --summary; then
    ok "정답 위험군 추출 완료 (P0 우선 재검증 대상)"
  else
    fail "정답 위험군 추출 실패"
  fi
else
  warn "node가 없어 문제은행 자동 감사를 생략합니다. 필요 시: node scripts/audit-question-bank.mjs && node scripts/qa-question-bank.mjs && node scripts/audit-answer-risk.mjs"
fi

if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "$PID" ]] && kill -0 "$PID" 2>/dev/null; then
    ok "QTimer 서버 실행 중: PID=$PID, $URL"
  else
    warn "오래된 PID 파일이 있습니다. bash scripts/stop-wsl.sh 로 정리하세요."
  fi
else
  warn "QTimer 로컬 서버가 시작되지 않았습니다. bash scripts/start-wsl.sh"
fi

if command -v curl >/dev/null 2>&1; then
  if curl -fsS --max-time 2 "$URL" >/dev/null 2>&1; then
    ok "HTTP 응답 정상: $URL"
  else
    warn "HTTP 응답 없음: $URL"
  fi
else
  warn "curl이 없어 HTTP 확인을 생략합니다."
fi

exit "$FAIL"
