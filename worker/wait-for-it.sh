#!/usr/bin/env bash

set -e

TIMEOUT=15
QUIET=0
HOST=""
PORT=""
CMD=()

usage() {
  echo "Usage: $0 host:port [-t timeout] [-- command args...]"
  echo
  echo "  -q | --quiet       Do not output any status messages"
  echo "  -t TIMEOUT         Timeout in seconds, default is 15"
  echo "  -- COMMAND ARGS    Execute command after successful connection"
  exit 1
}

log() {
  if [ "$QUIET" -ne 1 ]; then
    echo "$@"
  fi
}

wait_for() {
  local start_ts=$(date +%s)
  while :; do
    if nc -z "$HOST" "$PORT"; then
      local end_ts=$(date +%s)
      log "$HOST:$PORT is available after $((end_ts - start_ts)) seconds"
      return 0
    fi
    sleep 1
    local now_ts=$(date +%s)
    if [ $((now_ts - start_ts)) -ge "$TIMEOUT" ]; then
      log "Timeout after ${TIMEOUT} seconds waiting for $HOST:$PORT"
      return 1
    fi
  done
}

while [[ $# -gt 0 ]]; do
  case "$1" in
  *:*)
    HOSTPORT=(${1//:/ })
    HOST=${HOSTPORT[0]}
    PORT=${HOSTPORT[1]}
    shift
    ;;
  -t)
    TIMEOUT="$2"
    shift 2
    ;;
  --quiet | -q)
    QUIET=1
    shift
    ;;
  --)
    shift
    CMD=("$@")
    break
    ;;
  *)
    usage
    ;;
  esac
done

if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  usage
fi

wait_for

if [ ${#CMD[@]} -gt 0 ]; then
  exec "${CMD[@]}"
fi
