#!/bin/bash
# Deploy/update the worker on the Ubuntu server

set -euo pipefail

COMPOSE_FILE="docker/docker-compose.yml"
SERVICE="worker"

echo "🔄 Pulling latest code..."
git pull origin main

echo "🔨 Building worker image..."
docker compose -f "$COMPOSE_FILE" build "$SERVICE"

echo "🔁 Restarting worker..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps "$SERVICE"

echo "⏳ Waiting for health check..."
sleep 5

STATUS=$(docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE" \
  node -e "require('http').get('http://localhost:3002/health', r => { process.stdout.write(String(r.statusCode)); process.exit(0); })" 2>/dev/null || echo "fail")

if [ "$STATUS" = "200" ]; then
  echo "✅ Worker deployed and healthy"
else
  echo "❌ Health check failed — rolling back"
  docker compose -f "$COMPOSE_FILE" restart "$SERVICE"
  exit 1
fi

echo "📋 Logs (last 20 lines):"
docker compose -f "$COMPOSE_FILE" logs --tail=20 "$SERVICE"
