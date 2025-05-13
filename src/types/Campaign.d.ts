import { TPost } from "./post";
import { User } from "./User";

export type TCondition = {
  condition: string;
  isActive: boolean;
};

export type TEngagementMetrics = {
  totalImpressions: number;
  totalClicks: number;
  totalShares: number;
  averageEngagementRate: number;
};

export type TCampaignHeader = {
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  coverPicture: string;
  creator: User;
  createdAt?: string;
};

export type TCampaignBody = {
  targetAudience: TCondition[];
  Post: TPost[];
  influencers: User[];
  engagementMetrics: TEngagementMetrics;
};

export type TCampaign = {
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  coverPicture: string;
  creator: User;
  location: string;
  categories: string[];
  influencers: User[];
  targetAudience: TCondition[];
  posts: TPost[];
  engagementMetrics: TEngagementMetrics;
};
