// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Auto-generated from src/FSKeyRegistry.sol — DO NOT EDIT (regenerate with the script only)

interface IFSKeyRegistry {
    struct KeygenData {
        bytes16 salt_pin;
        bytes16 salt_seed;
        bytes16 salt_challenge;
        bytes20 commitment_kyber_pk;
        bytes20 commitment_dilithium_pk;
    }

    function keygenData(address key) external view returns (KeygenData memory);
    function publicKeys(address key) external view returns (bytes32);
    event KeygenDataRegistered();
    function isRegistered(address user_) external view returns (bool);
    function registerKeygenData(bytes16 salt_pin_, bytes16 salt_seed_, bytes16 salt_challenge_, bytes20 commitment_kyber_pk_, bytes20 commitment_dilithium_pk_) external;
}
