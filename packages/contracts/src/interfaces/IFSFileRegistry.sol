// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Auto-generated from src/FSFileRegistry.sol — DO NOT EDIT (regenerate with the script only)

interface IFSFileRegistry {
    struct FileData {
        bytes32 pieceCidPrefix;
        address sender;
        address recipient;
        uint16 pieceCidTail;
        bool acked;
    }

    struct SignatureData {
        address signer;
        uint48 timestamp;
        bytes32 signatureVisualHash;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function manager() external view returns (address);
    event FileRegistered();
    event FileAcknowledged();
    event SignatureSubmitted();
    function acknowledge(bytes32 cidIdentifier_) external;
    function registerFile(bytes32 pieceCidPrefix_, uint16 pieceCidTail_, address recipient_) external;
    function submitSignature(bytes32 cidIdentifier_, bytes32 signatureVisualHash_, uint8 v_, bytes32 r_, bytes32 s_) external;
    function cidIdentifier(bytes32 pieceCidPrefix_, uint16 pieceCidTail_) external pure returns (bytes32);
    function getFileData(bytes32 cidIdentifier_) external view returns (FileData memory);
    function getSignatureData(bytes32 cidIdentifier_) external view returns (SignatureData memory);
}
