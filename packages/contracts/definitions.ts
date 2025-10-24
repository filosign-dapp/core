export const definitions = {
  "0x7a69": {
    "FSManager": {
      "address": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
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
      "address": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        }
      ]
    },
    "FSKeyRegistry": {
      "address": "0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968",
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
              "internalType": "bytes16",
              "name": "salt_pin",
              "type": "bytes16"
            },
            {
              "internalType": "bytes16",
              "name": "salt_seed",
              "type": "bytes16"
            },
            {
              "internalType": "bytes16",
              "name": "salt_challenge",
              "type": "bytes16"
            },
            {
              "internalType": "bytes20",
              "name": "commitment_kyber_pk",
              "type": "bytes20"
            },
            {
              "internalType": "bytes20",
              "name": "commitment_dilithium_pk",
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
              "internalType": "bytes16",
              "name": "salt_pin_",
              "type": "bytes16"
            },
            {
              "internalType": "bytes16",
              "name": "salt_seed_",
              "type": "bytes16"
            },
            {
              "internalType": "bytes16",
              "name": "salt_challenge_",
              "type": "bytes16"
            },
            {
              "internalType": "bytes20",
              "name": "commitment_kyber_pk_",
              "type": "bytes20"
            },
            {
              "internalType": "bytes20",
              "name": "commitment_dilithium_pk_",
              "type": "bytes20"
            }
          ],
          "name": "registerKeygenData",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    }
  },
  "0x4cb2f": {
    "FSManager": {
      "address": "0xaec6b044af14bf38cdceb8fdf60dbe8a60e9fe35",
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
      "address": "0xB6eAB68b731148AA86007d8e10d1Da4Da80a8F89",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        }
      ]
    },
    "FSKeyRegistry": {
      "address": "0xA5b3991593868e492f6b21890265560519BC7016",
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
              "internalType": "bytes16",
              "name": "salt_pin",
              "type": "bytes16"
            },
            {
              "internalType": "bytes16",
              "name": "salt_seed",
              "type": "bytes16"
            },
            {
              "internalType": "bytes16",
              "name": "salt_challenge",
              "type": "bytes16"
            },
            {
              "internalType": "bytes20",
              "name": "commitment_kyber_pk",
              "type": "bytes20"
            },
            {
              "internalType": "bytes20",
              "name": "commitment_dilithium_pk",
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
              "internalType": "bytes16",
              "name": "salt_pin_",
              "type": "bytes16"
            },
            {
              "internalType": "bytes16",
              "name": "salt_seed_",
              "type": "bytes16"
            },
            {
              "internalType": "bytes16",
              "name": "salt_challenge_",
              "type": "bytes16"
            },
            {
              "internalType": "bytes20",
              "name": "commitment_kyber_pk_",
              "type": "bytes20"
            },
            {
              "internalType": "bytes20",
              "name": "commitment_dilithium_pk_",
              "type": "bytes20"
            }
          ],
          "name": "registerKeygenData",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    }
  }
} as const;