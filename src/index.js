const ethers = require('ethers');
const crypto = require('crypto');
require('dotenv').config();
const FORWARDER_ARTIFACT = require("../ABIs/withByteCode/LemmaSwapForwarder.json");
const WALLET_ARTIFACT = require("../ABIs/withByteCode/UnlockedWallet.json");

const whaleWallets = require("./whaleWallets.json");

// Use a random address to "deploy" our forwarder contract to.
const FORWARDER_ADDRESS = ethers.utils.hexlify(crypto.randomBytes(20));
const WBTC_WHALE_WALLET = '0x078f358208685046a11c85e8ad32895ded33a249';//WBTC mainnet
const WETH_WHALE_WALLET = '0x85149247691df622eaF1a8Bd0CaFd40BC45154a9';//WETH mainnet
const LINK_WHALE_WALLET = '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530';//LINK mainnet
const AAVE_WHALE_WALLET = '0xf329e36c7bf6e5e86ce2150875a84ce77f477375';//AAVE mainnet
const CRV_WHALE_WALLET = '0x9644a6920bd0a1923c2c6c1dddf691b7a42e8a65';//CRV mainnet
const PERP_WHALE_WALLET = '0xd360b73b19fb20ac874633553fb1007e9fcb2b78';//PERP mainnet

var token_to_whale = {
    // tokenAddress => token_whale_address
    "0x4200000000000000000000000000000000000006": WETH_WHALE_WALLET, 
    "0x68f180fcce6836688e9084f035309e29bf0a2095": WBTC_WHALE_WALLET, 
    "0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6": LINK_WHALE_WALLET, 
    "0x76FB31fb4af56892A25e32cFC43De717950c9278": AAVE_WHALE_WALLET, 
    "0x0994206dfe8de6ec6920ff4d779b0d950605fb53": CRV_WHALE_WALLET, 
    "0x9e1028F5F1D5eDE59748FFceE5532509976840E0": PERP_WHALE_WALLET, 
};


const getAmountsOut = async (provider, lemmaSwapAddress, fromAmount, path) => {
    const forwarder = new ethers.Contract(FORWARDER_ADDRESS, FORWARDER_ARTIFACT.abi, provider);
    const whaleWallet = whaleWallets[path[0]];
    const rawResult = await provider.send(
        'eth_call',
        [
            await forwarder.populateTransaction.getAmountsOut(token_to_whale[path[0]], lemmaSwapAddress, fromAmount, path),
            'pending',
            {
                [forwarder.address]: { code: FORWARDER_ARTIFACT.deployedBytecode.object },
                [token_to_whale[path[0]]]: { code: WALLET_ARTIFACT.deployedBytecode.object }
            },
        ],
    );
    const amountsOut = ethers.utils.defaultAbiCoder.decode(['uint256[]'], rawResult)[0];
    return amountsOut;
};

module.exports = { getAmountsOut };
