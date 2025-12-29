# Filosign

**Trustless digital signatures** for the decentralized web. Filosign replaces fragile platform trust with permanent mathematical proof, ensuring your agreements are secure, verifiable, and immutable on the Filecoin network.

[![Website](https://img.shields.io/badge/Website-app.filosign.xyz-blue)](https://app.filosign.xyz)
[![GitHub](https://img.shields.io/badge/GitHub-filosign--dapp-black)](https://github.com/filosign-dapp)

## ✨ What Makes Filosign Different

Traditional e-signature platforms require you to trust a centralized provider. Filosign eliminates this risk by anchoring every signature to the blockchain, providing **mathematical certainty** that your documents cannot be altered, lost, or invalidated.

- 🔐 **Post-Quantum Security**: Future-proof cryptography resistant to quantum computing
- ⛓️ **Blockchain Anchored**: Every signature is a permanent, verifiable transaction
- 🔒 **End-to-End Encrypted**: Documents encrypted from creation to delivery
- 🌐 **Decentralized Storage**: Files stored on Filecoin's resilient network
- 💰 **Crypto Payments**: USDFC subscriptions with no intermediary fees

## 🚀 Quick Start

Getting started with Filosign takes just a few minutes:

1. **Connect Wallet**: Link your Web3 wallet (MetaMask, Coinbase, etc.)
2. **Create Account**: Set up dual-factor authentication with PIN + wallet
3. **Upload & Share**: Upload documents and invite signers
4. **Sign Securely**: Use familiar drawing, typing, or upload signature methods
5. **Verify Permanently**: All signatures are immutably recorded on-chain

## 🎯 Perfect For

- **Legal Professionals**: Contract signing with cryptographic proof
- **Business Agreements**: High-value deals requiring permanent verification
- **Real Estate**: Property documents with immutable signatures
- **Financial Services**: Regulatory compliance with blockchain audit trails
- **Any High-Stakes Document**: Where trust and permanence matter

## 📋 Features

### 🔒 Security First
- **Dual-Factor Authentication**: PIN + wallet signature protection
- **Quantum-Resistant Crypto**: Kyber + Dilithium algorithms
- **Zero-Trust Architecture**: Server never sees your private keys
- **Immutable Records**: Every action permanently recorded on-chain

### 📄 Document Management
- **Universal Format Support**: PDF, DOC, images, and more
- **Multi-Signer Workflows**: Sequential or parallel signing
- **Real-Time Collaboration**: Live document status updates
- **Version Control**: Complete audit trail of all changes

### 🌐 Web3 Native
- **Wallet Integration**: Connect any Web3 wallet
- **Decentralized Storage**: Files stored on Filecoin network
- **Token Payments**: USDFC cryptocurrency subscriptions
- **Cross-Chain Compatible**: Ethereum and Filecoin networks

### 🎨 User Experience
- **Familiar Interface**: Just like DocuSign, but with Web3 power
- **Mobile Optimized**: Sign documents on any device
- **Bulk Operations**: Process multiple documents efficiently
- **API Integration**: Connect with your existing systems

## 🔗 Links

- **[🌐 Website](https://app.filosign.xyz)** - Try Filosign live
- **[📹 Demo Video](https://www.loom.com/share/8e142c8bb06f43edb0a18162222f96f8)** - See it in action
- **[📚 Documentation](https://docs.filosign.xyz)** - Complete guides and API docs
- **[🐛 Issues](https://github.com/filosign-dapp/client/issues)** - Report bugs and request features

## 💡 How It Works

### **1. Connect & Authenticate**
Link your Web3 wallet and set up dual-factor security with a PIN. Your cryptographic keys are generated client-side - we never store your private information.

### **2. Upload & Encrypt**
Documents are encrypted on your device before upload. Using quantum-resistant algorithms, each file gets its own unique encryption key.

### **3. Share Securely**
Invite signers and share documents through our permission system. Recipients can only access files they've been explicitly granted permission to view.

### **4. Sign & Verify**
Signers create signatures using familiar methods (draw, type, or upload). Every signature is cryptographically verified and permanently anchored to the blockchain.

### **5. Audit & Prove**
All actions are immutably recorded on-chain. Anyone can independently verify the authenticity, timestamp, and integrity of any signed document.

## 🔐 Security & Trust

### **Zero-Trust by Design**
- Your private keys never leave your device
- Documents are encrypted before transmission
- Server acts only as a coordinator, never storing sensitive data

### **Quantum-Resistant**
Built with post-quantum cryptographic algorithms that remain secure even against future quantum computers.

### **Blockchain Verification**
Every signature, timestamp, and document hash is permanently recorded on the Filecoin network, providing mathematical proof of authenticity.

## 🛠️ For Developers

### **Quick Setup**
```bash
# Clone and install
git clone https://github.com/filosign-dapp/client.git
cd client && bun install

# Start local development environment
./scripts/serloc.sh

# Run integration tests
cd test && bun run dev
```

### **SDK Integration**
```typescript
import { FilosignProvider, useFilosignClient } from '@filosign/react';

function MyApp() {
  return (
    <FilosignProvider config={{ apiBaseUrl: "https://api.filosign.xyz" }}>
      <DocumentSigner />
    </FilosignProvider>
  );
}
```

See our [📚 Documentation](https://docs.filosign.xyz) for complete integration guides.

## 🤝 Community & Contributing

### **Get Involved**
We welcome contributions from developers, designers, and cryptography experts! Filosign is an open-source project building the future of trustless digital agreements.

### **Ways to Contribute**
- 🐛 **Report Issues**: Found a bug? Let us know on GitHub
- 💡 **Suggest Features**: Have ideas for new functionality?
- 🔧 **Code Contributions**: Help build the platform
- 📖 **Documentation**: Improve our docs and guides
- 🧪 **Testing**: Help test new features and report issues

### **Development**
```bash
# Fork the repository
# Create your feature branch
git checkout -b feature/amazing-feature

# Make your changes and test
# Submit a pull request
```

### **Community**
- **📧 Email**: hello@filosign.xyz
- **🐦 Twitter**: [@filosign](https://twitter.com/filosign)
- **💬 Discord**: Join our community discussions

## 📄 License

**AGPL-3.0-or-later** - Filosign is free and open-source software.

---

*Built with ❤️ for the decentralized future*