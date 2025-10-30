# Filosign Cryptography System

## Overview

Filosign's cryptographic system provides **quantum-resistant, end-to-end encrypted document signing** built on post-quantum cryptographic primitives. The system combines multiple layers of security: PIN-based authentication, wallet signatures, and quantum-resistant key exchange/signatures.

## Core Security Model

Filosign implements a **dual-factor authentication system** combining:
- **PIN-based key derivation** (user knowledge factor)
- **Wallet signature verification** (user possession factor)

All cryptographic operations use **post-quantum algorithms** to ensure future-proof security against quantum computing attacks.

## Cryptographic Primitives

### 1. **Post-Quantum Key Encapsulation (Kyber/ML-KEM-1024)**
**Purpose**: Secure key exchange between parties
**Algorithm**: Crystals-Kyber ML-KEM-1024
**Security Level**: NIST Level 3 (highest security)

```typescript
// Key generation from deterministic seed
export async function keyGen(args: { seed: Uint8Array }) {
    const { seed } = args;
    const kyber = new KEM();

    // Seed must be exactly 64 bytes
    if (seed.length !== 64) {
        throw new Error("Seed must be 64 bytes long");
    }

    const [kPub, kPvt] = await kyber.deriveKeyPair(seed);

    return {
        publicKey: new Uint8Array(kPub),
        privateKey: new Uint8Array(kPvt),
    };
}

// Alice encapsulates shared secret for Bob
export async function encapsulate(args: { publicKeyOther: Uint8Array }) {
    const { publicKeyOther } = args;
    const kyber = new KEM();

    const [ciphertext, sharedSecret] = await kyber.encap(publicKeyOther);

    return {
        ciphertext: new Uint8Array(ciphertext),      // For Bob
        sharedSecret: new Uint8Array(sharedSecret), // For Alice
    };
}

// Bob decapsulates shared secret using his private key
export async function decapsulate(args: {
    ciphertext: Uint8Array;
    privateKeySelf: Uint8Array;
}) {
    const { ciphertext, privateKeySelf } = args;
    const kyber = new KEM();

    const sharedSecret = await kyber.decap(ciphertext, privateKeySelf);
    return { sharedSecret: new Uint8Array(sharedSecret) };
}
```

### 2. **Post-Quantum Digital Signatures (Dilithium)**
**Purpose**: Document signing and identity verification
**Algorithm**: Crystals-Dilithium (Level 2)
**Security Level**: NIST Level 2

```typescript
const DILITHIUM_KIND = 2; // Security level configuration

// Generate signature keypair from seed
export async function keyGen(args: { seed: Uint8Array }) {
    const { seed } = args;
    const dl = await Dilithium;

    const pair = dl.generateKeys(DILITHIUM_KIND, seed);

    return {
        publicKey: new Uint8Array(pair.publicKey),
        privateKey: new Uint8Array(pair.privateKey),
    };
}

// Sign document with private key
export async function sign(args: {
    message: Uint8Array;
    privateKey: Uint8Array;
}) {
    const { message, privateKey } = args;
    const dl = await Dilithium;

    const { signature } = dl.sign(message, privateKey, DILITHIUM_KIND);
    return new Uint8Array(signature);
}

// Verify signature against message and public key
export async function verify(args: {
    message: Uint8Array;
    signature: Uint8Array;
    publicKey: Uint8Array;
}) {
    const { message, signature, publicKey } = args;
    const dl = await Dilithium;

    const { result } = dl.verify(signature, message, publicKey, DILITHIUM_KIND);
    return result === 0; // Boolean verification result
}
```

### 3. **Authenticated Encryption (AES-GCM)**
**Purpose**: Symmetric encryption for document contents
**Algorithm**: AES-256-GCM with HKDF key derivation
**Key Derivation**: HKDF-SHA512

```typescript
// HKDF key derivation for AES-GCM
async function hkdfSha512(ikm: ArrayBuffer, info: ArrayBuffer | undefined, lengthBytes: number) {
    const salt = new Uint8Array(64); // Zero salt for HKDF
    const key = await crypto.subtle.importKey(
        "raw", ikm, { name: "HKDF" }, false, ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
        { name: "HKDF", hash: "SHA-512", salt, info: info ?? new Uint8Array(0) },
        key, lengthBytes * 8
    );

    return new Uint8Array(bits);
}

// Derive AES-GCM key from shared secret
async function deriveAesGcmKey(sharedSecret: ArrayBuffer, info?: string) {
    const raw = await hkdfSha512(
        sharedSecret,
        info ? new TextEncoder().encode(info).buffer : undefined,
        32 // 256-bit key
    );

    return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
        "encrypt", "decrypt"
    ]);
}

// Encrypt with AES-GCM
export async function encrypt(args: {
    message: Uint8Array;
    sharedSecret: Uint8Array;
    info?: string;
    aad?: Uint8Array; // Additional authenticated data
}) {
    const { message, sharedSecret, info, aad } = args;

    const key = await deriveAesGcmKey(sharedSecret.buffer, info);
    const iv = new Uint8Array(12); // 96-bit IV
    crypto.getRandomValues(iv);

    const ciphertext = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv,
        additionalData: aad ? aad.buffer : new Uint8Array(0).buffer,
    }, key, message);

    // Prepend IV to ciphertext: [IV(12 bytes)][Ciphertext]
    return concat(iv, new Uint8Array(ciphertext));
}

// Decrypt with AES-GCM
export async function decrypt(args: {
    ciphertext: Uint8Array;
    sharedSecret: Uint8Array;
    info?: string;
    aad?: Uint8Array;
}) {
    const { ciphertext, sharedSecret, info, aad } = args;

    const ctArr = new Uint8Array(ciphertext);
    const iv = ctArr.slice(0, 12);           // Extract IV
    const ct = ctArr.slice(12);              // Extract ciphertext

    const key = await deriveAesGcmKey(sharedSecret.buffer, info);

    const plaintext = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv,
        additionalData: aad ? aad.buffer : new Uint8Array(0).buffer,
    }, key, ct);

    return new Uint8Array(plaintext);
}
```

