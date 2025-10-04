// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.26;

import "./interfaces/IFSManager.sol";

contract FSKeyRegistry {
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

    mapping(address => KeygenData) public keygenData;
    mapping(address => uint8) public keygenDataVersion;
    mapping(address => bytes32) public publicKeys;

    IFSManager public immutable manager;

    event KeygenDataRegistered(
        address indexed user,
        bytes32 publicKey,
        uint8 version
    );

    constructor() {
        manager = IFSManager(msg.sender);
    }

    function isRegistered(address user_) public view returns (bool) {
        return keygenData[user_].nonce != bytes32(0);
    }

    function registerKeygenData(
        KeygenData memory data_,
        bytes32 publicKey_
    ) external {
        require(data_.nonce != bytes32(0), "Invalid nonce");
        require(isRegistered(msg.sender) == false, "Data already registered");

        keygenDataVersion[msg.sender] = manager.version();
        keygenData[msg.sender] = data_;
        publicKeys[msg.sender] = publicKey_;

        emit KeygenDataRegistered(msg.sender, publicKey_, manager.version());
    }
}
