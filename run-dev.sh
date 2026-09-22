#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo
  echo "Stopping frontend and backend..."
  kill "${SERVER_PID:-0}" "${CLIENT_PID:-0}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Starting backend (server)..."
(
  cd "$ROOT_DIR/server"
  npm run server
) &
SERVER_PID=$!

echo "Starting frontend (client)..."
(
  cd "$ROOT_DIR/client"
  npm run dev
) &
CLIENT_PID=$!

echo "Backend PID: $SERVER_PID"
echo "Frontend PID: $CLIENT_PID"
echo "Press Ctrl+C to stop both."

wait -n "$SERVER_PID" "$CLIENT_PID"
