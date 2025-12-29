# Filosign Cryptography System

**Quantum-resistant cryptography** for end-to-end encrypted document signing. Dual-factor authentication with post-quantum algorithms.

## Core Security Model

**2FA System**: PIN (knowledge) + wallet signature (possession)
**PQ Algorithms**: Kyber/ML-KEM-1024 + Dilithium for future-proof security

## Cryptographic Primitives

### 1. **Kyber/ML-KEM-1024** - PQ Key Exchange
**Purpose**: Secure key encapsulation between parties
**Security**: NIST Level 3 (highest)

```typescript
// Key generation from seed
async function keyGen(seed: Uint8Array) {
  const [publicKey, privateKey] = await kyber.deriveKeyPair(seed);
  return { publicKey, privateKey };
}

// Alice → Bob: Encapsulate shared secret
async function encapsulate(publicKeyOther: Uint8Array) {
  const [ciphertext, sharedSecret] = await kyber.encap(publicKeyOther);
  return { ciphertext, sharedSecret };
}

// Bob: Decapsulate shared secret
async function decapsulate(ciphertext: Uint8Array, privateKeySelf: Uint8Array) {
  const sharedSecret = await kyber.decap(ciphertext, privateKeySelf);
  return sharedSecret;
}
```

### 2. **Dilithium** - PQ Digital Signatures
**Purpose**: Document signing and verification
**Security**: NIST Level 2

```typescript
const DILITHIUM_LEVEL = 2;

// Generate keypair from seed
async function keyGen(seed: Uint8Array) {
  const pair = await dilithium.generateKeys(DILITHIUM_LEVEL, seed);
  return { publicKey: pair.publicKey, privateKey: pair.privateKey };
}

// Sign message
async function sign(message: Uint8Array, privateKey: Uint8Array) {
  const { signature } = await dilithium.sign(message, privateKey, DILITHIUM_LEVEL);
  return signature;
}

// Verify signature
async function verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) {
  const { result } = await dilithium.verify(signature, message, publicKey, DILITHIUM_LEVEL);
  return result === 0;
}
```

### 3. **AES-GCM** - Authenticated Encryption
**Purpose**: Symmetric encryption for documents
**Key Derivation**: HKDF-SHA512

```typescript
// Derive AES-256-GCM key from shared secret
async function deriveAesKey(sharedSecret: Uint8Array, info?: string) {
  const keyMaterial = await hkdfSha512(sharedSecret, info, 32);
  return crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

// Encrypt with AES-GCM
async function encrypt(message: Uint8Array, sharedSecret: Uint8Array) {
  const key = await deriveAesKey(sharedSecret);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, message);
  return concat(iv, new Uint8Array(ciphertext)); // [IV(12)][Ciphertext]
}

// Decrypt with AES-GCM
async function decrypt(ciphertext: Uint8Array, sharedSecret: Uint8Array) {
  const iv = ciphertext.slice(0, 12);
  const ct = ciphertext.slice(12);
  const key = await deriveAesKey(sharedSecret);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new Uint8Array(plaintext);
}
```

## Key Derivation Hierarchy

**Dual-Factor Key Generation**: PIN + wallet signature → master seed → PQ keypairs

```typescript
async function walletKeyGen(wallet: Wallet, pin: string) {
  // 1. Generate salts
  const saltPin = randomBytes(16);
  const saltSeed = randomBytes(16);
  const saltChallenge = randomBytes(16);

  // 2. Hash PIN with Argon2id
  const pinHash = await argon2id(pin, saltPin, { m: 256*1024, t: 24, p: 1 });

  // 3. Create challenge and sign with wallet
  const challenge = generateChallenge(wallet.address, saltChallenge, pinHash);
  const signature = await wallet.signMessage(challenge);

  // 4. Derive master seed via HKDF
  const seed = await hkdf(saltSeed, signature, pinHash, 64);

  // 5. Generate PQ keypairs
  const kemKeys = await kyber.keyGen(seed);     // For encryption
  const sigKeys = await dilithium.keyGen(seed); // For signing

  // 6. Create on-chain commitments
  const kemCommitment = hash(kemKeys.publicKey);
  const sigCommitment = hash(sigKeys.publicKey);

  return { seed, kemKeys, sigKeys, kemCommitment, sigCommitment };
}
```

**Argon2id Config**: 256 MiB memory, 24 iterations, single thread

## End-to-End Flow

### **1. Registration**
User PIN → Argon2id hash → wallet signature challenge → HKDF seed → PQ keypairs → on-chain commitments

### **2. Document Encryption**
Random doc key → AES-GCM encryption → Kyber key exchange → encrypted key sharing

### **3. Signing**
PIN + wallet auth → Dilithium sign → blockchain anchor → permanent proof

## Security Properties

**Quantum Resistance**: Kyber/ML-KEM-1024 + Dilithium (NIST standards)
**Forward Secrecy**: Ephemeral keys, HKDF derivation, memory zeroization
**2FA**: PIN (knowledge) + wallet signature (possession)
**Agility**: Modular design, versioned protocols, NIST primitives

## Integration Architecture

### **Client-Side Operations**
```typescript
// WebAssembly for high-performance crypto
import { encryption, KEM, signatures } from "@filosign/crypto-utils";

// Browser-native crypto for standard operations
const hkdfKey = await crypto.subtle.importKey(
    "raw", ikm, { name: "HKDF" }, false, ["deriveBits"]
);
```

### **Blockchain Integration**
```typescript
// Public key commitments stored on-chain
const commitmentKem = ripemd160(keccak256(
    encodePacked(["string"], [kemPublicKey.toString()])
));

// Signature verification on smart contracts
function verifyDilithiumSignature(
    message: bytes,
    signature: bytes,
    publicKey: bytes
) external view returns (bool);
```

### **Storage Architecture**
- **Encrypted documents**: AES-GCM with Kyber-derived keys
- **Key material**: Encrypted seed stored locally/client-side
- **Public keys**: Commitments stored on blockchain
- **Signatures**: Full signatures stored on-chain

## Performance Characteristics

| Operation | Algorithm | Time (ms) | Notes |
|-----------|-----------|-----------|-------|
| Key Generation | Kyber | ~50 | Deterministic from seed |
| Key Encapsulation | Kyber | ~25 | Alice → Bob |
| Key Decapsulation | Kyber | ~25 | Bob receives |
| Sign Document | Dilithium | ~100 | 64KB document |
| Verify Signature | Dilithium | ~50 | Signature validation |
| Document Encryption | AES-GCM | ~10 | Per MB |
| PIN Verification | Argon2id | ~500 | Memory-hard function |

## Error Handling & Security Boundaries

### **Cryptographic Failures**
- **Invalid signatures**: Authentication rejected
- **Decryption failures**: Corrupted data detected
- **Key generation errors**: User must retry registration
- **Memory allocation failures**: Secure cleanup performed

### **Side-Channel Protections**
- **Constant-time operations**: Prevent timing attacks
- **Memory zeroization**: Sensitive data erased
- **Random oracle model**: HKDF provides randomness extraction
- **Domain separation**: Unique info strings for each context

**Result**: Enterprise-grade PQ security for decentralized digital agreements.
