// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Auto-generated from src/FSFileRegistry.sol — DO NOT EDIT (regenerate with the script only)

interface IFSFileRegistry {
    struct FileRegistration {
        bytes32 cidIdentifier;
        address sender;
        address recipient;
        uint256 timestamp;
    }

    function signatures(bytes32 key) external view returns (bytes memory);
    function nonce(address key) external view returns (uint256);
    function fileRegistrations(bytes32 key) external view returns (FileRegistration memory);
    function manager() external view returns (address);
    event FileRegistered();
    event FileSigned();
    function registerFile(address sender_, string calldata pieceCid_, address recipient, uint256 timestamp_, uint256 nonce_, bytes calldata signature_) external;
    function registerFileSignature(address sender_, string calldata pieceCid_, address recipient_, bytes32 signatureVisualHash_, bytes20 dl3SignatureCommitment_, uint256 timestamp_, uint256 nonce_, bytes calldata signature_) external;
    function validateFileRegistrationSignature(address sender_, string calldata pieceCid_, address recipient_, uint256 timestamp_, uint256 nonce_, bytes calldata signature_) external view returns (bool);
    function validateFileSigningSignature(address sender_, string calldata pieceCid_, address recipient_, bytes32 signatureVisualHash_, bytes20 dl3SignatureCommitment_, uint256 timestamp_, uint256 nonce_, bytes calldata signature_) external view returns (bool);
    function validateFileAckSignature(address recipient_, string calldata pieceCid_, address sender_, uint256 timestamp_, bytes calldata signature_) external view returns (bool);
    function cidIdentifier(string calldata pieceCid_) external pure returns (bytes32);
}
