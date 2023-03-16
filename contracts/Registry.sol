// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./interfaces/IRegistry.sol";

contract Registry is IRegistry {
    Product[] public productList;
    mapping(bytes => uint256) private productIndex;
    mapping(bytes => address) public hashToAddress;
    function register(bytes memory _hash, bool _isDup) external override {
        require(!isRegistered(_hash), "Product already registered");
        uint256 status = 1;
        if (_isDup) {
            status |= (1 << 1);
        }
        productList.push(Product(_hash, status));
        uint256 index = productList.length - 1;
        productIndex[_hash] = index;
        hashToAddress[_hash] = msg.sender;
    }

    function getIndexFromHash(bytes memory hash) external view returns (uint256){
        require(isRegistered(hash), "Product not reigstered");
        return productIndex[hash];
    }

    function query(uint256 _index) external view override returns (bytes memory) {
        require(_index < productList.length, "Invalid index");
        Product memory product = productList[_index];
        require(isValid(product.status), "Product not valid");
        return product.hash;
    }

    function delist(bytes memory _hash) external override {
        uint256 index = productIndex[_hash];
        require(isRegistered(_hash), "Product not registered");
        require(msg.sender == hashToAddress[_hash],"Only seller can delist their own product");
        Product memory product = productList[index];
        require(isValid(product.status), "Product not valid");
        productIndex[_hash] = 0;
        hashToAddress[_hash] = address(0);
        productList[index].status = 0;
    }

    function getProductList() external view override returns (Product[] memory) {
        return productList;
    }

    function isRegistered(bytes memory _hash) private view returns (bool) {
        return hashToAddress[_hash] != address(0);
    }

    function isValid(uint256 _status) private pure returns (bool) {
        return _status & 1 == 1;
    }
}
