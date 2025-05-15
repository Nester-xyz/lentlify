export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_paymentToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_feeCollector",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_graphAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_actionHub",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "InvalidMsgSender",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidParameter",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RedundantStateChange",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newGroveContentURI",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newContentHash",
        "type": "string"
      }
    ],
    "name": "CampaignContentUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "postId",
        "type": "string"
      }
    ],
    "name": "CampaignCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "groupURI",
        "type": "string"
      }
    ],
    "name": "CampaignGroupCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "CampaignPricesUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "likeSlotsAdded",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "commentSlotsAdded",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "quoteSlotsAdded",
        "type": "uint256"
      }
    ],
    "name": "CampaignSlotsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newEndTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "additionalFee",
        "type": "uint256"
      }
    ],
    "name": "CampaignTimeExtended",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum CampaignStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "CampaignUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "DepositsRefunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "DisplayFeeRefunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newCollector",
        "type": "address"
      }
    ],
    "name": "FeeCollectorUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "collector",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FeesCollected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "influencer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum ActionType",
        "name": "actionType",
        "type": "uint8"
      }
    ],
    "name": "InfluencerParticipated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "newFee",
        "type": "uint16"
      }
    ],
    "name": "PlatformFeeUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "influencer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardPaid",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "campaignGroups",
    "outputs": [
      {
        "internalType": "string",
        "name": "groupURI",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "campaignInfluencerActions",
    "outputs": [
      {
        "internalType": "address",
        "name": "influencerAddress",
        "type": "address"
      },
      {
        "internalType": "enum ActionType",
        "name": "action",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "paid",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "campaigns",
    "outputs": [
      {
        "internalType": "string",
        "name": "postId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "sellerAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountPool",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "depositsToPayInfluencers",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "paidDisplayFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      },
      {
        "internalType": "enum ActionType",
        "name": "actionType",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "minFollowersRequired",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "availableSlots",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "claimedSlots",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct AdDisplayTimePeriod",
        "name": "adDisplayTimePeriod",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "hourly",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "daily",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "weekly",
            "type": "uint256"
          }
        ],
        "internalType": "struct TimeBasedDisplayFee",
        "name": "timeBasedDisplayWiseFeePercent",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "rewardClaimableTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewardTimeEnd",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "groveContentURI",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contentHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "version",
        "type": "uint256"
      },
      {
        "internalType": "enum CampaignStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "components": [
          {
            "internalType": "string[]",
            "name": "country",
            "type": "string[]"
          },
          {
            "internalType": "string[]",
            "name": "interests",
            "type": "string[]"
          },
          {
            "internalType": "string[]",
            "name": "language",
            "type": "string[]"
          }
        ],
        "internalType": "struct TargetAudience",
        "name": "targetAudience",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "cancelCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimCollectedFees",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      },
      {
        "internalType": "enum ActionType",
        "name": "actionType",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "feed",
        "type": "address"
      }
    ],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "claimUnfulfilledSlots",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "completeCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "originalMsgSender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "feed",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "postId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "key",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "value",
            "type": "bytes"
          }
        ],
        "internalType": "struct KeyValue[]",
        "name": "params",
        "type": "tuple[]"
      }
    ],
    "name": "configure",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_groupId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_postId",
        "type": "string"
      },
      {
        "internalType": "enum ActionType",
        "name": "_actionType",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_availableSlots",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct AdDisplayTimePeriod",
        "name": "_adDisplayPeriod",
        "type": "tuple"
      },
      {
        "internalType": "string",
        "name": "_groveContentURI",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_contentHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_rewardClaimableTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_minFollowersCount",
        "type": "uint256"
      }
    ],
    "name": "createAdCampaign",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_groupURI",
        "type": "string"
      }
    ],
    "name": "createCampaignGroup",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "originalMsgSender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "feed",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "postId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "key",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "value",
            "type": "bytes"
          }
        ],
        "internalType": "struct KeyValue[]",
        "name": "params",
        "type": "tuple[]"
      }
    ],
    "name": "execute",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeCollector",
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
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "getCampaignInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "postId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "sellerAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "depositsToPayInfluencers",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minFollowersRequired",
        "type": "uint256"
      },
      {
        "internalType": "enum CampaignStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "groveContentURI",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contentHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "version",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "availableLikeSlots",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "availableCommentSlots",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "availableQuoteSlots",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "claimedLikeSlots",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "claimedCommentSlots",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "claimedQuoteSlots",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "likeReward",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "commentReward",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "quoteReward",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_groupId",
        "type": "uint256"
      }
    ],
    "name": "getGroupPosts",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "getRewardTimeStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "timeUntilStart",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timeUntilEnd",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "hasUserParticipated",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasUserClaimedReward",
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
        "name": "_seller",
        "type": "address"
      }
    ],
    "name": "getSellerCampaigns",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      }
    ],
    "name": "getSellerGroups",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "graph",
    "outputs": [
      {
        "internalType": "contract IGraphContract",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasClaimedReward",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasParticipated",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "enum ActionType",
        "name": "",
        "type": "uint8"
      }
    ],
    "name": "hasPerformedAction",
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
    "name": "owner",
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
    "name": "paymentToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeePercentage",
    "outputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "sellerCampaignGroups",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
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
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "sellerCampaigns",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "originalMsgSender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "feed",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "postId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isDisabled",
        "type": "bool"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "key",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "value",
            "type": "bytes"
          }
        ],
        "internalType": "struct KeyValue[]",
        "name": "params",
        "type": "tuple[]"
      }
    ],
    "name": "setDisabled",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_str",
        "type": "string"
      }
    ],
    "name": "stringToUint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalFeesCollected",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_newGroveContentURI",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_newContentHash",
        "type": "string"
      }
    ],
    "name": "updateCampaignContent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_newRewardPrice",
        "type": "uint256"
      }
    ],
    "name": "updateCampaignPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_additionalSlots",
        "type": "uint256"
      }
    ],
    "name": "updateCampaignSlots",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newCollector",
        "type": "address"
      }
    ],
    "name": "updateFeeCollector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "_newFeePercentage",
        "type": "uint16"
      }
    ],
    "name": "updatePlatformFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];