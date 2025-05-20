export type CampaignGroupData = {
  groupURI: string;
  owner: string;
  postCampaignIds: bigint[] | number[];
  metadata?: any;
};

export type CampaignData = {
  campaignId: number;
  postId: string;
  sellerAddress: string;
  depositsToPayInfluencers: bigint;
  startTime: bigint;
  endTime: bigint;
  minFollowersRequired: bigint;
  status: number;
  groveContentURI: string;
  contentHash: string;
  version: bigint;
  availableLikeSlots: bigint;
  availableCommentSlots: bigint;
  availableQuoteSlots: bigint;
  claimedLikeSlots: bigint;
  claimedCommentSlots: bigint;
  claimedQuoteSlots: bigint;
  likeReward: bigint;
  commentReward: bigint;
  quoteReward: bigint;
  metadata?: any;
};

export type TEngagementMetrics = {
  totalImpressions: number;
  totalClicks: number;
  totalShares: number;
  averageEngagementRate: number;
};
