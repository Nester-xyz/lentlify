import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient, useBalance, useSendTransaction } from 'wagmi';
import { useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import { contractAddress, paymentTokenAddress } from '../constants/addresses';
import { abi } from '../constants/abi';
import { useSessionClient } from '../context/session/sessionContext';
import type { Address } from 'viem';

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
  const publicClient = usePublicClient();
  const { address: accountAddress } = useAccount();
  
  const approveTokenSpending = async (amount: bigint) => {
    try {
      // Only approve the exact amount needed, not unlimited
      console.log(`Approving exact amount: ${amount} tokens for contract: ${CONTRACT_ADDRESS}`);
      console.log(`Using token at address: ${paymentTokenAddress}`);
      
      if (!accountAddress) {
        console.error('Account address not available');
        throw new Error('Wallet not connected properly');
      }
      
      // Skip allowance check since this token might not support standard ERC20 allowance function
      
      // Use a direct ERC20 approve call with higher gas limit
      const result = await writeApprove({
        address: paymentTokenAddress as `0x${string}`,
        abi: [
          {
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" }
            ],
            name: "approve",
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
            type: "function"
          }
        ],
        functionName: 'approve',
        args: [
          CONTRACT_ADDRESS as `0x${string}`,
          amount
        ],
        // Use higher gas limit for Lens token
        gas: 300000n,
      });
      
      console.log('Approval transaction result:', result);
      return result;
    } catch (error: any) {
      console.error('Error approving token spending:', error);
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
  const { data: balance } = useBalance({
    address: activeLensAddress as Address,
  });
  
  // Check if we should use Lens account
  const useLensAccount = !!activeLensAddress;
  
  // Log the addresses being used
  useEffect(() => {
    if (useLensAccount) {
      console.log('Using Lens smart wallet address:', activeLensAddress);
      console.log('Connected wallet address:', address);
    }
  }, [useLensAccount, activeLensAddress, address]);

  // Read functions
  const { data: platformFeePercentage } = useReadContract({
    ...lensAdCampaignConfig,
    functionName: 'platformFeePercentage',
  });

  const { data: totalFeesCollected } = useReadContract({
    ...lensAdCampaignConfig,
    functionName: 'totalFeesCollected',
  });

  const { data: campaignCounter } = useReadContract({
    ...lensAdCampaignConfig,
    functionName: 'campaignCounter',
  });

  const { data: groupCounter } = useReadContract({
    ...lensAdCampaignConfig,
    functionName: 'groupCounter',
  });

  // Function to get campaign details
  const getCampaign = async (campaignId: number) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'campaigns',
        args: [campaignId],
      });
      return data;
    } catch (error) {
      console.error('Error reading campaign details:', error);
      return null;
    }
  };

  // Function to get seller campaigns
  const getSellerCampaigns = async (sellerAddress: `0x${string}`) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'sellerCampaigns',
        args: [sellerAddress],
      });
      return data;
    } catch (error) {
      console.error('Error reading seller campaigns:', error);
      return null;
    }
  };

  // Function to get campaign influencer actions
  const getCampaignInfluencerActions = async (campaignId: number, influencerAddress: `0x${string}`) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'campaignInfluencerActions',
        args: [campaignId, influencerAddress],
      });
      return data;
    } catch (error) {
      console.error('Error reading campaign influencer actions:', error);
      return null;
    }
  };

  // Function to check if user has performed action
  const hasPerformedAction = async (campaignId: number, influencerAddress: `0x${string}`, actionType: ActionType) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'hasPerformedAction',
        args: [campaignId, influencerAddress, actionType],
      });
      return data;
    } catch (error) {
      console.error('Error checking if user has performed action:', error);
      return false;
    }
  };

  // Function to check if user has participated
  const hasParticipated = async (campaignId: number, influencerAddress: `0x${string}`) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'hasParticipated',
        args: [campaignId, influencerAddress],
      });
      return data;
    } catch (error) {
      console.error('Error checking if user has participated:', error);
      return false;
    }
  };

  // Function to check if user has claimed reward
  const hasClaimedReward = async (campaignId: number, influencerAddress: `0x${string}`) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'hasClaimedReward',
        args: [campaignId, influencerAddress],
      });
      return data;
    } catch (error) {
      console.error('Error checking if user has claimed reward:', error);
      return false;
    }
  };

  // Function to get campaign group
  const getCampaignGroup = async (groupId: number) => {
    try {
      console.log(`Fetching campaign group ${groupId}`);
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'campaignGroups',
        args: [groupId],
      });
      
      console.log('Raw campaign group data:', data);
      
      // The contract returns an array instead of an object with named properties
      // We need to parse it into the expected structure
      if (Array.isArray(data)) {
        // Based on the contract structure, the array should contain:
        // [0]: groupURI (string)
        // [1]: owner (address)
        // [2]: postCampaignIds (array of campaign IDs)
        return {
          groupURI: data[0],
          owner: data[1],
          postCampaignIds: data[2] || []
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error reading campaign group:', error);
      return null;
    }
  };

  // Function to get seller campaign groups
  const getSellerCampaignGroups = async (sellerAddress: `0x${string}`) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'getSellerGroups',
        args: [sellerAddress],
      });
      return data;
    } catch (error) {
      console.error('Error reading seller campaign groups:', error);
      return [];
    }
  };

  // Function to get group posts (campaigns in a group)
  const getGroupPosts = async (groupId: number) => {
    try {
      const data = await publicClient!.readContract({
        ...lensAdCampaignConfig,
        functionName: 'getGroupPosts',
        args: [groupId],
      });
      return data;
    } catch (error) {
      console.error(`Error reading group posts for group ${groupId}:`, error);
      return [];
    }
  };

  // Add Lens Account transaction functionality
  const { data: lensTransactionHash, isPending: isLensTransactionPending, writeContract: writeLensTransaction } = useWriteContract();

  const executeLensTransaction = async ({
    targetFunction,
    args,
    value = 0n
  }: {
    targetFunction: string;
    args: any[];
    value?: bigint;
  }) => {
    try {
      if (!activeLensAddress) throw new Error('No Lens account address available');
      
      console.log('Starting Lens transaction...', {
        targetFunction,
        args,
        value,
        lensAccount: activeLensAddress,
        targetContract: CONTRACT_ADDRESS
      });

      const encodedData = encodeFunctionData({
        abi: LENS_AD_CAMPAIGN_ABI,
        functionName: targetFunction,
        args: args
      });

      console.log('Encoded function data:', encodedData);

      const txResponse = writeLensTransaction({
        address: activeLensAddress,
        abi: accountABI,
        functionName: 'executeTransaction',
        args: [
          CONTRACT_ADDRESS as `0x${string}`,
          value,
          encodedData
        ],
        gas: 300000n,
      });

      console.log('Transaction response:', txResponse);
      return txResponse;
    } catch (error: any) {
      console.error('Detailed error executing Lens transaction:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorData: error.data
      });
      throw error;
    }
  };

  // Write functions with transaction receipt tracking
  const { data: createCampaignHash, isPending: isCreateCampaignPending } = useWriteContract();
  const { sendTransaction } = useSendTransaction();
  const { data: updateStatusHash, isPending: isUpdateStatusPending, writeContract: writeUpdateStatus } = useWriteContract();
  const { data: updateSlotsHash, isPending: isUpdateSlotsPending, writeContract: writeUpdateSlots } = useWriteContract();
  const { data: updatePricesHash, isPending: isUpdatePricesPending, writeContract: writeUpdatePrices } = useWriteContract();
  const { data: extendTimeHash, isPending: isExtendTimePending, writeContract: writeExtendTime } = useWriteContract();
  const { data: updateContentHash, isPending: isUpdateContentPending, writeContract: writeUpdateContent } = useWriteContract();
  const { data: createGroupHash, isPending: isCreateGroupPending, writeContract: writeCreateGroup } = useWriteContract();
  const { data: claimRewardHash, isPending: isClaimRewardPending, writeContract: writeClaimReward } = useWriteContract();
  const { data: refundDepositsHash, isPending: isRefundDepositsPending, writeContract: writeRefundDeposits } = useWriteContract();
  const { data: refundDisplayFeeHash, isPending: isRefundDisplayFeePending, writeContract: writeRefundDisplayFee } = useWriteContract();
  const { data: collectFeesHash, isPending: isCollectFeesPending, writeContract: writeCollectFees } = useWriteContract();
  const { data: updatePlatformFeeHash, isPending: isUpdatePlatformFeePending, writeContract: writeUpdatePlatformFee } = useWriteContract();
  const { data: updateFeeCollectorHash, isPending: isUpdateFeeCollectorPending, writeContract: writeUpdateFeeCollector } = useWriteContract();

  // Transaction receipts
  const { isLoading: isCreateCampaignConfirming, isSuccess: isCreateCampaignConfirmed } = useWaitForTransactionReceipt({
    hash: createCampaignHash,
  });

  const { isLoading: isUpdateStatusConfirming, isSuccess: isUpdateStatusConfirmed } = useWaitForTransactionReceipt({
    hash: updateStatusHash,
  });

  const { isLoading: isUpdateSlotsConfirming, isSuccess: isUpdateSlotsConfirmed } = useWaitForTransactionReceipt({
    hash: updateSlotsHash,
  });

  const { isLoading: isUpdatePricesConfirming, isSuccess: isUpdatePricesConfirmed } = useWaitForTransactionReceipt({
    hash: updatePricesHash,
  });

  const { isLoading: isExtendTimeConfirming, isSuccess: isExtendTimeConfirmed } = useWaitForTransactionReceipt({
    hash: extendTimeHash,
  });

  const { isLoading: isUpdateContentConfirming, isSuccess: isUpdateContentConfirmed } = useWaitForTransactionReceipt({
    hash: updateContentHash,
  });

  const { isLoading: isCreateGroupConfirming, isSuccess: isCreateGroupConfirmed } = useWaitForTransactionReceipt({
    hash: createGroupHash,
  });

  const { isLoading: isClaimRewardConfirming, isSuccess: isClaimRewardConfirmed } = useWaitForTransactionReceipt({
    hash: claimRewardHash,
  });

  const { isLoading: isRefundDepositsConfirming, isSuccess: isRefundDepositsConfirmed } = useWaitForTransactionReceipt({
    hash: refundDepositsHash,
  });

  const { isLoading: isRefundDisplayFeeConfirming, isSuccess: isRefundDisplayFeeConfirmed } = useWaitForTransactionReceipt({
    hash: refundDisplayFeeHash,
  });

  const { isLoading: isCollectFeesConfirming, isSuccess: isCollectFeesConfirmed } = useWaitForTransactionReceipt({
    hash: collectFeesHash,
  });

  const { isLoading: isUpdatePlatformFeeConfirming, isSuccess: isUpdatePlatformFeeConfirmed } = useWaitForTransactionReceipt({
    hash: updatePlatformFeeHash,
  });

  const { isLoading: isUpdateFeeCollectorConfirming, isSuccess: isUpdateFeeCollectorConfirmed } = useWaitForTransactionReceipt({
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
    useSmartWallet = false,
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
      console.log('CreateCampaign called with:', { 
        postId, amountPool, rewardAmount, actionType, 
        minFollowersRequired, availableSlots, 
        adDisplayStartTime, adDisplayEndTime, 
        rewardClaimableTime, rewardTimeEnd, 
        groveContentURI, contentHash, 
        useSmartWallet, groupId, targetAudience,
        value
      });
      
      // Create the transaction parameters - match the actual contract function parameters
      const args = [
        BigInt(groupId), // Use the provided groupId instead of hardcoding to 0
        postId,
        actionType,
        BigInt(availableSlots),
        {
          startTime: BigInt(adDisplayStartTime),
          endTime: BigInt(adDisplayEndTime)
        },
        groveContentURI,
        contentHash,
        BigInt(rewardClaimableTime),
        BigInt(minFollowersRequired)
      ];
      
      // Log args safely by converting BigInts to strings
      console.log('Complete args array:', args.map(arg => {
        if (typeof arg === 'bigint') {
          return arg.toString();
        } else if (typeof arg === 'object' && arg !== null) {
          // Handle objects that might contain BigInts
          const safeObj: Record<string, any> = {};
          Object.entries(arg).forEach(([key, val]) => {
            safeObj[key] = typeof val === 'bigint' ? val.toString() : val;
          });
          return safeObj;
        } else {
          return arg;
        }
      }));
      
      console.log('Using direct contract call for createAdCampaign');
      console.log('Value being sent with transaction:', value?.toString());
      
      // Create a custom ABI for the createAdCampaign function that matches the actual contract implementation
      const createAdCampaignABI = [
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
        }
      ];
      
      // Use encodeFunctionData to prepare the transaction data with the correct ABI
      const data = encodeFunctionData({
        abi: createAdCampaignABI,
        functionName: 'createAdCampaign',
        args,
      });
      
      console.log('Transaction data prepared, sending to wallet...');
      
      // Use sendTransaction which more reliably triggers the MetaMask popup
      return sendTransaction({
        to: lensAdCampaignConfig.address,
        data,
        value,
        gas: 500000n, // Higher gas limit for complex function
      });
    } catch (error: any) {
      console.error('Detailed createCampaign error:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorData: error.data
      });
      throw error;
    }
  };

  // Update campaign status
  const updateCampaignStatus = async (campaignId: number, status: CampaignStatus, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for updateCampaignStatus');
        return executeLensTransaction({
          targetFunction: 'updateCampaignStatus',
          args: [campaignId, status],
        });
      }

      console.log('Using direct contract call for updateCampaignStatus');
      return writeUpdateStatus({
        ...lensAdCampaignConfig,
        functionName: 'updateCampaignStatus',
        args: [campaignId, status],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      throw error;
    }
  };

  // Update campaign slots
  const updateCampaignSlots = async (campaignId: number, newSlots: number, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for updateCampaignSlots');
        return executeLensTransaction({
          targetFunction: 'updateCampaignSlots',
          args: [campaignId, newSlots],
        });
      }

      console.log('Using direct contract call for updateCampaignSlots');
      return writeUpdateSlots({
        ...lensAdCampaignConfig,
        functionName: 'updateCampaignSlots',
        args: [campaignId, newSlots],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error updating campaign slots:', error);
      throw error;
    }
  };

  // Update campaign prices
  const updateCampaignPrices = async (campaignId: number, newRewardAmount: bigint, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for updateCampaignPrices');
        return executeLensTransaction({
          targetFunction: 'updateCampaignPrices',
          args: [campaignId, newRewardAmount],
        });
      }

      console.log('Using direct contract call for updateCampaignPrices');
      return writeUpdatePrices({
        ...lensAdCampaignConfig,
        functionName: 'updateCampaignPrices',
        args: [campaignId, newRewardAmount],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error updating campaign prices:', error);
      throw error;
    }
  };

  // Extend campaign time
  const extendCampaignTime = async (campaignId: number, newEndTime: number, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for extendCampaignTime');
        return executeLensTransaction({
          targetFunction: 'extendCampaignTime',
          args: [campaignId, newEndTime],
        });
      }

      console.log('Using direct contract call for extendCampaignTime');
      return writeExtendTime({
        ...lensAdCampaignConfig,
        functionName: 'extendCampaignTime',
        args: [campaignId, newEndTime],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error extending campaign time:', error);
      throw error;
    }
  };

  // Update campaign content
  const updateCampaignContent = async (campaignId: number, groveContentURI: string, contentHash: string, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for updateCampaignContent');
        return executeLensTransaction({
          targetFunction: 'updateCampaignContent',
          args: [campaignId, groveContentURI, contentHash],
        });
      }

      console.log('Using direct contract call for updateCampaignContent');
      return writeUpdateContent({
        ...lensAdCampaignConfig,
        functionName: 'updateCampaignContent',
        args: [campaignId, groveContentURI, contentHash],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error updating campaign content:', error);
      throw error;
    }
  };

  // Create campaign group
  const createCampaignGroup = async (groupURI: string, useSmartWallet = false) => {
    try {
      console.log('Executing createCampaignGroup with URI:', groupURI);
      
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for createCampaignGroup');
        return executeLensTransaction({
          targetFunction: 'createCampaignGroup',
          args: [groupURI],
        });
      }

      console.log('Using direct contract call for createCampaignGroup');
      return writeCreateGroup({
        ...lensAdCampaignConfig,
        functionName: 'createCampaignGroup',
        args: [groupURI],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error creating campaign group:', error);
      throw error;
    }
  };

  // Claim reward
  const claimReward = async (campaignId: number, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for claimReward');
        return executeLensTransaction({
          targetFunction: 'claimReward',
          args: [campaignId],
        });
      }

      console.log('Using direct contract call for claimReward');
      return writeClaimReward({
        ...lensAdCampaignConfig,
        functionName: 'claimReward',
        args: [campaignId],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  };

  // Refund deposits
  const refundDeposits = async (campaignId: number, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for refundDeposits');
        return executeLensTransaction({
          targetFunction: 'refundDeposits',
          args: [campaignId],
        });
      }

      console.log('Using direct contract call for refundDeposits');
      return writeRefundDeposits({
        ...lensAdCampaignConfig,
        functionName: 'refundDeposits',
        args: [campaignId],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error refunding deposits:', error);
      throw error;
    }
  };

  // Refund display fee
  const refundDisplayFee = async (campaignId: number, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for refundDisplayFee');
        return executeLensTransaction({
          targetFunction: 'refundDisplayFee',
          args: [campaignId],
        });
      }

      console.log('Using direct contract call for refundDisplayFee');
      return writeRefundDisplayFee({
        ...lensAdCampaignConfig,
        functionName: 'refundDisplayFee',
        args: [campaignId],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error refunding display fee:', error);
      throw error;
    }
  };

  // Collect fees
  const collectFees = async (useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for collectFees');
        return executeLensTransaction({
          targetFunction: 'collectFees',
          args: [],
        });
      }

      console.log('Using direct contract call for collectFees');
      return writeCollectFees({
        ...lensAdCampaignConfig,
        functionName: 'collectFees',
        args: [],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error collecting fees:', error);
      throw error;
    }
  };

  // Update platform fee
  const updatePlatformFee = async (newFeePercentage: number, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for updatePlatformFee');
        return executeLensTransaction({
          targetFunction: 'updatePlatformFee',
          args: [newFeePercentage],
        });
      }

      console.log('Using direct contract call for updatePlatformFee');
      return writeUpdatePlatformFee({
        ...lensAdCampaignConfig,
        functionName: 'updatePlatformFee',
        args: [newFeePercentage],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error updating platform fee:', error);
      throw error;
    }
  };

  // Update fee collector
  const updateFeeCollector = async (newFeeCollector: `0x${string}`, useSmartWallet = false) => {
    try {
      if (useSmartWallet && activeLensAddress) {
        console.log('Using Lens Account for updateFeeCollector');
        return executeLensTransaction({
          targetFunction: 'updateFeeCollector',
          args: [newFeeCollector],
        });
      }

      console.log('Using direct contract call for updateFeeCollector');
      return writeUpdateFeeCollector({
        ...lensAdCampaignConfig,
        functionName: 'updateFeeCollector',
        args: [newFeeCollector],
        gas: 300000n,
      });
    } catch (error: any) {
      console.error('Error updating fee collector:', error);
      throw error;
    }
  };

  // Add new function for claiming balance through Lens
  const claimBalanceLens = async () => {
    if (!activeLensAddress) throw new Error('No Lens address');
    if (!address) throw new Error('No wallet address');
    
    return writeLensTransaction({
      address: activeLensAddress,
      abi: accountABI,
      functionName: 'executeTransaction',
      args: [
        address as `0x${string}`,
        balance?.value as bigint,
        '0x'
      ],
      gas: 300000n,
    });
  };

  // Helper to check if a transaction is in progress
  const isLoading = 
    isCreateCampaignPending || isCreateCampaignConfirming ||
    isUpdateStatusPending || isUpdateStatusConfirming ||
    isUpdateSlotsPending || isUpdateSlotsConfirming ||
    isUpdatePricesPending || isUpdatePricesConfirming ||
    isExtendTimePending || isExtendTimeConfirming ||
    isUpdateContentPending || isUpdateContentConfirming ||
    isCreateGroupPending || isCreateGroupConfirming ||
    isClaimRewardPending || isClaimRewardConfirming ||
    isRefundDepositsPending || isRefundDepositsConfirming ||
    isRefundDisplayFeePending || isRefundDisplayFeeConfirming ||
    isCollectFeesPending || isCollectFeesConfirming ||
    isUpdatePlatformFeePending || isUpdatePlatformFeeConfirming ||
    isUpdateFeeCollectorPending || isUpdateFeeCollectorConfirming ||
    isLensTransactionPending;

  const isSuccess = 
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
    isUpdateFeeCollectorConfirmed;

  return {
    // Contract info
    CONTRACT_ADDRESS,
    lensAdCampaignConfig,
    
    // Read functions
    getCampaign,
    getSellerCampaigns,
    getCampaignInfluencerActions,
    hasPerformedAction,
    hasParticipated,
    hasClaimedReward,
    getCampaignGroup,
    getSellerCampaignGroups,
    getGroupPosts,
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
};