# Filosign System Architecture

**Decentralized e-signature platform** with multi-layer architecture: smart contracts, APIs, cryptography, and React SDK. Each feature implemented across the full stack.

## Architecture Layers

### **1. Smart Contracts** (`packages/contracts/`)
**FVM Solidity contracts for on-chain logic**
- **FSManager**: Access controls, protocol versioning
- **FSKeyRegistry**: Cryptographic key commitments, user registration
- **FSFileRegistry**: Document lifecycle, signature verification

### **2. Backend API** (`packages/server/`)
**Hono REST API with SQLite**
- **Auth**: JWT sessions with crypto verification
- **Files**: S3→Filecoin storage orchestration
- **Users**: Profile management, social features
- **Sharing**: Permission-based document sharing

### **3. Crypto Utils** (`packages/lib/crypto-utils/`)
**WebAssembly cryptographic primitives**
- **PQ Crypto**: Kyber/ML-KEM-1024, Dilithium signatures
- **Encryption**: AES-GCM authenticated encryption
- **Key Derivation**: Argon2id hashing, HKDF expansion
- **EC Crypto**: P-256 operations

### **4. React SDK** (`packages/lib/react-sdk/`)
**TypeScript client library with React hooks**
- **Initialization**: Wallet connection, crypto setup
- **API Client**: Type-safe bindings with error handling
- **React Integration**: Context providers, hooks, components
- **Caching**: IndexedDB, LocalStorage, SessionStorage

---

## Feature Implementation Matrix

### 🔐 **Dual-Factor Authentication**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Contracts** | `FSKeyRegistry.registerKeygenData()` | On-chain PIN/key commitments |
| **Backend** | `POST /auth/verify` | JWT generation after crypto verification |
| **Crypto** | `walletKeyGen()` | PIN + signature → master seed → PQ keypairs |
| **SDK** | `client.register/login()` | Dual-factor registration flow |

**Flow**: PIN + wallet signature → seed → keypairs → on-chain commitments → JWT

---

### 📄 **Document Management**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Contracts** | `FSFileRegistry.registerFile()` (planned) | On-chain document registration |
| **Backend** | `POST/GET /files/*` | S3→Filecoin migration, paginated queries |
| **Crypto** | `encryptWithKey/decryptWithKey()` | AES-GCM with Kyber-derived keys |
| **SDK** | `client.files.*()` | E2E file operations with auto-encryption |

**Flow**: Upload → encrypt → S3 storage → Filecoin migration → key sharing → database metadata

---

### ✍️ **Digital Signatures**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Contracts** | `FSFileRegistry.submitSignature()` (planned) | On-chain signature verification |
| **Backend** | `POST/GET /user/signatures` | Signature storage/retrieval |
| **Crypto** | `sign()/verify()` | Dilithium PQ signatures |
| **SDK** | `client.signatures.*()` | Signature management workflow |

**Flow**: Create signature → visual hash → Dilithium sign → database → blockchain anchor

---

### 🔗 **Secure Document Sharing**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Contracts** | `FSManager.approveSender()` | On-chain sharing permissions |
| **Backend** | `POST/GET /requests/*` | Share request lifecycle |
| **Crypto** | `createSharedKey()` | ECDH key exchange |
| **SDK** | `client.shareCapability.*()` | Permission-based sharing |

**Flow**: Request approval → on-chain transaction → check permissions → ECDH key exchange

---

### 👤 **User Profiles**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Contracts** | N/A | Off-chain for privacy |
| **Backend** | `POST/GET/PUT /user/profile` | Profile CRUD with username validation |
| **Crypto** | N/A | Public metadata |
| **SDK** | `client.profile.*()` | Profile management with avatars |

**Flow**: Username validation → S3 avatar storage → SQLite metadata → query joins

---

### 🔑 **Cryptographic Operations**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Contracts** | N/A | Off-chain crypto |
| **Backend** | N/A | Client-side zero-trust |
| **Crypto** | `encrypt/decrypt/sign/verify()` | Direct primitive access |
| **SDK** | `client.crypto.*()` | High-level crypto with auto key management |

**Flow**: PQ key generation → AES-GCM encryption → Dilithium signatures → encrypted seed storage

