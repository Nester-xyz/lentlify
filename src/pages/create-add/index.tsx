import React from "react";

import CircularCard from "@/components/atoms/CircularCard";
import CustomizedInput from "@/components/atoms/CustomizedInput";
import MultiSelectInput from "@/components/atoms/MultiselectInput";
import { useState, useEffect } from "react";
import { useLensAdCampaignMarketplace, useTokenApproval, ActionType } from "@/hooks/useLensAdCampaignMarketplace";
import { storageClient } from "@/lib/lens";
import acl from "@/lib/acl";
import { useAccount } from "wagmi";
import { paymentTokenAddress } from "@/constants/addresses";

type TCampaignData = {
  campaign_title: string;
  campaign_description: string;
  categories: string[];
  link: string;
  amount: string;
  minFollowers: string;
  maxSlots: string;
  duration: string;
  rewardClaimPeriod: string;
  actionType: ActionType;
  groupId: string;
  commentText: string;
  quoteText: string;
  termsAccepted: boolean;
};

// No longer need the CampaignGroup type



const createAd: React.FC = () => {
    // Get token approval function
  const { approveTokenSpending } = useTokenApproval();

  const { address } = useAccount();
  const [data, setData] = useState<TCampaignData>({
    campaign_title: "",
    campaign_description: "",
    categories: [],
    link: "",
    amount: "",
    minFollowers: "",
    maxSlots: "",
    duration: "1",
    rewardClaimPeriod: "1",
    actionType: ActionType.MIRROR,
    groupId: "0", // Default to 0 (no group)
    commentText: "",
    quoteText: "",
    termsAccepted: false,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentHash, setContentHash] = useState<string>("");
  const [groveUri, setGroveUri] = useState<string>("");
  const [shouldExecuteContract, setShouldExecuteContract] = useState(false);

  // Get contract interaction functions
  const { 
    createCampaign,
    isCreateCampaignPending,
    isCreateCampaignConfirming,
    isCreateCampaignConfirmed,
    createCampaignHash
  } = useLensAdCampaignMarketplace();
  
  // Effect to execute contract call when URI is ready
  useEffect(() => {
    const executeContractCall = async () => {
      if (shouldExecuteContract && groveUri && contentHash && !isTransactionInProgress) {
        try {
          // Set transaction in progress to prevent duplicate transactions
          setIsTransactionInProgress(true);
          
          console.log("Executing contract call with URI:", groveUri);
          
          // Extract post ID from the link
          let postId = "";
          if (data.link) {
            // Check if the link is from hey.xyz
            if (data.link.includes("hey.xyz/posts/")) {
              // Extract the post ID from the URL
              const parts = data.link.split("hey.xyz/posts/");
              if (parts.length > 1) {
                postId = parts[1].trim();
              }
            }
          }
          
          if (!postId) {
            throw new Error("Invalid post link. Please enter a valid Hey.xyz post link");
          }
          
          // Calculate timestamps
          const now = Math.floor(Date.now() / 1000);
          const durationInSeconds = parseInt(data.duration) * 24 * 60 * 60; // days to seconds
          const rewardClaimPeriodInSeconds = parseInt(data.rewardClaimPeriod) * 24 * 60 * 60; // days to seconds
          
          // Make sure the start time is in the future to pass contract validation
          const futureStartTime = now + 60; // 1 minute in the future
          const futureEndTime = futureStartTime + durationInSeconds;
          const futureRewardClaimableTime = futureEndTime + 60; // 1 minute after end time
          
          // Convert string values to appropriate types for contract
          const amountPool = BigInt(parseFloat(data.amount) * 1e18); // Convert to wei
          const minFollowersRequired = parseInt(data.minFollowers);
          const availableSlots = parseInt(data.maxSlots);
          
          // Use the specified payment token address from constants
          console.log("Using payment token address:", paymentTokenAddress);
          
          // Skip the separate approval step and directly create the campaign
          // The special token on Lens Sepolia Testnet will handle approval in the transaction
          setError("Creating campaign. Please confirm the transaction in your wallet...");
          
          try {
            console.log("Creating campaign with token:", paymentTokenAddress);
            console.log("Amount pool:", amountPool.toString(), "wei");
            console.log("Sending ETH value with transaction:", amountPool.toString());
            
            // Use the hook directly - this is more reliable than window.ethereum
            console.log('Using hook method to create campaign');
            console.log('Action type:', data.actionType);
            console.log('Start time:', new Date(futureStartTime * 1000).toISOString());
            console.log('End time:', new Date(futureEndTime * 1000).toISOString());
            console.log('Reward claimable time:', new Date(futureRewardClaimableTime * 1000).toISOString());
            
            try {
              // Use the createCampaign hook with the correct parameters
              console.log('Calling createCampaign with value:', amountPool.toString());
              const result = await createCampaign(
                postId,
                amountPool,
                0n, // rewardAmount is calculated by the contract
                data.actionType,
                minFollowersRequired,
                availableSlots,
                futureStartTime,
                futureEndTime,
                futureRewardClaimableTime,
                futureRewardClaimableTime + rewardClaimPeriodInSeconds,
                groveUri,
                contentHash,
                false, // Use smart wallet flag
                parseInt(data.groupId), // Pass the group ID from the form
                undefined, // No target audience
                amountPool // Pass the amount as value for the payable function
              );
              
              console.log('Campaign created successfully via hook:', result);
              // This should now trigger the MetaMask popup
              setError('Transaction sent to wallet. Please confirm in MetaMask...');
              setShouldExecuteContract(false);
              setIsTransactionInProgress(false);
            } catch (hookError: any) {
              console.error('Error using hook method:', hookError);
              setError(`Hook error: ${hookError.message || 'Failed to create campaign'}`);
              setIsTransactionInProgress(false);
            }
            
            console.log("Campaign creation initiated");
            setError(null);
          } catch (err: any) {
            console.error("Error during campaign creation:", err);
            throw new Error("Failed to create campaign: " + (err.message || "Unknown error"));
          }
          
          setShouldExecuteContract(false); // Reset flag after execution
        } catch (err: any) {
          console.error("Error during contract execution:", err);
          setError(err.message || "Error creating campaign");
          setIsSubmitting(false);
          setShouldExecuteContract(false); // Reset flag on error
        }
      }
    };
    
    executeContractCall();
  }, [shouldExecuteContract, groveUri, contentHash, data, createCampaign, approveTokenSpending]);

  // Update categories in data when they change
  useEffect(() => {
    setData(prev => ({ ...prev, categories }));
  }, [categories]);

  // Update terms accepted in data when it changes
  useEffect(() => {
    setData(prev => ({ ...prev, termsAccepted }));
  }, [termsAccepted]);
  
  // Reset form or navigate away after successful campaign creation
  useEffect(() => {
    if (isCreateCampaignConfirmed) {
      setIsSubmitting(false);
      // You could add navigation here or a success message
      alert("Campaign created successfully!");
    }
  }, [isCreateCampaignConfirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Upload content to Grove storage
      console.log("Preparing campaign data for Grove storage");
      
      // Prepare metadata payload
      const payload = {
        title: data.campaign_title,
        description: data.campaign_description,
        categories: data.categories,
        link: data.link,
        minFollowers: data.minFollowers,
        maxSlots: data.maxSlots,
        duration: data.duration,
        rewardClaimPeriod: data.rewardClaimPeriod,
        actionType: data.actionType,
        commentText: data.commentText,
        quoteText: data.quoteText,
        groupId: data.groupId,
        owner: address,
        createdAt: new Date().toISOString()
      };
      
      // Upload metadata to Grove storage
      console.log("Uploading campaign metadata to Grove storage:", payload);
      const metaRes = await storageClient.uploadAsJson(payload, { acl });
      console.log("Storage response:", metaRes);
      
      const metaUri = metaRes.uri;
      console.log("Meta URI:", metaUri);
      const hash = metaUri.replace("lens://", "");
      console.log("Meta hash:", hash);
      
      // Step 2: Prepare for campaign creation on-chain
      // Save the content hash and Grove URI for use in the contract call
      setContentHash(hash);
      setGroveUri(metaUri);
      
      // Set flag to trigger contract execution in the useEffect
      setShouldExecuteContract(true);
      console.log("Campaign creation prepared with URI:", metaUri);
    } catch (err: any) {
      console.error("Error preparing campaign:", err);
      setError(err.message || "Failed to prepare campaign");
      setIsSubmitting(false);
    }
  };

  // Determine if button should be disabled
  const isButtonDisabled = 
    isSubmitting || 
    isCreateCampaignPending || 
    isCreateCampaignConfirming ||
    !data.campaign_title ||
    !data.campaign_description ||
    !data.link ||
    !data.amount ||
    !data.minFollowers ||
    !data.maxSlots ||
    !categories.length ||
    !termsAccepted;

  // Get button text based on transaction state
  const getButtonText = () => {
    if (isCreateCampaignPending) return "Submitting...";
    if (isCreateCampaignConfirming) return "Confirming...";
    if (isSubmitting) return "Processing...";
    return "Create Campaign";
  };
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Create Ad Campaign</h1>
      <CircularCard>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-xl">
        {/* Campaign Title */}
        <h2 className="text-2xl font-semibold mb-5">Create a new campaign</h2>

        <div>
          <CustomizedInput
            label="Campaign Title"
            name="campaign_title"
            type="text"
            placeholder="Summer Vibes"
            value={data.campaign_title}
            onChange={(e) =>
              setData({ ...data, campaign_title: e.target.value })
            }
          />
          <CustomizedInput
            label="Campaign Description"
            name="campaign_description"
            type="textarea"
            placeholder="Describe your campaign"
            value={data.campaign_description}
            onChange={(e) =>
              setData({ ...data, campaign_description: e.target.value })
            }
          />
          <MultiSelectInput
            name="tags"
            label="Add Categories"
            value={categories}
            onChange={setCategories}
            placeholder="Type and press Enter to add..."
          />
        </div>

        {/* Campaign Details */}
        <div>
          {/* Campaign Group Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Group ID
            </label>
            <div className="relative">
              <CustomizedInput
                label=""
                name="group_id"
                type="text"
                placeholder="Enter Group ID (0 for no group)"
                value={data.groupId}
                onChange={(e) => setData({ ...data, groupId: e.target.value })}
              />
              <div className="absolute right-3 top-2 text-gray-500 cursor-help group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Select a campaign group to add this campaign to, or select "None" to create a standalone campaign.
                </div>
              </div>
            </div>
          </div>
          
          {/* Post Link */}
          <div className="relative">
            <CustomizedInput
              label="Hey.xyz Post Link"
              name="post_url"
              type="text"
              placeholder="https://hey.xyz/posts/..."
              value={data.link}
              onChange={(e) => setData({ ...data, link: e.target.value })}
            />
            <div className="absolute right-3 top-9 text-gray-500 cursor-help group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Enter the full URL of your Hey.xyz post (e.g., https://hey.xyz/posts/1zxw5wgrn11377k8vx0). The post ID will be extracted automatically.
              </div>
            </div>
          </div>
          <div className="relative">
            <CustomizedInput
              label="Pool Amount (GRASS Token)"
              name="pool_amount"
              type="text"
              placeholder="Enter pool amount"
              value={data.amount}
              onChange={(e) => setData({ ...data, amount: e.target.value })}
            />
            <div className="absolute right-3 top-9 text-gray-500 cursor-help group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                The contract will allocate 90% of this amount for rewards and 10% for display fees. Rewards per action = (90% of pool) / number of slots.
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1 italic">Reward per action will be automatically calculated based on pool amount and number of slots.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <CustomizedInput
              label="Minimum Followers"
              name="minimum_followers"
              type="text"
              placeholder="Enter minimum followers"
              value={data.minFollowers}
              onChange={(e) => setData({ ...data, minFollowers: e.target.value })}
            />
            <CustomizedInput
              label="Maximum Slots"
              name="maximum_slots"
              type="text"
              placeholder="Enter Maximum Slots"
              value={data.maxSlots}
              onChange={(e) => setData({ ...data, maxSlots: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="relative">
              <CustomizedInput
                label="Campaign Duration (Days)"
                name="campaign_duration"
                type="text"
                placeholder="30"
                value={data.duration}
                onChange={(e) => setData({ ...data, duration: e.target.value })}
              />
              <div className="absolute right-3 top-9 text-gray-500 cursor-help group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  How long the campaign will be active for users to participate
                </div>
              </div>
            </div>
            <div className="relative">
              <CustomizedInput
                label="Reward Claim Period (Days)"
                name="reward_claim_period"
                type="text"
                placeholder="14"
                value={data.rewardClaimPeriod}
                onChange={(e) => setData({ ...data, rewardClaimPeriod: e.target.value })}
              />
              <div className="absolute right-3 top-9 text-gray-500 cursor-help group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Time window after campaign ends after which participants can claim rewards
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Type Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={`py-2 px-4 rounded-md border ${
                  data.actionType === ActionType.MIRROR
                    ? "bg-teal-500 text-white border-teal-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setData({ ...data, actionType: ActionType.MIRROR })}
              >
                Mirror
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-md border ${
                  data.actionType === ActionType.COMMENT
                    ? "bg-teal-500 text-white border-teal-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setData({ ...data, actionType: ActionType.COMMENT })}
              >
                Comment
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-md border ${
                  data.actionType === ActionType.QUOTE
                    ? "bg-teal-500 text-white border-teal-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setData({ ...data, actionType: ActionType.QUOTE })}
              >
                Quote
              </button>
            </div>
          </div>
          
          {/* Custom Text for Comment */}
          {data.actionType === ActionType.COMMENT && (
            <div className="mt-4">
              <CustomizedInput
                label="Default Comment Text"
                name="comment_text"
                type="textarea"
                placeholder="Enter default text for comments"
                value={data.commentText}
                onChange={(e) => setData({ ...data, commentText: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1 italic">
                This text will be suggested to users when they comment on your post.
              </p>
            </div>
          )}
          
          {/* Custom Text for Quote */}
          {data.actionType === ActionType.QUOTE && (
            <div className="mt-4">
              <CustomizedInput
                label="Default Quote Text"
                name="quote_text"
                type="textarea"
                placeholder="Enter default text for quotes"
                value={data.quoteText}
                onChange={(e) => setData({ ...data, quoteText: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1 italic">
                This text will be suggested to users when they quote your post.
              </p>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="terms" className="ml-2 block text-gray-700 text-sm">
            I agree to the{" "}
            <span className="underline cursor-pointer">
              terms and conditions
            </span>
            .
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Transaction Status */}
        {createCampaignHash && !isCreateCampaignConfirmed && (
          <div className="text-blue-500 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
            Transaction submitted! Waiting for confirmation...
            <a 
              href={`https://testnet.lensscan.io/tx/${createCampaignHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block mt-1"
            >
              View on explorer
            </a>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="w-full py-3 px-6 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
          >
            {getButtonText()}
          </button>
        </div>
      </form>
    </CircularCard>
    </div>
  );
};

export default createAd;