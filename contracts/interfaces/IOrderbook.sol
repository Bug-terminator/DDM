// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @author  litang@stu.pku.edu.cn
 * @title   This interface provide basic functionality of a registry
 */
interface IOrderbook {
    struct OrderInfo {
        address payable buyer;
        address payable seller;
        uint256 item_ID;
        uint256 total_pieces;
        uint256 finished_pieces;
        uint256 start_time;
        uint256 deadline;
        uint256 cost;
        bool is_finished;
    }

    function create(OrderInfo calldata info)
        external
        payable
        returns (bytes32 order_id);

    function increase(bytes32 order_id) external;

    function settlement(bytes32 order_id) external;
    function getOrderbook(bytes32 order_id) external view returns(OrderInfo memory info);
    function sellerVerifyOrderOnCreated(bytes32 order_id, address seller, address buyer, uint256 cost) external view returns(bool);
    function sellerVerifyOrderOnPayment(bytes32 order_id, address seller, address buyer, uint256 cost, uint256 finished) external view returns(bool);
}
