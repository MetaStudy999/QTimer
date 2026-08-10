#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${QTIMER_PORT:-8080}"
PID_FILE="$ROOT_DIR/.qtimer-server.pid"
LOG_FILE="$ROOT_DIR/.qtimer-server.log"
URL="http://localhost:${PORT}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[QTimer] python3가 없습니다. Ubuntu에서 sudo apt update && sudo apt install -y python3 를 실행하세요."
  exit 1
fi

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "[QTimer] 이미 실행 중입니다. PID=$OLD_PID"
    echo "[QTimer] $URL"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

cd "$ROOT_DIR"
nohup python3 -m http.server "$PORT" --bind 0.0.0.0 >"$LOG_FILE" 2>&1 &
PID=$!
echo "$PID" > "$PID_FILE"
sleep 0.5

if ! kill -0 "$PID" 2>/dev/null; then
  echo "[QTimer] 서버 시작에 실패했습니다. 로그: $LOG_FILE"
  cat "$LOG_FILE" || true
  rm -f "$PID_FILE"
  exit 1
fi

echo "[QTimer] 로컬 서버 시작 완료"
echo "[QTimer] PID: $PID"
echo "[QTimer] URL: $URL"
echo "[QTimer] 로그: $LOG_FILE"
echo "[QTimer] 종료: bash scripts/stop-wsl.sh"

# WSL에서 Windows 기본 브라우저를 열 수 있으면 자동 실행한다.
if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command "Start-Process '$URL'" >/dev/null 2>&1 || true
fi
