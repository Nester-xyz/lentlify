export interface CampaignGroupData {
  id: number;
  uri: string;
  owner: string;
  metadata?: {
    name: string;
    description: string;
    coverPhoto?: string;
    profilePhoto?: string;
  };
  campaigns: CampaignData[];
}

export interface CampaignData {
  id: number;
  postId: string;
  sellerAddress: string;
  amountPool: bigint;
  rewardAmount: bigint;
  actionType: number;
  minFollowersRequired: number;
  availableSlots: number;
  claimedSlots: number;
  adDisplayTimePeriod: {
    startTime: bigint;
    endTime: bigint;
  };
  groveContentURI: string;
  contentHash: string;
  status: number;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface CampaignContract {
  postId: string;
  sellerAddress: string;
  amountPool: bigint;
  rewardAmount: bigint;
  actionType: number;
  minFollowersRequired: number;
  availableSlots: number;
  claimedSlots: number;
  adDisplayTimePeriod: {
    startTime: bigint;
    endTime: bigint;
  };
  groveContentURI: string;
  contentHash: string;
  status: number;
}

export interface CampaignGroupContract {
  groupURI: string;
  owner: string;
  postCampaignIds: bigint[];
}
