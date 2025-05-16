import React from "react";
import { useNavigate } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import type { CampaignGroupData } from "@/types/campaign";
import { useCampaignContext } from "@/context/campaign/CampaignContext";
import CampaignCardShimmer from "@/components/loaders/CampaignCardShimmer";

const CreateCampaignGroup: React.FC = () => {
  const navigate = useNavigate();
  const {
    campaignGroups,
    isLoading,
    error,
    fetchCampaignGroups,
    lastFetchTime,
  } = useCampaignContext();

  if (isLoading && campaignGroups.length === 0) {
    return (
      <div className="w-full min-h-screen dark:bg-gray-900 dark:text-white">
        <div className="sticky top-0 z-10 dark:bg-gray-900">
          <div className="text-2xl p-4 font-bold text-gray-900 dark:text-white">
            Explore Campaigns
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div
          className="grid gap-6 p-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <CampaignCardShimmer key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-red-500 dark:text-red-400">
          Error loading campaigns: {error}
        </p>
        <button
          onClick={() => fetchCampaignGroups()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isLoading && campaignGroups.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 w-full">
          <div className="text-2xl p-4 font-bold text-gray-900 dark:text-white">
            Explore Campaigns
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            No campaign groups found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen  dark:bg-gray-900 dark:text-white">
      <div className="sticky top-0 z-10  dark:bg-gray-900">
        <div className="text-2xl p-4 font-bold text-gray-900 dark:text-white">
          Explore Campaigns
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
      </div>

      <div
        className="grid gap-6 p-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
      >
        {campaignGroups.map((group: CampaignGroupData) => (
          <div
            key={group.id}
            className="cursor-pointer p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
            onClick={() => navigate(`/campaign-group/${group.id}`)}
          >
            <div className="relative w-full pt-[66.6667%] overflow-hidden">
              {group.metadata?.coverPhoto ? (
                <img
                  src={group.metadata.coverPhoto}
                  alt={group.metadata.name || "Cover"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900"></div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {group.metadata?.profilePhoto ? (
                    <img
                      src={group.metadata.profilePhoto}
                      alt={group.metadata.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </div>
                <h3 className="ml-3 text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {group.metadata?.name || `Campaign Group #${group.id}`}
                </h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 truncate">
                {group.metadata?.description || "No description available"}
              </p>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 text-xs">
                <span>{group.campaigns.length} campaigns</span>
                <FiExternalLink />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateCampaignGroup;
