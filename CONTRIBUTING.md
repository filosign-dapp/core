# Contributing to Filosign

Thank you for your interest in contributing to Filosign! We're building the future of trustless digital signatures on the decentralized web. This guide will help you get started with development, contribution guidelines, and project structure.

## 🚀 Development Setup

### Prerequisites
- **Bun** >= 1.0.0 (JavaScript runtime & package manager)
- **Web3 Wallet** (MetaMask, Coinbase Wallet, etc.)
- **Filecoin Calibration Testnet** access (for testing)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/filosign-dapp/client.git
cd client

# Install dependencies
bun install

# Start local development environment (includes blockchain, server, and hot reload)
./scripts/serloc.sh

# In another terminal - run integration tests
cd test && bun run dev
```

### Individual Services
```bash
# API server
bun run server:start

# React client
bun run dev

# Local blockchain node
cd packages/contracts && bunx hardhat node

# Contract deployment
cd packages/contracts && bun run migrate:local
```

### Production Deployment
```bash
# Deploy to production with PM2
./scripts/deploy.sh
```

## 📁 Project Structure

```
filosign/
├── packages/
│   ├── client/              # Main React application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components (shadcn/ui)
│   │   │   ├── pages/       # Route-based page components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and configurations
│   │   │   └── types/       # TypeScript type definitions
│   │   └── public/          # Static assets
│   ├── server/              # Hono API backend
│   │   ├── api/routes/      # REST API endpoints
│   │   ├── lib/db/          # Database schemas & queries
│   │   └── scripts/         # Database migrations
│   ├── contracts/           # Solidity FVM contracts
│   │   ├── src/             # Smart contract source
│   │   └── test/            # Contract unit tests
│   ├── lib/
│   │   ├── crypto-utils/    # WebAssembly PQ cryptography
│   │   ├── react-sdk/       # TypeScript client library
│   │   └── shared/          # Common utilities
│   └── test/                # Integration test suite
│       └── src/             # End-to-end user journey tests
├── test/                    # Standalone integration tests
│   ├── src/                 # Dual-user simulation app
│   └── public/              # WASM assets
├── scripts/                 # Development & deployment scripts
│   ├── deploy.sh            # Production deployment
│   └── serloc.sh            # Local development environment
└── docs/                    # Documentation
```

## 🛠️ Development Guidelines

### Code Style
- **Components**: Use shadcn/ui patterns with proper TypeScript
- **Icons**: Import from `@phosphor-icons/react`
- **Styling**: Follow design system defined in `globals.css`
- **State**: Prefer Zustand over Context for global state
- **Forms**: Use React Hook Form with Zod schemas
- **Linting**: Biome for code quality and formatting

### Tech Stack
```typescript
// Frontend
React 19 + TypeScript 5.x
Zustand (state management)
React Hook Form + Zod (forms)
Radix UI + Tailwind CSS (components)
TanStack Router (routing)

// Backend
Hono + TypeScript
Drizzle ORM + LibSQL
JWT authentication

// Blockchain
Solidity + Hardhat
Filecoin FVM contracts
Viem + WAGMI

// Cryptography
WebAssembly + Crystals (PQ crypto)
Kyber/ML-KEM-1024 + Dilithium
```

### Filecoin Integration
- **Synapse SDK**: Core interactions with the Filecoin network
- **Filecoin Warm Storage**: Decentralized storage for documents
- **FilCDN**: Blazing fast retrieval of documents
- **Filecoin Pay**: Subscription management using USDFC
- **FVM Contracts**: On-chain document registry

## 🤝 Contributing Workflow

### 1. Choose an Issue
- Check [GitHub Issues](https://github.com/filosign-dapp/client/issues) for open tasks
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Development Process
```bash
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes following the guidelines above
# Test thoroughly - run both unit tests and integration tests

# Commit with clear, descriptive messages
git commit -m "feat: add amazing feature

- Implement feature X
- Add tests for feature X
- Update documentation"

# Push your branch
git push origin feature/amazing-feature
```

### 3. Pull Request
- Open a PR with a clear title and description
- Reference the issue number (e.g., "Closes #123")
- Ensure CI checks pass
- Request review from maintainers

### 4. Code Review
- Address review feedback promptly
- Make requested changes and push updates
- Once approved, your PR will be merged

## 🧪 Testing

### Integration Test Suite (`test/`)
A comprehensive testing application that simulates real user interactions:

```bash
# Start the integration test suite
cd test && bun run dev
```

**Features:**
- **Dual-User Simulation**: Side-by-side interface showing two users
- **End-to-End Testing**: Complete user journeys from registration to signing
- **Real-Time Sync**: Live state synchronization between test users
- **Hook Testing**: Validates all 31 React SDK hooks

### Contract Testing
```bash
# Run smart contract tests
cd packages/contracts && bun run tests
```

### API Testing
```bash
# Test backend endpoints
cd packages/server && bun run test
```

## 📋 Current Status & Roadmap

### ✅ Completed (Phase 1-2)
- **Live Frontend UI**: Complete user interface with mock interactions
- **Core Smart Contracts**: Deployed on Filecoin Calibration testnet
- **Encryption SDK**: WebAssembly cryptographic utilities
- **Client Library**: Backend integration and API layer
- **Wallet Integration**: Privy-powered Web3 onboarding
- **Document Management**: Upload, annotation, and signature placement

### 🚧 In Progress (Phase 3)
- **Full-Stack Integration**: Connect frontend with contracts and backend
- **Filecoin Storage**: Implement Synapse SDK and FilCDN integration
- **Payment System**: Filecoin Pay subscription management
- **User Testing**: Gather feedback and iterate on UX

### 🔮 Future Roadmap (Phase 4+)
- **Enterprise Features**: Team management, multi-sig, audit logs
- **API Platform**: REST API and webhook integrations
- **Mobile Apps**: React Native iOS/Android applications
- **Compliance**: SOC 2, GDPR, ISO certifications
- **Mainnet Launch**: Production deployment on Filecoin mainnet

## 📚 Resources

### Documentation
- **[🔐 Cryptography Guide](docs/cryptography.md)**: PQ crypto implementation details
- **[🏗️ Architecture Overview](docs/architecture.md)**: System design and data flow
- **[⚙️ SDK Reference](docs/sdk.md)**: React hooks and API documentation
- **[🧪 Testing Guide](docs/testing.md)**: Integration test suite usage

### Learning Resources
- **[📹 Demo Video](https://www.loom.com/share/8e142c8bb06f43edb0a18162222f96f8)**: Complete workflow walkthrough
- **[🌐 Website](https://app.filosign.xyz)**: Live application
- **[📖 Filecoin Docs](https://docs.filecoin.io/)**: Filecoin network documentation

### Community
- **[🐛 Issue Tracker](https://github.com/filosign-dapp/client/issues)**: Bug reports and feature requests
- **[💬 Discord](https://discord.gg/filosign)**: Community discussions
- **[🐦 Twitter](https://twitter.com/filosign)**: Updates and announcements

## 🙏 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and inclusive in all interactions
- Focus on constructive feedback and collaboration
- Help newcomers learn and contribute effectively
- Report any unacceptable behavior to the maintainers

## 📄 License

By contributing to Filosign, you agree that your contributions will be licensed under the **AGPL-3.0-or-later** license.

---

*Thank you for contributing to the future of trustless digital agreements! 🚀*