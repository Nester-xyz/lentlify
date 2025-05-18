import React from "react";
import type { CampaignGroupData } from "@/types/campaign";
import { useCampaignContext } from "@/context/campaign/CampaignContext";
import CampaignCardShimmer from "@/components/loaders/CampaignCardShimmer";
import Page from "@/components/molecules/Page";
import CampaignCard from "@/components/molecules/CampaignCard";

const CreateCampaignGroup: React.FC = () => {
  const { campaignGroups, isLoading, error, fetchCampaignGroups, profiles } =
    useCampaignContext();

  console.table({
    campaignGroups,
    isLoading,
    profiles,
  });

  console.log(profiles);

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

  return (
    <Page title="Explore Campaigns">
      {isLoading ? (
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
      ) : (
        <div
          className="grid gap-6 p-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {campaignGroups.map((group: CampaignGroupData, index: number) => (
            <CampaignCard group={group} ownerProfiles={profiles} key={index} />
          ))}
        </div>
      )}
    </Page>
  );
};

export default CreateCampaignGroup;
