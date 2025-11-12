const { recoverAddress, hashTypedData, keccak256, encodePacked } = require('viem');

const domain = {
  name: 'FSFileRegistry',
  version: '1',
  chainId: 31337, // Assuming local hardhat
  verifyingContract: '0x...' // We need this from the logs
};

const types = {
  RegisterFile: [
    { name: 'cidIdentifier', type: 'bytes32' },
    { name: 'sender', type: 'address' },
    { name: 'signersCommitment', type: 'bytes20' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
};

// From the debug logs
const pieceCid = 'bafkzcibewhdasdsvcxkzsowtowi5swdqxkxjtgjmpunt2ve2lxddlwuoihr3wbdzgu';
const cidIdentifier = keccak256(encodePacked(['string'], [pieceCid]));

const message = {
  cidIdentifier: cidIdentifier,
  sender: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  signersCommitment: '0xc3127af8064c35cef054113126d331dac9865bef',
  timestamp: 1762984587n,
  nonce: 0n,
};

const signature = '0x9a1104a0fd3547be695466d7e6a0a2f5b0d3d28643fa3c49b2436210f5f43b003fdfc58738b2532f5b96b82353df3d113d021667c078066abebbdd3cd267230c1b';

console.log('CID Identifier:', cidIdentifier);
console.log('Message:', message);

// We need the contract address to compute the hash
console.log('\nWaiting for contract address from debug logs...');
