#!/usr/bin/env bash

SERVICES=(
  "app:4000"
  "ai:8000"
)

TIMEOUT=60

for service in "${SERVICES[@]}"; do
  echo "Waiting for $service..."
  ./wait-for-it.sh "$service" -t "$TIMEOUT" || {
    echo "❌ $service failed"
    exit 1
  }
done

echo "✅ All services are up"
exec "$@"
