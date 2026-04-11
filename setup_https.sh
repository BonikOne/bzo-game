#!/bin/bash

# Script to setup HTTPS with Let's Encrypt for friend-games.ru
# Run this on your server after updating the repo

set -e

echo "=== Setting up HTTPS for friend-games.ru ==="

# 1. Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot
fi

# 2. Stop Docker containers to free port 80
echo "Stopping Docker containers..."
docker-compose down

# 3. Get certificate
echo "Getting Let's Encrypt certificate..."
sudo certbot certonly --standalone -d friend-games.ru -d www.friend-games.ru --agree-tos --email your@email.ru --non-interactive

# 4. Copy certificates to project
echo "Copying certificates to project..."
mkdir -p certs
sudo cp /etc/letsencrypt/live/friend-games.ru/fullchain.pem certs/fullchain.pem
sudo cp /etc/letsencrypt/live/friend-games.ru/privkey.pem certs/privkey.pem
sudo chown $(whoami):$(whoami) certs/*.pem

# 5. Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d --build

# 6. Test HTTPS
echo "Testing HTTPS..."
curl -v https://friend-games.ru

echo "=== HTTPS setup complete! ==="
echo "Visit https://friend-games.ru to check if it works without warnings."