// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Auto-generated from src/FSFileRegistry.sol — DO NOT EDIT (regenerate with the script only)

interface IFSFileRegistry {
    function nonce(address key) external view returns (uint256);
    function manager() external view returns (address);
    event FileRegistered();
    function registerFile(address sender_, string calldata pieceCid_, address[] calldata recipients_, uint256 timestamp_, uint256 nonce_, bytes calldata signature_) external;
    function validateFileRegistrationSignature(address sender_, string calldata pieceCid_, address[] calldata recipients_, uint256 timestamp_, uint256 nonce_, bytes calldata signature_) external view returns (address);
    function cidIdentifier(string calldata pieceCid_) external pure returns (bytes32);
}
