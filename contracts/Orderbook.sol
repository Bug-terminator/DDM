// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interfaces/IOrderbook.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @author  litang@stu.pku.edu.cn
 * @title   This interface provide basic functionality of a registry
 */
contract Orderbook is IOrderbook {
    using SafeMath for uint256;
    mapping(bytes32 => OrderInfo) public orderBook;

    function create(OrderInfo memory info)
        public
        payable
        returns (bytes32 order_id)
    {
        require(
            info.buyer != address(0) && info.seller != address(0),
            "Buyer and seller can't be zero address"
        );
        require(
            info.finished_pieces == 0 && info.total_pieces > 0,
            "finished_pieces should <= total_peices"
        );
        uint salt = 0;
        do {
            order_id = keccak256(
                abi.encodePacked(info.buyer, info.seller, salt++)
            );
        } while (orderBook[order_id].buyer != address(0));
        info.cost = msg.value;
        info.start_time = block.timestamp;
        info.deadline = info.start_time + 3 days;
        orderBook[order_id] = info;
    }

    function increase(bytes32 order_id) public {
        OrderInfo storage info = orderBook[order_id];
        require(
            info.finished_pieces < info.total_pieces &&
                info.is_finished == false,
            "Order has been finished"
        );
        require(
            msg.sender == info.buyer,
            "Only the buyer can increase payment"
        );
        info.finished_pieces++;
    }

    function settlement(bytes32 order_id) public {
        OrderInfo storage info = orderBook[order_id];
        require(
            msg.sender == info.buyer || msg.sender == info.seller,
            "only buyer and seller can settle this order"
        );
        uint256 payment = info.cost.div(info.total_pieces).mul(
            info.finished_pieces
        );
        uint256 refund = info.cost.sub(payment);
        if (payment > 0) {
            info.seller.transfer(payment);
        }
        //refund if neccesary
        if (refund > 0) {
            info.buyer.transfer(refund);
        }
        info.is_finished = true;
    }
}
