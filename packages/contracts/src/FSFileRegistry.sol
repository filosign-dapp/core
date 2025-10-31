// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.26;

import "./interfaces/IFSManager.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract FSFileRegistry is EIP712 {
    using ECDSA for bytes32;

    uint256 constant SIGNATURE_VALIDITY_PERIOD = 5 minutes;

    mapping(bytes32 => bytes) private _pieceCids;
    mapping(bytes32 => address[]) private _recipients;
    mapping(bytes32 => mapping(address => bool)) private _acknowledgements;

    IFSManager public immutable manager;

    modifier onlyServer() {
        require(msg.sender == manager.server(), "Only server can call");
        _;
    }

    event FileRegistered(
        bytes32 indexed cidIdentifier,
        address indexed recipient,
        uint48 timestamp
    );

    constructor() EIP712("FSFileRegistry", "1") {
        manager = IFSManager(msg.sender); //expect msgnseder to be fsmanager
    }

    bytes32 private constant REGISTER_FILE_TYPEHASH =
        keccak256(
            "RegisterFile(bytes32 cidIdentifier,address sender,bytes32 receipientsHash,uint256 timestamp,uint256 nonce)"
        );

    function registerFile(
        address sender_,
        bytes calldata pieceCid_,
        address[] calldata recipients_,
        uint256 timestamp_,
        uint256 nonce_,
        bytes calldata signature_
    ) external onlyServer {
        bytes32 cidId = keccak256(pieceCid_);
        _pieceCids[cidId] = pieceCid_;

        bytes32 receipientsHash = keccak256(abi.encodePacked(recipients_));
        bytes32 structHash = keccak256(
            abi.encode(
                REGISTER_FILE_TYPEHASH,
                cidId,
                sender_,
                receipientsHash,
                timestamp_,
                nonce_
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = ECDSA.recover(digest, signature_);
        require(recovered == msg.sender, "Invalid signature");

        for (uint i = 0; i < recipients_.length; i++) {
            require(
                manager.approvedSenders(recipients_[i], msg.sender),
                "Sender not approved by recipient"
            );
            require(
                block.timestamp <= timestamp_ + SIGNATURE_VALIDITY_PERIOD,
                "Signature expired"
            );
        }
    }

    function cidIdentifier(
        bytes32 pieceCidPrefix_,
        bytes16 pieceCidBuffer_,
        bytes32 pieceCidTail_
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    pieceCidPrefix_,
                    pieceCidBuffer_,
                    pieceCidTail_
                )
            );
    }
}
