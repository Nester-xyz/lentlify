import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLensAdCampaignMarketplace, ActionType } from "@/hooks/useLensAdCampaignMarketplace";
import { FiExternalLink, FiClock, FiUser, FiHash, FiRepeat, FiUsers } from "react-icons/fi";
import { storageClient, fetchLensProfileByAddress } from "@/lib/lens";
import { formatDistanceToNow } from 'date-fns';
import { post, repost } from "@lens-protocol/client/actions";
import { postId, uri } from "@lens-protocol/client";
import { textOnly } from "@lens-protocol/metadata";
import { UseAuth } from "@/context/auth/AuthContext";
import { formatDistance } from "date-fns";

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

// Define the influencer action structure
interface InfluencerAction {
  influencerAddress: string;
  action: ActionType;
  timestamp: bigint;
  paid: boolean;
  postString: string;
  profile?: any; // For storing Lens profile data
}

const CampaignPost: React.FC = () => {
  const navigate = useNavigate();
  const { pId } = useParams();
  
  console.log(pId);
  const { getCampaignInfo, CONTRACT_ADDRESS, recordInfluencerAction, getCampaignInfluencerActions, getCampaignParticipants, getCampaignParticipantAddresses } = useLensAdCampaignMarketplace();
  
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [influencerActions, setInfluencerActions] = useState<InfluencerAction[]>([]);
  const [participants, setParticipants] = useState<`0x${string}`[]>([]);
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sessionClient, isAuthorized, profile } = UseAuth();
  const [showActions, setShowActions] = useState(false);

  // Function to fetch all participants for a campaign
  const fetchCampaignParticipants = async (campaignId: number) => {
    if (!campaignId) return;
    
    try {
      setIsLoadingParticipants(true);
      
      // Use the new contract getter function to get all participants directly
      let allParticipants: `0x${string}`[] = [];
      
      try {
        // Try to use the new direct getter function if available
        allParticipants = await getCampaignParticipantAddresses(campaignId);
        console.log(`Found ${allParticipants.length} participants for campaign ${campaignId} using direct getter`);
      } catch (e) {
        // Fall back to the old method if the new function isn't available
        console.log('Direct participant getter not available, falling back to old method');
        allParticipants = await getCampaignParticipants(campaignId);
        console.log(`Found ${allParticipants.length} participants for campaign ${campaignId} using fallback method`);
      }
      
      // Filter out any undefined values and set the participants
      const validParticipants = allParticipants.filter((addr): addr is `0x${string}` => !!addr);
      setParticipants(validParticipants);
      
      // Fetch actions for all participants
      if (validParticipants.length > 0) {
        await fetchParticipantActions(campaignId, validParticipants);
      }
    } catch (error) {
      console.error('Error fetching campaign participants:', error);
    } finally {
      setIsLoadingParticipants(false);
    }
  };
  
  // Function to fetch actions for all participants
  const fetchParticipantActions = async (campaignId: number, participantAddresses: `0x${string}`[]) => {
    if (!campaignId || !participantAddresses.length) return;
    
    try {
      setIsLoadingActions(true);
      
      // Fetch actions for each address
      const actions: InfluencerAction[] = [];
      
      for (const address of participantAddresses) {
        const influencerActions = await getCampaignInfluencerActions(campaignId, address);
        
        if (influencerActions && Array.isArray(influencerActions)) {
          // Process each action
          for (const action of influencerActions) {
            // Fetch the Lens profile for this address
            let profileData = null;
            try {
              profileData = await fetchLensProfileByAddress(action.influencerAddress);
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
            
            actions.push({
              ...action,
              profile: profileData
            });
          }
        }
      }
      
      // Sort actions by timestamp (newest first)
      actions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      
      setInfluencerActions(actions);
    } catch (error) {
      console.error('Error fetching participant actions:', error);
    } finally {
      setIsLoadingActions(false);
    }
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!pId) {
        setError("Campaign ID is required");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`Fetching campaign ${pId} from contract ${CONTRACT_ADDRESS}`);
        
        // Fetch the campaign data
        const campaignInfo = await getCampaignInfo(Number(pId));
        
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
          id: Number(pId),
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
        
        // After fetching campaign data, fetch all participants and their actions
        fetchCampaignParticipants(Number(pId));
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setError("Error fetching campaign details");
        setIsLoading(false);
      }
    };
    
    fetchCampaign();
    // Only depend on pId to prevent unnecessary re-fetching
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pId]);

   const handleExecuteAction = async (campaign: CampaignData) => {
        const address = profile?.address;
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
    
          setIsContractLoading(true);
          let result;
          
          // Execute different actions based on the action type
          switch (actionType) {
            case 1: // MIRROR (Repost)
              console.log(`Executing MIRROR action on post ${campaign.postId}`);
              result = await repost(sessionClient, {
                post: postId(campaign.postId),
              });
              
              // Check if the mirror was successful
              if (result && !('isErr' in result && result.isErr())) {
                console.log('Mirror post created successfully!');
                
                // Record the action in the contract using Lens Protocol smart wallet
                console.log('Recording action in contract using Lens Protocol smart wallet');
                
                try {
                  // Get content hash from campaign
                  const campaignContentHash = campaign.contentHash;
                  console.log('Content hash for campaign:', campaignContentHash);
                  
                  // Use the campaign ID from the campaign object
                  const campaignIdToUse = campaign.id;
                  console.log('Using campaign ID:', campaignIdToUse);
                  
                  // Call the recordInfluencerAction function which uses the Lens Protocol smart wallet
                  console.log('Using Lens Protocol smart wallet for contract interaction');
                  const contractResult = await recordInfluencerAction({
                    actionType: 1, // MIRROR
                    postId: campaign.postId,
                    campaignId: campaignIdToUse,
                    contentHash: campaignContentHash
                  });
                  
                  console.log('Lens Protocol smart wallet transaction result:', contractResult);
                  console.log('Contract interaction complete!');
                } catch (contractError) {
                  // If the contract interaction fails, at least the mirror post was created
                  console.error('Error with Lens Protocol smart wallet transaction:', contractError);
                  console.log('But the mirror post was still created successfully');
                }
              } else {
                console.error('Mirror post creation failed:', result);
              }
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
              });
              
              // Check if the comment was successful
              if (result && !('isErr' in result && result.isErr())) {
                console.log('Comment post created successfully!');
                
                // Record the action in the contract using Lens Protocol smart wallet
                console.log('Recording action in contract using Lens Protocol smart wallet');
                
                try {
                  // Get content hash from campaign
                  const campaignContentHash = campaign.contentHash;
                  console.log('Content hash for campaign:', campaignContentHash);
                  
                  // Use the campaign ID from the campaign object
                  const campaignIdToUse = campaign.id;
                  console.log('Using campaign ID:', campaignIdToUse);
                  
                  // Call the recordInfluencerAction function which uses the Lens Protocol smart wallet
                  console.log('Using Lens Protocol smart wallet for contract interaction');
                  const contractResult = await recordInfluencerAction({
                    actionType: 2, // COMMENT
                    postId: campaign.postId,
                    campaignId: campaignIdToUse,
                    contentHash: campaignContentHash
                  });
                  
                  console.log('Lens Protocol smart wallet transaction result:', contractResult);
                  console.log('Contract interaction complete!');
                } catch (contractError) {
                  // If the contract interaction fails, at least the comment post was created
                  console.error('Error with Lens Protocol smart wallet transaction:', contractError);
                  console.log('But the comment post was still created successfully');
                }
              } else {
                console.error('Comment post creation failed:', result);
              }
              break;
              
            case 3: // QUOTE
              console.log(`Executing QUOTE action on post ${campaign.postId}`);
              // Use quote text from metadata if available, otherwise use a default
              const quoteText = campaign.metadata?.quoteText || "Check out this interesting content! #lentlify";
              
              // Create proper metadata for the quote
              const quoteMetadata = textOnly({
                content: `${quoteText}\n\n#lentlify #campaign${campaign.id}`,
              });
              
              // Upload the metadata to get a proper Lens URI
              const quoteUpload = await storageClient.uploadAsJson(quoteMetadata);
              console.log('Quote metadata uploaded with URI:', quoteUpload.uri);
              
              try {
                console.log('Creating quote with Lens Protocol smart wallet integration');
                
                // Get content hash from campaign
                const campaignContentHash = campaign.contentHash;
                console.log('Content hash for campaign:', campaignContentHash);
                
                // Use the campaign ID from the campaign object
                const campaignIdToUse = campaign.id;
                console.log('Using campaign ID:', campaignIdToUse);
                
                // Step 1: Create a simple quote post
                console.log('Step 1: Creating quote post');
                result = await post(sessionClient, {
                  contentUri: uri(quoteUpload.uri),
                  quoteOf: {
                    post: postId(campaign.postId),
                  }
                });
                
                console.log('Quote post result:', result);
                
                // Check if the quote was successful
                if (result && !('isErr' in result && result.isErr())) {
                  console.log('Quote post created successfully!');
                  
                  // Step 2: Record the action in the contract using Lens Protocol smart wallet
                  console.log('Step 2: Recording action in contract using Lens Protocol smart wallet');
                  
                  try {
                    // Call the recordInfluencerAction function which now uses the Lens Protocol smart wallet
                    console.log('Using Lens Protocol smart wallet for contract interaction');
                    const contractResult = await recordInfluencerAction({
                      actionType: 3, // QUOTE
                      postId: campaign.postId,
                      campaignId: campaignIdToUse,
                      contentHash: campaignContentHash
                    });
                    
                    console.log('Lens Protocol smart wallet transaction result:', contractResult);
                    console.log('Contract interaction complete!');
                  } catch (contractError) {
                    // If the contract interaction fails, at least the quote post was created
                    console.error('Error with Lens Protocol smart wallet transaction:', contractError);
                    console.log('But the quote post was still created successfully');
                  }
                } else {
                  console.error('Quote post creation failed:', result);
                }  
              } catch (quoteError) {
                console.error('Error creating quote post:', quoteError);
                throw quoteError;
              }
              break;
              
            default:
              console.error('Unsupported action type:', actionType);
          }
        } catch (error) {
          console.error('Error executing action:', error);
        } finally {
          setIsContractLoading(false);
        }
      };


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
            <div>

            <div className="flex gap-2 mt-3 mb-4">                  
                  {campaign.status === 1 && (
                    <button 
                      className={`w-full mt-2 ${campaign.endTime && Number(campaign.endTime) * 1000 < Date.now() 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : campaign.availableLikeSlots && Number(campaign.availableLikeSlots) > 0 
                          ? 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900' 
                          : 'bg-gray-600 cursor-not-allowed'} text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExecuteAction(campaign);
                      }}
                      disabled={Boolean(isContractLoading || !(campaign.availableLikeSlots && Number(campaign.availableLikeSlots) > 0) || (campaign.endTime && Number(campaign.endTime) * 1000 < Date.now()))}
                    >
                      <FiRepeat className="mr-2" />
                      {isContractLoading 
                        ? 'Processing...' 
                        : campaign.endTime && Number(campaign.endTime) * 1000 < Date.now()
                          ? 'Ended'
                        : campaign.availableLikeSlots && Number(campaign.availableLikeSlots) > 0 
                          ? `${ActionType[campaign.metadata?.actionType||0]} for ${campaign.likeReward && BigInt(campaign.likeReward) > 0 ? (Number(BigInt(campaign.likeReward)) / 1e18).toFixed(4) + ' GRASS' : 'Completed'}` 
                          : 'Campaign Full'}
                    </button>
                  )}
                </div>

            </div>
            
            {/* Influencer Actions Section */}
            <div className="mt-6">
              <button 
                onClick={() => setShowActions(!showActions)} 
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                <FiUsers className="text-lg" />
                {showActions ? 'Hide Influencer Actions' : 'Show Influencer Actions'}
              </button>
              
              {showActions && (
                <div className="mt-4 bg-gray-700 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-white mb-3">Influencer Actions</h3>
                  
                  {isLoadingActions ? (
                    <div className="text-center py-4">
                      <p className="text-gray-400">Loading actions...</p>
                    </div>
                  ) : influencerActions.length > 0 ? (
                    <div className="space-y-4">
                      {influencerActions.map((action, index) => (
                        <div key={index} className="border-b border-gray-600 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            {action.profile?.image && (
                              <img 
                                src={action.profile.image} 
                                alt={action.profile.name || 'Profile'} 
                                className="w-8 h-8 rounded-full object-cover border border-gray-500"
                              />
                            )}
                            <div>
                              <p className="text-white font-medium">
                                {action.profile?.name || action.influencerAddress.substring(0, 6) + '...' + action.influencerAddress.substring(38)}
                              </p>
                              <p className="text-sm text-gray-400">
                                {getActionTypeName(Number(action.action))} • {formatDistance(new Date(Number(action.timestamp) * 1000), new Date(), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          
                          {action.postString && (
                            <div className="mt-2 pl-10">
                              <p className="text-gray-300 text-sm">{action.postString}</p>
                            </div>
                          )}
                          
                          <div className="mt-2 pl-10 flex items-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${action.paid ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                              {action.paid ? 'Reward Paid' : 'Reward Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No influencer actions found for this campaign</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Action Button */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignPost;