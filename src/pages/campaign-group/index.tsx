import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLensAdCampaignMarketplace } from "@/hooks/useLensAdCampaignMarketplace";
import { useNavigate } from "react-router-dom";
import {
  FiExternalLink,
  FiClock,
  FiUser,
  FiHash,
  FiMessageSquare,
  FiRepeat,
} from "react-icons/fi";
import { storageClient, fetchLensProfileByAddress } from "@/lib/lens";
import { UseAuth } from "@/context/auth/AuthContext";
import { FaPlus } from "react-icons/fa";
import { post, repost } from "@lens-protocol/client/actions";
import { postId, uri } from "@lens-protocol/client";
import { textOnly } from "@lens-protocol/metadata";
import { ActionType } from "@/constants/Campaign";
import Page from "@/components/molecules/Page";
import { formatTimeAgo, getActionTypeName } from "@/lib/helper";

interface CampaignGroupData {
  groupURI: string;
  owner: string;
  postCampaignIds: bigint[] | number[];
  metadata?: any;
}

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

interface OwnerProfileProps {
  address: string;
}

const OwnerProfile: React.FC<OwnerProfileProps> = ({ address }) => {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!address) return;
    setLoading(true);
    fetchLensProfileByAddress(address).then((res) => {
      if (isMounted) {
        setProfile(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [address]);

  if (profile) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2 truncate">
        {profile.image && (
          <img
            src={profile.image}
            alt={profile.name || "Profile"}
            className="w-6 h-6 rounded-full object-cover border border-gray-500"
          />
        )}
        <span>
          {profile.name
            ? profile.name
            : address.slice(0, 6) + "..." + address.slice(-4)}
        </span>
      </div>
    );
  }
  return <p className="text-gray-400 text-sm mb-2 truncate">{address}</p>;
};