---

### 🗄️ **Data Persistence**

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Contracts** | Event logs, state storage | Immutable on-chain commitments |
| **Backend** | SQLite + Drizzle ORM | Relational data with complex queries |
| **Crypto** | N/A | Encrypted key material |
| **SDK** | `FilosignProvider` + IndexedDB | Multi-layer client caching |

**Flow**: On-chain commitments → relational database → encrypted client storage → Filecoin files

---

## Database Schema

### **Core Tables**

```sql
users (walletAddress PK, email, lastActiveAt, keygenDataJson, encryptionPublicKey)
profiles (walletAddress PK→users, username UNIQUE, displayName, avatarUrl, bio, metadataJson)
files (pieceCid PK, ownerWallet→users, metadata JSON, status, ownerEncryptedKey, onchainTxHash)
fileRecipients (filePieceCid→files, recipientWallet, UNIQUE(filePieceCid,recipientWallet))
fileKeys (filePieceCid→files, recipientWallet, encryptedKey, UNIQUE(filePieceCid,recipientWallet))
fileAcknowledgements (filePieceCid→files, recipientWallet, acknowledgedTxHash)
fileSignatures (id PK, filePieceCid→files, signerWallet, signatureVisualHash, compactSignature)
shareApprovals (id PK, recipientWallet→users, senderWallet→users, active, UNIQUE(recipient,sender))
shareRequests (id PK, senderWallet→users, recipientWallet, status, message, metadata)
```

### **Query Patterns**

**Sent Files**: Complex joins with recipients, profiles, acknowledgments, signatures
**Permissions**: Check sender approval status
**Network**: Find approved senders/receivers

---

## Security Architecture

### **Zero-Trust Design**
- Client-side cryptography, no server key access
- JWT auth with crypto verification
- Permission checks on all API calls

### **Cryptographic Model**
```
PIN → Argon2id → Auth Key
Auth Key ⊕ PIN Key → Wrapper Key
Wrapper Key → XChaCha20 → Encrypted Seed
Seed → HKDF → Kyber + Dilithium Keys
Kyber Exchange → AES-GCM Document Keys
Dilithium → Document Authenticity
```

### **Security Flow**
Registration: PIN + wallet → encrypted seed (client-side)
Upload: Random key encryption → recipient key sharing
Sharing: ECDH ensures only intended recipients decrypt
Signatures: PQ signatures for long-term proof

---

## Performance Architecture

### **Storage Strategy**
- S3 initial (fast uploads) → Filecoin migration (permanent)
- Multi-layer caching: IndexedDB + LocalStorage + SessionStorage
- Optimized database indexes

### **Performance Metrics**
| Operation | Algorithm | Time | Notes |
|-----------|-----------|------|-------|
| Key Generation | Kyber | ~50ms | Deterministic |
| Key Exchange | Kyber | ~25ms | Per recipient |
| Encryption | AES-GCM | ~10ms/MB | Hardware accelerated |
| Signing | Dilithium | ~100ms | Per document |
| PIN Verify | Argon2id | ~500ms | Memory-hard |

### **API Performance**
- Pagination (20-100 items/page)
- React Query + IndexedDB caching
- Batch operations, async processing

---

## Integration Architecture

### **External Services**
- **Filecoin/Synapse**: Decentralized storage and retrieval
- **S3**: Temporary file storage and CDN delivery
- **Privy**: Wallet authentication and user onboarding
- **WAGMI/Viem**: Ethereum/Filecoin blockchain interactions

### **Compatibility**
- **Web**: WebAssembly crypto
- **Mobile**: React Native (planned)
- **Server**: Node.js crypto utils
- **Multi-Chain**: Ethereum + Filecoin

### **API Design**
- RESTful endpoints, type-safe with Zod
- Consistent error handling, JWT auth
- Rate limiting, stateless design

### **Development & Testing**
- **Local Environment**: `scripts/serloc.sh` for complete development setup
- **Integration Testing**: `test/` package with dual-user simulation
- **Production Deployment**: PM2-based deployment scripts
- **Code Quality**: Biome linting and formatting

**Result**: Secure, scalable decentralized e-signatures with familiar UX.
