import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient, useBalance, useSendTransaction } from 'wagmi';
import { useEffect, useState } from 'react';
import { fetchPostIdAsUint, postIdToHex } from '../utils/lensPostUtils';
import { encodeFunctionData, keccak256, toBytes, encodeAbiParameters, stringToHex } from 'viem';
import { contractAddress, feedAddress, paymentTokenAddress } from '../constants/addresses';
import { abi } from '../constants/abi';
import { useSessionClient } from '../context/session/sessionContext';
import type { Address } from 'viem';
import { UseAuth } from '@/context/auth/AuthContext';

const CONTRACT_ADDRESS = contractAddress;
const LENS_AD_CAMPAIGN_ABI = abi;

// Add Lens Account ABI for smart wallet transactions
const accountABI = [
	{
		name: "executeTransaction",
		type: "function",
		inputs: [
			{ name: "to", type: "address" },
			{ name: "value", type: "uint256" },
			{ name: "data", type: "bytes" }
		],
		outputs: [],
		stateMutability: "nonpayable"
	}
] as const;

// Contract configuration
const lensAdCampaignConfig = {
	address: CONTRACT_ADDRESS as `0x${string}`,
	abi: LENS_AD_CAMPAIGN_ABI,
} as const;

// Enum types from the contract
export enum CampaignStatus {
  PENDING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3
}

export enum ActionType {
  NONE = 0,
  MIRROR = 1,
  COMMENT = 2,
  QUOTE = 3
}

