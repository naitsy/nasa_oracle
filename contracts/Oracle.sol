// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
 
contract Oracle {

    address owner;
    uint public asteroids_counter;
    event __callbackNewData();

    constructor () {
        owner = msg.sender;
    }

    modifier OnlyOwner(){
        require(msg.sender == owner, "You must be the owner to use this method.");
        _;
    }

    function update() public OnlyOwner {
        emit __callbackNewData();
    }

    function setAsteroidsCount(uint _count) public OnlyOwner {
        asteroids_counter = _count;

    }


}