#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(cd "$DIR/.." && pwd)"
cd "$ROOT_DIR"

rm -f bun.lock
rm -f bun.lockb
rm -rf node_modules
rm -rf packages/client/node_modules
rm -rf packages/server/node_modules
rm -rf packages/contracts/node_modules
rm -rf packages/lib/crypto-utils/node_modules
rm -rf packages/lib/react-sdk/node_modules

cd "$ROOT_DIR/packages/client"
bun i --force
cd "$ROOT_DIR/packages/server"
bun i --force
cd "$ROOT_DIR/packages/contracts"
bun i --force
cd "$ROOT_DIR/packages/lib/crypto-utils"
bun i --force
cd "$ROOT_DIR/packages/lib/react-sdk"
bun i --force
cd "$ROOT_DIR"
bun i --force