const CampaignGroupDetail: React.FC = () => {
    const [isContractLoading, setIsContractLoading] = useState(false);
    const { sessionClient, isAuthorized, profile } = UseAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getCampaignGroup, getGroupPosts, getCampaignInfo, CONTRACT_ADDRESS, recordInfluencerAction } = useLensAdCampaignMarketplace();

  const [campaignGroup, setCampaignGroup] = useState<CampaignGroupData | null>(
    null
  );
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if the component is mounted to prevent state updates after unmount
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    // Set up cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);


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

  useEffect(() => {
    const fetchCampaignGroup = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      if (!isLoading) {
        return;
      }

      try {
        setIsLoading(true);
        console.log(
          `Fetching campaign group ${id} from contract ${CONTRACT_ADDRESS}`
        );

        // Fetch the campaign group data
        const groupData = (await getCampaignGroup(Number(id))) as unknown as {
          groupURI: string;
          owner: string;
          postCampaignIds: bigint[];
        };

        console.log("Campaign group data:", groupData);

        if (!groupData || !groupData.groupURI) {
          setError(
            `Campaign group with ID ${id} not found or has invalid data`
          );
          setIsLoading(false);
          return;
        }

        // Get campaign IDs for this group
        const campaignIds = (await getGroupPosts(
          Number(id)
        )) as unknown as bigint[];
        console.log(
          `Group ${Number(id)} has ${campaignIds?.length || 0} campaigns`
        );
        const campaignsList: CampaignData[] = [];

        // Fetch data for each campaign
        if (campaignIds && campaignIds.length > 0) {
          for (const campaignId of campaignIds) {
            try {
              // Use getCampaignInfo to get detailed campaign information
              const campaignInfo = await getCampaignInfo(Number(campaignId));

              if (campaignInfo) {
                let campaignMetadata: any = {};

                // Fetch campaign metadata if available
                if (campaignInfo.groveContentURI) {
                  try {
                    let fetchUrl = campaignInfo.groveContentURI;

                    // Handle lens:// protocol URLs
                    if (fetchUrl.startsWith("lens://")) {
                      const contentHash = fetchUrl.replace("lens://", "");
                      console.log(
                        `Resolving lens URI for campaign ${Number(
                          campaignId
                        )}:`,
                        contentHash
                      );

                      try {
                        // Use storageClient to resolve the lens:// URI to an HTTPS URL
                        fetchUrl = storageClient.resolve(fetchUrl);
                        console.log("Resolved campaign lens URI to:", fetchUrl);
                      } catch (resolveErr) {
                        console.error(
                          `Error resolving campaign lens URI:`,
                          resolveErr
                        );
                        // Use placeholder metadata
                        campaignMetadata = {
                          name: `Campaign #${Number(campaignId)}`,
                          description: `Campaign with content hash: ${contentHash.substring(
                            0,
                            10
                          )}...`,
                        };
                        // Skip fetch attempt
                        throw new Error("Failed to resolve lens URI");
                      }
                    }

                    // Fetch metadata
                    const metadataResponse = await fetch(fetchUrl);
                    if (metadataResponse.ok) {
                      campaignMetadata = await metadataResponse.json();
                      console.log(
                        `Fetched metadata for campaign ${Number(campaignId)}:`,
                        campaignMetadata
                      );
                    }
                  } catch (err) {
                    console.error(
                      `Error fetching metadata for campaign ${campaignId}:`,
                      err
                    );
                    // Use placeholder metadata on error
                    campaignMetadata = {
                      name: `Campaign #${Number(campaignId)}`,
                      description: "Metadata could not be loaded",
                    };
                  }
                }

                // Add campaign to the list with all the detailed information
                campaignsList.push({
                  id: Number(campaignId),
                  ...campaignInfo,
                  campaignId: Number(campaignId),
                  metadata: campaignMetadata,
                });
              }
            } catch (err) {
              console.error(`Error fetching campaign ${campaignId}:`, err);
            }
          }
        }

        // Update campaigns state
        setCampaigns(campaignsList);

        // Fetch metadata if available
        let metadata = {};
        if (groupData.groupURI) {
          try {
            // Handle lens:// protocol URLs
            let fetchUrl = groupData.groupURI;

            // If it's a lens:// URL, use storageClient.resolve to get the proper URL
            if (fetchUrl.startsWith("lens://")) {
              // Extract the content hash from the lens:// URL
              const contentHash = fetchUrl.replace("lens://", "");
              console.log("Content hash from lens URI:", contentHash);

              try {
                // Use storageClient to resolve the lens:// URI to an HTTPS URL
                fetchUrl = storageClient.resolve(fetchUrl);
                console.log("Resolved lens URI to:", fetchUrl);

                // Fetch metadata from the resolved URL
                const metadataResponse = await fetch(fetchUrl);
                if (metadataResponse.ok) {
                  metadata = await metadataResponse.json();
                  console.log(
                    "Campaign group metadata from lens URI:",
                    metadata
                  );
                } else {
                  throw new Error(
                    `Failed to fetch metadata: ${metadataResponse.status}`
                  );
                }
              } catch (resolveErr) {
                console.error("Error resolving lens URI:", resolveErr);
                // Use placeholder metadata if resolution fails
                metadata = {
                  name: `Campaign Group ${id}`,
                  description: `Campaign group with content hash: ${contentHash}`,
                };
                console.log("Using placeholder metadata for lens:// URI");
              }
            } else {
              // For regular URLs, fetch as normal
              const metadataResponse = await fetch(fetchUrl);
              if (metadataResponse.ok) {
                metadata = await metadataResponse.json();
                console.log("Campaign group metadata:", metadata);
              }
            }
          } catch (err) {
            console.error(`Error handling metadata for group ${id}:`, err);
            // Use placeholder metadata on error
            metadata = {
              name: `Campaign Group ${id}`,
              description: "Metadata could not be loaded",
            };
          }
        }

        // Combine contract data with metadata
        setCampaignGroup({
          ...groupData,
          metadata,
        });

        // Log the result as requested
        console.log(`Campaign Group ${id} Result:`, {
          groupURI: groupData.groupURI,
          owner: groupData.owner,
          postCampaignIds: groupData.postCampaignIds || [],
        });
      } catch (err: any) {
        console.error("Error fetching campaign group:", err);
        setError(err.message || "Failed to load campaign group");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignGroup();
  }, [
    id,
    getCampaignGroup,
    getGroupPosts,
    getCampaignInfo,
    isLoading,
    CONTRACT_ADDRESS,
  ]);

  return (
    <Page pageHeading="Campagin Group Details" title="Campaign Group Details">
      {/* Sticky Header */}
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

      {/* Campaign group details */}
      {!isLoading && !error && campaignGroup && (
        <div>
          <div className="p-2 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            {/* Cover photo */}
            <div className="h-48 bg-gray-700 relative">
              {campaignGroup.metadata?.coverPhoto ? (
                <img
                  src={campaignGroup.metadata.coverPhoto}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900"></div>
              )}
            </div>

            {/* Profile section */}
            <div className="px-6 pt-4 pb-2 relative">
              {/* Profile photo */}
              <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden bg-gray-700">
                {campaignGroup.metadata?.profilePhoto ? (
                  <img
                    src={campaignGroup.metadata.profilePhoto}
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
                  {campaignGroup.metadata?.name || `Campaign Group #${id}`}
                </h2>
                {/* Owner profile display */}
                <OwnerProfile address={campaignGroup.owner} />
                <p className="text-gray-300 mb-4">
                  {campaignGroup.metadata?.description ||
                    "No description available"}
                </p>

                {/* Contract Info */}
                <div className="text-sm text-gray-400">
                  {/* <p>Contract Address: {CONTRACT_ADDRESS}</p> */}
                  <p>Total Campaigns: {campaigns.length || 0}</p>
                </div>
                {profile?.address === campaignGroup.owner && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate("/create-ad")}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
                    >
                      <FaPlus className="mr-2" /> Create AD
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Technical details section */}
            <div className="border-t border-gray-700 mt-6 p-6">
              <div className="bg-gray-900 p-4 rounded-md overflow-x-auto text-white">
                {campaigns.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-white mb-2">
                      Campaigns in this group ({campaigns.length})
                    </h4>
                    {campaigns
                      .slice()
                      .sort((a, b) => b.campaignId - a.campaignId)
                      .map((campaign) => (
                      <div
                        key={campaign.campaignId}
                        className="border border-gray-700 rounded-md p-4 hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => navigate(`/campaign-post/${campaign.campaignId}`)}
                      >
                        {/* Campaign Header */}
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-lg font-medium text-white">
                            {campaign.metadata?.title ||
                              campaign.metadata?.name ||
                              `Campaign #${campaign.campaignId}`}
                          </h5>
                          {campaign.metadata?.createdAt && (
                            <div className="flex items-center text-xs text-gray-400">
                              <FiClock className="mr-1" />
                              <span>
                                {formatTimeAgo(campaign.metadata.createdAt)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Campaign Description */}
                        <p className="text-sm text-gray-300 mt-1 mb-3">
                          {campaign.metadata?.description ||
                            "No description available"}
                        </p>

                        {/* Campaign Link */}
                        {campaign.metadata?.link && (
                          <div className="mb-3">
                            <a
                              href={campaign.metadata.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline flex items-center text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Post on Lens
                              <FiExternalLink className="ml-1" />
                            </a>
                          </div>
                        )}

                        {/* Campaign Details */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {/* Action Type */}
                          <div className="flex items-center text-xs text-gray-400">
                            {campaign.metadata?.actionType ===
                              ActionType.MIRROR && (
                              <FiRepeat className="mr-1 text-pink-500" />
                            )}
                            {campaign.metadata?.actionType ===
                              ActionType.COMMENT && (
                              <FiMessageSquare className="mr-1 text-blue-500" />
                            )}
                            {campaign.metadata?.actionType ===
                              ActionType.QUOTE && (
                              <FiRepeat className="mr-1 text-green-500" />
                            )}
                            <span>
                              Action:{" "}
                              {getActionTypeName(
                                campaign.metadata?.actionType || 0
                              )}
                            </span>
                          </div>

                          {/* Available Actions */}
                          <div className="flex items-center text-xs text-gray-400">
                            <span>
                              Available Actions:{" "}
                              {getActionTypeName(
                                campaign.metadata?.actionType || 0
                              )}
                            </span>
                          </div>

                          {/* Min Followers */}
                          <div className="flex items-center text-xs text-gray-400">
                            <FiUser className="mr-1" />
                            <span>
                              Min Followers:{" "}
                              {campaign.metadata?.minFollowers ||
                                campaign.minFollowersRequired?.toString() ||
                                "0"}
                            </span>
                          </div>

                          {/* Max Slots */}
                          <div className="flex items-center text-xs text-gray-400">
                            <span>
                              Max Slots:{" "}
                              {campaign.metadata?.maxSlots ||
                                campaign.availableLikeSlots?.toString() ||
                                "0"}
                            </span>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center text-xs text-gray-400">
                            <span>
                              Duration: {campaign.metadata?.duration || "0"}{" "}
                              days
                            </span>
                          </div>
                        </div>

                        {/* Categories/Hashtags */}
                        {campaign.metadata?.categories &&
                          campaign.metadata.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {campaign.metadata.categories.map(
                                (category: string, index: number) => (
                                  <span
                                    key={index}
                                    className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center"
                                  >
                                    <FiHash className="mr-1" />
                                    {category}
                                  </span>
                                )
                              )}
                            </div>
                          )}

                        {/* Campaign Stats */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {/* Post ID */}
                            <div className="flex items-center text-xs text-gray-400">
                              <span>
                                Post ID:{" "}
                                {campaign.postId
                                  ? `${campaign.postId.substring(0, 8)}...`
                                  : "N/A"}
                              </span>
                            </div>

                            {/* Available Slots */}
                            <div className="flex items-center text-xs text-gray-400">
                              <span>
                                Available Slots:{" "}
                                {campaign.availableLikeSlots?.toString() || "0"}
                              </span>
                            </div>

                            {/* Claimed Slots */}
                            <div className="flex items-center text-xs text-gray-400">
                              <span>
                                Claimed Slots:{" "}
                                {campaign.claimedLikeSlots?.toString() || "0"}
                              </span>
                            </div>

                            {/* Reward */}
                            <div className="flex items-center text-xs text-gray-400">
                              <span>
                                Reward:{" "}
                                {campaign.likeReward
                                  ? (
                                      Number(campaign.likeReward) / 1e18
                                    ).toFixed(4)
                                  : "0"}{" "}
                                GHO
                              </span>
                            </div>

                            {/* Total Pool */}
                            <div className="flex items-center text-xs text-gray-400">
                              <span>
                                Total Pool:{" "}
                                {campaign.depositsToPayInfluencers
                                  ? (
                                      Number(
                                        campaign.depositsToPayInfluencers
                                      ) / 1e18
                                    ).toFixed(4)
                                  : "0"}{" "}
                                GHO
                              </span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center text-xs text-gray-400">
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  campaign.status === 1
                                    ? "bg-green-900 text-green-300"
                                    : "bg-gray-700 text-gray-300"
                                }`}
                              >
                                {campaign.status === 1 ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>

                          {/* Comment/Quote Instructions */}
                          {campaign.status === 1 && (
                            <div className="mt-3 pt-2 border-t border-gray-700">
                              {campaign.metadata?.actionType ===
                                ActionType.COMMENT &&
                                campaign.metadata?.commentText && (
                                  <div className="mb-2">
                                    <div className="text-xs font-semibold text-gray-300 mb-1">
                                      What to comment:
                                    </div>
                                    <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
                                      {campaign.metadata.commentText}
                                    </div>
                                  </div>
                                )}

                              {campaign.metadata?.actionType ===
                                ActionType.QUOTE &&
                                campaign.metadata?.quoteText && (
                                  <div className="mb-2">
                                    <div className="text-xs font-semibold text-gray-300 mb-1">
                                      What to quote:
                                    </div>
                                    <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
                                      {campaign.metadata.quoteText}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Action Button */}
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
                                window.open(campaign.metadata?.link || "#", "_blank");
                              }}
                              disabled={Boolean(!(campaign.availableLikeSlots && Number(campaign.availableLikeSlots) > 0) || (campaign.endTime && Number(campaign.endTime) * 1000 < Date.now()))}
                            >
                              <FiRepeat className="mr-2" />
                              {campaign.endTime && Number(campaign.endTime) * 1000 < Date.now()
                                ? 'Ended'
                                : campaign.availableLikeSlots && Number(campaign.availableLikeSlots) > 0 
                                  ? `${ActionType[campaign.metadata?.actionType||0]} for ${campaign.likeReward && BigInt(campaign.likeReward) > 0 ? (Number(BigInt(campaign.likeReward)) / 1e18).toFixed(4) + ' GHO' : 'Completed'}` 
                                  : 'Campaign Full'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">
                      No campaigns found in this group
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default CampaignGroupDetail;
