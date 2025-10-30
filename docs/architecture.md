# Filosign System Architecture

## Overview

Filosign implements a **decentralized e-signature platform** with a multi-layered architecture spanning smart contracts, backend APIs, cryptographic utilities, and React SDK. This document details how each feature is implemented across the entire technology stack.

## Architecture Layers

### **1. Smart Contracts Layer** (`packages/contracts/`)
**Filecoin Virtual Machine (FVM) smart contracts for on-chain logic**

- **FSManager**: Central registry managing access controls and protocol versioning
- **FSKeyRegistry**: Stores cryptographic key commitments and user registration data
- **FSFileRegistry**: Document lifecycle management and signature verification (currently disabled)

### **2. Backend API Layer** (`packages/server/`)
**Hono-based REST API with SQLite database**

- **Authentication**: JWT-based session management with cryptographic verification
- **File Management**: S3/Filecoin storage orchestration and metadata handling
- **User Management**: Profile management and social features
- **Share Capability**: Permission-based document sharing system

### **3. Cryptographic Utils Layer** (`packages/lib/crypto-utils/`)
**WebAssembly cryptographic primitives**

- **Post-Quantum Cryptography**: Kyber/ML-KEM-1024 key exchange, Dilithium signatures
- **Symmetric Encryption**: AES-GCM authenticated encryption
- **Key Derivation**: Argon2id password hashing, HKDF key expansion
- **Elliptic Curve**: P-256 for additional cryptographic operations

### **4. React SDK Layer** (`packages/lib/react-sdk/`)
**TypeScript client library with React hooks**

- **Client Initialization**: Wallet connection and cryptographic setup
- **API Bindings**: Type-safe API client with automatic error handling
- **React Integration**: Context providers, hooks, and component utilities
- **State Management**: Multi-layer caching (IndexedDB, LocalStorage, SessionStorage)

---

## Feature Implementation Matrix

### 🔐 **Dual-Factor Authentication**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Smart Contracts** | `FSKeyRegistry.registerKeygenData()` | Stores PIN commitments and cryptographic key commitments on-chain |
| **Backend API** | `POST /auth/verify` | JWT token generation after cryptographic verification |
| **Crypto Utils** | `walletKeyGen()` | PIN + wallet signature → master seed → post-quantum keypairs |
| **React SDK** | `client.register()`, `client.login()` | User registration flow with dual-factor validation |

**Implementation Flow:**
1. **User Input**: PIN + wallet signature challenge
2. **Crypto Layer**: `walletKeyGen()` derives master seed from PIN + signature
3. **Smart Contract**: `registerKeygenData()` stores key commitments
4. **Backend**: `verify` endpoint validates and issues JWT
5. **React SDK**: `register()` orchestrates the entire flow

---

### 📄 **Document Management**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Smart Contracts** | `FSFileRegistry.registerFile()` (planned) | On-chain document registration with recipient verification |
| **Backend API** | `POST /files`, `GET /files/sent`, `GET /files/received` | File upload orchestration, S3 → Filecoin migration, paginated queries |
| **Crypto Utils** | `encryptWithKey()`, `decryptWithKey()` | AES-GCM encryption/decryption with Kyber-derived keys |
| **React SDK** | `client.files.uploadFile()`, `client.files.getSentFiles()` | End-to-end file operations with automatic encryption |

**Implementation Flow:**
1. **File Upload**: `uploadFile()` generates encryption keys and encrypts file
2. **Storage**: Backend uploads to S3, then migrates to Filecoin via Synapse SDK
3. **Key Management**: Owner key stored encrypted, recipient keys shared via Kyber key exchange
4. **Database**: File metadata, recipients, and encrypted keys stored in SQLite
5. **Querying**: Complex joins return files with recipient status and signatures

---

### ✍️ **Digital Signatures**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Smart Contracts** | `FSFileRegistry.submitSignature()` (planned) | On-chain signature verification and storage |
| **Backend API** | `POST /user/signatures`, `GET /user/signatures` | Signature storage and retrieval, file signature association |
| **Crypto Utils** | `sign()`, `verify()` | Dilithium post-quantum signature operations |
| **React SDK** | `client.signatures.uploadSignature()` | Signature management and file signing workflow |

**Implementation Flow:**
1. **Signature Creation**: User draws/types signature, stored as image
2. **Visual Hash**: SHA-256 hash of signature image for verification
3. **Dilithium Signing**: Document hash signed with post-quantum algorithm
4. **Database Storage**: Signature metadata and visual hash stored
5. **Blockchain**: Future implementation will anchor signatures on-chain

---

### 🔗 **Secure Document Sharing**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Smart Contracts** | `FSManager.approveSender()` | On-chain approval of sharing permissions |
| **Backend API** | `POST /requests`, `GET /requests/*`, `POST /files` | Share request lifecycle and permission management |
| **Crypto Utils** | `createSharedKey()` | ECDH key exchange for document encryption keys |
| **React SDK** | `client.shareCapability.sendShareRequest()` | Permission-based sharing workflow |

