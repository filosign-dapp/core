# Filosign (previously Portal)

## **1. Overview**

FiloSign is an on-chain e-signature platform designed for enterprises that require mathematical certainty for their agreements. It replaces the inherent platform risk of centralized services like DocuSign with a permanent, verifiable ledger built on the Filecoin Onchain Cloud. Our mission is to become the trusted standard for high-value digital agreements by making cryptographic truth a practical and accessible business tool.

---

## **2. Problem Definition & Clarity**

### **2.1. The Problem Statement**

Enterprises using centralized e-signature platforms are exposed to significant, unaddressed "platform risk." They must trust their provider's security, internal policies, and long-term viability. This creates a central point of failure for their most critical assets: their signed agreements. A security breach, a policy change, or a service shutdown at the provider could invalidate or compromise legally binding documents, posing a direct threat to business operations.

### **2.2. Market Relevance**

This problem matters to a large and growing market of real users who handle mission-critical agreements daily. Our target customers in the legal, finance, and real estate sectors are acutely aware of compliance and security risks, yet they currently have no alternative to the centralized model.

### **2.3. Relevance to Decentralized Storage**

This problem is **fundamentally a challenge of verifiable, permanent storage**. Centralized providers can only offer promises about document integrity. A decentralized storage network like Filecoin is uniquely positioned to offer mathematical proof. FiloSign directly addresses this by creating an immutable, on-chain record of agreements, a task for which decentralized technology is not just an improvement, but a necessity.

## **3. Solution & Value Proposition**

### **3.1. The Solution**

FiloSign provides a secure, intuitive platform for executing and managing e-signatures. The core innovation is our **"Irrevocable Signature"** process: every signature is a transaction on the Filecoin Virtual Machine (FVM), and the final signed document's hash is permanently anchored to the Filecoin network. This creates a tamper-proof, time-stamped, and independently verifiable audit trail that exists outside the control of any single entity.

### **3.2. Clear Value Proposition**

Our value proposition is simple and powerful: **We replace fragile platform trust with permanent mathematical proof.** We offer the familiar workflow of platforms like DocuSign but with superior security and permanence to the end users. Your most critical agreements are safe from hacks, policy changes, or provider shutdowns.

### **3.3. Use of Filecoin's Core Strengths**

Our solution is built on the unique strengths of the Filecoin network:

- **Verifiability:** The FVM provides an immutable ledger, allowing anyone to verify the authenticity and timestamp of an agreement.
- **Decentralized Storage:** Encrypted documents are stored on the Filecoin on-chain cloud for verifiable, content-addressed & resilient storage, fast retrieval, and cheaper cost to the end user.
- **Payments:** On-chain subscription model backed by payments in **USDFC**, allowing for a seamless and transparent model.

## **4. System Architecture**

FiloSign's architecture prioritizes three core principles: **secure custody of data, verifiable on-chain architecture, and a seamless user experience.** The design ensures that FiloSign is a non-custodial platform where users have absolute control over their documents and keys.

### **4.1. High-Level System Flow**

![portal.png](portal.png)

_Diagram: High-Level System Flow_

The system is composed of four primary components that interact to create a trustless workflow:

1. **Frontend (React):** The user-facing interface where users manage documents and sign agreements. All cryptographic operations, such as key derivation and encryption, occur on the client-side.
2. **FiloSign Server:** A lightweight service that orchestrates tasks like sending notifications and preparing transactions for the FVM. The backend never has access to user keys or unencrypted documents.
3. **FVM Smart Contracts:** The decentralized source of truth for all agreements. These contracts manage the state of each document (e.g., pending, signed), record signatures as on-chain events, and provide an immutable audit trail.
4. **Filecoin Onchain Cloud:** Provides permanent, decentralized storage for all encrypted documents, ensuring their long-term availability and integrity.

### **4.2. Encryption Architecture**

![portal (1).png](<portal_(1).png>)

_Diagram: File encryption architecture_

Our architecture is fully non-custodial, based on a two-factor model that combines a user's Web3 wallet (something they have) with a PIN (something they know).

**A. User Registration:**

- **Wallet Signature:** To prove ownership of their address, the user signs a unique challenge.
- **PIN-based Key:** A memorable PIN is used to derive a secure key through Argon2id, a hashing function resistant to brute-force attacks.
- **Master Seed:** A secure master_seed is generated on the client-side, serving as the root for all subsequent encryption keys.
- **Two-Factor Wrapping:** The wallet signature and the PIN-based key are combined to create a single wrapper_key. This key can only be regenerated when both factors are present.
- **Encrypted Storage:** The master_seed is encrypted using the wrapper_key and then stored. We are unable to decrypt this seed.

**B. Document Encryption & Secure Sharing:**

1. **Receiver Verification:** Before a file can be shared, the sender must first request the receiver to sign a document (e.g., via email). The receiver will accept the request by signing a message on-chain with our platform, creating an account on our smart contracts. This action registers their public key with our system which will be used to share documents privately.
2. **Client-Side Encryption:** Once the receiver's public key is available, the sender generates a random file_encryption_key using x25519 and encrypts the file locally on their device.
3. **Upload File to Filecoin on-chain Cloud:** The encrypted file is then uploaded to the Filecoin network using FilCDN, which returns a unique Content ID (CID) for the file.
4. **Shared Key Generation:**
   - A key_encryption_private_key is derived using the sender's seed and the file’s CID as input to an HKDF (HMAC-based Key Derivation Function).
   - This private key is then combined with the receiver's public key to generate a shared secret.
5. **Secure Key Storage:** This newly created shared key, which can only be accessed by the receiver, is then stored on the blockchain.

![portal (2).png](<portal_(2).png>)

_Diagram: File sharing flow_

**C. Document Decryption:**

To access the file, the receiver uses their private key in combination with the on-chain shared key to decrypt the file_encryption_key. With the decrypted file_encryption_key, they can then download the encrypted file from Filecoin via its CID and decrypt it locally. This process ensures that only the intended receiver can ever access the plaintext file.

### **4.3. Usage of Filecoin Onchain Cloud Modules**

- **FVM (Smart Contracts):** All business logic related to the state and integrity of an agreement resides in our solidity smart contracts on the **FVM chain**.
- **Payments (USDFC backed payments):** Our subscription tiers will accept payments in **USDFC using FilecoinPay**.

**Storage & Retrieval (Filecoin on-chain cloud & FilCDN):**

We’re using **Synapse SDK** & **FilCDN** to store files on the Filecoin on-chain cloud for persistent storage of encrypted documents and efficient retrieval during verification.

## **5. GTM Strategy**

- **Phase 1 (Validation):** We want to start with targeted customer discovery interviews with CTOs and compliance officers of startups and enterprizes to ensure our MVP solves their most pressing pain points.
- **Phase 2 (Product-Led Growth):** We are planning to add a two tier ( Regular & Enterprize ) subscription model to drive bottom-up adoption.
- **Phase 3 (Enterprise Sales):** We plan to build direct channels to target startup and enterprise clients who have the highest need for our solution.
