const { encodePacked, ripemd160 } = require('viem');

const addr = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';

// What Solidity does: abi.encodePacked(address[] memory signers)
// This should just concatenate the addresses without length

// Try different methods
console.log('\n=== Testing encodePacked ===');

// Method 1: Multiple address types (what computeCommitment does)
const enc1 = encodePacked(['address'], [addr]);
console.log('Method 1 (single address type):', enc1);
console.log('Commitment 1:', ripemd160(enc1));

// Method 2: Array type
const enc2 = encodePacked(['address[]'], [[addr]]);
console.log('\nMethod 2 (address[] type):', enc2);
console.log('Commitment 2:', ripemd160(enc2));

// Method 3: Just pack the bytes directly
const enc3 = encodePacked(['bytes'], [addr]);
console.log('\nMethod 3 (bytes):', enc3);
console.log('Commitment 3:', ripemd160(enc3));

console.log('\n=== Expected ===');
console.log('TS Commitment:  0xc3127af8064c35cef054113126d331dac9865bef');
console.log('Sol Commitment: 0x1d1201d2177b5a16dacede6efbf6615ed4bb89d1');
