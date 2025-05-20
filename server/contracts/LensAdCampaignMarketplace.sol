// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./NonAbstractLensAdCampaign.sol";

/**
 * @title LensAdCampaignMarketplace
 * @dev A concrete implementation of the NonAbstractLensAdCampaignMarketplace
 */
contract LensAdCampaignMarketplace is NonAbstractLensAdCampaignMarketplace {
    /**
     * @dev Constructor initializes the contract with the payment token
     * @param _paymentToken Address of the ERC20 token used for payments
     * @param _feeCollector Address where platform fees will be sent
     * @param _graphAddress Address of the social graph contract for follower counts
     * @param _actionHub Address of the ActionHub contract
     */
    constructor(
        address _paymentToken,
        address _feeCollector,
        address _graphAddress,
        address _actionHub
    ) NonAbstractLensAdCampaignMarketplace(_paymentToken, _feeCollector, _graphAddress, _actionHub) {
        // No additional initialization needed
    }
}
