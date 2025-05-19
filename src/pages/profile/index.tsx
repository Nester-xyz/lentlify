import { UseAuth } from "@/context/auth/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLensAdCampaignMarketplace, ActionType } from "@/hooks/useLensAdCampaignMarketplace";
import { useAccount } from "wagmi";
import { FaPlus } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { storageClient } from "@/lib/lens";

// Define types for campaign group data
interface CampaignGroupData {
  id: number;
  uri: string;
  owner: string;
  metadata?: {
    name: string;
    description: string;
    coverPhoto?: string;
    profilePhoto?: string;
  };
  campaigns: CampaignData[];
}

// Define the campaign data structure based on the contract
interface CampaignData {
  id: number;
  postId: string;
  sellerAddress: string;
  amountPool: bigint;
  rewardAmount: bigint;
  actionType: number;
  minFollowersRequired: number;
  availableSlots: number;
  claimedSlots: number;
  adDisplayTimePeriod: {
    startTime: bigint;
    endTime: bigint;
  };
  groveContentURI: string;
  contentHash: string;
  status: number;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

// Define the campaign contract structure
interface CampaignContract {
  postId: string;
  sellerAddress: string;
  amountPool: bigint;
  rewardAmount: bigint;
  actionType: number;
  minFollowersRequired: number;
  availableSlots: number;
  claimedSlots: number;
  adDisplayTimePeriod: {
    startTime: bigint;
    endTime: bigint;
  };
  groveContentURI: string;
  contentHash: string;
  status: number;
}

// Define the campaign group structure from contract
interface CampaignGroupContract {
  groupURI: string;
  owner: string;
  postCampaignIds: bigint[];
}

// Define the user interaction interface
interface UserInteraction {
  campaignId: number;
  postId: string;
  actionType: ActionType;
  hasClaimedReward: boolean;
  rewardAmount: bigint;
  endTime: bigint;
  rewardClaimableTime?: bigint; // Time when rewards become claimable (after waiting period)
  rewardClaimEndTime?: bigint; // Time when reward claiming period ends
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

const Profile = () => {
  const { profile } = UseAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'activities'>('campaigns');
  const {
    getSellerCampaignGroups,
    getCampaignGroup,
    getCampaign,
    getGroupPosts,
    getCampaignInfo,
    getCampaignAdCount,
    hasParticipated,
    hasClaimedReward,
    claimReward,
    CONTRACT_ADDRESS,
  } = useLensAdCampaignMarketplace();

  // State for campaign groups and loading status
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for user interactions
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);
  const [isInteractionsLoading, setIsInteractionsLoading] = useState(true);
  const [interactionsError, setInteractionsError] = useState<string | null>(null);

  // Refs to track loading and fetch timing
  const initialLoadRef = useRef(true);
  const lastFetchTimeRef = useRef<number>(0);
  const interactionsLoadRef = useRef(true);
  const lastInteractionsFetchTimeRef = useRef<number>(0);

