import { abi } from "./abi";
import { contractAddress } from "./addresses";

export const CONTRACT_ADDRESS = contractAddress;
export const LENS_AD_CAMPAIGN_ABI = abi;

export const accountABI = [
  {
    name: "executeTransaction",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const lensAdCampaignConfig = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: LENS_AD_CAMPAIGN_ABI,
} as const;

// Enum types from the contract
export enum CampaignStatus {
  PENDING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

export enum ActionType {
  NONE = 0,
  MIRROR = 1,
  COMMENT = 2,
  QUOTE = 3,
}
