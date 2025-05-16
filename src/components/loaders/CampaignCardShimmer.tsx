import React from "react";

const CampaignCardShimmer: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Shimmer for Cover Photo */}
      <div className="relative w-full pt-[66.6667%] overflow-hidden mb-4">
        <div className="absolute inset-0 shimmer"></div>
      </div>

      {/* Shimmer for Profile Photo and Title */}
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shimmer mr-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 shimmer"></div>
      </div>

      {/* Shimmer for Description */}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 shimmer"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4 shimmer"></div>

      {/* Shimmer for Campaign Count */}
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 shimmer"></div>
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
      </div>
    </div>
  );
};

export default CampaignCardShimmer;
