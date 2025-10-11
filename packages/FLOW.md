# Filosign Core Flow Documentation

This document details the actual calls and interactions between the **SDK**, **Server**, and **Contracts** in the Filosign core system, based on the codebase.

## Architecture Overview

- **SDK (lib/)**: Client-side library that handles API calls to Server and direct contract interactions.
- **Server (server/)**: Backend API server that manages database, authentication, and indexes blockchain events.
- **Contracts (contracts/)**: Smart contracts on blockchain for on-chain logic and data.

## Primary Flow: SDK → Server → SDK → Contracts

Most operations follow: SDK calls Server API for data/storage, then SDK calls Contracts for on-chain actions.

## Detailed API Flows

### File Upload Flow

```mermaid
sequenceDiagram
    participant SDK
    participant Server
    participant S3
    participant DB
    participant Contracts

    SDK->>Server: POST /files/upload/start (pieceCid)
    Server->>S3: Generate presigned URL
    Server-->>SDK: uploadUrl, key

    SDK->>S3: PUT encrypted file data
    SDK->>Server: GET /user/public-key (for owner & recipients)
    Server-->>SDK: publicKey

    SDK->>Server: POST /files (pieceCid, recipients, keys, metadata)
    Server->>DB: Insert file, recipients, keys
    Server->>Synapse: Upload to Filecoin
    Server-->>SDK: file data

    SDK->>Contracts: FSFileRegistry.registerFile(cidParts, recipients)
    Contracts-->>SDK: txHash
```

**SDK Methods**: `Files.uploadFile()`
**Server Routes**: `/files/upload/start`, `/files`, `/user/public-key`
**Contract Calls**: `FSFileRegistry.registerFile()`

### File Viewing Flow

```mermaid
sequenceDiagram
    participant SDK
    participant Server
    participant DB
    participant S3

    SDK->>Server: GET /files/{pieceCid}
    Server->>DB: Query file details
    Server-->>SDK: file metadata, recipients, signatures

    SDK->>Server: GET /files/{pieceCid}/key
    Server->>DB: Query encrypted key for user
    Server-->>SDK: encryptedKey, iv

    SDK->>Server: GET /user/public-key (owner)
    Server-->>SDK: owner publicKey

    SDK->>S3: Download encrypted file
    SDK->>SDK: Decrypt file using keys
```

**SDK Methods**: `Files.getFileDetails()`, `Files.viewFile()`
**Server Routes**: `/files/{pieceCid}`, `/files/{pieceCid}/key`, `/user/public-key`

### File Acknowledgment Flow

```mermaid
sequenceDiagram
    participant SDK
    participant Contracts

    SDK->>Contracts: FSFileRegistry.acknowledge(cidIdentifier)
    Contracts-->>SDK: txHash
```

**SDK Methods**: `Files.acknowledgeFile()`
**Contract Calls**: `FSFileRegistry.acknowledge()`

### Profile Management Flow

```mermaid
sequenceDiagram
    participant SDK
    participant Server
    participant DB

    SDK->>Server: GET/POST/PUT /user/profile
    Server->>DB: Query/Update profile
    Server-->>SDK: profile data
```

**SDK Methods**: `Profile.getProfile()`, `createProfile()`, `updateProfile()`
**Server Routes**: `/user/profile`

### Share Request Flow

```mermaid
sequenceDiagram
    participant SDK
    participant Server
    participant DB
    participant Contracts

    SDK->>Server: POST /requests (recipient, message)
    Server->>DB: Insert share request
    Server-->>SDK: request id

    SDK->>Server: GET /requests/received
    Server->>DB: Query received requests
    Server-->>SDK: requests list

    SDK->>Contracts: FSManager.approveSender(senderWallet)
    Contracts-->>SDK: txHash
    Contracts->>Server: Emit SenderApproved event
    Server->>DB: Update request status (via indexer)
```

**SDK Methods**: `ShareCapability.sendShareRequest()`, `getReceivedRequests()`, `allowSharing()`
**Server Routes**: `/requests`, `/requests/received`
**Contract Calls**: `FSManager.approveSender()`

### Signature Management Flow

```mermaid
sequenceDiagram
    participant SDK
    participant Server
    participant DB
    participant S3

    SDK->>Server: POST /user/signatures (file, name)
    Server->>S3: Upload signature image
    Server->>DB: Store signature metadata
    Server-->>SDK: signature data

    SDK->>Server: GET /user/signatures
    Server->>DB: Query user signatures
    Server-->>SDK: signatures list
```

**SDK Methods**: `Signatures.uploadSignature()`, `getSignatures()`
**Server Routes**: `/user/signatures`

## Event Indexing Flow (Server Background)

```mermaid
sequenceDiagram
    participant Contracts
    participant Indexer
    participant Worker
    participant DB

    Contracts->>Indexer: Emit events (FileRegistered, SenderApproved, etc.)
    Indexer->>Worker: Queue jobs for events
    Worker->>Contracts: Read contract state (getFileData, etc.)
    Worker->>DB: Update database with on-chain data
```

**Server Components**: `lib/indexer/`, `lib/jobrunner/worker.ts`
**Contract Reads**: `FSFileRegistry.getFileData()`, `FSKeyRegistry.keygenData()`, etc.

## Key Contract Functions

### FSFileRegistry.sol
- `registerFile(bytes32,bytes16,bytes32,address[])`: Register file with recipients
- `acknowledge(bytes32)`: Acknowledge receipt of file
- `submitSignature(...)`: Submit digital signature
- `getFileData(bytes32)`: Read file metadata
- `getSignatureData(bytes32)`: Read signature data

### FSKeyRegistry.sol
- `registerKeygenData(KeygenData,bytes32)`: Register user key data
- `isRegistered(address)`: Check if user registered

### FSManager.sol
- `approveSender(address)`: Approve sender for sharing
- `revokeSender(address)`: Revoke sender approval

## Data Flow Summary

- **SDK ↔ Server**: REST API calls for CRUD operations, file uploads, user data
- **SDK → Contracts**: Direct write transactions for on-chain actions
- **Contracts → Server**: Event emissions indexed into database
- **Server → Contracts**: Read operations for indexing and validation

## Notes

- SDK handles encryption/decryption of file data and keys
- Server manages S3 storage and database persistence
- Contracts enforce access control and record immutable data
- All contract writes are initiated by SDK users
- Server indexes events asynchronously to keep DB in sync