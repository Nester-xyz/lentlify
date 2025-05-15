// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MockContract
 * @dev A simple mock contract that allows for mocking function calls and return values
 * Used for testing the LensAdCampaignMarketplace contract
 */
contract MockContract {
    mapping(bytes4 => bytes) public mockResponses;
    mapping(bytes4 => bool) public mockExists;

    /**
     * @dev Mock a function with a specific return value
     * @param selector Function selector to mock
     * @param response Encoded response to return
     */
    function mockFunction(bytes4 selector, bytes calldata response) external {
        mockResponses[selector] = response;
        mockExists[selector] = true;
    }

    /**
     * @dev Fallback function that returns mocked responses
     */
    fallback(bytes calldata input) external returns (bytes memory) {
        bytes4 selector = bytes4(input);
        require(mockExists[selector], "Mock not found");
        return mockResponses[selector];
    }

    /**
     * @dev Helper function to mock getFollowersCount
     * @param count Follower count to return
     */
    function mock_getFollowersCount(uint256 count) external {
        bytes4 selector = bytes4(keccak256("getFollowersCount(address)"));
        mockResponses[selector] = abi.encode(count);
        mockExists[selector] = true;
    }

    /**
     * @dev Helper function to mock postExists
     * @param exists Whether the post exists
     */
    function mock_postExists(bool exists) external {
        bytes4 selector = bytes4(keccak256("postExists(uint256)"));
        mockResponses[selector] = abi.encode(exists);
        mockExists[selector] = true;
    }

    /**
     * @dev Helper function to mock registerAction
     * @param actionId Action ID to return
     */
    function mock_registerAction(uint256 actionId) external {
        bytes4 selector = bytes4(keccak256("registerAction(address)"));
        mockResponses[selector] = abi.encode(actionId);
        mockExists[selector] = true;
    }

    /**
     * @dev Helper function to mock getActionId
     * @param actionId Action ID to return
     */
    function mock_getActionId(uint256 actionId) external {
        bytes4 selector = bytes4(keccak256("getActionId(address)"));
        mockResponses[selector] = abi.encode(actionId);
        mockExists[selector] = true;
    }

    /**
     * @dev Simplified mock method for common functions
     * @param functionName Name of the function to mock
     * @param returnValue Value to return (works for uint256, bool, address)
     */
    function mock(string calldata functionName, uint256 returnValue) external {
        bytes4 selector = bytes4(keccak256(bytes(functionName)));
        mockResponses[selector] = abi.encode(returnValue);
        mockExists[selector] = true;
    }

    /**
     * @dev Simplified mock method for boolean return values
     * @param functionName Name of the function to mock
     * @param returnValue Boolean value to return
     */
    function mock(string calldata functionName, bool returnValue) external {
        bytes4 selector = bytes4(keccak256(bytes(functionName)));
        mockResponses[selector] = abi.encode(returnValue);
        mockExists[selector] = true;
    }

    /**
     * @dev Simplified mock method for address return values
     * @param functionName Name of the function to mock
     * @param returnValue Address value to return
     */
    function mock(string calldata functionName, address returnValue) external {
        bytes4 selector = bytes4(keccak256(bytes(functionName)));
        mockResponses[selector] = abi.encode(returnValue);
        mockExists[selector] = true;
    }
}