// Function to approve token spending
export const useTokenApproval = () => {
  const { writeContract: writeApprove } = useWriteContract();
  const { address: accountAddress } = useAccount();
  const approveTokenSpending = async (amount: bigint) => {
    try {
      if (!accountAddress) {
        throw new Error("Wallet not connected properly");
      }
      const result = await writeApprove({
        address: paymentTokenAddress as `0x${string}`,
        abi: [
          {
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "approve",
        args: [CONTRACT_ADDRESS as `0x${string}`, amount],
        // Use higher gas limit for Lens token
        gas: 300000n,
      });
      return result;
    } catch (error: any) {
      console.error("Error approving token spending:", error);
      throw error;
    }
  };
  return { approveTokenSpending };
};

export const useLensAdCampaignMarketplace = () => {
  // We need the wallet address for direct contract calls
  const { address } = useAccount();
  const { activeLensAddress } = useSessionClient();
  const publicClient = usePublicClient();
  const { profile } = UseAuth();

  const { data: balance } = useBalance({
    address: profile?.address as Address,
  });

  // Check if we should use Lens account
  const useLensAccount = !!profile?.address;

  // Log the addresses being used
  useEffect(() => {
    if (useLensAccount) {
      console.log("Using Lens smart wallet address:", profile?.address);
      console.log("Connected wallet address:", address);
    }
  }, [useLensAccount, profile?.address, address]);

  // Read functions
  const { data: platformFeePercentage } = useReadContract({
    ...lensAdCampaignConfig,
    functionName: "platformFeePercentage",
  });

  const { data: totalFeesCollected } = useReadContract({
    ...lensAdCampaignConfig,
    functionName: "totalFeesCollected",
  });

  const { data: campaignCounter } = useReadContract({
    ...lensAdCampaignConfig,
    functionName: "campaignCounter",
  });

  // Function to get the total number of ad campaigns created
  const getCampaignAdCount = async () => {
    try {
      if (!publicClient) {
        console.error("Public client not available");
        return 0;
      }
      const count = await publicClient.readContract({
        ...lensAdCampaignConfig,
        functionName: "getCampaignAdCount",
      });
      return count;
    } catch (error) {
      console.error("Error getting campaign ad count:", error);
      return 0;
    }
  };

  // Function to get the total number of campaign groups created
  const getCampaignGroupCount = async () => {
    try {
      if (!publicClient) {
        console.error("Public client not available");
        return 0;
      }
      const count = await publicClient.readContract({
        ...lensAdCampaignConfig,
        functionName: "getCampaignGroupCount",
      });
      return count;
    } catch (error) {
      console.error("Error getting campaign group count:", error);
      return 0;
    }
  };

  const { data: groupCounter } = useReadContract({
    ...lensAdCampaignConfig,
    functionName: "groupCounter",
  });

  // Function to get campaign details
  const getCampaign = async (campaignId: number) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "campaigns",
        args: [campaignId],
      });
      return data;
    } catch (error) {
      console.error("Error reading campaign details:", error);
      return null;
    }
  };

  // Function to get seller campaigns
  const getSellerCampaigns = async (sellerAddress: `0x${string}`) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "sellerCampaigns",
        args: [sellerAddress],
      });
      return data;
    } catch (error) {
      console.error("Error reading seller campaigns:", error);
      return null;
    }
  };

  // Function to get the count of participants for a campaign
  const getCampaignParticipantCount = async (campaignId: number) => {
    try {
      console.log(`Fetching participant count for campaign ${campaignId}`);
      const count = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'getCampaignParticipantCount',
        args: [campaignId],
      }) as bigint;
      
      console.log(`Retrieved participant count for campaign ${campaignId}: ${count}`);
      return Number(count);
    } catch (error) {
      console.error('Error getting campaign participant count:', error);
      return 0;
    }
  };
  
  // Function to get all participants for a campaign directly from the contract
  const getCampaignParticipantAddresses = async (campaignId: number) => {
    try {
      console.log(`Fetching participants for campaign ${campaignId} using direct contract call`);
      // Use the new contract function to get participants directly
      const participants = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'getCampaignParticipantAddresses',
        args: [campaignId],
      }) as `0x${string}`[];
      
      console.log(`Retrieved ${participants.length} participants directly from contract for campaign ${campaignId}:`, participants);
      
      // Check if any of the participants have performed actions
      if (participants.length > 0) {
        for (const participant of participants) {
          const hasPerformedAnyAction = await publicClient!.readContract({
            ...lensAdCampaignConfig,
            functionName: 'hasParticipated',
            args: [campaignId, participant],
          });
          
          console.log(`Participant ${participant} has participated in campaign ${campaignId}: ${hasPerformedAnyAction}`);
        }
      }
      
      return participants;
    } catch (error) {
      console.error('Error getting campaign participant addresses:', error);
      throw error; // Rethrow to allow fallback to other methods
    }
  };

  // Legacy function to get all participants for a campaign (fallback method)
  // This is a simplified approach that doesn't rely on event logs
  const getCampaignParticipants = async (campaignId: number) => {
    try {
      // For demo purposes, we'll use the current user's address
      // In a production environment, you would need a contract method that returns all participants
      // or use an indexer/subgraph to track these events
      
      // Get the campaign info first to verify it exists
      const campaign = await getCampaignInfo(campaignId);
      if (!campaign) {
        console.error('Campaign not found');
        return [];
      }
      
      // For now, we'll use a mock approach with the current user's address
      // and the campaign seller's address to demonstrate the UI
      const mockParticipants: `0x${string}`[] = [];
      
      // Add the current user's address if available
      if (profile?.address) {
        mockParticipants.push(profile.address as `0x${string}`);
      }
      
      // Add the campaign seller's address
      if (campaign.sellerAddress) {
        mockParticipants.push(campaign.sellerAddress as `0x${string}`);
      }
      
      // Add some mock addresses for demonstration
      // In a real implementation, you would get these from your contract or database
      const demoAddresses: `0x${string}`[] = [
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012'
      ];
      
      // Add some demo addresses if we don't have enough participants
      if (mockParticipants.length < 2) {
        mockParticipants.push(...demoAddresses);
      }
      
      // Remove duplicates
      const uniqueParticipants = [...new Set(mockParticipants)];
      
      console.log(`Using ${uniqueParticipants.length} mock participants for campaign ${campaignId}`);
      return uniqueParticipants;
    } catch (error) {
      console.error('Error getting campaign participants:', error);
      return [];
    }
  };
  
  // Function to get campaign influencer actions
  const getCampaignInfluencerActions = async (
    campaignId: number,
    influencerAddress: `0x${string}`
  ) => {
    try {
      // First check if the user has participated in this campaign
      const hasParticipated = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'hasParticipated',
        args: [campaignId, influencerAddress],
      });
      
      if (!hasParticipated) {
        console.log('User has not participated in this campaign');
        return [];
      }
      
      // Use a multicall to check which actions the user has performed
      const actionChecks = await publicClient!.multicall({
        contracts: [
          {
            ...lensAdCampaignConfig,
            functionName: 'hasPerformedAction',
            args: [campaignId, influencerAddress, ActionType.MIRROR],
          },
          {
            ...lensAdCampaignConfig,
            functionName: 'hasPerformedAction',
            args: [campaignId, influencerAddress, ActionType.COMMENT],
          },
          {
            ...lensAdCampaignConfig,
            functionName: 'hasPerformedAction',
            args: [campaignId, influencerAddress, ActionType.QUOTE],
          },
        ],
      });
      
      // Create action objects based on what we found
      const actions = [];
      const actionTypes = [ActionType.MIRROR, ActionType.COMMENT, ActionType.QUOTE];
      
      for (let i = 0; i < actionChecks.length; i++) {
        if (actionChecks[i].status === 'success' && actionChecks[i].result === true) {
          actions.push({
            influencerAddress,
            action: actionTypes[i],
            timestamp: BigInt(Math.floor(Date.now() / 1000) - (i * 60)), // Stagger timestamps slightly
            paid: false,
            postString: `Action ${ActionType[actionTypes[i]]} performed on campaign ${campaignId}`
          });
        }
      }
      
      return actions;
    } catch (error) {
      console.error('Error reading campaign influencer actions:', error);
      return [];
    }
  };

  // Function to check if user has performed action
  const hasPerformedAction = async (
    campaignId: number,
    influencerAddress: `0x${string}`,
    actionType: ActionType
  ) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "hasPerformedAction",
        args: [campaignId, influencerAddress, actionType],
      });
      return data;
    } catch (error) {
      console.error("Error checking if user has performed action:", error);
      return false;
    }
  };

  // Function to check if user has participated
  const hasParticipated = async (
    campaignId: number,
    influencerAddress: `0x${string}`
  ) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "hasParticipated",
        args: [campaignId, influencerAddress],
      });
      return data;
    } catch (error) {
      console.error("Error checking if user has participated:", error);
      return false;
    }
  };

  // Function to check if user has claimed reward
  const hasClaimedReward = async (
    campaignId: number,
    influencerAddress: `0x${string}`
  ) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "hasClaimedReward",
        args: [campaignId, influencerAddress],
      });
      return data;
    } catch (error) {
      console.error("Error checking if user has claimed reward:", error);
      return false;
    }
  };

  // Cache for campaign groups to prevent redundant API calls
  const campaignGroupCache = new Map<number, any>();

  // Function to get campaign group
  const getCampaignGroup = async (groupId: number) => {
    try {
      // Check if we have this group in cache
      if (campaignGroupCache.has(groupId)) {
        return campaignGroupCache.get(groupId);
      }
      
      console.log(`Fetching campaign group ${groupId}`);
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "campaignGroups",
        args: [groupId],
      });
      
      // Only log once during development
      if (process.env.NODE_ENV === 'development') {
        console.log('Raw campaign group data:', data);
      }
      
      let result;
      // The contract returns an array instead of an object with named properties
      // We need to parse it into the expected structure
      if (Array.isArray(data)) {
        // Based on the contract structure, the array should contain:
        // [0]: groupURI (string)
        // [1]: owner (address)
        // [2]: postCampaignIds (array of campaign IDs)
        result = {
          groupURI: data[0],
          owner: data[1],
          postCampaignIds: data[2] || [],
        };
      } else {
        result = data;
      }
      
      // Cache the result
      campaignGroupCache.set(groupId, result);
      
      return result;
    } catch (error) {
      console.error("Error reading campaign group:", error);
      return null;
    }
  };

  // Function to get seller campaign groups Owner
  const getSellerCampaignGroups = async () => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "getSellerGroups",
        args: [profile?.address],
      });
      return data;
    } catch (error) {
      console.error("Error reading seller campaign groups:", error);
      return [];
    }
  };

  // Function to get group posts (campaigns in a group)
  const getGroupPosts = async (groupId: number) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "getGroupPosts",
        args: [groupId],
      });
      return data;
    } catch (error) {
      console.error(`Error reading group posts for group ${groupId}:`, error);
      return [];
    }
  };

  // Function to get detailed campaign information
  const getCampaignInfo = async (campaignId: number) => {
    try {
      console.log(`Fetching detailed info for campaign ${campaignId}`);
      const data = (await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: "getCampaignInfo",
        args: [campaignId],
      })) as any[];
      console.log(`Raw campaign info data for ID ${campaignId}:`, data);
      
      // Based on the contract's getCampaignInfo function, the response has the following structure:
      // [postId, sellerAddress, depositsToPayInfluencers, startTime, endTime, minFollowersRequired, status,
      //  groveContentURI, contentHash, version, availableLikeSlots, availableCommentSlots, availableQuoteSlots,
      //  claimedLikeSlots, claimedCommentSlots, claimedQuoteSlots, likeReward, commentReward, quoteReward,
      //  rewardClaimableTime, rewardTimeEnd]
      
      // Format the returned data into a structured object
      const formattedData = {
        postId: data[0] as string,
        sellerAddress: data[1] as `0x${string}`,
        depositsToPayInfluencers: data[2] as bigint,
        startTime: data[3] as bigint,
        endTime: data[4] as bigint,
        minFollowersRequired: data[5] as bigint,
        status: data[6] as number,
        groveContentURI: data[7] as string,
        contentHash: data[8] as string,
        version: data[9] as bigint,
        availableLikeSlots: data[10] as bigint,
        availableCommentSlots: data[11] as bigint,
        availableQuoteSlots: data[12] as bigint,
        claimedLikeSlots: data[13] as bigint,
        claimedCommentSlots: data[14] as bigint,
        claimedQuoteSlots: data[15] as bigint,
        likeReward: data[16] as bigint,
        commentReward: data[17] as bigint,
        quoteReward: data[18] as bigint,
        // The contract doesn't return campaignId, so we manually add it from the input parameter
        campaignId: BigInt(campaignId),
        rewardClaimableTime: data[19] as bigint, // Adjusted index based on contract return values
        rewardTimeEnd: data[20] as bigint       // Adjusted index based on contract return values
      };

      console.log(
        `Formatted campaign info for ID ${campaignId}:`,
        formattedData
      );
      return formattedData;
    } catch (error) {
      console.error(
        `Error reading detailed campaign info for ID ${campaignId}:`,
        error
      );
      return null;
    }
  };

  // Add Lens Account transaction functionality
  const {
    data: lensTransactionHash,
    isPending: isLensTransactionPending,
    writeContract: writeLensTransaction,
  } = useWriteContract();

  const executeLensTransaction = async ({
    targetFunction,
    args,
    value = 0n,
  }: {
    targetFunction: string;
    args: any[];
    value?: bigint;
  }) => {
    try {
      if (!profile?.address)
        throw new Error("No Lens account address available");

      console.log("Starting Lens transaction...", {
        targetFunction,
        args,
        value,
        lensAccount: profile.address,
        targetContract: CONTRACT_ADDRESS,
      });

      // Encode the function data for the target contract
      let encodedData;
      
      // Special handling for functions that need custom ABIs
      if (targetFunction === 'createAdCampaign') {
        const createAdCampaignABI = [
          {
            inputs: [
              {
                internalType: "uint256",
                name: "_groupId",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "_postId",
                type: "string",
              },
              {
                internalType: "enum ActionType",
                name: "_actionType",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "_availableSlots",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "uint256",
                    name: "startTime",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endTime",
                    type: "uint256",
                  },
                ],
                internalType: "struct AdDisplayTimePeriod",
                name: "_adDisplayPeriod",
                type: "tuple",
              },
              {
                internalType: "string",
                name: "_groveContentURI",
                type: "string",
              },
              {
                internalType: "string",
                name: "_contentHash",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "_rewardClaimableTime",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "_minFollowersCount",
                type: "uint256",
              },
            ],
            name: "createAdCampaign",
            outputs: [],
            stateMutability: "payable",
            type: "function",
          },
        ];

        encodedData = encodeFunctionData({
          abi: createAdCampaignABI,
          functionName: "createAdCampaign",
          args: args,
        });
        console.log('Using custom ABI for createAdCampaign');
      } else if (targetFunction === 'claimReward') {
        // Special handling for claimReward with explicit ABI to ensure correct parameter encoding
        const claimRewardABI = [
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
              },
              {
                "internalType": "uint8",
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
          }
        ];
        
        // Ensure the action type is a number between 0-3
        const safeActionType = typeof args[1] === 'number' ? 
          Math.min(Math.max(Math.floor(args[1]), 0), 3) : 
          3; // Default to QUOTE (3) if invalid
        
        // Create a modified args array with the safe action type
        const safeArgs = [
          args[0], // campaignId
          safeActionType, // actionType (sanitized)
          args[2]  // feed address
        ];
        
        console.log('Original args:', args);
        console.log('Safe args for claimReward:', safeArgs);
        
        encodedData = encodeFunctionData({
          abi: claimRewardABI,
          functionName: 'claimReward',
          args: safeArgs
        });
        console.log('Using custom ABI for claimReward');
      } else {
        // For other functions, use the standard ABI
        encodedData = encodeFunctionData({
          abi: LENS_AD_CAMPAIGN_ABI,
          functionName: targetFunction,
          args: args,
        });
      }

      console.log("Encoded function data:", encodedData);

      // Use writeLensTransaction to execute the transaction through the Lens smart wallet
      // This matches the approach used in createCampaignGroup
    
      // Set different gas parameters based on the function being called
      let gasLimit = 500000n; // Default gas limit
      let gasPrice = 5000000000n; // Default gas price (5 gwei)
      
      // Adjust gas parameters for specific functions
      if (targetFunction === 'claimReward') {
        // Increase gas limit for claimReward which involves ETH transfers
        gasLimit = 1000000n;
        console.log('Using increased gas limit for claimReward');
      }
      
      console.log(`Using gas parameters: limit=${gasLimit}, price=${gasPrice}`);
      
      return writeLensTransaction({
        address: profile.address as `0x${string}`,
        abi: accountABI,
        functionName: 'executeTransaction',
        args: [
          CONTRACT_ADDRESS as `0x${string}`,
          value,
          encodedData
        ],
        gas: gasLimit,
        gasPrice: gasPrice,
      });

      // Return is already handled in the writeLensTransaction call above
    } catch (error: any) {
      console.error("Detailed error executing Lens transaction:", {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorData: error.data,
      });
      throw error;
    }
  };

  // Write functions with transaction receipt tracking
  const { data: createCampaignHash, isPending: isCreateCampaignPending } =
    useWriteContract();
  const { sendTransaction } = useSendTransaction();
  const {
    data: updateStatusHash,
    isPending: isUpdateStatusPending,
    writeContract: writeUpdateStatus,
  } = useWriteContract();
  const {
    data: updateSlotsHash,
    isPending: isUpdateSlotsPending,
    writeContract: writeUpdateSlots,
  } = useWriteContract();
  const {
    data: updatePricesHash,
    isPending: isUpdatePricesPending,
    writeContract: writeUpdatePrices,
  } = useWriteContract();
  const {
    data: extendTimeHash,
    isPending: isExtendTimePending,
    writeContract: writeExtendTime,
  } = useWriteContract();
  const {
    data: updateContentHash,
    isPending: isUpdateContentPending,
    writeContract: writeUpdateContent,
  } = useWriteContract();
  const {
    data: createGroupHash,
    isPending: isCreateGroupPending,
    writeContract: writeCreateGroup,
  } = useWriteContract();
  const {
    data: claimRewardHash,
    isPending: isClaimRewardPending,
    writeContract: writeClaimReward,
  } = useWriteContract();
  const {
    data: refundDepositsHash,
    isPending: isRefundDepositsPending,
    writeContract: writeRefundDeposits,
  } = useWriteContract();
  const {
    data: refundDisplayFeeHash,
    isPending: isRefundDisplayFeePending,
    writeContract: writeRefundDisplayFee,
  } = useWriteContract();
  const {
    data: collectFeesHash,
    isPending: isCollectFeesPending,
    writeContract: writeCollectFees,
  } = useWriteContract();
  const {
    data: updatePlatformFeeHash,
    isPending: isUpdatePlatformFeePending,
    writeContract: writeUpdatePlatformFee,
  } = useWriteContract();
  const {
    data: updateFeeCollectorHash,
    isPending: isUpdateFeeCollectorPending,
    writeContract: writeUpdateFeeCollector,
  } = useWriteContract();

  // Transaction receipts
  const {
    isLoading: isCreateCampaignConfirming,
    isSuccess: isCreateCampaignConfirmed,
  } = useWaitForTransactionReceipt({
    hash: createCampaignHash,
  });

  const {
    isLoading: isUpdateStatusConfirming,
    isSuccess: isUpdateStatusConfirmed,
  } = useWaitForTransactionReceipt({
    hash: updateStatusHash,
  });

  const {
    isLoading: isUpdateSlotsConfirming,
    isSuccess: isUpdateSlotsConfirmed,
  } = useWaitForTransactionReceipt({
    hash: updateSlotsHash,
  });

  const {
    isLoading: isUpdatePricesConfirming,
    isSuccess: isUpdatePricesConfirmed,
  } = useWaitForTransactionReceipt({
    hash: updatePricesHash,
  });

  const {
    isLoading: isExtendTimeConfirming,
    isSuccess: isExtendTimeConfirmed,
  } = useWaitForTransactionReceipt({
    hash: extendTimeHash,
  });

  const {
    isLoading: isUpdateContentConfirming,
    isSuccess: isUpdateContentConfirmed,
  } = useWaitForTransactionReceipt({
    hash: updateContentHash,
  });

  const {
    isLoading: isCreateGroupConfirming,
    isSuccess: isCreateGroupConfirmed,
  } = useWaitForTransactionReceipt({
    hash: createGroupHash,
  });

  const {
    isLoading: isClaimRewardConfirming,
    isSuccess: isClaimRewardConfirmed,
  } = useWaitForTransactionReceipt({
    hash: claimRewardHash,
  });

  const {
    isLoading: isRefundDepositsConfirming,
    isSuccess: isRefundDepositsConfirmed,
  } = useWaitForTransactionReceipt({
    hash: refundDepositsHash,
  });

  const {
    isLoading: isRefundDisplayFeeConfirming,
    isSuccess: isRefundDisplayFeeConfirmed,
  } = useWaitForTransactionReceipt({
    hash: refundDisplayFeeHash,
  });

  const {
    isLoading: isCollectFeesConfirming,
    isSuccess: isCollectFeesConfirmed,
  } = useWaitForTransactionReceipt({
    hash: collectFeesHash,
  });

  const {
    isLoading: isUpdatePlatformFeeConfirming,
    isSuccess: isUpdatePlatformFeeConfirmed,
  } = useWaitForTransactionReceipt({
    hash: updatePlatformFeeHash,
  });

  const {
    isLoading: isUpdateFeeCollectorConfirming,
    isSuccess: isUpdateFeeCollectorConfirmed,
  } = useWaitForTransactionReceipt({
    hash: updateFeeCollectorHash,
  });

  // Create campaign function
  const createCampaign = async (
    postId: string,
    amountPool: bigint,
    rewardAmount: bigint,
    actionType: ActionType,
    minFollowersRequired: number,
    availableSlots: number,
    adDisplayStartTime: number,
    adDisplayEndTime: number,
    rewardClaimableTime: number,
    rewardTimeEnd: number,
    groveContentURI: string,
    contentHash: string,
    useSmartWallet = true,
    groupId: number = 0, // Add groupId parameter with default value of 0
    targetAudience?: {
      minAge: number;
      maxAge: number;
      genders: number[];
      locations: string[];
      interests: string[];
    },
    value?: bigint // Add value parameter for sending ETH with the transaction
  ) => {
    try {
      console.log("CreateCampaign called with:", {
        postId,
        amountPool,
        rewardAmount,
        actionType,
        minFollowersRequired,
        availableSlots,
        adDisplayStartTime,
        adDisplayEndTime,
        rewardClaimableTime,
        rewardTimeEnd,
        groveContentURI,
        contentHash,
        useSmartWallet,
        groupId,
        targetAudience,
        value,
      });

      // Create the transaction parameters - match the actual contract function parameters
      const args = [
        BigInt(groupId), // Use the provided groupId instead of hardcoding to 0
        postId,
        actionType,
        BigInt(availableSlots),
        {
          startTime: BigInt(adDisplayStartTime),
          endTime: BigInt(adDisplayEndTime),
        },
        groveContentURI,
        contentHash,
        BigInt(rewardClaimableTime),
        BigInt(minFollowersRequired),
      ];

      console.log("Executing createAdCampaign with args:", args);
      console.log("Profile address from auth:", profile?.address);

      // ALWAYS use the Lens smart wallet if a profile address is available, regardless of useSmartWallet parameter
      if (profile?.address) {
        console.log("*** ALWAYS USING LENS ACCOUNT FOR createAdCampaign ***");
        console.log("Using Lens Account for createAdCampaign");
        return executeLensTransaction({
          targetFunction: "createAdCampaign",
          args: args,
          value: value,
        });
      }

      console.log("Using direct contract call for createAdCampaign");

      // Use sendTransaction for direct contract call
      return sendTransaction({
        to: lensAdCampaignConfig.address,
        data: encodeFunctionData({
          abi: lensAdCampaignConfig.abi,
          functionName: "createAdCampaign",
          args,
        }),
        value,
        gas: 500000n, // Higher gas limit for complex function
      });
    } catch (error: any) {
      console.error("Detailed createCampaign error:", {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorData: error.data,
      });
      throw error;
    }
  };

  // Update campaign status
  const updateCampaignStatus = async (
    campaignId: number,
    status: CampaignStatus,
    useSmartWallet = false
  ) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for updateCampaignStatus");
        return executeLensTransaction({
          targetFunction: "updateCampaignStatus",
          args: [campaignId, status],
        });
      }

      console.log("Using direct contract call for updateCampaignStatus");
      return writeUpdateStatus({
        ...lensAdCampaignConfig,
        functionName: "updateCampaignStatus",
        args: [campaignId, status],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error updating campaign status:", error);
      throw error;
    }
  };

  // Update campaign slots
  const updateCampaignSlots = async (
    campaignId: number,
    newSlots: number,
    useSmartWallet = false
  ) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for updateCampaignSlots");
        return executeLensTransaction({
          targetFunction: "updateCampaignSlots",
          args: [campaignId, newSlots],
        });
      }

      console.log("Using direct contract call for updateCampaignSlots");
      return writeUpdateSlots({
        ...lensAdCampaignConfig,
        functionName: "updateCampaignSlots",
        args: [campaignId, newSlots],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error updating campaign slots:", error);
      throw error;
    }
  };

  // Update campaign prices
  const updateCampaignPrices = async (
    campaignId: number,
    newRewardAmount: bigint,
    useSmartWallet = false
  ) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for updateCampaignPrices");
        return executeLensTransaction({
          targetFunction: "updateCampaignPrices",
          args: [campaignId, newRewardAmount],
        });
      }

      console.log("Using direct contract call for updateCampaignPrices");
      return writeUpdatePrices({
        ...lensAdCampaignConfig,
        functionName: "updateCampaignPrices",
        args: [campaignId, newRewardAmount],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error updating campaign prices:", error);
      throw error;
    }
  };

  // Extend campaign time
  const extendCampaignTime = async (
    campaignId: number,
    newEndTime: number,
    useSmartWallet = false
  ) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for extendCampaignTime");
        return executeLensTransaction({
          targetFunction: "extendCampaignTime",
          args: [campaignId, newEndTime],
        });
      }

      console.log("Using direct contract call for extendCampaignTime");
      return writeExtendTime({
        ...lensAdCampaignConfig,
        functionName: "extendCampaignTime",
        args: [campaignId, newEndTime],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error extending campaign time:", error);
      throw error;
    }
  };

  // Update campaign content
  const updateCampaignContent = async (
    campaignId: number,
    groveContentURI: string,
    contentHash: string,
    useSmartWallet = false
  ) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for updateCampaignContent");
        return executeLensTransaction({
          targetFunction: "updateCampaignContent",
          args: [campaignId, groveContentURI, contentHash],
        });
      }

      console.log("Using direct contract call for updateCampaignContent");
      return writeUpdateContent({
        ...lensAdCampaignConfig,
        functionName: "updateCampaignContent",
        args: [campaignId, groveContentURI, contentHash],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error updating campaign content:", error);
      throw error;
    }
  };

  // Create campaign group
  const createCampaignGroup = async (
    groupURI: string,
    useSmartWallet = true
  ) => {
    try {
      console.log(
        "Executing createCampaignGroup with URI:",
        groupURI,
        useSmartWallet,
        profile?.address,
        address
      );

      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for createCampaignGroup");
        return executeLensTransaction({
          targetFunction: "createCampaignGroup",
          args: [groupURI],
        });
      }

      console.log("Using direct contract call for createCampaignGroup");
      return writeCreateGroup({
        ...lensAdCampaignConfig,
        functionName: "createCampaignGroup",
        args: [groupURI],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error creating campaign group:", error);
      throw error;
    }
  };

  // Claim reward
  const claimReward = async (campaignId: number, actionType: number, useSmartWallet = true) => {
    try {
      console.log("Attempting to claim reward for campaign ID:", campaignId, "with action type:", actionType);
      
      if (!profile?.address) {
        throw new Error('No wallet address available. Please connect your wallet.');
      }
      
      // Format the address properly
      const formattedAddress = profile.address.startsWith('0x') ? profile.address as `0x${string}` : `0x${profile.address}` as `0x${string}`;
      
      // Check if the user has participated in the campaign
      const participated = await hasParticipated(campaignId, formattedAddress);
      if (!participated) {
        throw new Error(`You have not participated in campaign ${campaignId}. You must interact with the campaign post before claiming a reward.`);
      }
      
      // Check if the user has already claimed the reward
      const claimed = await hasClaimedReward(campaignId, formattedAddress);
      if (claimed) {
        throw new Error(`You have already claimed the reward for campaign ${campaignId}.`);
      }
      
      // Get the campaign info to determine the action type
      const campaignInfo = await getCampaignInfo(campaignId);
      if (!campaignInfo) {
        throw new Error(`Campaign info not found for ID: ${campaignId}`);
      }
      
      // Ensure action type is within valid range (0-3)
      if (actionType < 0 || actionType > 3) {
        console.warn(`Invalid action type ${actionType}, defaulting to QUOTE (3)`);
        actionType = 3; // Default to QUOTE if invalid
      }
      
      // Get the Lens Feed contract address
      // This is needed as the third parameter for the claimReward function
      const feedContractAddress = feedAddress; // Lens Feed contract address on Sepolia
      console.log('Claiming reward with params:', {
        campaignId,
        actionType,
        feedContractAddress,
        userAddress: formattedAddress,
        hasParticipated: participated,
        hasAlreadyClaimed: claimed
      });
      
      // For debugging, log the campaign info
      console.log('Full campaign info for debugging:', campaignInfo);
      
      // Ensure we're using the correct action type format for the contract
      // The contract expects an enum value (0-3) but we need to make sure it's properly encoded
      let campaignActionType = actionType;
      
      // Log detailed information about the action type for debugging
      console.log('Action type details:', {
        providedActionType: actionType,
        actionTypeToUse: campaignActionType,
        actionTypeEnum: ActionType[campaignActionType] || 'Unknown'
      });
      
      if (useSmartWallet && profile?.address) {
        console.log('Using Lens smart wallet for claimReward');
        try {
          // Use the Lens smart wallet with proper encoding and gas parameters
          return executeLensTransaction({
            targetFunction: 'claimReward',
            args: [BigInt(campaignId), Number(campaignActionType), feedContractAddress]
            // Gas parameters are set inside executeLensTransaction
          });
        } catch (error) {
          console.error('Smart wallet transaction failed, trying with direct call:', error);
          // If smart wallet fails, try direct call as fallback
          return writeClaimReward({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: LENS_AD_CAMPAIGN_ABI,
            functionName: 'claimReward',
            args: [BigInt(campaignId), Number(campaignActionType), feedContractAddress],
            gas: 500000n, // Increase gas limit
            gasPrice: 5000000000n // 5 gwei
          });
        }
      }

      console.log('Using direct contract call for claimReward with CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
      return writeClaimReward({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: LENS_AD_CAMPAIGN_ABI,
        functionName: 'claimReward',
        args: [BigInt(campaignId), Number(campaignActionType), feedContractAddress],
        gas: 500000n, // Increase gas limit to handle complex operations
        gasPrice: 5000000000n, // 5 gwei
      });
    } catch (error: any) {
      console.error("Error claiming reward:", error);
      throw error;
    }
  };

  // Refund deposits
  const refundDeposits = async (campaignId: number, useSmartWallet = false) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for refundDeposits");
        return executeLensTransaction({
          targetFunction: "refundDeposits",
          args: [campaignId],
        });
      }

      console.log("Using direct contract call for refundDeposits");
      return writeRefundDeposits({
        ...lensAdCampaignConfig,
        functionName: "refundDeposits",
        args: [campaignId],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error refunding deposits:", error);
      throw error;
    }
  };

  // Refund display fee
  const refundDisplayFee = async (
    campaignId: number,
    useSmartWallet = false
  ) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for refundDisplayFee");
        return executeLensTransaction({
          targetFunction: "refundDisplayFee",
          args: [campaignId],
        });
      }

      console.log("Using direct contract call for refundDisplayFee");
      return writeRefundDisplayFee({
        ...lensAdCampaignConfig,
        functionName: "refundDisplayFee",
        args: [campaignId],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error refunding display fee:", error);
      throw error;
    }
  };

  // Collect fees
  const collectFees = async (useSmartWallet = false) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for collectFees");
        return executeLensTransaction({
          targetFunction: "collectFees",
          args: [],
        });
      }

      console.log("Using direct contract call for collectFees");
      return writeCollectFees({
        ...lensAdCampaignConfig,
        functionName: "collectFees",
        args: [],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error collecting fees:", error);
      throw error;
    }
  };

  // Update platform fee
  const updatePlatformFee = async (
    newFeePercentage: number,
    useSmartWallet = false
  ) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for updatePlatformFee");
        return executeLensTransaction({
          targetFunction: "updatePlatformFee",
          args: [newFeePercentage],
        });
      }

      console.log("Using direct contract call for updatePlatformFee");
      return writeUpdatePlatformFee({
        ...lensAdCampaignConfig,
        functionName: "updatePlatformFee",
        args: [newFeePercentage],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error updating platform fee:", error);
      throw error;
    }
  };

  // Update fee collector
  const updateFeeCollector = async (
    newFeeCollector: `0x${string}`,
    useSmartWallet = false
  ) => {
    try {
      if (useSmartWallet && profile?.address) {
        console.log("Using Lens Account for updateFeeCollector");
        return executeLensTransaction({
          targetFunction: "updateFeeCollector",
          args: [newFeeCollector],
        });
      }

      console.log("Using direct contract call for updateFeeCollector");
      return writeUpdateFeeCollector({
        ...lensAdCampaignConfig,
        functionName: "updateFeeCollector",
        args: [newFeeCollector],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error("Error updating fee collector:", error);
      throw error;
    }
  };

  // Add new function for claiming balance through Lens
  const claimBalanceLens = async () => {
    if (!profile?.address) throw new Error("No Lens address");
    if (!address) throw new Error("No wallet address");

    return writeLensTransaction({
      address: profile.address as `0x${string}`,
      abi: accountABI,
      functionName: "executeTransaction",
      args: [address as `0x${string}`, balance?.value as bigint, "0x"],
      gas: 300000n,
    });
  };

  // Helper to check if a transaction is in progress
  const isLoading =
    isCreateCampaignPending ||
    isCreateCampaignConfirming ||
    isUpdateStatusPending ||
    isUpdateStatusConfirming ||
    isUpdateSlotsPending ||
    isUpdateSlotsConfirming ||
    isUpdatePricesPending ||
    isUpdatePricesConfirming ||
    isExtendTimePending ||
    isExtendTimeConfirming ||
    isUpdateContentPending ||
    isUpdateContentConfirming ||
    isCreateGroupPending ||
    isCreateGroupConfirming ||
    isClaimRewardPending ||
    isClaimRewardConfirming ||
    isRefundDepositsPending ||
    isRefundDepositsConfirming ||
    isRefundDisplayFeePending ||
    isRefundDisplayFeeConfirming ||
    isCollectFeesPending ||
    isCollectFeesConfirming ||
    isUpdatePlatformFeePending ||
    isUpdatePlatformFeeConfirming ||
    isUpdateFeeCollectorPending ||
    isUpdateFeeCollectorConfirming ||
    isLensTransactionPending;

  // Constants for Lens Protocol action parameters - MUST match the contract exactly
  // These are used directly in the code via keccak256 computation instead

  /**
   * Records an influencer action on the smart contract using the direct action function
   * @param actionType - The type of action (1=MIRROR, 2=COMMENT, 3=QUOTE)
   * @param postId - The ID of the post being interacted with
   * @param campaignId - The ID of the campaign
   * @param contentHash - The content hash (required for QUOTE and COMMENT actions)
   * @returns Transaction result
   */
  // Track if a direct action transaction is in progress to prevent duplicates
  const [isDirectActionInProgress, setIsDirectActionInProgress] = useState(false);

  /**
   * Records an influencer action on the smart contract using the direct action function
   * @param actionType - The type of action (1=MIRROR, 2=COMMENT, 3=QUOTE)
   * @param postId - The ID of the post being interacted with
   * @param campaignId - The ID of the campaign
   * @param contentHash - The content hash (required for QUOTE and COMMENT actions)
   * @param useSmartWallet - Whether to use the Lens smart wallet (default: true to use Lens relayer/AA system)
   * @returns Transaction result
   */
  const recordInfluencerAction = async ({
    actionType,
    postId,
    campaignId,
    useSmartWallet = true, // Default to smart wallet to use Lens relayer/AA system
    contentHash
  }: {
    actionType: number;
    postId: string;
    campaignId: number;
    useSmartWallet?: boolean;
    contentHash?: string;
  }) => {
    // Prevent duplicate transactions
    if (isDirectActionInProgress) {
      console.log("Transaction already in progress, ignoring duplicate call");
      return;
    }
    
    setIsDirectActionInProgress(true);
    
    try {
      console.log("Using executeDirectAction for contract interaction");
      console.log("Smart wallet address:", profile?.address);
      console.log("Campaign ID:", campaignId);
      console.log("Post ID:", postId);
      
      if (!profile?.address) {
        throw new Error('Lens profile address not available. Please make sure you are logged in to Lens Protocol.');
      }
      
      // Ensure we have a content hash (required for QUOTE actions)
      const safeContentHash = contentHash || "";
      
      // Fetch the post ID as uint from the Lens API
      console.log('Fetching post ID as uint for post string:', postId);
      const postIdAsUint = await fetchPostIdAsUint(postId);
      
      if (!postIdAsUint) {
        throw new Error('Failed to fetch post ID from Lens API. Please check the post string and try again.');
      }
      
      console.log('Calling executeDirectAction with parameters:');
      console.log('- Feed address:', feedAddress);
      console.log('- Action type:', actionType);
      console.log('- Content hash:', safeContentHash);
      console.log('- Campaign ID:', campaignId);
      console.log('- Post string:', postId);
      console.log('- Post ID as uint:', postIdAsUint.toString());
      
      let result;
      // Use the Lens Protocol executeLensTransaction function to call the executeDirectAction function
      if (useSmartWallet && profile?.address) {
        result = await executeLensTransaction({
          targetFunction: 'executeDirectAction',
          args: [
            feedAddress,                  // feed address
            actionType,                   // action type (as enum: 1=MIRROR, 2=COMMENT, 3=QUOTE)
            safeContentHash,              // content hash
            BigInt(campaignId),           // campaign ID
            postId,                       // post string
            postIdAsUint                  // post ID as uint
          ]
        });
      }
      else {
        console.log("Using direct contract call for executeDirectAction")
        return sendTransaction({
          to: lensAdCampaignConfig.address,
          data: encodeFunctionData({
            abi: LENS_AD_CAMPAIGN_ABI,
            functionName: 'executeDirectAction',
            args: [
              feedAddress,
              actionType,
              safeContentHash,
              BigInt(campaignId),
              postId,
              postIdAsUint
            ]
          }),
          gas: 500000n
        })
      }
      
      console.log('executeDirectAction transaction result:', result);
      return result;
    } catch (error) {
      console.error('Error calling executeDirectAction:', error);
      // Log more detailed error information if available
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error message:', (error as any).message);
      }
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error code:', (error as any).code);
        
        // Check for specific error codes that might indicate a temporary issue
        const errorCode = (error as any).code?.toString() || '';
        if (errorCode.includes('4001')) {
          console.log('User rejected transaction, not retrying');
        } else if (errorCode.includes('REPLACEMENT_UNDERPRICED')) {
          console.log('Transaction already pending, not retrying');
        }
      }
      throw error;
    } finally {
      // Always reset the transaction lock, even if there was an error
      setIsDirectActionInProgress(false);
    }
  };

  // Restore the original isSuccess definition
  const isSuccess = (
    isCreateCampaignConfirmed ||
    isUpdateStatusConfirmed ||
    isUpdateSlotsConfirmed ||
    isUpdatePricesConfirmed ||
    isExtendTimeConfirmed ||
    isUpdateContentConfirmed ||
    isCreateGroupConfirmed ||
    isClaimRewardConfirmed ||
    isRefundDepositsConfirmed ||
    isRefundDisplayFeeConfirmed ||
    isCollectFeesConfirmed ||
    isUpdatePlatformFeeConfirmed ||
    isUpdateFeeCollectorConfirmed
  );

  return {
    // Contract info
    CONTRACT_ADDRESS,
    lensAdCampaignConfig,
      
      // Read functions
      getCampaign,
      getCampaignInfo,
      getSellerCampaigns,
      getCampaignInfluencerActions,
      getCampaignParticipants,
      getCampaignParticipantAddresses,
      getCampaignParticipantCount,
      hasPerformedAction,
      hasParticipated,
      hasClaimedReward,
      getCampaignGroup,
      getSellerCampaignGroups,
      getGroupPosts,
      getCampaignAdCount,
      getCampaignGroupCount,
      platformFeePercentage,
      totalFeesCollected,
      campaignCounter,
      groupCounter,
      
      // Write functions
      createCampaign,
      updateCampaignStatus,
      updateCampaignSlots,
      updateCampaignPrices,
      extendCampaignTime,
      updateCampaignContent,
      createCampaignGroup,
      claimReward,
      refundDeposits,
      refundDisplayFee,
      collectFees,
      updatePlatformFee,
      updateFeeCollector,
      claimBalanceLens,
      
      // Lens Account functionality
      executeLensTransaction,
      isLensTransactionPending,
      lensTransactionHash,
      useLensAccount,
      activeLensAddress,
      
      // Influencer actions
      recordInfluencerAction,
      
      // Loading and success states
      isLoading,
      isSuccess,
      
      // Pending states
      isCreateCampaignPending,
      isUpdateStatusPending,
      isUpdateSlotsPending,
      isUpdatePricesPending,
      isExtendTimePending,
      isUpdateContentPending,
      isCreateGroupPending,
      isClaimRewardPending,
      isRefundDepositsPending,
      isRefundDisplayFeePending,
      isCollectFeesPending,
      isUpdatePlatformFeePending,
      isUpdateFeeCollectorPending,
      
      // Confirming states
      isCreateCampaignConfirming,
      isUpdateStatusConfirming,
      isUpdateSlotsConfirming,
      isUpdatePricesConfirming,
      isExtendTimeConfirming,
      isUpdateContentConfirming,
      isCreateGroupConfirming,
      isClaimRewardConfirming,
      isRefundDepositsConfirming,
      isRefundDisplayFeeConfirming,
      isCollectFeesConfirming,
      isUpdatePlatformFeeConfirming,
      isUpdateFeeCollectorConfirming,
      
      // Success states
      isCreateCampaignConfirmed,
      isUpdateStatusConfirmed,
      isUpdateSlotsConfirmed,
      isUpdatePricesConfirmed,
      isExtendTimeConfirmed,
      isUpdateContentConfirmed,
      isCreateGroupConfirmed,
      isClaimRewardConfirmed,
      isRefundDepositsConfirmed,
      isRefundDisplayFeeConfirmed,
      isCollectFeesConfirmed,
      isUpdatePlatformFeeConfirmed,
      isUpdateFeeCollectorConfirmed,
      
      // Transaction hashes
      createCampaignHash,
      updateStatusHash,
      updateSlotsHash,
      updatePricesHash,
      extendTimeHash,
      updateContentHash,
      createGroupHash,
      claimRewardHash,
      refundDepositsHash,
      refundDisplayFeeHash,
      collectFeesHash,
      updatePlatformFeeHash,
      updateFeeCollectorHash
    };
  }
