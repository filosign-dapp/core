export const blogPost = {
	id: "post-1",
	title: "The future of digital agreements: Why we built Filosign",
	readingTime: "5 min",
	date: "Jan 6, 2025",
	author: {
		name: "Alex Rivera",
		role: "Article written by",
		avatar: "/static/images/stock_7.webp",
	},
	heroImage: "/static/images/stock_4.webp",
	quote:
		'"We needed a way to sign documents that didn\'t rely on a central authority holding the keys," says Sarah Chen, CTO of OpenDocs.',
	content: `
In the world of digital agreements, trust has always been outsourced. When you sign a document using a traditional e-signature platform, you're not just trusting the other party—you're trusting the platform itself to store, secure, and verify that signature. But what happens when that centralized trust fails? Or when privacy is paramount?

At **Filosign**, we asked a simple question: *What if you could prove a document was signed without trusting a middleman?*

## The Problem with Centralized Signing

Enterprises using centralized e-signature platforms are exposed to significant, unaddressed "platform risk." They must trust their provider's security, internal policies, and long-term viability. This creates a central point of failure for their most critical assets: their signed agreements.

*   **Data Vulnerability**: Centralized servers are prime targets for hacks.
*   **Vendor Lock-in**: Moving your signed contracts out of a proprietary platform is often difficult and costly.
*   **Privacy Concerns**: The platform provider technically has access to every sensitive contract you sign.
*   **Platform Risk**: A security breach, policy change, or service shutdown could invalidate legally binding documents.

We believe your agreements should belong to you, not a SaaS provider. That's why we built Filosign on top of the Filecoin Virtual Machine (FVM) and post-quantum cryptographic principles.

### A New Architecture for Trust

Filosign leverages the power of the Filecoin network and quantum-resistant cryptography to create a signing experience that is secure, permanent, and private by default.

| Feature | Traditional E-Sign | Filosign |
|:---|:---|:---|
| **Storage** | Centralized Cloud | Decentralized (Filecoin/IPFS) |
| **Verification** | Platform-Dependent | Cryptographically Verifiable Anywhere |
| **Privacy** | Platform Can Read Docs | End-to-End Client-Side Encryption |
| **Cryptography** | Standard RSA/ECDSA | Post-Quantum (Kyber + Dilithium) |
| **Authentication** | Password/2FA | Dual-Factor (PIN + Wallet Signature) |
| **Cost** | High Per-User Fees | Pay-as-you-go / Low Flat Rate |

> "Decentralized identity isn't just about privacy; it's about ownership. When you sign with your own keys, you own the attestation forever." — *Dr. Gavin Wood*

## How Filosign Works

Under the hood, Filosign combines user-friendly design with robust web3 technologies. You don't need to be a crypto expert to use it—it feels just like the tools you already know, but with mathematical certainty.

### Dual-Factor Authentication

Filosign uses a non-custodial, two-factor model that combines your Web3 wallet (something you have) with a PIN (something you know):

1.  **Wallet Signature**: You prove ownership of your address by signing a unique challenge.
2.  **PIN-based Key**: Your memorable PIN is hashed using Argon2id (memory-hard, resistant to brute-force).
3.  **Master Seed**: A secure master seed is generated client-side, serving as the root for all encryption keys.
4.  **Two-Factor Wrapping**: The wallet signature and PIN-based key combine to create a wrapper key that can only be regenerated when both factors are present.

### Document Encryption & Storage

1.  **Client-Side Encryption**: Your document is encrypted locally using AES-GCM with a randomly generated file encryption key.
2.  **Filecoin Storage**: The encrypted file is uploaded to the Filecoin network via FilCDN, returning a unique Content ID (CID).
3.  **Key Sharing**: Using Kyber/ML-KEM-1024 (post-quantum key exchange), we create a shared secret with each recipient's public key, ensuring only intended recipients can decrypt.
4.  **Blockchain Anchoring**: Document metadata and signature commitments are stored on FVM smart contracts, creating an immutable audit trail.

### Post-Quantum Signatures

Filosign uses **Dilithium** (NIST Level 2) for document signing, providing quantum-resistant signatures that will remain secure even when quantum computers become a threat:

\`\`\`typescript
// Example: How we verify a signature locally
import { verifyMessage } from '@filosign/react-sdk';

async function checkDocument(documentHash: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) {
  const isValid = await verifyMessage(
    documentHash,
    signature,
    publicKey
  );
  
  return isValid; // True if the Dilithium signature matches
}
\`\`\`

## Built for the Modern Workflow

We didn't just build a protocol; we built a product. Filosign integrates seamlessly into your existing workflow with a comprehensive React SDK.

*   **Document Management**: Upload, encrypt, and share documents with granular access control.
*   **Signature Library**: Create, manage, and reuse multiple signature styles (draw, type, or upload).
*   **Secure Sharing**: Permission-based sharing with ECDH key exchange ensures only approved recipients can access documents.
*   **User Profiles**: Decentralized identity with usernames, avatars, and rich metadata.
*   **API Access**: Type-safe React hooks and REST API for automating signing flows.

### Architecture Highlights

Filosign's architecture is fully non-custodial with zero-trust design:

- **Smart Contracts**: FVM Solidity contracts (FSManager, FSKeyRegistry, FSFileRegistry) handle on-chain logic
- **Backend API**: Hono REST API orchestrates Filecoin storage and blockchain interactions
- **Crypto Utils**: WebAssembly cryptographic primitives (Kyber, Dilithium, AES-GCM) for high-performance operations
- **React SDK**: TypeScript client library with React hooks, IndexedDB caching, and automatic error handling

As we move towards a more decentralized web, the tools we use to agree and transact must evolve. Filosign is the first step towards a future where digital signatures are as permanent and sovereign as ink on paper—but mathematically verifiable and quantum-resistant.

Ready to take control of your documents? [Start for free](/onboarding) today.
`,
};
