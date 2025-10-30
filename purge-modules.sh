rm bun.lock
rm bun.lockb
rm -rf node_modules
rm -rf packages/client/node_modules
rm -rf packages/server/node_modules
rm -rf packages/lib/crypto-utils/node_modules
rm -rf packages/lib/react-sdk/node_modules

cd packages/client
bun i --force
cd ../server
bun i --force
cd ../lib/crypto-utils
bun i --force
cd ../react-sdk
bun i --force
cd ../../..
bun i --force
