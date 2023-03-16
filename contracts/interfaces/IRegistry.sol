// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IRegistry {
    struct Product {
        bytes hash;
        uint256 status; // 第一位为有效位，第二位为抄袭位
    }

    function register(bytes memory _hash, bool _isDup) external;

    function query(uint256 _index) external view returns (bytes memory);

    function delist(bytes memory _hash) external;

    function getProductList() external view returns (Product[] memory);
}
