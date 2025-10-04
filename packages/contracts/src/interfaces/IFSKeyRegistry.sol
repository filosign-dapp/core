// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Auto-generated from src/FSKeyRegistry.sol — DO NOT EDIT (regenerate with the script only)

interface IFSKeyRegistry {
    struct KeygenData {
        bytes32 salt_auth;
        bytes32 salt_wrap;
        bytes32 salt_pin;
        bytes32 nonce;
        bytes20 seed_head;
        bytes32 seed_word;
        bytes20 seed_tail;
        bytes20 commitment_pin;
    }

    function keygenData(address key) external view returns (KeygenData memory);
    function keygenDataVersion(address key) external view returns (uint8);
    function publicKeys(address key) external view returns (bytes32);
    function manager() external view returns (address);
    event KeygenDataRegistered();
    function isRegistered(address user_) external view returns (bool);
    function registerKeygenData(KeygenData memory data_, bytes32 publicKey_) external;
}
