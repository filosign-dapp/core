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
        address receipient;
        uint256 timestamp;
        uint256 nonce;
    }

    mapping(bytes32 => string) private _pieceCids;

    mapping(address => uint256) public nonce;

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

    constructor() EIP712("FSFileRegistry", "1") {
        manager = IFSManager(msg.sender); //expect msgnseder to be fsmanager
    }

    bytes32 private constant REGISTER_FILE_TYPEHASH =
        keccak256(
            "RegisterFile(bytes32 cidIdentifier,address sender,address receipient,uint256 timestamp,uint256 nonce)"
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
            block.timestamp <= timestamp_ + SIGNATURE_VALIDITY_PERIOD,
            "Signature expired"
        );

        address recovered = validateFileRegistrationSignature(
            sender_,
            pieceCid_,
            recipient,
            timestamp_,
            nonce_,
            signature_
        );
        require(recovered == msg.sender, "Invalid signature");

        nonce[sender_]++;
    }

    function validateFileRegistrationSignature(
        address sender_,
        string calldata pieceCid_,
        address recipient_,
        uint256 timestamp_,
        uint256 nonce_,
        bytes calldata signature_
    ) public view returns (address) {
        require(manager.isRegistered(sender_), "Sender not registered");
        require(
            manager.approvedSenders(recipient_, msg.sender),
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
        return ECDSA.recover(digest, signature_);
    }

    function cidIdentifier(
        string calldata pieceCid_
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(pieceCid_));
    }
}
