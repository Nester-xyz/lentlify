// Hearts/likes counter type
export type Hearts = number;

// Comment type for post comments
export type Comment = {
  id: string;
  author: User;
  content: string;
  hearts: Hearts;
  createdAt: string; // ISO date string
  replies?: Comment[];
};

// Collection of comments
export type Comments = Comment[];

// Share type
export type Share = {
  id: string;
  sharedBy: User;
  sharedAt: string; // ISO date string
  additionalText?: string;
};

// Collection of shares
export type Shares = Share[];

// Media type for different kinds of attachments
export type Media = {
  id: string;
  url: string;
  type: "image" | "video" | "gif"; // Media type
  alt?: string; // Accessibility text
  width?: number;
  height?: number;
};

// Post type representing a complete post
export type TPost = {
  id: string;
  author: User;
  text: string;
  media?: Media[];
  hearts: Hearts;
  comments: Comments;
  shares: Shares;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  tags?: string[]; // Hashtags or mentions
  isRepost?: boolean;
  originalPost?: Post; // Reference to original post if this is a repost
};

// Timeline or feed of posts
export type Feed = {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string; // For pagination
};
