export const definitions = {
  "0x7a69": {
    "FSManager": {
      "address": "0x59b670e9fa9d0a427751af201d676719a970857b",
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
      "address": "0xCe85503De9399D4dECa3c0b2bb3e9e7CFCBf9C6B",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        }
      ]
    },
    "FSKeyRegistry": {
      "address": "0x18998c7E38ede4dF09cEec08E5372Bf8fe5719ea",
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