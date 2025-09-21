# Filosign - Trustless On-Chain E-Signatures

Filosign is an **on-chain e-signature platform** designed for enterprises that require mathematical certainty for their agreements. We replace the inherent "platform risk" of centralized services like DocuSign with a **permanent, verifiable ledger** built on the Filecoin Onchain Cloud.

Our mission is to become the **trusted standard for high-value digital agreements** by making cryptographic truth a practical and accessible business tool.

### **Key Features**

- **Irrevocable Signatures**: Every signature is a permanent blockchain transaction
- **Filecoin-Powered**: Decentralized storage with content addressing
- **Familiar UX**: Familiar e-signature interface with Web3 advantages
- **USDFC Payments**: Native cryptocurrency subscriptions
- **End-to-End Encryption**: ECDH-based secure document sharing

## **The Problem We Solve**

Enterprises using centralized e-signature platforms face significant **"platform risk"**:

- **Trust Dependency**: Must trust provider's security, policies, and long-term viability
- **Single Point of Failure**: Security breach, policy change, or shutdown can invalidate legally binding documents
- **No Mathematical Proof**: Only promises about document integrity, not verifiable certainty

Filosign replaces fragile platform trust with permanent mathematical proof.

## **Links**

- **[Website](https://app.filosign.xyz)**: Check out the live website
- **[GitHub Org](https://github.com/filosign-dapp)**: View all repositories and contribute

## **Filosign Ecosystem**

Filosign consists of multiple specialized repositories, each handling different aspects of the platform:

### **Core Repositories**

| Repository | Purpose | Status | Link |
|------------|---------|--------|------|
| **filosign/client** | React frontend application | 🕒 Work in Progress | [github.com/filosign-dapp/client](https://github.com/filosign-dapp/client) |
| **filosign/contracts** | FVM smart contracts | ✅ Deployed on Testnet | [github.com/filosign-dapp/contracts](https://github.com/filosign-dapp/contracts) |
| **filosign/crypto-utils** | WebAssembly crypto SDK | ✅ Published | [github.com/filosign-dapp/crypto-utils](https://github.com/filosign-dapp/crypto-utils) |
| **filosign/platform** | TypeScript client library | 🕒 Work in Progress | [github.com/filosign-dapp/platform](https://github.com/filosign-dapp/platform) |

### **Key Dependencies**

- **Privy**: Wallet connection and authentication
- **Synapse SDK**: Filecoin on-chain interactions
- **FilCDN**: Decentralized file storage and delivery
- **Filecoin Pay**: Cryptocurrency payment processing
- **WAGMI + Viem**: Ethereum/Filecoin blockchain interactions

## **Solution Architecture**

### **Core Components**

#### **1. Frontend (React + TypeScript)**
Modern, responsive UI built with:
- **React 19** with hooks and modern patterns
- **Tailwind CSS** for consistent design system
- **shadcn/ui** for accessible, reusable components
- **React Hook Form** with Zod validation
- **TanStack Router** for type-safe routing

#### **2. Client SDK (TypeScript)**
Non-custodial cryptographic operations:
- **PIN + Wallet Dual-Factor**: Argon2id key derivation
- **XChaCha20Poly1305**: Authenticated encryption
- **ECDH Key Exchange**: Secure document sharing
- **Session-Based Keys**: Never stored long-term

#### **3. Smart Contracts (Solidity)**
Decentralized business logic on FVM:
- **FSManager**: Trust and access management
- **FSFileRegistry**: Document lifecycle management
- **FSKeyRegistry**: Cryptographic identity storage

#### **4. Filecoin Onchain Cloud**
Decentralized storage infrastructure:
- **Synapse SDK**: On-chain interactions
- **FilCDN**: Fast document retrieval
- **FWSS**: Permanent verifiable storage
- **Filecoin Pay**: USDFC subscription payments

### **Security Model**

```
User PIN → Argon2id → Authentication Key
Wallet Signature → HKDF → Signing Key
PIN Key ⊕ Auth Key → Wrapper Key
Wrapper Key → XChaCha20 → Encrypted Seed
Seed → HKDF → Document Encryption Keys
```


## **Getting Started**

### **Prerequisites**

- **Bun** >= 1.0.0 (JavaScript runtime & package manager)
- **Web3 Wallet** (MetaMask, Coinbase Wallet, etc.)
- **Filecoin Calibration Testnet** access (for testing)

### **Installation**

   ```bash
# Clone the repository
git clone https://github.com/filosign-dapp/client.git
cd client

# Install all dependencies
bun run setup

# Copy environment template
cd packages/client && cp .env.template .env

# Start development server
bun run dev
```

### **Development Workflow**

   ```bash
# Start development server with hot reload
bun run dev

# Build for production
bun run build

# Preview production build
bun run start

## **User Experience**

### **Complete User Journey**

1. **Landing Page**: Value proposition and feature overview
2. **Wallet Connection**: Seamless onboarding via Privy
3. **Account Setup**: PIN creation for dual-factor security
4. **Document Creation**: Upload, annotate, and place signatures
5. **Recipient Management**: Add signers with email verification
6. **Send for Signature**: Encrypted transmission via blockchain
7. **Signing Process**: Intuitive signature creation (draw/type/upload)
8. **Verification**: On-chain proof of authenticity

### **Key Screens**

- **Dashboard**: Document overview and analytics
- **Document Viewer**: PDF annotation and signature placement
- **Signature Creation**: Multiple input methods
- **File Management**: Folder organization system
- **Profile Settings**: Account and security management


## **Technical Architecture**

### **Frontend Stack**

```typescript
// Modern React with TypeScript
React 19 + TypeScript 5.x

// State Management
Zustand (lightweight, scalable)

// Form Handling
React Hook Form + Zod validation

// UI Components
Radix UI primitives + Tailwind CSS
Phosphor Icons + Motion animations

// Routing
TanStack Router (type-safe)

// PDF Handling
React PDF + PDF annotation tools

// Signature Input
React Signature Canvas + Tldraw
```

### **Filecoin Integration**

- **Synapse SDK**: Core interactions with the Filecoin network
- **Filecoin Warm Storage**: Decentralized storage for documents
- **FilCDN**: Blazing fast retrieval of documents
- **Filecoin Pay**: Subscription management using USDFC
- **FVM Contracts**: On-chain document registry

## **API Reference**

### **Client SDK Integration**

```typescript
import { FilosignClient } from '@filosign/platform';

// Initialize with wallet
const client = new FilosignClient(walletClient);
await client.initialize();

// User registration
await client.register("secure-pin");

// Document operations
const docId = await client.createDocument(file, recipients);
await client.sendForSignature(docId);
```

### **Core Hooks & Components**

```typescript
// Authentication hooks
const { user, login, logout } = useAuth();

// Document management
const { documents, createDocument } = useDocuments();

// Signature creation
const { signatures, createSignature } = useSignatures();
```

## **Resources**

- **[Demo Video](https://www.loom.com/share/8e142c8bb06f43edb0a18162222f96f8)**: Complete workflow walkthrough
- **[Documentation](https://docs.filosign.xyz)**: Comprehensive guides and API docs
- **[Issue Tracker](https://github.com/filosign-dapp/client/issues)**: Bug reports and feature requests

### **Repository Structure**

```
client/
├── packages/client/         # Main React application
│   ├── src/
│   │   ├── components/      # Reusable UI components (shadcn/ui)
│   │   ├── pages/           # Route-based page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and configurations
│   │   ├── stores/          # Zustand state management
│   │   └── types/           # TypeScript type definitions
│   ├── api/                 # Hono backend routes
│   ├── public/              # Static assets
│   ├── db/                  # Database schemas
│   ├── .env.template        # Environment variables template
│   └── vercel.json          # Deployment configuration
├── packages/*               # Additional packages
└── docs/                    # Documentation
```

## **Development & Contribution**

### **Development Setup**

```bash
# Clone and setup
git clone https://github.com/filosign-dapp/client.git
cd client
bun run setup

# Configure environment
cd packages/client && cp .env.template .env
# Edit .env with your configuration

# Start development
bun run dev
```

### **Project Structure Guidelines**

- **Components**: Use shadcn/ui patterns with proper TypeScript
- **Icons**: Import from `@phosphor-icons/react`
- **Styling**: Follow design system defined in `globals.css`
- **State**: Prefer Zustand over Context for global state
- **Forms**: Use React Hook Form with Zod schemas

### **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## **Current Status & Roadmap**

### **Completed (Phase 1-2)**

- **Live Frontend UI**: Complete user interface with mock interactions
- **Core Smart Contracts**: Deployed on Filecoin Calibration testnet
- **Encryption SDK**: WebAssembly cryptographic utilities
- **Client Library**: Backend integration and API layer
- **Wallet Integration**: Privy-powered Web3 onboarding
- **Document Management**: Upload, annotation, and signature placement

### **In Progress (Phase 3)**

- **Full-Stack Integration**: Connect frontend with contracts and backend
- **Filecoin Storage**: Implement Synapse SDK and FilCDN integration
- **Payment System**: Filecoin Pay subscription management
- **User Testing**: Gather feedback and iterate on UX

### **Future Roadmap (Phase 4+)**

- **Enterprise Features**: Team management, multi-sig, audit logs
- **API Platform**: REST API and webhook integrations
- **Mobile Apps**: React Native iOS/Android applications
- **Compliance**: SOC 2, GDPR, ISO certifications
- **Mainnet Launch**: Production deployment on Filecoin mainnet


## **Support & Community**

- **Follow us on X**: [@filosign](https://x.com/filosign)
- **Bug Reports**: [GitHub Issues](https://github.com/filosign-dapp/client/issues)