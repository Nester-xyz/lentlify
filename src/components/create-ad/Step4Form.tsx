import React from "react";
import CustomizedInput from "@/components/atoms/CustomizedInput";
import type { TCampaignData } from "../../pages/create-ad/index";
import { ActionType } from "@/hooks/useLensAdCampaignMarketplace";

interface Step4FormProps {
  data: TCampaignData;
  setData: React.Dispatch<React.SetStateAction<TCampaignData>>;
  error: string | null;
  createCampaignHash?: string;
  isCreateCampaignConfirmed: boolean;
}

const Step4Form: React.FC<Step4FormProps> = ({
  data,
  setData,
  error,
  createCampaignHash,
  isCreateCampaignConfirmed,
}) => {
  return (
    <div className="w-full">
      <div className="w-full space-y-6">
        <div className="text-left">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Action Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className={`py-2 px-4 rounded-md border ${
                data.actionType === ActionType.MIRROR
                  ? "bg-teal-500 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              }`}
              onClick={() =>
                setData({ ...data, actionType: ActionType.MIRROR })
              }
            >
              Mirror
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md border ${
                data.actionType === ActionType.COMMENT
                  ? "bg-teal-500 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              }`}
              onClick={() =>
                setData({ ...data, actionType: ActionType.COMMENT })
              }
            >
              Comment
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-md border ${
                data.actionType === ActionType.QUOTE
                  ? "bg-teal-500 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              }`}
              onClick={() => setData({ ...data, actionType: ActionType.QUOTE })}
            >
              Quote
            </button>
          </div>
        </div>

        {data.actionType === ActionType.COMMENT && (
          <div className="mt-4">
            <CustomizedInput
              label="Comment Text"
              name="comment_text"
              type="textarea"
              placeholder="Enter default text for comments"
              value={data.commentText}
              onChange={(e) =>
                setData({ ...data, commentText: e.target.value })
              }
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
              This text will be suggested to users when they comment on your
              post.
            </p>
          </div>
        )}

        {data.actionType === ActionType.QUOTE && (
          <div className="mt-4">
            <CustomizedInput
              label="Quote Text"
              name="quote_text"
              type="textarea"
              placeholder="Enter default text for quotes"
              value={data.quoteText}
              onChange={(e) => setData({ ...data, quoteText: e.target.value })}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
              This text will be suggested to users when they quote your post.
            </p>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {createCampaignHash && !isCreateCampaignConfirmed && (
          <div className="text-blue-500 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400">
            Transaction submitted! Waiting for confirmation...
            <a
              href={`https://testnet.lensscan.io/tx/${createCampaignHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block mt-1 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View on explorer
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Form;
