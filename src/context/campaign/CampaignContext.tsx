import { createContext, useContext } from "react";
import type { CampaignContextType } from "@/types/campaign";

export const CampaignContext = createContext<CampaignContextType | undefined>(
  undefined
);

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error(
      "useCampaignContext must be used within a CampaignProvider"
    );
  }
  return context;
};
