# Reshare: Lens Protocol Ad Campaign Marketplace

## Overview

Reshare is a decentralized advertising platform built on top of the Lens Protocol that enables content creators and advertisers to create and manage ad campaigns. The system facilitates interactions between advertisers (sellers) who want to promote their content and influencers who can amplify that content through various social actions like mirroring, commenting, and quoting posts on the Lens Protocol.

## Contract Architecture

The contract system consists of the following main components:

1. **LensAdCampaignMarketplace**: The main contract that users interact with, inheriting all functionality from NonAbstractLensAdCampaignMarketplace.
2. **NonAbstractLensAdCampaignMarketplace**: The core implementation contract containing all the business logic.
3. **LensAdCampaignTypes**: A library of type definitions used throughout the system.

## Key Features

### For Advertisers (Sellers)

- Create ad campaigns tied to specific Lens Protocol posts
- Set campaign parameters including:
  - Budget allocation
  - Reward amounts for influencers
  - Campaign duration
  - Minimum follower requirements
  - Available slots for different action types
- Group campaigns for better organization
- Extend campaign duration
- Cancel campaigns and receive refunds for unused funds
- Update campaign content

### For Influencers

- Participate in campaigns by performing social actions (mirror, comment, quote)
- Claim rewards after campaign completion
- Requirements verification (e.g., minimum follower count)

### For Platform Administrators

- Set and update platform fees
- Collect platform fees
- Update fee collector address

## Contract Details

### LensAdCampaignMarketplace

```solidity
contract LensAdCampaignMarketplace is NonAbstractLensAdCampaignMarketplace
```

This is the main contract that users interact with. It inherits all functionality from NonAbstractLensAdCampaignMarketplace and doesn't add any additional functionality.

#### Constructor

```solidity
constructor(
    address _paymentToken,
    address _feeCollector,
    address _graphAddress,
    address _actionHub
) NonAbstractLensAdCampaignMarketplace(_paymentToken, _feeCollector, _graphAddress, _actionHub)
```

- `_paymentToken`: Address of the ERC20 token used for payments
- `_feeCollector`: Address where platform fees will be sent
- `_graphAddress`: Address of the social graph contract for follower counts
- `_actionHub`: Address of the ActionHub contract for Lens Protocol actions

### NonAbstractLensAdCampaignMarketplace

This contract contains all the core business logic for the ad campaign marketplace. It inherits from:
- `Ownable`: For access control
- `ReentrancyGuard`: For protection against reentrancy attacks
- `BaseAction`: For integration with Lens Protocol's action system

#### State Variables

- `paymentToken`: ERC20 token used for payments
- `platformFeePercentage`: Platform fee percentage in basis points (default: 5%)
- `feeCollector`: Address where platform fees are sent
- `totalFeesCollected`: Total fees collected and available for claiming
- `campaignCounter`: Counter for generating unique campaign IDs
- `graph`: Reference to the social graph contract for follower count checks
- `groupCounter`: Counter for generating unique group IDs

#### Key Mappings

- `campaigns`: Maps campaign ID to campaign data
- `sellerCampaigns`: Maps seller address to their campaign IDs
- `campaignInfluencerActions`: Maps campaign ID and influencer address to their actions
- `hasPerformedAction`: Tracks if an influencer has performed a specific action on a campaign
- `hasParticipated`: Tracks campaign participation
- `hasClaimedReward`: Tracks reward claims
- `campaignGroups`: Maps group ID to campaign group data
- `sellerCampaignGroups`: Maps seller address to their group IDs

#### Lens Protocol Integration

The contract implements the Lens Protocol's action system through the following functions:

- `configure`: Sets up the action for a post
- `execute`: Executes the action when triggered by a user
- `setDisabled`: Disables the action for a post

#### Core Functions

1. **Campaign Creation and Management**

   - `createCampaign`: Creates a new ad campaign
   - `updateCampaignStatus`: Updates the status of a campaign
   - `updateCampaignSlots`: Updates the available slots for a campaign
   - `updateCampaignPrices`: Updates the reward amount for a campaign
   - `extendCampaignTime`: Extends the duration of a campaign
   - `updateCampaignContent`: Updates the content of a campaign
   - `createCampaignGroup`: Creates a new campaign group

