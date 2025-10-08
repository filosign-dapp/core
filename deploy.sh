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
pm2 restart filosign-server || pm2 start bun --name filosign-server -- run server:start

echo "🖼️ Starting Bun client in development mode..."
bun run client:build
pm2 restart filosign-client || pm2 start bun --name filosign-client -- run client:start

echo "✅ Deploy complete!"