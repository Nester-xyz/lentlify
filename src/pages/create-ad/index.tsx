import React from "react";
import { useState, useEffect } from "react";
import {
  useLensAdCampaignMarketplace,
  useTokenApproval,
  ActionType,
} from "@/hooks/useLensAdCampaignMarketplace";
import { storageClient } from "@/lib/lens";
import acl from "@/lib/acl";
import { useAccount } from "wagmi";
import { paymentTokenAddress } from "@/constants/addresses";
import Step1Form from "../../components/create-ad/Step1Form";
import Step2Form from "../../components/create-ad/Step2Form";
import Step3Form from "../../components/create-ad/Step3Form";
import Step4Form from "../../components/create-ad/Step4Form";
import CampaignProgressIndicator from "../../components/create-ad/CampaignProgressIndicator";

export type TCampaignData = {
  campaign_title: string;
  campaign_description: string;
  categories: string[];
  link: string;
  amount: string;
  minFollowers: string;
  maxSlots: string;
  duration: string;
  rewardClaimPeriod: string;
  actionType: ActionType;
  groupId: string;
  commentText: string;
  quoteText: string;
};

const createAd: React.FC = () => {
  const { approveTokenSpending } = useTokenApproval();
  const { address } = useAccount();
  const [data, setData] = useState<TCampaignData>({
    campaign_title: "",
    campaign_description: "",
    categories: [],
    link: "",
    amount: "",
    minFollowers: "",
    maxSlots: "",
    duration: "1",
    rewardClaimPeriod: "1",
    actionType: ActionType.MIRROR,
    groupId: "0",
    commentText: "",
    quoteText: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentHash, setContentHash] = useState<string>("");
  const [groveUri, setGroveUri] = useState<string>("");
  const [shouldExecuteContract, setShouldExecuteContract] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const stepTitles = [
    "Basic Campaign Information",
    "Campaign Parameters & Content",
    "Funding & Duration",
    "Action Type & Confirmation",
  ];

  const {
    createCampaign,
    isCreateCampaignPending,
    isCreateCampaignConfirming,
    isCreateCampaignConfirmed,
    createCampaignHash,
  } = useLensAdCampaignMarketplace();

  useEffect(() => {
    const executeContractCall = async () => {
      if (
        shouldExecuteContract &&
        groveUri &&
        contentHash &&
        !isTransactionInProgress
      ) {
        try {
          setIsTransactionInProgress(true);
          console.log("Executing contract call with URI:", groveUri);

          let postId = "";
          if (data.link) {
            if (data.link.includes("hey.xyz/posts/")) {
              const parts = data.link.split("hey.xyz/posts/");
              if (parts.length > 1) {
                postId = parts[1].trim();
              }
            }
          }

          if (!postId) {
            throw new Error(
              "Invalid post link. Please enter a valid Hey.xyz post link"
            );
          }

          const now = Math.floor(Date.now() / 1000);
          const durationInSeconds = parseInt(data.duration) * 24 * 60 * 60;
          const rewardClaimPeriodInSeconds =
            parseInt(data.rewardClaimPeriod) * 24 * 60 * 60;

          const futureStartTime = now + 60;
          const futureEndTime = futureStartTime + durationInSeconds;
          const futureRewardClaimableTime = futureEndTime + 60;

          const amountPool = BigInt(parseFloat(data.amount) * 1e18);
          const minFollowersRequired = parseInt(data.minFollowers);
          const availableSlots = parseInt(data.maxSlots);

          console.log("Using payment token address:", paymentTokenAddress);

          setError(
            "Creating campaign. Please confirm the transaction in your wallet..."
          );

          try {
            console.log("Creating campaign with token:", paymentTokenAddress);
            console.log("Amount pool:", amountPool.toString(), "wei");
            console.log(
              "Sending ETH value with transaction:",
              amountPool.toString()
            );

            console.log("Using hook method to create campaign");
            console.log("Action type:", data.actionType);
            console.log(
              "Start time:",
              new Date(futureStartTime * 1000).toISOString()
            );
            console.log(
              "End time:",
              new Date(futureEndTime * 1000).toISOString()
            );
            console.log(
              "Reward claimable time:",
              new Date(futureRewardClaimableTime * 1000).toISOString()
            );

            try {
              console.log(
                "Calling createCampaign with value:",
                amountPool.toString()
              );
              const result = await createCampaign(
                postId,
                amountPool,
                0n,
                data.actionType,
                minFollowersRequired,
                availableSlots,
                futureStartTime,
                futureEndTime,
                futureRewardClaimableTime,
                futureRewardClaimableTime + rewardClaimPeriodInSeconds,
                groveUri,
                contentHash,
                false,
                parseInt(data.groupId),
                undefined,
                amountPool
              );

              console.log("Campaign created successfully via hook:", result);
              setError(
                "Transaction sent to wallet. Please confirm in MetaMask..."
              );
              setShouldExecuteContract(false);
              setIsTransactionInProgress(false);
            } catch (hookError: any) {
              console.error("Error using hook method:", hookError);
              setError(
                `Hook error: ${
                  hookError.message || "Failed to create campaign"
                }`
              );
              setIsTransactionInProgress(false);
            }

            console.log("Campaign creation initiated");
            setError(null);
          } catch (err: any) {
            console.error("Error during campaign creation:", err);
            throw new Error(
              "Failed to create campaign: " + (err.message || "Unknown error")
            );
          }

          setShouldExecuteContract(false);
        } catch (err: any) {
          console.error("Error during contract execution:", err);
          setError(err.message || "Error creating campaign");
          setIsSubmitting(false);
          setShouldExecuteContract(false);
        }
      }
    };

    executeContractCall();
  }, [
    shouldExecuteContract,
    groveUri,
    contentHash,
    data,
    createCampaign,
    approveTokenSpending,
  ]);

  useEffect(() => {
    setData((prev) => ({ ...prev, categories }));
  }, [categories]);

  useEffect(() => {
    if (isCreateCampaignConfirmed) {
      setIsSubmitting(false);
      alert("Campaign created successfully!");
    }
  }, [isCreateCampaignConfirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Preparing campaign data for Grove storage");

      const payload = {
        title: data.campaign_title,
        description: data.campaign_description,
        categories: data.categories,
        link: data.link,
        minFollowers: data.minFollowers,
        maxSlots: data.maxSlots,
        duration: data.duration,
        rewardClaimPeriod: data.rewardClaimPeriod,
        actionType: data.actionType,
        commentText: data.commentText,
        quoteText: data.quoteText,
        groupId: data.groupId,
        owner: address,
        createdAt: new Date().toISOString(),
      };

      console.log("Uploading campaign metadata to Grove storage:", payload);
      const metaRes = await storageClient.uploadAsJson(payload, { acl });
      console.log("Storage response:", metaRes);

      const metaUri = metaRes.uri;
      console.log("Meta URI:", metaUri);
      const hash = metaUri.replace("lens://", "");
      console.log("Meta hash:", hash);

      setContentHash(hash);
      setGroveUri(metaUri);

      setShouldExecuteContract(true);
      console.log("Campaign creation prepared with URI:", metaUri);
    } catch (err: any) {
      console.error("Error preparing campaign:", err);
      setError(err.message || "Failed to prepare campaign");
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled =
    isSubmitting ||
    isCreateCampaignPending ||
    isCreateCampaignConfirming ||
    !data.campaign_title ||
    !data.campaign_description ||
    !data.link ||
    !data.amount ||
    !data.minFollowers ||
    !data.maxSlots ||
    !categories.length;

  const getButtonText = () => {
    if (isCreateCampaignPending) return "Submitting...";
    if (isCreateCampaignConfirming) return "Confirming...";
    if (isSubmitting) return "Processing...";
    return "Create";
  };

  const nextStep = () => {
    setCurrentStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
      <div className="border-b p-4 border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Promotions
        </h1>
      </div>

      <div className="mx-auto p-6 flex flex-col md:flex-row gap-8 md:gap-12">
        <div className="hidden md:block md:w-80 lg:w-96 flex-shrink-0 order-last md:order-first space-y-8 md:sticky self-start h-fit">
          <div className="p-6 h-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl space-y-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Campaign Setup
            </h3>

            {stepTitles.map((title, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 py-2.5 border-t border-gray-200 dark:border-gray-700 first:border-t-0"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300
                    ${
                      currentStep === index + 1
                        ? "bg-teal-500 border-teal-600 text-white scale-105"
                        : currentStep > index + 1
                        ? "bg-green-500 border-green-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                    }`}
                >
                  {currentStep > index + 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      currentStep === index + 1
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Step {index + 1}
                  </p>
                  <p
                    className={`text-xs ${
                      currentStep === index + 1
                        ? "text-teal-500 dark:text-teal-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-grow order-first md:order-last min-w-0 max-w-3xl relative flex flex-col h-[calc(100vh-150px)]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-grow h-full"
          >
            <div className="flex-grow overflow-y-auto pr-2">
              {currentStep === 1 && (
                <Step1Form
                  data={data}
                  setData={setData}
                  categories={categories}
                  setCategories={setCategories}
                />
              )}
              {currentStep === 2 && <Step2Form data={data} setData={setData} />}
              {currentStep === 3 && <Step3Form data={data} setData={setData} />}
              {currentStep === 4 && (
                <Step4Form
                  data={data}
                  setData={setData}
                  error={error}
                  createCampaignHash={createCampaignHash}
                  isCreateCampaignConfirmed={isCreateCampaignConfirmed}
                />
              )}

              <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="py-2.5 px-4 md:px-6 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="md:inline">Back</span>
                      </button>
                    )}
                  </div>

                  <div className="block md:hidden">
                    <CampaignProgressIndicator
                      currentStep={currentStep}
                      totalSteps={totalSteps}
                    />
                  </div>

                  <div>
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="py-2.5 px-4 md:px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <span className="md:inline">Continue</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isButtonDisabled}
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentStep === totalSteps) {
                            handleSubmit(e);
                          }
                        }}
                        className="py-2.5 px-4 md:px-6 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        {getButtonText()}
                        {!isSubmitting && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default createAd;
