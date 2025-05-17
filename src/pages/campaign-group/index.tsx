import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useLensAdCampaignMarketplace,
  ActionType,
} from "@/hooks/useLensAdCampaignMarketplace";
import { useNavigate } from "react-router-dom";
import {
  FiExternalLink,
  FiClock,
  FiUser,
  FiHash,
  FiMessageSquare,
  FiRepeat,
  FiArrowLeft,
} from "react-icons/fi";
import { storageClient, fetchLensProfileByAddress } from "@/lib/lens";
import { UseAuth } from "@/context/auth/AuthContext";
import { FaPlus } from "react-icons/fa";

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

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
};

// Define the campaign group data structure
interface CampaignGroupData {
  groupURI: string;
  owner: string;
  postCampaignIds: bigint[] | number[];
  metadata?: any;
}

// Define the campaign data structure
interface CampaignData {
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

// --- OwnerProfile subcomponent ---
interface OwnerProfileProps {
  address: string;
}

const OwnerProfile: React.FC<OwnerProfileProps> = ({ address }) => {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
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

  if (loading) {
    return (
      <p className="text-gray-400 text-sm mb-2 truncate animate-pulse">
        Loading...
      </p>
    );
  }
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = UseAuth();
  const { getCampaignGroup, getGroupPosts, getCampaignInfo, CONTRACT_ADDRESS } =
    useLensAdCampaignMarketplace();

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

  useEffect(() => {
    const fetchCampaignGroup = async () => {
      if (!id) {
        setError("Campaign group ID is required");
        setIsLoading(false);
        return;
      }

      // Prevent duplicate fetches
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
  }, [id, getCampaignGroup, CONTRACT_ADDRESS]);

  return (
    <div className="mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-900">
        <div className="flex justify-between items-center">
          <h1 className="p-4 text-2xl font-bold text-white">
            Campaign Group Details
          </h1>
        </div>
        <div className="border-t border-gray-700 mb-2"></div>
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

      {/* Campaign group details */}
      {!isLoading && !error && campaignGroup && (
        <div>
          <div className="p-2">
            <button
              onClick={() => {
                navigate(`/campaign`);
              }}
              className="mb-2 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer bg-gray-600 hover:bg-gray-700 transition-colors"
              aria-label="Back"
            >
              <FiArrowLeft size={28} className="text-gray-300" />
            </button>
          </div>
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
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.campaignId}
                        className="border border-gray-700 rounded-md p-4 hover:bg-gray-800 transition-colors"
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
                                GRASS
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
                                GRASS
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

                          {/* Mirror Button */}
                          {campaign.status === 1 &&
                            campaign.availableLikeSlots &&
                            Number(campaign.availableLikeSlots) > 0 && (
                              <button
                                className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                                onClick={() =>
                                  window.open(
                                    campaign.metadata?.link || "#",
                                    "_blank"
                                  )
                                }
                              >
                                <FiRepeat className="mr-2" />
                                {
                                  ActionType[campaign.metadata?.actionType || 0]
                                }{" "}
                                {campaign.likeReward
                                  ? (
                                      Number(campaign.likeReward) / 1e18
                                    ).toFixed(4)
                                  : "0"}{" "}
                                GRASS
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
    </div>
  );
};

export default CampaignGroupDetail;
