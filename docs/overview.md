# Filosign Architecture Overview

## Project Structure

**Decentralized e-signature platform** built on Filecoin. Monorepo with modular packages for frontend, backend, contracts, and cryptography.

## Core Packages

### 1. **Client** (`packages/client/`)
**React Frontend Application**
- **Tech**: React 19, TypeScript, Tailwind CSS, TanStack Router, Zustand
- **UI**: shadcn/ui, Radix UI, Phosphor Icons, Motion animations
- **Auth**: Privy + WAGMI for Web3 wallet integration
- **Purpose**: User interface for document signing and management

**Structure**:
- `src/pages/`: Route-based components (dashboard, onboarding, landing)
- `src/lib/components/`: Reusable UI components
- `src/lib/hooks/`: Custom React hooks for API/state management

### 2. **Server** (`packages/server/`)
**Hono Backend API**
- **Tech**: Hono, TypeScript, Drizzle ORM, LibSQL
- **Storage**: Synapse SDK for Filecoin, S3 for temporary storage
- **Auth**: JWT-based authentication with cryptographic verification
- **Purpose**: REST API for user management, file operations, blockchain interactions

**Structure**:
- `api/routes/`: REST endpoints (auth, files, users, sharing)
- `lib/db/`: Database schemas and queries
- `lib/indexer/`: Blockchain event processing
- `scripts/`: Deployment and utility scripts

### 3. **Contracts** (`packages/contracts/`)
**Solidity Smart Contracts on FVM**
- **Tech**: Solidity, Hardhat, TypeScript
- **Contracts**: FSManager, FSKeyRegistry, FSFileRegistry
- **Purpose**: On-chain document registry, key management, access control

**Structure**:
- `src/`: Contract source files
- `interfaces/`: TypeScript bindings
- `test/`: Unit tests
- `scripts/`: Deployment utilities

### 4. **Crypto Utils** (`packages/lib/crypto-utils/`)
**WebAssembly Cryptographic Library**
- **Tech**: Rust compiled to WASM + TypeScript bindings
- **Algorithms**: Kyber (ML-KEM-1024), Dilithium, AES-GCM, Argon2id
- **Purpose**: Post-quantum cryptographic operations

### 5. **React SDK** (`packages/lib/react-sdk/`)
**TypeScript Client Library**
- **Tech**: TypeScript, React Query, Axios, IndexedDB
- **Features**: React hooks, API client, caching, type safety
- **Purpose**: High-level integration for React applications

### 6. **Shared** (`packages/lib/shared/`)
**Common Utilities and Types**
- **Purpose**: Shared types, constants, and utilities across packages

### 7. **Test Suite** (`test/`)
**Integration Testing Application**
- **Tech**: React + Vite + TypeScript
- **Purpose**: End-to-end testing of complete user journeys
- **Features**: Dual-user simulation, real-time state sync, comprehensive hook testing
- **Structure**:
  - `src/App.tsx`: Dual-wallet client setup with side-by-side UI
  - `src/Test.tsx`: Step-by-step user journey testing
  - `public/`: Dilithium WASM assets for PQ signature testing

**Development Scripts** (`scripts/`)
- **serloc.sh**: Complete local development environment (blockchain + server + hot reload)
- **deploy.sh**: Production deployment with PM2 process management
- **compress-assets.ts**: Production asset optimization

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Bun 1.0+ | Fast JS/TS runtime & package manager |
| **Frontend** | React 19 + TypeScript | Modern web framework |
| **UI** | Tailwind CSS + shadcn/ui + Radix | Design system & components |
| **Routing** | TanStack Router | Type-safe routing |
| **State** | Zustand | Lightweight state management |
| **Forms** | React Hook Form + Zod | Form validation |
| **Backend** | Hono + TypeScript | Fast web API framework |
| **Database** | LibSQL + Drizzle ORM | SQLite-compatible DB |
| **Blockchain** | Filecoin FVM | Decentralized computation |
| **Contracts** | Solidity + Hardhat | Smart contracts & deployment |
| **Crypto** | WebAssembly + Crystals | PQ cryptography |
| **Auth** | Privy + WAGMI + Viem | Web3 wallet integration |
| **Storage** | Synapse SDK + FilCDN | Decentralized file storage |
| **Testing** | Vite + React | Integration test suite |
| **DevOps** | PM2 + Shell Scripts | Deployment & local dev |

## Data Flow

```
User → Client UI → Server API → Database/Contracts
       ↓
React SDK ←→ Crypto Utils ←→ Smart Contracts
       ↓
Privy Auth ←→ Wallet ←→ Filecoin Network
```

## Security Model

- **2FA**: PIN + wallet signature authentication
- **E2E Encryption**: ECDH key exchange for document sharing
- **PQ Crypto**: Kyber/ML-KEM-1024 + Dilithium signatures
- **On-Chain Proof**: Immutable blockchain records
- **Decentralized Storage**: Filecoin-based document storage

## Development

- **Monorepo**: Bun workspaces for dependency management
- **Quality**: Biome for linting/formatting
- **Testing**: Unit tests (contracts), integration tests (APIs), end-to-end (test suite)
- **Local Dev**: `serloc.sh` script for complete local environment
- **Integration Testing**: `test/` package for dual-user simulation
- **Deployment**: Vercel (frontend), PM2 scripts (backend/contracts)

## Key Integrations

- **Privy**: Web3 wallet authentication
- **Synapse SDK**: Filecoin blockchain interactions
- **FilCDN**: Decentralized content delivery
- **Filecoin Pay**: Cryptocurrency payments

**Result**: Mathematically verifiable decentralized e-signatures with familiar UX.
