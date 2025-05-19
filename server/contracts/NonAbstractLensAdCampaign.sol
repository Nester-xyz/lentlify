// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LensAdCampaignTypes.sol";
import {IPostAction} from "../lens-v3/contracts/extensions/actions/ActionHub.sol";
import {IFeed} from "../lens-v3/contracts/core/interfaces/IFeed.sol";
import {BaseAction} from "../lens-v3/contracts/actions/base/BaseAction.sol";

interface IGraphContract {
    function getFollowersCount(address account) external view returns (uint256);
}

/**
 * @title NonAbstractLensAdCampaignMarketplace
 * @dev A non-abstract marketplace for ad campaigns on Lens Protocol
 */
abstract contract NonAbstractLensAdCampaignMarketplace is Ownable, ReentrancyGuard, BaseAction {
    // Precomputed parameter key hashes for Lens Protocol actions
    /// @custom:keccak lens.param.actionType
    bytes32 constant PARAM__ACTION_TYPE = 0x76bdfe37bb25407dd7c85422aa8c88fc4fe4947dbe72fa560dfbafea54cabf31;
    /// @custom:keccak lens.param.contentHash
    bytes32 constant PARAM__CONTENT_HASH = 0x41632c80ef313ad4b21fec779c2b58ac905e12a33474c01a7c88015aa70e0d83;
    // Token used for payments (GRASS)
    IERC20 public paymentToken;
    
    // Platform fee percentage (basis points, 100 = 1%)
    uint16 public platformFeePercentage = 500; // 5% default on each slots
    
    // Fee distribution address
    address public feeCollector;
    
    // Total fees collected and available for claiming
    uint256 public totalFeesCollected;
    
    // Campaign counter for generating unique IDs
    uint256 private campaignCounter = 0;
    
    // Reference to the social graph contract for follower count checks
    IGraphContract public immutable graph;
    
    // Minimum followers required for posting in campaigns
    mapping(address feed => mapping(uint256 postId => mapping(bytes32 configSalt => uint256 minFollowers))) internal _minFollowersRequired;
    
    // Mapping from campaign ID to campaign data
    mapping(uint256 => AdCampaign) public campaigns;
    
    // Mapping from seller to their campaign IDs
    mapping(address => uint256[]) public sellerCampaigns;
    
    // Mapping from campaign ID to influencer actions
    mapping(uint256 => mapping(address => InfluencerAction[])) public campaignInfluencerActions;
    
    // Mapping to track if an influencer has performed a specific action on a campaign
    mapping(uint256 => mapping(address => mapping(ActionType => bool))) public hasPerformedAction;
    
    // Mapping of campaign participation and reward claim
    mapping(uint256 => mapping(address => bool)) public hasParticipated;
    mapping(uint256 => mapping(address => bool)) public hasClaimedReward;

    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed seller, string postId);
    event CampaignUpdated(uint256 indexed campaignId, CampaignStatus status);
    event CampaignSlotsUpdated(uint256 indexed campaignId, uint256 likeSlotsAdded, uint256 commentSlotsAdded, uint256 quoteSlotsAdded);
    event CampaignPricesUpdated(uint256 indexed campaignId, uint256 price);
    event CampaignTimeExtended(uint256 indexed campaignId, uint256 newEndTime, uint256 additionalFee);
    event InfluencerParticipated(uint256 indexed campaignId, string contentHashSubmitted, string postString, uint256 indexed postId, address indexed influencer, ActionType actionType);
    event RewardPaid(uint256 indexed campaignId, address indexed influencer, uint256 amount);
    event DepositsRefunded(uint256 indexed campaignId, address indexed seller, uint256 amount);
    event DisplayFeeRefunded(uint256 indexed campaignId, address indexed seller, uint256 amount);
    event PlatformFeeUpdated(uint16 newFee);
    event FeeCollectorUpdated(address newCollector);
    event CampaignContentUpdated(uint256 indexed campaignId, string newGroveContentURI, string newContentHash);
    event CampaignGroupCreated(uint256 indexed groupId, address indexed owner, string groupURI);
    event FeesCollected(address indexed collector, uint256 amount);
    
    // Modifiers
    modifier rewardTimeActive(uint256 _campaignId) {
        AdCampaign storage campaign = campaigns[_campaignId];
        
        // Verify that the ad display period has ended
        require(block.timestamp >= campaign.adDisplayTimePeriod.endTime, "Ad display period not yet ended");
        require(block.timestamp >= campaign.rewardClaimableTime, "Time to be spent for reward claim not ended");
        
        // Verify that the user has participated in the campaign
        require(hasParticipated[_campaignId][msg.sender], "User has not participated");
        
        // Verify the user has performed an action in this campaign
        require(campaignInfluencerActions[_campaignId][msg.sender].length > 0, "No actions found for user");
        _;
    }
    
    // Campaign grouping
    uint256 private groupCounter = 1;
    mapping(uint256 => CampaignGroup) public campaignGroups;
    // Track all groups created by each owner
    mapping(address => uint256[]) public sellerCampaignGroups;

    /**
     * @dev Constructor initializes the contract with the payment token
     * @param _paymentToken Address of the ERC20 token used for payments
     * @param _feeCollector Address where platform fees will be sent
     * @param _graphAddress Address of the social graph contract for follower counts (optional)
     * @param _actionHub Address of the ActionHub contract (optional)
     */
    constructor(
        address _paymentToken,
        address _feeCollector,
        address _graphAddress,
        address _actionHub
    ) BaseAction(_actionHub != address(0) ? _actionHub : address(1)) {
        // Constructor implementation
        paymentToken = IERC20(_paymentToken);
        feeCollector = _feeCollector;
        graph = _graphAddress != address(0) ? IGraphContract(_graphAddress) : IGraphContract(address(0));
    }

    // Implementation of IPostAction interface
    function configure(address originalMsgSender, address feed, uint256 postId, KeyValue[] calldata params)
        external virtual
        onlyActionHub
        returns (bytes memory)
    {
        return _configure(originalMsgSender, feed, postId, params);
    }

    function execute(address originalMsgSender, address feed, uint256 postId, KeyValue[] calldata params)
        external virtual
        onlyActionHub
        returns (bytes memory)
    {
        return _execute(originalMsgSender, feed, postId, params);
    }

    function setDisabled(
        address originalMsgSender,
        address feed,
        uint256 postId,
        bool isDisabled,
        KeyValue[] calldata params
    ) external virtual onlyActionHub returns (bytes memory) {
        return _setDisabled(originalMsgSender, feed, postId, isDisabled, params);
    }

    // Internal implementations
    function _configure(
        address originalMsgSender,
        address, /* feed */
        uint256, /* postId */
        KeyValue[] calldata /* params */
    ) internal returns (bytes memory) {
        return _configureUniversalAction(originalMsgSender);
    }

    function _setDisabled(
        address, /* originalMsgSender */
        address, /* feed */
        uint256, /* postId */
        bool isDisabled,
        KeyValue[] calldata /* params */
    ) internal returns (bytes memory) {
        // Custom implementation for disabling actions
        return abi.encode(isDisabled);
    }

    // Implementation of the execute method
    function _execute(address originalMsgSender, address feed, uint256 postId, KeyValue[] calldata params) internal returns (bytes memory) {
        // Decode actionType, contentHash, campaignId, and postString from params
        ActionType actionType = ActionType.NONE;
        string memory contentHashSubmitted = "";
        string memory postString = "";
        bool actionTypeFound = false;
        uint256 campaignId = postId; // Default to postId if campaignId not provided
        
        // Parse parameters from the Lens Protocol action using predefined constants
        for (uint256 i = 0; i < params.length; i++) {
            // Look for actionType parameter
            if (params[i].key == PARAM__ACTION_TYPE) {
                actionTypeFound = true;
                actionType = ActionType(uint8(abi.decode(params[i].value, (uint8))));
            } 
            // Look for contentHash parameter (for quote posts)
            else if (params[i].key == PARAM__CONTENT_HASH) {
                contentHashSubmitted = abi.decode(params[i].value, (string));
            }
            // Look for campaignId parameter
            else if (params[i].key == keccak256("lens.param.campaignId")) {
                campaignId = abi.decode(params[i].value, (uint256));
            }
            // Look for postString parameter
            else if (params[i].key == keccak256("lens.param.postString")) {
                postString = abi.decode(params[i].value, (string));
            }
        }
        // Require that we found an action type
        require(actionTypeFound, "Action type not found in params");
        
        // Process campaign participation directly
        AdCampaign storage campaign = campaigns[postId];
        
        // Verify campaign period and slot availability
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(block.timestamp >= campaign.adDisplayTimePeriod.startTime, "Campaign not started");
        require(block.timestamp <= campaign.adDisplayTimePeriod.endTime, "Campaign ended");
        
        // Check if the campaign has minimum followers requirement
        if (campaign.minFollowersRequired > 0) {
            // Query current follower count
            uint256 currentFollowers = graph.getFollowersCount(originalMsgSender);
            
            // Reject if not enough followers
            require(currentFollowers >= campaign.minFollowersRequired, "Insufficient followers");
        }
        
        // Validate slot availability and action type
        require(actionType == campaign.actionType, "Incorrect action type for this campaign");
        require(campaign.claimedSlots < campaign.availableSlots, "No slots available");
        
        // Verify allowed content if specified (for quotes)
        if (actionType == ActionType.QUOTE || actionType == ActionType.COMMENT && bytes(campaign.contentHash).length > 0) {
            require(keccak256(bytes(contentHashSubmitted)) == keccak256(bytes(campaign.contentHash)), "Content not authorized");
        }
        
        // Verify action not already performed
        require(!hasPerformedAction[postId][originalMsgSender][actionType], "Action already performed");
        
        // Record action
        campaignInfluencerActions[postId][originalMsgSender].push(InfluencerAction({
            influencerAddress: originalMsgSender,
            action: actionType,
            timestamp: block.timestamp,
            paid: false,
            postString: postString
        }));
        hasPerformedAction[postId][originalMsgSender][actionType] = true;
        
        // Mark user as participated in this campaign
        hasParticipated[postId][originalMsgSender] = true;
        
        // Add to participants list if not already added
        if (!isAddedToParticipantsList[postId][originalMsgSender]) {
            campaignParticipants[postId].push(originalMsgSender);
            isAddedToParticipantsList[postId][originalMsgSender] = true;
        }
        
        // Deduct a slot
        campaign.claimedSlots++;

        // Only emit an event with the parsed data for debugging
        emit InfluencerParticipated(campaignId, contentHashSubmitted, postString, postId, originalMsgSender, actionType);
        
        // Return the action type as bytes for the ActionHub
        return abi.encode(actionType);
    }

    /**
     * @dev Direct interface for campaign participation without KeyValue parsing
     * @param feed Address of the Lens Protocol feed
     * @param actionType Type of action (MIRROR, COMMENT, or QUOTE)
     * @param contentHash Content hash for verification (required for QUOTE actions)
     * @param campaignId Campaign ID (defaults to postId if not provided)
     * @param postString Additional post data
     * @return bytes Encoded action type
     */
    function executeDirectAction(
        address feed,
        ActionType actionType,
        string memory contentHash,
        uint256 campaignId,
        string memory postString
    ) external returns (bytes memory) {
        // Process campaign participation directly
        AdCampaign storage campaign = campaigns[campaignId];
        
        // Verify campaign period and slot availability
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(block.timestamp >= campaign.adDisplayTimePeriod.startTime, "Campaign not started");
        require(block.timestamp <= campaign.adDisplayTimePeriod.endTime, "Campaign ended");
        
        // Check if the campaign has minimum followers requirement
        if (campaign.minFollowersRequired > 0) {
            // Query current follower count
            uint256 currentFollowers = graph.getFollowersCount(msg.sender);
            
            // Reject if not enough followers
            require(currentFollowers >= campaign.minFollowersRequired, "Insufficient followers");
        }
        
        // Validate slot availability and action type
        require(actionType == campaign.actionType, "Incorrect action type for this campaign");
        require(campaign.claimedSlots < campaign.availableSlots, "No slots available");
        
        // Verify allowed content if specified (for quotes)
        if (actionType == ActionType.QUOTE || actionType == ActionType.COMMENT && bytes(campaign.contentHash).length > 0) {
            require(keccak256(bytes(contentHash)) == keccak256(bytes(campaign.contentHash)), "Content not authorized");
        }
        
        // Verify action not already performed
        require(!hasPerformedAction[campaignId][msg.sender][actionType], "Action already performed");
        
        // Record action
        campaignInfluencerActions[campaignId][msg.sender].push(InfluencerAction({
            influencerAddress: msg.sender,
            action: actionType,
            timestamp: block.timestamp,
            paid: false,
            postString: postString
        }));
        hasPerformedAction[campaignId][msg.sender][actionType] = true;
        
        // Mark user as participated in this campaign
        hasParticipated[campaignId][msg.sender] = true;
        
        // Add to participants list if not already added
        if (!isAddedToParticipantsList[campaignId][msg.sender]) {
            campaignParticipants[campaignId].push(msg.sender);
            isAddedToParticipantsList[campaignId][msg.sender] = true;
        }
        
        // Deduct a slot
        campaign.claimedSlots++;
        
        // Emit event for tracking
        emit InfluencerParticipated(campaignId, contentHash, postString, campaignId, msg.sender, actionType);
        
        // Return the action type as bytes for the ActionHub
        return abi.encode(actionType);
    }
    
    /**
     * @notice Create a new logical campaign group
     * @param _groupURI URI for the group
     * @return groupId Newly assigned group ID
     */
    function createCampaignGroup(string memory _groupURI) external returns (uint256 groupId) {
        require(bytes(_groupURI).length > 0, "Group URI cannot be empty");
        groupId = groupCounter++;
        campaignGroups[groupId] = CampaignGroup({
            groupURI: _groupURI,
            owner: msg.sender,
            postCampaignIds: new uint256[](0)
        });
        // Record group for owner
        sellerCampaignGroups[msg.sender].push(groupId);
        emit CampaignGroupCreated(groupId, msg.sender, _groupURI);
    }

    /**
     * @dev Create a new ad campaign
     * @param _groupId Optional parent group ID (0 for none)
     * @param _postId Lens protocol post ID
     * @param _actionType Type of action this campaign supports (MIRROR, COMMENT, or QUOTE)
     * @param _availableSlots Number of slots available for influencers
     * @param _adDisplayPeriod Start and end time for the ad campaign
     * @param _groveContentURI URI where the content is stored in Grove
     * @param _contentHash Hash of the content (optional for QUOTE actions)
     * @param _rewardClaimableTime When influencers can claim rewards
     * @param _minFollowersCount Minimum followers required to participate
     */
    function createAdCampaign(
        uint256 _groupId,
        string memory _postId,
        ActionType _actionType,
        uint256 _availableSlots,
        AdDisplayTimePeriod memory _adDisplayPeriod,
        string memory _groveContentURI,
        string memory _contentHash,
        uint256 _rewardClaimableTime,
        uint256 _minFollowersCount
    ) external payable nonReentrant {
        // Ensure group ownership if grouping
        if (_groupId != 0) {
            require(campaignGroups[_groupId].owner == msg.sender, "Not group owner");
        }
        
        // Basic validation
        require(bytes(_postId).length > 0, "Post ID cannot be empty");
        // Set start time to current block timestamp if it's not specified or in the past
        if (_adDisplayPeriod.startTime < block.timestamp) {
            _adDisplayPeriod.startTime = block.timestamp - 1 minutes;
        }
        require(_adDisplayPeriod.endTime > _adDisplayPeriod.startTime, "End time must be after start time");
        require(_rewardClaimableTime > _adDisplayPeriod.endTime, "Claim time must be after end time");
        require(bytes(_groveContentURI).length > 0, "Grove content URI cannot be empty");
        require(msg.value > 0, "Amount must be greater than 0");
        require(_availableSlots > 0, "Must have at least one slot");
        
        // Calculate fees: 10% for display fee, 90% for rewards
        uint256 displayFee = (msg.value * 10) / 100;
        uint256 totalRewards = msg.value - displayFee;
        
        // Calculate reward per action
        uint256 rewardPerAction = _availableSlots > 0 ? totalRewards / _availableSlots : 0;
        
        // Create new campaign
        uint256 campaignId = campaignCounter++;
        
        // Set up campaign with simplified parameters
        AdCampaign storage campaign = campaigns[campaignId];
        campaign.postId = _postId;
        campaign.sellerAddress = msg.sender;
        campaign.status = CampaignStatus.ACTIVE;
        campaign.adDisplayTimePeriod = _adDisplayPeriod;
        campaign.rewardClaimableTime = _rewardClaimableTime;
        campaign.rewardTimeEnd = _rewardClaimableTime + 30 days; // 30 days to claim rewards (expire time)
        campaign.groveContentURI = _groveContentURI;
        campaign.contentHash = _contentHash;
        campaign.version = 1;
        campaign.actionType = _actionType;
        campaign.availableSlots = _availableSlots;
        campaign.claimedSlots = 0;
        campaign.rewardAmount = rewardPerAction;
        campaign.amountPool = msg.value;
        campaign.depositsToPayInfluencers = totalRewards;
        campaign.paidDisplayFee = displayFee;
        campaign.minFollowersRequired = _minFollowersCount;
        
        // Add to seller's campaigns
        sellerCampaigns[msg.sender].push(campaignId);
        
        // Add to group if specified
        if (_groupId != 0) {
            campaignGroups[_groupId].postCampaignIds.push(campaignId);
        }
        
        // Collect platform fee
        uint256 platformFee = (displayFee * platformFeePercentage) / 10000;
        if (platformFee > 0) {
            totalFeesCollected += platformFee;
        }
        
        emit CampaignCreated(campaignId, msg.sender, _postId);
    }

    /**
     * @dev Update available slots for a campaign
     * @param _campaignId ID of the campaign
     * @param _additionalSlots Additional slots to add
     */
    function updateCampaignSlots(
        uint256 _campaignId,
        uint256 _additionalSlots
    ) external nonReentrant {
        AdCampaign storage campaign = campaigns[_campaignId];
        
        require(campaign.sellerAddress == msg.sender, "Not campaign owner");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign must be active to update slots");
        require(block.timestamp <= campaign.adDisplayTimePeriod.endTime, "Campaign display period has ended");
        
        // Calculate additional deposit needed
        uint256 additionalDeposit = _additionalSlots * campaign.rewardAmount;
                                   
        if (additionalDeposit > 0) {
            // Transfer additional tokens
            require(paymentToken.transferFrom(msg.sender, address(this), additionalDeposit), 
                    "Additional deposit transfer failed");
                    
            // Update campaign values
            campaign.amountPool += additionalDeposit;
            campaign.depositsToPayInfluencers += additionalDeposit;
            campaign.availableSlots += _additionalSlots;
            
            emit CampaignSlotsUpdated(_campaignId, _additionalSlots, 0, 0);
        }
    }
    
    /**
     * @notice Update campaign content and hash
     * @param _campaignId Campaign ID
     * @param _newGroveContentURI New content URI
     * @param _newContentHash New content hash
     */
    function updateCampaignContent(
        uint256 _campaignId,
        string memory _newGroveContentURI,
        string memory _newContentHash
    ) external {
        AdCampaign storage campaign = campaigns[_campaignId];
        require(campaign.sellerAddress == msg.sender, "Not campaign owner");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        
        campaign.groveContentURI = _newGroveContentURI;
        campaign.contentHash = _newContentHash;
        campaign.version += 1;
        
        emit CampaignContentUpdated(_campaignId, _newGroveContentURI, _newContentHash);
    }
    
    /**
     * @dev Update reward price for a campaign
     * @param _campaignId ID of the campaign
     * @param _newRewardPrice New reward price for actions
     */
    function updateCampaignPrice(
        uint256 _campaignId,
        uint256 _newRewardPrice
    ) external nonReentrant {
        AdCampaign storage campaign = campaigns[_campaignId];
        
        require(campaign.sellerAddress == msg.sender, "Not campaign owner");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign must be active");
        require(block.timestamp <= campaign.adDisplayTimePeriod.endTime, "Campaign display period has ended");
        
        // Calculate remaining unclaimed slots
        uint256 unclaimedSlots = campaign.availableSlots - campaign.claimedSlots;
        
        // Calculate current deposit needed for unclaimed slots
        uint256 currentDeposit = unclaimedSlots * campaign.rewardAmount;
        
        // Calculate new deposit needed
        uint256 newDeposit = unclaimedSlots * _newRewardPrice;
        
        // Update the price
        campaign.rewardAmount = _newRewardPrice;
        
        // Handle deposit changes
        if (newDeposit > currentDeposit) {
            // Additional deposit needed
            uint256 additionalDeposit = newDeposit - currentDeposit;
            require(paymentToken.transferFrom(msg.sender, address(this), additionalDeposit), 
                    "Additional deposit transfer failed");
            
            campaign.amountPool += additionalDeposit;
            campaign.depositsToPayInfluencers += additionalDeposit;
        } else if (currentDeposit > newDeposit) {
            // Refund excess deposit
            uint256 excessDeposit = currentDeposit - newDeposit;
            require(paymentToken.transfer(msg.sender, excessDeposit), "Refund transfer failed");
            
            campaign.amountPool -= excessDeposit;
            campaign.depositsToPayInfluencers -= excessDeposit;
        }
        
        emit CampaignPricesUpdated(_campaignId, _newRewardPrice);
    }
    
    /**
     * @notice Claim rewards after participation and during reward period
     * @param _campaignId Campaign ID
     * @param actionType Type of action to claim reward for
     */
    function claimReward(uint256 _campaignId, ActionType actionType, address feed) external nonReentrant rewardTimeActive(_campaignId) {
        AdCampaign storage campaign = campaigns[_campaignId];
        
        // Verify the post exists in Lens Feed contract using the feed parameter from _execute
        uint256 postIdAsUint;
        // Convert string postId to uint256
        try this.stringToUint(campaign.postId) returns (uint256 result) {
            postIdAsUint = result;
        } catch {
            revert("Invalid postId format");
        }
        require(IFeed(feed).postExists(postIdAsUint), "Post does not exist");
        require(!hasClaimedReward[_campaignId][msg.sender], "Reward already claimed");
        uint256 totalAmount = 0;

        // Check if the user has participated in the campaign
        require(hasParticipated[_campaignId][msg.sender], "User has not participated");
        
        // Check if the user has performed the campaign's action type
        if (hasPerformedAction[_campaignId][msg.sender][campaign.actionType]) {
            totalAmount = campaign.rewardAmount;
        }

        require(totalAmount > 0, "No rewards to claim");
        hasClaimedReward[_campaignId][msg.sender] = true;
        campaign.depositsToPayInfluencers -= totalAmount;
        
        require(paymentToken.transfer(msg.sender, totalAmount), "Reward transfer failed");
        emit RewardPaid(_campaignId, msg.sender, totalAmount);
    }

    /**
     * @dev Complete a campaign after its end time
     * @param _campaignId ID of the campaign to complete
     */
    function completeCampaign(uint256 _campaignId) external {
        AdCampaign storage campaign = campaigns[_campaignId];
        
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(block.timestamp > campaign.adDisplayTimePeriod.endTime, "Campaign not yet ended");
        
        // Refund remaining deposits to seller
        uint256 totalClaimedRewards = calculateClaimedRewards(_campaignId);
        uint256 refundAmount = campaign.depositsToPayInfluencers - totalClaimedRewards;
        
        if (refundAmount > 0) {
            require(paymentToken.transfer(campaign.sellerAddress, refundAmount), "Refund transfer failed");
            emit DepositsRefunded(_campaignId, campaign.sellerAddress, refundAmount);
        }
        
        campaign.status = CampaignStatus.COMPLETED;
        emit CampaignUpdated(_campaignId, CampaignStatus.COMPLETED);
    }
    
    /**
     * @dev Update platform fee percentage
     * @param _newFeePercentage New fee percentage in basis points (100 = 1%)
     */
    function updatePlatformFee(uint16 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 3000, "Fee too high"); // Max 30%
        platformFeePercentage = _newFeePercentage;
        emit PlatformFeeUpdated(_newFeePercentage);
    }
    
    /**
     * @dev Update fee collector address
     * @param _newCollector New fee collector address
     */
    function updateFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid fee collector address");
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(_newCollector);
    }
    
    /**
     * @dev Allows the fee collector to claim accumulated fees
     * @return amount The amount of fees claimed
     */
    function claimCollectedFees() external returns (uint256 amount) {
        require(msg.sender == feeCollector, "Only fee collector can claim");
        amount = totalFeesCollected;
        require(amount > 0, "No fees to claim");
        
        totalFeesCollected = 0;
        require(paymentToken.transfer(feeCollector, amount), "Fee transfer failed");
        
        emit FeesCollected(feeCollector, amount);
    }
    
    /**
     * @dev Get comprehensive campaign information
     */
    function getCampaignInfo(uint256 _campaignId) external view returns (
        string memory postId,
        address sellerAddress,
        uint256 depositsToPayInfluencers,
        uint256 startTime,
        uint256 endTime,
        uint256 minFollowersRequired,
        CampaignStatus status,
        string memory groveContentURI,
        string memory contentHash,
        uint256 version,
        uint256 availableLikeSlots,
        uint256 availableCommentSlots,
        uint256 availableQuoteSlots,
        uint256 claimedLikeSlots,
        uint256 claimedCommentSlots,
        uint256 claimedQuoteSlots,
        uint256 likeReward,
        uint256 commentReward,
        uint256 quoteReward
    ) {
        AdCampaign storage campaign = campaigns[_campaignId];
        
        uint256 unclaimedSlots = _calculateUnclaimedSlots(_campaignId);
        
        return (
            campaign.postId,
            campaign.sellerAddress,
            campaign.depositsToPayInfluencers,
            campaign.adDisplayTimePeriod.startTime,
            campaign.adDisplayTimePeriod.endTime,
            campaign.minFollowersRequired,
            campaign.status,
            campaign.groveContentURI,
            campaign.contentHash,
            campaign.version,
            unclaimedSlots,
            0,
            0,
            campaign.claimedSlots,
            0,
            0,
            campaign.rewardAmount,
            0,
            0
        );
    }

    /**
     * @dev Get reward time status with all relevant information
     */
    function getRewardTimeStatus(uint256 _campaignId) external view returns (
        bool isActive,
        uint256 timeUntilStart,
        uint256 timeUntilEnd,
        bool hasUserParticipated,
        bool hasUserClaimedReward
    ) {
        AdCampaign memory campaign = campaigns[_campaignId];
        
        isActive = (
            campaign.status == CampaignStatus.ACTIVE &&
            block.timestamp >= campaign.rewardClaimableTime &&
            block.timestamp <= campaign.rewardTimeEnd
        );
        
        timeUntilStart = block.timestamp < campaign.rewardClaimableTime
            ? campaign.rewardClaimableTime - block.timestamp
            : 0;
            
        timeUntilEnd = block.timestamp < campaign.rewardTimeEnd
            ? campaign.rewardTimeEnd - block.timestamp
            : 0;

        hasUserParticipated = hasParticipated[_campaignId][msg.sender];
        hasUserClaimedReward = hasClaimedReward[_campaignId][msg.sender];
    }

    /**
     * @dev Get all campaign IDs created by a seller
     */
    function getSellerCampaigns(address _seller) external view returns (uint256[] memory) {
        return sellerCampaigns[_seller];
    }
    
    /**
     * @dev Cancel an ongoing campaign before endTime, refund 80% of unfulfilled slot deposits
     */
    function cancelCampaign(uint256 _campaignId) external nonReentrant {
        AdCampaign storage campaign = campaigns[_campaignId];
        require(campaign.sellerAddress == msg.sender, "Not campaign owner");
        require(campaign.status == CampaignStatus.PENDING || campaign.status == CampaignStatus.ACTIVE, "Cannot cancel");
        require(block.timestamp < campaign.adDisplayTimePeriod.endTime, "Campaign ended");

        uint256 unclaimedSlots = _calculateUnclaimedSlots(_campaignId);
        uint256 totalUnclaimed = _calculateUnclaimedRewards(unclaimedSlots, campaign.rewardAmount);

        // Take 20% fee, refund 80%
        uint256 refundAmount = (totalUnclaimed * 80) / 100;
        uint256 feeAmount = totalUnclaimed - refundAmount;
        campaign.status = CampaignStatus.CANCELLED;

        // Add fee to total fees collected
        if (feeAmount > 0) {
            totalFeesCollected += feeAmount;
        }

        // Refund remaining amount to campaign owner
        if (refundAmount > 0) {
            require(paymentToken.transfer(msg.sender, refundAmount), "Refund failed");
            emit DepositsRefunded(_campaignId, msg.sender, refundAmount);
        }
    }

    /**
     * @dev Claim remaining unfulfilled slot deposits after campaign ends
     */
    function claimUnfulfilledSlots(uint256 _campaignId) external nonReentrant {
        AdCampaign storage campaign = campaigns[_campaignId];
        require(campaign.sellerAddress == msg.sender, "Not campaign owner");
        require(block.timestamp >= campaign.adDisplayTimePeriod.endTime, "Campaign not ended");
        require(campaign.status == CampaignStatus.ACTIVE, "Already claimed or cancelled");

        uint256 unclaimedSlots = _calculateUnclaimedSlots(_campaignId);
        uint256 totalUnclaimed = _calculateUnclaimedRewards(unclaimedSlots, campaign.rewardAmount);

        campaign.status = CampaignStatus.COMPLETED;
        if (totalUnclaimed > 0) {
            require(paymentToken.transfer(msg.sender, totalUnclaimed), "Claim failed");
            emit DepositsRefunded(_campaignId, msg.sender, totalUnclaimed);
        }
    }

    /**
     * @notice Get all post campaign IDs under a group
     * @param _groupId ID of the campaign group
     */
    function getGroupPosts(uint256 _groupId) external view returns (uint256[] memory) {
        return campaignGroups[_groupId].postCampaignIds;
    }

    /**
     * @notice Get all campaign group IDs created by a seller
     * @param _seller Address of the seller
     */
    function getSellerGroups(address _seller) external view returns (uint256[] memory) {
        return sellerCampaignGroups[_seller];
    }

    /**
     * @notice Get the total number of campaign groups created
     * @return The current campaign group count (next group ID to be assigned - 1)
     */
    function getCampaignGroupCount() external view returns (uint256) {
        return groupCounter - 1;
    }

    /**
     * @notice Get the total number of ad campaigns created
     * @return The current campaign ad count (next campaign ID to be assigned)
     */
    function getCampaignAdCount() external view returns (uint256) {
        return campaignCounter;
    }
    
    // Track participants for each campaign
    mapping(uint256 => address[]) private campaignParticipants;
    mapping(uint256 => mapping(address => bool)) private isAddedToParticipantsList;
    
    /**
     * @notice Get all participants for a specific campaign
     * @param _campaignId The ID of the campaign
     * @return An array of participant addresses
     */
    function getCampaignParticipantAddresses(uint256 _campaignId) external view returns (address[] memory) {
        return campaignParticipants[_campaignId];
    }
    
    /**
     * @notice Get the count of participants for a specific campaign
     * @param _campaignId The ID of the campaign
     * @return The number of unique participants
     */
    function getCampaignParticipantCount(uint256 _campaignId) external view returns (uint256) {
        return campaignParticipants[_campaignId].length;
    }
    
    /**
     * @notice Check if an address has participated in a campaign
     * @param _campaignId The ID of the campaign
     * @param _participant The address to check
     * @return True if the address has participated, false otherwise
     */
    function isParticipant(uint256 _campaignId, address _participant) external view returns (bool) {
        return hasParticipated[_campaignId][_participant];
    }

    // ===== UTILITY FUNCTIONS =====
    
    /**
     * @dev Helper function to convert a string to uint256
     * @param _str The string to convert
     * @return The converted uint256 value
     */
    function stringToUint(string memory _str) external pure returns (uint256) {
        bytes memory b = bytes(_str);
        uint256 result = 0;
        bool foundNumber = false;
        
        // Extract only numeric part from strings like "lens-post-123"
        for (uint i = 0; i < b.length; i++) {
            uint8 c = uint8(b[i]);
            if (c >= 48 && c <= 57) {
                // This is a digit, add it to our result
                result = result * 10 + (c - 48);
                foundNumber = true;
            }
            // Skip non-numeric characters
        }
        
        // Ensure we found at least one number
        if (!foundNumber) {
            revert("No numeric characters found in string");
        }
        
        return result;
    }

    /**
     * @dev Calculate total rewards claimed in a campaign
     */
    function calculateClaimedRewards(uint256 _campaignId) internal view returns (uint256) {
        AdCampaign storage campaign = campaigns[_campaignId];
        return campaign.claimedSlots * campaign.rewardAmount;
    }
    
    /**
     * @dev Internal function to calculate unclaimed slots
     */
    function _calculateUnclaimedSlots(uint256 _campaignId) internal view returns (uint256 unclaimed) {
        AdCampaign storage campaign = campaigns[_campaignId];
        
        unclaimed = campaign.availableSlots > campaign.claimedSlots
            ? campaign.availableSlots - campaign.claimedSlots
            : 0;
    }
    
    /**
     * @dev Internal function to calculate unclaimed rewards based on unclaimed slots
     */
    function _calculateUnclaimedRewards(uint256 _unclaimedSlots, uint256 _rewardAmount) internal pure returns (uint256) {
        return _unclaimedSlots * _rewardAmount;
    }
}