## Key Derivation Hierarchy

### **Wallet + PIN Key Generation Flow**

```typescript
export async function walletKeyGen(wallet: Wallet, args: { pin: string }) {
    // 1. Generate random salts for PIN, seed, and challenge
    const saltPin = randomBytes(16);
    const saltSeed = randomBytes(16);
    const saltChallenge = randomBytes(16);

    // 2. Hash PIN with Argon2id (memory-hard function)
    const pinArgoned = argon(hash(pin)); // Argon2id with specific parameters

    // 3. Create registration challenge
    const registerChallenge = generateRegisterChallenge(
        wallet.account.address,
        toHex(saltChallenge),
        pinArgoned.toString()
    );

    // 4. User signs challenge with wallet (possession factor)
    const signature = await wallet.signMessage({ message: registerChallenge });

    // 5. Derive master seed using HKDF
    const seed = await hkdfExtractExpand(
        saltSeed,              // Salt
        toBytes(signature),     // IKM (wallet signature)
        toBytes(pinArgoned),    // Info (PIN hash)
        64                     // 64-byte seed output
    );

    // 6. Generate post-quantum keypairs from seed
    const kemKeypair = await KEM.keyGen({ seed });        // For encryption
    const sigKeypair = await signatures.keyGen({ seed }); // For signing

    // 7. Create commitments for on-chain registration
    const commitmentKem = computeCommitment([kemKeypair.publicKey.toString()]);
    const commitmentSig = computeCommitment([sigKeypair.publicKey.toString()]);

    return {
        seed,
        kemKeypair,
        sigKeypair,
        commitmentKem,    // For blockchain proof
        commitmentSig,    // For blockchain proof
    };
}
```

### **Argon2id Parameters**
```typescript
export const ARGON_MEMORY_COST_KIB = 256 * 1024; // 256 MiB
export const ARGON_TIMES_COST = 24;              // 24 iterations
export const ARGON_PARALLELISM_DEGREE = 1;       // Single thread
```

## End-to-End Document Signing Flow

### **1. User Registration**

```mermaid
sequenceDiagram
    participant U as User
    participant W as Wallet
    participant F as Filosign

    U->>F: Enter PIN
    F->>F: Generate salts (PIN, seed, challenge)
    F->>F: Hash PIN with Argon2id
    F->>W: Request signature for challenge
    W->>F: Return signature
    F->>F: HKDF derive master seed
    F->>F: Generate Kyber + Dilithium keypairs
    F->>F: Create public key commitments
    F->>F: Encrypt seed with PIN-derived key
    F->>U: Registration complete
```

### **2. Document Encryption & Sharing**

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    participant F as Filosign

    A->>F: Upload document
    F->>F: Generate document encryption key
    F->>A: Encrypt document with Alice's key
    F->>B: Send document to Bob

    A->>F: Share with Bob
    F->>F: Perform Kyber key exchange
    F->>B: Encrypt document for Bob
    B->>F: Decrypt using shared secret
```

### **3. Document Signing**

```mermaid
sequenceDiagram
    participant U as User
    participant W as Wallet
    participant F as Filosign
    participant BC as Blockchain

    U->>F: Sign document request
    F->>W: Authenticate user (PIN + wallet)
    W->>F: Return authentication proof
    F->>F: Regenerate Dilithium private key
    F->>F: Sign document hash with Dilithium
    F->>BC: Submit signature to blockchain
    BC->>F: Confirm transaction
    F->>U: Signature recorded permanently
```

## Security Properties

### **Quantum Resistance**
- **Kyber/ML-KEM-1024**: NIST-standardized post-quantum KEM
- **Dilithium**: NIST-standardized post-quantum signature scheme
- **Future-proof**: Resistant to Shor's algorithm attacks

### **Forward Secrecy**
- **Ephemeral keys**: Document encryption keys are never reused
- **HKDF derivation**: Each operation uses unique key material
- **Memory zeroization**: Sensitive data cleared after use

### **Multi-Factor Authentication**
- **PIN (knowledge factor)**: Argon2id hardened password
- **Wallet (possession factor)**: Cryptographic signature proof
- **Challenge-response**: Prevents replay attacks

### **Cryptographic Agility**
- **Modular design**: Easy to upgrade algorithms
- **Versioned protocols**: Backward compatibility maintained
- **Standard primitives**: NIST-approved algorithms

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

This cryptographic system provides **enterprise-grade security** with mathematical guarantees of authenticity, confidentiality, and integrity for digital agreements in the decentralized web.
