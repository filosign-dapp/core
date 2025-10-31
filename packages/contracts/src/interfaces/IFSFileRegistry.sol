// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Auto-generated from src/FSFileRegistry.sol — DO NOT EDIT (regenerate with the script only)

interface IFSFileRegistry {
    function manager() external view returns (address);
    event FileRegistered();
    function registerFile(address sender_, bytes calldata pieceCid_, address[] calldata recipients_, uint256 timestamp_, uint256 nonce_, bytes calldata signature_) external;
    function cidIdentifier(bytes32 pieceCidPrefix_, bytes16 pieceCidBuffer_, bytes32 pieceCidTail_) external pure returns (bytes32);
}
