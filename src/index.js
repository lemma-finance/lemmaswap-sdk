const ethers = require('ethers');
const crypto = require('crypto');
require('dotenv').config();
const FORWARDER_ARTIFACT = require("../ABIs/withByteCode/LemmaSwapForwarder.json");
const WALLET_ARTIFACT = require("../ABIs/withByteCode/UnlockedWallet.json");

// Use a random address to "deploy" our forwarder contract to.
const FORWARDER_ADDRESS = ethers.utils.hexlify(crypto.randomBytes(20));

const WHALE_WALLET = '0x078f358208685046a11c85e8ad32895ded33a249';//WBTC mainnet
const getAmountsOut = async (provider, lemmaSwapAddress, fromAmount, path,) => {
    const forwarder = new ethers.Contract(FORWARDER_ADDRESS, FORWARDER_ARTIFACT.abi, provider);
    const rawResult = await provider.send(
        'eth_call',
        [
            await forwarder.populateTransaction.getAmountsOut(WHALE_WALLET, lemmaSwapAddress, fromAmount, path),
            'pending',
            {
                [forwarder.address]: { code: FORWARDER_ARTIFACT.deployedBytecode.object },
                [WHALE_WALLET]: { code: WALLET_ARTIFACT.deployedBytecode.object }
            },
        ],
    );
    const amountsOut = ethers.utils.defaultAbiCoder.decode(['uint256[]'], rawResult)[0];
    return amountsOut;
};

module.exports = { getAmountsOut };
