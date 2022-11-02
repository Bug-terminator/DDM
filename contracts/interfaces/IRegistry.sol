// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @author  litang@stu.pku.edu.cn
 * @title   This interface provide basic functionality of a registry
 */
interface IRegistry {
    struct Product {
        bytes32 storage_hash;
        bool is_valid;
    }

    struct Position {
        bytes1 class;
        uint256 position;
    }

    /**
     * @notice  Sellers call this function to register their data hash
     * @param   class  data type
     * @param   hash  data hash
     */
    function register(bytes1 class, bytes32 hash) external;

    /**
     * @notice  Buyers call this function to query all data hashs of certain type
     * @param   class  data type
     * @return  products  all data hashs of certain type
     */
    function query(bytes1 class) external view returns (bytes32[] memory products);

    /**
     * @notice  Sellers call this function to update their data hash
     * @param   old_hash  old hash
     * @param   new_hash  new hash
     */
    function update(bytes32 old_hash, bytes32 new_hash) external;

    /**
     * @notice  Sellers call this function to delete their data hash
     * @param   hash  data hash
     */
    function delist(bytes32 hash) external;
}
