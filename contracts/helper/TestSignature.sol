pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "../lib/LibSignature.sol";

// Test wrapper

contract TestSignature is LibSignature {
    function isValidSignaturePublic(bytes32 hash, address addr, OrderSignature memory orderSignature)
        public
        pure
        returns (bool)
    {
        return isValidSignature(hash, addr, orderSignature);
    }

    function isValidSignaturePublic2(bytes32 hash, address addr, bytes32 config, bytes32 r, bytes32 s)
        public
        pure
        returns (bool)
    {
        OrderSignature memory orderSignature = OrderSignature(config, r, s);
        return isValidSignature(hash, addr, orderSignature);
    }
}