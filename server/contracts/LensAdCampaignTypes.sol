// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title LensAdCampaignTypes
 * @dev Type definitions for the Lens Ad Campaign Marketplace
 */

// Campaign status enum
enum CampaignStatus {
    PENDING,
    ACTIVE,
    COMPLETED,
    CANCELLED
}

// Action types enum
enum ActionType {
    NONE,
    MIRROR,
    COMMENT,
    QUOTE
}

// Deprecated - keeping for backward compatibility
struct RewardPerAction {
    uint256 mirror;
    uint256 comment;
    uint256 quote;
}

// Deprecated - keeping for backward compatibility
struct AvailableSlots {
    uint256 mirror;
    uint256 comment;
    uint256 quote;
}

// Deprecated - keeping for backward compatibility
struct ClaimedSlots {
    uint256 mirror;
    uint256 comment;
    uint256 quote;
}

// Ad display time period
struct AdDisplayTimePeriod {
    uint256 startTime; // UNIX timestamp
    uint256 endTime;   // UNIX timestamp
}

// Time-based display fee structure
struct TimeBasedDisplayFee {
    uint256 hourly;
    uint256 daily;
    uint256 weekly;
}

// Target audience criteria
struct TargetAudience {
    string[] country;
    string[] interests;
    string[] language;
}

// Influencer action record
struct InfluencerAction {
    address influencerAddress;
    ActionType action;
    uint256 timestamp;
    bool paid;
}

// New grouping mechanism
/// @notice Represents a campaign group by URI with owner and post IDs
struct CampaignGroup {
    string groupURI;
    address owner;
    uint256[] postCampaignIds;
}

// Ad Campaign structure
struct AdCampaign {
    // Core Identifiers
    string postId;
    address sellerAddress;

    // Reward Mechanics
    uint256 amountPool;
    uint256 depositsToPayInfluencers;
    uint256 paidDisplayFee;
    uint256 rewardAmount;      // Single reward amount per action
    ActionType actionType;     // Type of action this campaign supports

    // Participation Rules
    uint256 minFollowersRequired;
    uint256 availableSlots;    // Total slots available
    uint256 claimedSlots;      // Total slots claimed

    // Ad Duration
    AdDisplayTimePeriod adDisplayTimePeriod;
    TimeBasedDisplayFee timeBasedDisplayWiseFeePercent;

    // Reward Claiming
    uint256 rewardClaimableTime; // Timestamp when influencers can claim rewards
    uint256 rewardTimeEnd; // Timestamp when reward period ends

    // Storage
    string groveContentURI;
    string contentHash;
    uint256 version;

    // Status
    CampaignStatus status;
    
    // Target Audience (optional)
    TargetAudience targetAudience;
}

struct KeyValue {
    bytes32 key;
    bytes value;
}
    