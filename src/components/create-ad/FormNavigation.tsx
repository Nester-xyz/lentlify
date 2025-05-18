import React from "react";

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  prevStep: () => void;
  nextStep: () => void;
  isButtonDisabled: boolean;
  getButtonText: () => string;
  // handleSubmit is implicitly part of the form, but if needed for direct call, add:
  // handleSubmit: (e: React.FormEvent) => void;
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  prevStep,
  nextStep,
  isButtonDisabled,
  getButtonText,
}) => {
  return (
    <div className="mt-8 flex justify-between items-center">
      <div>
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="py-2.5 px-6 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all"
          >
            Previous
          </button>
        )}
      </div>

      <div>
        {currentStep < totalSteps && (
          <button
            type="button"
            onClick={nextStep}
            className="py-2.5 px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all"
          >
            Next
          </button>
        )}
        {currentStep === totalSteps && (
          <button
            type="submit"
            disabled={isButtonDisabled}
            // onClick for submit is handled by the form's onSubmit
            className="py-2.5 px-6 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormNavigation;
