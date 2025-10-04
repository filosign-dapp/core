// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.26;

import "./interfaces/IFSManager.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract FSFileRegistry is EIP712 {
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

    mapping(bytes32 => FileData) private _files;
    mapping(bytes32 => SignatureData) private _signatures;

    IFSManager public immutable manager;

    bytes32 private constant SIGNATURE_TYPEHASH =
        keccak256(
            "Signature(bytes32 pieceCidPrefix,uint256 pieceCidTail,bytes32 signatureVisualHash)"
        );

    event FileRegistered(
        bytes32 indexed cidIdentifier,
        address indexed sender,
        address indexed recipient,
        uint48 timestamp
    );
    event FileAcknowledged(
        bytes32 indexed cidIdentifier,
        address indexed recipient,
        uint48 timestamp
    );
    event SignatureSubmitted(
        bytes32 indexed cidIdentifier,
        address indexed signer,
        uint48 timestamp
    );

    constructor() EIP712("Filosign File Registry", "1") {
        manager = IFSManager(msg.sender);
    }

    function acknowledge(bytes32 cidIdentifier_) external {
        FileData storage file = _files[cidIdentifier_];
        require(file.sender != address(0), "File not registered");
        require(file.recipient == msg.sender, "Only recipient can ack");
        require(file.acked == false, "Already acknowledged");

        file.acked = true;

        emit FileAcknowledged(
            cidIdentifier_,
            msg.sender,
            uint48(block.timestamp)
        );
    }

    function registerFile(
        bytes32 pieceCidPrefix_,
        uint16 pieceCidTail_,
        address recipient_
    ) external {
        FileData storage file = _files[
            cidIdentifier(pieceCidPrefix_, pieceCidTail_)
        ];

        require(file.sender == address(0), "File already registered");
        require(
            manager.approvedSenders(recipient_, msg.sender),
            "Sender not approved by recipient"
        );

        file.pieceCidPrefix = pieceCidPrefix_;
        file.pieceCidTail = pieceCidTail_;
        file.sender = msg.sender;
        file.recipient = recipient_;
        file.acked = false;

        emit FileRegistered(
            cidIdentifier(pieceCidPrefix_, pieceCidTail_),
            msg.sender,
            recipient_,
            uint48(block.timestamp)
        );
    }

    function submitSignature(
        bytes32 cidIdentifier_,
        bytes32 signatureVisualHash_,
        uint8 v_,
        bytes32 r_,
        bytes32 s_
    ) external {
        FileData storage file = _files[cidIdentifier_];
        SignatureData storage signature = _signatures[cidIdentifier_];
        require(file.sender != address(0), "File not registered");
        require(
            file.recipient == msg.sender,
            "Only recipient can submit signature"
        );
        require(signature.signer == address(0), "Signature already submitted");
        require(
            file.acked == true,
            "file needs to be acknowledged before submitting signature"
        );

        bytes32 structHash = keccak256(
            abi.encode(
                SIGNATURE_TYPEHASH,
                file.pieceCidPrefix,
                uint256(file.pieceCidTail),
                signatureVisualHash_
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);

        address recovered = ECDSA.recover(digest, v_, r_, s_);
        require(recovered == msg.sender, "Invalid signature");

        signature.signer = msg.sender;
        signature.timestamp = uint48(block.timestamp);
        signature.signatureVisualHash = signatureVisualHash_;
        signature.v = v_;
        signature.r = r_;
        signature.s = s_;

        emit SignatureSubmitted(
            cidIdentifier_,
            msg.sender,
            uint48(block.timestamp)
        );
    }

    function cidIdentifier(
        bytes32 pieceCidPrefix_,
        uint16 pieceCidTail_
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(pieceCidPrefix_, pieceCidTail_));
    }

    function getFileData(
        bytes32 cidIdentifier_
    ) external view returns (FileData memory) {
        return _files[cidIdentifier_];
    }

    function getSignatureData(
        bytes32 cidIdentifier_
    ) external view returns (SignatureData memory) {
        return _signatures[cidIdentifier_];
    }

    // // kept for backward compatibility or other verififcation uses
    // function verifySignature(
    //     address signer_,
    //     bytes32 messageHash_,
    //     uint8 v_,
    //     bytes32 r_,
    //     bytes32 s_
    // ) internal pure returns (bool) {
    //     address recovered = ECDSA.recover(messageHash_, v_, r_, s_);
    //     return recovered == signer_;
    // }
}