  // Function to fetch user interactions with campaigns
  const fetchUserInteractions = async () => {
    const address = profile?.address
    try {
      // Show loading indicator only on first load
      if (interactionsLoadRef.current) {
        setIsInteractionsLoading(true);
      }

      // Get current time to check if we should fetch
      const now = Date.now();
      const timeSinceLastFetch = now - lastInteractionsFetchTimeRef.current;

      // Only fetch if this is the first load or if enough time has passed
      if (lastInteractionsFetchTimeRef.current > 0 && timeSinceLastFetch < 30000) {
        console.log(
          `Too soon to fetch interactions again (${Math.round(
            timeSinceLastFetch / 1000
          )}s since last fetch)`
        );
        return;
      }

      // Update last fetch time
      lastInteractionsFetchTimeRef.current = now;
      
      if (!address) {
        console.log("Wallet address not available yet, skipping interactions fetch");
        setIsInteractionsLoading(false);
        return;
      }
      
      console.log(`Fetching interactions for address: ${address}`);
      
      // Get total campaign count to iterate through all campaigns
      const totalCampaigns = await getCampaignAdCount();
      console.log(`Total campaigns to check: ${totalCampaigns}`);
      
      if (!totalCampaigns) {
        console.log("No campaigns found");
        setUserInteractions([]);
        setIsInteractionsLoading(false);
        return;
      }
      
      const interactions: UserInteraction[] = [];
      
      // Check each campaign to see if the user has participated
      for (let i = 0; i < Number(totalCampaigns); i++) {
        try {
          // Check if user has participated in this campaign
          console.log("checking i and address", i, address)
          // Ensure address is properly formatted with 0x prefix
          const formattedAddress = address.startsWith('0x') ? address as `0x${string}` : `0x${address}` as `0x${string}`;
          const participated = await hasParticipated(i, formattedAddress);
          
          if (participated) {
            console.log(`User has participated in campaign ${i}`);
            
            // Get campaign details
            const campaignInfo = await getCampaignInfo(i);
            
            if (campaignInfo) {
              // Check if user has claimed reward
              const claimed = await hasClaimedReward(i, formattedAddress);
              
              // Fetch campaign metadata if available
              let campaignMetadata: any = {};
              
              if (campaignInfo.groveContentURI) {
                try {
                  let fetchUrl = campaignInfo.groveContentURI;
                  
                  // If it's a lens:// URL, use storageClient to resolve it
                  if (fetchUrl.startsWith("lens://")) {
                    try {
                      // Use storageClient to resolve the lens:// URI to an HTTPS URL
                      fetchUrl = storageClient.resolve(fetchUrl);
                    } catch (resolveErr) {
                      console.error(`Error resolving lens URI for campaign ${i}:`, resolveErr);
                    }
                  }
                  
                  // Fetch metadata from the resolved URL
                  const metadataResponse = await fetch(fetchUrl);
                  if (metadataResponse.ok) {
                    campaignMetadata = await metadataResponse.json();
                  }
                } catch (err) {
                  console.error(`Error fetching metadata for campaign ${i}:`, err);
                }
              }
              
              // Add to interactions list
              // Determine action type - in the contract it might be stored in a different field
              // Try to find it in different possible locations
              let actionTypeValue = 0;
              
              // Check different possible locations where actionType might be stored
              if ('actionType' in campaignInfo) {
                actionTypeValue = Number(campaignInfo.actionType || 0);
              } else if (campaignMetadata && 'actionType' in campaignMetadata) {
                actionTypeValue = Number(campaignMetadata.actionType || 0);
              }
              
              // Log the campaign info to see what timing data is available
              console.log('Campaign info for timing calculation:', campaignInfo);
              
              // Use the actual reward claimable time from the campaign data if available
              // This is the time when rewards become claimable after the campaign ends
              let calculatedRewardClaimableTime = campaignInfo.endTime;
              
              // Check if there's a specific reward claimable time in the campaign data
              // Different contracts might store this information in different fields
              try {
                // Try to access different possible fields where the reward claimable time might be stored
                if ('rewardClaimableTime' in campaignInfo) {
                  calculatedRewardClaimableTime = (campaignInfo as any).rewardClaimableTime as bigint;
                } else if ('adDisplayTimePeriod' in campaignInfo) {
                  const adDisplayTimePeriod = (campaignInfo as any).adDisplayTimePeriod;
                  if (adDisplayTimePeriod && typeof adDisplayTimePeriod === 'object' && 'startTime' in adDisplayTimePeriod) {
                    calculatedRewardClaimableTime = adDisplayTimePeriod.startTime as bigint;
                  }
                }
              } catch (error) {
                console.error('Error accessing campaign timing data:', error);
              }
              
              // If the calculated time is less than the end time, use the end time plus a waiting period
              if (calculatedRewardClaimableTime <= campaignInfo.endTime) {
                calculatedRewardClaimableTime = campaignInfo.endTime + BigInt(4 * 60); // 4 minutes waiting period
              }
              
              interactions.push({
                campaignId: i,
                postId: campaignInfo.postId,
                actionType: actionTypeValue as ActionType,
                hasClaimedReward: !!claimed, // Ensure boolean type
                // Use the appropriate reward amount based on action type
                rewardAmount: actionTypeValue === ActionType.COMMENT ? campaignInfo.commentReward : 
                              actionTypeValue === ActionType.QUOTE ? campaignInfo.quoteReward : 
                              campaignInfo.likeReward,
                endTime: campaignInfo.endTime,
                // Set the reward claimable time to 4 minutes after campaign ends
                rewardClaimableTime: calculatedRewardClaimableTime,
                // We no longer need a separate end time since rewards can be claimed indefinitely
                rewardClaimEndTime: calculatedRewardClaimableTime,
                metadata: campaignMetadata
              });
            }
          }
        } catch (err) {
          console.error(`Error checking participation for campaign ${i}:`, err);
        }
      }
      
      // Sort interactions by campaign ID (most recent first)
      interactions.sort((a, b) => b.campaignId - a.campaignId);
      
      // Update state with fetched interactions
      setUserInteractions(interactions);
      setInteractionsError(null);
    } catch (err: any) {
      console.error("Error fetching user interactions:", err);
      setInteractionsError(err.message || "Failed to load interactions");
    } finally {
      setIsInteractionsLoading(false);
      interactionsLoadRef.current = false; // Mark initial load as complete
    }
  };
  
