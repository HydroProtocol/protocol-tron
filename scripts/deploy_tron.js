const TronWeb = require('tronweb');
const fs = require('fs');

const loadArtifact = name => {
    return JSON.parse(fs.readFileSync(`./build/contracts/${name}.json`));
};

const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.shasta.trongrid.io'); // Full node http endpoint
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io'); // Solidity node http endpoint
const eventServer = 'https://api.shasta.trongrid.io'; // Contract events http endpoint

// update with your private key here
const privateKey = '';

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

const deployContract = async (name, ...args) => {
    const Contract = loadArtifact(name);

    const contractInstance = await tronWeb.contract().new({
        abi: Contract.abi,
        bytecode: Contract.bytecode,
        feeLimit: 1000000000,
        callValue: 0,
        userFeePercentage: 100,
        parameters: args
    });

    const address = tronWeb.address.fromHex(contractInstance.address);
    console.log(
        `Contract ${name} Deployed: address: ${address}, hexAddress: ${contractInstance.address}`
    );
    return contractInstance;
};

const loadContract = async address => {
    return await tronWeb.contract().at(address);
};

const proxyAddress = '';
const wtrxAddress = '';
const hotAddress = '';
const daiAddress = '';
const exchangeAddress = '';
const multiSigWalletAddress = '';

const waitSendResponse = async txID => {
    for (let i = 0; i < 100; i++) {
        console.log(`wait Transaction ${txID}`);
        res = await tronWeb.trx.getTransactionInfo(txID);

        if (res.id) {
            if (res.receipt.result === 'SUCCESS') {
                return res.contractResult;
            } else {
                throw `${res.receipt.result} ${JSON.stringify(res)}`;
            }
        }
        await new Promise(r => {
            setTimeout(r, 1000);
        });
    }
};

const run = async () => {
    const proxy = !!proxyAddress ? await loadContract(proxyAddress) : await deployContract('Proxy');
    const wtrx = !!wtrxAddress ? await loadContract(wtrxAddress) : await deployContract('WTRX');
    const hot = !!hotAddress
        ? await loadContract(hotAddress)
        : await deployContract('TestToken', 'HydroToken', 'Hot', 18);
    const dai = !!daiAddress
        ? await loadContract(daiAddress)
        : await deployContract('TestToken', 'DAI', 'DAI', 18);
    const exchange = !!exchangeAddress
        ? await loadContract(exchangeAddress)
        : await deployContract('HybridExchange', proxy.address, hot.address);

    const multiSigWallet = !!multiSigWalletAddress
        ? await loadContract(multiSigWalletAddress)
        : await deployContract('', proxy.address, hot.address);

    const proxyWhitelists = await proxy.getAllAddresses().call();

    // add whitelist
    if (
        proxyWhitelists.map(x => x.toLowerCase()).indexOf('0x' + exchange.address.slice(2)) === -1
    ) {
        await proxy
            .addAddress(tronWeb.address.fromHex(exchange.address))
            .send()
            .then(waitSendResponse);
        console.log('add Exchange into Proxy whitelist');
    }
};

run();
