/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/trustify.json`.
 */
export type Trustify = {
  "address": "GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R",
  "metadata": {
    "name": "trustify",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Trustify - Blockchain Escrow Smart Contract"
  },
  "instructions": [
    {
      "name": "acceptEscrow",
      "docs": [
        "Freelancer accepts the escrow task"
      ],
      "discriminator": [
        193,
        2,
        224,
        245,
        36,
        116,
        65,
        154
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow.client",
                "account": "escrow"
              },
              {
                "kind": "account",
                "path": "escrow.escrow_id",
                "account": "escrow"
              }
            ]
          }
        },
        {
          "name": "freelancer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "cancelEscrow",
      "docs": [
        "Client cancels escrow (only if not yet accepted)"
      ],
      "discriminator": [
        156,
        203,
        54,
        179,
        38,
        72,
        33,
        21
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow.client",
                "account": "escrow"
              },
              {
                "kind": "account",
                "path": "escrow.escrow_id",
                "account": "escrow"
              }
            ]
          }
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createEscrow",
      "docs": [
        "Create a new escrow - Client deposits SOL into PDA vault"
      ],
      "discriminator": [
        253,
        215,
        165,
        116,
        36,
        108,
        68,
        80
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "client"
              },
              {
                "kind": "arg",
                "path": "escrowId"
              }
            ]
          }
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "escrowId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "raiseDispute",
      "docs": [
        "Raise a dispute (either party can raise)"
      ],
      "discriminator": [
        41,
        243,
        1,
        51,
        150,
        95,
        246,
        73
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow.client",
                "account": "escrow"
              },
              {
                "kind": "account",
                "path": "escrow.escrow_id",
                "account": "escrow"
              }
            ]
          }
        },
        {
          "name": "caller",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "releaseFunds",
      "docs": [
        "Client releases funds to freelancer after work completion"
      ],
      "discriminator": [
        225,
        88,
        91,
        108,
        126,
        52,
        2,
        26
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow.client",
                "account": "escrow"
              },
              {
                "kind": "account",
                "path": "escrow.escrow_id",
                "account": "escrow"
              }
            ]
          }
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        },
        {
          "name": "freelancer",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "submitWork",
      "docs": [
        "Freelancer submits work for review"
      ],
      "discriminator": [
        158,
        80,
        101,
        51,
        114,
        130,
        101,
        253
      ],
      "accounts": [
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow.client",
                "account": "escrow"
              },
              {
                "kind": "account",
                "path": "escrow.escrow_id",
                "account": "escrow"
              }
            ]
          }
        },
        {
          "name": "freelancer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
      ]
    }
  ],
  "events": [
    {
      "name": "disputeRaised",
      "discriminator": [
        246,
        167,
        109,
        37,
        142,
        45,
        38,
        176
      ]
    },
    {
      "name": "escrowAccepted",
      "discriminator": [
        129,
        122,
        76,
        235,
        127,
        11,
        32,
        165
      ]
    },
    {
      "name": "escrowCancelled",
      "discriminator": [
        98,
        241,
        195,
        122,
        213,
        0,
        162,
        161
      ]
    },
    {
      "name": "escrowCreated",
      "discriminator": [
        70,
        127,
        105,
        102,
        92,
        97,
        7,
        173
      ]
    },
    {
      "name": "fundsReleased",
      "discriminator": [
        178,
        119,
        252,
        230,
        131,
        104,
        210,
        210
      ]
    },
    {
      "name": "workSubmitted",
      "discriminator": [
        136,
        185,
        210,
        174,
        216,
        140,
        64,
        125
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Invalid escrow amount - must be greater than 0"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Description too long - max 200 characters"
    },
    {
      "code": 6002,
      "name": "invalidStatus",
      "msg": "Invalid escrow status for this operation"
    },
    {
      "code": 6003,
      "name": "clientCannotBeFreelancer",
      "msg": "Client cannot be the freelancer"
    },
    {
      "code": 6004,
      "name": "unauthorizedFreelancer",
      "msg": "Unauthorized - only the freelancer can perform this action"
    },
    {
      "code": 6005,
      "name": "unauthorizedClient",
      "msg": "Unauthorized - only the client can perform this action"
    },
    {
      "code": 6006,
      "name": "invalidFreelancer",
      "msg": "Invalid freelancer address"
    },
    {
      "code": 6007,
      "name": "cannotCancelInProgress",
      "msg": "Cannot cancel escrow that is already in progress"
    },
    {
      "code": 6008,
      "name": "unauthorizedCaller",
      "msg": "Unauthorized caller for this operation"
    }
  ],
  "types": [
    {
      "name": "disputeRaised",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrow",
            "type": "pubkey"
          },
          {
            "name": "raisedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "client",
            "type": "pubkey"
          },
          {
            "name": "freelancer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "escrowStatus"
              }
            }
          },
          {
            "name": "escrowId",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "escrowAccepted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrow",
            "type": "pubkey"
          },
          {
            "name": "freelancer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "escrowCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrow",
            "type": "pubkey"
          },
          {
            "name": "client",
            "type": "pubkey"
          },
          {
            "name": "refundedAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "escrowCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrow",
            "type": "pubkey"
          },
          {
            "name": "client",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "escrowStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "inProgress"
          },
          {
            "name": "submitted"
          },
          {
            "name": "completed"
          },
          {
            "name": "cancelled"
          },
          {
            "name": "disputed"
          }
        ]
      }
    },
    {
      "name": "fundsReleased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrow",
            "type": "pubkey"
          },
          {
            "name": "freelancer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "workSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrow",
            "type": "pubkey"
          },
          {
            "name": "freelancer",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