  // Fetch user interactions on component mount
  useEffect(() => {
    const address = profile?.address
    if (!address) {
      return;
    }
    fetchUserInteractions();
  }, [profile?.address, CONTRACT_ADDRESS]);
  
  if (!profile) {
    return <div>Loading profile...</div>;
  }

  // Fetch campaign groups for the seller (current user)
  useEffect(() => {
    const address = profile.address
    // Skip if wallet address is not available
    if (!address) {
      console.log("Wallet address not available yet, skipping fetch");
      return;
    }

    console.log("Wallet connected:", address);
    console.log("Contract address:", CONTRACT_ADDRESS);

    const fetchCampaignGroups = async () => {
      const formattedAddress = profile.address.startsWith('0x') ? profile.address as `0x${string}` : `0x${profile.address}` as `0x${string}`;
      try {
        // Show loading indicator only on first load
        if (initialLoadRef.current) {
          setIsLoading(true);
        }

        // Get current time to check if we should fetch
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTimeRef.current;

        // Only fetch if this is the first load or if enough time has passed
        if (lastFetchTimeRef.current > 0 && timeSinceLastFetch < 30000) {
          console.log(
            `Too soon to fetch again (${Math.round(
              timeSinceLastFetch / 1000
            )}s since last fetch)`
          );
          return;
        }

        // Update last fetch time
        lastFetchTimeRef.current = now;
        console.log(`Fetching campaign groups for address: ${formattedAddress}`);

        // Get all group IDs for the current user
        const groupIds = (await getSellerCampaignGroups(
          formattedAddress
        )) as unknown as bigint[];
        console.log("Group IDs:", groupIds);

        if (!groupIds || groupIds.length === 0) {
          console.log("No groups found for this user");
          setCampaignGroups([]);
          setIsLoading(false);
          return;
        }

        const groupsData: CampaignGroupData[] = [];

        // Fetch data for each group
        for (const groupId of groupIds) {
          console.log(`Fetching group ${Number(groupId)}`);
          const groupData = (await getCampaignGroup(
            Number(groupId)
          )) as unknown as CampaignGroupContract;

          if (groupData) {
            let metadata: any = {};

            // Fetch metadata from Grove storage if URI exists
            if (groupData.groupURI) {
              try {
                let fetchUrl = groupData.groupURI;

                // If it's a lens:// URL, use storageClient to resolve it
                if (fetchUrl.startsWith("lens://")) {
                  const contentHash = fetchUrl.replace("lens://", "");
                  console.log(
                    `Resolving lens URI for group ${Number(groupId)}:`,
                    contentHash
                  );

                  try {
                    // Use storageClient to resolve the lens:// URI to an HTTPS URL
                    fetchUrl = storageClient.resolve(fetchUrl);
                    console.log(`Resolved lens URI to:`, fetchUrl);
                  } catch (resolveErr) {
                    console.error(
                      `Error resolving lens URI for group ${Number(groupId)}:`,
                      resolveErr
                    );
                    // Use placeholder metadata
                    metadata = {
                      name: `Campaign Group #${Number(groupId)}`,
                      description: `Campaign group with content hash: ${contentHash.substring(
                        0,
                        10
                      )}...`,
                    };
                    // Skip fetch attempt
                    throw new Error("Failed to resolve lens URI");
                  }
                }

                // Fetch metadata from the resolved URL
                const metadataResponse = await fetch(fetchUrl);
                if (metadataResponse.ok) {
                  metadata = await metadataResponse.json();
                  console.log(
                    `Fetched metadata for group ${Number(groupId)}:`,
                    metadata
                  );
                }
              } catch (err) {
                console.error(
                  `Error fetching metadata for group ${groupId}:`,
                  err
                );
              }
            }

            // Get campaign IDs for this group
            const campaignIds = (await getGroupPosts(
              Number(groupId)
            )) as unknown as bigint[];
            console.log(
              `Group ${Number(groupId)} has ${
                campaignIds?.length || 0
              } campaigns`
            );
            const campaigns: CampaignData[] = [];

            // Fetch data for each campaign
            if (campaignIds && campaignIds.length > 0) {
              for (const campaignId of campaignIds) {
                const campaignData = (await getCampaign(
                  Number(campaignId)
                )) as unknown as CampaignContract;

                if (campaignData) {
                  let campaignMetadata: any = {};

                  // Fetch campaign metadata
                  if (campaignData.groveContentURI) {
                    try {
                      const campaignMetadataResponse = await fetch(
                        campaignData.groveContentURI
                      );
                      if (campaignMetadataResponse.ok) {
                        campaignMetadata =
                          await campaignMetadataResponse.json();
                      }
                    } catch (err) {
                      console.error(
                        `Error fetching metadata for campaign ${campaignId}:`,
                        err
                      );
                    }
                  }

                  campaigns.push({
                    id: Number(campaignId),
                    postId: campaignData.postId,
                    sellerAddress: campaignData.sellerAddress,
                    amountPool: campaignData.amountPool,
                    rewardAmount: campaignData.rewardAmount,
                    actionType: campaignData.actionType,
                    minFollowersRequired: campaignData.minFollowersRequired,
                    availableSlots: campaignData.availableSlots,
                    claimedSlots: campaignData.claimedSlots,
                    adDisplayTimePeriod: campaignData.adDisplayTimePeriod,
                    groveContentURI: campaignData.groveContentURI,
                    contentHash: campaignData.contentHash,
                    status: campaignData.status,
                    metadata: campaignMetadata,
                  });
                }
              }
            }

            groupsData.push({
              id: Number(groupId),
              uri: groupData.groupURI,
              owner: groupData.owner,
              metadata,
              campaigns,
            });
          }
        }

        setCampaignGroups(groupsData);
        console.log(
          `Fetch completed - found ${groupsData.length} groups with data`
        );
      } catch (err: any) {
        console.error("Error fetching campaign groups:", err);
        setError(err.message || "Failed to load campaign groups");
      } finally {
        setIsLoading(false);
        initialLoadRef.current = false; // Mark initial load as complete
      }
    };

    // Fetch campaign groups immediately
    fetchCampaignGroups();

    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      console.log("30s interval triggered - fetching campaign updates");
      fetchCampaignGroups();
    }, 30000); // 30 seconds in milliseconds

