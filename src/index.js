const ethers = require('ethers');
const { constants } = ethers;
const { AddressZero } = constants;
const crypto = require('crypto');
require('dotenv').config();
const FORWARDER_ARTIFACT = require("../ABIs/withByteCode/LemmaSwapForwarder.json");
const WALLET_ARTIFACT = require("../ABIs/withByteCode/UnlockedWallet.json");
const usdlemmaABI = require("../ABIs/USDLemma.json");
const perpLemmaABI = require("../ABIs/PerpLemma.json");
const erc20ABI = require("../ABIs/erc20.json");
const perpetualProtocolVaultABI = require("../ABIs/PerpetualProtocolVault.json");
const perpetualProtocolAccountBalanceABI = require("../ABIs/PerpetualProtocolAccountBalance.json");

const whaleWallets = require("./whaleWallets.json");

const { addresses } = require("./constants");
const ZERO = ethers.BigNumber.from("0");

// Use a random address to "deploy" our forwarder contract to.
const FORWARDER_ADDRESS = ethers.utils.hexlify(crypto.randomBytes(20));


const defaultOptimismProvider = "https://mainnet.optimism.io";
const optimismProvider = ethers.getDefaultProvider(defaultOptimismProvider);


const getAmountsOut = async (provider, lemmaSwapAddress, fromAmount, path) => {
    provider = provider == null ? optimismProvider : provider;
    const forwarder = new ethers.Contract(FORWARDER_ADDRESS, FORWARDER_ARTIFACT.abi, provider);
    const whaleWallet = whaleWallets[path[0].toLowerCase()];
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
const getMaxToken = async (provider, tokenAddress, isTokenIn) => {
    provider = provider == null ? optimismProvider : provider;


    const usdLemma = new ethers.Contract(addresses.usdLemma, usdlemmaABI.abi, provider);
    let perpLemma = new ethers.Contract(AddressZero, perpLemmaABI.abi, provider);
    const erc20 = new ethers.Contract(AddressZero, erc20ABI.abi, provider);
    const vault = new ethers.Contract(addresses.perpetualProtocolVault, perpetualProtocolVaultABI.abi, provider);
    const accountBalance = new ethers.Contract(addresses.perpetualProtocolAccountBalance, perpetualProtocolAccountBalanceABI.abi, provider);


    const isUSDLGettingMinted = isTokenIn;
    const perpLemmaAddress = await usdLemma.perpetualDEXWrappers(addresses.perpetualDEXIndex, tokenAddress);
    if (perpLemmaAddress == ethers.constants.AddressZero) {
        console.log("Token not supported");
        process.exit();
    }
    perpLemma = perpLemma.attach(perpLemmaAddress);
    const usdlBaseTokenAddress = await perpLemma.usdlBaseTokenAddress();
    const token = erc20.attach(tokenAddress);
    const maxPosition = await perpLemma.maxPosition();

    const currentPerpLemmaPosition = await accountBalance.getTotalPositionSize(perpLemma.address, usdlBaseTokenAddress);//vETH

    const isTailAsset = await perpLemma.isUsdlCollateralTailAsset();

    let maxUSDLInToken;

    if (isUSDLGettingMinted) {
        //we are going short to mint USDLemma we need to make sure that abs(currentPerpLemmaPosition - tokenInAmount) <= maxPosition
        let maxUSDLInTokenAccordingToMaxPosition;
        if (currentPerpLemmaPosition.lt(ZERO)) {
            //if we are already short
            maxUSDLInTokenAccordingToMaxPosition = maxPosition.sub(currentPerpLemmaPosition.abs());
        }
        else {
            //if we are long 
            maxUSDLInTokenAccordingToMaxPosition = maxPosition.add(currentPerpLemmaPosition);
        }
        return maxUSDLInTokenAccordingToMaxPosition;
    } else {
        let maxUSDLInTokenAccordingToMaxPosition;
        if (currentPerpLemmaPosition.lt(ZERO)) {
            //if we are short
            maxUSDLInTokenAccordingToMaxPosition = maxPosition.add(currentPerpLemmaPosition.abs());
        }
        else {
            //if we are already long 
            maxUSDLInTokenAccordingToMaxPosition = maxPosition.sub(currentPerpLemmaPosition);
        }
        //check for the balance as token needs to be given back
        let maxTokenBalanceOfPerpLemma;
        if (isTailAsset) {
            maxTokenBalanceOfPerpLemma = await token.balanceOf(perpLemma.address);
        } else {
            maxTokenBalanceOfPerpLemma = await vault.getBalanceByToken(perpLemma.address, tokenAddress);
        }
        //take minimum of both
        maxUSDLInToken = maxTokenBalanceOfPerpLemma.lt(maxUSDLInTokenAccordingToMaxPosition) ? maxTokenBalanceOfPerpLemma : maxUSDLInTokenAccordingToMaxPosition;
        return maxUSDLInToken;
    }
};

//the max amounts are restricted on both sides so, this amount may not be exact (try +-5%)
//returns method return max amount of tokens lemma and take in
const getMaxTokenIn = async (provider, tokenAddress) => {
    return await getMaxToken(provider, tokenAddress, true);
};
//returns the max amount of tokens lemma can swap out
const getMaxTokenOut = async (provider, tokenAddress) => {
    return await getMaxToken(provider, tokenAddress, false);
};

module.exports = { getAmountsOut, getMaxTokenIn, getMaxTokenOut };