2. **Influencer Participation**

   - `_execute`: Handles influencer participation in campaigns (called through Lens Protocol)
   - `claimReward`: Allows influencers to claim rewards after campaign completion

3. **Financial Operations**

   - `refundDeposits`: Refunds unused deposits to the seller
   - `refundDisplayFee`: Refunds unused display fees to the seller
   - `collectFees`: Allows the fee collector to collect platform fees

4. **Administrative Functions**

   - `updatePlatformFee`: Updates the platform fee percentage
   - `updateFeeCollector`: Updates the fee collector address

## Data Structures

### Campaign Status

```solidity
enum CampaignStatus {
    PENDING,
    ACTIVE,
    COMPLETED,
    CANCELLED
}
```

### Action Types

```solidity
enum ActionType {
    NONE,
    MIRROR,
    COMMENT,
    QUOTE
}
```

### Ad Campaign

```solidity
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
```

### Campaign Group

```solidity
struct CampaignGroup {
    string groupURI;
    address owner;
    uint256[] postCampaignIds;
}
```

### Influencer Action

```solidity
struct InfluencerAction {
    address influencerAddress;
    ActionType action;
    uint256 timestamp;
    bool paid;
}
```

## Events

The contract emits various events to track important state changes:

- `CampaignCreated`: When a new campaign is created
- `CampaignUpdated`: When a campaign's status is updated
- `CampaignSlotsUpdated`: When a campaign's slots are updated
- `CampaignPricesUpdated`: When a campaign's prices are updated
- `CampaignTimeExtended`: When a campaign's duration is extended
- `InfluencerParticipated`: When an influencer participates in a campaign
- `RewardPaid`: When a reward is paid to an influencer
- `DepositsRefunded`: When deposits are refunded to a seller
- `DisplayFeeRefunded`: When display fees are refunded to a seller
- `PlatformFeeUpdated`: When the platform fee is updated
- `FeeCollectorUpdated`: When the fee collector address is updated
- `CampaignContentUpdated`: When a campaign's content is updated
- `CampaignGroupCreated`: When a new campaign group is created
- `FeesCollected`: When platform fees are collected

## Workflow

1. **Campaign Creation**:
   - Advertiser creates a campaign with specific parameters
   - Funds are deposited into the contract

2. **Campaign Activation**:
   - Advertiser activates the campaign
   - Campaign becomes visible to potential influencers

3. **Influencer Participation**:
   - Influencers perform actions on the campaign (mirror, comment, quote)
   - Actions are recorded in the contract

4. **Reward Claiming**:
   - After the campaign ends, influencers can claim their rewards
   - Rewards are distributed based on the actions performed

5. **Campaign Completion**:
   - Advertiser can refund unused deposits and display fees
   - Platform fees are collected by the fee collector

## Deployment Information

The contract has been deployed to the Lens Testnet with the following parameters:

- **Contract Address**: 0x0AA71328BA4BA1D3Ff904202Da4fF9fBa72Ce95D
- **Payment Token**: 0x000000000000000000000000000000000000800A
- **Fee Collector**: 0xb91342A1b06ce2fbe6aF112063c4544856b3A539
- **Graph Address**: 0x4d97287FF1A0e030cA4604EcDa9be355dd8A8BaC
- **Action Hub**: 0x4A92a97Ff3a3604410945ae8CA25df4fBB2fDC11

## Security Considerations

The contract implements several security measures:

1. **ReentrancyGuard**: Protects against reentrancy attacks
2. **Ownership Control**: Administrative functions are restricted to the contract owner
3. **Validation Checks**: Extensive validation to ensure proper operation
4. **Time-based Restrictions**: Actions are restricted based on campaign timelines

## Integration with Frontend

To interact with the contract from a frontend application, you'll need:

1. The contract ABI (available in the artifacts after compilation)
2. The deployed contract address
3. A Web3 provider to connect to the blockchain

## Conclusion

The Reshare contract system provides a robust platform for creating and managing ad campaigns on the Lens Protocol. It enables advertisers to promote their content and influencers to earn rewards for amplifying that content, all within a decentralized and transparent ecosystem.
