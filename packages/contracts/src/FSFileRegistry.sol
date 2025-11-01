// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.26;

import "./interfaces/IFSManager.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract FSFileRegistry is EIP712 {
    using ECDSA for bytes32;

    uint256 constant SIGNATURE_VALIDITY_PERIOD = 5 minutes;

    struct FileRegistration {
        bytes32 cidIdentifier;
        address sender;
        address recipient;
        uint256 timestamp;
    }

    mapping(bytes32 => bytes) public signatures;
    mapping(address => uint256) public nonce;

    mapping(bytes32 => FileRegistration) public fileRegistrations;

    IFSManager public immutable manager;

    modifier onlyServer() {
        require(msg.sender == manager.server(), "Only server can call");
        _;
    }

    event FileRegistered(
        bytes32 indexed cidIdentifier,
        address indexed sender,
        address indexed recipient,
        uint48 timestamp
    );
    event FileSigned(
        bytes32 indexed cidIdentifier,
        address indexed sender,
        address indexed recipient,
        uint48 timestamp
    );

    constructor() EIP712("FSFileRegistry", "1") {
        manager = IFSManager(msg.sender); // expect msg.sender to be fsmanager
    }

    bytes32 private constant REGISTER_FILE_TYPEHASH =
        keccak256(
            "RegisterFile(bytes32 cidIdentifier,address sender,address recipient,uint256 timestamp,uint256 nonce)"
        );
    bytes32 private constant ACK_FILE_TYPEHASH =
        keccak256(
            "AckFile(bytes32 cidIdentifier,address sender,address recipient,uint256 timestamp,uint256 nonce)"
        );
    bytes32 private constant SIGN_FILE_TYPEHASH =
        keccak256(
            "SignFile(bytes32 cidIdentifier,address sender,address recipient,bytes32 signatureVisualHash, bytes20 dl3SignatureCommitment,uint256 timestamp,uint256 nonce)"
        );

    function registerFile(
        address sender_,
        string calldata pieceCid_,
        address recipient,
        uint256 timestamp_,
        uint256 nonce_,
        bytes calldata signature_
    ) external onlyServer {
        require(nonce_ == nonce[sender_]++, "Invalid nonce");
        require(
            validateFileRegistrationSignature(
                sender_,
                pieceCid_,
                recipient,
                timestamp_,
                nonce_,
                signature_
            ),
            "Invalid signature"
        );

        fileRegistrations[cidIdentifier(pieceCid_)] = FileRegistration({
            cidIdentifier: cidIdentifier(pieceCid_),
            sender: sender_,
            recipient: recipient,
            timestamp: timestamp_
        });

        emit FileRegistered(
            cidIdentifier(pieceCid_),
            sender_,
            recipient,
            uint48(timestamp_)
        );
    }

    function registerFileSignature(
        address sender_,
        string calldata pieceCid_,
        address recipient_,
        bytes calldata signatureBytes_,
        bytes20 dl3SignatureCommitment_,
        uint256 timestamp_,
        uint256 nonce_,
        bytes calldata signature_
    ) external onlyServer {
        require(nonce_ == nonce[sender_]++, "Invalid nonce");
        require(
            validateFileSigningSignature(
                sender_,
                pieceCid_,
                recipient_,
                keccak256(signatureBytes_),
                dl3SignatureCommitment_,
                timestamp_,
                signature_
            ),
            "Invalid signature"
        );

        bytes32 cidId = cidIdentifier(pieceCid_);
        require(fileRegistrations[cidId].timestamp != 0, "File not registered");

        signatures[cidId] = signatureBytes_;

        emit FileSigned(cidId, sender_, recipient_, uint48(timestamp_));
    }

    function validateFileRegistrationSignature(
        address sender_,
        string calldata pieceCid_,
        address recipient_,
        uint256 timestamp_,
        uint256 nonce_,
        bytes calldata signature_
    ) public view returns (bool) {
        require(
            block.timestamp <= timestamp_ + SIGNATURE_VALIDITY_PERIOD,
            "Signature expired"
        );
        require(manager.isRegistered(sender_), "Sender not registered");
        require(
            manager.approvedSenders(recipient_, sender_),
            "Sender not approved by recipient"
        );

        bytes32 cidId = cidIdentifier(pieceCid_);
        bytes32 structHash = keccak256(
            abi.encode(
                REGISTER_FILE_TYPEHASH,
                cidId,
                sender_,
                recipient_,
                timestamp_,
                nonce_
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        return ECDSA.recover(digest, signature_) == sender_;
    }

    function validateFileSigningSignature(
        address sender_,
        string calldata pieceCid_,
        address recipient_,
        bytes32 signatureVisualHash_,
        bytes20 dl3SignatureCommitment_,
        uint256 timestamp_,
        bytes calldata signature_
    ) public view returns (bool) {
        require(
            block.timestamp <= timestamp_ + SIGNATURE_VALIDITY_PERIOD,
            "Signature expired"
        );

        FileRegistration storage file = fileRegistrations[
            cidIdentifier(pieceCid_)
        ];
        require(file.recipient == recipient_, "Invalid recipient");
        require(file.sender == sender_, "Invalid sender");

        bytes32 cidId = cidIdentifier(pieceCid_);
        bytes32 structHash = keccak256(
            abi.encode(
                SIGN_FILE_TYPEHASH,
                cidId,
                sender_,
                recipient_,
                signatureVisualHash_,
                dl3SignatureCommitment_,
                timestamp_
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        return ECDSA.recover(digest, signature_) == sender_;
    }

    function validateFileAckSignature(
        address recipient_,
        string calldata pieceCid_,
        address sender_,
        uint256 timestamp_,
        bytes calldata signature_
    ) public view returns (bool) {
        require(
            block.timestamp <= timestamp_ + SIGNATURE_VALIDITY_PERIOD,
            "Signature expired"
        );
        FileRegistration storage file = fileRegistrations[
            cidIdentifier(pieceCid_)
        ];
        require(file.recipient == recipient_, "Invalid recipient");
        require(file.sender == sender_, "Invalid sender");

        bytes32 cidId = cidIdentifier(pieceCid_);
        bytes32 structHash = keccak256(
            abi.encode(
                ACK_FILE_TYPEHASH,
                cidId,
                sender_,
                recipient_,
                timestamp_
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        return ECDSA.recover(digest, signature_) == recipient_;
    }

    function cidIdentifier(
        string calldata pieceCid_
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(pieceCid_));
    }
}
