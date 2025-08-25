// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlackholeWallet
 * @dev A contract that allows users to burn tokens for reputation points
 * Proof of burn = Reputation system
 */
contract BlackholeWallet is ReentrancyGuard, Ownable {
    // Dead address for burning tokens
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Struct to track burn records
    struct BurnRecord {
        address user;
        address token;
        uint256 amount;
        uint256 timestamp;
        uint256 blockNumber;
        bytes32 txHash;
    }
    
    // Struct to track user reputation
    struct UserReputation {
        uint256 totalBurned; // Total value burned (in wei)
        uint256 burnCount; // Number of burn transactions
        uint256 reputation; // Calculated reputation score
        uint256 lastBurnTime; // Last burn timestamp
    }
    
    // Mappings
    mapping(address => UserReputation) public userReputations;
    mapping(address => mapping(address => uint256)) public userTokenBurns; // user => token => amount
    mapping(address => bool) public supportedTokens;
    
    // Arrays for tracking
    BurnRecord[] public burnHistory;
    address[] public allBurners;
    mapping(address => bool) public hasBurned;
    
    // Events
    event TokenBurned(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 newReputation,
        uint256 timestamp
    );
    
    event TokenAdded(address indexed token, string symbol);
    event TokenRemoved(address indexed token);
    
    // Reputation multipliers (can be adjusted by owner)
    uint256 public baseReputationMultiplier = 1;
    uint256 public frequencyBonus = 10; // 10% bonus for frequent burners
    uint256 public volumeBonus = 5; // 5% bonus for high volume
    
    constructor() {}
    
    /**
     * @dev Add a supported token for burning
     */
    function addSupportedToken(address _token, string memory _symbol) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        supportedTokens[_token] = true;
        emit TokenAdded(_token, _symbol);
    }
    
    /**
     * @dev Remove a supported token
     */
    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
        emit TokenRemoved(_token);
    }
    
    /**
     * @dev Burn tokens to gain reputation
     */
    function burnTokens(address _token, uint256 _amount) external nonReentrant {
        require(supportedTokens[_token], "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");
        
        IERC20 token = IERC20(_token);
        require(token.balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
        
        // Transfer tokens to burn address
        require(token.transferFrom(msg.sender, BURN_ADDRESS, _amount), "Transfer failed");
        
        // Update user reputation
        _updateReputation(msg.sender, _token, _amount);
        
        // Record the burn
        BurnRecord memory newBurn = BurnRecord({
            user: msg.sender,
            token: _token,
            amount: _amount,
            timestamp: block.timestamp,
            blockNumber: block.number,
            txHash: blockhash(block.number - 1)
        });
        
        burnHistory.push(newBurn);
        
        // Track if this is user's first burn
        if (!hasBurned[msg.sender]) {
            allBurners.push(msg.sender);
            hasBurned[msg.sender] = true;
        }
        
        emit TokenBurned(
            msg.sender,
            _token,
            _amount,
            userReputations[msg.sender].reputation,
            block.timestamp
        );
    }
    
    /**
     * @dev Internal function to update user reputation
     */
    function _updateReputation(address _user, address _token, uint256 _amount) internal {
        UserReputation storage userRep = userReputations[_user];
        
        // Update basic stats
        userRep.totalBurned += _amount;
        userRep.burnCount += 1;
        userRep.lastBurnTime = block.timestamp;
        userTokenBurns[_user][_token] += _amount;
        
        // Calculate reputation with bonuses
        uint256 baseReputation = _amount * baseReputationMultiplier;
        
        // Frequency bonus (more burns = higher multiplier)
        uint256 frequencyMultiplier = 100 + (userRep.burnCount * frequencyBonus);
        
        // Volume bonus (higher total burned = bonus)
        uint256 volumeMultiplier = 100;
        if (userRep.totalBurned > 1000 * 10**18) { // > 1000 tokens
            volumeMultiplier += volumeBonus * 3;
        } else if (userRep.totalBurned > 100 * 10**18) { // > 100 tokens
            volumeMultiplier += volumeBonus * 2;
        } else if (userRep.totalBurned > 10 * 10**18) { // > 10 tokens
            volumeMultiplier += volumeBonus;
        }
        
        // Calculate final reputation
        userRep.reputation = (userRep.totalBurned * frequencyMultiplier * volumeMultiplier) / 10000;
    }
    
    /**
     * @dev Get user's reputation details
     */
    function getUserReputation(address _user) external view returns (
        uint256 totalBurned,
        uint256 burnCount,
        uint256 reputation,
        uint256 lastBurnTime
    ) {
        UserReputation memory userRep = userReputations[_user];
        return (
            userRep.totalBurned,
            userRep.burnCount,
            userRep.reputation,
            userRep.lastBurnTime
        );
    }
    
    /**
     * @dev Get top burners by reputation
     */
    function getTopBurners(uint256 _limit) external view returns (
        address[] memory users,
        uint256[] memory reputations
    ) {
        require(_limit > 0 && _limit <= allBurners.length, "Invalid limit");
        
        // Create arrays for sorting
        address[] memory sortedUsers = new address[](_limit);
        uint256[] memory sortedReputations = new uint256[](_limit);
        
        // Simple selection sort for top N (inefficient for large datasets, but works for demo)
        for (uint256 i = 0; i < _limit; i++) {
            uint256 maxRep = 0;
            address maxUser = address(0);
            uint256 maxIndex = 0;
            
            for (uint256 j = 0; j < allBurners.length; j++) {
                address user = allBurners[j];
                uint256 rep = userReputations[user].reputation;
                
                // Check if this user is already in results
                bool alreadyIncluded = false;
                for (uint256 k = 0; k < i; k++) {
                    if (sortedUsers[k] == user) {
                        alreadyIncluded = true;
                        break;
                    }
                }
                
                if (!alreadyIncluded && rep > maxRep) {
                    maxRep = rep;
                    maxUser = user;
                    maxIndex = j;
                }
            }
            
            if (maxUser != address(0)) {
                sortedUsers[i] = maxUser;
                sortedReputations[i] = maxRep;
            }
        }
        
        return (sortedUsers, sortedReputations);
    }
    
    /**
     * @dev Get total burn history count
     */
    function getBurnHistoryCount() external view returns (uint256) {
        return burnHistory.length;
    }
    
    /**
     * @dev Get burn history with pagination
     */
    function getBurnHistory(uint256 _offset, uint256 _limit) external view returns (
        BurnRecord[] memory burns
    ) {
        require(_offset < burnHistory.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > burnHistory.length) {
            end = burnHistory.length;
        }
        
        burns = new BurnRecord[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            burns[i - _offset] = burnHistory[i];
        }
        
        return burns;
    }
    
    /**
     * @dev Update reputation multipliers (owner only)
     */
    function updateMultipliers(
        uint256 _baseMultiplier,
        uint256 _frequencyBonus,
        uint256 _volumeBonus
    ) external onlyOwner {
        baseReputationMultiplier = _baseMultiplier;
        frequencyBonus = _frequencyBonus;
        volumeBonus = _volumeBonus;
    }
    
    /**
     * @dev Get contract stats
     */
    function getContractStats() external view returns (
        uint256 totalBurners,
        uint256 totalBurns,
        uint256 totalTokensBurned
    ) {
        uint256 totalBurnedAmount = 0;
        for (uint256 i = 0; i < allBurners.length; i++) {
            totalBurnedAmount += userReputations[allBurners[i]].totalBurned;
        }
        
        return (
            allBurners.length,
            burnHistory.length,
            totalBurnedAmount
        );
    }
}