**Implementation Flow:**
1. **Permission Request**: `sendShareRequest()` creates pending approval request
2. **Approval Process**: `allowSharing()` executes on-chain transaction
3. **Document Sharing**: When uploading, system checks `approvedSenders` mapping
4. **Key Exchange**: Approved recipients get encrypted document keys via ECDH
5. **Status Tracking**: Share requests tracked through status lifecycle

---

### 👤 **User Profiles**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Smart Contracts** | N/A | Profile data stored off-chain for privacy |
| **Backend API** | `POST /user/profile`, `GET /user/profile`, `PUT /user/profile` | Profile CRUD operations with username validation |
| **Crypto Utils** | N/A | Profile data is public/metadata |
| **React SDK** | `client.profile.createProfile()`, `client.profile.getProfile()` | Profile management with avatar upload support |

**Implementation Flow:**
1. **Profile Creation**: Username uniqueness validation on backend
2. **Avatar Upload**: File stored in S3 with public access
3. **Metadata Storage**: Rich profile data stored in SQLite
4. **Username System**: Unique usernames with availability checking
5. **Display Logic**: Profile data joined with file/user queries

---

### 🔑 **Cryptographic Operations**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Smart Contracts** | N/A | Cryptographic operations performed off-chain |
| **Backend API** | N/A | Cryptography handled client-side for zero-trust |
| **Crypto Utils** | `encrypt()`, `decrypt()`, `sign()`, `verify()` | Direct cryptographic primitive access |
| **React SDK** | `client.crypto.encrypt()`, `client.crypto.signMessage()` | High-level crypto operations with automatic key management |

**Implementation Flow:**
1. **Key Generation**: Post-quantum keys derived from PIN + wallet signature
2. **Document Encryption**: AES-GCM with keys derived from Kyber shared secrets
3. **Signature Creation**: Dilithium signatures for document authenticity
4. **Key Storage**: Master seed encrypted and stored client-side
5. **Session Keys**: Ephemeral keys regenerated for each session

---

### 🗄️ **Data Persistence**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Smart Contracts** | Event logs and state storage | Immutable on-chain data (key commitments, permissions) |
| **Backend API** | SQLite with Drizzle ORM | Relational data storage with complex queries |
| **Crypto Utils** | N/A | Key material stored encrypted |
| **React SDK** | `FilosignProvider` with IndexedDB caching | Multi-layer client-side storage |

**Implementation Flow:**
1. **On-Chain**: Critical commitments (PIN hash, public keys) stored immutably
2. **Database**: File metadata, user profiles, signatures, share permissions
3. **Client Storage**: Encrypted key material, cached API responses
4. **File Storage**: Documents stored on Filecoin via Synapse SDK
5. **Caching**: React Query + IndexedDB for optimal performance

---

## Database Schema Architecture

### **Core Tables**

```sql
-- User identity and cryptography
users (
  walletAddress PRIMARY KEY,
  email,
  lastActiveAt,
  keygenDataJson,        -- Encrypted cryptographic material
  encryptionPublicKey,   -- For ECDH key exchange
  createdAt, updatedAt
)

-- User profiles and social features
profiles (
  walletAddress PRIMARY KEY → users.walletAddress,
  username UNIQUE,
  displayName,
  avatarUrl,
  bio,
  metadataJson,
  createdAt, updatedAt
)

-- Document storage and lifecycle
files (
  pieceCid PRIMARY KEY,
  ownerWallet → users.walletAddress,
  metadata JSON,
  status ENUM('s3', 'foc', 'unpaid_for', 'invalid'),
  ownerEncryptedKey,     -- Owner's encrypted document key
  ownerEncryptedKeyIv,
  encryptedDataIv,       -- Document encryption IV
  onchainTxHash,         -- Blockchain transaction reference
  createdAt, updatedAt
)

-- Document sharing permissions
fileRecipients (
  filePieceCid → files.pieceCid,
  recipientWallet,
  createdAt,
  UNIQUE(filePieceCid, recipientWallet)
)

-- Encrypted keys for recipients
fileKeys (
  filePieceCid → files.pieceCid,
  recipientWallet,
  encryptedKey,          -- Kyber-encrypted document key
  encryptedKeyIv,
  createdAt,
  UNIQUE(filePieceCid, recipientWallet)
)

-- Document acknowledgments
fileAcknowledgements (
  filePieceCid → files.pieceCid,
  recipientWallet,
  acknowledgedTxHash,    -- On-chain acknowledgment proof
  createdAt,
  UNIQUE(filePieceCid, recipientWallet)
)

-- Digital signatures
fileSignatures (
  id PRIMARY KEY,
  filePieceCid → files.pieceCid,
  signerWallet,
  signatureVisualHash,   -- SHA-256 of signature image
  compactSignature,      -- Dilithium signature
  timestamp,
  onchainTxHash,         -- Future blockchain anchor
  createdAt, updatedAt
)

-- Share capability system
shareApprovals (
  id PRIMARY KEY,
  recipientWallet → users.walletAddress,
  senderWallet → users.walletAddress,
  active BOOLEAN,
  createdAt, updatedAt,
  UNIQUE(recipientWallet, senderWallet)
)

shareRequests (
  id PRIMARY KEY,
  senderWallet → users.walletAddress,
  recipientWallet,
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED'),
  message,
  metadata JSON,
  createdAt, updatedAt
)
```