    // Clean up interval on component unmount
    return () => {
      console.log("Cleaning up polling interval");
      clearInterval(pollingInterval);
    };
  }, [
    profile.address,
    getCampaignGroup,
    getSellerCampaignGroups,
    getGroupPosts,
    getCampaign,
    CONTRACT_ADDRESS,
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Cover and Profile Picture */}
        <div
          className="relative h-48 bg-gray-200 dark:bg-gray-700 bg-cover bg-center"
          style={
            profile.coverPicture
              ? { backgroundImage: `url(${profile.coverPicture})` }
              : undefined
          }
        >
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-400 flex items-center justify-center text-white font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Joined: {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Groups Section */}
      <div>
        {/* Header with create buttons */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">My Campaign Groups</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/create")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-2" /> Create Campaign
            </button>
            {/* <button
              onClick={() => navigate("/create-ad")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
            >
              <FaPlus className="mr-2" /> Create AD
            </button> */}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-8 mt-8">
          <button
            className={`px-6 py-3 font-medium text-lg ${activeTab === 'campaigns' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('campaigns')}
          >
            Your Campaigns
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${activeTab === 'activities' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('activities')}
          >
            Activities
          </button>
        </div>

        {/* Campaign Content - only visible when campaigns tab is active */}
        <div className={activeTab === 'campaigns' ? 'block' : 'hidden'}>
          {/* Loading state */}
          {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && campaignGroups.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-medium text-white mb-2">
              No campaign groups found
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first campaign group to get started
            </p>
            <button
              onClick={() => navigate("/create")}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Create Campaign
            </button>
          </div>
        )}
        </div>

        {/* User Interactions Section - only visible when activities tab is active */}
        <div className={`mb-12 ${activeTab === 'activities' ? 'block' : 'hidden'}`}>
          <div className="text-2xl font-bold mb-6 text-slate-500">
            Your Campaign Interactions
          </div>
          
          {/* Loading state */}
          {isInteractionsLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Error state */}
          {interactionsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{interactionsError}</span>
            </div>
          )}
          
          {/* Empty state */}
          {!isInteractionsLoading && !interactionsError && userInteractions.length === 0 && (
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-medium text-white mb-2">
                No campaign interactions found
              </h3>
              <p className="text-gray-400 mb-6">
                Participate in campaigns to see your interactions here
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Browse Campaigns
              </button>
            </div>
          )}
          
          {/* Interactions list */}
          {!isInteractionsLoading && !interactionsError && userInteractions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userInteractions.map((interaction) => (
                <div
                  key={`${interaction.campaignId}`}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {interaction.metadata?.title || `Campaign #${interaction.campaignId}`}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Action: {ActionType[interaction.actionType]}
                      </p>
                    </div>
                    <div className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
                      {interaction.hasClaimedReward ? 'Reward Claimed' : 'Participated'}
                    </div>
                  </div>
                  
                  <div className="text-gray-300 mb-4 line-clamp-2">
                    {interaction.metadata?.description || "No description available"}
                  </div>
                  
                  {/* Campaign end time */}
                  <div className="text-gray-400 text-sm mt-2">
                    Campaign ends: {new Date(Number(interaction.endTime) * 1000).toLocaleString()}
                  </div>
                  
                  {/* Reward amount */}
                  <div className="mt-4">
                    <div className="text-green-400 font-medium">
                      Reward: {(Number(interaction.rewardAmount) / 1e18).toFixed(4)} ETH
                    </div>
                  </div>
                  
                  {/* Campaign timing information */}
                  <div className="text-center py-2 my-2 rounded-md">
                    {!interaction.hasClaimedReward && interaction.rewardClaimableTime ? (
                      <div className="space-y-2">
                        {/* Campaign active phase */}
                        {Date.now() < Number(interaction.endTime) * 1000 ? (
                          <div className="text-blue-400 font-medium bg-blue-900 bg-opacity-30 p-2 rounded">
                            <div>Campaign active for {Math.ceil((Number(interaction.endTime) * 1000 - Date.now()) / 60000)} more minutes</div>
                            <div className="text-xs mt-1">
                              After campaign ends, wait {Math.ceil((Number(interaction.rewardClaimableTime) * 1000 - Number(interaction.endTime) * 1000) / 60000)} minutes to claim rewards
                            </div>
                          </div>
                        ) : Date.now() < Number(interaction.rewardClaimableTime) * 1000 ? (
                          <div className="text-yellow-400 font-medium bg-yellow-900 bg-opacity-30 p-2 rounded">
                            <div>Campaign ended. Wait time to claim: {Math.ceil((Number(interaction.rewardClaimableTime) * 1000 - Date.now()) / 60000)} minutes</div>
                          </div>
                        ) : (
                          <div className="text-green-400 font-medium bg-green-900 bg-opacity-30 p-2 rounded">
                            <div>Reward is now claimable!</div>
                            <div className="text-xs mt-1">
                              Rewards can be claimed at any time
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Claim button */}
                  <div className="flex justify-end mt-2">
                    
                    {!interaction.hasClaimedReward ? (
                      <button 
                        className={`px-4 py-2 ${interaction.rewardClaimableTime && Date.now() >= Number(interaction.rewardClaimableTime) * 1000 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'} text-white rounded-md transition flex items-center`}
                        onClick={async (e) => {
                          e.stopPropagation();
                          console.log('Claim button clicked for campaign:', interaction.campaignId);
                          console.log('Current time:', new Date().toISOString());
                          console.log('Reward claimable time:', interaction.rewardClaimableTime ? new Date(Number(interaction.rewardClaimableTime) * 1000).toISOString() : 'Not set');
                          console.log('Is claimable?', interaction.rewardClaimableTime && Date.now() >= Number(interaction.rewardClaimableTime) * 1000);
                          
                          // Only allow claiming if we're past the reward claimable time
                          if (interaction.rewardClaimableTime && Date.now() >= Number(interaction.rewardClaimableTime) * 1000) {
                            try {
                              console.log('Attempting to claim reward for campaign:', interaction.campaignId);
                              // Use smart wallet (true) instead of direct contract call
                              const result = await claimReward(interaction.campaignId, true);
                              console.log('Claim reward result:', result);
                            } catch (error) {
                              console.error('Error claiming reward:', error);
                              alert('Error claiming reward: ' + (error instanceof Error ? error.message : String(error)));
                            }
                          } else {
                            console.log('Cannot claim reward yet - not past claimable time');
                          }
                        }}
                        disabled={!interaction.rewardClaimableTime || Date.now() < Number(interaction.rewardClaimableTime) * 1000}
                      >
                        {!interaction.rewardClaimableTime ? 'Loading...' :
                          Date.now() < Number(interaction.endTime) * 1000 ? 'Campaign Active' :
                          Date.now() < Number(interaction.rewardClaimableTime) * 1000 ? 'Waiting Period' :
                          'Claim Reward'}
                      </button>
                    ) : (
                      <div className="text-gray-400">Reward Claimed</div>
                    )}
                  </div>
                  
                  {/* View details button */}
                  <div className="mt-3 text-center">
                    <button 
                      className="text-blue-400 hover:text-blue-300 transition"
                      onClick={() => navigate(`/campaign-post/${interaction.campaignId}`)}
                    >
                      View Campaign Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Campaign groups list - only shown when campaigns tab is active */}
        <div className={`${activeTab === 'campaigns' ? 'block' : 'hidden'}`}>
          <div className="text-2xl font-bold mb-6 text-slate-500">
            Your Campaigns
          </div>
        <div className="space-y-8">
          {campaignGroups.map((group) => (
            <div
              key={group.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition cursor-pointer"
              onClick={() => navigate(`/campaign-group/${group.id}`)}
            >
              {/* Cover photo */}
              <div className="h-48 bg-gray-700 relative">
                {group.metadata?.coverPhoto ? (
                  <img
                    src={group.metadata.coverPhoto}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900"></div>
                )}
              </div>

              {/* Profile section */}
              <div className="px-6 pt-4 pb-6 relative">
                {/* Profile photo */}
                <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden bg-gray-700">
                  {group.metadata?.profilePhoto ? (
                    <img
                      src={group.metadata.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </div>

                {/* Group info */}
                <div className="ml-40">
                  <h2 className="text-xl font-bold text-white">
                    {group.metadata?.name || `Campaign Group #${group.id}`}
                  </h2>
                  <p className="text-gray-400 text-sm mb-2 truncate">
                    {profile.address}
                  </p>
                  <p className="text-gray-300 mb-4">
                    {group.metadata?.description || "No description available"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center text-sm text-gray-400 mt-4">
                    <div className="flex items-center mr-6">
                      <span className="font-medium">
                        {group.campaigns.length}
                      </span>
                      <span className="ml-1">campaigns</span>
                    </div>
                    <div className="flex items-center">
                      <FiExternalLink className="mr-1" />
                      <span>View details</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;
