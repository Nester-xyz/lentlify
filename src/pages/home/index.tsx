import { useSidebar } from "@/context/sidebar/SidebarContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useLensAdCampaignMarketplace, ActionType } from "@/hooks/useLensAdCampaignMarketplace";
import { FiExternalLink, FiRepeat } from "react-icons/fi";
import { storageClient } from "@/lib/lens";
import { formatDistanceToNow } from 'date-fns';
import { evmAddress, postId, uri } from "@lens-protocol/client";
import { post, repost } from "@lens-protocol/client/actions";
import { textOnly } from "@lens-protocol/metadata";
import { FaPlus } from "react-icons/fa";
import { UseAuth } from "@/context/auth/AuthContext";

// Define the campaign data structure for display
interface CampaignData {
  id: number;
  postId: string;
  sellerAddress: string;
  startTime: bigint;
  endTime: bigint;
  minFollowersRequired: bigint;
  status: number;
  groveContentURI: string;
  contentHash: string;
  availableLikeSlots: bigint;
  availableCommentSlots: bigint;
  availableQuoteSlots: bigint;
  claimedLikeSlots: bigint;
  claimedCommentSlots: bigint;
  claimedQuoteSlots: bigint;
  likeReward: bigint;
  commentReward: bigint;
  quoteReward: bigint;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
    link?: string;
    actionType?: number;
    commentText?: string;
    quoteText?: string;
  };
}

// Define the campaign info structure returned by getCampaignInfo
interface CampaignInfo {
  postId: string;
  sellerAddress: string;
  depositsToPayInfluencers: bigint;
  startTime: bigint;
  endTime: bigint;
  minFollowersRequired: bigint;
  status: number;
  groveContentURI: string;
  contentHash: string;
  version: bigint;
  availableLikeSlots: bigint;
  availableCommentSlots: bigint;
  availableQuoteSlots: bigint;
  claimedLikeSlots: bigint;
  claimedCommentSlots: bigint;
  claimedQuoteSlots: bigint;
  likeReward: bigint;
  commentReward: bigint;
  quoteReward: bigint;
  campaignId: bigint;
}

// We only need the campaign contract structure for this page