### **Query Patterns**

#### **File Retrieval with Recipients and Signatures**
```sql
-- Complex join for sent files view
SELECT f.*, r.*, s.*, p.*
FROM files f
LEFT JOIN fileRecipients fr ON f.pieceCid = fr.filePieceCid
LEFT JOIN profiles p ON fr.recipientWallet = p.walletAddress
LEFT JOIN fileAcknowledgements fa ON fr.filePieceCid = fa.filePieceCid
  AND fr.recipientWallet = fa.recipientWallet
LEFT JOIN fileSignatures s ON f.pieceCid = s.filePieceCid
WHERE f.ownerWallet = ?
ORDER BY f.createdAt DESC
```

#### **Permission-Based Sharing**
```sql
-- Check if sender is approved by recipient
SELECT sa.active
FROM shareApprovals sa
WHERE sa.recipientWallet = ?
  AND sa.senderWallet = ?
  AND sa.active = true
```

---

## Security Architecture

### **Zero-Trust Design**
- **Client-Side Cryptography**: All sensitive operations performed client-side
- **No Server Key Access**: Server never sees plaintext keys or documents
- **JWT Authentication**: Stateless authentication with cryptographic verification
- **Permission Checks**: Every API call validates user permissions

### **Cryptographic Security Model**
```
User PIN → Argon2id → Authentication Key
Authentication Key ⊕ PIN Key → Wrapper Key
Wrapper Key → XChaCha20 → Encrypted Seed
Seed → HKDF → Kyber Private Key + Dilithium Private Key
Kyber Key Exchange → AES-GCM Document Keys
Dilithium Signatures → Document Authenticity
```

### **Data Flow Security**
1. **Registration**: PIN + wallet signature → encrypted seed stored client-side
2. **Document Upload**: File encrypted with random key, key encrypted for recipients
3. **Sharing**: ECDH key exchange ensures only intended recipients can decrypt
4. **Signatures**: Post-quantum signatures provide long-term authenticity proof

---

## Performance Architecture

### **Storage Strategy**
- **S3 Initial**: Fast upload and temporary storage
- **Filecoin Migration**: Asynchronous move to decentralized storage
- **Caching Layers**: IndexedDB for API responses, LocalStorage for config
- **Query Optimization**: Database indexes on frequently queried columns

### **Cryptographic Performance**
| Operation | Algorithm | Time | Notes |
|-----------|-----------|------|-------|
| Key Generation | Kyber | ~50ms | Deterministic from seed |
| Key Encapsulation | Kyber | ~25ms | Per recipient |
| Document Encryption | AES-GCM | ~10ms/MB | Hardware accelerated |
| Signature Creation | Dilithium | ~100ms | Per document |
| PIN Verification | Argon2id | ~500ms | Memory-hard function |

### **API Performance**
- **Pagination**: Efficient large dataset handling (20-100 items/page)
- **Caching**: React Query + IndexedDB reduce API calls
- **Batch Operations**: Multiple recipients processed efficiently
- **Async Processing**: Filecoin uploads handled asynchronously

---

## Integration Architecture

### **External Services**
- **Filecoin/Synapse**: Decentralized storage and retrieval
- **S3**: Temporary file storage and CDN delivery
- **Privy**: Wallet authentication and user onboarding
- **WAGMI/Viem**: Ethereum/Filecoin blockchain interactions

### **Cross-Platform Compatibility**
- **Web Browsers**: WebAssembly cryptographic operations
- **React Native**: Planned mobile application support
- **Node.js**: Server-side cryptographic utilities
- **Multi-Chain**: Ethereum and Filecoin network support

### **API Design Principles**
- **RESTful Endpoints**: Standard HTTP methods and status codes
- **Type Safety**: Zod schemas for request/response validation
- **Error Handling**: Consistent error format across all endpoints
- **Authentication**: JWT-based stateless authentication
- **Rate Limiting**: API abuse prevention and fair usage

This architecture provides a **secure, scalable, and user-friendly** decentralized e-signature platform that maintains mathematical certainty while delivering a familiar user experience.
