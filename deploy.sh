#!/bin/bash
set -e

source ~/.profile || true
source ~/.bashrc || true
export PATH="/root/.bun/bin:$PATH"

echo "✅ Environment loaded."

echo "👉 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
bun install

echo "⚙️ Starting Bun server..."
pm2 restart bun-server || pm2 start --name bun-server -- bun run server:start

echo "🖼️ Starting Bun client in development mode..."
pm2 restart bun-client || pm2 start --name bun-client -- bun run client:dev

echo "✅ Deploy complete!"