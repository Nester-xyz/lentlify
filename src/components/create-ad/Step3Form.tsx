import React from "react";
import CustomizedInput from "@/components/atoms/CustomizedInput";
import type { TCampaignData } from "../../pages/create-ad/index";

interface Step3FormProps {
  data: TCampaignData;
  setData: React.Dispatch<React.SetStateAction<TCampaignData>>;
}

const Step3Form: React.FC<Step3FormProps> = ({ data, setData }) => {
  return (
    <div className="w-full">
      <div className="w-full space-y-6">
        <div className="relative text-left">
          <CustomizedInput
            label="Pool Amount (GRASS Token)"
            name="pool_amount"
            type="text"
            placeholder="Enter pool amount"
            value={data.amount}
            onChange={(e) => setData({ ...data, amount: e.target.value })}
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
              The contract will allocate 90% of this amount for rewards and 10%
              for display fees. Rewards per action = (90% of pool) / number of
              slots.
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1 italic">
          Reward per action will be automatically calculated based on pool
          amount and number of slots.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="relative">
            <CustomizedInput
              label="Campaign Duration (Days)"
              name="campaign_duration"
              type="text"
              placeholder="30"
              value={data.duration}
              onChange={(e) => setData({ ...data, duration: e.target.value })}
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
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                How long the campaign will be active for users to participate
              </div>
            </div>
          </div>
          <div className="relative">
            <CustomizedInput
              label="Reward Claim Period (Days)"
              name="reward_claim_period"
              type="text"
              placeholder="14"
              value={data.rewardClaimPeriod}
              onChange={(e) =>
                setData({ ...data, rewardClaimPeriod: e.target.value })
              }
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
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Time window after campaign ends after which participants can
                claim rewards
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Form;
