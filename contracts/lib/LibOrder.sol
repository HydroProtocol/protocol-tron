/*

    Copyright 2018 The Hydro Protocol Foundation

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/

pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./LibSignature.sol";

contract LibOrder is LibSignature {
    struct Order {
        address trader;
        address relayer;
        address baseToken;
        address quoteToken;
        uint256 baseTokenAmount;
        uint256 quoteTokenAmount;
        uint256 gasTokenAmount;

        /**
         * Data contains the following values packed into 32 bytes
         * ╔════════════════════╤═══════════════════════════════════════════════════════════╗
         * ║                    │ length(bytes)   desc                                      ║
         * ╟────────────────────┼───────────────────────────────────────────────────────────╢
         * ║ version            │ 1               order version                             ║
         * ║ side               │ 1               0: buy, 1: sell                           ║
         * ║ isMarketOrder      │ 1               0: limitOrder, 1: marketOrder             ║
         * ║ expiredAt          │ 5               order expiration time in seconds          ║
         * ║ asMakerFeeRate     │ 2               maker fee rate (base 100,000)             ║
         * ║ asTakerFeeRate     │ 2               taker fee rate (base 100,000)             ║
         * ║ makerRebateRate    │ 2               rebate rate for maker (base 100,000)      ║
         * ║ salt               │ 8               salt                                      ║
         * ║                    │ 10              reserved                                  ║
         * ╚════════════════════╧═══════════════════════════════════════════════════════════╝
         */
        bytes32 data;
    }

    enum OrderStatus {
        EXPIRED,
        CANCELLED,
        FILLABLE,
        FULLY_FILLED
    }
    /**
     *
     * @param order The order data struct.
     * @return Hash of the order.
     */
    function hashOrder(Order memory order) internal pure returns (bytes32 result) {
        /**
         * Calculate the following hash in solidity assembly to save gas.
         *
         * keccak256(
         *     abi.encodePacked(
         *         bytes32(order.trader),
         *         bytes32(order.relayer),
         *         bytes32(order.baseToken),
         *         bytes32(order.quoteToken),
         *         order.baseTokenAmount,
         *         order.quoteTokenAmount,
         *         order.gasTokenAmount,
         *         order.data
         *     )
         * );
         */

        assembly {
            result := keccak256(order, 256)
        }

        return result;
    }

    /* Functions to extract info from data bytes in Order struct */

    function getExpiredAtFromOrderData(bytes32 data) internal pure returns (uint256) {
        return uint256(bytes5(data << (8*3)));
    }

    function isSell(bytes32 data) internal pure returns (bool) {
        return data[1] == 1;
    }

    function isMarketOrder(bytes32 data) internal pure returns (bool) {
        return data[2] == 1;
    }

    function isMarketBuy(bytes32 data) internal pure returns (bool) {
        return !isSell(data) && isMarketOrder(data);
    }

    function getAsMakerFeeRateFromOrderData(bytes32 data) internal pure returns (uint256) {
        return uint256(bytes2(data << (8*8)));
    }

    function getAsTakerFeeRateFromOrderData(bytes32 data) internal pure returns (uint256) {
        return uint256(bytes2(data << (8*10)));
    }

    function getMakerRebateRateFromOrderData(bytes32 data) internal pure returns (uint256) {
        return uint256(bytes2(data << (8*12)));
    }
}