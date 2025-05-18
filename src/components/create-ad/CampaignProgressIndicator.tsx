import React from "react";

interface CampaignProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const CampaignProgressIndicator: React.FC<CampaignProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index + 1 === currentStep
                ? "bg-teal-500 w-4"
                : index + 1 < currentStep
                ? "bg-teal-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
        {currentStep} of {totalSteps}
      </span>
    </div>
  );
};

export default CampaignProgressIndicator;
