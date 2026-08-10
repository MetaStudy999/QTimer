#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/.qtimer-server.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "[QTimer] 실행 중인 로컬 서버 PID 파일이 없습니다."
  exit 0
fi

PID="$(cat "$PID_FILE" 2>/dev/null || true)"
if [[ -z "$PID" ]]; then
  rm -f "$PID_FILE"
  echo "[QTimer] 비어 있는 PID 파일을 정리했습니다."
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  for _ in {1..20}; do
    if ! kill -0 "$PID" 2>/dev/null; then
      break
    fi
    sleep 0.1
  done
  if kill -0 "$PID" 2>/dev/null; then
    kill -9 "$PID" 2>/dev/null || true
  fi
  echo "[QTimer] 로컬 서버를 종료했습니다. PID=$PID"
else
  echo "[QTimer] PID=$PID 프로세스는 이미 종료되어 있습니다."
fi

rm -f "$PID_FILE"
