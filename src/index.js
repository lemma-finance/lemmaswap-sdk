const ethers = require('ethers');
const crypto = require('crypto');
require('dotenv').config();
const FORWARDER_ARTIFACT = require("../ABIs/withByteCode/LemmaSwapForwarder.json");
const WALLET_ARTIFACT = require("../ABIs/withByteCode/UnlockedWallet.json");

const whaleWallets = require("./whaleWallets.json");

// Use a random address to "deploy" our forwarder contract to.
const FORWARDER_ADDRESS = ethers.utils.hexlify(crypto.randomBytes(20));



const getAmountsOut = async (provider, lemmaSwapAddress, fromAmount, path) => {
    const forwarder = new ethers.Contract(FORWARDER_ADDRESS, FORWARDER_ARTIFACT.abi, provider);
    const whaleWallet = whaleWallets[path[0]];
    //see here for more info on how it is achieved: https://github.com/dragonfly-xyz/useful-solidity-patterns/tree/main/patterns/eth_call-tricks#example-simulating-complex-swaps
    const rawResult = await provider.send(
        'eth_call',
        [
            await forwarder.populateTransaction.getAmountsOut(whaleWallet, lemmaSwapAddress, fromAmount, path),
            'pending',
            {
                [forwarder.address]: { code: FORWARDER_ARTIFACT.deployedBytecode.object },
                [whaleWallet]: { code: WALLET_ARTIFACT.deployedBytecode.object }
            },
        ],
    );
    const amountsOut = ethers.utils.defaultAbiCoder.decode(['uint256[]'], rawResult)[0];
    return amountsOut;
};

module.exports = { getAmountsOut };