const Home = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { openSidebarRight, sidebarRightIsVisible } = useSidebar();
  const { sessionClient, isAuthorized, profile } = UseAuth();
  
  // Debug auth status
  useEffect(() => {
    console.log('Auth status:', { isAuthorized, sessionClient, profile });
    console.log('Session client available:', !!sessionClient);
  }, [isAuthorized, sessionClient, profile]);
  
  const {
    getCampaignInfo,
    getCampaignAdCount,
    CONTRACT_ADDRESS,
    isLoading: isContractLoading,
  } = useLensAdCampaignMarketplace();

  // State for campaigns and loading status
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs to track loading and fetch timing
  const initialLoadRef = useRef(true);
  const lastFetchTimeRef = useRef<number>(0);

  // Debug log for wallet address
  useEffect(() => {
    console.log("Current wallet address:", address);
  }, [address]);
  
  // Handle execute action when buy/claim button is clicked
  const handleExecuteAction = async (campaign: CampaignData) => {
    try {
      if (!address) {
        console.error("Wallet not connected");
        return;
      }

      // Get the action type from campaign metadata
      const actionType = campaign.metadata?.actionType || 0;
      console.log(`Executing Lens action type: ${actionType} on post ${campaign.postId}`);
      console.log("Campaign details:", campaign);
      
      // Debug auth status at the time of action execution
      console.log('Auth status at execution time:', { isAuthorized, sessionClient, profile });
      
      // Check if session client is available and user is authorized
      if (!sessionClient || !isAuthorized) {
        console.error("No Lens session client available or not authorized. Please make sure you're logged in to Lens Protocol.");
        alert("Please log in to Lens Protocol to perform this action.");
        return;
      }

      let result;
      
      // Execute different actions based on the action type
      switch (actionType) {
        case 1: // MIRROR (Repost)
          console.log(`Executing MIRROR action on post ${campaign.postId}`);
          result = await repost(sessionClient, {
            post: postId(campaign.postId),
          });
          break;
          
        case 2: // COMMENT
          console.log(`Executing COMMENT action on post ${campaign.postId}`);
          // Use comment text from metadata if available, otherwise use a default
          const commentText = campaign.metadata?.commentText || "Great content! #lentlify";
          
          // Create proper metadata for the comment
          const commentMetadata = textOnly({
            content: commentText,
          });
          
          // Upload the metadata to get a proper Lens URI
          const commentUpload = await storageClient.uploadAsJson(commentMetadata);
          console.log('Comment metadata uploaded with URI:', commentUpload.uri);
          
          // Post the comment using the generated URI
          result = await post(sessionClient, {
            contentUri: uri(commentUpload.uri),
            commentOn: {
              post: postId(campaign.postId),
            }
            // Removed feed parameter that was causing 'Feed does not exist' error
          });
          break;
          
        case 3: // QUOTE
          console.log(`Executing QUOTE action on post ${campaign.postId}`);
          // Use quote text from metadata if available, otherwise use a default
          const quoteText = campaign.metadata?.quoteText || "Check out this interesting content! #lentlify";
          
          // Create proper metadata for the quote
          const quoteMetadata = textOnly({
            content: quoteText,
          });
          
          // Upload the metadata to get a proper Lens URI
          const quoteUpload = await storageClient.uploadAsJson(quoteMetadata);
          console.log('Quote metadata uploaded with URI:', quoteUpload.uri);
          
          // Post the quote using the generated URI
          result = await post(sessionClient, {
            contentUri: quoteUpload.uri,
            quoteOf: {
              post: postId(campaign.postId),
            },
          });
          break;
          
        default:
          console.error(`Unknown action type: ${actionType}`);
          return;
      }

      // Check if the operation was successful
      if (result && 'isErr' in result && result.isErr()) {
        console.error("Lens Protocol action failed:", result.error);
        return;
      }
      
      console.log(`Action ${actionType} executed successfully:`, result);

      console.log(`Ready to execute actions...`)
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  useEffect(() => {
    console.log("Contract address:", CONTRACT_ADDRESS);

    const fetchRecentCampaigns = async () => {
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
        
        // Get total campaign count
        const totalCampaigns = await getCampaignAdCount();
        console.log(`Total campaigns: ${totalCampaigns}`);
        
        if (!totalCampaigns) {
          console.log("No campaigns found");
          setCampaigns([]);
          setIsLoading(false);
          return;
        }
        
        // Calculate the range of campaigns to fetch (last 10 in descending order)
        // The contract returns a number that's 1 higher than the actual highest campaign ID
        const startId = Number(totalCampaigns) - 1; // Adjust to get the actual highest ID
        const endId = Math.max(0, startId - 9); // Get last 10 campaigns or all if less than 10
        
        console.log(`Fetching campaigns from ID ${startId} to ${endId}`);
        
        const campaignsData: CampaignData[] = [];
        
        // Fetch campaigns in descending order
        for (let i = startId; i >= endId; i--) {
          console.log(`Fetching campaign ${i}`);
          // Use getCampaignInfo to get detailed campaign information
          console.log(`Fetching detailed info for campaign ${i}`);
          const campaignInfo = await getCampaignInfo(i);
          console.log(`Campaign info for ID ${i}:`, campaignInfo);
          
          if (campaignInfo) {
            let campaignMetadata: any = {};
            
            // Fetch campaign metadata
            if (campaignInfo.groveContentURI) {
              try {
                let fetchUrl = campaignInfo.groveContentURI;
                
                // If it's a lens:// URL, use storageClient to resolve it
                if (fetchUrl.startsWith("lens://")) {
                  try {
                    // Use storageClient to resolve the lens:// URI to an HTTPS URL
                    fetchUrl = storageClient.resolve(fetchUrl);
                    console.log(`Resolved lens URI to:`, fetchUrl);
                  } catch (resolveErr) {
                    console.error(`Error resolving lens URI for campaign ${i}:`, resolveErr);
                  }
                }
                
                // Fetch metadata from the resolved URL
                const metadataResponse = await fetch(fetchUrl);
                if (metadataResponse.ok) {
                  campaignMetadata = await metadataResponse.json();
                  console.log(`Fetched metadata for campaign ${i}:`, campaignMetadata);
                }
              } catch (err) {
                console.error(`Error fetching metadata for campaign ${i}:`, err);
              }
            }
            
            campaignsData.push({
              id: i,
              postId: campaignInfo.postId,
              sellerAddress: campaignInfo.sellerAddress,
              startTime: campaignInfo.startTime,
              endTime: campaignInfo.endTime,
              minFollowersRequired: campaignInfo.minFollowersRequired,
              status: campaignInfo.status,
              groveContentURI: campaignInfo.groveContentURI,
              contentHash: campaignInfo.contentHash,
              availableLikeSlots: campaignInfo.availableLikeSlots,
              availableCommentSlots: campaignInfo.availableCommentSlots,
              availableQuoteSlots: campaignInfo.availableQuoteSlots,
              claimedLikeSlots: campaignInfo.claimedLikeSlots,
              claimedCommentSlots: campaignInfo.claimedCommentSlots,
              claimedQuoteSlots: campaignInfo.claimedQuoteSlots,
              likeReward: campaignInfo.likeReward,
              commentReward: campaignInfo.commentReward,
              quoteReward: campaignInfo.quoteReward,
              metadata: campaignMetadata,
            });
          }
        }
        
        setCampaigns(campaignsData);
        console.log(`Fetch completed - found ${campaignsData.length} campaigns`);
      } catch (err: any) {
        console.error("Error fetching campaigns:", err);
        setError(err.message || "Failed to load campaigns");
      } finally {
        setIsLoading(false);
        initialLoadRef.current = false; // Mark initial load as complete
      }
    };
    
    // Fetch campaigns immediately
    fetchRecentCampaigns();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      console.log("30s interval triggered - fetching campaign updates");
      fetchRecentCampaigns();
    }, 30000); // 30 seconds in milliseconds
    
    // Clean up interval on component unmount
    return () => {
      console.log("Cleaning up polling interval");
      clearInterval(pollingInterval);
    };
  }, [
    getCampaignAdCount,
    getCampaignInfo,
    CONTRACT_ADDRESS,
  ]);

  useEffect(() => {
    if (!sidebarRightIsVisible) {
      openSidebarRight();
    }
  }, [sidebarRightIsVisible, openSidebarRight]);

  // No longer needed helper functions since we removed the campaign details

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header with create buttons */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Campaign Groups</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/create")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <FaPlus className="mr-2" /> Create Campaign
          </button>
          <button
            onClick={() => navigate("/create-ad")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
          >
            <FaPlus className="mr-2" /> Create AD
          </button>
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
      {!isLoading && !error && campaigns.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-400 mb-6">
            Create your first campaign to get started
          </p>
          <button
            onClick={() => navigate("/create-ad")}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create Campaign
          </button>
        </div>
      )}

      {/* Campaigns list */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Campaigns</h2>
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition cursor-pointer"
            onClick={() => navigate(`/campaign-post/${campaign.id}`)}
          >
            <div className="flex flex-col md:flex-row">
              {/* Campaign image */}
              <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-700">
                {campaign.metadata?.image ? (
                  <img
                    src={campaign.metadata.image}
                    alt="Campaign"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">AD #{campaign.id}</span>
                  </div>
                )}
              </div>

              {/* Campaign details */}
              <div className="p-6 w-full md:w-2/3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {campaign.metadata?.title || `Campaign #${campaign.id}`}
                  </h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-200">
                    {campaign.status === 0 ? 'PENDING' : 
                     campaign.status === 1 ? 'ACTIVE' : 
                     campaign.status === 2 ? 'COMPLETED' : 'CANCELLED'}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-2 truncate">
                  By: {campaign.sellerAddress}
                </p>
                
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {campaign.metadata?.description || "No description available"}
                </p>
                
                {/* Campaign details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Available Actions: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Number(campaign.availableLikeSlots) > 0 && (
                        <span>Available Actions: {ActionType[campaign.metadata?.actionType || 0]}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Rewards: </span>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className="text-white text-xs">
                          {ActionType[campaign.metadata?.actionType || 0]}: {(Number(campaign.likeReward) / 1e18).toFixed(4)} GRASS
                        </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Slots: </span>
                    <div className="flex flex-col gap-1 mt-1 text-xs">
                        <div className="text-white">
                          {ActionType[campaign.metadata?.actionType || 0]}: {Number(campaign.claimedLikeSlots)}/{Number(campaign.availableLikeSlots)}
                        </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Min Followers: </span>
                    <span className="text-white">{campaign.minFollowersRequired}</span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 mt-3 mb-4">                  
                  {campaign.status === 1 && campaign.availableLikeSlots && Number(campaign.availableLikeSlots) > 0 && (
                    <button 
                      className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExecuteAction(campaign);
                      }}
                      disabled={isContractLoading}
                    >
                      <FiRepeat className="mr-2" />
                      {isContractLoading ? 'Processing...' : `${ActionType[campaign.metadata?.actionType || 0]} for ${campaign.likeReward ? (Number(campaign.likeReward) / 1e18).toFixed(4) : '0'} GRASS`}
                    </button>
                  )}
                </div>
                
                {/* Time info */}
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div>
                    <span>Ends: </span>
                    <span>
                      {campaign.endTime ? 
                        formatDistanceToNow(new Date(Number(campaign.endTime) * 1000), { addSuffix: true }) : 
                        'N/A'}
                    </span>
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
        
        {/* Empty state when no campaigns are found */}
        {!isLoading && campaigns.length === 0 && (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No campaigns found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;