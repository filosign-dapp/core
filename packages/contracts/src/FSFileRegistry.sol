// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.26;

import "./interfaces/IFSManager.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract FSFileRegistry is EIP712 {
    struct FileData {
        bytes32 pieceCidPrefix;
        bytes16 pieceCidBuffer;
        bytes32 pieceCidTail;
        address sender;
        mapping(address => bool) recipients;
        mapping(address => bool) acked;
    }

    struct SignatureData {
        bytes32 signatureVisualHash;
        bytes32 r;
        bytes32 s;
        address signer;
        uint48 timestamp;
        uint8 v;
    }

    struct FileDataView {
        bytes32 pieceCidPrefix;
        bytes16 pieceCidBuffer;
        bytes32 pieceCidTail;
        address sender;
    }

    mapping(bytes32 => FileData) private _files;
    mapping(bytes32 => SignatureData) private _signatures;

    IFSManager public immutable manager;

    bytes32 private constant SIGNATURE_TYPEHASH =
        keccak256(
            "Signature(bytes32 pieceCidPrefix,bytes16 pieceCidBuffer,bytes32 pieceCidTail,bytes32 signatureVisualHash)"
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

        require(file.recipients[msg.sender], "Only recipient can ack");

        require(!file.acked[msg.sender], "Already acknowledged");

        file.acked[msg.sender] = true;

        emit FileAcknowledged(
            cidIdentifier_,
            msg.sender,
            uint48(block.timestamp)
        );
    }

    function registerFile(
        bytes32 pieceCidPrefix_,
        bytes16 pieceCidBuffer_,
        bytes32 pieceCidTail_,
        address[] calldata recipients_
    ) external {
        FileData storage file = _files[
            cidIdentifier(pieceCidPrefix_, pieceCidBuffer_, pieceCidTail_)
        ];

        require(file.sender == address(0), "File already registered");

        file.pieceCidPrefix = pieceCidPrefix_;
        file.pieceCidBuffer = pieceCidBuffer_;
        file.pieceCidTail = pieceCidTail_;
        file.sender = msg.sender;

        bytes32 cid = cidIdentifier(
            pieceCidPrefix_,
            pieceCidBuffer_,
            pieceCidTail_
        );
        uint48 timestamp = uint48(block.timestamp);
        for (uint i = 0; i < recipients_.length; i++) {
            require(
                manager.approvedSenders(recipients_[i], msg.sender),
                "Sender not approved by recipient"
            );
            file.recipients[recipients_[i]] = true;
            emit FileRegistered(cid, msg.sender, recipients_[i], timestamp);
        }
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
            file.recipients[msg.sender],
            "Only recipient can submit signature"
        );
        require(signature.signer == address(0), "Signature already submitted");
        require(
            file.acked[msg.sender],
            "file needs to be acknowledged before submitting signature"
        );

        bytes32 structHash = keccak256(
            abi.encode(
                SIGNATURE_TYPEHASH,
                file.pieceCidPrefix,
                file.pieceCidBuffer,
                file.pieceCidTail,
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

    function getFileData(
        bytes32 cidIdentifier_
    ) external view returns (FileDataView memory) {
        FileData storage file = _files[cidIdentifier_];
        return
            FileDataView(
                file.pieceCidPrefix,
                file.pieceCidBuffer,
                file.pieceCidTail,
                file.sender
            );
    }

    function isRecipient(
        bytes32 cidIdentifier_,
        address recipient_
    ) external view returns (bool) {
        return _files[cidIdentifier_].recipients[recipient_];
    }

    function isAcknowledged(
        bytes32 cidIdentifier_,
        address recipient_
    ) external view returns (bool) {
        return _files[cidIdentifier_].acked[recipient_];
    }

    function getSignatureData(
        bytes32 cidIdentifier_
    ) external view returns (SignatureData memory) {
        return _signatures[cidIdentifier_];
    }
}
