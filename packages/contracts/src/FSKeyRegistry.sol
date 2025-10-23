// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

import "./interfaces/IFSManager.sol";

contract FSKeyRegistry {
    struct KeygenData {
        bytes16 salt_pin;
        bytes16 salt_seed;
        bytes16 salt_challenge;
        bytes20 commitment_kyber_pk;
        bytes20 commitment_dilithium_pk;
    }

    mapping(address => KeygenData) public keygenData;
    mapping(address => bytes32) public publicKeys;

    event KeygenDataRegistered(address indexed user);

    constructor() {}

    function isRegistered(address user_) public view returns (bool) {
        return
            keygenData[user_].commitment_kyber_pk != bytes20(0) ||
            keygenData[user_].commitment_dilithium_pk != bytes20(0);
    }

    function registerKeygenData(
        bytes16 salt_pin_,
        bytes16 salt_seed_,
        bytes16 salt_challenge_,
        bytes20 commitment_kyber_pk_,
        bytes20 commitment_dilithium_pk_
    ) external {
        require(salt_pin_ != bytes16(0), "Invalid salt_pin");
        require(salt_seed_ != bytes16(0), "Invalid salt_seed");
        require(
            commitment_kyber_pk_ != bytes20(0),
            "Invalid commitment_kyber_pk"
        );
        require(
            commitment_dilithium_pk_ != bytes20(0),
            "Invalid commitment_dilithium_pk"
        );
        require(isRegistered(msg.sender) == false, "Data already registered");

        keygenData[msg.sender] = KeygenData({
            salt_pin: salt_pin_,
            salt_seed: salt_seed_,
            salt_challenge: salt_challenge_,
            commitment_kyber_pk: commitment_kyber_pk_,
            commitment_dilithium_pk: commitment_dilithium_pk_
        });

        emit KeygenDataRegistered(msg.sender);
    }
}
