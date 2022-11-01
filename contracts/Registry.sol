// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interfaces/IRegistry.sol";

contract Registry is IRegistry {
    mapping(bytes1 => Product[]) public productLookUp;
    mapping(bytes32 => Position) public positionLookUp;
    mapping(bytes32 => address) public sellerLookUp;

    function Register(bytes32 hash, bytes1 class) public {
        require(
            positionLookUp[hash].position == 0 &&
                sellerLookUp[hash] == address(0),
            "Product has already been registered."
        );
        Product memory product = Product(hash, true);
        productLookUp[class].push(product);
        Position memory position = Position(class, productLookUp[class].length);
        positionLookUp[hash] = position;
        sellerLookUp[hash] = msg.sender;
    }

    function Query(bytes1 class)
        public
        view
        returns (Product[] memory products)
    {
        return productLookUp[class];
    }

    function Update(bytes32 old_hash, bytes32 new_hash) public {
        require(
            sellerLookUp[old_hash] == msg.sender,
            "Only seller is allowed to update the product info."
        );
        (bytes1 class, uint256 index) = FetchPosition(old_hash);
        productLookUp[class][index].storage_hash = new_hash;
    }

    function Delete(bytes32 hash) public {
        require(
            sellerLookUp[hash] == msg.sender,
            "Only seller is allowed to delist the product."
        );
        (bytes1 class, uint256 index) = FetchPosition(hash);
        productLookUp[class][index].is_valid = false;
    }

    /**
     * @dev  helper function which returns the exact positon in "productLookUp" of certain hash
     * @param   hash  data hash
     * @return  class  data type
     * @return  index  the index of the hash array(starts from 0)
     * @notice The number in the "positionLookUp" map is always greater than 0, so we should sub 1.
     */
    function FetchPosition(bytes32 hash)
        internal
        view
        returns (bytes1 class, uint256 index)
    {
        index = positionLookUp[hash].position - 1;
        class = positionLookUp[hash].class;
    }
}
