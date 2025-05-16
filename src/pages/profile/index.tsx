import { UseAuth } from "@/context/auth/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLensAdCampaignMarketplace } from "@/hooks/useLensAdCampaignMarketplace";
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

const Profile = () => {
  const { profile } = UseAuth();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { 
    getSellerCampaignGroups, 
    getCampaignGroup, 
    getCampaign,
    getGroupPosts,
    CONTRACT_ADDRESS
  } = useLensAdCampaignMarketplace();

  // State for campaign groups and loading status
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to track loading and fetch timing
  const initialLoadRef = useRef(true);
  const lastFetchTimeRef = useRef<number>(0);

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  // Fetch campaign groups for the seller (current user)
  useEffect(() => {
    // Skip if wallet address is not available
    if (!address) {
      console.log('Wallet address not available yet, skipping fetch');
      return;
    }

    console.log('Wallet connected:', address);
    console.log('Contract address:', CONTRACT_ADDRESS);
    
    const fetchCampaignGroups = async () => {
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
          console.log(`Too soon to fetch again (${Math.round(timeSinceLastFetch/1000)}s since last fetch)`);
          return;
        }
        
        // Update last fetch time
        lastFetchTimeRef.current = now;
        console.log(`Fetching campaign groups for address: ${address}`);
        
        // Get all group IDs for the current user
        const groupIds = await getSellerCampaignGroups(address) as unknown as bigint[];
        console.log('Group IDs:', groupIds);
        
        if (!groupIds || groupIds.length === 0) {
          console.log('No groups found for this user');
          setCampaignGroups([]);
          setIsLoading(false);
          return;
        }

        const groupsData: CampaignGroupData[] = [];

        // Fetch data for each group
        for (const groupId of groupIds) {
          console.log(`Fetching group ${Number(groupId)}`);
          const groupData = await getCampaignGroup(Number(groupId)) as unknown as CampaignGroupContract;
          
          if (groupData) {
            let metadata: any = {};
            
            // Fetch metadata from Grove storage if URI exists
            if (groupData.groupURI) {
              try {
                let fetchUrl = groupData.groupURI;
                
                // If it's a lens:// URL, use storageClient to resolve it
                if (fetchUrl.startsWith('lens://')) {
                  const contentHash = fetchUrl.replace('lens://', '');
                  console.log(`Resolving lens URI for group ${Number(groupId)}:`, contentHash);
                  
                  try {
                    // Use storageClient to resolve the lens:// URI to an HTTPS URL
                    fetchUrl = storageClient.resolve(fetchUrl);
                    console.log(`Resolved lens URI to:`, fetchUrl);
                  } catch (resolveErr) {
                    console.error(`Error resolving lens URI for group ${Number(groupId)}:`, resolveErr);
                    // Use placeholder metadata
                    metadata = {
                      name: `Campaign Group #${Number(groupId)}`,
                      description: `Campaign group with content hash: ${contentHash.substring(0, 10)}...`,
                    };
                    // Skip fetch attempt
                    throw new Error('Failed to resolve lens URI');
                  }
                }
                
                // Fetch metadata from the resolved URL
                const metadataResponse = await fetch(fetchUrl);
                if (metadataResponse.ok) {
                  metadata = await metadataResponse.json();
                  console.log(`Fetched metadata for group ${Number(groupId)}:`, metadata);
                }
              } catch (err) {
                console.error(`Error fetching metadata for group ${groupId}:`, err);
              }
            }

            // Get campaign IDs for this group
            const campaignIds = await getGroupPosts(Number(groupId)) as unknown as bigint[];
            console.log(`Group ${Number(groupId)} has ${campaignIds?.length || 0} campaigns`);
            const campaigns: CampaignData[] = [];

            // Fetch data for each campaign
            if (campaignIds && campaignIds.length > 0) {
              for (const campaignId of campaignIds) {
                const campaignData = await getCampaign(Number(campaignId)) as unknown as CampaignContract;
                
                if (campaignData) {
                  let campaignMetadata: any = {};
                  
                  // Fetch campaign metadata
                  if (campaignData.groveContentURI) {
                    try {
                      const campaignMetadataResponse = await fetch(campaignData.groveContentURI);
                      if (campaignMetadataResponse.ok) {
                        campaignMetadata = await campaignMetadataResponse.json();
                      }
                    } catch (err) {
                      console.error(`Error fetching metadata for campaign ${campaignId}:`, err);
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
                    metadata: campaignMetadata
                  });
                }
              }
            }

            groupsData.push({
              id: Number(groupId),
              uri: groupData.groupURI,
              owner: groupData.owner,
              metadata,
              campaigns
            });
          }
        }

        setCampaignGroups(groupsData);
        console.log(`Fetch completed - found ${groupsData.length} groups with data`);
      } catch (err: any) {
        console.error('Error fetching campaign groups:', err);
        setError(err.message || 'Failed to load campaign groups');
      } finally {
        setIsLoading(false);
        initialLoadRef.current = false; // Mark initial load as complete
      }
    };

    // Fetch campaign groups immediately
    fetchCampaignGroups();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      console.log('30s interval triggered - fetching campaign updates');
      fetchCampaignGroups();
    }, 30000); // 30 seconds in milliseconds
    
    // Clean up interval on component unmount
    return () => {
      console.log('Cleaning up polling interval');
      clearInterval(pollingInterval);
    };
  }, [address, getCampaignGroup, getSellerCampaignGroups, getGroupPosts, getCampaign, CONTRACT_ADDRESS]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Cover and Profile Picture */}
        <div
          className="relative h-48 bg-gray-200 dark:bg-gray-700 bg-cover bg-center"
          style={profile.coverPicture ? { backgroundImage: `url(${profile.coverPicture})` } : undefined}
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
            <p className="text-gray-500 dark:text-gray-400">{address}</p>
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
            <h3 className="text-xl font-medium text-white mb-2">No campaign groups found</h3>
            <p className="text-gray-400 mb-6">Create your first campaign group to get started</p>
            <button
              onClick={() => navigate("/create")}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Create Campaign
            </button>
          </div>
        )}

        {/* Campaign groups list */}
        <div className="text-2xl font-bold mb-6 text-slate-500">Your Campaigns</div>
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
                  <h2 className="text-xl font-bold text-white">{group.metadata?.name || `Campaign Group #${group.id}`}</h2>
                  <p className="text-gray-400 text-sm mb-2 truncate">{address}</p>
                  <p className="text-gray-300 mb-4">{group.metadata?.description || 'No description available'}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center text-sm text-gray-400 mt-4">
                    <div className="flex items-center mr-6">
                      <span className="font-medium">{group.campaigns.length}</span>
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
  );
};

export default Profile;
