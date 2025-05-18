import React from "react";
import CustomizedInput from "@/components/atoms/CustomizedInput";
import type { TCampaignData } from "../../pages/create-ad/index";

interface Step2FormProps {
  data: TCampaignData;
  setData: React.Dispatch<React.SetStateAction<TCampaignData>>;
}

const Step2Form: React.FC<Step2FormProps> = ({ data, setData }) => {
  return (
    <div className="w-full">
      <div className="w-full space-y-6">
        <div className="text-left">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Campaign Group ID
          </label>
          <div className="relative">
            <CustomizedInput
              label=""
              name="group_id"
              type="text"
              placeholder="Enter Group ID (0 for no group)"
              value={data.groupId}
              onChange={(e) => setData({ ...data, groupId: e.target.value })}
            />
            <div className="absolute right-3 top-2 text-gray-500 cursor-help group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Select a campaign group to add this campaign to, or select
                "None" to create a standalone campaign.
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <CustomizedInput
            label="Hey.xyz Post Link"
            name="post_url"
            type="text"
            placeholder="https://hey.xyz/posts/..."
            value={data.link}
            onChange={(e) => setData({ ...data, link: e.target.value })}
          />
          <div className="absolute right-3 top-9 text-gray-500 cursor-help group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Enter the full URL of your Hey.xyz post (e.g.,
              https://hey.xyz/posts/1zxw5wgrn11377k8vx0). The post ID will be
              extracted automatically.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CustomizedInput
            label="Minimum Followers"
            name="minimum_followers"
            type="text"
            placeholder="Enter minimum followers"
            value={data.minFollowers}
            onChange={(e) => setData({ ...data, minFollowers: e.target.value })}
          />
          <CustomizedInput
            label="Maximum Slots"
            name="maximum_slots"
            type="text"
            placeholder="Enter Maximum Slots"
            value={data.maxSlots}
            onChange={(e) => setData({ ...data, maxSlots: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2Form;
