// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    
    constructor(address _owner) ERC20("Token", "TOKEN") Ownable(msg.sender) {
        
        uint256 _initialSupply = 1000000000 * 10 ** decimals();

        _mint(_owner, _initialSupply);
        _transferOwnership(_owner);
    }
}
