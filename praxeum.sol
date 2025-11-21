// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Praxeum is ERC20, Ownable {
    uint256 public constant INACTIVITY_PERIOD = 180 days;
    uint256 public constant PENALTY_RATE = 2;
    uint256 public constant PENALTY_INTERVAL = 30 days;
    
    mapping(address => uint256) public lastActivity;
    mapping(address => bool) public exemptFromPenalty;
    address public treasury;
    
    event PenaltyApplied(address indexed account, uint256 amount, uint256 timestamp);

    constructor(address initialOwner)
        ERC20("Praxeum", "PRX")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 200000 * 10 ** decimals());
        treasury = initialOwner;
        lastActivity[initialOwner] = block.timestamp;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        _updateActivity(to);
    }

    function _updateActivity(address account) internal {
        lastActivity[account] = block.timestamp;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        _applyPenalty(msg.sender);
        bool success = super.transfer(to, amount);
        _updateActivity(msg.sender);
        _updateActivity(to);
        return success;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _applyPenalty(from);
        bool success = super.transferFrom(from, to, amount);
        _updateActivity(from);
        _updateActivity(to);
        return success;
    }

    function _applyPenalty(address account) internal {
        if (exemptFromPenalty[account]) return;
        if (block.timestamp <= lastActivity[account] + INACTIVITY_PERIOD) return;
        
        uint256 inactiveMonths = (block.timestamp - (lastActivity[account] + INACTIVITY_PERIOD)) / PENALTY_INTERVAL;
        if (inactiveMonths == 0) return;
        
        uint256 balance = balanceOf(account);
        uint256 penalty = (balance * PENALTY_RATE * inactiveMonths) / 100;
        
        if (penalty > 0 && penalty <= balance) {
            _transfer(account, treasury, penalty);
            emit PenaltyApplied(account, penalty, block.timestamp);
        }
    }

    function setTreasury(address newTreasury) public onlyOwner {
        treasury = newTreasury;
    }

    function setExemptFromPenalty(address account, bool exempt) public onlyOwner {
        exemptFromPenalty[account] = exempt;
    }

    function getTimeUntilPenalty(address account) public view returns (uint256) {
        if (block.timestamp >= lastActivity[account] + INACTIVITY_PERIOD) {
            return 0;
        }
        return (lastActivity[account] + INACTIVITY_PERIOD) - block.timestamp;
    }
}