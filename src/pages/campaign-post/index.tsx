import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLensAdCampaignMarketplace, ActionType } from "@/hooks/useLensAdCampaignMarketplace";
import { FiExternalLink, FiClock, FiUser, FiHash, FiRepeat } from "react-icons/fi";
import { storageClient } from "@/lib/lens";
import { formatDistanceToNow } from 'date-fns';

// Helper function to get action type name
const getActionTypeName = (actionType: number): string => {
  switch (actionType) {
    case ActionType.NONE:
      return "None";
    case ActionType.MIRROR:
      return "Mirror";
    case ActionType.COMMENT:
      return "Comment";
    case ActionType.QUOTE:
      return "Quote";
    default:
      return "Unknown";
  }
};

// Define the campaign data structure
interface CampaignData {
  id: number;
  campaignId: number;
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
  metadata?: any;
}

const CampaignPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  console.log(postId);
  const { getCampaignInfo, CONTRACT_ADDRESS } = useLensAdCampaignMarketplace();
  
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!postId) {
        setError("Campaign ID is required");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`Fetching campaign ${postId} from contract ${CONTRACT_ADDRESS}`);
        
        // Fetch the campaign data
        const campaignInfo = await getCampaignInfo(Number(postId));
        
        if (!campaignInfo) {
          setError("Campaign not found");
          setIsLoading(false);
          return;
        }
        
        console.log("Campaign info:", campaignInfo);
        
        // Fetch metadata if available
        let metadata = null;
        if (campaignInfo.groveContentURI) {
          try {
            // Check if it's a lens:// URL
            let fetchUrl = campaignInfo.groveContentURI;
            if (fetchUrl.startsWith('lens://')) {
              // Use storageClient to resolve the lens:// URI to an HTTPS URL
              fetchUrl = storageClient.resolve(fetchUrl);
              
              // Fetch the metadata from the resolved URL
              const response = await fetch(fetchUrl);
              if (response.ok) {
                metadata = await response.json();
                console.log("Campaign metadata:", metadata);
              }
            }
          } catch (metadataError) {
            console.error("Error fetching campaign metadata:", metadataError);
          }
        }
        
        // Create campaign object with metadata
        const campaignData: CampaignData = {
          id: Number(postId),
          campaignId: Number(campaignInfo.campaignId),
          postId: campaignInfo.postId,
          sellerAddress: campaignInfo.sellerAddress,
          depositsToPayInfluencers: campaignInfo.depositsToPayInfluencers,
          startTime: campaignInfo.startTime,
          endTime: campaignInfo.endTime,
          minFollowersRequired: campaignInfo.minFollowersRequired,
          status: campaignInfo.status,
          groveContentURI: campaignInfo.groveContentURI,
          contentHash: campaignInfo.contentHash,
          version: campaignInfo.version,
          availableLikeSlots: campaignInfo.availableLikeSlots,
          availableCommentSlots: campaignInfo.availableCommentSlots,
          availableQuoteSlots: campaignInfo.availableQuoteSlots,
          claimedLikeSlots: campaignInfo.claimedLikeSlots,
          claimedCommentSlots: campaignInfo.claimedCommentSlots,
          claimedQuoteSlots: campaignInfo.claimedQuoteSlots,
          likeReward: campaignInfo.likeReward,
          commentReward: campaignInfo.commentReward,
          quoteReward: campaignInfo.quoteReward,
          metadata: metadata
        };
        
        setCampaign(campaignData);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching campaign:", err);
        setError(err.message || "Error fetching campaign");
        setIsLoading(false);
      }
    };
    
    fetchCampaign();
  }, [postId, CONTRACT_ADDRESS]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
        >
          Back
        </button>
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

      {/* Campaign details */}
      {!isLoading && !error && campaign && (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {/* Cover image */}
          <div className="h-64 bg-gray-700 relative">
            {campaign.metadata?.image ? (
              <img 
                src={campaign.metadata.image} 
                alt="Campaign" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">AD #{campaign.id}</span>
              </div>
            )}
          </div>
          
          {/* Campaign content */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {campaign.metadata?.title || campaign.metadata?.name || `Campaign #${campaign.id}`}
            </h1>
            
            <p className="text-gray-400 text-sm mb-4">
              By: {campaign.sellerAddress}
            </p>
            
            <p className="text-gray-300 mb-6">
              {campaign.metadata?.description || "No description available"}
            </p>
            
            {/* Campaign Link */}
            {campaign.metadata?.link && (
              <div className="mb-6">
                <a 
                  href={campaign.metadata.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center text-sm"
                >
                  View Post on Lens
                  <FiExternalLink className="ml-1" />
                </a>
              </div>
            )}
            
            {/* Campaign details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="text-lg font-medium text-white mb-3">Campaign Details</h3>
                
                <div className="space-y-2">
                  {/* Action Type */}
                  <div className="flex items-center text-sm text-gray-300">
                    <FiRepeat className="mr-2" />
                    <span>Action: {getActionTypeName(campaign.metadata?.actionType || 0)}</span>
                  </div>
                  
                  {/* Available Actions */}
                  <div className="flex items-center text-sm text-gray-300">
                    <span>Available Actions: {getActionTypeName(campaign.metadata?.actionType || 0)}</span>
                  </div>
                  
                  {/* Min Followers */}
                  <div className="flex items-center text-sm text-gray-300">
                    <FiUser className="mr-2" />
                    <span>Min Followers: {campaign.minFollowersRequired?.toString() || '0'}</span>
                  </div>
                  
                  {/* Duration */}
                  <div className="flex items-center text-sm text-gray-300">
                    <FiClock className="mr-2" />
                    <span>Ends: {campaign.endTime ? 
                      formatDistanceToNow(new Date(Number(campaign.endTime) * 1000), { addSuffix: true }) : 
                      'N/A'}</span>
                  </div>
                  
                  {/* Categories/Hashtags */}
                  {campaign.metadata?.categories && campaign.metadata.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {campaign.metadata.categories.map((category: string, index: number) => (
                        <span key={index} className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center">
                          <FiHash className="mr-1" />
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="text-lg font-medium text-white mb-3">Rewards & Slots</h3>
                
                <div className="space-y-2">
                  {/* Reward */}
                  <div className="flex items-center text-sm text-gray-300">
                    <span>Reward: {campaign.likeReward ? (Number(campaign.likeReward) / 1e18).toFixed(4) : '0'} GRASS</span>
                  </div>
                  
                  {/* Available Slots */}
                  <div className="flex items-center text-sm text-gray-300">
                    <span>Available Slots: {campaign.availableLikeSlots?.toString() || '0'}</span>
                  </div>
                  
                  {/* Claimed Slots */}
                  <div className="flex items-center text-sm text-gray-300">
                    <span>Claimed Slots: {campaign.claimedLikeSlots?.toString() || '0'}</span>
                  </div>
                  
                  {/* Total Pool */}
                  <div className="flex items-center text-sm text-gray-300">
                    <span>Total Pool: {campaign.depositsToPayInfluencers ? (Number(campaign.depositsToPayInfluencers) / 1e18).toFixed(4) : '0'} GRASS</span>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center text-sm">
                    <span className={`px-2 py-1 rounded-full ${campaign.status === 1 ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-300'}`}>
                      {campaign.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comment/Quote Instructions */}
            {campaign.status === 1 && (
              <div className="mb-6 p-4 bg-gray-700 rounded-md">
                <h3 className="text-lg font-medium text-white mb-3">Action Instructions</h3>
                
                {campaign.metadata?.actionType === ActionType.COMMENT && campaign.metadata?.commentText && (
                  <div className="mb-2">
                    <div className="text-sm font-semibold text-gray-300 mb-1">What to comment:</div>
                    <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded">{campaign.metadata.commentText}</div>
                  </div>
                )}
                
                {campaign.metadata?.actionType === ActionType.QUOTE && campaign.metadata?.quoteText && (
                  <div className="mb-2">
                    <div className="text-sm font-semibold text-gray-300 mb-1">What to quote:</div>
                    <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded">{campaign.metadata.quoteText}</div>
                  </div>
                )}
              </div>
            )}
            
            {/* Action Button */}
            {campaign.status === 1 && campaign.availableLikeSlots && Number(campaign.availableLikeSlots) > 0 && (
              <button 
                className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
                onClick={() => window.open(campaign.metadata?.link || '#', '_blank')}
              >
                <FiRepeat className="mr-2" />
                {ActionType[campaign.metadata?.actionType || 0]} for {campaign.likeReward ? (Number(campaign.likeReward) / 1e18).toFixed(4) : '0'} GRASS
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignPost;