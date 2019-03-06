const BigNumber = require('bignumber.js');
const { sha3, ecrecover, toBuffer, pubToAddress, keccak } = require('ethereumjs-util');

const sha3ToHex = message => {
    return '0x' + sha3(message).toString('hex');
};

const addLeadingZero = (str, length) => {
    let len = str.length;
    return '0'.repeat(length - len) + str;
};

const addTailingZero = (str, length) => {
    let len = str.length;
    return str + '0'.repeat(length - len);
};

const hashTronMessage = messageBuffer => {
    return keccak(
        Buffer.concat([
            // toBuffer('\u0019Ethereum Signed Message:\n' + messageBuffer.length.toString()),
            toBuffer('\u0019TRON Signed Message:\n' + messageBuffer.length.toString()),
            messageBuffer
        ])
    );
};

const isValidSignature = async (account, signature, message) => {
    if (message.substr(0, 2) !== '0x') {
        message = '0x' + message;
    }

    if (signature.substr(0, 2) !== '0x') {
        signature = '0x' + signature;
    }

    const messageBuffer = toBuffer(message);

    const hashedMessage = keccak(
        Buffer.concat([
            // toBuffer('\u0019TRON Signed Message:\n' + messageBuffer.length.toString()),
            toBuffer('\u0019Ethereum Signed Message:\n' + messageBuffer.length.toString()),
            messageBuffer
        ])
    );
    const v = parseInt(signature.slice(130), 16);

    const pubkey = ecrecover(
        toBuffer(hashedMessage),
        v < 2 ? v + 27 : v,
        toBuffer('0x' + signature.slice(2, 66)),
        toBuffer('0x' + signature.slice(66, 130))
    );

    const address = pubToAddress(pubkey).toString('hex');
    return address.toLowerCase() == account.slice(2).toLowerCase();
};

const generateOrderData = (
    version,
    isSell,
    isMarket,
    expiredAtSeconds,
    asMakerFeeRate,
    asTakerFeeRate,
    makerRebateRate,
    salt
) => {
    let res = '0x';
    res += addLeadingZero(new BigNumber(version).toString(16), 2);
    res += isSell ? '01' : '00';
    res += isMarket ? '01' : '00';
    res += addLeadingZero(new BigNumber(expiredAtSeconds).toString(16), 5 * 2);
    res += addLeadingZero(new BigNumber(asMakerFeeRate).toString(16), 2 * 2);
    res += addLeadingZero(new BigNumber(asTakerFeeRate).toString(16), 2 * 2);
    res += addLeadingZero(new BigNumber(makerRebateRate).toString(16), 2 * 2);
    res += addLeadingZero(new BigNumber(salt).toString(16), 8 * 2);

    return addTailingZero(res, 66);
};

const getOrderHash = order => {
    return sha3ToHex(
        '0x' +
            addLeadingZero(order.trader.slice(2), 64) +
            addLeadingZero(order.relayer.slice(2), 64) +
            addLeadingZero(order.baseToken.slice(2), 64) +
            addLeadingZero(order.quoteToken.slice(2), 64) +
            addLeadingZero(new BigNumber(order.baseTokenAmount).toString(16), 64) +
            addLeadingZero(new BigNumber(order.quoteTokenAmount).toString(16), 64) +
            addLeadingZero(new BigNumber(order.gasTokenAmount).toString(16), 64) +
            order.data.slice(2)
    );
};

module.exports = {
    isValidSignature,
    generateOrderData,
    hashTronMessage,
    getOrderHash
};
