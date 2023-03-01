// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interfaces/IRegistry.sol";

contract Registry is IRegistry {
    mapping(bytes1 => Product[]) public productLookUp;
    mapping(bytes32 => Position) public positionLookUp;
    mapping(bytes32 => address) public sellerLookUp;

    function register(bytes1 class, bytes32 hash) public {
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

    /**
     * @notice  Memory arrays with dynamic length can be created using the new operator.
     * As opposed to storage arrays, it is not possible to resize memory arrays,check
     * https://docs.soliditylang.org/en/v0.8.12/types.html#allocating-memory-arrays
     * @dev using assembly to solve this problem, check https://ethereum.stackexchange.
     * com/questions/51891/how-to-pop-from-decrease-the-length-of-a-memory-array-in-solidity
     */
    function query(bytes1 class)
        public
        view
        returns (bytes32[] memory products)
    {
        Product[] storage product = productLookUp[class];
        uint length = product.length;
        products = new bytes32[](length);
        uint pos = 0;
        for (uint i = 0; i < length; i++) {
            if (product[i].is_valid) {
                products[pos] = product[i].storage_hash;
                pos++;
            }
        }
        assert(length - pos >= 0);
        uint tail = length - pos;
        assembly {
            mstore(products, sub(mload(products), tail))
        }
    }

    function update(bytes32 old_hash, bytes32 new_hash) public {
        // require(sellerLookUp[old_hash] != address(0), "Product doesn't exist.");
        // require(
        //     sellerLookUp[old_hash] == msg.sender,
        //     "Only seller is allowed to update the product info."
        // );
        (bytes1 class, uint256 index) = fetchPosition(old_hash);
        productLookUp[class][index].storage_hash = new_hash;
        sellerLookUp[old_hash] = address(0);
        sellerLookUp[new_hash] = msg.sender;
        positionLookUp[new_hash] = positionLookUp[old_hash];
        positionLookUp[old_hash] = Position(0x00, 0);
    }

    function delist(bytes32 hash) public {
        require(sellerLookUp[hash] != address(0), "Product doesn't exist.");
        // require(
        //     sellerLookUp[hash] == msg.sender,
        //     "Only seller is allowed to delist the product."
        // );
        (bytes1 class, uint256 index) = fetchPosition(hash);
        productLookUp[class][index].is_valid = false;
        sellerLookUp[hash] = address(0);
        positionLookUp[hash].position = 0;
    }

    /**
     * @dev  helper function which returns the exact positon in "productLookUp" of certain hash
     * @param   hash  data hash
     * @return  class  data type
     * @return  index  the index of the hash array(starts from 0)
     * @notice The number in the "positionLookUp" map is always greater than 0, so we should sub 1.
     */
    function fetchPosition(bytes32 hash)
        internal
        view
        returns (bytes1 class, uint256 index)
    {
        index = positionLookUp[hash].position - 1;
        // require(index >= 0, "Index shouldn't be negative");
        class = positionLookUp[hash].class;
    }
}


// pragma solidity ^0.8.0;

// contract ProductRegistry {
//     struct Product {
//         uint256 hash;
//         int8 valid;
//     }

//     Product[] public productList;
//     mapping(uint256 => uint256) public productIndexMap;

//     function addProduct(uint256 hash) public {
//         // 如果产品的哈希值已存在，则不进行任何操作
//         if (productIndexMap[hash] != 0) {
//             return;
//         }

//         // 创建一个新产品并添加到productList数组的末尾
//         Product memory newProduct = Product({hash: hash, valid: 1});
//         uint256 index = productList.length;
//         productList.push(newProduct);

//         // 将产品哈希值与其在productList数组中的位置建立映射
//         productIndexMap[hash] = index;
//     }

//     function removeProduct(uint256 hash) public {
//         // 如果产品的哈希值不存在或已被删除，则不进行任何操作
//         uint256 index = productIndexMap[hash];
//         if (index == 0 || productList[index - 1].valid != 1) {
//             return;
//         }

//         // 将产品的valid字段的第一位设置为0，表示已被删除
//         productList[index - 1].valid &= ~1;

//         // 从productIndexMap映射中删除对应的项
//         delete productIndexMap[hash];
//     }

//     function getProducts() public view returns (uint256[] memory) {
//         // 统计所有valid产品的数量
//         uint256 validCount = 0;
//         for (uint256 i = 0; i < productList.length; i++) {
//             if (productList[i].valid == 1) {
//                 validCount++;
//             }
//         }

//         // 创建一个数组以保存所有valid产品的哈希值
//         uint256[] memory validProducts = new uint256[](validCount);
//         uint256 validIndex = 0;
//         for (uint256 i = 0; i < productList.length; i++) {
//             if (productList[i].valid == 1) {
//                 validProducts[validIndex] = productList[i].hash;
//                 validIndex++;
//             }
//         }

//         return validProducts;
//     }
// }