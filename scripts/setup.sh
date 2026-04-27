#!/bin/bash
set -e

echo "🔧 MeetMind Worker Kurulumu"

if ! command -v docker &> /dev/null; then
  echo "Docker kuruluyor..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  .env dosyasını düzenle: nano .env"
  exit 1
fi

read -p "Cloudflare Tunnel kullanacak mısın? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker run cloudflare/cloudflared tunnel login
  docker run cloudflare/cloudflared tunnel create meetmind
  echo "CLOUDFLARE_TUNNEL_TOKEN=" >> .env
  echo "Token'ı .env dosyasına ekle ve tekrar çalıştır"
  exit 0
fi

docker compose -f docker/docker-compose.yml build

docker compose -f docker/docker-compose.yml up -d

echo "✅ Kurulum tamamlandı!"
echo "Worker durumu: docker compose -f docker/docker-compose.yml logs -f worker"
echo "Queue monitor: http://localhost:3001 (SSH tunnel ile)"
