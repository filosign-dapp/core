export const definitions = {
  "FSManager": {
    "address": "0xf1041f9ac7a421aaa621adf6f473babf1234e972",
    "abi": [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "SenderApproved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "SenderRevoked",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender_",
            "type": "address"
          }
        ],
        "name": "approveSender",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "approvedSenders",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "cidRegistry",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "fileRegistry",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "keyRegistry",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender_",
            "type": "address"
          }
        ],
        "name": "revokeSender",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "server",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "version_",
            "type": "uint8"
          }
        ],
        "name": "setActiveVersion",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "version",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  "FSFileRegistry": {
    "address": "0x80989b1e3382dA0230a56d7713c291Bcbe6D3Cb5",
    "abi": [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "ECDSAInvalidSignature",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "length",
            "type": "uint256"
          }
        ],
        "name": "ECDSAInvalidSignatureLength",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "name": "ECDSAInvalidSignatureS",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidShortString",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "str",
            "type": "string"
          }
        ],
        "name": "StringTooLong",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [],
        "name": "EIP712DomainChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "cidIdentifier",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint48",
            "name": "timestamp",
            "type": "uint48"
          }
        ],
        "name": "FileAcknowledged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "cidIdentifier",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint48",
            "name": "timestamp",
            "type": "uint48"
          }
        ],
        "name": "FileRegistered",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "cidIdentifier",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "signer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint48",
            "name": "timestamp",
            "type": "uint48"
          }
        ],
        "name": "SignatureSubmitted",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "cidIdentifier_",
            "type": "bytes32"
          }
        ],
        "name": "acknowledge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "pieceCidPrefix_",
            "type": "bytes32"
          },
          {
            "internalType": "bytes16",
            "name": "pieceCidBuffer_",
            "type": "bytes16"
          },
          {
            "internalType": "bytes32",
            "name": "pieceCidTail_",
            "type": "bytes32"
          }
        ],
        "name": "cidIdentifier",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "eip712Domain",
        "outputs": [
          {
            "internalType": "bytes1",
            "name": "fields",
            "type": "bytes1"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "version",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "chainId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "verifyingContract",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "salt",
            "type": "bytes32"
          },
          {
            "internalType": "uint256[]",
            "name": "extensions",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "cidIdentifier_",
            "type": "bytes32"
          }
        ],
        "name": "getFileData",
        "outputs": [
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "pieceCidPrefix",
                "type": "bytes32"
              },
              {
                "internalType": "bytes16",
                "name": "pieceCidBuffer",
                "type": "bytes16"
              },
              {
                "internalType": "bytes32",
                "name": "pieceCidTail",
                "type": "bytes32"
              },
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              }
            ],
            "internalType": "struct FSFileRegistry.FileDataView",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "cidIdentifier_",
            "type": "bytes32"
          }
        ],
        "name": "getSignatureData",
        "outputs": [
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "signatureVisualHash",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
              },
              {
                "internalType": "address",
                "name": "signer",
                "type": "address"
              },
              {
                "internalType": "uint48",
                "name": "timestamp",
                "type": "uint48"
              },
              {
                "internalType": "uint8",
                "name": "signatureVisualPositionTop",
                "type": "uint8"
              },
              {
                "internalType": "uint8",
                "name": "signatureVisualPositionLeft",
                "type": "uint8"
              },
              {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
              }
            ],
            "internalType": "struct FSFileRegistry.SignatureData",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "cidIdentifier_",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "recipient_",
            "type": "address"
          }
        ],
        "name": "isAcknowledged",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "cidIdentifier_",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "recipient_",
            "type": "address"
          }
        ],
        "name": "isRecipient",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "manager",
        "outputs": [
          {
            "internalType": "contract IFSManager",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "pieceCidPrefix_",
            "type": "bytes32"
          },
          {
            "internalType": "bytes16",
            "name": "pieceCidBuffer_",
            "type": "bytes16"
          },
          {
            "internalType": "bytes32",
            "name": "pieceCidTail_",
            "type": "bytes32"
          },
          {
            "internalType": "address[]",
            "name": "recipients_",
            "type": "address[]"
          }
        ],
        "name": "registerFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "cidIdentifier_",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "signatureVisualHash_",
            "type": "bytes32"
          },
          {
            "internalType": "uint8",
            "name": "v_",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r_",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s_",
            "type": "bytes32"
          }
        ],
        "name": "submitSignature",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  "FSKeyRegistry": {
    "address": "0xF077E0bD7bB091E5e5346410AcE8C801727Aa996",
    "abi": [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "publicKey",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "version",
            "type": "uint8"
          }
        ],
        "name": "KeygenDataRegistered",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user_",
            "type": "address"
          }
        ],
        "name": "isRegistered",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "keygenData",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "salt_auth",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "salt_wrap",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "salt_pin",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "nonce",
            "type": "bytes32"
          },
          {
            "internalType": "bytes20",
            "name": "seed_head",
            "type": "bytes20"
          },
          {
            "internalType": "bytes32",
            "name": "seed_word",
            "type": "bytes32"
          },
          {
            "internalType": "bytes20",
            "name": "seed_tail",
            "type": "bytes20"
          },
          {
            "internalType": "bytes20",
            "name": "commitment_pin",
            "type": "bytes20"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "keygenDataVersion",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "manager",
        "outputs": [
          {
            "internalType": "contract IFSManager",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "publicKeys",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "salt_auth",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "salt_wrap",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "salt_pin",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "nonce",
                "type": "bytes32"
              },
              {
                "internalType": "bytes20",
                "name": "seed_head",
                "type": "bytes20"
              },
              {
                "internalType": "bytes32",
                "name": "seed_word",
                "type": "bytes32"
              },
              {
                "internalType": "bytes20",
                "name": "seed_tail",
                "type": "bytes20"
              },
              {
                "internalType": "bytes20",
                "name": "commitment_pin",
                "type": "bytes20"
              }
            ],
            "internalType": "struct FSKeyRegistry.KeygenData",
            "name": "data_",
            "type": "tuple"
          },
          {
            "internalType": "bytes32",
            "name": "publicKey_",
            "type": "bytes32"
          }
        ],
        "name": "registerKeygenData",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  }
} as const;
export const contractsDeployedAtBlock = 3090091n;