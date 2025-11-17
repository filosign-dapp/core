#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(cd "$DIR/.." && pwd)"
cd "$ROOT_DIR"
set -e

source ~/.profile || true
source ~/.bashrc || true
export PATH="/root/.bun/bin:$PATH"

echo "✅ Environment loaded."

echo "📦 Installing dependencies..."
bun install

echo "⚙️ Starting Bun server..."
pm2 restart filosign-server || pm2 start bun --name filosign-server -- run server:start

echo "🖼️ Building and starting Bun client..."
bun run client:build
pm2 restart filosign-client || pm2 start bun --name filosign-client -- run client:start

echo "✅ Deploy complete!"
