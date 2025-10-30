# Filosign Architecture Overview

## Project Structure

Filosign is a **monorepo** containing a decentralized e-signature platform built on Filecoin. The architecture follows a modular design with clear separation of concerns across multiple packages.

## Core Packages

### 1. **Client** (`packages/client/`)
**Frontend React Application**
- **Tech Stack**: React 19, TypeScript, Tailwind CSS, Vite
- **Key Dependencies**: Radix UI, TanStack Router, React Hook Form, Privy Auth, WAGMI
- **Purpose**: User-facing web application for document signing and management

**Architecture**:
- `src/pages/`: Route-based page components (dashboard, onboarding, landing)
- `src/lib/components/`: Reusable UI components (shadcn/ui based)
- `src/lib/context/`: React context providers for state management
- `src/lib/hooks/`: Custom React hooks for API calls and state
- `api/`: Hono-based API routes for client-side operations

### 2. **Server** (`packages/server/`)
**Backend API Server**
- **Tech Stack**: Hono, TypeScript, Drizzle ORM, LibSQL
- **Key Dependencies**: JSON Web Tokens, Viem, Synapse SDK
- **Purpose**: Centralized API for user management, document processing, and blockchain interactions

**Architecture**:
- `api/routes/`: REST API endpoints (auth, files, user management)
- `lib/db/`: Database schemas and client configuration
- `lib/indexer/`: Blockchain event indexing and processing
- `lib/jobrunner/`: Background job processing and scheduling
- `lib/s3/`: File storage integration

### 3. **Contracts** (`packages/contracts/`)
**Filecoin Smart Contracts**
- **Tech Stack**: Solidity, Hardhat, TypeScript
- **Key Dependencies**: OpenZeppelin, Viem, Synapse SDK
- **Purpose**: On-chain business logic for document registry and cryptographic operations

**Architecture**:
- `src/`: Smart contract source files (FSManager, FSFileRegistry, FSKeyRegistry)
- `interfaces/`: Contract ABIs and TypeScript interfaces
- `test/`: Contract unit tests
- `scripts/`: Deployment and interface generation scripts

### 4. **Lib** (`packages/lib/`)
**Shared Libraries and SDKs**

#### **Crypto Utils** (`packages/lib/crypto-utils/`)
- **Tech Stack**: Rust (WASM), TypeScript
- **Key Dependencies**: Crystals-Kyber, Dilithium, Argon2
- **Purpose**: Cryptographic operations for encryption, signatures, and key management

#### **React SDK** (`packages/lib/react-sdk/`)
- **Tech Stack**: TypeScript, React Query
- **Key Dependencies**: Axios, IndexedDB, Zod
- **Purpose**: React hooks and components for integrating Filosign functionality

## Technology Stack Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Bun | Fast JavaScript/TypeScript runtime and package manager |
| **Frontend** | React 19 + TypeScript | Modern web application framework |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS with component library |
| **Routing** | TanStack Router | Type-safe client-side routing |
| **State** | Zustand | Lightweight state management |
| **Forms** | React Hook Form + Zod | Form handling with validation |
| **Backend** | Hono | Fast web framework for APIs |
| **Database** | LibSQL + Drizzle ORM | SQLite-compatible database with query builder |
| **Blockchain** | Filecoin FVM | Decentralized storage and computation |
| **Smart Contracts** | Solidity | On-chain business logic |
| **Crypto** | WebAssembly + Crystals | Post-quantum cryptographic operations |
| **Auth** | Privy + WAGMI | Web3 wallet authentication |
| **File Storage** | Synapse SDK + FilCDN | Decentralized file storage and delivery |

## Data Flow Architecture

```
User Interaction → Client UI → API Routes → Server Logic → Database/Blockchain
                      ↓
              React SDK ←→ Crypto Utils ←→ Smart Contracts
                      ↓
              Privy Auth ←→ Wallet ←→ Filecoin Network
```

## Security Model

- **Dual-Factor Authentication**: PIN + Wallet signature
- **End-to-End Encryption**: ECDH key exchange for document sharing
- **Post-Quantum Crypto**: Crystals-Kyber for key exchange, Dilithium for signatures
- **On-Chain Verification**: Permanent blockchain records of signatures
- **Decentralized Storage**: Filecoin-powered document storage

## Development Workflow

- **Monorepo Management**: Bun workspaces for dependency management
- **Code Quality**: Biome for linting and formatting
- **Testing**: Unit tests for contracts, integration tests for APIs
- **Deployment**: Vercel for frontend, custom deployment for backend/contracts

## Key Integration Points

- **Privy**: Wallet connection and user authentication
- **Synapse SDK**: Filecoin blockchain interactions
- **Filecoin Pay**: Cryptocurrency subscription payments
- **FilCDN**: Decentralized content delivery network

This architecture enables Filosign to provide mathematically verifiable, decentralized e-signatures while maintaining a familiar user experience similar to traditional platforms like DocuSign.
